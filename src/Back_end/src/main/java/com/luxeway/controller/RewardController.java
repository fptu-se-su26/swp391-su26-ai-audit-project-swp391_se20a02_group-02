package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.RewardTransaction;
import com.luxeway.entity.User;
import com.luxeway.entity.UserLoyalty;
import com.luxeway.service.RewardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/rewards")
@RequiredArgsConstructor
@Tag(name = "Rewards & Loyalty", description = "Endpoints for loyalty point ledger & transactions statements")
public class RewardController {

    private final RewardService rewardService;

    @GetMapping("/profile")
    @Operation(summary = "Get loyalty points balance & tier level for user")
    public ResponseEntity<ApiResponse<UserLoyalty>> getProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ApiResponse.success("Loyalty profile retrieved", 
                rewardService.getUserLoyalty(user.getId())));
    }

    @GetMapping("/transactions")
    @Operation(summary = "Get historical transactions list for loyalty points ledger")
    public ResponseEntity<ApiResponse<List<RewardTransaction>>> getTransactions(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ApiResponse.success("Point ledger loaded", 
                rewardService.getRewardTransactions(user.getId())));
    }
}
