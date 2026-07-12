package com.luxeway.repository;

import com.luxeway.entity.FAQCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FAQCategoryRepository extends JpaRepository<FAQCategory, Integer> {
    Optional<FAQCategory> findBySlug(String slug);
    List<FAQCategory> findAllByOrderByDisplayOrderAsc();
}
