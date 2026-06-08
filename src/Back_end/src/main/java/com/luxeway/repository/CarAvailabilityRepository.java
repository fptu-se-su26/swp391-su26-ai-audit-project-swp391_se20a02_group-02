package com.luxeway.repository;

import com.luxeway.entity.CarAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarAvailabilityRepository extends JpaRepository<CarAvailability, String> {
}
