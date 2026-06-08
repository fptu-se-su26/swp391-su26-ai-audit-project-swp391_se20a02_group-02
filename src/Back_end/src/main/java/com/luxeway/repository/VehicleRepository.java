package com.luxeway.repository;

import com.luxeway.entity.Vehicle;
import com.luxeway.enums.VehicleCategory;
import com.luxeway.enums.VehicleStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.luxeway.enums.FuelType;
import com.luxeway.enums.TransmissionType;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;


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
    
    // Pessimistic lock — dùng trước khi tạo booking để tránh double-booking race condition
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Vehicle v WHERE v.id = :id")
    Optional<Vehicle> findByIdForUpdate(@Param("id") String id);

    
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

    // Multi-select filter: supports multiple categories and brands
    @Query("SELECT v FROM Vehicle v WHERE " +
           "(:location IS NULL OR LOWER(v.city) LIKE LOWER(CONCAT('%', :location, '%')) OR LOWER(v.country) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:#{#categories == null || #categories.isEmpty()} = true OR v.category IN :categories) AND " +
           "(:#{#brands == null || #brands.isEmpty()} = true OR LOWER(v.brand) IN :brands) AND " +
           "(:minPrice IS NULL OR v.pricePerDay >= :minPrice) AND " +
           "(:maxPrice IS NULL OR v.pricePerDay <= :maxPrice) AND " +
           "(:minSeats IS NULL OR v.seats >= :minSeats) AND " +
           "(:transmission IS NULL OR v.transmission = :transmission) AND " +
           "(:fuelType IS NULL OR v.fuelType = :fuelType) AND " +
           "(:minRating IS NULL OR v.rating >= :minRating) AND " +
           "(:isFeatured = false OR v.isFeatured = true) AND " +
           "(:instantBook = false OR v.instantBook = true) AND " +
           "(:deliveryAvailable = false OR v.deliveryAvailable = true) AND " +
           "(:vehicleType IS NULL OR v.vehicleType = :vehicleType) AND " +
           "(:minEngineCc IS NULL OR v.engineCc >= :minEngineCc) AND " +
           "(:maxEngineCc IS NULL OR v.engineCc <= :maxEngineCc) AND " +
           "(:hasHelmet = false OR v.hasHelmet = true) AND " +
           "(:hasPhoneHolder = false OR v.hasPhoneHolder = true) AND " +
           "(:hasRaincoat = false OR v.hasRaincoat = true) AND " +
           "(:hasTouringPackage = false OR v.hasTouringPackage = true) AND " +
           "(:hasChauffeur = false OR v.hasChauffeur = true) AND " +
           "(:airportDelivery = false OR v.airportDelivery = true) AND " +
           "(:weddingRental = false OR v.weddingRental = true) AND " +
           "(:businessRental = false OR v.businessRental = true) AND " +
           "(:startDate IS NULL OR :endDate IS NULL OR NOT EXISTS (" +
           "  SELECT b FROM Booking b WHERE b.vehicle.id = v.id AND " +
           "  b.status IN (com.luxeway.enums.BookingStatus.PENDING, com.luxeway.enums.BookingStatus.CONFIRMED, com.luxeway.enums.BookingStatus.ACTIVE) AND " +
           "  b.startDate <= :endDate AND b.endDate >= :startDate" +
           ")) AND " +
           "v.status = 'AVAILABLE'")
    Page<Vehicle> filterVehiclesMulti(@Param("location") String location,
                                      @Param("categories") List<VehicleCategory> categories,
                                      @Param("brands") List<String> brands,
                                      @Param("minPrice") BigDecimal minPrice,
                                      @Param("maxPrice") BigDecimal maxPrice,
                                      @Param("minSeats") Integer minSeats,
                                      @Param("transmission") TransmissionType transmission,
                                      @Param("fuelType") FuelType fuelType,
                                      @Param("minRating") Double minRating,
                                      @Param("isFeatured") boolean isFeatured,
                                      @Param("instantBook") boolean instantBook,
                                      @Param("deliveryAvailable") boolean deliveryAvailable,
                                      @Param("vehicleType") com.luxeway.enums.VehicleType vehicleType,
                                      @Param("minEngineCc") Integer minEngineCc,
                                      @Param("maxEngineCc") Integer maxEngineCc,
                                      @Param("hasHelmet") boolean hasHelmet,
                                      @Param("hasPhoneHolder") boolean hasPhoneHolder,
                                      @Param("hasRaincoat") boolean hasRaincoat,
                                      @Param("hasTouringPackage") boolean hasTouringPackage,
                                      @Param("hasChauffeur") boolean hasChauffeur,
                                      @Param("airportDelivery") boolean airportDelivery,
                                      @Param("weddingRental") boolean weddingRental,
                                      @Param("businessRental") boolean businessRental,
                                      @Param("startDate") java.time.LocalDate startDate,
                                      @Param("endDate") java.time.LocalDate endDate,
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