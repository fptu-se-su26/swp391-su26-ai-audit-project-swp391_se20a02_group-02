package com.luxeway.service;

import com.luxeway.dto.user.UserDTOs;
import com.luxeway.entity.User;
import com.luxeway.entity.UserDocument;
import com.luxeway.enums.BookingStatus;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.UserDocumentRepository;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class UserService {

    private final UserRepository userRepository;
    private final UserDocumentRepository userDocumentRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;

    public UserDTOs.UserProfileResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toProfileResponse(user);
    }

    @Transactional
    public UserDTOs.UserProfileResponse updateProfile(String userId, UserDTOs.UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setDisplayName(req.getFirstName() + " " + req.getLastName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getBio() != null) user.setBio(req.getBio());
        if (req.getLocation() != null) user.setLocation(req.getLocation());
        if (req.getAvatar() != null) user.setAvatar(req.getAvatar());
        if (req.getCompanyName() != null) user.setCompanyName(req.getCompanyName());
        if (req.getPreferredLanguage() != null) user.setPreferredLanguage(req.getPreferredLanguage());

        user = userRepository.save(user);
        log.info("Profile updated for user: {}", userId);
        return toProfileResponse(user);
    }

    public UserDTOs.UserProfileResponse getPublicProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toProfileResponse(user);
    }

    @Transactional
    public UserDTOs.DocumentResponse uploadDocument(String userId, UserDTOs.UploadDocumentRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDocument doc = UserDocument.builder()
                .user(user)
                .documentType(req.getDocumentType())
                .url(req.getUrl())
                .status("PENDING")
                .build();

        doc = userDocumentRepository.save(doc);
        log.info("Document uploaded: {} for user {}", req.getDocumentType(), userId);
        return toDocumentResponse(doc);
    }

    public List<UserDTOs.DocumentResponse> getMyDocuments(String userId) {
        return userDocumentRepository.findByUserIdOrderByUploadedAtDesc(userId)
                .stream().map(this::toDocumentResponse).collect(Collectors.toList());
    }

    public UserDTOs.OwnerStatsResponse getDashboardStats(String userId) {
        UserDTOs.OwnerStatsResponse stats = new UserDTOs.OwnerStatsResponse();

        stats.setTotalVehicles(vehicleRepository.countByOwnerId(userId));
        stats.setActiveVehicles(vehicleRepository.findByOwnerIdAndStatus(userId, VehicleStatus.AVAILABLE).size());

        long totalBookings = bookingRepository.countByOwnerIdAndStatus(userId, BookingStatus.PENDING)
                + bookingRepository.countByOwnerIdAndStatus(userId, BookingStatus.CONFIRMED)
                + bookingRepository.countByOwnerIdAndStatus(userId, BookingStatus.ACTIVE)
                + bookingRepository.countByOwnerIdAndStatus(userId, BookingStatus.COMPLETED)
                + bookingRepository.countByOwnerIdAndStatus(userId, BookingStatus.CANCELLED);
        stats.setTotalBookings(totalBookings);
        stats.setPendingBookings(bookingRepository.countByOwnerIdAndStatus(userId, BookingStatus.PENDING));
        stats.setCompletedBookings(bookingRepository.countByOwnerIdAndStatus(userId, BookingStatus.COMPLETED));

        BigDecimal revenue = bookingRepository.sumRevenueByOwnerId(userId);
        stats.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);

        User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getRating() != null) {
            stats.setAverageRating(user.getRating().doubleValue());
        }

        return stats;
    }

    public UserDTOs.UserProfileResponse toProfileResponse(User u) {
        UserDTOs.UserProfileResponse resp = new UserDTOs.UserProfileResponse();
        resp.setId(u.getId());
        resp.setEmail(u.getEmail());
        resp.setFirstName(u.getFirstName());
        resp.setLastName(u.getLastName());
        resp.setDisplayName(u.getDisplayName());
        resp.setAvatar(u.getAvatar());
        resp.setPhone(u.getPhone());
        resp.setRole(u.getRole().name().toLowerCase());
        resp.setAccountType(u.getAccountType());
        resp.setCompanyName(u.getCompanyName());
        resp.setBio(u.getBio());
        resp.setLocation(u.getLocation());
        resp.setRating(u.getRating() != null ? u.getRating().doubleValue() : 0.0);
        resp.setTotalReviews(u.getTotalReviews());
        resp.setTotalRentals(u.getTotalRentals());
        resp.setVerified(u.getVerified());
        resp.setKycVerified(u.getKycVerified());
        resp.setDrivingLicenseVerified(u.getDrivingLicenseVerified());
        resp.setLicenseClass(u.getLicenseClass());
        resp.setLicenseNumber(u.getLicenseNumber());
        resp.setIsActive(u.getIsActive());
        resp.setJoinedAt(u.getJoinedAt() != null ? u.getJoinedAt().toString() : null);
        resp.setLastActive(u.getLastActive() != null ? u.getLastActive().toString() : null);
        resp.setPreferredLanguage(u.getPreferredLanguage());
        return resp;
    }

    public UserDTOs.DocumentResponse toDocumentResponse(UserDocument doc) {
        UserDTOs.DocumentResponse resp = new UserDTOs.DocumentResponse();
        resp.setId(doc.getId());
        resp.setDocumentType(doc.getDocumentType());
        resp.setUrl(doc.getUrl());
        resp.setStatus(doc.getStatus());
        resp.setUploadedAt(doc.getUploadedAt() != null ? doc.getUploadedAt().toString() : null);
        resp.setVerifiedAt(doc.getVerifiedAt() != null ? doc.getVerifiedAt().toString() : null);
        resp.setRejectionReason(doc.getRejectionReason());
        resp.setLicenseClass(doc.getLicenseClass());
        resp.setLicenseNumber(doc.getLicenseNumber());
        resp.setLicenseFullName(doc.getLicenseFullName());
        resp.setLicenseDateOfBirth(doc.getLicenseDateOfBirth());
        resp.setLicenseResidence(doc.getLicenseResidence());
        resp.setLicenseNationality(doc.getLicenseNationality());
        return resp;
    }

    @Transactional
    public UserDTOs.DocumentResponse uploadDrivingLicense(String userId, FptAiOcrService.OcrResult ocrResult) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String licenseClass = ocrResult.getLicenseClass();
        String licenseNumber = ocrResult.getLicenseNumber();
        user.setDrivingLicenseVerified(true);
        user.setLicenseClass(licenseClass);
        user.setLicenseNumber(licenseNumber);
        userRepository.save(user);

        UserDocument doc = UserDocument.builder()
                .user(user)
                .documentType("DRIVING_LICENSE")
                .url("OCR_EXTRACTED")
                .status("VERIFIED")
                .licenseClass(licenseClass)
                .licenseNumber(licenseNumber)
                .licenseFullName(ocrResult.getFullName())
                .licenseDateOfBirth(ocrResult.getDateOfBirth())
                .licenseResidence(ocrResult.getResidence())
                .licenseNationality(ocrResult.getNationality())
                .build();

        doc = userDocumentRepository.save(doc);
        log.info("Driving license verified and uploaded: class={}, number={} for user {}", licenseClass, licenseNumber, userId);
        return toDocumentResponse(doc);
    }

    @Transactional
    public void deleteDocument(String userId, String documentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDocument doc = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!doc.getUser().getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to delete this document");
        }

        if ("DRIVING_LICENSE".equalsIgnoreCase(doc.getDocumentType())) {
            user.setDrivingLicenseVerified(false);
            user.setLicenseClass(null);
            user.setLicenseNumber(null);
            userRepository.save(user);
            log.info("Driving license fields reset for user: {}", userId);
        }

        String url = doc.getUrl();
        if (url != null && url.startsWith("/uploads/")) {
            try {
                String relativePath = url.substring(1);
                java.nio.file.Path filePath = java.nio.file.Paths.get(relativePath);
                java.nio.file.Files.deleteIfExists(filePath);
                log.info("Physical file deleted: {}", filePath);
            } catch (Exception e) {
                log.warn("Failed to delete physical file: {}", url, e);
            }
        }

        userDocumentRepository.delete(doc);
        log.info("Document {} deleted for user {}", documentId, userId);
    }
}
