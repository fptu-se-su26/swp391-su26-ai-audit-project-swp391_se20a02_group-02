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
            return "VI".equals(lang) ? "Vui lòng đăng nhập để tra cứu thông tin cá nhân và đơn đặt xe của bạn." : "Please log in to query your personal account and booking details.";
        }

        UserRole role = user.getRole();

        if (role == UserRole.ADMIN && adminCtx != null) {
            if (msgLower.contains("kyc") || msgLower.contains("pending kyc")) {
                return String.format("📋 Platform Pending KYC Applications: %d pending users. Pending users: %s", adminCtx.getPendingKycCount(), adminCtx.getPendingKycUsers());
            }
            if (msgLower.contains("approval") || msgLower.contains("vehicle") || msgLower.contains("pending")) {
                return String.format("🚗 Pending Vehicle Approvals: %d vehicles waiting for review.", adminCtx.getPendingVehicleApprovalsCount());
            }
            return String.format("📊 LuxeWay Admin Real-time Metrics:\n- Total Users: %d\n- Total Vehicles: %d\n- Total Bookings: %d\n- Pending KYC: %d\n- Pending Vehicle Approvals: %d\n- Unresolved Disputes: %d",
                    adminCtx.getTotalUsers(), adminCtx.getTotalVehicles(), adminCtx.getTotalBookings(), adminCtx.getPendingKycCount(), adminCtx.getPendingVehicleApprovalsCount(), adminCtx.getUnresolvedDisputesCount());
        }

        if (role == UserRole.OWNER && ownerCtx != null) {
            if (msgLower.contains("revenue") || msgLower.contains("earning") || msgLower.contains("doanh thu")) {
                return String.format("💰 Total Revenue Earned: %,.0f VND from %d total bookings.", ownerCtx.getTotalRevenue(), ownerCtx.getTotalBookings());
            }
            if (msgLower.contains("vehicle") || msgLower.contains("fleet") || msgLower.contains("xe")) {
                return String.format("🚘 Fleet Overview:\n- Total Vehicles: %d\n- Available for Rent: %d\n- Pending Approval: %d\n- Average Rating: %.1f/5 (%d reviews)",
                        ownerCtx.getTotalVehicles(), ownerCtx.getAvailableVehicles(), ownerCtx.getPendingApprovalVehicles(), ownerCtx.getRating(), ownerCtx.getTotalReviews());
            }
            if (msgLower.contains("booking") || msgLower.contains("request") || msgLower.contains("đơn")) {
                return String.format("📋 Booking Overview: %d total bookings received, %d pending customer approval requests.", ownerCtx.getTotalBookings(), ownerCtx.getPendingRequestsCount());
            }
            return String.format("👋 Welcome Host %s!\n- Fleet Size: %d vehicles (%d active)\n- Total Revenue: %,.0f VND\n- Rating: %.1f/5 ⭐",
                    ownerCtx.getDisplayName(), ownerCtx.getTotalVehicles(), ownerCtx.getAvailableVehicles(), ownerCtx.getTotalRevenue(), ownerCtx.getRating());
        }

        // Customer Role
        if (customerCtx != null) {
            if (msgLower.contains("booking") || msgLower.contains("latest") || msgLower.contains("chuyến")) {
                if (customerCtx.getRecentBookings() != null && !customerCtx.getRecentBookings().isEmpty()) {
                    BookingSummaryDTO b = customerCtx.getRecentBookings().get(0);
                    return String.format("🚗 Your Latest Booking:\n- Booking Code: %s\n- Vehicle: %s\n- Dates: %s to %s\n- Status: %s\n- Total: %,.0f VND",
                            b.getBookingCode(), b.getVehicleName(), b.getStartDate(), b.getEndDate(), b.getStatus(), b.getTotal());
                } else {
                    return "I couldn't find any matching booking data in the LuxeWay system.";
                }
            }
            if (msgLower.contains("kyc") || msgLower.contains("identity") || msgLower.contains("license")) {
                return String.format("🪪 KYC & License Status:\n- KYC Status: %s (Verified: %b)\n- License Status: %s",
                        customerCtx.getKycStatus(), customerCtx.isKycVerified(), customerCtx.getLicenseStatus());
            }
            if (msgLower.contains("spent") || msgLower.contains("payment") || msgLower.contains("tiền")) {
                return String.format("💳 Account Spending Overview:\n- Total Spent: %,.0f VND\n- Wallet Balance: %,.0f VND\n- Active Bookings: %d",
                        customerCtx.getTotalSpent(), customerCtx.getWalletBalance(), customerCtx.getActiveBookingsCount());
            }
            return String.format("👋 Hello %s!\n- Active Rentals: %d\n- KYC Status: %s\n- Total Spent: %,.0f VND",
                    customerCtx.getDisplayName(), customerCtx.getActiveBookingsCount(), customerCtx.getKycStatus(), customerCtx.getTotalSpent());
        }

        return "I couldn't find any matching data in the LuxeWay system.";
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
