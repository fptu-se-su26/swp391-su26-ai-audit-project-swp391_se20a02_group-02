package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.service.HelpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Public Help Center endpoints — no authentication required.
 * Effective URLs (with WebConfig /api/v1 prefix):
 *   GET /api/v1/help/categories
 *   GET /api/v1/help/categories/{slug}/articles
 *   GET /api/v1/help/articles/{id}
 *   GET /api/v1/help/search?q=...
 */
@RestController
@RequestMapping("/help")
@RequiredArgsConstructor
@Tag(name = "Help Center", description = "Public Knowledge Base endpoints for the Help Center page")
public class HelpController {

    private final HelpService helpService;

    @GetMapping("/categories")
    @Operation(summary = "Get all active help categories ordered by displayOrder")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success("Categories fetched", helpService.getCategories()));
    }

    @GetMapping("/categories/{slug}/articles")
    @Operation(summary = "Get all published articles for a category by slug")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getArticlesByCategory(
            @PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success("Articles fetched",
                helpService.getArticlesByCategory(slug)));
    }

    @GetMapping("/articles/{id}")
    @Operation(summary = "Get a single article by ID (increments view count)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getArticle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Article fetched", helpService.getArticle(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Full-text search across all published help articles")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> search(
            @RequestParam(required = false, defaultValue = "") String q) {
        return ResponseEntity.ok(ApiResponse.success("Search results",
                helpService.searchArticles(q)));
    }
}
