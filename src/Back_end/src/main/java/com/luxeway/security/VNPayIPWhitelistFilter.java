package com.luxeway.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Security filter to whitelist VNPay callback IPs
 * Prevents unauthorized payment callback requests
 */
@Slf4j
@Component
public class VNPayIPWhitelistFilter extends OncePerRequestFilter {

    @Value("${payment.vnpay.allowed-ips:}")
    private String allowedIpsConfig;

    private Set<String> allowedIPs;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        
        // Only apply to VNPay callback endpoints
        if (!requestURI.contains("/payments/vnpay/callback")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Initialize allowed IPs set lazily
        if (allowedIPs == null) {
            initializeAllowedIPs();
        }

        // Get client IP (considering proxy headers)
        String clientIP = getClientIP(request);
        
        log.debug("VNPay callback request from IP: {}", clientIP);

        // In development mode (empty config), allow all IPs
        if (allowedIPs.isEmpty()) {
            log.warn("VNPay IP whitelist is empty - allowing all IPs (DEV MODE)");
            filterChain.doFilter(request, response);
            return;
        }

        // Check if IP is whitelisted
        if (!allowedIPs.contains(clientIP)) {
            log.error("SECURITY: Blocked VNPay callback from unauthorized IP: {}", clientIP);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"Forbidden\",\"message\":\"IP not whitelisted\"}");
            return;
        }

        log.info("VNPay callback from whitelisted IP: {}", clientIP);
        filterChain.doFilter(request, response);
    }

    private void initializeAllowedIPs() {
        allowedIPs = new HashSet<>();
        if (allowedIpsConfig != null && !allowedIpsConfig.isBlank()) {
            allowedIPs.addAll(Arrays.asList(allowedIpsConfig.split(",")));
            // Trim whitespace
            allowedIPs = allowedIPs.stream()
                    .map(String::trim)
                    .filter(ip -> !ip.isEmpty())
                    .collect(java.util.stream.Collectors.toSet());
        }
        log.info("VNPay IP whitelist initialized with {} IPs", allowedIPs.size());
    }

    /**
     * Extract client IP considering proxy headers
     */
    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            // X-Forwarded-For can contain multiple IPs, take the first one
            int commaIndex = ip.indexOf(',');
            if (commaIndex > 0) {
                ip = ip.substring(0, commaIndex);
            }
            return ip.trim();
        }

        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.trim();
        }

        return request.getRemoteAddr();
    }
}
