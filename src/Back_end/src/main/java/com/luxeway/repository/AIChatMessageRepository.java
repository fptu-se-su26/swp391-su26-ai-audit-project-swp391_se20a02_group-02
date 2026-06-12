package com.luxeway.repository;

import com.luxeway.entity.AIChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIChatMessageRepository extends JpaRepository<AIChatMessage, String> {
    List<AIChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
}
