package com.luxeway.repository;

import com.luxeway.entity.DeliveryTrackingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeliveryTrackingHistoryRepository extends JpaRepository<DeliveryTrackingHistory, String> {
    List<DeliveryTrackingHistory> findByTrackingIdOrderByRecordedAtAsc(String trackingId);
}
