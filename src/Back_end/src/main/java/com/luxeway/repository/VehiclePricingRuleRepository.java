package com.luxeway.repository;

import com.luxeway.entity.VehiclePricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehiclePricingRuleRepository extends JpaRepository<VehiclePricingRule, String> {
    List<VehiclePricingRule> findByVehicleId(String vehicleId);
}
