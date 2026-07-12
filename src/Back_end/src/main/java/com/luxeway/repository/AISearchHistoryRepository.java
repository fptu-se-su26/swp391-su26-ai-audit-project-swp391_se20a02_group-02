package com.luxeway.repository;

import com.luxeway.entity.AISearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AISearchHistoryRepository extends JpaRepository<AISearchHistory, String> {
    List<AISearchHistory> findByUserIdOrderBySearchedAtDesc(String userId);
}
