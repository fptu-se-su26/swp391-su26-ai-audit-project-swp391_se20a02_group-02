package com.luxeway.repository;

import com.luxeway.entity.AIRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIRecommendationRepository extends JpaRepository<AIRecommendation, String> {
    List<AIRecommendation> findByUserIdOrderByRecommendedAtDesc(String userId);
}
