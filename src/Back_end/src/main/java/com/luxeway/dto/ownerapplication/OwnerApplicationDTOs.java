package com.luxeway.dto.ownerapplication;

import com.luxeway.enums.OwnerApplicationDocumentType;
import com.luxeway.enums.OwnerApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class OwnerApplicationDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerApplicationResponse {
        private String id;
        private String userId;
        private OwnerApplicationStatus status;
        private Integer currentStep;
        private String rejectionReason;

        // Step 1
        private String fullName;
        private LocalDate dob;
        private String phone;
        private String address;
        private String city;

        // Step 3
        private String displayName;
        private String bio;
        private String serviceArea;

        // Step 4
        private String bankName;
        private String accountHolderName;
        private String maskedAccountNumber;

        // Step 5
        private Boolean termsAccepted;
        private String termsVersion;

        private LocalDateTime submittedAt;
        private LocalDateTime reviewedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        private List<OwnerApplicationDocumentResponse> documents;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerApplicationDocumentResponse {
        private String id;
        private String documentType;
        private String fileReference;
        private String verificationStatus;
        private String rejectionReason;
        private LocalDateTime createdAt;
    }

    @Data
    public static class PersonalInfoRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;
        @NotNull(message = "Date of birth is required")
        private LocalDate dob;
        @NotBlank(message = "Phone number is required")
        private String phone;
        @NotBlank(message = "Address is required")
        private String address;
        @NotBlank(message = "City is required")
        private String city;
    }

    @Data
    public static class OwnerProfileRequest {
        @NotBlank(message = "Display name is required")
        private String displayName;
        @NotBlank(message = "Bio is required")
        private String bio;
        @NotBlank(message = "Service area is required")
        private String serviceArea;
    }

    @Data
    public static class PayoutRequest {
        @NotBlank(message = "Bank name is required")
        private String bankName;
        @NotBlank(message = "Account holder name is required")
        private String accountHolderName;
        @NotBlank(message = "Account number is required")
        private String accountNumber;
    }

    @Data
    public static class DocumentUploadRequest {
        @NotNull(message = "Document type is required")
        private OwnerApplicationDocumentType documentType;
        @NotBlank(message = "File reference is required")
        private String fileReference;
    }

    @Data
    public static class TermsAcceptanceRequest {
        @NotNull(message = "Must accept terms")
        private Boolean accepted;
        private String version;
    }
    
    @Data
    public static class RejectApplicationRequest {
        @NotBlank(message = "Rejection reason is required")
        private String reason;
    }
}
