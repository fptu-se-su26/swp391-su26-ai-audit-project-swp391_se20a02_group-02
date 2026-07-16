package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_priorities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportPriority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 20)
    private String name; // LOW, NORMAL, HIGH, URGENT, EMERGENCY

    @Column(name = "priority_value", nullable = false)
    @Builder.Default
    private Integer priorityValue = 1;

    @Column(name = "response_time_hours", nullable = false)
    @Builder.Default
    private Integer responseTimeHours = 24;

    @Column(name = "resolution_time_hours", nullable = false)
    @Builder.Default
    private Integer resolutionTimeHours = 72;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
