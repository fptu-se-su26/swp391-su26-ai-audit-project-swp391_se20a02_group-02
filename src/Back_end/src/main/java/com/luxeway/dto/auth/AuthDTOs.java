package com.luxeway.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDTOs {

    @Data
    public static class LoginRequest {
        @NotBlank(message = "{validation.email.required}")
        @Email(message = "{validation.email.invalid}")
        private String email;

        @NotBlank(message = "{validation.password.required}")
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "{validation.firstname.required}")
        private String firstName;

        @NotBlank(message = "{validation.lastname.required}")
        private String lastName;

        @NotBlank(message = "{validation.email.required}")
        @Email(message = "{validation.email.invalid}")
        private String email;

        @NotBlank(message = "{validation.password.required}")
        @Size(min = 8, message = "{validation.password.size}")
        private String password;

        private String phone;

        /** CUSTOMER or OWNER */
        private String role = "CUSTOMER";

        /** INDIVIDUAL or BUSINESS */
        private String accountType = "INDIVIDUAL";

        private String companyName;

        private String preferredLanguage = "en";
    }

    @Data
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private long expiresIn;
        private UserInfo user;

        @Data
        public static class UserInfo {
            private String id;
            private String email;
            private String firstName;
            private String lastName;
            private String displayName;
            private String avatar;
            private String role;
            private String accountType;
            private boolean verified;
            private boolean kycVerified;
            private java.math.BigDecimal walletBalance;
            private String preferredLanguage;
            private String kycStatus;
            private String driverLicenseStatus;
        }
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank(message = "{validation.password.required}")
        private String currentPassword;
        @NotBlank(message = "{validation.password.required}")
        @Size(min = 8, message = "{validation.password.size}")
        private String newPassword;
    }

    @Data
    public static class ForgotPasswordRequest {
        @NotBlank(message = "{validation.email.required}")
        @Email(message = "{validation.email.invalid}")
        private String email;
    }

    @Data
    public static class VerifyOtpRequest {
        @NotBlank(message = "{validation.email.required}")
        @Email(message = "{validation.email.invalid}")
        private String email;
        @NotBlank(message = "{validation.otp.required}")
        @Size(min = 6, max = 6, message = "{validation.otp.size}")
        private String otp;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank(message = "{validation.token.required}")
        private String token;

        @NotBlank(message = "{validation.password.required}")
        @Size(min = 8, message = "{validation.password.size}")
        private String newPassword;

        @NotBlank(message = "{validation.confirmPassword.required}")
        private String confirmPassword;
    }

    @Data
    public static class TokenRefreshRequest {
        @NotBlank(message = "{validation.token.required}")
        private String refreshToken;
    }

    @Data
    public static class GoogleLoginRequest {
        @NotBlank(message = "{validation.idtoken.required}")
        private String idToken;
    }
}
