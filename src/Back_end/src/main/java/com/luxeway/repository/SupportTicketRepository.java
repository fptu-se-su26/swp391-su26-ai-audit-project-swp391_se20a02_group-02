package com.luxeway.repository;

import com.luxeway.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findByUser_IdOrderByCreatedAtDesc(String userId);

    List<SupportTicket> findByStatusOrderByCreatedAtDesc(String status);

    long countByStatus(String status);
}
