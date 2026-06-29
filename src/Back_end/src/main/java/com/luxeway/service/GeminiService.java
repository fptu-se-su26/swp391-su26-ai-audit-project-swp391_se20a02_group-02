package com.luxeway.service;

import com.luxeway.entity.AIChatMessage;
import com.luxeway.entity.AIChatSession;
import com.luxeway.entity.Booking;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.repository.AIChatMessageRepository;
import com.luxeway.repository.AIChatSessionRepository;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
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

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class GeminiService {

    private final AIChatSessionRepository sessionRepository;
    private final AIChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;

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

    private final RestTemplate restTemplateFieldBackup = null; // Backup/preserves constructor injection structure

    /**
     * Main entrypoint for chat concierge interactions.
     */
    @Transactional
    public Map<String, Object> generateChatResponse(String sessionId, String userMessage, String userId) {
        log.info("Generating AI response for session: {}, user: {}", sessionId, userId);

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

        // Update session timestamp
        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);

        // 2. Save user message
        AIChatMessage userMsgEntity = AIChatMessage.builder()
                .session(session)
                .role("USER")
                .content(userMessage)
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(userMsgEntity);

        // 3. Load user context
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        } else if (session.getUser() != null) {
            user = session.getUser();
        }

        // 4. Retrieve recent bookings for user context
        List<Booking> recentBookings = List.of();
        if (user != null) {
            recentBookings = bookingRepository.findByRenterIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 3)).getContent();
        }

        // Retrieve current session context booking & vehicle
        Booking contextBooking = null;
        if (session.getBookingId() != null) {
            contextBooking = bookingRepository.findById(session.getBookingId()).orElse(null);
        }
        Vehicle contextVehicle = null;
        if (session.getVehicleId() != null) {
            contextVehicle = vehicleRepository.findById(session.getVehicleId()).orElse(null);
        }

        // 5. Build prompt with user context
        String systemContext = buildSystemPrompt(user, recentBookings, contextBooking, contextVehicle);
        List<AIChatMessage> chatHistory = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        String aiResponse = "";
        String rawResponse = "";

        if (!hasConfiguredGeminiKey()) {
            log.info("Gemini API key is missing or placeholder. Using luxury concierge mock response logic.");
            aiResponse = generateMockResponse(userMessage, user, recentBookings, contextBooking, contextVehicle);
            rawResponse = "{\"mock\": true, \"reason\": \"API key is not configured or is still a placeholder\"}";
        } else {
            try {
                // Call Google Generative AI API
                String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelName, apiKey);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                // Construct Request Payload matching Gemini API schema
                Map<String, Object> requestBody = constructGeminiPayload(systemContext, chatHistory, userMessage);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    rawResponse = response.getBody().toString();
                    aiResponse = extractTextFromGeminiResponse(response.getBody());
                } else {
                    log.warn("Gemini API returned error code {}. Falling back to mock.", response.getStatusCode());
                    aiResponse = generateMockResponse(userMessage, user, recentBookings, contextBooking, contextVehicle);
                    rawResponse = "Error status: " + response.getStatusCode();
                }
            } catch (Exception e) {
                log.error("Exception calling Gemini API: {}. Falling back to mock.", e.getMessage(), e);
                aiResponse = generateMockResponse(userMessage, user, recentBookings, contextBooking, contextVehicle);
                rawResponse = "Exception: " + e.getMessage();
            }
        }

        // 6. Save AI Response
        AIChatMessage aiMsgEntity = AIChatMessage.builder()
                .session(session)
                .role("ASSISTANT")
                .content(aiResponse)
                .rawResponse(rawResponse)
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(aiMsgEntity);

        Map<String, Object> result = new HashMap<>();
        result.put("sessionId", sessionId);
        result.put("role", "ASSISTANT");
        result.put("content", aiResponse);
        result.put("createdAt", aiMsgEntity.getCreatedAt().toString());
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
    private String buildSystemPrompt(User user, List<Booking> recentBookings, Booking contextBooking, Vehicle contextVehicle) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are the LuxeWay AI Concierge, a luxury enterprise customer support agent for LuxeWay.\n");
        sb.append("LuxeWay contains TWO COMPLETELY SEPARATE ecosystems:\n");
        sb.append("1. Car Marketplace (/cars, /cars/:id, /car-booking/*)\n");
        sb.append("2. Motorbike Marketplace (/motorbikes, /motorbikes/:id, /motorbike-booking/*)\n");
        sb.append("IMPORTANT: DO NOT MERGE these ecosystems. If a customer is asking about a motorbike, refer them to motorbike URLs, not car URLs.\n\n");
        sb.append("Tone: Extremely professional, elite, luxury, polite, and concise. Address the user by name.\n\n");

        if (user != null) {
            String name = (user.getDisplayName() != null) ? user.getDisplayName() : (user.getFirstName() + " " + user.getLastName());
            sb.append("Customer Info: ").append(name).append(" (Email: ").append(user.getEmail()).append(")\n");
        }

        if (contextBooking != null) {
            sb.append("Current Session Booking Context: ID: ").append(contextBooking.getId())
                    .append(", Vehicle: ").append(contextBooking.getVehicle().getName())
                    .append(", Status: ").append(contextBooking.getStatus())
                    .append(", Rent Dates: ").append(contextBooking.getStartDate()).append(" to ").append(contextBooking.getEndDate())
                    .append("\n");
        }

        if (contextVehicle != null) {
            sb.append("Current Session Vehicle Context: ID: ").append(contextVehicle.getId())
                    .append(", Name: ").append(contextVehicle.getName())
                    .append(", Category: ").append(contextVehicle.getCategory())
                    .append("\n");
        }

        if (recentBookings != null && !recentBookings.isEmpty()) {
            sb.append("Customer's Recent Bookings:\n");
            for (Booking b : recentBookings) {
                sb.append("- Booking ID: ").append(b.getId())
                        .append(", Vehicle: ").append(b.getVehicle().getName())
                        .append(", Status: ").append(b.getStatus())
                        .append(", Dates: ").append(b.getStartDate()).append(" to ").append(b.getEndDate())
                        .append("\n");
            }
        }

        sb.append("\nInstructions:\n");
        sb.append("- If user asks about delivery tracking, direct them to our real-time Goong Maps page (/help?tab=delivery) or suggest entering a Booking ID.\n");
        sb.append("- If user asks about owner registration, payouts, revenue, commission, or tax, direct them to the Host/Owner Success Center (/help/owner-success).\n");
        sb.append("- If user reports an accident, vehicle damage, breakdown, or dangerous situation, guide them to submit an Emergency Report (/help/emergency) immediately.\n");
        sb.append("- If user wants to submit a dispute, cancel a booking, or claim a refund, instruct them to use the Self-Service Center (/help) where they can do it dynamically.\n");
        sb.append("- Keep the response under 200 words. Always return valid Markdown.\n");

        return sb.toString();
    }

    private Map<String, Object> constructGeminiPayload(String systemContext, List<AIChatMessage> chatHistory, String latestMessage) {
        Map<String, Object> payload = new HashMap<>();

        // 1. Set System Instruction
        Map<String, Object> systemInstruction = new HashMap<>();
        Map<String, Object> systemParts = new HashMap<>();
        systemParts.put("text", systemContext);
        systemInstruction.put("parts", List.of(systemParts));
        payload.put("systemInstruction", systemInstruction);

        // 2. Set contents (conversational history + latest message)
        List<Map<String, Object>> contents = new ArrayList<>();
        for (AIChatMessage msg : chatHistory) {
            // Skip the latest user message which we will append manually at the end
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

        // Add the latest user message
        Map<String, Object> latestPart = new HashMap<>();
        latestPart.put("text", latestMessage);
        Map<String, Object> latestContentMap = new HashMap<>();
        latestContentMap.put("role", "user");
        latestContentMap.put("parts", List.of(latestPart));
        contents.add(latestContentMap);

        payload.put("contents", contents);

        // 3. Generation configuration
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
            log.error("Failed to parse Gemini API JSON response: {}", e.getMessage());
        }
        return "I apologize, but I encountered an issue processing that request. Please try again or contact support.";
    }

    private String generateMockResponse(String userMessage, User user, List<Booking> recentBookings, Booking contextBooking, Vehicle contextVehicle) {
        String userName = "Guest";
        if (user != null) {
            userName = user.getDisplayName() != null ? user.getDisplayName() : (user.getFirstName() + " " + user.getLastName());
        }

        String msgLower = userMessage.toLowerCase();

        if (msgLower.contains("track") || msgLower.contains("delivery") || msgLower.contains("where is")) {
            String bookingDetails = "";
            if (contextBooking != null) {
                bookingDetails = " for your booking of the **" + contextBooking.getVehicle().getName() + "**";
            } else if (recentBookings != null && !recentBookings.isEmpty()) {
                bookingDetails = " for your upcoming booking of the **" + recentBookings.get(0).getVehicle().getName() + "**";
            }
            return String.format(
                "Hello %s. I can assist you with tracking your vehicle delivery%s.\n\n" +
                "Please go to our **[Real-time Delivery Tracker](/help?tab=delivery)** where you can watch live driver GPS coordinates, active routes, and updated ETAs. " +
                "If you need to query a specific delivery session, you can do so by entering your booking reference directly in the tracking panel.",
                userName, bookingDetails
            );
        }

        if (msgLower.contains("cancel") || msgLower.contains("refund") || msgLower.contains("dispute") || msgLower.contains("money back")) {
            return String.format(
                "Hello %s. For cancellations, refunds, or disputes, LuxeWay provides streamlined customer self-service modules:\n\n" +
                "1. **Cancellations & Refunds:** Under our luxury service policy, rentals can be cancelled with a full refund up to **24 hours before the trip begins**. " +
                "Simply click on the **[Self-Service Hub](/help)**, select 'Request Refund/Cancellation', and choose your booking.\n" +
                "2. **Open a Dispute:** If you faced issues with cleanliness, fuel mismatches, or owner disputes, choose the **'Open Dispute'** option in the self-service menu.\n\n" +
                "Please check the **[Self-Service Center](/help)** to get started immediately.",
                userName
            );
        }

        if (msgLower.contains("emergency") || msgLower.contains("accident") || msgLower.contains("breakdown") || msgLower.contains("crash") || msgLower.contains("injury") || msgLower.contains("lost key")) {
            return String.format(
                "🚨 **LuxeWay Priority Emergency Dispatch** 🚨\n\n" +
                "Hello %s. If there is an active medical emergency, please call **113/115** immediately.\n\n" +
                "For platform-specific critical incidents—such as a vehicle breakdown, severe collision, lost keys, or safety violations—please click **[Priority Emergency Dispatch](/help/emergency)** to submit an emergency ticket. " +
                "Our dedicated emergency response unit will receive your exact GPS location, phone contact, and dispatch roadside assistance or a replacement premium vehicle immediately.",
                userName
            );
        }

        if (msgLower.contains("owner") || msgLower.contains("host") || msgLower.contains("earn") || msgLower.contains("payout") || msgLower.contains("commission") || msgLower.contains("list my") || msgLower.contains("tax")) {
            return String.format(
                "Hello %s. LuxeWay's **[Owner Success Center](/help/owner-success)** provides a robust suite of tools for our hosts:\n\n" +
                "- **Payout & Bank Settings:** Configure Stripe details to receive direct payouts.\n" +
                "- **Commission Analytics:** LuxeWay charges a standard **15%% platform commission** on vehicle rentals.\n" +
                "- **Insurance Claims:** Submit claims for vehicle damage under the Allianz LuxePartnership plan.\n" +
                "- **Tax Invoicing:** Automatically generate tax invoices and monthly revenue reports.\n\n" +
                "You can access all host utilities at the **[Owner Success Dashboard](/help/owner-success)**.",
                userName
            );
        }

        if (msgLower.contains("status") || msgLower.contains("offline") || msgLower.contains("working") || msgLower.contains("issue") || msgLower.contains("down")) {
            return String.format(
                "Hello %s. If you are experiencing technical difficulties, you can monitor our core platform services on the **[LuxeWay Platform Status Page](/help/status)**.\n\n" +
                "Currently, our Booking System, VNPay/Stripe Payment Gateways, and Live Messaging are fully **Operational**. Should any system degrade, real-time alerts and maintenance timelines will be updated there.",
                userName
            );
        }

        // Generic fallback
        return String.format(
            "Hello %s, thank you for contacting the LuxeWay Luxury Customer Concierge.\n\n" +
            "I can assist you with:\n" +
            "- 🗺️ **[Tracking Vehicle Delivery](/help?tab=delivery)**\n" +
            "- 💸 **[Self-Service Refunds & Dispute Claims](/help)**\n" +
            "- 🚨 **[Priority Roadside Emergency Dispatch](/help/emergency)**\n" +
            "- 📈 **[Host & Owner Success Tools](/help/owner-success)**\n" +
            "- 🟢 **[LuxeWay Core System Status](/help/status)**\n\n" +
            "How may I assist you in details today?",
            userName
        );
    }
}
