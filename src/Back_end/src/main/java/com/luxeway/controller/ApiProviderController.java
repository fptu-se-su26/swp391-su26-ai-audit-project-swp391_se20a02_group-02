package com.luxeway.controller;

import com.luxeway.entity.ApiProvider;
import com.luxeway.service.ApiProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admin/providers")
@RequiredArgsConstructor
public class ApiProviderController {

    private final ApiProviderService apiProviderService;

    /**
     * Lấy tất cả providers
     */
    @GetMapping
    public ResponseEntity<List<ApiProvider>> getAllProviders() {
        List<ApiProvider> providers = apiProviderService.getAllProviders();
        return ResponseEntity.ok(providers);
    }

    /**
     * Lấy tất cả active providers
     */
    @GetMapping("/active")
    public ResponseEntity<List<ApiProvider>> getActiveProviders() {
        List<ApiProvider> providers = apiProviderService.getAllActiveProviders();
        return ResponseEntity.ok(providers);
    }

    /**
     * Lấy provider theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiProvider> getProviderById(@PathVariable String id) {
        Optional<ApiProvider> provider = apiProviderService.getProviderById(id);
        return provider.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Lấy provider theo tên
     */
    @GetMapping("/name/{providerName}")
    public ResponseEntity<ApiProvider> getProviderByName(@PathVariable String providerName) {
        Optional<ApiProvider> provider = apiProviderService.getProviderByName(providerName);
        return provider.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Lấy providers theo loại
     */
    @GetMapping("/type/{providerType}")
    public ResponseEntity<List<ApiProvider>> getProvidersByType(@PathVariable String providerType) {
        List<ApiProvider> providers = apiProviderService.getProvidersByType(providerType);
        return ResponseEntity.ok(providers);
    }

    /**
     * Lấy active providers theo loại
     */
    @GetMapping("/type/{providerType}/active")
    public ResponseEntity<List<ApiProvider>> getActiveProvidersByType(@PathVariable String providerType) {
        List<ApiProvider> providers = apiProviderService.getActiveProvidersByType(providerType);
        return ResponseEntity.ok(providers);
    }

    /**
     * Lấy primary provider của một loại
     */
    @GetMapping("/type/{providerType}/primary")
    public ResponseEntity<ApiProvider> getPrimaryProvider(@PathVariable String providerType) {
        Optional<ApiProvider> provider = apiProviderService.getPrimaryProvider(providerType);
        return provider.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Tạo provider mới
     */
    @PostMapping
    public ResponseEntity<ApiProvider> createProvider(@RequestBody ApiProvider apiProvider) {
        ApiProvider created = apiProviderService.createProvider(apiProvider);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Cập nhật provider
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiProvider> updateProvider(
            @PathVariable String id,
            @RequestBody ApiProvider apiProvider) {
        try {
            ApiProvider updated = apiProviderService.updateProvider(id, apiProvider);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Xóa provider
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProvider(@PathVariable String id) {
        apiProviderService.deleteProvider(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Kiểm tra sức khỏe provider
     */
    @GetMapping("/{id}/health")
    public ResponseEntity<?> checkProviderHealth(@PathVariable String id) {
        Optional<ApiProvider> provider = apiProviderService.getProviderById(id);
        if (provider.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ApiProvider p = provider.get();
        return ResponseEntity.ok(new ProviderHealthResponse(
                p.getId(),
                p.getProviderName(),
                p.getIsActive(),
                p.getLastErrorMessage(),
                p.getLastErrorTime()
        ));
    }

    /**
     * Response DTO cho health check
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ProviderHealthResponse {
        private String id;
        private String providerName;
        private Boolean isActive;
        private String lastErrorMessage;
        private java.time.LocalDateTime lastErrorTime;
    }
}
