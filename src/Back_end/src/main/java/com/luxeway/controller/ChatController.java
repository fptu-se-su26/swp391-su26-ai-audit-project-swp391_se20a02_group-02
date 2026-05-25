package com.luxeway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, Object> message) {
        message.put("timestamp", LocalDateTime.now().toString());
        String recipientId = (String) message.get("recipientId");
        String bookingId = (String) message.get("bookingId");
        
        // Broadcast to specific topic for this booking chat room
        messagingTemplate.convertAndSend("/topic/chat/" + bookingId, message);
        
        // Also send a notification to the specific user queue
        messagingTemplate.convertAndSendToUser(
                recipientId,
                "/queue/notifications",
                message
        );
    }
}
