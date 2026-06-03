package com.luxeway.repository;

import com.luxeway.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, String> {

    @Query("SELECT p FROM Promotion p WHERE p.active = true " +
           "AND (p.startDate IS NULL OR p.startDate <= :now) " +
           "AND (p.endDate IS NULL OR p.endDate >= :now) " +
           "ORDER BY p.displayOrder ASC, p.createdAt DESC")
    List<Promotion> findActivePromotions(@org.springframework.data.repository.query.Param("now") LocalDateTime now);

    List<Promotion> findByActiveOrderByDisplayOrderAsc(Boolean active);
}
