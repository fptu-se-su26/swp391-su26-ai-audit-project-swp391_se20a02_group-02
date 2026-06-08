package com.luxeway.service;

import com.luxeway.dto.auth.AuthDTOs;
import com.luxeway.entity.User;
import com.luxeway.enums.UserRole;
import com.luxeway.repository.UserRepository;
import com.luxeway.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    // Security Attempt Stores
    private final java.util.Map<String, Integer> loginFailures = new java.util.concurrent.ConcurrentHashMap<>();
    private final java.util.Map<String, java.time.LocalDateTime> blockTimes = new java.util.concurrent.ConcurrentHashMap<>();
    private final java.util.Map<String, java.time.LocalDateTime> lastOtpRequestTime = new java.util.concurrent.ConcurrentHashMap<>();

    // ====== Login ======

    @Transactional
    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Brute force check: temporary lockout for 15 minutes if 5 successive failures
        java.time.LocalDateTime blockUntil = blockTimes.get(email);
        if (blockUntil != null) {
            if (java.time.LocalDateTime.now().isBefore(blockUntil)) {
                long minutesLeft = java.time.temporal.ChronoUnit.MINUTES.between(java.time.LocalDateTime.now(), blockUntil) + 1;
                throw new RuntimeException("Account temporarily locked due to multiple login failures. Try again in " + minutesLeft + " minutes.");
            } else {
                blockTimes.remove(email);
                loginFailures.remove(email);
            }
        }

        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            User user = (User) auth.getPrincipal();

            // Clear login failure counts on success
            loginFailures.remove(email);

            // Update last active
            user.setLastActive(java.time.LocalDateTime.now());
            userRepository.save(user);

            String accessToken  = jwtTokenProvider.generateToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            log.info("User logged in: {}", user.getEmail());
            return buildAuthResponse(user, accessToken, refreshToken);

        } catch (BadCredentialsException e) {
            int attempts = loginFailures.merge(email, 1, Integer::sum);
            // BR-3: Lock account after 6 consecutive failed login attempts for 30 minutes
            if (attempts >= 6) {
                blockTimes.put(email, java.time.LocalDateTime.now().plusMinutes(30));
                loginFailures.remove(email);
                throw new RuntimeException("Invalid credentials. Maximum attempts exceeded: Account locked for 30 minutes.");
            }
            throw new RuntimeException("Invalid email or password. Attempt " + attempts + " of 6.");
        }
    }

    // ====== Register ======

    @Transactional
    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
            if (role == UserRole.ADMIN) role = UserRole.CUSTOMER; // Cannot self-register as admin
        } catch (IllegalArgumentException e) {
            role = UserRole.CUSTOMER;
        }

        // DEV MODE: Auto-verify user on registration (no email verification step).
        // PRODUCTION: Set verified=false and send a confirmation email via JavaMailSender.
        // Check environment via Spring profiles to determine behavior
        boolean isDevelopment = true; // TODO: Inject @Value("${spring.profiles.active}") to check profile
        
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(role)
                .accountType(request.getAccountType() != null ? request.getAccountType() : "INDIVIDUAL")
                .companyName(request.getCompanyName())
                .verified(isDevelopment)   // Auto-verify only in development
                .kycVerified(false)
                .drivingLicenseVerified(false)
                .isActive(true)
                .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "en")
                .build();

        user = userRepository.save(user);

        String accessToken  = jwtTokenProvider.generateToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        log.info("New user registered: {} (role={})", user.getEmail(), user.getRole());
        try {
            emailService.sendEmailVerification(user.getEmail(), user.getFirstName());
        } catch (Exception e) {
            log.warn("Failed to send welcome verification email: {}", e.getMessage());
        }
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    // ====== Change Password ======

    @Transactional
    public void changePassword(String userId, AuthDTOs.ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", userId);
    }

    // ====== Get Current User ======

    public User getCurrentUser(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new RuntimeException("User not found or inactive"));
    }

    // ====== Forgot Password, Verify OTP, Reset Password Workflow ======

    private static class OtpData {
        final String otp;
        final java.time.LocalDateTime expiry;

        OtpData(String otp, java.time.LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }

    private static class ResetTokenData {
        final String email;
        final java.time.LocalDateTime expiry;

        ResetTokenData(String email, java.time.LocalDateTime expiry) {
            this.email = email;
            this.expiry = expiry;
        }
    }

    private final java.util.Map<String, OtpData> otpStore = new java.util.concurrent.ConcurrentHashMap<>();
    private final java.util.Map<String, ResetTokenData> resetTokenStore = new java.util.concurrent.ConcurrentHashMap<>();
    private final java.security.SecureRandom secureRandom = new java.security.SecureRandom();

    @Transactional
    public void processForgotPassword(AuthDTOs.ForgotPasswordRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email is not registered"));

        // OTP Rate Limiting: 1 request per minute per email
        java.time.LocalDateTime lastRequest = lastOtpRequestTime.get(email);
        if (lastRequest != null && java.time.LocalDateTime.now().isBefore(lastRequest.plusMinutes(1))) {
            long secondsLeft = 60 - java.time.temporal.ChronoUnit.SECONDS.between(lastRequest, java.time.LocalDateTime.now());
            throw new RuntimeException("Please wait " + secondsLeft + " seconds before requesting another OTP.");
        }
        lastOtpRequestTime.put(email, java.time.LocalDateTime.now());

        // Generate dynamic secure 6-digit OTP code
        int otpNum = 100000 + secureRandom.nextInt(900000);
        String otpCode = String.valueOf(otpNum);

        // Standard 5 minutes expiry
        java.time.LocalDateTime expiry = java.time.LocalDateTime.now().plusMinutes(5);
        otpStore.put(email, new OtpData(otpCode, expiry));

        // SECURITY: Only log OTP in DEBUG mode for development
        // In production (INFO/WARN level), this will not be logged
        log.debug("==================================================");
        log.debug("LUXEWAY SECURE OTP DISPATCH SYSTEM");
        log.debug("RECIPIENT EMAIL: {}", email);
        log.debug("SECURITY OTP CODE: {}", otpCode);
        log.debug("VALID FOR: 5 MINUTES (Expires at {})", expiry);
        log.debug("==================================================");
        
        log.info("OTP sent to email: {}", email);

        // Generate transient secure reset token for direct link
        String resetToken = java.util.UUID.randomUUID().toString();
        // Reset token valid for 15 minutes
        resetTokenStore.put(resetToken, new ResetTokenData(email, java.time.LocalDateTime.now().plusMinutes(15)));

        String resetLink = "http://localhost:5173/auth/otp?token=" + resetToken + "&email=" 
                + java.net.URLEncoder.encode(email, java.nio.charset.StandardCharsets.UTF_8);

        // Dispatch real SMTP emails via EmailService
        emailService.sendOtp(email, otpCode);
        emailService.sendPasswordResetLink(email, resetLink);
    }

    public String verifyOtp(AuthDTOs.VerifyOtpRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        String enteredOtp = req.getOtp().trim();

        OtpData otpData = otpStore.get(email);
        if (otpData == null) {
            throw new RuntimeException("Invalid OTP session or email context");
        }

        if (java.time.LocalDateTime.now().isAfter(otpData.expiry)) {
            otpStore.remove(email);
            throw new RuntimeException("OTP code has expired. Please request a new one");
        }

        if (!otpData.otp.equals(enteredOtp)) {
            throw new RuntimeException("Incorrect OTP code. Please verify and try again");
        }

        // OTP is verified - invalidate it instantly (one-time usage)
        otpStore.remove(email);

        // Generate transient secure reset token
        String resetToken = java.util.UUID.randomUUID().toString();
        // Reset token valid for 15 minutes
        resetTokenStore.put(resetToken, new ResetTokenData(email, java.time.LocalDateTime.now().plusMinutes(15)));

        log.info("OTP verification successful for {}. Issued reset token: {}", email, resetToken);
        return resetToken;
    }

    @Transactional
    public void resetPassword(AuthDTOs.ResetPasswordRequest req) {
        String token = req.getToken().trim();
        ResetTokenData tokenData = resetTokenStore.get(token);

        if (tokenData == null) {
            throw new RuntimeException("Invalid password reset token context");
        }

        if (java.time.LocalDateTime.now().isAfter(tokenData.expiry)) {
            resetTokenStore.remove(token);
            throw new RuntimeException("Reset token has expired. Please request a new OTP code");
        }

        User user = userRepository.findByEmail(tokenData.email)
                .orElseThrow(() -> new RuntimeException("User account associated with this token not found"));

        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new RuntimeException("Password confirmation does not match the new password");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        // Invalidate transient reset token immediately
        resetTokenStore.remove(token);
        log.info("Password successfully reset for account: {}", tokenData.email);
        try {
            emailService.sendPasswordResetSuccess(user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send password reset success email: {}", e.getMessage());
        }
    }

    // ====== Private Helpers ======

    private AuthDTOs.AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        AuthDTOs.AuthResponse.UserInfo userInfo = new AuthDTOs.AuthResponse.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setEmail(user.getEmail());
        userInfo.setFirstName(user.getFirstName());
        userInfo.setLastName(user.getLastName());
        userInfo.setDisplayName(user.getDisplayName());
        userInfo.setAvatar(user.getAvatar());
        userInfo.setRole(user.getRole().name().toLowerCase());
        userInfo.setAccountType(user.getAccountType());
        userInfo.setVerified(user.getVerified());
        userInfo.setKycVerified(user.getKycVerified());
        userInfo.setWalletBalance(user.getWalletBalance());
        userInfo.setPreferredLanguage(user.getPreferredLanguage());

        AuthDTOs.AuthResponse response = new AuthDTOs.AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(86400);
        response.setUser(userInfo);
        return response;
    }

    @Transactional
    public AuthDTOs.AuthResponse refreshAccessToken(AuthDTOs.TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken().trim();
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        String email = jwtTokenProvider.extractUsername(refreshToken);
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new RuntimeException("User associated with this token not found or inactive"));

        String newAccessToken = jwtTokenProvider.generateToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

        log.info("Token refreshed successfully for user: {}", email);
        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Transactional
    public AuthDTOs.AuthResponse googleLogin(AuthDTOs.GoogleLoginRequest request) {
        String idToken = request.getIdToken();
        
        java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
        java.net.http.HttpRequest httpRequest = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken))
                .GET()
                .build();
        
        try {
            java.net.http.HttpResponse<String> httpResponse = client.send(httpRequest, java.net.http.HttpResponse.BodyHandlers.ofString());
            if (httpResponse.statusCode() != 200) {
                throw new RuntimeException("Google token verification failed: " + httpResponse.body());
            }
            
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, Object> payload = mapper.readValue(httpResponse.body(), new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {});
            
            String email = ((String) payload.get("email")).trim().toLowerCase();
            String emailVerifiedStr = String.valueOf(payload.get("email_verified"));
            boolean emailVerified = "true".equalsIgnoreCase(emailVerifiedStr);
            
            if (!emailVerified) {
                throw new RuntimeException("Google email is not verified");
            }
            
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");
            if (firstName == null) firstName = (String) payload.get("name");
            if (firstName == null) firstName = "Google";
            if (lastName == null) lastName = "User";
            
            String picture = (String) payload.get("picture");
            
            String providerId = (String) payload.get("sub");

            java.util.Optional<User> existingUser = userRepository.findByEmail(email);
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
                log.info("Google OAuth login: linked existing user {}", email);
            } else {
                user = User.builder()
                        .email(email)
                        .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
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
                log.info("Google OAuth registration: created new user {}", email);
            }
            
            String accessToken = jwtTokenProvider.generateToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);
            
            return buildAuthResponse(user, accessToken, refreshToken);
            
        } catch (Exception e) {
            log.error("Google login failed", e);
            throw new RuntimeException("Google Sign-In failed: " + e.getMessage());
        }
    }
}
