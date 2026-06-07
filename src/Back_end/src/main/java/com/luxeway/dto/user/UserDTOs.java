package com.luxeway.dto.user;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

public class UserDTOs {

    @Data
    public static class UpdateProfileRequest {
        @NotBlank(message = "{validation.firstname.required}")
        private String firstName;

        @NotBlank(message = "{validation.lastname.required}")
        private String lastName;

        @Size(max = 20)
        private String phone;

        @Size(max = 1000)
        private String bio;

        @Size(max = 200)
        private String location;

        @Size(max = 500)
        private String avatar;

        @Size(max = 200)
        private String companyName;

        private String preferredLanguage;
    }

    @Data
    public static class UserProfileResponse {
        private String id;
        private String email;
        private String firstName;
        private String lastName;
        private String displayName;
        private String avatar;
        private String phone;
        private String role;
        private String accountType;
        private String companyName;
        private String bio;
        private String location;
        private Double rating;
        private Integer totalReviews;
        private Integer totalRentals;
        private Boolean verified;
        private Boolean kycVerified;
        private Boolean drivingLicenseVerified;
        private Boolean isActive;
        private String joinedAt;
        private String lastActive;
        private String preferredLanguage;
    }

    @Data
    public static class UploadDocumentRequest {
        @NotBlank(message = "{validation.document.type.required}")
        private String documentType; // PASSPORT, NATIONAL_ID, DRIVING_LICENSE

        @NotBlank(message = "{validation.document.url.required}")
        private String url;
    }

    @Data
    public static class DocumentResponse {
        private String id;
        private String documentType;
        private String url;
        private String status;
        private String uploadedAt;
        private String verifiedAt;
        private String rejectionReason;
    }

    @Data
    public static class OwnerStatsResponse {
        private long totalVehicles;
        private long activeVehicles;
        private long totalBookings;
        private long pendingBookings;
        private long completedBookings;
        private BigDecimal totalRevenue;
        private Double averageRating;
    }
}
