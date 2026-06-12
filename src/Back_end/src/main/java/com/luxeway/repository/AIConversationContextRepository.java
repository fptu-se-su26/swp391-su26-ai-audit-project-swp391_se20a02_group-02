package com.luxeway.repository;

import com.luxeway.entity.AIConversationContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AIConversationContextRepository extends JpaRepository<AIConversationContext, String> {
    Optional<AIConversationContext> findBySessionId(String sessionId);
}
