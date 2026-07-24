package com.luxeway.repository;

import com.luxeway.entity.VehicleApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleApprovalHistoryRepository extends JpaRepository<VehicleApprovalHistory, String> {
    List<VehicleApprovalHistory> findByVehicleIdOrderByCreatedAtDesc(String vehicleId);
}
