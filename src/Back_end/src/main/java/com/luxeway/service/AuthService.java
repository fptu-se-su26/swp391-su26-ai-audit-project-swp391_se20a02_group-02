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

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(role)
                .accountType(request.getAccountType() != null ? request.getAccountType() : "INDIVIDUAL")
                .companyName(request.getCompanyName())
                .verified(false)
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
