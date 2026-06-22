package com.luxeway.repository;

import com.luxeway.entity.PricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PricingRuleRepository extends JpaRepository<PricingRule, String> {
    List<PricingRule> findByVehicleIdAndIsActiveTrue(String vehicleId);
    List<PricingRule> findByVehicleId(String vehicleId);
}
