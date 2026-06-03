package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "help_articles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class HelpArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private HelpCategory category;

    @Column(nullable = false, length = 300)
    private String title;

    /**
     * Rich text / HTML content of the article.
     * Stored as plain text; frontend renders it via dangerouslySetInnerHTML or a markdown renderer.
     */
    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String content;

    /** Comma-separated tags for filtering / search boost */
    @Column(length = 500)
    private String tags;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = true;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "created_at", updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
