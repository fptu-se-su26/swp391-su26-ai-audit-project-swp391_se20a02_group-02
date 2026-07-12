package com.luxeway.repository;

import com.luxeway.entity.PaymentSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentSettingRepository extends JpaRepository<PaymentSetting, String> {
    Optional<PaymentSetting> findFirstByEnabledTrue();
}
