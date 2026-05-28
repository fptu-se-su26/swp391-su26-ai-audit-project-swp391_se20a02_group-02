package com.luxeway.repository;

import com.luxeway.entity.ApiProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiProviderRepository extends JpaRepository<ApiProvider, String> {
    
    Optional<ApiProvider> findByProviderName(String providerName);
    
    List<ApiProvider> findByProviderType(String providerType);
    
    List<ApiProvider> findByProviderTypeAndIsActiveTrue(String providerType);
    
    Optional<ApiProvider> findByProviderTypeAndIsPrimaryTrue(String providerType);
    
    List<ApiProvider> findByIsActiveTrue();
}
