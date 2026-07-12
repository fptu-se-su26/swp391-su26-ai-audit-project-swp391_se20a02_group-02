package com.luxeway.repository;

import com.luxeway.entity.SupportTicketV2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportTicketV2Repository extends JpaRepository<SupportTicketV2, String> {
    List<SupportTicketV2> findByUserIdOrderByCreatedAtDesc(String userId);
    Page<SupportTicketV2> findByUserId(String userId, Pageable pageable);
    List<SupportTicketV2> findByStatus(String status);
    List<SupportTicketV2> findByAssignedAgentId(String agentId);
}
