package com.luxeway.dto.payment;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

public class PaymentDTOs {

    @Data
    public static class CreatePaymentRequest {
        @NotBlank(message = "Booking ID is required")
        private String bookingId;

        /**
         * Payment method: stripe, vnpay, bank_transfer, wallet
         */
        @NotBlank(message = "Payment method is required")
        private String method;

        @NotNull @Positive
        private BigDecimal amount;

        private String currency = "VND";
        private String description;
        private String returnUrl;
    }

    @Data
    public static class PaymentResponse {
        private String id;
        private String bookingId;
        private BigDecimal amount;
        private String currency;
        private String status;
        private String method;
        private String transactionId;
        private String description;
        private BigDecimal refundAmount;
        private String createdAt;
        private String processedAt;
        /** VNPay checkout URL (if method = vnpay) */
        private String paymentUrl;
    }

    @Data
    public static class VNPayCallbackRequest {
        private String vnp_TxnRef;
        private String vnp_Amount;
        private String vnp_ResponseCode;
        private String vnp_TransactionStatus;
        private String vnp_SecureHash;
        private Map<String, String> allParams;
    }

    @Data
    public static class TopUpRequest {
        @NotNull @Positive
        private BigDecimal amount;

        @NotBlank(message = "Payment method is required")
        private String method;

        private String returnUrl;
    }
}
