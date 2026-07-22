package com.luxeway.security;

import com.luxeway.entity.User;
import com.luxeway.enums.UserRole;
import com.luxeway.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@org.springframework.context.annotation.Lazy
@SuppressWarnings("all")
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            if (response.isCommitted()) {
                log.debug("Response has already been committed. Unable to redirect.");
                return;
            }

            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");
            if (email == null || email.isBlank()) {
                throw new IllegalStateException("Email not found from Google provider");
            }
            email = email.trim().toLowerCase();

            String name = oAuth2User.getAttribute("name");
            String givenName = oAuth2User.getAttribute("given_name");
            String familyName = oAuth2User.getAttribute("family_name");
            String picture = oAuth2User.getAttribute("picture");

            String firstName = truncate(nonBlank(givenName, nonBlank(name, "Google")), 100);
            String lastName = truncate(nonBlank(familyName, "User"), 100);
            String displayName = truncate((firstName + " " + lastName).trim(), 200);
            picture = truncate(picture, 500);

            String providerId = oAuth2User.getAttribute("sub");
            if (providerId == null || providerId.isBlank()) {
                providerId = oAuth2User.getName();
            }
            providerId = truncate(providerId, 200);

            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            if (existingUser.isPresent()) {
                user = existingUser.get();
                if (Boolean.FALSE.equals(user.getIsActive())) {
                    String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                            .queryParam("error", "account_disabled")
                            .queryParam("error_description", "This LuxeWay account is disabled. Please contact support.")
                            .build().toUriString();
                    getRedirectStrategy().sendRedirect(request, response, targetUrl);
                    return;
                }
                if (user.getAvatar() == null || user.getAvatar().isBlank()) {
                    user.setAvatar(picture);
                }
                if (user.getProvider() == null || "LOCAL".equalsIgnoreCase(user.getProvider())) {
                    user.setProvider("GOOGLE");
                    user.setProviderId(providerId);
                }
                user.setLastActive(now);
                normalizeOAuthUserDefaults(user, now);
                user = userRepository.saveAndFlush(user);
                log.info("Google OAuth success handler: linked existing user {}", email);
            } else {
                user = User.builder()
                        .email(email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .firstName(firstName)
                        .lastName(lastName)
                        .displayName(displayName)
                        .avatar(picture)
                        .role(UserRole.CUSTOMER)
                        .verified(true)
                        .kycVerified(false)
                        .drivingLicenseVerified(false)
                        .kycStatus("NOT_UPLOADED")
                        .driverLicenseStatus("NOT_UPLOADED")
                        .isActive(true)
                        .provider("GOOGLE")
                        .providerId(providerId)
                        .preferredLanguage("en")
                        .preferredCurrency("VND")
                        .joinedAt(now)
                        .lastActive(now)
                        .createdAt(now)
                        .updatedAt(now)
                        .build();
                normalizeOAuthUserDefaults(user, now);
                user = userRepository.saveAndFlush(user);
                log.info("Google OAuth success handler: registered new user {}", email);
            }

            String accessToken = jwtTokenProvider.generateToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                    .queryParam("token", accessToken)
                    .queryParam("refresh_token", refreshToken)
                    .build().toUriString();

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception exception) {
            log.error("Google OAuth success handler failed after provider authentication", exception);
            String diagnostic = exception.getClass().getSimpleName();
            String message = exception.getMessage();
            if (message != null && !message.isBlank()) {
                message = message.replaceAll("[\\r\\n\\t]+", " ").trim();
                if (message.length() > 180) {
                    message = message.substring(0, 180);
                }
                diagnostic = diagnostic + ": " + message;
            }
            String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                    .queryParam("error", "oauth_server_error")
                    .queryParam("error_description", "Google login reached LuxeWay but the server could not finish account sign-in. Diagnostic: " + diagnostic)
                    .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
    }

    private static void normalizeOAuthUserDefaults(User user, java.time.LocalDateTime now) {
        if (user.getId() == null || user.getId().isBlank()) {
            user.setId(UUID.randomUUID().toString());
        }
        if (user.getFirstName() == null || user.getFirstName().isBlank()) {
            user.setFirstName("Google");
        }
        if (user.getLastName() == null || user.getLastName().isBlank()) {
            user.setLastName("User");
        }
        if (user.getDisplayName() == null || user.getDisplayName().isBlank()) {
            user.setDisplayName(truncate((nonBlank(user.getFirstName(), "Google") + " " + nonBlank(user.getLastName(), "User")).trim(), 200));
        }
        if (user.getRole() == null) {
            user.setRole(UserRole.CUSTOMER);
        }
        if (user.getVerified() == null) {
            user.setVerified(true);
        }
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }
        if (user.getKycVerified() == null) {
            user.setKycVerified(false);
        }
        if (user.getDrivingLicenseVerified() == null) {
            user.setDrivingLicenseVerified(false);
        }
        if (user.getKycStatus() == null || user.getKycStatus().isBlank()) {
            user.setKycStatus("NOT_UPLOADED");
        }
        if (user.getDriverLicenseStatus() == null || user.getDriverLicenseStatus().isBlank()) {
            user.setDriverLicenseStatus("NOT_UPLOADED");
        }
        if (user.getProvider() == null || user.getProvider().isBlank()) {
            user.setProvider("GOOGLE");
        }
        if (user.getPreferredLanguage() == null || user.getPreferredLanguage().isBlank()) {
            user.setPreferredLanguage("en");
        }
        if (user.getPreferredCurrency() == null || user.getPreferredCurrency().isBlank()) {
            user.setPreferredCurrency("VND");
        }
        if (user.getEmailBookingNotifications() == null) {
            user.setEmailBookingNotifications(true);
        }
        if (user.getEmailReviewNotifications() == null) {
            user.setEmailReviewNotifications(true);
        }
        if (user.getEmailMarketingNotifications() == null) {
            user.setEmailMarketingNotifications(false);
        }
        if (user.getPushNotifications() == null) {
            user.setPushNotifications(true);
        }
        if (user.getOwnerPayoutEnabled() == null) {
            user.setOwnerPayoutEnabled(false);
        }
        if (user.getSecurityTwoFactorEnabled() == null) {
            user.setSecurityTwoFactorEnabled(false);
        }
        if (user.getWalletBalance() == null) {
            user.setWalletBalance(BigDecimal.ZERO);
        }
        if (user.getRating() == null) {
            user.setRating(BigDecimal.ZERO);
        }
        if (user.getTotalReviews() == null) {
            user.setTotalReviews(0);
        }
        if (user.getTotalRentals() == null) {
            user.setTotalRentals(0);
        }
        if (user.getAccountType() == null || user.getAccountType().isBlank()) {
            user.setAccountType("INDIVIDUAL");
        }
        if (user.getJoinedAt() == null) {
            user.setJoinedAt(now);
        }
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(now);
        }
        user.setUpdatedAt(now);
        user.setLastActive(now);
    }

    private static String nonBlank(String value, String fallback) {
        return value != null && !value.isBlank() ? value.trim() : fallback;
    }

    private static String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }
}
