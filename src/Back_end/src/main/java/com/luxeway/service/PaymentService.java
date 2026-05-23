package com.luxeway.service;

import com.luxeway.dto.payment.PaymentDTOs;
import com.luxeway.entity.Booking;
import com.luxeway.entity.Payment;
import com.luxeway.entity.User;
import com.luxeway.enums.PaymentStatus;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.PaymentRepository;
import com.luxeway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Value("${payment.vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpayUrl;

    @Value("${payment.vnpay.tmn-code:LUXEWAY1}")
    private String vnpayTmnCode;

    // ====== Create Payment ======

    @Transactional
    public PaymentDTOs.PaymentResponse createPayment(String userId, PaymentDTOs.CreatePaymentRequest req) {
        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRenter().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to pay for this booking");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String transactionId = UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase();

        Payment payment = Payment.builder()
                .booking(booking)
                .user(user)
                .amount(req.getAmount())
                .currency(req.getCurrency() != null ? req.getCurrency() : "VND")
                .status(PaymentStatus.PENDING)
                .method(req.getMethod())
                .transactionId(transactionId)
                .description(req.getDescription() != null ? req.getDescription() :
                        "Payment for booking " + booking.getId())
                .build();

        payment = paymentRepository.save(payment);

        PaymentDTOs.PaymentResponse response = toResponse(payment);

        // For VNPay: generate payment URL (mock/simplified)
        if ("vnpay".equalsIgnoreCase(req.getMethod())) {
            String paymentUrl = buildVNPayUrl(payment, req.getReturnUrl());
            response.setPaymentUrl(paymentUrl);
        }

        log.info("Payment created: {} for booking {} by user {}", payment.getId(), req.getBookingId(), userId);
        return response;
    }

    // ====== Get payments by booking ======

    public List<PaymentDTOs.PaymentResponse> getPaymentsByBooking(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isAdmin = false; // simplified for now
        if (!booking.getRenter().getId().equals(userId) &&
            !booking.getOwner().getId().equals(userId) && !isAdmin) {
            throw new RuntimeException("Not authorized to view payments for this booking");
        }

        return paymentRepository.findByBookingId(bookingId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    // ====== Get my payment history ======

    public Page<PaymentDTOs.PaymentResponse> getMyPayments(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    // ====== Process VNPay callback ======

    @Transactional
    public PaymentDTOs.PaymentResponse processVNPayCallback(Map<String, String> params) {
        String transactionId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found for transaction: " + transactionId));

        if ("00".equals(responseCode)) {
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setProcessedAt(LocalDateTime.now());
            log.info("VNPay payment completed: {}", transactionId);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            log.warn("VNPay payment failed: {} with code {}", transactionId, responseCode);
        }

        payment = paymentRepository.save(payment);
        return toResponse(payment);
    }

    // ====== Refund payment ======

    @Transactional
    public PaymentDTOs.PaymentResponse refundPayment(String paymentId, BigDecimal refundAmount, String adminId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.SUCCEEDED) {
            throw new RuntimeException("Only completed payments can be refunded");
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setRefundAmount(refundAmount != null ? refundAmount : payment.getAmount());
        payment.setRefundedAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        log.info("Payment {} refunded by admin {}", paymentId, adminId);
        return toResponse(payment);
    }

    // ====== Build VNPay URL (simplified mock) ======

    private String buildVNPayUrl(Payment payment, String returnUrl) {
        // Simplified – in production, add proper HMAC-SHA512 signature
        return String.format("%s?vnp_TmnCode=%s&vnp_Amount=%s&vnp_TxnRef=%s&vnp_ReturnUrl=%s",
                vnpayUrl, vnpayTmnCode,
                payment.getAmount().multiply(BigDecimal.valueOf(100)).longValue(),
                payment.getTransactionId(),
                returnUrl != null ? returnUrl : "http://localhost:5173/payment/return");
    }

    // ====== DTO Mapping ======

    public PaymentDTOs.PaymentResponse toResponse(Payment p) {
        PaymentDTOs.PaymentResponse resp = new PaymentDTOs.PaymentResponse();
        resp.setId(p.getId());
        resp.setBookingId(p.getBooking() != null ? p.getBooking().getId() : null);
        resp.setAmount(p.getAmount());
        resp.setCurrency(p.getCurrency());
        resp.setStatus(p.getStatus().name().toLowerCase());
        resp.setMethod(p.getMethod());
        resp.setTransactionId(p.getTransactionId());
        resp.setDescription(p.getDescription());
        resp.setRefundAmount(p.getRefundAmount());
        resp.setCreatedAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        resp.setProcessedAt(p.getProcessedAt() != null ? p.getProcessedAt().toString() : null);
        return resp;
    }
}
