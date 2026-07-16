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
            // An action was successfully executed, inject action message
            aiResponse = (String) actionCard.get("message");
            rawResponse = "{\"actionExecuted\": true, \"action\": \"" + actionCard.get("action") + "\"}";
        } else if (!hasConfiguredGeminiKey()) {
            // Fallback to mock responses only when the API key is missing or still a placeholder.
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
                log.error("Exception calling Gemini: {}", e.getMessage(), e);
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
    private Map<String, Object> checkForDirectActions(String message, Booking contextBooking, User user) {
        String msgLower = message.toLowerCase();

        // 1. Cancel Booking Action
        if ((msgLower.contains("cancel") || msgLower.contains("refund")) && (msgLower.contains("confirm") || msgLower.contains("yes") || msgLower.contains("please"))) {
            if (contextBooking != null) {
                return bookingAssistantService.executeCancelBooking(contextBooking.getId());
            }
        }

        // 2. Extend Booking Action
        if (msgLower.contains("extend") || msgLower.contains("modify")) {
            if (contextBooking != null) {
                // Try to find a number of days
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
        if (msgLower.contains("invoice") || msgLower.contains("bill") || msgLower.contains("receipt")) {
            if (contextBooking != null) {
                return bookingAssistantService.retrieveInvoice(contextBooking.getId());
            }
        }

        // 4. Emergency Roadside Assistant Trigger
        if (msgLower.contains("accident") || msgLower.contains("breakdown") || msgLower.contains("flat tire")) {
            if (user != null) {
                return supportAssistantService.createEmergencyDispatch(user, "BREAKDOWN", "AI Concierge auto-detected incident: " + message, user.getPhone() != null ? user.getPhone() : "090000000", contextBooking != null ? contextBooking.getId() : null, contextBooking != null && contextBooking.getVehicle() != null ? contextBooking.getVehicle().getId() : null, null, null);
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
