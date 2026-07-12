package com.luxeway.repository;

import com.luxeway.entity.AIFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIFeedbackRepository extends JpaRepository<AIFeedback, String> {
    List<AIFeedback> findBySessionId(String sessionId);
}
