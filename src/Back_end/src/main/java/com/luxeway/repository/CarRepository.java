package com.luxeway.repository;

import com.luxeway.entity.Car;
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
public interface CarRepository extends JpaRepository<Car, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Car c WHERE c.id = :id")
    Optional<Car> findByIdForUpdate(@Param("id") String id);

    List<Car> findByOwnerId(String ownerId);

    
    List<Car> findByIsFeaturedTrueAndStatus(VehicleStatus status);
    
    Page<Car> findByStatus(VehicleStatus status, Pageable pageable);

    @Query("SELECT c FROM Car c " +
           "JOIN FETCH c.specification s " +
           "JOIN FETCH c.location l " +
           "JOIN FETCH c.model m " +
           "JOIN FETCH m.brand b " +
           "WHERE c.status = 'AVAILABLE' AND " +
           "(:city IS NULL OR LOWER(l.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:seats IS NULL OR s.seats = :seats) AND " +
           "(:transmission IS NULL OR s.transmission = :transmission) AND " +
           "(:fuelType IS NULL OR s.fuelType = :fuelType) AND " +
           "(:hasChauffeur IS NULL OR s.hasChauffeur = :hasChauffeur) AND " +
           "(:airportDelivery IS NULL OR s.airportDelivery = :airportDelivery) AND " +
           "(:electric IS NULL OR s.electric = :electric) AND " +
           "(:hybrid IS NULL OR s.hybrid = :hybrid)")
    Page<Car> searchCars(
        @Param("city") String city,
        @Param("seats") Integer seats,
        @Param("transmission") com.luxeway.enums.TransmissionType transmission,
        @Param("fuelType") com.luxeway.enums.FuelType fuelType,
        @Param("hasChauffeur") Boolean hasChauffeur,
        @Param("airportDelivery") Boolean airportDelivery,
        @Param("electric") Boolean electric,
        @Param("hybrid") Boolean hybrid,
        Pageable pageable
    );
}
