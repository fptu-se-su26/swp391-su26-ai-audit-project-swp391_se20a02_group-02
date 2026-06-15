package com.luxeway.service;

import com.luxeway.entity.HelpArticle;
import com.luxeway.entity.HelpCategory;
import com.luxeway.repository.HelpArticleRepository;
import com.luxeway.repository.HelpCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class HelpService {

    private final HelpCategoryRepository categoryRepository;
    private final HelpArticleRepository articleRepository;

    // ====== Public: list all active categories ======
    public List<Map<String, Object>> getCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::mapCategory)
                .collect(Collectors.toList());
    }

    // ====== Public: get articles by category slug ======
    public List<Map<String, Object>> getArticlesByCategory(String slug) {
        HelpCategory cat = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found: " + slug));
        return articleRepository
                .findByCategoryIdAndIsPublishedTrueOrderByDisplayOrderAsc(cat.getId())
                .stream()
                .map(this::mapArticleSummary)
                .collect(Collectors.toList());
    }

    // ====== Public: get full article and increment view count ======
    @Transactional
    public Map<String, Object> getArticle(Long id) {
        HelpArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found: " + id));
        if (Boolean.FALSE.equals(article.getIsPublished())) {
            throw new RuntimeException("Article not published");
        }
        // Increment view count
        article.setViewCount(article.getViewCount() + 1);
        articleRepository.save(article);
        return mapArticleFull(article);
    }

    // ====== Public: search articles by keyword ======
    public List<Map<String, Object>> searchArticles(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }
        return articleRepository.searchByKeyword(keyword.trim())
                .stream()
                .map(this::mapArticleSummary)
                .collect(Collectors.toList());
    }

    // ====== Admin: create category ======
    @Transactional
    public HelpCategory createCategory(HelpCategory category) {
        return categoryRepository.save(category);
    }

    // ====== Admin: create article ======
    @Transactional
    public HelpArticle createArticle(HelpArticle article) {
        HelpArticle saved = articleRepository.save(article);
        // Refresh denormalised count
        refreshArticleCount(article.getCategory().getId());
        return saved;
    }

    // ======= Private mapping helpers =======

    private Map<String, Object> mapCategory(HelpCategory cat) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", cat.getId());
        m.put("slug", cat.getSlug());
        m.put("title", cat.getTitle());
        m.put("description", cat.getDescription());
        m.put("icon", cat.getIcon());
        m.put("displayOrder", cat.getDisplayOrder());
        // Use live count for accuracy
        long liveCount = articleRepository.countByCategoryIdAndIsPublishedTrue(cat.getId());
        m.put("articleCount", liveCount);
        return m;
    }

    private Map<String, Object> mapArticleSummary(HelpArticle a) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", a.getId());
        m.put("title", a.getTitle());
        m.put("tags", a.getTags());
        m.put("viewCount", a.getViewCount());
        m.put("displayOrder", a.getDisplayOrder());
        m.put("categorySlug", a.getCategory() != null ? a.getCategory().getSlug() : null);
        m.put("categoryTitle", a.getCategory() != null ? a.getCategory().getTitle() : null);
        // Include first 200 chars as excerpt
        String content = a.getContent() != null ? a.getContent() : "";
        m.put("excerpt", content.length() > 200 ? content.substring(0, 200) + "…" : content);
        m.put("createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : null);
        m.put("updatedAt", a.getUpdatedAt() != null ? a.getUpdatedAt().toString() : null);
        return m;
    }

    private Map<String, Object> mapArticleFull(HelpArticle a) {
        Map<String, Object> m = mapArticleSummary(a);
        m.put("content", a.getContent());
        return m;
    }

    private void refreshArticleCount(Long categoryId) {
        try {
            long count = articleRepository.countByCategoryIdAndIsPublishedTrue(categoryId);
            categoryRepository.findById(categoryId).ifPresent(cat -> {
                cat.setArticleCount((int) count);
                categoryRepository.save(cat);
            });
        } catch (Exception e) {
            log.warn("Failed to refresh article count for category {}: {}", categoryId, e.getMessage());
        }
    }
}
