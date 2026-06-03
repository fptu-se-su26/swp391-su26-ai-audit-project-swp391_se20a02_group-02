package com.luxeway.repository;

import com.luxeway.entity.HelpArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelpArticleRepository extends JpaRepository<HelpArticle, Long> {

    List<HelpArticle> findByCategoryIdAndIsPublishedTrueOrderByDisplayOrderAsc(Long categoryId);

    @Query("SELECT a FROM HelpArticle a WHERE a.isPublished = true AND (" +
           "LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.tags) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<HelpArticle> searchByKeyword(@Param("keyword") String keyword);

    long countByCategoryIdAndIsPublishedTrue(Long categoryId);
}
