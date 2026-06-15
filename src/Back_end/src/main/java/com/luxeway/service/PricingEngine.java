package com.luxeway.service;

import com.luxeway.entity.Vehicle;
import com.luxeway.entity.VehiclePricingRule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class PricingEngine {

    public BigDecimal calculateBasePriceForPeriod(Vehicle vehicle, LocalDate start, LocalDate end) {
        BigDecimal total = BigDecimal.ZERO;
        java.util.Set<VehiclePricingRule> rules = vehicle.getPricingRules();
        BigDecimal base = vehicle.getPricePerDay();

        if (rules == null || rules.isEmpty()) {
            // No custom pricing rules, use standard daily rate
            long days = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
            return base.multiply(BigDecimal.valueOf(days));
        }

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            BigDecimal dayMultiplier = BigDecimal.ONE;

            // 1. Check Holiday/Seasonal rules (Precise Overrides)
            LocalDate current = date;
            VehiclePricingRule activeRule = rules.stream()
                .filter(r -> r.getStartDate() != null && !current.isBefore(r.getStartDate()) && !current.isAfter(r.getEndDate()))
                .findFirst().orElse(null);

            if (activeRule != null) {
                dayMultiplier = activeRule.getMultiplier();
            } else {
                // 2. Check Weekend Multipliers
                DayOfWeek day = date.getDayOfWeek();
                if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
                    VehiclePricingRule weekendRule = rules.stream()
                        .filter(r -> "WEEKEND".equals(r.getRuleType()))
                        .findFirst().orElse(null);
                    if (weekendRule != null) {
                        dayMultiplier = weekendRule.getMultiplier();
                    }
                }
            }

            total = total.add(base.multiply(dayMultiplier));
        }
        return total;
    }
}
