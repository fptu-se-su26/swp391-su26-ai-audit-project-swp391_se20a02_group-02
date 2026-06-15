package com.luxeway.repository;

import com.luxeway.entity.KnowledgeArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, String> {
    Optional<KnowledgeArticle> findBySlug(String slug);
    List<KnowledgeArticle> findByCategoryIdAndIsPublishedTrueOrderByTitleAsc(Integer categoryId);
    List<KnowledgeArticle> findByIsFeaturedTrueAndIsPublishedTrue();
    List<KnowledgeArticle> findByIsPopularTrueAndIsPublishedTrue();

    @Query("SELECT a FROM KnowledgeArticle a WHERE a.category.slug = :categorySlug AND a.isPublished = true")
    List<KnowledgeArticle> findByCategorySlug(@Param("categorySlug") String categorySlug);

    @Query("SELECT a FROM KnowledgeArticle a WHERE " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.content) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.excerpt) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "a.isPublished = true")
    List<KnowledgeArticle> searchArticles(@Param("q") String q);
}
