package com.luxeway.repository;

import com.luxeway.entity.Vehicle;
import com.luxeway.enums.VehicleCategory;
import com.luxeway.enums.VehicleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.luxeway.enums.FuelType;
import com.luxeway.enums.TransmissionType;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    
    // Basic queries
    List<Vehicle> findByStatus(VehicleStatus status);
    
    Page<Vehicle> findByStatus(VehicleStatus status, Pageable pageable);
    
    List<Vehicle> findByOwnerId(String ownerId);
    
    List<Vehicle> findByOwnerIdOrderByCreatedAtDesc(String ownerId);
    
    Page<Vehicle> findByOwnerId(String ownerId, Pageable pageable);
    
    List<Vehicle> findByOwnerIdAndStatus(String ownerId, VehicleStatus status);
    
    Page<Vehicle> findByStatusOrderByCreatedAtDesc(VehicleStatus status, Pageable pageable);
    
    List<Vehicle> findByIsFeaturedTrueAndStatusOrderByRatingDesc(VehicleStatus status);
    
    // Category and location
    List<Vehicle> findByCategory(VehicleCategory category);
    
    List<Vehicle> findByCityContainingIgnoreCase(String city);
    
    Page<Vehicle> findByCategoryAndStatus(VehicleCategory category, VehicleStatus status, Pageable pageable);
    
    // Price range
    @Query("SELECT v FROM Vehicle v WHERE v.pricePerDay BETWEEN :minPrice AND :maxPrice AND v.status = :status")
    Page<Vehicle> findByPriceRange(@Param("minPrice") BigDecimal minPrice, 
                                   @Param("maxPrice") BigDecimal maxPrice, 
                                   @Param("status") VehicleStatus status, 
                                   Pageable pageable);
    
    // Search
    @Query("SELECT v FROM Vehicle v WHERE " +
           "(LOWER(v.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.model) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "v.status = :status")
    Page<Vehicle> searchVehicles(@Param("keyword") String keyword, 
                                @Param("status") VehicleStatus status, 
                                Pageable pageable);
                                
    @Query("SELECT v FROM Vehicle v WHERE " +
           "LOWER(v.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.model) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Vehicle> searchVehicles(@Param("keyword") String keyword, 
                                Pageable pageable);
                                
    @Query("SELECT v FROM Vehicle v WHERE " +
           "(:location IS NULL OR LOWER(v.city) LIKE LOWER(CONCAT('%', :location, '%')) OR LOWER(v.country) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:category IS NULL OR v.category = :category) AND " +
           "(:minPrice IS NULL OR v.pricePerDay >= :minPrice) AND " +
           "(:maxPrice IS NULL OR v.pricePerDay <= :maxPrice) AND " +
           "(:minSeats IS NULL OR v.seats >= :minSeats) AND " +
           "(:transmission IS NULL OR v.transmission = :transmission) AND " +
           "(:fuelType IS NULL OR v.fuelType = :fuelType) AND " +
           "(:minRating IS NULL OR v.rating >= :minRating) AND " +
           "(:isFeatured = false OR v.isFeatured = :isFeatured) AND " +
           "(:instantBook = false OR v.instantBook = :instantBook) AND " +
           "(:deliveryAvailable = false OR v.deliveryAvailable = :deliveryAvailable) AND " +
           "v.status = 'AVAILABLE'")
    Page<Vehicle> filterVehicles(@Param("location") String location,
                                 @Param("category") VehicleCategory category,
                                 @Param("minPrice") BigDecimal minPrice,
                                 @Param("maxPrice") BigDecimal maxPrice,
                                 @Param("minSeats") Integer minSeats,
                                 @Param("transmission") TransmissionType transmission,
                                 @Param("fuelType") FuelType fuelType,
                                 @Param("minRating") Double minRating,
                                 @Param("isFeatured") boolean isFeatured,
                                 @Param("instantBook") boolean instantBook,
                                 @Param("deliveryAvailable") boolean deliveryAvailable,
                                 Pageable pageable);
    
    // Statistics
    long countByCategoryAndStatus(VehicleCategory category, VehicleStatus status);
    
    long countByStatus(VehicleStatus status);
    
    long countByOwnerId(String ownerId);
    
    @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.owner.id = :ownerId AND v.status = :status")
    long countByOwnerIdAndStatus(@Param("ownerId") String ownerId, @Param("status") VehicleStatus status);

    @Query("SELECT COUNT(DISTINCT v.city) FROM Vehicle v")
    long countDistinctCity();

    @Query("SELECT v.city, COUNT(v) FROM Vehicle v GROUP BY v.city ORDER BY COUNT(v) DESC")
    List<Object[]> findTopCities(Pageable pageable);
}