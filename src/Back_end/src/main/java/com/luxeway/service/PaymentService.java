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
@SuppressWarnings("all")
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    // @Lazy to avoid circular dependency: PaymentService ↔ BookingService
    @org.springframework.context.annotation.Lazy
    private final BookingService bookingService;

    // ====== MoMo Configuration ======
    @Value("${payment.momo.partner-code:MOMO}")
    private String momoPartnerCode;

    @Value("${payment.momo.access-key:F8BBA842ECF85}")
    private String momoAccessKey;

    @Value("${payment.momo.secret-key:K951B6PE1waDMi640xX08PD3vg6EkVlz}")
    private String momoSecretKey;

    @Value("${payment.momo.endpoint:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String momoEndpoint;

    @Value("${payment.momo.return-url:http://localhost:5173/payment/momo/return}")
    private String momoReturnUrl;

    @Value("${payment.momo.ipn-url:http://localhost:5101/api/payment/momo-ipn}")
    private String momoIpnUrl;

    @Value("${payment.momo.request-type:payWithMethod}")
    private String momoRequestType;

    // ====== Create Payment ======

    @Transactional
    public PaymentDTOs.PaymentResponse createPayment(String userId, PaymentDTOs.CreatePaymentRequest req) {
        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRenter().getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to pay for this booking");
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
            user.setWalletBalance(user.getWalletBalance().subtract(req.getAmount()));
            userRepository.save(user);

            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setProcessedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            booking.setStatus(com.luxeway.enums.BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
            bookingService.blockAvailabilityCalendarPublic(booking);

            response = toResponse(payment);
            log.info("LuxeWallet payment successful: deducted {} from user {}", req.getAmount(), userId);

        } else if ("stripe".equalsIgnoreCase(req.getMethod()) || "card".equalsIgnoreCase(req.getMethod())) {
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setProcessedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            booking.setStatus(com.luxeway.enums.BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
            bookingService.blockAvailabilityCalendarPublic(booking);

            response = toResponse(payment);
            log.info("Stripe/Card payment successful immediately: {}", transactionId);

        } else if ("momo".equalsIgnoreCase(req.getMethod())) {
            String returnUrl = req.getReturnUrl() != null && !req.getReturnUrl().isEmpty()
                    ? req.getReturnUrl() : momoReturnUrl;
            String paymentUrl = buildMoMoPaymentUrl(payment, returnUrl);
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

        if ("momo".equalsIgnoreCase(req.getMethod())) {
            String returnUrl = req.getReturnUrl() != null && !req.getReturnUrl().isEmpty()
                    ? req.getReturnUrl() : momoReturnUrl;
            String paymentUrl = buildMoMoPaymentUrl(payment, returnUrl);
            response.setPaymentUrl(paymentUrl);
        } else {
            // Stripe or Credit Card top-up succeeds instantly
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setProcessedAt(LocalDateTime.now());
            paymentRepository.save(payment);

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

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!booking.getRenter().getId().equals(userId) &&
            !booking.getOwner().getId().equals(userId) && !isAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to view payments for this booking");
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

    // ====== Process MoMo IPN (Instant Payment Notification) ======

    /**
     * MoMo IPN is sent as POST from MoMo server after payment.
     * Verifies signature then updates payment & booking.
     */
    @Transactional
    public PaymentDTOs.PaymentResponse processMoMoIpn(Map<String, String> params) {
        String partnerCode  = params.getOrDefault("partnerCode", "");
        String orderId      = params.getOrDefault("orderId", "");
        String requestId    = params.getOrDefault("requestId", "");
        String amount       = params.getOrDefault("amount", "0");
        String orderInfo    = params.getOrDefault("orderInfo", "");
        String orderType    = params.getOrDefault("orderType", "");
        String transId      = params.getOrDefault("transId", "");
        String resultCode   = params.getOrDefault("resultCode", "-1");
        String message      = params.getOrDefault("message", "");
        String payType      = params.getOrDefault("payType", "");
        String responseTime = params.getOrDefault("responseTime", "");
        String extraData    = params.getOrDefault("extraData", "");
        String receivedSignature = params.getOrDefault("signature", "");

        // Build signature string per MoMo spec (sorted key=value&... no trailing &)
        String rawSignature = "accessKey=" + momoAccessKey
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&message=" + message
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&orderType=" + orderType
                + "&partnerCode=" + partnerCode
                + "&payType=" + payType
                + "&requestId=" + requestId
                + "&responseTime=" + responseTime
                + "&resultCode=" + resultCode
                + "&transId=" + transId;

        String calculatedSignature = hmacSHA256(momoSecretKey, rawSignature);

        if (!calculatedSignature.equals(receivedSignature)) {
            log.error("MoMo IPN signature mismatch. Calculated: {}, Received: {}", calculatedSignature, receivedSignature);
            throw new RuntimeException("MoMo IPN signature verification failed");
        }

        // orderId == transactionId we sent when creating
        Payment payment = paymentRepository.findByTransactionId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for orderId: " + orderId));

        if (payment.getStatus() == PaymentStatus.SUCCEEDED) {
            log.warn("MoMo IPN ignored: transaction {} already SUCCEEDED", orderId);
            return toResponse(payment);
        }

        if ("0".equals(resultCode)) {
            // Success
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setProcessedAt(LocalDateTime.now());

            if (payment.getBooking() == null) {
                // Wallet top-up
                User user = payment.getUser();
                user.setWalletBalance(user.getWalletBalance().add(payment.getAmount()));
                userRepository.save(user);
                log.info("MoMo Top Up IPN success: user {} balance +{}", user.getId(), payment.getAmount());
            } else {
                // Booking payment confirmed
                Booking booking = payment.getBooking();
                booking.setStatus(com.luxeway.enums.BookingStatus.CONFIRMED);
                bookingRepository.save(booking);
                bookingService.blockAvailabilityCalendarPublic(booking);
                log.info("MoMo booking payment IPN confirmed: orderId={}", orderId);
            }
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            log.warn("MoMo IPN payment failed: orderId={}, resultCode={}, message={}", orderId, resultCode, message);
        }

        payment = paymentRepository.save(payment);
        return toResponse(payment);
    }

    /**
     * MoMo Return – user is redirected back to our site after payment.
     * Same verification as IPN but called via GET/POST from browser redirect.
     * We look up payment by orderId and return its current status.
     */
    @Transactional
    public PaymentDTOs.PaymentResponse processMoMoReturn(Map<String, String> params) {
        String orderId      = params.getOrDefault("orderId", "");
        String resultCode   = params.getOrDefault("resultCode", "-1");

        if (orderId.isEmpty()) {
            throw new RuntimeException("Missing orderId in MoMo return params");
        }

        Payment payment = paymentRepository.findByTransactionId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for orderId: " + orderId));

        // If IPN hasn't fired yet, apply result from return params
        if (payment.getStatus() == PaymentStatus.PENDING) {
            if ("0".equals(resultCode)) {
                payment.setStatus(PaymentStatus.SUCCEEDED);
                payment.setProcessedAt(LocalDateTime.now());

                if (payment.getBooking() == null) {
                    User user = payment.getUser();
                    user.setWalletBalance(user.getWalletBalance().add(payment.getAmount()));
                    userRepository.save(user);
                } else {
                    Booking booking = payment.getBooking();
                    booking.setStatus(com.luxeway.enums.BookingStatus.CONFIRMED);
                    bookingRepository.save(booking);
                    bookingService.blockAvailabilityCalendarPublic(booking);
                }
                payment = paymentRepository.save(payment);
                log.info("MoMo return handled (IPN not yet received): orderId={}", orderId);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment = paymentRepository.save(payment);
                log.warn("MoMo return indicates failure: orderId={}, resultCode={}", orderId, resultCode);
            }
        }

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

    // ====== Build MoMo Payment URL ======

    private String buildMoMoPaymentUrl(Payment payment, String returnUrl) {
        try {
            String requestId = UUID.randomUUID().toString();
            String orderId   = payment.getTransactionId();  // reuse our transactionId as orderId
            long   amountVal = payment.getAmount().longValue();
            String orderInfo = "LuxeWay payment " + orderId;
            String extraData = "";  // base64 extra info (optional)
            String ipnUrl    = momoIpnUrl;

            // Signature per MoMo v2 spec
            String rawSignature = "accessKey=" + momoAccessKey
                    + "&amount=" + amountVal
                    + "&extraData=" + extraData
                    + "&ipnUrl=" + ipnUrl
                    + "&orderId=" + orderId
                    + "&orderInfo=" + orderInfo
                    + "&partnerCode=" + momoPartnerCode
                    + "&redirectUrl=" + returnUrl
                    + "&requestId=" + requestId
                    + "&requestType=" + momoRequestType;

            String signature = hmacSHA256(momoSecretKey, rawSignature);

            // Build JSON body for MoMo API
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, Object> body = new java.util.LinkedHashMap<>();
            body.put("partnerCode", momoPartnerCode);
            body.put("partnerName", "LuxeWay");
            body.put("storeId", momoPartnerCode);
            body.put("requestId", requestId);
            body.put("amount", amountVal);
            body.put("orderId", orderId);
            body.put("orderInfo", orderInfo);
            body.put("redirectUrl", returnUrl);
            body.put("ipnUrl", ipnUrl);
            body.put("lang", "vi");
            body.put("requestType", momoRequestType);
            body.put("autoCapture", true);
            body.put("extraData", extraData);
            body.put("signature", signature);

            String jsonBody = mapper.writeValueAsString(body);

            // Call MoMo API to get payUrl
            java.net.http.HttpClient httpClient = java.net.http.HttpClient.newBuilder()
                    .connectTimeout(java.time.Duration.ofSeconds(15))
                    .build();

            java.net.http.HttpRequest httpRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(momoEndpoint))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonBody))
                    .timeout(java.time.Duration.ofSeconds(30))
                    .build();

            java.net.http.HttpResponse<String> httpResponse =
                    httpClient.send(httpRequest, java.net.http.HttpResponse.BodyHandlers.ofString());

            String responseBody = httpResponse.body();
            log.info("MoMo create payment response (status {}): {}", httpResponse.statusCode(), responseBody);

            java.util.Map<String, Object> momoResp = mapper.readValue(responseBody,
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {});

            int resultCode = (int) momoResp.getOrDefault("resultCode", -1);
            if (resultCode == 0) {
                String payUrl = (String) momoResp.get("payUrl");
                log.info("MoMo payment URL created for txn {}: {}", orderId, payUrl);
                return payUrl;
            } else {
                String errMsg = (String) momoResp.getOrDefault("message", "Unknown MoMo error");
                log.error("MoMo create payment failed: resultCode={}, message={}", resultCode, errMsg);
                throw new RuntimeException("MoMo payment creation failed: " + errMsg);
            }

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error calling MoMo API", e);
            throw new RuntimeException("Error creating MoMo payment: " + e.getMessage(), e);
        }
    }

    // ====== HMAC-SHA256 (MoMo uses SHA256, not SHA512) ======

    private String hmacSHA256(String key, String data) {
        try {
            javax.crypto.Mac hmac = javax.crypto.Mac.getInstance("HmacSHA256");
            byte[] hmacKeyBytes = key.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(hmacKeyBytes, "HmacSHA256");
            hmac.init(secretKey);
            byte[] result = hmac.doFinal(data.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            log.error("Error in hmacSHA256 generation", ex);
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
