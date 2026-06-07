package com.luxeway.repository;

import com.luxeway.entity.MotorbikeAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface MotorbikeAnalyticsRepository extends JpaRepository<MotorbikeAnalytics, String> {
    Optional<MotorbikeAnalytics> findByDate(LocalDate date);
}
