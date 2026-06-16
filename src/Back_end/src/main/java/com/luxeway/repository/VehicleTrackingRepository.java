package com.luxeway.repository;

import com.luxeway.entity.VehicleTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleTrackingRepository extends JpaRepository<VehicleTracking, String> {
    
    List<VehicleTracking> findByVehicleIdOrderByCreatedAtAsc(String vehicleId);
    
    List<VehicleTracking> findByBookingIdOrderByCreatedAtAsc(String bookingId);
    
    void deleteByVehicleId(String vehicleId);
}
