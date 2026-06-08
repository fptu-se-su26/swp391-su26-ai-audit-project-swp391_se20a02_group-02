package com.luxeway.repository;

import com.luxeway.entity.CarAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface CarAnalyticsRepository extends JpaRepository<CarAnalytics, String> {
    Optional<CarAnalytics> findByDate(LocalDate date);
}
