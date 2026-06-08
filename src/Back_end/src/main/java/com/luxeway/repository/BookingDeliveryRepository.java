package com.luxeway.repository;

import com.luxeway.entity.BookingDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingDeliveryRepository extends JpaRepository<BookingDelivery, String> {
}
