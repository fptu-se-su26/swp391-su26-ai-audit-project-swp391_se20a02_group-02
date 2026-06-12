package com.luxeway.repository;

import com.luxeway.entity.AIChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIChatSessionRepository extends JpaRepository<AIChatSession, String> {
    List<AIChatSession> findByUserIdOrderByUpdatedAtDesc(String userId);
}
