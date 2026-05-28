package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "api_providers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ApiProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String providerName;

    @Column(nullable = false, length = 50)
    private String providerType; // KYC, PAYMENT, SMS, EMAIL, etc.

    @Column(nullable = false, length = 500)
    private String baseUrl;

    @Column(nullable = false, length = 500)
    private String apiKey;

    @Column(length = 500)
    private String secretKey;

    @Column(length = 500)
    private String username;

    @Column(length = 500)
    private String password;

    @Column(length = 2000)
    private String additionalConfig; // JSON config cho các param khác

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean isPrimary = false; // Nếu có nhiều provider cùng loại, đánh dấu provider chính

    @Column(length = 500)
    private String description;

    @Column(length = 500)
    private String webhookUrl;

    @Column(nullable = false)
    private Integer retryAttempts = 3;

    @Column(nullable = false)
    private Integer timeoutSeconds = 30;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(length = 500)
    private String lastErrorMessage;

    @Column
    private LocalDateTime lastErrorTime;
}
