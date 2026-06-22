package com.luxeway.service;

import com.luxeway.entity.RewardTransaction;
import com.luxeway.entity.User;
import com.luxeway.entity.UserLoyalty;
import com.luxeway.repository.RewardTransactionRepository;
import com.luxeway.repository.UserLoyaltyRepository;
import com.luxeway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RewardService {

    private final UserLoyaltyRepository userLoyaltyRepository;
    private final RewardTransactionRepository rewardTransactionRepository;
    private final UserRepository userRepository;

    public UserLoyalty getUserLoyalty(String userId) {
        return userLoyaltyRepository.findById(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
            UserLoyalty loyalty = UserLoyalty.builder()
                    .userId(userId)
                    .user(user)
                    .points(0)
                    .tier("SILVER")
                    .updatedAt(LocalDateTime.now())
                    .build();
            return userLoyaltyRepository.save(loyalty);
        });
    }

    public List<RewardTransaction> getRewardTransactions(String userId) {
        return rewardTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void earnPoints(String userId, int pointsEarned, String description) {
        log.info("Awarding {} loyalty points to user: {}", pointsEarned, userId);
        UserLoyalty loyalty = getUserLoyalty(userId);
        
        int newPoints = loyalty.getPoints() + pointsEarned;
        loyalty.setPoints(newPoints);
        loyalty.setTier(determineTier(newPoints));
        loyalty.setUpdatedAt(LocalDateTime.now());
        userLoyaltyRepository.save(loyalty);

        RewardTransaction transaction = RewardTransaction.builder()
                .user(loyalty.getUser())
                .points(pointsEarned)
                .transactionType("EARNED")
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
        rewardTransactionRepository.save(transaction);
    }

    @Transactional
    public boolean redeemPoints(String userId, int pointsRedeemed, String description) {
        log.info("Redeeming {} loyalty points for user: {}", pointsRedeemed, userId);
        UserLoyalty loyalty = getUserLoyalty(userId);

        if (loyalty.getPoints() < pointsRedeemed) {
            log.warn("Insufficient loyalty points for user {}: has {}, needs {}", 
                     userId, loyalty.getPoints(), pointsRedeemed);
            return false;
        }

        int newPoints = loyalty.getPoints() - pointsRedeemed;
        loyalty.setPoints(newPoints);
        loyalty.setTier(determineTier(newPoints));
        loyalty.setUpdatedAt(LocalDateTime.now());
        userLoyaltyRepository.save(loyalty);

        RewardTransaction transaction = RewardTransaction.builder()
                .user(loyalty.getUser())
                .points(-pointsRedeemed)
                .transactionType("REDEEMED")
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
        rewardTransactionRepository.save(transaction);
        return true;
    }

    private String determineTier(int points) {
        if (points >= 10000) {
            return "DIAMOND";
        } else if (points >= 5000) {
            return "PLATINUM";
        } else if (points >= 1000) {
            return "GOLD";
        } else {
            return "SILVER";
        }
    }
}
