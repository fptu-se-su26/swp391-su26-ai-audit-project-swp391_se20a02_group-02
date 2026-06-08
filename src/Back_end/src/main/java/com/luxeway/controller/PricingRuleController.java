package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.dto.pricing.PricingBreakdown;
import com.luxeway.entity.PricingRule;
import com.luxeway.entity.User;
import com.luxeway.repository.PricingRuleRepository;
import com.luxeway.service.PricingEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/pricing")
@RequiredArgsConstructor
@Tag(name = "Pricing Rules & Engine", description = "Calculate real-time prices & manage pricing multipliers")
public class PricingRuleController {

    private final PricingEngineService pricingEngineService;
    private final PricingRuleRepository pricingRuleRepository;

    @PostMapping("/calculate")
    @Operation(summary = "Calculate real-time dynamic invoice price breakdown")
    public ResponseEntity<ApiResponse<PricingBreakdown>> calculatePrice(
            @AuthenticationPrincipal User user,
            @RequestBody CalculatePriceRequest request) {
        
        String userId = user != null ? user.getId() : null;
        PricingBreakdown breakdown = pricingEngineService.calculatePrice(
                request.getVehicleId(),
                request.getVehicleType(),
                userId,
                request.getStartDate(),
                request.getEndDate(),
                request.getAddonIds(),
                request.getInsuranceId()
        );
        return ResponseEntity.ok(ApiResponse.success("Price calculated successfully", breakdown));
    }

    @GetMapping("/rules/{vehicleId}")
    @Operation(summary = "Retrieve active pricing rules for a vehicle")
    public ResponseEntity<ApiResponse<List<PricingRule>>> getRules(@PathVariable String vehicleId) {
        return ResponseEntity.ok(ApiResponse.success("Pricing rules retrieved", pricingRuleRepository.findByVehicleId(vehicleId)));
    }

    @PostMapping("/rules")
    @Operation(summary = "Create a new vehicle pricing rule multiplier")
    public ResponseEntity<ApiResponse<PricingRule>> createRule(
            @RequestBody PricingRule rule) {
        PricingRule saved = pricingRuleRepository.save(rule);
        return ResponseEntity.status(201).body(ApiResponse.success("Pricing rule created", saved));
    }

    @DeleteMapping("/rules/{id}")
    @Operation(summary = "Delete an active pricing rule")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable String id) {
        pricingRuleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Pricing rule deleted", null));
    }

    @Data
    public static class CalculatePriceRequest {
        private String vehicleId;
        private String vehicleType; // car, motorbike, vehicle
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate startDate;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate endDate;
        private List<String> addonIds;
        private String insuranceId;
    }
}
