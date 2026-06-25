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
@SuppressWarnings("all")
public class VNPayIPWhitelistFilter extends OncePerRequestFilter {

    @Value("${payment.vnpay.allowed-ips:}")
    private String allowedIpsConfig;

    private Set<String> allowedIPs;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // VNPay has been replaced by MoMo — this filter is now a no-op.
        filterChain.doFilter(request, response);
    }
}
