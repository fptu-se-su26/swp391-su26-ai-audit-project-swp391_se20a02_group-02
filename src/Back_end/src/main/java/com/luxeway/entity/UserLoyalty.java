package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_loyalty")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLoyalty {
    @Id
    @Column(name = "user_id", length = 36)
    private String userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private Integer points = 0;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String tier = "SILVER"; // SILVER, GOLD, PLATINUM, DIAMOND

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
