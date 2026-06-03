package com.luxeway.repository;

import com.luxeway.entity.DestinationAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DestinationAnalyticsRepository extends JpaRepository<DestinationAnalytics, String> {

    List<DestinationAnalytics> findByActiveOrderByDisplayOrderAsc(Boolean active);
}
