package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.dto.notification.NotificationDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notification management")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get my notifications (paginated)")
    public ResponseEntity<ApiResponse<Page<NotificationDTOs.NotificationResponse>>> getMyNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<NotificationDTOs.NotificationResponse> notifications =
                notificationService.getMyNotifications(user.getId(), page, size);
        ApiResponse<Page<NotificationDTOs.NotificationResponse>> response =
                ApiResponse.<Page<NotificationDTOs.NotificationResponse>>builder()
                        .success(true)
                        .data(notifications)
                        .meta(ApiResponse.PageMeta.builder()
                                .page(notifications.getNumber())
                                .pageSize(notifications.getSize())
                                .totalElements(notifications.getTotalElements())
                                .totalPages(notifications.getTotalPages())
                                .build())
                        .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<ApiResponse<NotificationDTOs.UnreadCountResponse>> getUnreadCount(
            @AuthenticationPrincipal User user) {
        long count = notificationService.getUnreadCount(user.getId());
        NotificationDTOs.UnreadCountResponse resp = new NotificationDTOs.UnreadCountResponse();
        resp.setUnreadCount(count);
        return ResponseEntity.ok(ApiResponse.success(resp));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<NotificationDTOs.NotificationResponse>> markAsRead(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        NotificationDTOs.NotificationResponse notification = notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", notification));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal User user) {
        int updated = notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success(updated + " notifications marked as read", null));
    }
}
