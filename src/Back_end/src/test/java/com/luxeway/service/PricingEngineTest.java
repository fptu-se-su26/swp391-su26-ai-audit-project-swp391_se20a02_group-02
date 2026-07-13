package com.luxeway.service;

import com.luxeway.entity.Vehicle;
import com.luxeway.entity.VehiclePricingRule;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
class PricingEngineTest {

    @InjectMocks
    private PricingEngine pricingEngine;

    // =======================================================
    // calculateBasePriceForPeriod
    // =======================================================

    @Test
    void calculateBasePriceForPeriod_NoRules_ReturnsFlatRate() {
        Vehicle vehicle = Vehicle.builder()
                .pricePerDay(new BigDecimal("100.00"))
                .pricingRules(Collections.emptySet())
                .build();
                
        LocalDate start = LocalDate.of(2023, 10, 2); // Monday
        LocalDate end = LocalDate.of(2023, 10, 4);   // Wednesday (3 days inclusive)

        BigDecimal result = pricingEngine.calculateBasePriceForPeriod(vehicle, start, end);

        assertEquals(new BigDecimal("300.00"), result);
    }

    @Test
    void calculateBasePriceForPeriod_WithSpecificRule_ReturnsAdjustedPrice() {
        VehiclePricingRule rule = VehiclePricingRule.builder()
                .startDate(LocalDate.of(2023, 10, 2))
                .endDate(LocalDate.of(2023, 10, 2))
                .multiplier(new BigDecimal("1.5"))
                .build();
                
        Vehicle vehicle = Vehicle.builder()
                .pricePerDay(new BigDecimal("100.00"))
                .pricingRules(Set.of(rule))
                .build();
                
        LocalDate start = LocalDate.of(2023, 10, 2);
        LocalDate end = LocalDate.of(2023, 10, 2);

        BigDecimal result = pricingEngine.calculateBasePriceForPeriod(vehicle, start, end);

        assertEquals(0, new BigDecimal("150").compareTo(result));
    }

    @Test
    void calculateBasePriceForPeriod_WeekendWithRule_ReturnsWeekendPrice() {
        VehiclePricingRule weekendRule = VehiclePricingRule.builder()
                .ruleType("WEEKEND")
                .multiplier(new BigDecimal("1.2"))
                .build();
                
        Vehicle vehicle = Vehicle.builder()
                .pricePerDay(new BigDecimal("100.00"))
                .pricingRules(Set.of(weekendRule))
                .build();
                
        LocalDate start = LocalDate.of(2023, 10, 7); // Saturday
        LocalDate end = LocalDate.of(2023, 10, 7);

        BigDecimal result = pricingEngine.calculateBasePriceForPeriod(vehicle, start, end);

        // 100 * 1.2 = 120
        // NOTE: The implementation adds big decimals together without scale matching.
        // so 100.00 * 1.2 = 120.000
        assertEquals(0, new BigDecimal("120").compareTo(result));
    }

    @Test
    void calculateBasePriceForPeriod_WeekendNoRule_ReturnsBasePrice() {
        Vehicle vehicle = Vehicle.builder()
                .pricePerDay(new BigDecimal("100.00"))
                .pricingRules(Collections.emptySet())
                .build();
                
        LocalDate start = LocalDate.of(2023, 10, 7); // Saturday
        LocalDate end = LocalDate.of(2023, 10, 7);

        BigDecimal result = pricingEngine.calculateBasePriceForPeriod(vehicle, start, end);

        assertEquals(new BigDecimal("100.00"), result);
    }
}
