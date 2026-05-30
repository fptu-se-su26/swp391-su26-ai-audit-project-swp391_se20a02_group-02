package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.PaymentMethod;
import com.luxeway.entity.User;
import com.luxeway.service.PaymentMethodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payment-methods")
@RequiredArgsConstructor
@Tag(name = "Payment Methods", description = "Saved credit cards and billing settings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    @GetMapping
    @Operation(summary = "Get current user saved active payment methods")
    public ResponseEntity<ApiResponse<List<PaymentMethod>>> getMyPaymentMethods(
            @AuthenticationPrincipal User user) {
        List<PaymentMethod> methods = paymentMethodService.getUserPaymentMethods(user.getId());
        return ResponseEntity.ok(ApiResponse.success(methods));
    }

    @PostMapping
    @Operation(summary = "Save a new payment method details")
    public ResponseEntity<ApiResponse<PaymentMethod>> addPaymentMethod(
            @AuthenticationPrincipal User user,
            @RequestBody PaymentMethod request) {
        PaymentMethod pm = paymentMethodService.savePaymentMethod(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Payment method saved successfully", pm));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Set a saved card as the default payment profile")
    public ResponseEntity<ApiResponse<PaymentMethod>> setDefaultCard(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        PaymentMethod pm = paymentMethodService.setDefault(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Card set as default payment profile", pm));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove a saved payment method")
    public ResponseEntity<ApiResponse<Void>> removePaymentMethod(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        paymentMethodService.deletePaymentMethod(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Payment method deleted successfully", null));
    }
}
