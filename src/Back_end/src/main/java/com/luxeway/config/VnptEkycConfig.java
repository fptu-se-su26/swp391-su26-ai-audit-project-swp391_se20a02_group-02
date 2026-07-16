package com.luxeway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for VNPT eKYC IDCheck integration.
 * Values are loaded from application.yml under the "vnpt.ekyc" prefix.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "vnpt.ekyc")
public class VnptEkycConfig {

    /**
     * Base URL of the VNPT eKYC API.
     */
    private String baseUrl = "https://ekyc.vnpt.vn";

    /**
     * Token ID provided by VNPT for API authentication.
     */
    private String tokenId;

    /**
     * Token Key (RSA public key) provided by VNPT for API authentication.
     */
    private String tokenKey;

    /**
     * Access Token (Bearer JWT) for authorizing API requests.
     */
    private String accessToken;

    /**
     * Public Key CA for verifying VNPT responses.
     */
    private String publicKeyCa;
}
