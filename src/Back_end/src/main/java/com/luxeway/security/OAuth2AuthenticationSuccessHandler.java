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
        if (response.isCommitted()) {
            log.debug("Response has already been committed. Unable to redirect.");
            return;
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new ServletException("Email not found from Google provider");
        }
        email = email.trim().toLowerCase();

        String name = oAuth2User.getAttribute("name");
        String givenName = oAuth2User.getAttribute("given_name");
        String familyName = oAuth2User.getAttribute("family_name");
        String picture = oAuth2User.getAttribute("picture");

        String firstName = givenName != null ? givenName : (name != null ? name : "Google");
        String lastName = familyName != null ? familyName : "User";

        String providerId = oAuth2User.getAttribute("sub");
        if (providerId == null) {
            providerId = oAuth2User.getName();
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            if (user.getAvatar() == null || user.getAvatar().isBlank()) {
                user.setAvatar(picture);
            }
            if ("LOCAL".equals(user.getProvider()) || user.getProvider() == null) {
                user.setProvider("GOOGLE");
                user.setProviderId(providerId);
            }
            user.setLastActive(java.time.LocalDateTime.now());
            user = userRepository.save(user);
            log.info("Google OAuth success handler: linked existing user {}", email);
        } else {
            user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .firstName(firstName)
                    .lastName(lastName)
                    .displayName(firstName + " " + lastName)
                    .avatar(picture)
                    .role(UserRole.CUSTOMER)
                    .verified(true)
                    .kycVerified(false)
                    .drivingLicenseVerified(false)
                    .isActive(true)
                    .provider("GOOGLE")
                    .providerId(providerId)
                    .build();
            user = userRepository.save(user);
            log.info("Google OAuth success handler: registered new user {}", email);
        }

        String accessToken = jwtTokenProvider.generateToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("token", accessToken)
                .queryParam("refresh_token", refreshToken)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
