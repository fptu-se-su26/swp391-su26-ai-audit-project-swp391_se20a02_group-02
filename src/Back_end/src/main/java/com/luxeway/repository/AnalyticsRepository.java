package com.luxeway.repository;

import com.luxeway.entity.Analytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnalyticsRepository extends JpaRepository<Analytics, String> {

    Optional<Analytics> findByRecordDate(LocalDate recordDate);

    List<Analytics> findByRecordDateBetweenOrderByRecordDateAsc(LocalDate startDate, LocalDate endDate);
}
