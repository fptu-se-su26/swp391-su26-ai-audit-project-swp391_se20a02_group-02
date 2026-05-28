package com.luxeway.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiProviderDTO {
    private String id;
    private String providerName;
    private String providerType;
    private String baseUrl;
    private String apiKey;
    private String secretKey;
    private String username;
    private String password;
    private String additionalConfig;
    private Boolean isActive;
    private Boolean isPrimary;
    private String description;
    private String webhookUrl;
    private Integer retryAttempts;
    private Integer timeoutSeconds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String lastErrorMessage;
    private LocalDateTime lastErrorTime;
}
