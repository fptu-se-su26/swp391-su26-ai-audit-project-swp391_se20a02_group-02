package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "faq_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FAQCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(length = 500)
    private String description;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;
}
