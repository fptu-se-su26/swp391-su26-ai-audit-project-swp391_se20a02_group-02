package com.luxeway.dto.pricing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingBreakdown {
    private String vehicleId;
    private String vehicleType;
    private int totalDays;
    private BigDecimal basePricePerDay;
    private BigDecimal baseTotalPrice;
    
    // Breakdowns
    private List<DailyBreakdown> dailyBreakdown;
    private BigDecimal addonsTotal;
    private BigDecimal insuranceTotal;
    private BigDecimal subtotal;
    private BigDecimal serviceFee;
    private BigDecimal taxes;
    private BigDecimal loyaltyDiscount;
    private String loyaltyTier;
    private BigDecimal finalTotal;
    private BigDecimal deposit;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyBreakdown {
        private String date;
        private BigDecimal basePrice;
        private BigDecimal multiplier;
        private List<String> appliedRules;
        private BigDecimal finalPrice;
    }
}
