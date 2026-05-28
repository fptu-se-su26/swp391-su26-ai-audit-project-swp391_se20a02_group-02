package com.luxeway.repository;

import com.luxeway.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {

    Page<Review> findByVehicleIdOrderByCreatedAtDesc(String vehicleId, Pageable pageable);

    Page<Review> findByOwnerIdOrderByCreatedAtDesc(String ownerId, Pageable pageable);

    Optional<Review> findByBookingId(String bookingId);

    boolean existsByBookingId(String bookingId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.vehicle.id = :vehicleId")
    Double findAverageRatingByVehicleId(@Param("vehicleId") String vehicleId);

    long countByVehicleId(String vehicleId);
    
    @Query("SELECT AVG(r.rating) FROM Review r")
    Double getAverageRating();

    Page<Review> findByRatingGreaterThanEqualOrderByCreatedAtDesc(Integer rating, Pageable pageable);
}
