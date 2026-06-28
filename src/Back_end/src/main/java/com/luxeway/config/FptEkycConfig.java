package com.luxeway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for FPT.AI eKYC API.
 */
@Configuration
@ConfigurationProperties(prefix = "fpt.ekyc")
@Data
public class FptEkycConfig {
    
    private String apiKey;
    
    private String idrUrl;
    
    private String faceMatchUrl;
}
