package com.luxeway.service;

import com.luxeway.entity.*;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class SupportAssistantService {

    private final EmergencyReportRepository emergencyReportRepository;
    private final SupportTicketV2Repository ticketV2Repository;
    private final SupportMessageV2Repository messageV2Repository;
    private final SupportCategoryRepository supportCategoryRepository;
    private final SupportPriorityRepository supportPriorityRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Map<String, Object> createEmergencyDispatch(User user, String emergencyType, String description, String contactPhone, String bookingId, String vehicleId, BigDecimal latitude, BigDecimal longitude) {
        log.info("Creating emergency report dispatch via AI. Type: {}, User: {}", emergencyType, user != null ? user.getId() : "Guest");
        Map<String, Object> response = new HashMap<>();
        response.put("action", "EMERGENCY_DISPATCH");

        if (user == null) {
            response.put("success", false);
            response.put("message", "User must be logged in to dispatch emergency roadside assistance.");
            return response;
        }

        EmergencyReport report = EmergencyReport.builder()
                .user(user)
                .bookingId(bookingId)
                .vehicleId(vehicleId)
                .emergencyType(emergencyType)
                .description(description)
                .contactPhone(contactPhone)
                .latitude(latitude != null ? latitude : new BigDecimal("21.0285"))
                .longitude(longitude != null ? longitude : new BigDecimal("105.8542"))
                .status("DISPATCHED") // Directly dispatch it!
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        EmergencyReport saved = emergencyReportRepository.save(report);

        // Broadcast notification to Admin Dashboard for instant priority sound alerts
        try {
            messagingTemplate.convertAndSend("/topic/emergency-alerts", saved);
        } catch (Exception e) {
            log.warn("Failed to broadcast emergency alert: {}", e.getMessage());
        }

        response.put("success", true);
        response.put("reportId", saved.getId());
        response.put("status", saved.getStatus());
        response.put("message", "Priority Roadside Response Unit has been dispatched to your GPS coordinates. A driver will call you at " + contactPhone + " shortly.");
        return response;
    }

    @Transactional
    public Map<String, Object> createSupportTicket(User user, String subject, String description, String categoryName, String priorityName, String bookingId, String vehicleId) {
        log.info("Creating support ticket via AI. Subject: {}, User: {}", subject, user != null ? user.getId() : "Guest");
        Map<String, Object> response = new HashMap<>();
        response.put("action", "CREATE_TICKET");

        if (user == null) {
            response.put("success", false);
            response.put("message", "User must be logged in to create a support ticket.");
            return response;
        }

        SupportCategory category = supportCategoryRepository.findByName(categoryName)
                .orElseGet(() -> supportCategoryRepository.findByName("OTHER")
                .orElse(null));

        SupportPriority priority = supportPriorityRepository.findByName(priorityName)
                .orElseGet(() -> supportPriorityRepository.findByName("NORMAL")
                .orElse(null));

        int responseHours = priority != null ? priority.getResponseTimeHours() : 24;
        LocalDateTime deadline = LocalDateTime.now().plusHours(responseHours);

        SupportTicketV2 ticket = SupportTicketV2.builder()
                .user(user)
                .bookingId(bookingId)
                .vehicleId(vehicleId)
                .subject(subject)
                .description(description)
                .category(category)
                .priority(priority)
                .status("OPEN")
                .slaDeadline(deadline)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        SupportTicketV2 savedTicket = ticketV2Repository.save(ticket);

        // Add first message using ticket description
        SupportMessageV2 firstMsg = SupportMessageV2.builder()
                .ticket(savedTicket)
                .sender(user)
                .senderRole("CUSTOMER")
                .body(description)
                .createdAt(LocalDateTime.now())
                .build();
        messageV2Repository.save(firstMsg);

        response.put("success", true);
        response.put("ticketId", savedTicket.getId());
        response.put("status", savedTicket.getStatus());
        response.put("message", "A support ticket has been created successfully (Ticket ID: " + savedTicket.getId().substring(0, 8).toUpperCase() + "). A luxury customer agent will reply shortly.");
        return response;
    }
}
