package com.luxeway.dto.notification;

import lombok.Data;

public class NotificationDTOs {

    @Data
    public static class NotificationResponse {
        private String id;
        private String type;
        private String title;
        private String body;
        private String icon;
        private String link;
        private Boolean isRead;
        private String createdAt;
    }

    @Data
    public static class UnreadCountResponse {
        private long unreadCount;
    }
}
