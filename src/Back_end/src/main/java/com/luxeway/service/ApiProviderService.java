package com.luxeway.service;

import com.luxeway.entity.ApiProvider;
import com.luxeway.repository.ApiProviderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ApiProviderService {

    private final ApiProviderRepository apiProviderRepository;

    /**
     * Lấy provider theo tên
     */
    public Optional<ApiProvider> getProviderByName(String providerName) {
        return apiProviderRepository.findByProviderName(providerName);
    }

    /**
     * Lấy provider chính của một loại (KYC, PAYMENT, etc.)
     */
    public Optional<ApiProvider> getPrimaryProvider(String providerType) {
        return apiProviderRepository.findByProviderTypeAndIsPrimaryTrue(providerType);
    }

    /**
     * Lấy tất cả provider active của một loại
     */
    public List<ApiProvider> getActiveProvidersByType(String providerType) {
        return apiProviderRepository.findByProviderTypeAndIsActiveTrue(providerType);
    }

    /**
     * Lấy tất cả provider của một loại (active hoặc inactive)
     */
    public List<ApiProvider> getProvidersByType(String providerType) {
        return apiProviderRepository.findByProviderType(providerType);
    }

    /**
     * Lấy tất cả provider active
     */
    public List<ApiProvider> getAllActiveProviders() {
        return apiProviderRepository.findByIsActiveTrue();
    }

    /**
     * Tạo provider mới
     */
    public ApiProvider createProvider(ApiProvider apiProvider) {
        // Nếu này là provider chính, thì unset các provider chính cũ của cùng loại
        if (apiProvider.getIsPrimary()) {
            apiProviderRepository.findByProviderTypeAndIsPrimaryTrue(apiProvider.getProviderType())
                    .ifPresent(existing -> {
                        existing.setIsPrimary(false);
                        apiProviderRepository.save(existing);
                    });
        }
        return apiProviderRepository.save(apiProvider);
    }

    /**
     * Cập nhật provider
     */
    public ApiProvider updateProvider(String id, ApiProvider updatedProvider) {
        ApiProvider provider = apiProviderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        if (updatedProvider.getProviderName() != null) {
            provider.setProviderName(updatedProvider.getProviderName());
        }
        if (updatedProvider.getBaseUrl() != null) {
            provider.setBaseUrl(updatedProvider.getBaseUrl());
        }
        if (updatedProvider.getApiKey() != null) {
            provider.setApiKey(updatedProvider.getApiKey());
        }
        if (updatedProvider.getSecretKey() != null) {
            provider.setSecretKey(updatedProvider.getSecretKey());
        }
        if (updatedProvider.getUsername() != null) {
            provider.setUsername(updatedProvider.getUsername());
        }
        if (updatedProvider.getPassword() != null) {
            provider.setPassword(updatedProvider.getPassword());
        }
        if (updatedProvider.getAdditionalConfig() != null) {
            provider.setAdditionalConfig(updatedProvider.getAdditionalConfig());
        }
        if (updatedProvider.getIsActive() != null) {
            provider.setIsActive(updatedProvider.getIsActive());
        }
        if (updatedProvider.getIsPrimary() != null && updatedProvider.getIsPrimary()) {
            // Nếu set làm primary, unset các cái khác
            apiProviderRepository.findByProviderTypeAndIsPrimaryTrue(provider.getProviderType())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            existing.setIsPrimary(false);
                            apiProviderRepository.save(existing);
                        }
                    });
            provider.setIsPrimary(true);
        } else if (updatedProvider.getIsPrimary() != null) {
            provider.setIsPrimary(false);
        }
        if (updatedProvider.getDescription() != null) {
            provider.setDescription(updatedProvider.getDescription());
        }
        if (updatedProvider.getWebhookUrl() != null) {
            provider.setWebhookUrl(updatedProvider.getWebhookUrl());
        }
        if (updatedProvider.getRetryAttempts() != null) {
            provider.setRetryAttempts(updatedProvider.getRetryAttempts());
        }
        if (updatedProvider.getTimeoutSeconds() != null) {
            provider.setTimeoutSeconds(updatedProvider.getTimeoutSeconds());
        }

        return apiProviderRepository.save(provider);
    }

    /**
     * Xóa provider
     */
    public void deleteProvider(String id) {
        apiProviderRepository.deleteById(id);
    }

    /**
     * Lấy provider theo ID
     */
    public Optional<ApiProvider> getProviderById(String id) {
        return apiProviderRepository.findById(id);
    }

    /**
     * Lấy tất cả provider
     */
    public List<ApiProvider> getAllProviders() {
        return apiProviderRepository.findAll();
    }

    /**
     * Ghi lỗi provider
     */
    public void recordProviderError(String providerId, String errorMessage) {
        apiProviderRepository.findById(providerId).ifPresent(provider -> {
            provider.setLastErrorMessage(errorMessage);
            provider.setLastErrorTime(LocalDateTime.now());
            apiProviderRepository.save(provider);
            log.error("Provider {} error: {}", provider.getProviderName(), errorMessage);
        });
    }

    /**
     * Clear lỗi provider
     */
    public void clearProviderError(String providerId) {
        apiProviderRepository.findById(providerId).ifPresent(provider -> {
            provider.setLastErrorMessage(null);
            provider.setLastErrorTime(null);
            apiProviderRepository.save(provider);
        });
    }

    /**
     * Kiểm tra provider có hoạt động không
     */
    public boolean isProviderHealthy(String providerId) {
        return apiProviderRepository.findById(providerId)
                .map(provider -> provider.getIsActive() && provider.getLastErrorTime() == null)
                .orElse(false);
    }
}
