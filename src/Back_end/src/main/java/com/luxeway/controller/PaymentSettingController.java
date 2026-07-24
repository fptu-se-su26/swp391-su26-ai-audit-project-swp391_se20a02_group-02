package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.PaymentSetting;
import com.luxeway.entity.User;
import com.luxeway.service.PaymentSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment-settings")
@RequiredArgsConstructor
@Tag(name = "Payment Settings", description = "Configure direct bank transfer details")
public class PaymentSettingController {

    private final PaymentSettingService paymentSettingService;

    @GetMapping
    @Operation(summary = "Get the active bank transfer settings (publicly accessible)")
    public ResponseEntity<ApiResponse<PaymentSetting>> getActiveSetting() {
        PaymentSetting setting = paymentSettingService.getActiveSetting();
        return ResponseEntity.ok(ApiResponse.success("Active payment settings retrieved", setting));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update the active bank transfer settings (Admin only)")
    public ResponseEntity<ApiResponse<PaymentSetting>> updateSetting(
            @AuthenticationPrincipal User admin,
            @RequestBody PaymentSetting updateRequest) {
        PaymentSetting updated = paymentSettingService.updateSetting(updateRequest, admin.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Payment settings updated successfully", updated));
    }
}
