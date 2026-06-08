package com.luxeway.repository;

import com.luxeway.entity.MotorbikeAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MotorbikeAvailabilityRepository extends JpaRepository<MotorbikeAvailability, String> {
}
