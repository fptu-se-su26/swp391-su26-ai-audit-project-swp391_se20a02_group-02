package com.luxeway.service;

import com.luxeway.entity.Conversation;
import com.luxeway.entity.Message;
import com.luxeway.entity.User;
import com.luxeway.repository.ConversationRepository;
import com.luxeway.repository.MessageRepository;
import com.luxeway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Conversation> getConversations(String userId) {
        return conversationRepository.findConversationsByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Message> getMessages(String conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    @Transactional(readOnly = true)
    public List<Message> getMessages(String conversationId, String userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
        boolean isParticipant = conv.getParticipants().stream().anyMatch(p -> p.getId().equals(userId));
        if (!isParticipant) {
            log.error("BOLA/IDOR attempt: User {} is not authorized to view conversation {}", userId, conversationId);
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to view messages in this conversation session");
        }
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }


    @Transactional
    public Conversation createConversation(String userId, String otherId, String vehicleId) {
        // Fetch users
        User user1 = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        User user2 = userRepository.findById(otherId)
                .orElseThrow(() -> new RuntimeException("User not found: " + otherId));

        // Check if conversation already exists between these users (and same vehicle if provided)
        List<Conversation> user1Convs = conversationRepository.findConversationsByUserId(userId);
        for (Conversation conv : user1Convs) {
            boolean hasOther = conv.getParticipants().stream().anyMatch(p -> p.getId().equals(otherId));
            if (hasOther) {
                if (vehicleId == null || vehicleId.equals(conv.getVehicleId())) {
                    return conv;
                }
            }
        }

        // Build new conversation
        Set<User> participants = new HashSet<>();
        participants.add(user1);
        participants.add(user2);

        Conversation conv = Conversation.builder()
                .vehicleId(vehicleId)
                .participants(participants)
                .lastActivity(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        Conversation saved = conversationRepository.save(conv);
        log.info("Created new conversation: {} between {} and {}", saved.getId(), userId, otherId);
        return saved;
    }

    @Transactional
    public Message saveMessage(String conversationId, String senderId, String receiverId, String content) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

        // Verify participants
        boolean senderInConv = conv.getParticipants().stream().anyMatch(p -> p.getId().equals(senderId));
        boolean receiverInConv = conv.getParticipants().stream().anyMatch(p -> p.getId().equals(receiverId));
        if (!senderInConv || !receiverInConv) {
            throw new org.springframework.security.access.AccessDeniedException("Participants are not member of this conversation session");
        }

        Message msg = Message.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .receiverId(receiverId)
                .type("text")
                .content(content)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Message savedMsg = messageRepository.save(msg);

        // Update conversation last activity
        conv.setLastActivity(LocalDateTime.now());
        conversationRepository.save(conv);

        log.debug("Saved chat message: {} inside conversation: {}", savedMsg.getId(), conversationId);
        return savedMsg;
    }

    @Transactional
    public void deleteConversation(String id) {
        if (!conversationRepository.existsById(id)) {
            throw new RuntimeException("Conversation not found: " + id);
        }
        conversationRepository.deleteById(id);
        log.info("Deleted conversation: {}", id);
    }

    @Transactional
    public void deleteMessage(String id) {
        if (!messageRepository.existsById(id)) {
            throw new RuntimeException("Message not found: " + id);
        }
        messageRepository.deleteById(id);
        log.info("Deleted message: {}", id);
    }
}
