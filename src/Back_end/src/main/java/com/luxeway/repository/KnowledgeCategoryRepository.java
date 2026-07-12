package com.luxeway.repository;

import com.luxeway.entity.KnowledgeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeCategoryRepository extends JpaRepository<KnowledgeCategory, Integer> {
    Optional<KnowledgeCategory> findBySlug(String slug);
    List<KnowledgeCategory> findByParentIdIsNullOrderByDisplayOrderAsc();
}
