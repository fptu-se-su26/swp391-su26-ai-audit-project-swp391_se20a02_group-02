package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.dto.auth.AuthDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, Register, and account management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login with email and password, returns JWT token")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> login(
            @Valid @RequestBody AuthDTOs.LoginRequest request) {
        AuthDTOs.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new account (customer or owner)")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> register(
            @Valid @RequestBody AuthDTOs.RegisterRequest request) {
        AuthDTOs.AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse.UserInfo>> me(
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }
        AuthDTOs.AuthResponse.UserInfo info = new AuthDTOs.AuthResponse.UserInfo();
        info.setId(user.getId());
        info.setEmail(user.getEmail());
        info.setFirstName(user.getFirstName());
        info.setLastName(user.getLastName());
        info.setDisplayName(user.getDisplayName());
        info.setAvatar(user.getAvatar());
        info.setRole(user.getRole().name().toLowerCase());
        info.setAccountType(user.getAccountType());
        info.setVerified(user.getVerified());
        info.setKycVerified(user.getKycVerified());
        info.setWalletBalance(user.getWalletBalance());
        info.setKycStatus(user.getKycStatus());
        info.setDriverLicenseStatus(user.getDriverLicenseStatus());
        return ResponseEntity.ok(ApiResponse.success(info));
    }


    // BUG-6/21 FIX: Changed from @PutMapping to @PostMapping to match frontend authService.ts call
    @PostMapping("/change-password")
    @Operation(summary = "Change current user password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AuthDTOs.ChangePasswordRequest request) {
        authService.changePassword(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset OTP code")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody AuthDTOs.ForgotPasswordRequest request) {
        authService.processForgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("If the email is registered, an OTP will be dispatched.", null));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP code and retrieve password reset transient token")
    public ResponseEntity<ApiResponse<Map<String, String>>> verifyOtp(
            @Valid @RequestBody AuthDTOs.VerifyOtpRequest request) {
        String resetToken = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verification successful", Map.of("token", resetToken)));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using transient token issued after OTP validation")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody AuthDTOs.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully", null));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> refresh(
            @Valid @RequestBody AuthDTOs.TokenRefreshRequest request) {
        try {
            AuthDTOs.AuthResponse response = authService.refreshAccessToken(request);
            return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/google")
    @Operation(summary = "Login or Register with Google ID Token")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> googleLogin(
            @Valid @RequestBody AuthDTOs.GoogleLoginRequest request) {
        AuthDTOs.AuthResponse response = authService.googleLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Google login successful", response));
    }
}
