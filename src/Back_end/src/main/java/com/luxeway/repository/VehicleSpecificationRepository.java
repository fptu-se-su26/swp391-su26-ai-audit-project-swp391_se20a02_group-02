package com.luxeway.repository;

import com.luxeway.entity.VehicleSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleSpecificationRepository extends JpaRepository<VehicleSpecification, String> {
}
