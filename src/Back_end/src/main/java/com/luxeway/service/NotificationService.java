package com.luxeway.service;

import com.luxeway.dto.notification.NotificationDTOs;
import com.luxeway.entity.Notification;
import com.luxeway.entity.User;
import com.luxeway.repository.NotificationRepository;
import com.luxeway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final TranslationService translationService;

    // ====== Get notifications for user ======

    public Page<NotificationDTOs.NotificationResponse> getMyNotifications(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    // ====== Unread count ======

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // ====== Mark single notification as read ======

    @Transactional
    public NotificationDTOs.NotificationResponse markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to update this notification");
        }

        notification.setIsRead(true);
        notification = notificationRepository.save(notification);
        return toResponse(notification);
    }

    // ====== Mark all as read ======

    @Transactional
    public int markAllAsRead(String userId) {
        return notificationRepository.markAllAsRead(userId);
    }

    // ====== Internal: Create notification (async) ======

    @Async
    public void createNotification(String userId, String type, String title, String body, String link) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return;

            Notification notification = Notification.builder()
                    .user(user)
                    .type(type)
                    .title(title)
                    .body(body)
                    .link(link)
                    .isRead(false)
                    .build();

            notification = notificationRepository.save(notification);
            log.debug("Notification created for user {}: {}", userId, title);

            // Broadcast via STOMP WebSocket in real-time
            try {
                messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", toResponse(notification));
                log.info("Broadcasted realtime notification to user {}: {}", userId, title);
            } catch (Exception wsEx) {
                log.error("Failed to broadcast realtime notification: {}", wsEx.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to create notification for user {}: {}", userId, e.getMessage());
        }
    }

    // ====== DTO Mapping ======

    public NotificationDTOs.NotificationResponse toResponse(Notification n) {
        String lang = translationService.getCurrentLanguageCode();
        NotificationDTOs.NotificationResponse resp = new NotificationDTOs.NotificationResponse();
        resp.setId(n.getId());
        resp.setType(n.getType());
        resp.setTitle(translationService.translateNotification(n.getId(), lang, n.getTitle(), n.getBody(), "title"));
        resp.setBody(translationService.translateNotification(n.getId(), lang, n.getTitle(), n.getBody(), "body"));
        resp.setIcon(n.getIcon());
        resp.setLink(n.getLink());
        resp.setIsRead(n.getIsRead());
        resp.setCreatedAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null);
        return resp;
    }
}
