package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.CarInsurance;
import com.luxeway.entity.InsurancePackage;
import com.luxeway.entity.MotorbikeDeposit;
import com.luxeway.repository.CarInsuranceRepository;
import com.luxeway.repository.InsurancePackageRepository;
import com.luxeway.repository.MotorbikeDepositRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/insurance")
@RequiredArgsConstructor
@Tag(name = "Insurance Packages", description = "Query insurances and deposits for booking processes")
public class InsuranceController {

    private final CarInsuranceRepository carInsuranceRepository;
    private final MotorbikeDepositRepository motorbikeDepositRepository;
    private final InsurancePackageRepository insurancePackageRepository;

    @GetMapping("/car/{carId}")
    @Operation(summary = "Get specific insurances available for a car listing")
    public ResponseEntity<ApiResponse<List<CarInsurance>>> getCarInsurances(@PathVariable String carId) {
        List<CarInsurance> carInsurances = carInsuranceRepository.findByCarIdAndIsActiveTrue(carId);
        // Fallback to standard global packages if no specific car insurances are configured
        if (carInsurances.isEmpty()) {
            List<InsurancePackage> globals = insurancePackageRepository.findAll();
            // Map global packages to CarInsurance format for UI consistency
            for (InsurancePackage g : globals) {
                carInsurances.add(CarInsurance.builder()
                        .id(g.getId())
                        .name(g.getName())
                        .description(g.getDescription())
                        .costPerDay(g.getCostPerDay())
                        .coverageLimit(g.getCoverageLimit())
                        .isActive(g.getIsActive())
                        .build());
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Car insurances loaded", carInsurances));
    }

    @GetMapping("/motorbike/{bikeId}")
    @Operation(summary = "Get deposit packages configured for a motorbike")
    public ResponseEntity<ApiResponse<List<MotorbikeDeposit>>> getMotorbikeDeposits(@PathVariable String bikeId) {
        return ResponseEntity.ok(ApiResponse.success("Motorbike deposits loaded", 
                motorbikeDepositRepository.findByMotorbikeIdAndIsActiveTrue(bikeId)));
    }

    @GetMapping("/global")
    @Operation(summary = "Get list of global platform insurance packages")
    public ResponseEntity<ApiResponse<List<InsurancePackage>>> getGlobalPackages() {
        return ResponseEntity.ok(ApiResponse.success("Global insurance packages loaded", 
                insurancePackageRepository.findAll()));
    }
}
