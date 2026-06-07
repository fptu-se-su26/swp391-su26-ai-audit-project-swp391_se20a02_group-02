package com.luxeway.repository;

import com.luxeway.entity.Motorbike;
import com.luxeway.enums.VehicleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.List;

@Repository
public interface MotorbikeRepository extends JpaRepository<Motorbike, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM Motorbike m WHERE m.id = :id")
    Optional<Motorbike> findByIdForUpdate(@Param("id") String id);

    List<Motorbike> findByOwnerId(String ownerId);
    
    List<Motorbike> findByIsFeaturedTrueAndStatus(VehicleStatus status);
    
    Page<Motorbike> findByStatus(VehicleStatus status, Pageable pageable);

    @Query("SELECT m FROM Motorbike m " +
           "JOIN FETCH m.specification s " +
           "JOIN FETCH m.location l " +
           "JOIN FETCH m.model mo " +
           "JOIN FETCH mo.brand b " +
           "WHERE m.status = 'AVAILABLE' AND " +
           "(:city IS NULL OR LOWER(l.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:engineCc IS NULL OR s.engineCc = :engineCc) AND " +
           "(:transmission IS NULL OR s.transmission = :transmission) AND " +
           "(:helmetIncluded IS NULL OR s.helmetIncluded = :helmetIncluded) AND " +
           "(:raincoatIncluded IS NULL OR s.raincoatIncluded = :raincoatIncluded) AND " +
           "(:phoneHolder IS NULL OR s.phoneHolder = :phoneHolder) AND " +
           "(:luggageRack IS NULL OR s.luggageRack = :luggageRack)")
    Page<Motorbike> searchMotorbikes(
        @Param("city") String city,
        @Param("engineCc") Integer engineCc,
        @Param("transmission") com.luxeway.enums.TransmissionType transmission,
        @Param("helmetIncluded") Boolean helmetIncluded,
        @Param("raincoatIncluded") Boolean raincoatIncluded,
        @Param("phoneHolder") Boolean phoneHolder,
        @Param("luggageRack") Boolean luggageRack,
        Pageable pageable
    );
}
