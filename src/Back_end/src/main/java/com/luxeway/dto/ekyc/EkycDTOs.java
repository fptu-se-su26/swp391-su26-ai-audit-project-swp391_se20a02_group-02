package com.luxeway.dto.ekyc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTOs for VNPT eKYC IDCheck integration.
 */
public class EkycDTOs {

    // ========== Response from OCR scan ==========

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EkycScanResponse {
        private boolean success;
        private String message;
        private String documentId;
        private IdCardData data;
        private String errorCode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IdCardData {
        /** Số CCCD / CMND */
        private String idNumber;
        /** Họ và tên */
        private String fullName;
        /** Ngày sinh (dd/MM/yyyy) */
        private String dateOfBirth;
        /** Giới tính */
        private String gender;
        /** Quốc tịch */
        private String nationality;
        /** Quê quán */
        private String placeOfOrigin;
        /** Nơi thường trú */
        private String placeOfResidence;
        /** Ngày hết hạn */
        private String expiryDate;
        /** Loại giấy tờ (CCCD, CMND, Passport) */
        private String documentType;
        /** Ngày cấp */
        private String issueDate;
        /** Đặc điểm nhận dạng */
        private String personalIdentification;
        /** Mặt đã quét: FRONT hoặc BACK */
        private String side;
    }

    // ========== Verify KYC request ==========

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EkycVerifyRequest {
        /** Document ID từ quét mặt trước */
        private String frontDocumentId;
        /** Document ID từ quét mặt sau */
        private String backDocumentId;
    }

    // ========== KYC status response ==========

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EkycStatusResponse {
        private boolean kycVerified;
        private String idNumber;
        private String fullName;
        private String dateOfBirth;
        private String verifiedAt;
        private String frontDocumentId;
        private String backDocumentId;
        private String frontImageUrl;
        private String backImageUrl;
    }
}
