package com.luxeway.repository;

import com.luxeway.entity.DeliveryTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DeliveryTrackingRepository extends JpaRepository<DeliveryTracking, String> {
    Optional<DeliveryTracking> findByBookingId(String bookingId);
}
