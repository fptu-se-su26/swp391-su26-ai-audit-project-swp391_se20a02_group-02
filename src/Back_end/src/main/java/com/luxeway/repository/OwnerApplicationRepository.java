package com.luxeway.repository;

import com.luxeway.entity.OwnerApplication;
import com.luxeway.enums.OwnerApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OwnerApplicationRepository extends JpaRepository<OwnerApplication, String> {
    
    Optional<OwnerApplication> findByUserIdAndStatusNotIn(String userId, List<OwnerApplicationStatus> statuses);

    List<OwnerApplication> findByUserId(String userId);

    long countByStatus(OwnerApplicationStatus status);

    List<OwnerApplication> findByStatus(OwnerApplicationStatus status);

    @Query("SELECT o FROM OwnerApplication o WHERE " +
           "(:status IS NULL OR o.status = :status) " +
           "ORDER BY o.createdAt DESC")
    Page<OwnerApplication> findAllWithFilters(@Param("status") OwnerApplicationStatus status, Pageable pageable);
}
