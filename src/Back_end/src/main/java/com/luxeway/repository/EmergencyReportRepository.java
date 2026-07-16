package com.luxeway.repository;

import com.luxeway.entity.EmergencyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmergencyReportRepository extends JpaRepository<EmergencyReport, String> {
    List<EmergencyReport> findByUserIdOrderByCreatedAtDesc(String userId);
    List<EmergencyReport> findByStatus(String status);
}
