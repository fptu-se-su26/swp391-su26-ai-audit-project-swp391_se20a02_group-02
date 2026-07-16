package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_search_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AISearchHistory {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @Column(nullable = false, length = 500)
    private String query;

    @Column(name = "searched_at", nullable = false, updatable = false)
    @CreatedDate
    private LocalDateTime searchedAt;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (searchedAt == null) {
            searchedAt = LocalDateTime.now();
        }
    }
}
