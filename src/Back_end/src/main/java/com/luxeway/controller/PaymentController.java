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

    @PostMapping("/vnpay/callback")
    @Operation(summary = "Handle VNPay payment callback (public endpoint)")
    public ResponseEntity<ApiResponse<PaymentDTOs.PaymentResponse>> vnpayCallback(
            @RequestParam Map<String, String> params) {
        PaymentDTOs.PaymentResponse payment = paymentService.processVNPayCallback(params);
        return ResponseEntity.ok(ApiResponse.success("Payment callback processed", payment));
    }

    @GetMapping("/vnpay/return")
    @Operation(summary = "Handle VNPay return redirect (public endpoint)")
    public ResponseEntity<ApiResponse<PaymentDTOs.PaymentResponse>> vnpayReturn(
            @RequestParam Map<String, String> params) {
        PaymentDTOs.PaymentResponse payment = paymentService.processVNPayCallback(params);
        return ResponseEntity.ok(ApiResponse.success("Payment return processed", payment));
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
