package com.luxeway.repository;

import com.luxeway.entity.FAQItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FAQItemRepository extends JpaRepository<FAQItem, String> {
    List<FAQItem> findByCategoryIdAndIsActiveTrueOrderByDisplayOrderAsc(Integer categoryId);
    List<FAQItem> findByIsActiveTrueOrderByDisplayOrderAsc();
}
