package com.luxeway.repository;

import com.luxeway.entity.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByBookingId(String bookingId);
    List<Dispute> findByReporterId(String reporterId);
    List<Dispute> findByStatus(String status);
}
