package com.luxeway.service;

import com.luxeway.entity.*;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {

    private final AIChatSessionRepository sessionRepository;
    private final AIChatMessageRepository messageRepository;
    private final AIFeedbackRepository feedbackRepository;
    private final AIUserPreferenceRepository userPreferenceRepository;
    private final AISearchHistoryRepository searchHistoryRepository;
    private final AIRecommendationRepository recommendationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AIChatMessage> getChatHistory(String sessionId) {
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public AIFeedback saveFeedback(String sessionId, String messageId, boolean isPositive, String feedbackText) {
        log.info("Saving feedback for session: {}, message: {}, positive: {}", sessionId, messageId, isPositive);
        AIChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        AIFeedback feedback = AIFeedback.builder()
                .session(session)
                .messageId(messageId)
                .isPositive(isPositive)
                .feedbackText(feedbackText)
                .createdAt(LocalDateTime.now())
                .build();

        return feedbackRepository.save(feedback);
    }

    @Transactional
    public AIUserPreference saveUserPreferences(String userId, String preferredLanguage, boolean voiceEnabled, String preferredVehicleType) {
        log.info("Saving AI user preferences for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        AIUserPreference preference = userPreferenceRepository.findById(userId)
                .orElse(AIUserPreference.builder().userId(userId).user(user).build());

        preference.setPreferredLanguage(preferredLanguage);
        preference.setVoiceEnabled(voiceEnabled);
        preference.setPreferredVehicleType(preferredVehicleType);

        return userPreferenceRepository.save(preference);
    }

    @Transactional(readOnly = true)
    public AIUserPreference getUserPreferences(String userId) {
        return userPreferenceRepository.findById(userId).orElse(null);
    }

    @Transactional
    public AISearchHistory logSearchHistory(String userId, String query) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return null;

        AISearchHistory search = AISearchHistory.builder()
                .user(user)
                .query(query)
                .searchedAt(LocalDateTime.now())
                .build();

        return searchHistoryRepository.save(search);
    }

    @Transactional
    public AIRecommendation logRecommendation(String userId, String vehicleId, double score) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        AIRecommendation recommendation = AIRecommendation.builder()
                .user(user)
                .vehicleId(vehicleId)
                .recommendationScore(BigDecimal.valueOf(score))
                .recommendedAt(LocalDateTime.now())
                .build();

        return recommendationRepository.save(recommendation);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdminAIAnalytics() {
        log.info("Computing administrator AI Concierge analytics");
        long totalSessions = sessionRepository.count();
        long totalMessages = messageRepository.count();
        long totalFeedback = feedbackRepository.count();

        long positiveFeedback = feedbackRepository.findAll().stream()
                .filter(AIFeedback::getIsPositive)
                .count();

        long negativeFeedback = totalFeedback - positiveFeedback;
        double satisfactionRate = totalFeedback > 0 ? ((double) positiveFeedback / totalFeedback) * 100.0 : 100.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSessions", totalSessions);
        stats.put("totalMessages", totalMessages);
        stats.put("totalFeedback", totalFeedback);
        stats.put("positiveFeedback", positiveFeedback);
        stats.put("negativeFeedback", negativeFeedback);
        stats.put("satisfactionRate", satisfactionRate);

        return stats;
    }
}
