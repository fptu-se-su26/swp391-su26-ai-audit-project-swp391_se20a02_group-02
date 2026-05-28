package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews",
       uniqueConstraints = @UniqueConstraint(columnNames = "booking_id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Review {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonIgnore
    private Vehicle vehicle;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    @JsonIgnore
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    @JsonIgnore
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    private User owner;

    @Column(nullable = false)
    @NotNull
    @Min(1) @Max(5)
    private Integer rating;

    @Column(nullable = false)
    @NotNull
    @Min(1) @Max(5)
    private Integer cleanliness;

    @Column(nullable = false)
    @NotNull
    @Min(1) @Max(5)
    private Integer accuracy;

    @Column(nullable = false)
    @NotNull
    @Min(1) @Max(5)
    private Integer communication;

    @Column(name = "value_rating", nullable = false)
    @NotNull
    @Min(1) @Max(5)
    private Integer valueRating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "owner_response", columnDefinition = "TEXT")
    private String ownerResponse;

    @Column
    @Builder.Default
    private Integer helpful = 0;

    @Column(name = "created_at", nullable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    public double getAverageRating() {
        return (rating + cleanliness + accuracy + communication + valueRating) / 5.0;
    }

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
