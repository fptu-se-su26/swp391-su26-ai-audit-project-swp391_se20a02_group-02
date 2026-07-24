package com.luxeway.service;

import com.luxeway.entity.*;
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

    private final ContextResolverService contextResolverService;
    private final PromptBuilderService promptBuilderService;
    private final BookingAssistantService bookingAssistantService;
    private final SupportAssistantService supportAssistantService;
    private final ConversationService conversationService;

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

    private final RestTemplate restTemplateFieldBackup = null; // Unused but preserves structure if needed

    @Transactional
    public Map<String, Object> generateConciergeResponse(String sessionId, String userMessage, String userId, String currentPage, String activeVehicleId, String activeBookingId) {
        log.info("Generating luxury concierge response for session: {}", sessionId);

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

        // 4. Load User & Booking History
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        } else if (session.getUser() != null) {
            user = session.getUser();
        }

        List<Booking> recentBookings = List.of();
        if (user != null) {
            recentBookings = bookingRepository.findByRenterIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 3)).getContent();
        }

        // Get Context objects
        Booking contextBooking = null;
        if (session.getBookingId() != null) {
            contextBooking = bookingRepository.findById(session.getBookingId()).orElse(null);
        }
        Vehicle contextVehicle = null;
        if (session.getVehicleId() != null) {
            contextVehicle = vehicleRepository.findById(session.getVehicleId()).orElse(null);
        }

        // 5. Look for Direct Action Triggers
        Map<String, Object> actionCard = checkForDirectActions(userMessage, contextBooking, user);

        // 6. Build Prompt & History
        String systemPrompt = promptBuilderService.buildSystemPrompt(user, recentBookings, contextBooking, contextVehicle, currentPage);
        List<AIChatMessage> chatHistory = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        String aiResponse = "";
        String rawResponse = "";

        if (actionCard != null && (boolean) actionCard.getOrDefault("success", false)) {
            // An action was successfully executed, inject action message and full actionCard payload
            aiResponse = (String) actionCard.get("message");
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> wrapper = new HashMap<>();
                wrapper.put("actionCard", actionCard);
                rawResponse = mapper.writeValueAsString(wrapper);
            } catch (Exception e) {
                log.error("Error serializing actionCard: {}", e.getMessage());
                rawResponse = "{\"actionCard\": " + actionCard.toString() + "}";
            }
        } else if (!hasConfiguredGeminiKey()) {
            // Fallback to intelligent mock responses when API key is missing or placeholder
            aiResponse = generateMockResponse(userMessage, user, recentBookings, contextBooking, contextVehicle, currentPage);
            rawResponse = "{\"mock\": true, \"reason\": \"API key is not configured or is still a placeholder\"}";
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
                    aiResponse = generateMockResponse(userMessage, user, recentBookings, contextBooking, contextVehicle, currentPage);
                    rawResponse = "Error status: " + response.getStatusCode();
                }
            } catch (Exception e) {
                log.error("Exception calling Gemini API: {}", e.getMessage(), e);
                // Fallback to intelligent response so user is never blocked by API errors
                aiResponse = generateMockResponse(userMessage, user, recentBookings, contextBooking, contextVehicle, currentPage);
                rawResponse = "Exception: " + e.getMessage();
            }
        }

        // 7. Save Assistant response
        AIChatMessage assistantMsg = AIChatMessage.builder()
                .session(session)
                .role("ASSISTANT")
                .content(aiResponse)
                .rawResponse(rawResponse)
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(assistantMsg);

        // 8. Return response payload
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
                && !lowerKey.contains("change_me");
    }
    private String detectLanguage(String text) {
        if (text == null) return "EN";
        String lower = text.toLowerCase(Locale.ROOT);
        if (lower.matches(".*[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ].*")
                || lower.contains("tôi") || lower.contains("xe") || lower.contains("thuê") || lower.contains("đà nẵng") || lower.contains("hồ chí minh") || lower.contains("duyệt") || lower.contains("hoàn tiền") || lower.contains("hỏng") || lower.contains("chuyến")) {
            return "VN";
        }
        if (text.matches(".*[\\u4e00-\\u9fa5].*")) return "ZH";
        if (text.matches(".*[\\uac00-\\ud7af].*")) return "KO";
        if (text.matches(".*[\\u3040-\\u30ff].*")) return "JA";
        return "EN";
    }

    private boolean isOffTopicQuery(String msgLower) {
        boolean hasDomainKeyword = msgLower.contains("thuê") || msgLower.contains("xe") || msgLower.contains("booking")
                || msgLower.contains("chuyến") || msgLower.contains("hoàn tiền") || msgLower.contains("refund")
                || msgLower.contains("hỏng") || msgLower.contains("sự cố") || msgLower.contains("host")
                || msgLower.contains("owner") || msgLower.contains("admin") || msgLower.contains("duyệt")
                || msgLower.contains("car") || msgLower.contains("suv") || msgLower.contains("sedan")
                || msgLower.contains("mpv") || msgLower.contains("đi") || msgLower.contains("tư vấn")
                || msgLower.contains("đà nẵng") || msgLower.contains("hồ chí minh") || msgLower.contains("hà nội")
                || msgLower.contains("nha trang") || msgLower.contains("đà lạt") || msgLower.contains("huế")
                || msgLower.contains("price") || msgLower.contains("giá") || msgLower.contains("triệu")
                || msgLower.contains("k") || msgLower.contains("tr") || msgLower.contains("hủy")
                || msgLower.contains("dispute") || msgLower.contains("cứu hộ") || msgLower.contains("emergency")
                || msgLower.contains("luxeway") || msgLower.contains("hợp đồng") || msgLower.contains("contract");

        if (hasDomainKeyword) return false;

        return msgLower.contains("thời tiết") || msgLower.contains("weather")
                || msgLower.contains("tổng thống") || msgLower.contains("president")
                || msgLower.contains("bài thơ") || msgLower.contains("poem")
                || msgLower.contains("nấu ăn") || msgLower.contains("recipe")
                || msgLower.contains("bóng đá") || msgLower.contains("football")
                || msgLower.contains("ai là") || msgLower.contains("who is");
    }

    private Map<String, Object> checkForDirectActions(String message, Booking contextBooking, User user) {
        String msgLower = message.toLowerCase(Locale.ROOT);
        String lang = detectLanguage(message);

        // 0. Off-topic Scope Guardrail
        if (isOffTopicQuery(msgLower)) {
            Map<String, Object> card = new HashMap<>();
            card.put("action", "OFF_TOPIC");
            card.put("success", true);
            if ("VN".equals(lang)) {
                card.put("message", "Tôi là Trợ lý AI chuyên biệt của LuxeWay. Tôi chỉ hỗ trợ các dịch vụ tìm xe, tư vấn đặt xe, tra cứu booking, cứu hộ đường bộ, yêu cầu hoàn tiền, quản lý xe của Chủ xe và công việc Quản trị viên trên hệ thống LuxeWay. Bạn cần hỗ trợ gì về dịch vụ LuxeWay hôm nay?");
            } else if ("ZH".equals(lang)) {
                card.put("message", "我是 LuxeWay 的 AI 专属助手。我仅负责 LuxeWay 平台的租车搜索、预订咨询、订单查询、道路救援、退款申请、车主车辆管理及管理员业务。请问今天有什么关于 LuxeWay 的服务可以帮您？");
            } else if ("KO".equals(lang)) {
                card.put("message", "저는 LuxeWay의 전용 AI 챗봇입니다. LuxeWay 플랫폼의 차량 검색, 예약 상담, 예약 조회, 긴급 출동 지원, 환불 요청, 호스트 차량 관리 및 관리자 지원 서비스만 제공합니다. 오늘 LuxeWay 이용과 관련하여 어떤 도움이 필요하신가요?");
            } else if ("JA".equals(lang)) {
                card.put("message", "私は LuxeWay 専用の AI コンシェルジュです。LuxeWay プラットフォームでの車両検索、予約相談、予約照会、ロードサービス、返金申請、オーナー車両管理、および管理者業務のサポートのみを行っております。本日 LuxeWay でどのようなお手伝いができますか？");
            } else {
                card.put("message", "I am LuxeWay's dedicated AI Concierge. I specialize exclusively in LuxeWay platform services including vehicle search, trip recommendations, booking lookups, roadside emergency assistance, refund requests, host vehicle management, and admin dashboard operations. How may I assist you with your LuxeWay journey today?");
            }
            return card;
        }

        // 1. Cancel Booking Action
        if ((msgLower.contains("cancel") || msgLower.contains("refund") || msgLower.contains("hoàn tiền")) && (msgLower.contains("confirm") || msgLower.contains("yes") || msgLower.contains("please") || msgLower.contains("xác nhận"))) {
            if (contextBooking != null) {
                return bookingAssistantService.executeCancelBooking(contextBooking.getId());
            }
        }

        // 2. Extend Booking Action
        if (msgLower.contains("extend") || msgLower.contains("modify") || msgLower.contains("gia hạn")) {
            if (contextBooking != null) {
                Pattern pattern = Pattern.compile("(\\d+) day");
                Matcher matcher = pattern.matcher(msgLower);
                int days = 1;
                if (matcher.find()) {
                    days = Integer.parseInt(matcher.group(1));
                }
                return bookingAssistantService.executeModifyDates(contextBooking.getId(), days);
            }
        }

        // 3. Invoice Action
        if (msgLower.contains("invoice") || msgLower.contains("bill") || msgLower.contains("receipt") || msgLower.contains("hóa đơn")) {
            if (contextBooking != null) {
                return bookingAssistantService.retrieveInvoice(contextBooking.getId());
            }
        }

        // 4. Emergency Roadside Assistance Trigger (Item 5)
        if (msgLower.contains("accident") || msgLower.contains("breakdown") || msgLower.contains("flat tire") || msgLower.contains("hỏng") || msgLower.contains("sự cố") || msgLower.contains("cứu hộ") || msgLower.contains("thủng lốp")) {
            if (user != null) {
                Booking activeBooking = contextBooking;
                if (activeBooking == null) {
                    List<Booking> userBookings = bookingRepository.findByRenterIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 1)).getContent();
                    if (!userBookings.isEmpty()) {
                        activeBooking = userBookings.get(0);
                    }
                }
                String bookingId = activeBooking != null ? activeBooking.getId() : null;
                String vehicleId = (activeBooking != null && activeBooking.getVehicle() != null) ? activeBooking.getVehicle().getId() : null;
                return supportAssistantService.createEmergencyDispatch(
                        user,
                        "BREAKDOWN",
                        "Emergency Roadside Assistance requested via AI: " + message,
                        user.getPhone() != null ? user.getPhone() : "0900000000",
                        bookingId,
                        vehicleId,
                        null,
                        null
                );
            } else {
                Map<String, Object> card = new HashMap<>();
                card.put("action", "EMERGENCY_DISPATCH");
                card.put("success", false);
                card.put("message", "VN".equals(lang) ? "Vui lòng đăng nhập để gửi yêu cầu cứu hộ khẩn cấp cho chuyến đi của bạn." : "Please log in to dispatch priority emergency roadside assistance for your trip.");
                return card;
            }
        }

        // 5. Refund Request Action (Item 6)
        if (msgLower.contains("hoàn tiền") || msgLower.contains("refund request") || msgLower.contains("trả lại tiền") || msgLower.contains("yêu cầu hoàn tiền")) {
            if (user != null) {
                Booking targetBooking = contextBooking;
                if (targetBooking == null) {
                    List<Booking> userBookings = bookingRepository.findByRenterIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 1)).getContent();
                    if (!userBookings.isEmpty()) {
                        targetBooking = userBookings.get(0);
                    }
                }

                String bookingId = targetBooking != null ? targetBooking.getId() : null;
                String vehicleId = (targetBooking != null && targetBooking.getVehicle() != null) ? targetBooking.getVehicle().getId() : null;
                String subject = "Refund Request " + (bookingId != null ? "#" + bookingId.substring(0, 8).toUpperCase() : "");

                Map<String, Object> ticketRes = supportAssistantService.createSupportTicket(
                        user,
                        subject,
                        message,
                        "REFUND",
                        "HIGH",
                        bookingId,
                        vehicleId
                );

                Map<String, Object> card = new HashMap<>();
                card.put("action", "REFUND_REQUEST");
                card.put("success", true);
                card.put("ticketId", ticketRes.get("ticketId"));
                if ("VN".equals(lang)) {
                    card.put("message", String.format("Yêu cầu hoàn tiền của bạn (%s) đã được ghi nhận và gửi đến Ban Quản trị LuxeWay để xem xét và xử lý.",
                            bookingId != null ? "Booking #" + bookingId.substring(0, 8).toUpperCase() : "Chuyến đi"));
                } else {
                    card.put("message", String.format("Your refund request for %s has been created and submitted to LuxeWay Admin for review.",
                            bookingId != null ? "Booking #" + bookingId.substring(0, 8).toUpperCase() : "your trip"));
                }
                return card;
            } else {
                Map<String, Object> card = new HashMap<>();
                card.put("action", "REFUND_REQUEST");
                card.put("success", false);
                card.put("message", "VN".equals(lang) ? "Vui lòng đăng nhập để gửi yêu cầu hoàn tiền cho booking của bạn." : "Please log in to submit a refund request for your booking.");
                return card;
            }
        }

        // 6. Customer Booking Query ("Booking của tôi đang thế nào?") (Item 3)
        if (msgLower.contains("booking của tôi") || msgLower.contains("my booking") || msgLower.contains("trạng thái chuyến") || msgLower.contains("chuyến đi của tôi") || msgLower.contains("đơn hàng của tôi")) {
            if (user != null) {
                List<Booking> userBookings = bookingRepository.findByRenterIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 5)).getContent();
                Map<String, Object> card = new HashMap<>();
                card.put("action", "CUSTOMER_BOOKINGS");
                card.put("success", true);
                if (userBookings.isEmpty()) {
                    card.put("message", "VN".equals(lang) ? "Hiện tại bạn chưa có booking nào đang hoạt động trên LuxeWay." : "You currently have no active bookings on LuxeWay. Explore our Marketplace to start a trip!");
                } else {
                    Booking b = userBookings.get(0);
                    if ("VN".equals(lang)) {
                        card.put("message", String.format("Booking #LX%s (%s) của bạn hiện đang ở trạng thái **%s**. Thời gian thuê từ ngày **%s** đến **%s**.",
                                b.getId().substring(0, 8).toUpperCase(),
                                b.getVehicle() != null ? b.getVehicle().getName() : "Xe LuxeWay",
                                b.getStatus(),
                                b.getStartDate() != null ? b.getStartDate().toString() : "N/A",
                                b.getEndDate() != null ? b.getEndDate().toString() : "N/A"));
                    } else {
                        card.put("message", String.format("Booking #LX%s for %s is currently in status **%s**. Trip duration: **%s** to **%s**.",
                                b.getId().substring(0, 8).toUpperCase(),
                                b.getVehicle() != null ? b.getVehicle().getName() : "Vehicle",
                                b.getStatus(),
                                b.getStartDate() != null ? b.getStartDate().toString() : "N/A",
                                b.getEndDate() != null ? b.getEndDate().toString() : "N/A"));
                    }
                }
                return card;
            } else {
                Map<String, Object> card = new HashMap<>();
                card.put("action", "CUSTOMER_BOOKINGS");
                card.put("success", false);
                card.put("message", "VN".equals(lang) ? "Vui lòng đăng nhập để tra cứu lịch sử và trạng thái booking của bạn." : "Please log in to inspect your current booking status.");
                return card;
            }
        }

        // 7. Owner Vehicle & Earnings Query ("Xe của tôi đang được duyệt chưa?", "Thu nhập của tôi?") (Item 7)
        if (msgLower.contains("xe của tôi") || msgLower.contains("my vehicle") || msgLower.contains("được duyệt chưa") || msgLower.contains("duyệt xe") || msgLower.contains("thu nhập của tôi") || msgLower.contains("my earnings") || msgLower.contains("doanh thu")) {
            if (user != null && (user.getRole() != null && (user.getRole().name().toUpperCase().contains("OWNER") || user.getRole().name().toUpperCase().contains("HOST")))) {
                List<Vehicle> ownerVehicles = vehicleRepository.findByOwnerId(user.getId());
                BigDecimal totalRevenue = bookingRepository.sumRevenueByOwnerId(user.getId());
                long rentedCount = bookingRepository.countByOwnerIdAndStatus(user.getId(), com.luxeway.enums.BookingStatus.IN_RENTAL);

                Map<String, Object> card = new HashMap<>();
                card.put("action", "OWNER_VEHICLES");
                card.put("success", true);
                if (ownerVehicles.isEmpty()) {
                    card.put("message", "VN".equals(lang)
                            ? "Bạn chưa có xe nào được đăng ký trên LuxeWay. Hãy nộp đơn đăng ký xe trên Host Portal để bắt đầu kinh doanh!"
                            : "You have not listed any vehicles yet. Submit an application in the Host Portal to register your vehicle.");
                } else {
                    StringBuilder sb = new StringBuilder();
                    if ("VN".equals(lang)) {
                        sb.append(String.format("📊 **Báo cáo dành cho Chủ xe %s**:\n\n", user.getFirstName() != null ? user.getFirstName() : ""));
                        sb.append(String.format("• 💰 Tổng thu nhập từ chuyến hoàn thành: **%,.0f VNĐ**\n", totalRevenue != null ? totalRevenue : BigDecimal.ZERO));
                        sb.append(String.format("• 🚗 Số xe đang được thuê: **%d xe**\n\n", rentedCount));
                        sb.append("**Trạng thái duyệt xe của bạn trên LuxeWay:**\n");
                        for (Vehicle v : ownerVehicles) {
                            String noteStr = (v.getRejectionReason() != null && !v.getRejectionReason().trim().isEmpty()) ? " - Lý do: " + v.getRejectionReason() : "";
                            sb.append(String.format("• **%s**: Trạng thái **%s** (Trạng thái duyệt: **%s**%s)\n", v.getName(), v.getStatus(), v.getApprovalStatus(), noteStr));
                        }
                    } else {
                        sb.append(String.format("📊 **Host Status Report for %s**:\n\n", user.getFirstName() != null ? user.getFirstName() : ""));
                        sb.append(String.format("• 💰 Total Earned Revenue: **$%,.2f**\n", totalRevenue != null ? totalRevenue : BigDecimal.ZERO));
                        sb.append(String.format("• 🚗 Currently Rented Vehicles: **%d**\n\n", rentedCount));
                        sb.append("**Your Listed Vehicles Approval Status:**\n");
                        for (Vehicle v : ownerVehicles) {
                            String noteStr = (v.getRejectionReason() != null && !v.getRejectionReason().trim().isEmpty()) ? " - Reason: " + v.getRejectionReason() : "";
                            sb.append(String.format("• **%s**: Status **%s** (Approval: **%s**%s)\n", v.getName(), v.getStatus(), v.getApprovalStatus(), noteStr));
                        }
                    }
                    card.put("message", sb.toString());
                }
                return card;
            }
        }

        // 8. Admin System Dashboard Query ("Có bao nhiêu owner application đang chờ duyệt?", "Refund request?") (Item 8)
        if (msgLower.contains("owner application") || msgLower.contains("ứng tuyển host") || msgLower.contains("pending vehicle") || msgLower.contains("payment pending") || (msgLower.contains("chờ duyệt") && (msgLower.contains("bao nhiêu") || msgLower.contains("count") || msgLower.contains("xe")))) {
            if (user != null && (user.getRole() != null && user.getRole().name().toUpperCase().contains("ADMIN"))) {
                long pendingApps = ownerApplicationRepository.countByStatus(com.luxeway.enums.OwnerApplicationStatus.SUBMITTED);
                long pendingVehicles = vehicleRepository.findByApprovalStatusOrderByCreatedAtDesc(com.luxeway.enums.ApprovalStatus.SUBMITTED, org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
                long openTickets = supportTicketV2Repository.findByStatus("OPEN").size();
                long pendingPayments = paymentRepository.countByStatus(com.luxeway.enums.PaymentStatus.PENDING);

                Map<String, Object> card = new HashMap<>();
                card.put("action", "ADMIN_PENDING_APPLICATIONS");
                card.put("success", true);
                if ("VN".equals(lang)) {
                    card.put("message", String.format("📌 **Thống kê Quản trị Admin LuxeWay**:\n\n" +
                            "• 📝 **Đơn ứng tuyển Host chờ duyệt:** %d đơn\n" +
                            "• 🚗 **Xe mới chờ duyệt Approval:** %d xe\n" +
                            "• 🎟️ **Yêu cầu hỗ trợ/hoàn tiền chưa xử lý:** %d ticket\n" +
                            "• 💳 **Giao dịch thanh toán Pending:** %d giao dịch",
                            pendingApps, pendingVehicles, openTickets, pendingPayments));
                } else {
                    card.put("message", String.format("📌 **LuxeWay Admin Real-time Overview**:\n\n" +
                            "• 📝 **Pending Owner Applications:** %d applications\n" +
                            "• 🚗 **Pending Vehicle Approvals:** %d vehicles\n" +
                            "• 🎟️ **Unresolved Support / Refund Tickets:** %d tickets\n" +
                            "• 💳 **Pending Payment Transactions:** %d transactions",
                            pendingApps, pendingVehicles, openTickets, pendingPayments));
                }
                return card;
            }
        }

        // 9. Vehicle Search & Recommendation (Items 1 & 2)
        if (msgLower.contains("find") || msgLower.contains("search") || msgLower.contains("thuê") || msgLower.contains("cần") || msgLower.contains("suv") || msgLower.contains("sedan") || msgLower.contains("mpv") || msgLower.contains("xe") || msgLower.contains("car") || msgLower.contains("toyota") || msgLower.contains("hồ chí minh") || msgLower.contains("sài gòn") || msgLower.contains("đà nẵng") || msgLower.contains("hà nội") || msgLower.contains("nha trang") || msgLower.contains("huế") || msgLower.contains("đà lạt") || msgLower.contains("tư vấn") || msgLower.contains("gợi ý") || msgLower.contains("recommend")) {
            
            String detectedCity = null;
            if (msgLower.contains("hồ chí minh") || msgLower.contains("sài gòn") || msgLower.contains("hcm")) {
                detectedCity = "Hồ Chí Minh";
            } else if (msgLower.contains("đà nẵng") || msgLower.contains("da nang")) {
                detectedCity = "Đà Nẵng";
            } else if (msgLower.contains("hà nội") || msgLower.contains("ha noi") || msgLower.contains("hanoi")) {
                detectedCity = "Hà Nội";
            } else if (msgLower.contains("nha trang")) {
                detectedCity = "Nha Trang";
            } else if (msgLower.contains("huế") || msgLower.contains("hue")) {
                detectedCity = "Huế";
            } else if (msgLower.contains("đà lạt") || msgLower.contains("da lat")) {
                detectedCity = "Đà Lạt";
            }

            String detectedCategory = null;
            if (msgLower.contains("suv")) detectedCategory = "SUV";
            else if (msgLower.contains("sedan")) detectedCategory = "SEDAN";
            else if (msgLower.contains("mpv")) detectedCategory = "MPV";

            BigDecimal maxPrice = null;
            if (msgLower.contains("dưới 1 triệu") || msgLower.contains("under 1m") || msgLower.contains("under 1 million") || msgLower.contains("dưới 1tr") || msgLower.contains("< 1 triệu")) {
                maxPrice = new BigDecimal("1000000");
            } else if (msgLower.contains("dưới 2 triệu") || msgLower.contains("under 2m") || msgLower.contains("dưới 2tr")) {
                maxPrice = new BigDecimal("2000000");
            } else if (msgLower.contains("dưới 500k") || msgLower.contains("under 500k")) {
                maxPrice = new BigDecimal("500000");
            } else if (msgLower.contains("dưới 1.5 triệu") || msgLower.contains("dưới 1,5tr")) {
                maxPrice = new BigDecimal("1500000");
            }

            List<Vehicle> allAvailable = vehicleRepository.findByStatus(com.luxeway.enums.VehicleStatus.AVAILABLE);

            final String filterCity = detectedCity;
            final String filterCategory = detectedCategory;
            final BigDecimal filterPrice = maxPrice;

            List<Vehicle> filtered = allAvailable.stream()
                    .filter(v -> v.getApprovalStatus() == com.luxeway.enums.ApprovalStatus.APPROVED)
                    .filter(v -> {
                        if (filterCity == null) return true;
                        String city = v.getCity() != null ? v.getCity() : "";
                        return city.toLowerCase(Locale.ROOT).contains(filterCity.toLowerCase(Locale.ROOT)) || filterCity.toLowerCase(Locale.ROOT).contains(city.toLowerCase(Locale.ROOT));
                    })
                    .filter(v -> {
                        if (filterCategory == null) return true;
                        return v.getCategory() != null && v.getCategory().name().equalsIgnoreCase(filterCategory);
                    })
                    .filter(v -> {
                        if (filterPrice == null) return true;
                        return v.getPricePerDay() != null && v.getPricePerDay().compareTo(filterPrice) <= 0;
                    })
                    .limit(4)
                    .toList();

            Map<String, Object> searchCard = new HashMap<>();
            if (!filtered.isEmpty()) {
                List<Map<String, Object>> cards = new ArrayList<>();
                for (Vehicle v : filtered) {
                    Map<String, Object> card = new HashMap<>();
                    card.put("id", v.getId());
                    card.put("name", v.getName());
                    card.put("brand", v.getBrand() != null ? v.getBrand() : "LuxeWay");
                    card.put("model", v.getModel() != null ? v.getModel() : "");
                    card.put("city", v.getCity() != null ? v.getCity() : (detectedCity != null ? detectedCity : "Việt Nam"));
                    card.put("pricePerDay", v.getPricePerDay());
                    card.put("rating", v.getRating() != null ? v.getRating() : 4.9);
                    card.put("thumbnailUrl", v.getThumbnailUrl() != null ? v.getThumbnailUrl() : "");
                    cards.add(card);
                }
                searchCard.put("action", "VEHICLE_SEARCH");
                searchCard.put("success", true);
                searchCard.put("vehicles", cards);

                boolean isRecommendation = msgLower.contains("tư vấn") || msgLower.contains("gợi ý") || msgLower.contains("nên thuê") || msgLower.contains("recommend") || msgLower.contains("suggest") || msgLower.contains("4 người");

                if (isRecommendation) {
                    if ("VN".equalsIgnoreCase(lang)) {
                        searchCard.put("message", String.format("Với nhóm 4 người và hành lý cho chuyến đi, dòng xe SUV hoặc MPV sẽ mang lại không gian rộng rãi và thoải mái hơn sedan. Dưới đây là các xe thật đang có sẵn trên LuxeWay tại khu vực **%s** phù hợp nhất cho chuyến đi của bạn:", detectedCity != null ? detectedCity : "Đà Nẵng"));
                    } else {
                        searchCard.put("message", String.format("For 4 passengers with luggage, an SUV or MPV provides significantly superior comfort and space compared to a sedan. Here are available vehicles currently listed on LuxeWay in **%s** for your trip:", detectedCity != null ? detectedCity : "Da Nang"));
                    }
                } else {
                    if ("VN".equalsIgnoreCase(lang)) {
                        searchCard.put("message", detectedCity != null
                                ? String.format("Dưới đây là các xe khả dụng thật trong hệ thống LuxeWay tại **%s** đáp ứng yêu cầu của bạn:", detectedCity)
                                : "Dưới đây là các xe thật đang có sẵn trên LuxeWay:");
                    } else {
                        searchCard.put("message", detectedCity != null
                                ? String.format("Here are verified available vehicles in **%s** matching your request:", detectedCity)
                                : "Here are verified available vehicles matching your request:");
                    }
                }
                return searchCard;
            } else if (detectedCity != null) {
                searchCard.put("action", "NAVIGATE_ACTION");
                searchCard.put("success", true);
                searchCard.put("targetUrl", "/marketplace?city=" + detectedCity);
                searchCard.put("buttonLabel", "VN".equals(lang) ? "Xem tất cả xe ở " + detectedCity : "View All Vehicles in " + detectedCity);
                searchCard.put("message", "VN".equals(lang)
                        ? String.format("Hiện tại chưa tìm thấy xe thật khả dụng trực tiếp theo bộ lọc ở **%s**. Bấm nút bên dưới để xem toàn bộ danh sách xe trên Marketplace.", detectedCity)
                        : String.format("Currently no available vehicles matching your exact filters were found directly in **%s**. Click below to browse all listings on the Marketplace.", detectedCity));
                return searchCard;
            }
        }

        return null;
    }

    private Map<String, Object> constructGeminiPayload(String systemContext, List<AIChatMessage> chatHistory, String latestMessage) {
        Map<String, Object> payload = new HashMap<>();

        Map<String, Object> systemInstruction = new HashMap<>();
        Map<String, Object> systemParts = new HashMap<>();
        systemParts.put("text", systemContext);
        systemInstruction.put("parts", List.of(systemParts));
        payload.put("systemInstruction", systemInstruction);

        List<Map<String, Object>> contents = new ArrayList<>();
        for (AIChatMessage msg : chatHistory) {
            if (msg.getContent().equals(latestMessage) && msg.getRole().equals("USER") && msg.getId().equals(chatHistory.get(chatHistory.size() - 1).getId())) {
                continue;
            }
            Map<String, Object> part = new HashMap<>();
            part.put("text", msg.getContent());

            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("role", msg.getRole().equals("USER") ? "user" : "model");
            contentMap.put("parts", List.of(part));
            contents.add(contentMap);
        }

        Map<String, Object> latestPart = new HashMap<>();
        latestPart.put("text", latestMessage);
        Map<String, Object> latestContentMap = new HashMap<>();
        latestContentMap.put("role", "user");
        latestContentMap.put("parts", List.of(latestPart));
        contents.add(latestContentMap);

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
                Map candidate = (Map) candidates.get(0);
                Map content = (Map) candidate.get("content");
                if (content != null) {
                    List parts = (List) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        Map part = (Map) parts.get(0);
                        return (String) part.get("text");
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed parsing Gemini response: {}", e.getMessage());
        }
        return "I apologize, I was unable to compile the response from our core intelligence systems. Please try again.";
    }

    private String generateMockResponse(String userMessage, User user, List<Booking> recentBookings, Booking contextBooking, Vehicle contextVehicle, String currentPage) {
        String userName = "Guest";
        if (user != null) {
            userName = user.getDisplayName() != null ? user.getDisplayName() : (user.getFirstName() + " " + user.getLastName());
        }

        String msgLower = userMessage.toLowerCase();

        // 1. Separation Ecosystem Routing Responses
        boolean isMotorbikePath = currentPage != null && currentPage.contains("motorbike");

        if (msgLower.contains("recommend") || msgLower.contains("suggest") || msgLower.contains("compare")) {
            if (isMotorbikePath) {
                return String.format("Hello %s. Based on your current session looking at motorbikes, I highly recommend exploring our top-tier **[Premium Motorbikes Marketplace](/motorbikes)**.\n\n" +
                        "We offer absolute legends like the BMW R1250 GS and Ducati Panigale V4. If you have a specific engine capacity preference (e.g. 1000cc+), tell me so I can locate it for you.", userName);
            } else {
                return String.format("Hello %s. Since you are currently on our luxury car segment, I recommend browsing the **[Premium Car Fleet](/cars)**.\n\n" +
                        "Our highlights include the Mercedes-Benz S-Class, BMW X7, and Porsche 911 Carrera. Shall I help compare specifications or assist with initiating a booking?", userName);
            }
        }

        // 2. Cancellation and Self-Service Responses
        if (msgLower.contains("cancel") || msgLower.contains("refund") || msgLower.contains("dispute")) {
            if (contextBooking != null) {
                return String.format("Hello %s. I have resolved your active booking reference **%s** for the **%s**.\n\n" +
                        "To initiate a cancellation or request a refund, please say **'Please confirm cancel'** or use the interactive options in the **[Self-Service Hub](/help)**. Rentals cancelled at least 24 hours prior to the trip start are eligible for a 100%% refund.",
                        userName, contextBooking.getId().substring(0,8).toUpperCase(), contextBooking.getVehicle().getName());
            }
            return String.format("Hello %s. To cancel, dispute, or check refund policies for any vehicle rental, please navigate to the **[LuxeWay Self-Service Center](/help)**.", userName);
        }

        // 3. Emergency Incident Dispatch
        if (msgLower.contains("emergency") || msgLower.contains("accident") || msgLower.contains("breakdown") || msgLower.contains("lost key")) {
            return String.format("🚨 **LUXEWAY PRIORITY ROAD_RESPONSE ACTIVATED** 🚨\n\n" +
                    "Dear %s, if there are injuries, please dial **113/115** immediately.\n\n" +
                    "For roadside support or collision reports, submit a **[Priority Emergency Dispatch Ticket](/help/emergency)** immediately. Our system automatically captures your GPS coordinates and dispatches local partners directly to your coordinates.", userName);
        }

        // 4. Host/Owner Inquiries
        if (msgLower.contains("owner") || msgLower.contains("host") || msgLower.contains("list my") || msgLower.contains("commission") || msgLower.contains("payout")) {
            return String.format("Hello %s. Welcome to Host Relations. LuxeWay offers a standard **15%% platform commission rate** with a robust package of hosting assets:\n\n" +
                    "- **Stripe Connect:** Configure payouts to your bank account.\n" +
                    "- **LuxePartnership Allianz Policy:** Up to $1M coverage for vehicles.\n" +
                    "- **Automatic Billing:** Tax invoices generated monthly.\n\n" +
                    "Configure all settings at the **[Owner Success Hub](/help/owner-success)**.", userName);
        }

        // 5. Delivery Tracking
        if (msgLower.contains("delivery") || msgLower.contains("track") || msgLower.contains("where is")) {
            if (contextBooking != null) {
                return String.format("Hello %s. I resolved booking **%s**.\n\n" +
                        "You can check real-time GPS coordinates of your vehicle delivery on the **[Goong Live Tracker](/help?tab=delivery)**. Alternatively, you can type **'invoice'** to check payment data.",
                        userName, contextBooking.getId().substring(0,8).toUpperCase());
            }
            return String.format("Hello %s. To track vehicle deliveries, please go to the **[Live Map Tracker](/help?tab=delivery)**.", userName);
        }

        // 6. Generic Luxury Greeting
        return String.format("Greetings %s. Welcome to LuxeWay's VIP AI Concierge.\n\n" +
                "I am fully integrated with your session to assist with:\n" +
                "- 🗺️ **[Live Vehicle Delivery Mapping](/help?tab=delivery)**\n" +
                "- 💸 **[Self-Service Cancellation & Disputes](/help)**\n" +
                "- 🚨 **[Priority Roadside Emergency Support](/help/emergency)**\n" +
                "- 📈 **[Host & Owner Success Suite](/help/owner-success)**\n" +
                "- 🟢 **[LuxeWay Platform Service Status](/help/status)**\n\n" +
                "How may I serve you today?", userName);
    }
}
