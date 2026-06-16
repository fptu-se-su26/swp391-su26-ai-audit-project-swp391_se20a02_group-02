package com.luxeway.service;

import com.luxeway.entity.ChatMessage;
import com.luxeway.entity.ChatSession;
import com.luxeway.entity.User;
import com.luxeway.repository.ChatMessageRepository;
import com.luxeway.repository.ChatSessionRepository;
import com.luxeway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
public class ChatBotService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

    @Value("${gemini.api-key:mock_key}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();

    private boolean isMock() {
        return apiKey == null || apiKey.trim().isEmpty() || "mock_key".equals(apiKey);
    }

    @Transactional
    public Map<String, Object> getChatbotResponse(String sessionId, String userMessage, String userId) {
        log.info("Generating support chatbot response for session: {}, user: {}", sessionId, userId);

        // 1. Get or create session
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseGet(() -> {
                    ChatSession newSession = new ChatSession();
                    newSession.setId(sessionId);
                    newSession.setUserId(userId);
                    newSession.setCreatedAt(LocalDateTime.now());
                    return sessionRepository.save(newSession);
                });

        // 2. Save user message
        ChatMessage userMsg = ChatMessage.builder()
                .sessionId(sessionId)
                .sender("USER")
                .message(userMessage)
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(userMsg);

        // 3. Build prompt context
        String systemInstruction = "You are the LuxeWay AI Support Chatbot, an elite, polite, and helpful luxury vehicle rental support agent. " +
                "Assist the customer with: \n" +
                "- Booking help (how to book a premium vehicle, requirements, etc.)\n" +
                "- Payment questions (supported gateways: VNPay, Stripe, credit cards)\n" +
                "- Vehicle recommendation (recommend cars or motorbikes based on user budget and preference)\n" +
                "- Dispute guidance (how to cancel bookings, report damage, claim refunds via Self-Service center)\n" +
                "- Tracking booking status (direct them to use their tracking dashboard to see real-time delivery GPS route and statuses)\n\n" +
                "Tone: Elite, professional, highly helpful, elegant. Do not use emojis in your responses. Keep responses concise and structured in markdown under 200 words.";

        List<ChatMessage> chatHistory = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        String aiResponse = "";
        if (isMock()) {
            aiResponse = generateFallbackResponse(userMessage);
        } else {
            try {
                String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelName, apiKey);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> payload = constructGeminiPayload(systemInstruction, chatHistory, userMessage);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    aiResponse = extractTextFromGeminiResponse(response.getBody());
                } else {
                    aiResponse = generateFallbackResponse(userMessage);
                }
            } catch (Exception e) {
                log.error("Gemini API call failed: {}", e.getMessage());
                aiResponse = generateFallbackResponse(userMessage);
            }
        }

        // 4. Save bot message
        ChatMessage botMsg = ChatMessage.builder()
                .sessionId(sessionId)
                .sender("ASSISTANT")
                .message(aiResponse)
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(botMsg);

        Map<String, Object> result = new HashMap<>();
        result.put("sessionId", sessionId);
        result.put("sender", "ASSISTANT");
        result.put("message", aiResponse);
        result.put("createdAt", botMsg.getCreatedAt().toString());
        return result;
    }

    private Map<String, Object> constructGeminiPayload(String systemContext, List<ChatMessage> chatHistory, String latestMessage) {
        Map<String, Object> payload = new HashMap<>();

        Map<String, Object> systemInstruction = new HashMap<>();
        Map<String, Object> systemParts = new HashMap<>();
        systemParts.put("text", systemContext);
        systemInstruction.put("parts", List.of(systemParts));
        payload.put("systemInstruction", systemInstruction);

        List<Map<String, Object>> contents = new ArrayList<>();
        for (ChatMessage msg : chatHistory) {
            if (msg.getMessage().equals(latestMessage) && msg.getSender().equals("USER") && msg.getId().equals(chatHistory.get(chatHistory.size() - 1).getId())) {
                continue;
            }
            Map<String, Object> part = new HashMap<>();
            part.put("text", msg.getMessage());

            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("role", msg.getSender().equals("USER") ? "user" : "model");
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

        Map<String, Object> genConfig = new HashMap<>();
        genConfig.put("temperature", 0.3);
        genConfig.put("maxOutputTokens", 600);
        payload.put("generationConfig", genConfig);

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
            log.error("Parsing response failed", e);
        }
        return "I apologize, but I could not compute a response. Please try again later.";
    }

    private String generateFallbackResponse(String userMessage) {
        String msgLower = userMessage.toLowerCase();
        if (msgLower.contains("book") || msgLower.contains("rent")) {
            return "To book a premium vehicle, select your preferred dates and pickup location on the car details page. If delivery is requested, the system will calculate the routing and delivery fees automatically. Please ensure your driving license is verified in your profile beforehand.";
        }
        if (msgLower.contains("pay") || msgLower.contains("fee") || msgLower.contains("card") || msgLower.contains("vnpay") || msgLower.contains("stripe")) {
            return "LuxeWay supports direct payments via VNPay and Stripe. Payments can be processed once the owner confirms your booking. All charges, including rental, insurance, and service fees, are listed transparently on the checkout page.";
        }
        if (msgLower.contains("recommend") || msgLower.contains("suggest")) {
            return "I highly recommend our featured vehicles list or browsing vehicles in your city. For city driving, our sedan categories offer maximum luxury comfort, while our motorbikes are perfect for scenic road explorations.";
        }
        if (msgLower.contains("dispute") || msgLower.contains("cancel") || msgLower.contains("refund")) {
            return "Rentals can be cancelled up to 24 hours prior to pickup for a full refund. To open a dispute or request a refund, please head to the Self-Service Center in your help section.";
        }
        if (msgLower.contains("track") || msgLower.contains("where")) {
            return "Once the owner confirms and starts the trip, you can track the live vehicle position on the booking tracking page. It shows an animated marker with ETA updates based on real-time GPS telemetry.";
        }
        return "Thank you for contacting LuxeWay Customer Support. I can help you with bookings, payment questions, vehicle recommendations, dispute guidance, and tracking your active rentals. How may I assist you today?";
    }
}
