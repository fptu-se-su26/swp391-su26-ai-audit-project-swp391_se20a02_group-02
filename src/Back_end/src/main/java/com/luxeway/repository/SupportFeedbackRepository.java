package com.luxeway.repository;

import com.luxeway.entity.SupportFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SupportFeedbackRepository extends JpaRepository<SupportFeedback, String> {
    Optional<SupportFeedback> findByTicketId(String ticketId);
}
