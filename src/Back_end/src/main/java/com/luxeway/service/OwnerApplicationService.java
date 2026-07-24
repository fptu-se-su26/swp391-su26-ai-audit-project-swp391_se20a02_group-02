package com.luxeway.service;

import com.luxeway.dto.ownerapplication.OwnerApplicationDTOs.*;
import com.luxeway.entity.OwnerApplication;
import com.luxeway.entity.OwnerApplicationDocument;
import com.luxeway.entity.User;
import com.luxeway.enums.OwnerApplicationStatus;
import com.luxeway.enums.UserRole;

import com.luxeway.repository.OwnerApplicationDocumentRepository;
import com.luxeway.repository.OwnerApplicationRepository;
import com.luxeway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerApplicationService {

    private final OwnerApplicationRepository applicationRepository;
    private final OwnerApplicationDocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public OwnerApplicationResponse getMyApplication(String userId) {
        return applicationRepository.findByUserIdAndStatusNotIn(userId, List.of(OwnerApplicationStatus.REJECTED, OwnerApplicationStatus.CANCELLED))
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional
    public OwnerApplicationResponse createDraft(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == UserRole.OWNER || user.getRole() == UserRole.ADMIN) {
            throw new IllegalStateException("User already has elevated privileges");
        }

        applicationRepository.findByUserIdAndStatusNotIn(userId, List.of(OwnerApplicationStatus.REJECTED, OwnerApplicationStatus.CANCELLED))
                .ifPresent(app -> {
                    throw new IllegalStateException("You already have an active application");
                });

        OwnerApplication application = OwnerApplication.builder()
                .user(user)
                .status(OwnerApplicationStatus.DRAFT)
                .currentStep(1)
                // Pre-fill from user
                .fullName(user.getFirstName() + " " + user.getLastName())
                .phone(user.getPhone())
                .build();

        return mapToResponse(applicationRepository.save(application));
    }

    @Transactional
    public OwnerApplicationResponse updatePersonalInfo(String userId, String id, PersonalInfoRequest request) {
        OwnerApplication app = getApplicationForUser(userId, id);
        
        app.setFullName(request.getFullName());
        app.setDob(request.getDob());
        app.setPhone(request.getPhone());
        app.setAddress(request.getAddress());
        app.setCity(request.getCity());
        
        if (app.getCurrentStep() < 2) {
            app.setCurrentStep(2);
        }
        
        return mapToResponse(applicationRepository.save(app));
    }

    @Transactional
    public OwnerApplicationResponse updateOwnerProfile(String userId, String id, OwnerProfileRequest request) {
        OwnerApplication app = getApplicationForUser(userId, id);
        
        app.setDisplayName(request.getDisplayName());
        app.setBio(request.getBio());
        app.setServiceArea(request.getServiceArea());
        
        if (app.getCurrentStep() < 3) {
            app.setCurrentStep(3);
        }
        
        return mapToResponse(applicationRepository.save(app));
    }

    @Transactional
    public OwnerApplicationResponse updatePayout(String userId, String id, PayoutRequest request) {
        OwnerApplication app = getApplicationForUser(userId, id);
        
        app.setBankName(request.getBankName());
        app.setAccountHolderName(request.getAccountHolderName());
        
        // simple masking
        String acct = request.getAccountNumber();
        if (acct.length() > 4) {
            app.setMaskedAccountNumber("**** **** " + acct.substring(acct.length() - 4));
        } else {
            app.setMaskedAccountNumber("****");
        }
        
        // In real system, use encryption service
        app.setEncryptedAccountNumber(acct);
        
        if (app.getCurrentStep() < 4) {
            app.setCurrentStep(4);
        }
        
        return mapToResponse(applicationRepository.save(app));
    }

    @Transactional
    public OwnerApplicationResponse addDocument(String userId, String id, DocumentUploadRequest request) {
        OwnerApplication app = getApplicationForUser(userId, id);
        
        OwnerApplicationDocument doc = OwnerApplicationDocument.builder()
                .application(app)
                .documentType(request.getDocumentType())
                .fileReference(request.getFileReference())
                .verificationStatus("PENDING")
                .build();
                
        documentRepository.save(doc);
        return mapToResponse(app);
    }

    @Transactional
    public OwnerApplicationResponse submitApplication(String userId, String id, TermsAcceptanceRequest request) {
        OwnerApplication app = getApplicationForUser(userId, id);
        
        if (!Boolean.TRUE.equals(request.getAccepted())) {
            throw new IllegalArgumentException("Terms must be accepted");
        }
        
        // Validate required fields
        if (app.getFullName() == null || app.getDob() == null || app.getPhone() == null ||
            app.getDisplayName() == null || app.getBio() == null || app.getServiceArea() == null ||
            app.getBankName() == null || app.getEncryptedAccountNumber() == null) {
            throw new IllegalStateException("Application is incomplete");
        }
        
        // Validate documents
        List<OwnerApplicationDocument> docs = documentRepository.findByApplicationId(app.getId());
        if (docs.isEmpty()) {
            throw new IllegalStateException("Documents are required");
        }
        
        app.setTermsAccepted(true);
        app.setTermsVersion(request.getVersion());
        app.setStatus(OwnerApplicationStatus.SUBMITTED);
        app.setSubmittedAt(LocalDateTime.now());
        
        return mapToResponse(applicationRepository.save(app));
    }

    private OwnerApplication getApplicationForUser(String userId, String applicationId) {
        OwnerApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
                
        if (!app.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Not authorized to access this application");
        }
        
        if (app.getStatus() == OwnerApplicationStatus.APPROVED || app.getStatus() == OwnerApplicationStatus.CANCELLED) {
            throw new IllegalStateException("Cannot edit application in " + app.getStatus() + " status");
        }
        
        return app;
    }

    public OwnerApplicationResponse mapToResponse(OwnerApplication app) {
        OwnerApplicationResponse res = OwnerApplicationResponse.builder()
                .id(app.getId())
                .userId(app.getUser().getId())
                .status(app.getStatus())
                .currentStep(app.getCurrentStep())
                .rejectionReason(app.getRejectionReason())
                .fullName(app.getFullName())
                .dob(app.getDob())
                .phone(app.getPhone())
                .address(app.getAddress())
                .city(app.getCity())
                .displayName(app.getDisplayName())
                .bio(app.getBio())
                .serviceArea(app.getServiceArea())
                .bankName(app.getBankName())
                .accountHolderName(app.getAccountHolderName())
                .maskedAccountNumber(app.getMaskedAccountNumber())
                .termsAccepted(app.getTermsAccepted())
                .termsVersion(app.getTermsVersion())
                .submittedAt(app.getSubmittedAt())
                .reviewedAt(app.getReviewedAt())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
                
        if (app.getDocuments() != null) {
            res.setDocuments(app.getDocuments().stream().map(doc -> 
                OwnerApplicationDocumentResponse.builder()
                    .id(doc.getId())
                    .documentType(doc.getDocumentType().name())
                    .fileReference(doc.getFileReference())
                    .verificationStatus(doc.getVerificationStatus())
                    .rejectionReason(doc.getRejectionReason())
                    .createdAt(doc.getCreatedAt())
                    .build()
            ).collect(Collectors.toList()));
        }
        return res;
    }
}
