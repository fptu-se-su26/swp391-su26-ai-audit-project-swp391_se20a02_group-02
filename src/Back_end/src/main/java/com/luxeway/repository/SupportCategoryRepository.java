package com.luxeway.repository;

import com.luxeway.entity.SupportCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupportCategoryRepository extends JpaRepository<SupportCategory, Integer> {
    Optional<SupportCategory> findByName(String name);
    List<SupportCategory> findByIsActiveTrue();
}
