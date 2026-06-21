package com.luxeway.repository;

import com.luxeway.entity.VehicleAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleAddonRepository extends JpaRepository<VehicleAddon, String> {
    List<VehicleAddon> findByVehicleIdAndIsActiveTrue(String vehicleId);
    List<VehicleAddon> findByVehicleId(String vehicleId);
}
