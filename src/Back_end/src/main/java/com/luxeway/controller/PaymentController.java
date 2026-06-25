package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.dto.payment.PaymentDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment processing and history")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Create a payment for a booking")
    public ResponseEntity<ApiResponse<PaymentDTOs.PaymentResponse>> createPayment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PaymentDTOs.CreatePaymentRequest request) {
        PaymentDTOs.PaymentResponse payment = paymentService.createPayment(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment initiated", payment));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my payment history")
    public ResponseEntity<ApiResponse<Page<PaymentDTOs.PaymentResponse>>> getMyPayments(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PaymentDTOs.PaymentResponse> payments = paymentService.getMyPayments(user.getId(), page, size);
        ApiResponse<Page<PaymentDTOs.PaymentResponse>> response = ApiResponse.<Page<PaymentDTOs.PaymentResponse>>builder()
                .success(true)
                .data(payments)
                .meta(ApiResponse.PageMeta.builder()
                        .page(payments.getNumber())
                        .pageSize(payments.getSize())
                        .totalElements(payments.getTotalElements())
                        .totalPages(payments.getTotalPages())
                        .build())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get all payments for a booking")
    public ResponseEntity<ApiResponse<List<PaymentDTOs.PaymentResponse>>> getPaymentsByBooking(
            @PathVariable String bookingId,
            @AuthenticationPrincipal User user) {
        List<PaymentDTOs.PaymentResponse> payments = paymentService.getPaymentsByBooking(bookingId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    /**
     * MoMo IPN endpoint – called by MoMo server (POST) after payment.
     * Must be publicly accessible (no auth required from MoMo).
     * Path: POST /payments/momo/ipn  (matches momoIpnUrl in config)
     */
    @PostMapping("/momo/ipn")
    @Operation(summary = "Handle MoMo IPN (Instant Payment Notification) – public endpoint")
    public ResponseEntity<Map<String, Object>> momoIpn(@RequestBody Map<String, String> params) {
        try {
            PaymentDTOs.PaymentResponse payment = paymentService.processMoMoIpn(params);
            // MoMo expects HTTP 204 or 200 with specific body to acknowledge receipt
            Map<String, Object> ack = Map.of(
                "partnerCode", params.getOrDefault("partnerCode", ""),
                "requestId",   params.getOrDefault("requestId", ""),
                "orderId",     params.getOrDefault("orderId", ""),
                "resultCode",  0,
                "message",     "Success"
            );
            return ResponseEntity.ok(ack);
        } catch (Exception e) {
            Map<String, Object> err = Map.of("resultCode", -1, "message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    /**
     * MoMo Return endpoint – user browser is redirected here after payment.
     * Can be GET or POST depending on MoMo's redirect.
     * Path: GET|POST /payments/momo/return
     */
    @RequestMapping(value = "/momo/return", method = {RequestMethod.GET, RequestMethod.POST})
    @Operation(summary = "Handle MoMo return redirect – public endpoint")
    public ResponseEntity<ApiResponse<PaymentDTOs.PaymentResponse>> momoReturn(
            @RequestParam Map<String, String> params) {
        PaymentDTOs.PaymentResponse payment = paymentService.processMoMoReturn(params);
        return ResponseEntity.ok(ApiResponse.success("MoMo payment return processed", payment));
    }

    @PostMapping("/wallet/topup")
    @Operation(summary = "Top up LuxeWallet balance")
    public ResponseEntity<ApiResponse<PaymentDTOs.PaymentResponse>> topUpWallet(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PaymentDTOs.TopUpRequest request) {
        PaymentDTOs.PaymentResponse payment = paymentService.topUpWallet(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Top-up initiated successfully", payment));
    }
}
