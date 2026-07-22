package com.luxeway.service;

import com.luxeway.entity.PaymentSetting;
import com.luxeway.repository.PaymentSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentSettingService {

    private final PaymentSettingRepository paymentSettingRepository;

    @Transactional
    public PaymentSetting getActiveSetting() {
        return paymentSettingRepository.findFirstByEnabledTrue()
                .orElseGet(this::createDemoDefaultSetting);
    }

    private PaymentSetting createDemoDefaultSetting() {
        PaymentSetting setting = PaymentSetting.builder()
                .id("P1")
                .bankName("LuxeWay Demo Bank")
                .accountNumber("0000000000")
                .ownerName("LuxeWay Demo")
                .enabled(true)
                .updatedBy("system")
                .build();
        return paymentSettingRepository.save(setting);
    }

    @Transactional
    public PaymentSetting updateSetting(PaymentSetting updateRequest, String adminEmail) {
        PaymentSetting existing = paymentSettingRepository.findById("P1")
                .orElseGet(() -> PaymentSetting.builder().id("P1").build());

        existing.setBankName(updateRequest.getBankName());
        existing.setAccountNumber(updateRequest.getAccountNumber());
        existing.setOwnerName(updateRequest.getOwnerName());
        existing.setEnabled(updateRequest.isEnabled());
        existing.setUpdatedBy(adminEmail);
        existing.setUpdatedTime(LocalDateTime.now());
        // Version is automatically handled by JPA @Version

        log.info("Payment settings updated by admin={}: bank={}, account={}", adminEmail, existing.getBankName(), existing.getAccountNumber());
        return paymentSettingRepository.save(existing);
    }
}
