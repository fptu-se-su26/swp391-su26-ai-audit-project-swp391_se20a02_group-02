package com.luxeway.repository;

import com.luxeway.entity.UserLoyalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserLoyaltyRepository extends JpaRepository<UserLoyalty, String> {
}
