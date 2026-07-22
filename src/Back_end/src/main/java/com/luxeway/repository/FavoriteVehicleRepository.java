package com.luxeway.repository;

import com.luxeway.entity.FavoriteVehicle;
import com.luxeway.entity.FavoriteVehicleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteVehicleRepository extends JpaRepository<FavoriteVehicle, FavoriteVehicleId> {
    List<FavoriteVehicle> findByUserId(String userId);
    boolean existsByUserIdAndVehicleId(String userId, String vehicleId);
    void deleteByUserIdAndVehicleId(String userId, String vehicleId);
}
