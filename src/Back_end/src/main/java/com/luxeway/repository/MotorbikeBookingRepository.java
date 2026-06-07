package com.luxeway.repository;

import com.luxeway.entity.MotorbikeBooking;
import com.luxeway.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface MotorbikeBookingRepository extends JpaRepository<MotorbikeBooking, String> {
    List<MotorbikeBooking> findByRenterId(String renterId);
    
    List<MotorbikeBooking> findByOwnerId(String ownerId);
    
    List<MotorbikeBooking> findByMotorbikeId(String motorbikeId);
    
    long countByStatus(BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.total), 0) FROM MotorbikeBooking b WHERE b.status = :status")
    BigDecimal sumTotalByStatus(@Param("status") BookingStatus status);

    @Query("SELECT COUNT(b) > 0 FROM MotorbikeBooking b WHERE b.motorbike.id = :motorbikeId AND b.status IN (com.luxeway.enums.BookingStatus.PENDING, com.luxeway.enums.BookingStatus.CONFIRMED, com.luxeway.enums.BookingStatus.ACTIVE) AND b.startDate <= :endDate AND b.endDate >= :startDate")
    boolean hasConflictingBooking(@Param("motorbikeId") String motorbikeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}

