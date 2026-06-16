package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.Conversation;
import com.luxeway.entity.Message;
import com.luxeway.entity.User;
import com.luxeway.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
@SuppressWarnings("all")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.luxeway.service.ChatBotService chatBotService;

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> chatSupport(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        
        String sessionId = body.get("sessionId");
        String message = body.get("message");
        
        if (sessionId == null || sessionId.trim().isEmpty()) {
            sessionId = java.util.UUID.randomUUID().toString();
        }
        
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Message content cannot be blank"));
        }
        
        String userId = (user != null) ? user.getId() : null;
        Map<String, Object> result = chatBotService.getChatbotResponse(sessionId, message, userId);
        return ResponseEntity.ok(ApiResponse.success("Assistant response generated", result));
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<Conversation>>> getConversations(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getConversations(user.getId())));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ApiResponse<Conversation>> createConversation(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        String otherId = request.get("otherId");
        String vehicleId = request.get("vehicleId");
        Conversation conv = chatService.createConversation(user.getId(), otherId, vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Conversation session initialized", conv));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<List<Message>>> getMessages(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getMessages(id, user.getId())));
    }


    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<Message>> sendMessage(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        String conversationId = request.get("conversationId");
        String receiverId = request.get("receiverId");
        String content = request.get("content");
        Message msg = chatService.saveMessage(conversationId, user.getId(), receiverId, content);

        // Realtime broadcast to STOMP topic
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, msg);
        messagingTemplate.convertAndSendToUser(receiverId, "/queue/notifications", msg);

        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", msg));
    }

    @MessageMapping("/chat.send")
    public void sendStompMessage(@Payload Map<String, Object> message) {
        String conversationId = (String) message.get("conversationId");
        String senderId = (String) message.get("senderId");
        String recipientId = (String) message.get("recipientId");
        String content = (String) message.get("content");

        Message msg = chatService.saveMessage(conversationId, senderId, recipientId, content);

        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, msg);
        messagingTemplate.convertAndSendToUser(recipientId, "/queue/notifications", msg);
    }
}
