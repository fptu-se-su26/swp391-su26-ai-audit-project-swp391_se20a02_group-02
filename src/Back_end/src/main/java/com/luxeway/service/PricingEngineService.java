package com.luxeway.service;

import com.luxeway.dto.pricing.PricingBreakdown;
import com.luxeway.entity.*;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PricingEngineService {

    private final CarRepository carRepository;
    private final MotorbikeRepository motorbikeRepository;
    private final VehicleRepository vehicleRepository;

    private final PricingRuleRepository pricingRuleRepository;
    private final VehiclePricingRuleRepository vehiclePricingRuleRepository;

    private final CarAddonRepository carAddonRepository;
    private final MotorbikeAddonRepository motorbikeAddonRepository;
    private final VehicleAddonRepository vehicleAddonRepository;

    private final CarInsuranceRepository carInsuranceRepository;
    private final MotorbikeDepositRepository motorbikeDepositRepository;

    private final UserLoyaltyRepository userLoyaltyRepository;

    public PricingBreakdown calculatePrice(String vehicleId, String vehicleType, String userId, 
                                           LocalDate startDate, LocalDate endDate, 
                                           List<String> addonIds, String insuranceId) {
        
        log.info("Calculating dynamic price for vehicleId: {}, type: {}, from {} to {}", 
                 vehicleId, vehicleType, startDate, endDate);

        BigDecimal basePricePerDay = BigDecimal.ZERO;
        BigDecimal deposit = BigDecimal.ZERO;

        // 1. Fetch base price & deposit
        if ("car".equalsIgnoreCase(vehicleType)) {
            Car car = carRepository.findById(vehicleId)
                    .orElseThrow(() -> new IllegalArgumentException("Car not found: " + vehicleId));
            basePricePerDay = car.getPricePerDay();
            deposit = car.getDeposit();
        } else if ("motorbike".equalsIgnoreCase(vehicleType)) {
            Motorbike bike = motorbikeRepository.findById(vehicleId)
                    .orElseThrow(() -> new IllegalArgumentException("Motorbike not found: " + vehicleId));
            basePricePerDay = bike.getPricePerDay();
            deposit = bike.getDeposit();
        } else {
            // General vehicle
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + vehicleId));
            basePricePerDay = vehicle.getPricePerDay();
            deposit = vehicle.getDeposit();
        }

        // Calculate days
        int totalDays = (int) ChronoUnit.DAYS.between(startDate, endDate);
        if (totalDays <= 0) totalDays = 1;

        // 2. Load pricing rules
        List<PricingRule> rules = new ArrayList<>();
        List<VehiclePricingRule> vehicleRules = new ArrayList<>();
        
        if ("car".equalsIgnoreCase(vehicleType) || "motorbike".equalsIgnoreCase(vehicleType)) {
            rules = pricingRuleRepository.findByVehicleIdAndIsActiveTrue(vehicleId);
        } else {
            vehicleRules = vehiclePricingRuleRepository.findByVehicleId(vehicleId);
        }

        // 3. Daily Breakdown
        List<PricingBreakdown.DailyBreakdown> dailyBreakdowns = new ArrayList<>();
        BigDecimal baseTotalPrice = BigDecimal.ZERO;

        for (int i = 0; i < totalDays; i++) {
            LocalDate date = startDate.plusDays(i);
            BigDecimal dayMultiplier = BigDecimal.ONE;
            List<String> appliedRules = new ArrayList<>();

            // Check rules
            if ("car".equalsIgnoreCase(vehicleType) || "motorbike".equalsIgnoreCase(vehicleType)) {
                for (PricingRule rule : rules) {
                    if (isRuleApplicable(rule, date)) {
                        dayMultiplier = dayMultiplier.multiply(rule.getMultiplier());
                        appliedRules.add(rule.getName() + " (" + rule.getRuleType() + ")");
                    }
                }
            } else {
                for (VehiclePricingRule rule : vehicleRules) {
                    if (isVehicleRuleApplicable(rule, date)) {
                        dayMultiplier = dayMultiplier.multiply(rule.getMultiplier());
                        appliedRules.add(rule.getName() + " (" + rule.getRuleType() + ")");
                    }
                }
            }

            // Fallback default weekend rule if no custom rules exist
            if (appliedRules.isEmpty() && (date.getDayOfWeek().getValue() == 6 || date.getDayOfWeek().getValue() == 7)) {
                dayMultiplier = new BigDecimal("1.15");
                appliedRules.add("Default Weekend Rate (1.15x)");
            }

            BigDecimal finalPriceForDay = basePricePerDay.multiply(dayMultiplier).setScale(0, RoundingMode.HALF_UP);
            baseTotalPrice = baseTotalPrice.add(finalPriceForDay);

            dailyBreakdowns.add(PricingBreakdown.DailyBreakdown.builder()
                    .date(date.format(DateTimeFormatter.ISO_LOCAL_DATE))
                    .basePrice(basePricePerDay)
                    .multiplier(dayMultiplier)
                    .appliedRules(appliedRules)
                    .finalPrice(finalPriceForDay)
                    .build());
        }

        // 4. Calculate Addons
        BigDecimal addonsTotal = BigDecimal.ZERO;
        if (addonIds != null && !addonIds.isEmpty()) {
            if ("car".equalsIgnoreCase(vehicleType)) {
                List<CarAddon> addons = carAddonRepository.findAllById(addonIds);
                for (CarAddon addon : addons) {
                    addonsTotal = addonsTotal.add(addon.getPricePerDay().multiply(BigDecimal.valueOf(totalDays)));
                }
            } else if ("motorbike".equalsIgnoreCase(vehicleType)) {
                List<MotorbikeAddon> addons = motorbikeAddonRepository.findAllById(addonIds);
                for (MotorbikeAddon addon : addons) {
                    addonsTotal = addonsTotal.add(addon.getPricePerDay().multiply(BigDecimal.valueOf(totalDays)));
                }
            } else {
                List<VehicleAddon> addons = vehicleAddonRepository.findAllById(addonIds);
                for (VehicleAddon addon : addons) {
                    addonsTotal = addonsTotal.add(addon.getPricePerDay().multiply(BigDecimal.valueOf(totalDays)));
                }
            }
        }

        // 5. Calculate Insurance Package
        BigDecimal insuranceTotal = BigDecimal.ZERO;
        if (insuranceId != null && !insuranceId.isEmpty() && "car".equalsIgnoreCase(vehicleType)) {
            CarInsurance insurance = carInsuranceRepository.findById(insuranceId).orElse(null);
            if (insurance != null) {
                insuranceTotal = insurance.getCostPerDay().multiply(BigDecimal.valueOf(totalDays));
            }
        }

        // 6. Fees & Taxes (System Settings fallback to business default)
        BigDecimal subtotal = baseTotalPrice.add(addonsTotal).add(insuranceTotal);
        BigDecimal serviceFee = subtotal.multiply(new BigDecimal("0.12")).setScale(0, RoundingMode.HALF_UP); // 12%
        BigDecimal taxes = subtotal.add(serviceFee).multiply(new BigDecimal("0.08")).setScale(0, RoundingMode.HALF_UP); // 8%
        BigDecimal totalBeforeDiscount = subtotal.add(serviceFee).add(taxes);

        // 7. Loyalty Discount
        BigDecimal loyaltyDiscount = BigDecimal.ZERO;
        String loyaltyTier = "SILVER";
        if (userId != null) {
            UserLoyalty loyalty = userLoyaltyRepository.findById(userId).orElse(null);
            if (loyalty != null) {
                loyaltyTier = loyalty.getTier();
                BigDecimal discountRate = BigDecimal.ZERO;
                if ("GOLD".equalsIgnoreCase(loyaltyTier)) {
                    discountRate = new BigDecimal("0.05");
                } else if ("PLATINUM".equalsIgnoreCase(loyaltyTier)) {
                    discountRate = new BigDecimal("0.10");
                } else if ("DIAMOND".equalsIgnoreCase(loyaltyTier)) {
                    discountRate = new BigDecimal("0.15");
                }
                loyaltyDiscount = totalBeforeDiscount.multiply(discountRate).setScale(0, RoundingMode.HALF_UP);
            }
        }

        BigDecimal finalTotal = totalBeforeDiscount.subtract(loyaltyDiscount);

        return PricingBreakdown.builder()
                .vehicleId(vehicleId)
                .vehicleType(vehicleType)
                .totalDays(totalDays)
                .basePricePerDay(basePricePerDay)
                .baseTotalPrice(baseTotalPrice)
                .dailyBreakdown(dailyBreakdowns)
                .addonsTotal(addonsTotal)
                .insuranceTotal(insuranceTotal)
                .subtotal(subtotal)
                .serviceFee(serviceFee)
                .taxes(taxes)
                .loyaltyDiscount(loyaltyDiscount)
                .loyaltyTier(loyaltyTier)
                .finalTotal(finalTotal)
                .deposit(deposit)
                .build();
    }

    private boolean isRuleApplicable(PricingRule rule, LocalDate date) {
        if ("WEEKEND".equalsIgnoreCase(rule.getRuleType())) {
            int day = date.getDayOfWeek().getValue();
            return day == 6 || day == 7;
        }
        if (rule.getStartDate() != null && rule.getEndDate() != null) {
            return !date.isBefore(rule.getStartDate()) && !date.isAfter(rule.getEndDate());
        }
        return false;
    }

    private boolean isVehicleRuleApplicable(VehiclePricingRule rule, LocalDate date) {
        if ("WEEKEND".equalsIgnoreCase(rule.getRuleType())) {
            int day = date.getDayOfWeek().getValue();
            return day == 6 || day == 7;
        }
        if (rule.getStartDate() != null && rule.getEndDate() != null) {
            return !date.isBefore(rule.getStartDate()) && !date.isAfter(rule.getEndDate());
        }
        return false;
    }
}
