package com.luxeway.service;

import com.luxeway.entity.PaymentMethod;
import com.luxeway.entity.User;
import com.luxeway.repository.PaymentMethodRepository;
import com.luxeway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PaymentMethod> getUserPaymentMethods(String userId) {
        return paymentMethodRepository.findActiveByUserId(userId);
    }

    @Transactional
    public PaymentMethod savePaymentMethod(String userId, PaymentMethod pm) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        pm.setUser(user);

        // Fetch existing methods
        List<PaymentMethod> existing = paymentMethodRepository.findActiveByUserId(userId);
        
        // If this is the first payment method, force it to be default
        if (existing.isEmpty()) {
            pm.setIsDefault(true);
        } else if (pm.getIsDefault()) {
            // Reset other defaults
            for (PaymentMethod e : existing) {
                if (e.getIsDefault()) {
                    e.setIsDefault(false);
                    paymentMethodRepository.save(e);
                }
            }
        }

        PaymentMethod saved = paymentMethodRepository.save(pm);
        log.info("Saved new payment method: {} for user: {}", saved.getId(), userId);
        return saved;
    }

    @Transactional
    public PaymentMethod setDefault(String userId, String id) {
        PaymentMethod target = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment method not found: " + id));

        if (!target.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized payment method context access");
        }

        List<PaymentMethod> existing = paymentMethodRepository.findActiveByUserId(userId);
        for (PaymentMethod pm : existing) {
            if (pm.getId().equals(id)) {
                pm.setIsDefault(true);
            } else {
                pm.setIsDefault(false);
            }
            paymentMethodRepository.save(pm);
        }

        log.info("Set default payment method: {} for user: {}", id, userId);
        return target;
    }

    @Transactional
    public void deletePaymentMethod(String userId, String id) {
        PaymentMethod pm = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment method not found: " + id));

        if (!pm.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized payment method context access");
        }

        // Soft-delete by setting isActive to false
        pm.setIsActive(false);
        pm.setIsDefault(false);
        paymentMethodRepository.save(pm);
        log.info("Soft deleted payment method: {}", id);

        // If we deleted the default card, set another active one as default if available
        List<PaymentMethod> remaining = paymentMethodRepository.findActiveByUserId(userId);
        if (!remaining.isEmpty() && remaining.stream().noneMatch(PaymentMethod::getIsDefault)) {
            PaymentMethod newDefault = remaining.get(0);
            newDefault.setIsDefault(true);
            paymentMethodRepository.save(newDefault);
            log.info("Auto-promoted new default payment method: {}", newDefault.getId());
        }
    }
}
