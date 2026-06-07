package com.luxeway.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Handles OAuth2 authentication failures (e.g., invalid client credentials, user denied access).
 * Redirects back to the frontend login page with an error parameter so the UI can display
 * a clear error message instead of showing a blank/crash page.
 */
@Component
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        log.error("OAuth2 authentication failed: {}", exception.getMessage(), exception);

        String errorType = "authentication_failed";
        String errorMessage = exception.getMessage();

        // Identify specific error types for better user feedback
        if (errorMessage != null) {
            if (errorMessage.contains("invalid_client") || errorMessage.contains("client_id")) {
                errorType = "invalid_client";
                errorMessage = "Google OAuth is not configured. Please use email/password login.";
            } else if (errorMessage.contains("access_denied")) {
                errorType = "access_denied";
                errorMessage = "Google login was cancelled or access was denied.";
            } else if (errorMessage.contains("invalid_grant")) {
                errorType = "invalid_grant";
                errorMessage = "Google authorization code expired. Please try again.";
            }
        }

        String targetUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("error", errorType)
                .queryParam("error_description", URLEncoder.encode(
                        errorMessage != null ? errorMessage : "Authentication failed",
                        StandardCharsets.UTF_8))
                .build().toUriString();

        log.info("Redirecting to frontend with OAuth2 error: {} -> {}", errorType, targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
