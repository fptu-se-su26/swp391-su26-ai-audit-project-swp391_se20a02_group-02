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

    // ====== Login ======

    @Transactional
    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = (User) auth.getPrincipal();

            // Update last active
            user.setLastActive(java.time.LocalDateTime.now());
            userRepository.save(user);

            String accessToken  = jwtTokenProvider.generateToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            log.info("User logged in: {}", user.getEmail());
            return buildAuthResponse(user, accessToken, refreshToken);

        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
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
        // In production, set verified=false and send a confirmation email via JavaMailSender.
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(role)
                .accountType(request.getAccountType() != null ? request.getAccountType() : "INDIVIDUAL")
                .companyName(request.getCompanyName())
                .verified(true)   // auto-verified in dev mode
                .kycVerified(false)
                .drivingLicenseVerified(false)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        String accessToken  = jwtTokenProvider.generateToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        log.info("New user registered: {} (role={})", user.getEmail(), user.getRole());
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

    @Transactional(readOnly = true)
    public void processForgotPassword(AuthDTOs.ForgotPasswordRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email is not registered"));

        // Generate dynamic secure 6-digit OTP code
        int otpNum = 100000 + secureRandom.nextInt(900000);
        String otpCode = String.valueOf(otpNum);

        // Standard 5 minutes expiry
        java.time.LocalDateTime expiry = java.time.LocalDateTime.now().plusMinutes(5);
        otpStore.put(email, new OtpData(otpCode, expiry));

        // DEV / STAGING LOG EXPOSURE AS REQUESTED
        log.info("==================================================");
        log.info("LUXEWAY SECURE OTP DISPATCH SYSTEM");
        log.info("RECIPIENT EMAIL: {}", email);
        log.info("SECURITY OTP CODE: {}", otpCode);
        log.info("VALID FOR: 5 MINUTES (Expires at {})", expiry);
        log.info("==================================================");

        // Dispatch real SMTP email via EmailService
        emailService.sendOtp(email, otpCode);
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
        // Reset token valid for 10 minutes
        resetTokenStore.put(resetToken, new ResetTokenData(email, java.time.LocalDateTime.now().plusMinutes(10)));

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

        AuthDTOs.AuthResponse response = new AuthDTOs.AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(86400);
        response.setUser(userInfo);
        return response;
    }
}
