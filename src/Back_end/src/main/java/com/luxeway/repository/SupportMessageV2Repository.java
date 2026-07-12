package com.luxeway.repository;

import com.luxeway.entity.SupportMessageV2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportMessageV2Repository extends JpaRepository<SupportMessageV2, String> {
    List<SupportMessageV2> findByTicketIdOrderByCreatedAtAsc(String ticketId);
}
