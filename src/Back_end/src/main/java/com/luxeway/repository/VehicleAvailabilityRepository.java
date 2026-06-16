package com.luxeway.repository;

import com.luxeway.entity.VehicleAvailability;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VehicleAvailabilityRepository extends JpaRepository<VehicleAvailability, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT va FROM VehicleAvailability va WHERE va.vehicle.id = :vehicleId AND va.date BETWEEN :start AND :end")
    List<VehicleAvailability> findAvailabilityForUpdate(
        @Param("vehicleId") String vehicleId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    List<VehicleAvailability> findByVehicleIdAndDateBetween(String vehicleId, LocalDate start, LocalDate end);

    @Query("SELECT va FROM VehicleAvailability va WHERE va.vehicle.id = :vehicleId " +
           "AND va.date BETWEEN :start AND :end " +
           "AND va.isAvailable = false " +
           "AND (va.lockedUntil IS NULL OR (va.lockedUntil > :now AND va.lockedBy <> :userId))")
    List<VehicleAvailability> findConflictingLocks(
        @Param("vehicleId") String vehicleId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end,
        @Param("now") java.time.LocalDateTime now,
        @Param("userId") String userId
    );
}
