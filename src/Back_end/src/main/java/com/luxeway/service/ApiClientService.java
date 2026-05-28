package com.luxeway.service;

import com.luxeway.entity.ApiProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiClientService {

    private final ApiProviderService apiProviderService;
    private final RestTemplate restTemplate;

    /**
     * Gọi API provider bằng cách đọc config từ database
     * Sử dụng cho KYC, Payment, SMS, Email, etc.
     */
    public ResponseEntity<?> callProvider(String providerType, String endpoint, 
                                          HttpMethod method, Object requestBody) 
            throws Exception {
        // Lấy provider chính của loại này
        Optional<ApiProvider> provider = apiProviderService.getPrimaryProvider(providerType);
        if (provider.isEmpty()) {
            throw new RuntimeException("No active provider found for type: " + providerType);
        }

        return callProvider(provider.get(), endpoint, method, requestBody);
    }

    /**
     * Gọi API với provider cụ thể
     */
    public ResponseEntity<?> callProvider(ApiProvider provider, String endpoint,
                                          HttpMethod method, Object requestBody) 
            throws Exception {
        if (!provider.getIsActive()) {
            throw new RuntimeException("Provider " + provider.getProviderName() + " is inactive");
        }

        String fullUrl = provider.getBaseUrl() + endpoint;
        
        try {
            HttpHeaders headers = buildHeaders(provider);
            HttpEntity<?> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<?> response = restTemplate.exchange(
                    fullUrl,
                    method,
                    entity,
                    Object.class
            );

            // Clear error nếu thành công
            apiProviderService.clearProviderError(provider.getId());
            log.info("Successfully called provider {}: {}", provider.getProviderName(), fullUrl);
            
            return response;

        } catch (RestClientException e) {
            String errorMsg = "Failed to call " + provider.getProviderName() + ": " + e.getMessage();
            apiProviderService.recordProviderError(provider.getId(), errorMsg);
            log.error(errorMsg, e);
            throw new Exception(errorMsg, e);
        }
    }

    /**
     * Gọi KYC provider
     */
    public ResponseEntity<?> callKYCProvider(String endpoint, HttpMethod method, Object requestBody) 
            throws Exception {
        return callProvider("KYC", endpoint, method, requestBody);
    }

    /**
     * Gọi Payment provider
     */
    public ResponseEntity<?> callPaymentProvider(String endpoint, HttpMethod method, Object requestBody) 
            throws Exception {
        return callProvider("PAYMENT", endpoint, method, requestBody);
    }

    /**
     * Gọi Email provider
     */
    public ResponseEntity<?> callEmailProvider(String endpoint, HttpMethod method, Object requestBody) 
            throws Exception {
        return callProvider("EMAIL", endpoint, method, requestBody);
    }

    /**
     * Gọi SMS provider
     */
    public ResponseEntity<?> callSmsProvider(String endpoint, HttpMethod method, Object requestBody) 
            throws Exception {
        return callProvider("SMS", endpoint, method, requestBody);
    }

    /**
     * Build HTTP headers từ provider config
     * Hỗ trợ: Basic Auth, Bearer Token, Custom Headers
     */
    private HttpHeaders buildHeaders(ApiProvider provider) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Bearer Token
        if (provider.getSecretKey() != null && !provider.getSecretKey().isEmpty()) {
            headers.setBearerAuth(provider.getSecretKey());
        }
        // Hoặc API Key header
        else if (provider.getApiKey() != null && !provider.getApiKey().isEmpty()) {
            headers.set("X-API-Key", provider.getApiKey());
            // Nếu là Stripe hoặc tương tự
            if ("PAYMENT".equals(provider.getProviderType())) {
                headers.set("Authorization", "Bearer " + provider.getApiKey());
            }
        }
        // Basic Auth
        if (provider.getUsername() != null && provider.getPassword() != null) {
            String auth = provider.getUsername() + ":" + provider.getPassword();
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            headers.set("Authorization", "Basic " + encodedAuth);
        }

        return headers;
    }

    /**
     * Retry logic - gọi lại nếu fail
     */
    public ResponseEntity<?> callProviderWithRetry(ApiProvider provider, String endpoint,
                                                   HttpMethod method, Object requestBody) 
            throws Exception {
        int retries = provider.getRetryAttempts() != null ? provider.getRetryAttempts() : 3;
        Exception lastException = null;

        for (int attempt = 1; attempt <= retries; attempt++) {
            try {
                log.info("Calling provider {} (attempt {}/{})", provider.getProviderName(), attempt, retries);
                return callProvider(provider, endpoint, method, requestBody);
            } catch (Exception e) {
                lastException = e;
                log.warn("Attempt {} failed: {}", attempt, e.getMessage());
                
                if (attempt < retries) {
                    // Exponential backoff: wait 1s, 2s, 4s...
                    long waitTime = (long) Math.pow(2, attempt - 1) * 1000;
                    Thread.sleep(waitTime);
                }
            }
        }

        throw new Exception("All retry attempts failed for provider " + provider.getProviderName(), lastException);
    }
}
