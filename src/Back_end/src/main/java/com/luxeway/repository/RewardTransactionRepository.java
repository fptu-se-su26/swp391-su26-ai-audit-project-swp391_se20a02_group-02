package com.luxeway.repository;

import com.luxeway.entity.RewardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, String> {
    List<RewardTransaction> findByUserIdOrderByCreatedAtDesc(String userId);
}
