package com.luxeway.repository;

import com.luxeway.entity.HelpCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HelpCategoryRepository extends JpaRepository<HelpCategory, Long> {

    List<HelpCategory> findByIsActiveTrueOrderByDisplayOrderAsc();

    Optional<HelpCategory> findBySlug(String slug);
}
