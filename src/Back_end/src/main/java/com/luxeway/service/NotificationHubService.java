package com.luxeway.service;

import com.luxeway.entity.Notification;
import com.luxeway.entity.NotificationLog;
import com.luxeway.entity.NotificationTemplate;
import com.luxeway.entity.User;
import com.luxeway.repository.NotificationLogRepository;
import com.luxeway.repository.NotificationRepository;
import com.luxeway.repository.NotificationTemplateRepository;
import com.luxeway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationHubService {

    private final NotificationTemplateRepository templateRepository;
    private final NotificationLogRepository logRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public void seedTemplates() {
        log.info("Checking/seeding default notification templates...");
        seedTemplate("booking_created", "LuxeWay Booking Confirmation Request", 
                "<h2>Hello, ${renterName}!</h2><p>Your booking request for vehicle <b>${vehicleName}</b> is pending confirmation by the owner.</p><p>Total Cost: <b>${amount}</b>.</p>", "EMAIL");
        
        seedTemplate("booking_confirmed", "LuxeWay Booking Confirmed!", 
                "<h2>Hello, ${renterName}!</h2><p>Great news! Your booking for <b>${vehicleName}</b> has been confirmed by the owner.</p><p>Get ready for your trip starting ${startDate}!</p>", "EMAIL");
        
        seedTemplate("booking_cancelled", "LuxeWay Booking Cancelled", 
                "<h2>Booking Cancelled</h2><p>Your booking for <b>${vehicleName}</b> has been cancelled.</p><p>Reason: ${reason}</p>", "EMAIL");
        
        seedTemplate("payment_succeeded", "LuxeWay Payment Received", 
                "<h2>Payment Successful</h2><p>We received your payment of <b>${amount}</b> for booking reference <b>#${bookingId}</b>.</p>", "EMAIL");
        
        seedTemplate("kyc_approved", "LuxeWay KYC Verified Successfully", 
                "<h2>KYC Verification Passed</h2><p>Congratulations, your profile documents have been verified. You can now request bookings instantly on the platform.</p>", "EMAIL");
        
        seedTemplate("kyc_rejected", "LuxeWay KYC Verification Failed", 
                "<h2>KYC Verification Rejected</h2><p>Unfortunately, your uploaded documents did not meet our verification standards.</p><p><b>Comments:</b> ${reason}</p>", "EMAIL");
    }

    private void seedTemplate(String name, String subject, String body, String channel) {
        if (templateRepository.findByName(name).isEmpty()) {
            NotificationTemplate template = NotificationTemplate.builder()
                    .name(name)
                    .subject(subject)
                    .bodyTemplate(body)
                    .channel(channel)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            templateRepository.save(template);
            log.info("Seeded template: {}", name);
        }
    }

    @Transactional
    public void dispatchNotification(String userId, String templateName, Map<String, String> variables) {
        log.info("Dispatching notification: {} to user: {}", templateName, userId);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User {} not found, skipping dispatch", userId);
            return;
        }

        NotificationTemplate template = templateRepository.findByName(templateName).orElse(null);
        if (template == null) {
            log.warn("Template {} not found, skipping dispatch", templateName);
            return;
        }

        // Process message variables
        String processedSubject = processTemplate(template.getSubject(), variables);
        String processedBody = processTemplate(template.getBodyTemplate(), variables);

        // 1. Send Email if template specifies Email
        String status = "SENT";
        String errMsg = null;
        if ("EMAIL".equalsIgnoreCase(template.getChannel())) {
            try {
                emailService.sendCustomHtmlEmail(user.getEmail(), processedSubject, processedBody);
            } catch (Exception e) {
                status = "FAILED";
                errMsg = e.getMessage();
                log.warn("Failed to dispatch email: {}", e.getMessage());
            }
        }

        // 2. Add to In-app notifications
        try {
            Notification inApp = Notification.builder()
                    .user(user)
                    .type("system")
                    .title(processedSubject)
                    .body(stripHtml(processedBody))
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(inApp);
        } catch (Exception e) {
            log.warn("Failed to save In-app notification: {}", e.getMessage());
        }

        // 3. Log into Audit Trail Notification Log
        try {
            NotificationLog logEntry = NotificationLog.builder()
                    .user(user)
                    .template(template)
                    .title(processedSubject)
                    .body(processedBody)
                    .channel(template.getChannel())
                    .status(status)
                    .sentAt(LocalDateTime.now())
                    .errorMessage(errMsg)
                    .build();
            logRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("Failed to write notification log to DB: {}", e.getMessage());
        }
    }

    private String processTemplate(String src, Map<String, String> vars) {
        if (src == null || vars == null) return src;
        String res = src;
        for (Map.Entry<String, String> entry : vars.entrySet()) {
            String placeholder = "${" + entry.getKey() + "}";
            if (entry.getValue() != null) {
                res = res.replace(placeholder, entry.getValue());
            }
        }
        return res;
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", "");
    }
}
