package com.luxeway.service;

import com.luxeway.dto.ApiResponse;
import com.luxeway.dto.ai.AIChatContextDTOs.*;
import com.luxeway.entity.*;
import com.luxeway.enums.*;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class AIChatService {

    private final AIChatSessionRepository sessionRepository;
    private final AIChatMessageRepository messageRepository;
    private final AIConversationContextRepository contextRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final OwnerApplicationRepository ownerApplicationRepository;
    private final PaymentRepository paymentRepository;
    private final SupportTicketV2Repository supportTicketV2Repository;

    private final AIContextBuilderService aiContextBuilderService;
    private final PromptBuilderService promptBuilderService;
    private final ContextResolverService contextResolverService;
    private final BookingAssistantService bookingAssistantService;
    private final SupportAssistantService supportAssistantService;
    private final ConversationService conversationService;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final VehicleService vehicleService;
    private final AdminService adminService;

    @Value("${gemini.api-key:mock_key}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String modelName;

    private final RestTemplate restTemplate = createRestTemplateWithTimeouts();

    private static RestTemplate createRestTemplateWithTimeouts() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        return new RestTemplate(factory);
    }

    @Transactional
    public Map<String, Object> generateConciergeResponse(String sessionId, String userMessage, String userId, String currentPage, String activeVehicleId, String activeBookingId) {
        log.info("Generating LuxeWay AI Concierge response for session: {}", sessionId);

        // 1. Get or create session
        AIChatSession session = sessionRepository.findById(sessionId)
                .orElseGet(() -> {
                    AIChatSession newSession = new AIChatSession();
                    newSession.setId(sessionId);
                    if (userId != null) {
                        userRepository.findById(userId).ifPresent(newSession::setUser);
                    }
                    return sessionRepository.save(newSession);
                });

        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);

        // 2. Save user message
        AIChatMessage userMsg = AIChatMessage.builder()
                .session(session)
                .role("USER")
                .content(userMessage)
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(userMsg);

        // 3. Resolve context updates
        contextResolverService.resolveAndSaveContext(sessionId, currentPage, activeVehicleId, activeBookingId);

        // 4. Authenticated User & Role Identification (NEVER trust frontend role payload)
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        } else if (session.getUser() != null) {
            user = session.getUser();
        }

        // Detect user language
        String lang = detectLanguage(userMessage);

        // 5. Build Role-Aware Context DTO strictly scoped from Real Database
        CustomerContextDTO customerCtx = null;
        OwnerContextDTO ownerCtx = null;
        AdminContextDTO adminCtx = null;

        if (user != null) {
            if (user.getRole() == UserRole.ADMIN) {
                adminCtx = aiContextBuilderService.buildAdminContext(user);
            } else if (user.getRole() == UserRole.OWNER) {
                ownerCtx = aiContextBuilderService.buildOwnerContext(user);
            } else {
                customerCtx = aiContextBuilderService.buildCustomerContext(user);
            }
        }

        // 6. Context Booking & Vehicle references
        Booking contextBooking = null;
        if (session.getBookingId() != null) {
            contextBooking = bookingRepository.findById(session.getBookingId()).orElse(null);
        }
        Vehicle contextVehicle = null;
        if (session.getVehicleId() != null) {
            contextVehicle = vehicleRepository.findById(session.getVehicleId()).orElse(null);
        }

        // 7. Check for Direct Action Triggers or Confirmation Guards
        Map<String, Object> actionCard = checkForDirectActions(userMessage, contextBooking, user, customerCtx, ownerCtx, adminCtx);

        // 8. Build System Prompt per Role
        String systemPrompt = promptBuilderService.buildRoleSystemPrompt(user, customerCtx, ownerCtx, adminCtx, currentPage, lang);
        List<AIChatMessage> chatHistory = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        String aiResponse = "";
        String rawResponse = "";

        if (actionCard != null && (boolean) actionCard.getOrDefault("success", false)) {
            aiResponse = (String) actionCard.get("message");
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> wrapper = new HashMap<>();
                wrapper.put("actionCard", actionCard);
                rawResponse = mapper.writeValueAsString(wrapper);
            } catch (Exception e) {
                rawResponse = "{\"actionCard\": " + actionCard.toString() + "}";
            }
        } else if (!hasConfiguredGeminiKey()) {
            aiResponse = generateRealDBResponse(userMessage, user, customerCtx, ownerCtx, adminCtx, contextBooking, contextVehicle, currentPage, lang);
            rawResponse = "{\"real_db_engine\": true, \"reason\": \"Using Real Database context engine\"}";
        } else {
            try {
                String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelName, apiKey);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> requestBody = constructGeminiPayload(systemPrompt, chatHistory, userMessage);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    rawResponse = response.getBody().toString();
                    aiResponse = extractTextFromGeminiResponse(response.getBody());
                } else {
                    aiResponse = generateRealDBResponse(userMessage, user, customerCtx, ownerCtx, adminCtx, contextBooking, contextVehicle, currentPage, lang);
                    rawResponse = "Error status: " + response.getStatusCode();
                }
            } catch (Exception e) {
                log.error("Exception calling Gemini API: {}", e.getMessage());
                aiResponse = generateRealDBResponse(userMessage, user, customerCtx, ownerCtx, adminCtx, contextBooking, contextVehicle, currentPage, lang);
                rawResponse = "Exception: " + e.getMessage();
            }
        }

        // 9. Save Assistant Response
        AIChatMessage assistantMsg = AIChatMessage.builder()
                .session(session)
                .role("ASSISTANT")
                .content(aiResponse)
                .rawResponse(rawResponse)
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(assistantMsg);

        // 10. Return Response Payload
        Map<String, Object> result = new HashMap<>();
        result.put("sessionId", sessionId);
        result.put("messageId", assistantMsg.getId());
        result.put("role", "ASSISTANT");
        result.put("content", aiResponse);
        if (actionCard != null) {
            result.put("actionCard", actionCard);
        }
        result.put("createdAt", assistantMsg.getCreatedAt().toString());

        return result;
    }

    private boolean hasConfiguredGeminiKey() {
        if (apiKey == null) return false;
        String key = apiKey.trim();
        if (key.isEmpty()) return false;
        String lowerKey = key.toLowerCase(Locale.ROOT);
        return !lowerKey.equals("mock_key")
                && !lowerKey.contains("your-gemini-api-key")
                && !lowerKey.contains("placeholder")
                && key.length() > 20;
    }

    private String detectLanguage(String text) {
        if (text == null) return "EN";
        String msgLower = text.toLowerCase(Locale.ROOT);
        if (msgLower.contains("tôi") || msgLower.contains("xe") || msgLower.contains("thuê") || msgLower.contains("đặt") || msgLower.contains("giá") || msgLower.contains("xin chào")) {
            return "VI";
        }
        if (text.matches(".*[\\u4e00-\\u9fa5].*")) return "ZH";
        if (text.matches(".*[\\uac00-\\ud7af].*")) return "KO";
        if (text.matches(".*[\\u3040-\\u30ff].*")) return "JA";
        return "EN";
    }

    private Map<String, Object> checkForDirectActions(String message, Booking contextBooking, User user, CustomerContextDTO customerCtx, OwnerContextDTO ownerCtx, AdminContextDTO adminCtx) {
        String msgLower = message.toLowerCase(Locale.ROOT);
        String lang = detectLanguage(message);

        // Check for Destructive / Mutating Actions that require explicit confirmation
        if (msgLower.contains("delete user") || msgLower.contains("approve all") || msgLower.contains("refund everyone") || msgLower.contains("suspend all") || msgLower.contains("xóa người dùng") || msgLower.contains("duyệt tất cả")) {
            Map<String, Object> card = new HashMap<>();
            card.put("action", "CONFIRMATION_REQUIRED");
            card.put("requiresConfirmation", true);
            card.put("success", true);
            card.put("message", "This action requires confirmation. Are you sure you want to continue?");
            card.put("confirmButtonText", "Confirm Action");
            card.put("cancelButtonText", "Cancel");
            return card;
        }

        // Cancel Booking Action
        if ((msgLower.contains("cancel") || msgLower.contains("refund") || msgLower.contains("hoàn tiền")) && (msgLower.contains("confirm") || msgLower.contains("yes") || msgLower.contains("please") || msgLower.contains("xác nhận"))) {
            if (contextBooking != null) {
                return bookingAssistantService.executeCancelBooking(contextBooking.getId());
            }
        }

        return null;
    }

    private String generateRealDBResponse(String userMessage, User user, CustomerContextDTO customerCtx, OwnerContextDTO ownerCtx, AdminContextDTO adminCtx, Booking contextBooking, Vehicle contextVehicle, String currentPage, String lang) {
        String msgLower = userMessage.toLowerCase(Locale.ROOT);

        if (user == null) {
            return "VI".equals(lang) ? "Vui lòng đăng nhập để tra cứu thông tin cá nhân và đơn đặt xe của bạn trên LuxeWay." : "Please log in to query your account details and bookings on LuxeWay.";
        }

        UserRole role = user.getRole();

        // 👮 ADMIN ROLE
        if (role == UserRole.ADMIN && adminCtx != null) {
            if (msgLower.contains("kyc") || msgLower.contains("bản đồ kyc") || msgLower.contains("xác thực")) {
                return String.format("📋 Hệ thống hiện có %d hồ sơ KYC đang chờ duyệt.\nDanh sách: %s",
                        adminCtx.getPendingKycCount(), adminCtx.getPendingKycUsers() != null ? adminCtx.getPendingKycUsers() : "Không có");
            }
            if (msgLower.contains("xe chờ") || msgLower.contains("duyệt xe") || msgLower.contains("vehicle") || msgLower.contains("pending vehicle")) {
                return String.format("🚗 Hệ thống hiện có %d xe đang chờ Admin phê duyệt.\nChi tiết xe chờ duyệt: %s",
                        adminCtx.getPendingVehicleApprovalsCount(), adminCtx.getPendingVehicleApprovals() != null ? adminCtx.getPendingVehicleApprovals() : "Không có");
            }
            if (msgLower.contains("owner") || msgLower.contains("chủ xe") || msgLower.contains("đơn đăng ký chủ xe")) {
                return String.format("📝 Hệ thống hiện có %d đơn đăng ký làm Chủ xe (Owner Application) đang chờ duyệt.\nDanh sách: %s",
                        adminCtx.getPendingOwnerAppsCount(), adminCtx.getPendingOwnerApplications() != null ? adminCtx.getPendingOwnerApplications() : "Không có");
            }
            if (msgLower.contains("hôm nay") || msgLower.contains("today")) {
                return String.format("📅 Hôm nay có %d booking mới được tạo trên hệ thống.", adminCtx.getTodayBookingsCount());
            }
            return String.format("📊 Thống kê tổng quan hệ thống LuxeWay:\n- Tổng số người dùng: %d\n- Tổng số phương tiện: %d\n- Tổng số booking: %d (Hôm nay: %d)\n- KYC đang chờ: %d\n- Đơn đăng ký Owner đang chờ: %d\n- Xe đang chờ duyệt: %d\n- Tranh chấp chưa giải quyết: %d",
                    adminCtx.getTotalUsers(), adminCtx.getTotalVehicles(), adminCtx.getTotalBookings(), adminCtx.getTodayBookingsCount(),
                    adminCtx.getPendingKycCount(), adminCtx.getPendingOwnerAppsCount(), adminCtx.getPendingVehicleApprovalsCount(), adminCtx.getUnresolvedDisputesCount());
        }

        // 🚗 OWNER ROLE
        if (role == UserRole.OWNER && ownerCtx != null) {
            if (msgLower.contains("duyệt") || msgLower.contains("từ chối") || msgLower.contains("hiển thị") || msgLower.contains("lý do")) {
                if (ownerCtx.getVehicles() != null && !ownerCtx.getVehicles().isEmpty()) {
                    StringBuilder sb = new StringBuilder("🚗 Trạng thái duyệt danh sách xe của bạn:\n");
                    for (VehicleSummaryDTO v : ownerCtx.getVehicles()) {
                        sb.append(String.format("- %s (%s): Trạng thái duyệt = %s, Trạng thái xe = %s",
                                v.getName(), v.getLicensePlate() != null ? v.getLicensePlate() : "Chưa có biển số", v.getApprovalStatus(), v.getStatus()));
                        if ("REJECTED".equalsIgnoreCase(v.getApprovalStatus()) && v.getRejectionReason() != null) {
                            sb.append(String.format(" (Lý do từ chối: %s)", v.getRejectionReason()));
                        }
                        sb.append("\n");
                    }
                    return sb.toString();
                } else {
                    return "Bạn chưa có xe nào đăng ký trên hệ thống LuxeWay.";
                }
            }
            if (msgLower.contains("doanh thu") || msgLower.contains("revenue") || msgLower.contains("thu nhập")) {
                return String.format("💰 Tổng doanh thu từ các chuyến xe hoàn tất của bạn là: %,.0f VND (từ tổng số %d đơn đặt xe).",
                        ownerCtx.getTotalRevenue(), ownerCtx.getTotalBookings());
            }
            if (msgLower.contains("booking") || msgLower.contains("đặt xe") || msgLower.contains("chuyến")) {
                if (ownerCtx.getPendingRequests() != null && !ownerCtx.getPendingRequests().isEmpty()) {
                    return String.format("📋 Xe của bạn đang nhận %d yêu cầu đặt xe đang chờ xử lý:\nDanh sách: %s",
                            ownerCtx.getPendingRequestsCount(), ownerCtx.getPendingRequests());
                } else {
                    return String.format("📋 Tổng số booking đã nhận: %d (Hiện tại không có yêu cầu nào đang chờ duyệt).", ownerCtx.getTotalBookings());
                }
            }
            return String.format("👋 Xin chào Chủ xe %s!\n- Tổng số xe: %d (%d xe đang hoạt động, %d xe chờ duyệt)\n- Tổng doanh thu: %,.0f VND\n- Đánh giá trung bình: %.1f/5 ⭐ (%d lượt đánh giá)",
                    ownerCtx.getDisplayName(), ownerCtx.getTotalVehicles(), ownerCtx.getAvailableVehicles(), ownerCtx.getPendingApprovalVehicles(), ownerCtx.getTotalRevenue(), ownerCtx.getRating(), ownerCtx.getTotalReviews());
        }

        // 🧑 CUSTOMER ROLE
        if (customerCtx != null) {
            if (msgLower.contains("thanh toán") || msgLower.contains("payment") || msgLower.contains("tiền")) {
                if (customerCtx.getRecentBookings() != null && !customerCtx.getRecentBookings().isEmpty()) {
                    BookingSummaryDTO b = customerCtx.getRecentBookings().get(0);
                    return String.format("💳 Thông tin thanh toán chuyến xe gần nhất của bạn:\n- Mã chuyến: %s\n- Xe: %s\n- Trạng thái chuyến: %s\n- Tổng tiền: %,.0f VND\n- Số dư ví hiện tại: %,.0f VND",
                            b.getBookingCode(), b.getVehicleName(), b.getStatus(), b.getTotal(), customerCtx.getWalletBalance());
                } else {
                    return String.format("💳 Bạn chưa có giao dịch đặt xe nào. Số dư ví hiện tại: %,.0f VND.", customerCtx.getWalletBalance());
                }
            }
            if (msgLower.contains("booking") || msgLower.contains("chuyến") || msgLower.contains("đơn đặt")) {
                if (customerCtx.getRecentBookings() != null && !customerCtx.getRecentBookings().isEmpty()) {
                    BookingSummaryDTO b = customerCtx.getRecentBookings().get(0);
                    return String.format("🚗 Thông tin đơn đặt xe gần nhất:\n- Mã booking: %s\n- Tên xe: %s\n- Ngày: %s đến %s\n- Trạng thái: %s\n- Giá tiền: %,.0f VND",
                            b.getBookingCode(), b.getVehicleName(), b.getStartDate(), b.getEndDate(), b.getStatus(), b.getTotal());
                } else {
                    return "Bạn chưa có lịch sử đặt xe nào trên hệ thống LuxeWay.";
                }
            }
            if (msgLower.contains("tìm xe") || msgLower.contains("giá xe") || msgLower.contains("thuê xe") || msgLower.contains("danh sách xe")) {
                if (customerCtx.getAvailableVehiclesForRent() != null && !customerCtx.getAvailableVehiclesForRent().isEmpty()) {
                    StringBuilder sb = new StringBuilder("🚗 Danh sách các xe đang sẵn sàng cho thuê trên LuxeWay:\n");
                    for (VehicleSummaryDTO v : customerCtx.getAvailableVehiclesForRent()) {
                        sb.append(String.format("- %s (%s %s) tại %s: %,.0f VND/ngày\n",
                                v.getName(), v.getBrand(), v.getModel(), v.getCity() != null ? v.getCity() : "TP.HCM", v.getPricePerDay()));
                    }
                    return sb.toString();
                } else {
                    return "Hiện tại hệ thống chưa có xe nào khả dụng cho thuê.";
                }
            }
            if (msgLower.contains("kyc") || msgLower.contains("giao diện") || msgLower.contains("bằng lái") || msgLower.contains("tài khoản")) {
                return String.format("🪪 Trạng thái tài khoản & KYC của bạn:\n- Trạng thái KYC: %s (Đã xác minh: %b)\n- Bằng lái xe: %s\n- Tổng số chuyến đã đặt: %d",
                        customerCtx.getKycStatus(), customerCtx.isKycVerified(), customerCtx.getLicenseStatus(), customerCtx.getTotalBookings());
            }
            return String.format("👋 Xin chào Khách hàng %s!\n- Số chuyến đang thuê: %d\n- Trạng thái KYC: %s\n- Tổng chi tiêu: %,.0f VND",
                    customerCtx.getDisplayName(), customerCtx.getActiveBookingsCount(), customerCtx.getKycStatus(), customerCtx.getTotalSpent());
        }

        return "Tôi không tìm thấy thông tin phù hợp trong hệ thống LuxeWay.";
    }

    private Map<String, Object> constructGeminiPayload(String systemPrompt, List<AIChatMessage> chatHistory, String userMessage) {
        Map<String, Object> payload = new HashMap<>();

        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", List.of(Map.of("text", systemPrompt)));
        payload.put("system_instruction", systemInstruction);

        List<Map<String, Object>> contents = new ArrayList<>();

        int startIndex = Math.max(0, chatHistory.size() - 6);
        for (int i = startIndex; i < chatHistory.size(); i++) {
            AIChatMessage msg = chatHistory.get(i);
            String role = "USER".equalsIgnoreCase(msg.getRole()) ? "user" : "model";
            contents.add(Map.of(
                    "role", role,
                    "parts", List.of(Map.of("text", msg.getContent()))
            ));
        }

        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userMessage))
        ));

        payload.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.3);
        generationConfig.put("maxOutputTokens", 800);
        payload.put("generationConfig", generationConfig);

        return payload;
    }

    private String extractTextFromGeminiResponse(Map responseBody) {
        try {
            List candidates = (List) responseBody.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map firstCandidate = (Map) candidates.get(0);
                Map content = (Map) firstCandidate.get("content");
                if (content != null) {
                    List parts = (List) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        Map firstPart = (Map) parts.get(0);
                        return (String) firstPart.get("text");
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini response payload: {}", e.getMessage());
        }
        return "I couldn't find any matching data in the LuxeWay system.";
    }

    @Transactional
    public ApiResponse<Map<String, Object>> executeConfirmedAction(User user, String actionType, String targetId) {
        if (user == null) {
            return ApiResponse.error("Authentication required");
        }

        log.info("Executing confirmed chatbot action: user={}, role={}, action={}, targetId={}", user.getId(), user.getRole(), actionType, targetId);

        auditService.log(user.getId(), actionType, "CHATBOT_ACTION", targetId, null, "CONFIRMED_VIA_CHATBOT", null, null);

        Map<String, Object> result = new HashMap<>();
        result.put("actionType", actionType);
        result.put("targetId", targetId);

        if ("APPROVE_VEHICLE".equalsIgnoreCase(actionType) && user.getRole() == UserRole.ADMIN) {
            adminService.approveVehicle(targetId, user.getId());
            result.put("message", "Vehicle ID " + targetId + " has been approved successfully.");
            return ApiResponse.success("Action executed successfully", result);
        }

        result.put("message", "Confirmed action " + actionType + " registered and logged successfully.");
        return ApiResponse.success("Action executed successfully", result);
    }
}
