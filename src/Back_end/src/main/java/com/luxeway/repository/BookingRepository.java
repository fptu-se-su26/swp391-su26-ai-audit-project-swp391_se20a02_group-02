package com.luxeway.repository;

import com.luxeway.entity.Booking;
import com.luxeway.enums.BookingStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;


@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.id = :id")
    java.util.Optional<Booking> findByIdForContractUpdate(@Param("id") String id);

    // By status
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    // By renter
    Page<Booking> findByRenterIdOrderByCreatedAtDesc(String renterId, Pageable pageable);
    List<Booking> findByRenterIdAndStatus(String renterId, BookingStatus status);

    // By owner
    Page<Booking> findByOwnerIdOrderByCreatedAtDesc(String ownerId, Pageable pageable);
    List<Booking> findByOwnerIdAndStatus(String ownerId, BookingStatus status);

    // By vehicle
    List<Booking> findByVehicleIdAndStatusIn(String vehicleId, List<BookingStatus> statuses);
    boolean existsByVehicleIdAndStatusIn(String vehicleId, List<BookingStatus> statuses);

    // Conflict detection: check if any active booking overlaps the requested dates
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.status IN (com.luxeway.enums.BookingStatus.WAITING_PAYMENT, com.luxeway.enums.BookingStatus.PAYMENT_PENDING, com.luxeway.enums.BookingStatus.PAYMENT_VERIFIED, com.luxeway.enums.BookingStatus.OWNER_APPROVED, com.luxeway.enums.BookingStatus.READY_FOR_PICKUP, com.luxeway.enums.BookingStatus.CHECKED_OUT, com.luxeway.enums.BookingStatus.IN_RENTAL, com.luxeway.enums.BookingStatus.RETURN_PENDING, com.luxeway.enums.BookingStatus.RETURN_COMPLETED, com.luxeway.enums.BookingStatus.COMPLETED) " +
           "AND b.startDate <= :endDate AND b.endDate >= :startDate")
    boolean hasConflictingBooking(
        @Param("vehicleId") String vehicleId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // Same but excluding a specific booking (for updates)
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.id <> :excludeId " +
           "AND b.status IN (com.luxeway.enums.BookingStatus.WAITING_PAYMENT, com.luxeway.enums.BookingStatus.PAYMENT_PENDING, com.luxeway.enums.BookingStatus.PAYMENT_VERIFIED, com.luxeway.enums.BookingStatus.OWNER_APPROVED, com.luxeway.enums.BookingStatus.READY_FOR_PICKUP, com.luxeway.enums.BookingStatus.CHECKED_OUT, com.luxeway.enums.BookingStatus.IN_RENTAL, com.luxeway.enums.BookingStatus.RETURN_PENDING, com.luxeway.enums.BookingStatus.RETURN_COMPLETED, com.luxeway.enums.BookingStatus.COMPLETED) " +
           "AND b.startDate <= :endDate AND b.endDate >= :startDate")
    boolean hasConflictingBookingExcluding(
        @Param("vehicleId") String vehicleId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("excludeId") String excludeId
    );

    java.util.Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, java.time.LocalDateTime cutoff);

    // Active bookings for a vehicle
    @Query("SELECT b FROM Booking b WHERE b.vehicle.id = :vehicleId AND b.status = com.luxeway.enums.BookingStatus.IN_RENTAL")
    List<Booking> findActiveBookingsByVehicle(@Param("vehicleId") String vehicleId);

    // Statistics
    long countByStatus(BookingStatus status);

    long countByOwnerId(String ownerId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.owner.id = :ownerId AND b.status = :status")
    long countByOwnerIdAndStatus(@Param("ownerId") String ownerId, @Param("status") BookingStatus status);

    @Query("SELECT SUM(b.total) FROM Booking b WHERE b.owner.id = :ownerId AND b.status = com.luxeway.enums.BookingStatus.COMPLETED")
    java.math.BigDecimal sumRevenueByOwnerId(@Param("ownerId") String ownerId);

    @Query("SELECT SUM(b.total) FROM Booking b WHERE b.status = com.luxeway.enums.BookingStatus.COMPLETED")
    java.math.BigDecimal sumTotalRevenue();

    @Query("SELECT COUNT(DISTINCT b.vehicle.id) FROM Booking b WHERE b.status = com.luxeway.enums.BookingStatus.COMPLETED OR b.status = com.luxeway.enums.BookingStatus.IN_RENTAL")
    long countDistinctBookedVehicles();
}
