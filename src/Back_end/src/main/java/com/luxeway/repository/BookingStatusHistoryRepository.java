package com.luxeway.repository;

import com.luxeway.entity.BookingStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingStatusHistoryRepository extends JpaRepository<BookingStatusHistory, String> {
    List<BookingStatusHistory> findByBookingIdOrderByCreatedAtAsc(String bookingId);
}
