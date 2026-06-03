package com.luxeway.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "review_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewImage {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @NotBlank
    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }
}
