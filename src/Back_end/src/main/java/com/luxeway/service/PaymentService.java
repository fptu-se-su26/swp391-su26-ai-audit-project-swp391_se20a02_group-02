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

    @Value("${payment.vnpay.secret-key:IKGZVMMTMTUYKQLJILPBYXJVHOUCGFDF}")
    private String vnpaySecretKey;

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

        String transactionId = "TXN" + UUID.randomUUID().toString().replace("-", "").substring(0, 17).toUpperCase();

        Payment payment = Payment.builder()
                .booking(booking)
                .user(user)
                .amount(req.getAmount())
                .currency(req.getCurrency() != null ? req.getCurrency() : "VND")
                .status(PaymentStatus.PENDING)
                .method(req.getMethod().toUpperCase())
                .transactionId(transactionId)
                .description(req.getDescription() != null ? req.getDescription() :
                        "Payment for booking " + booking.getId())
                .build();

        payment = paymentRepository.save(payment);

        PaymentDTOs.PaymentResponse response = toResponse(payment);

        if ("wallet".equalsIgnoreCase(req.getMethod())) {
            if (user.getWalletBalance().compareTo(req.getAmount()) < 0) {
                throw new RuntimeException("Insufficient wallet balance. Please top up your LuxeWallet.");
            }
            // Deduct balance
            user.setWalletBalance(user.getWalletBalance().subtract(req.getAmount()));
            userRepository.save(user);

            // Complete payment
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setProcessedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            // Confirm booking
            booking.setStatus(com.luxeway.enums.BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            response = toResponse(payment);
            log.info("LuxeWallet payment successful: deducted {} from user {}", req.getAmount(), userId);
        } else if ("stripe".equalsIgnoreCase(req.getMethod()) || "card".equalsIgnoreCase(req.getMethod())) {
            // Complete payment immediately for simulated flow
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setProcessedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            // Confirm booking
            booking.setStatus(com.luxeway.enums.BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            response = toResponse(payment);
            log.info("Stripe/Card payment successful immediately: {}", transactionId);
        } else if ("vnpay".equalsIgnoreCase(req.getMethod())) {
            String paymentUrl = buildVNPayUrl(payment, req.getReturnUrl());
            response.setPaymentUrl(paymentUrl);
        }

        log.info("Payment created: {} for booking {} by user {}", payment.getId(), req.getBookingId(), userId);
        return response;
    }

    @Transactional
    public PaymentDTOs.PaymentResponse topUpWallet(String userId, PaymentDTOs.TopUpRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String transactionId = "TOPUP" + UUID.randomUUID().toString().replace("-", "").substring(0, 15).toUpperCase();

        Payment payment = Payment.builder()
                .booking(null)
                .user(user)
                .amount(req.getAmount())
                .currency("VND")
                .status(PaymentStatus.PENDING)
                .method(req.getMethod().toUpperCase())
                .transactionId(transactionId)
                .description("LuxeWallet Top Up: " + req.getAmount() + " VND")
                .build();

        payment = paymentRepository.save(payment);

        PaymentDTOs.PaymentResponse response = toResponse(payment);

        if ("vnpay".equalsIgnoreCase(req.getMethod())) {
            String paymentUrl = buildVNPayUrl(payment, req.getReturnUrl());
            response.setPaymentUrl(paymentUrl);
        } else {
            // Stripe or Credit Card top-up succeeds instantly
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setProcessedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            
            // Add wallet balance
            user.setWalletBalance(user.getWalletBalance().add(req.getAmount()));
            userRepository.save(user);
            
            response = toResponse(payment);
            log.info("LuxeWallet Top Up successful: user {} balance is now {}", userId, user.getWalletBalance());
        }

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
        // Verify VNPay signature
        String secureHash = params.get("vnp_SecureHash");
        if (secureHash != null) {
            Map<String, String> sortedParams = new java.util.TreeMap<>();
            for (Map.Entry<String, String> entry : params.entrySet()) {
                if (entry.getKey().startsWith("vnp_") && !entry.getKey().equals("vnp_SecureHash") && !entry.getKey().equals("vnp_SecureHashType")) {
                    sortedParams.put(entry.getKey(), entry.getValue());
                }
            }

            StringBuilder hashData = new StringBuilder();
            java.util.Iterator<Map.Entry<String, String>> itr = sortedParams.entrySet().iterator();
            while (itr.hasNext()) {
                Map.Entry<String, String> entry = itr.next();
                hashData.append(entry.getKey()).append('=');
                try {
                    hashData.append(java.net.URLEncoder.encode(entry.getValue(), java.nio.charset.StandardCharsets.US_ASCII.toString()));
                } catch (Exception e) {
                    log.error("Encoding error in callback verification", e);
                }
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }

            String calculatedHash = hmacSHA512(vnpaySecretKey, hashData.toString());
            if (!calculatedHash.equalsIgnoreCase(secureHash)) {
                log.error("VNPay signature verification failed. Calculated: {}, Received: {}", calculatedHash, secureHash);
                throw new RuntimeException("VNPay payment signature verification failed");
            }
        }

        String transactionId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found for transaction: " + transactionId));

        if ("00".equals(responseCode)) {
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setProcessedAt(LocalDateTime.now());
            
            if (payment.getBooking() == null) {
                // Wallet top-up!
                User user = payment.getUser();
                user.setWalletBalance(user.getWalletBalance().add(payment.getAmount()));
                userRepository.save(user);
                log.info("VNPay Top Up callback successful: user {} balance is now {}", user.getId(), user.getWalletBalance());
            } else {
                // Booking payment!
                Booking booking = payment.getBooking();
                booking.setStatus(com.luxeway.enums.BookingStatus.CONFIRMED);
                bookingRepository.save(booking);
                log.info("VNPay booking payment callback completed and booking confirmed: {}", transactionId);
            }
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

    // ====== Build VNPay URL ======

    private String buildVNPayUrl(Payment payment, String returnUrl) {
        Map<String, String> vnp_Params = new java.util.HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnpayTmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(payment.getAmount().multiply(BigDecimal.valueOf(100)).longValue()));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", payment.getTransactionId());
        vnp_Params.put("vnp_OrderInfo", payment.getDescription() != null ? payment.getDescription() : "Payment for booking " + payment.getTransactionId());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", returnUrl != null ? returnUrl : "http://localhost:5173/payment/vnpay/return");
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");

        java.util.Calendar cld = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Etc/GMT+7"));
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        List<String> fieldNames = new java.util.ArrayList<>(vnp_Params.keySet());
        java.util.Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        java.util.Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                try {
                    hashData.append(java.net.URLEncoder.encode(fieldValue, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                    // Build query
                    query.append(java.net.URLEncoder.encode(fieldName, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(java.net.URLEncoder.encode(fieldValue, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                } catch (Exception e) {
                    log.error("Error encoding parameter: {}", fieldName, e);
                }
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = hmacSHA512(vnpaySecretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return vnpayUrl + "?" + queryUrl;
    }

    private String hmacSHA512(String key, String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            javax.crypto.Mac hmac512 = javax.crypto.Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            log.error("Error in hmacSHA512 generation", ex);
            return "";
        }
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
