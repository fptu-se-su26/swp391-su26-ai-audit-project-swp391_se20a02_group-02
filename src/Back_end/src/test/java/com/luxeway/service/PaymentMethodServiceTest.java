package com.luxeway.service;

import com.luxeway.entity.PaymentMethod;
import com.luxeway.entity.User;
import com.luxeway.repository.PaymentMethodRepository;
import com.luxeway.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentMethodServiceTest {

    @Mock private PaymentMethodRepository paymentMethodRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private PaymentMethodService paymentMethodService;

    // =======================================================
    // Helpers
    // =======================================================

    private User createUser(String id) {
        return User.builder().id(id).build();
    }

    private PaymentMethod createPM(String id, User user, boolean isDefault) {
        PaymentMethod pm = new PaymentMethod();
        pm.setId(id);
        pm.setUser(user);
        pm.setIsDefault(isDefault);
        pm.setIsActive(true);
        return pm;
    }

    // =======================================================
    // getUserPaymentMethods
    // =======================================================

    @Test
    void getUserPaymentMethods_ReturnsActiveList() {
        when(paymentMethodRepository.findActiveByUserId("u1")).thenReturn(List.of(new PaymentMethod()));
        
        List<PaymentMethod> result = paymentMethodService.getUserPaymentMethods("u1");
        
        assertEquals(1, result.size());
    }

    // =======================================================
    // savePaymentMethod
    // =======================================================

    @Test
    void savePaymentMethod_UserDoesNotExist_ThrowsException() {
        when(userRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> 
            paymentMethodService.savePaymentMethod("unknown", new PaymentMethod()));
    }

    @Test
    void savePaymentMethod_FirstMethod_ForcesDefault() {
        User user = createUser("u1");
        PaymentMethod newPm = new PaymentMethod();
        newPm.setIsDefault(false); // Should be overridden to true

        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(paymentMethodRepository.findActiveByUserId("u1")).thenReturn(Collections.emptyList());
        when(paymentMethodRepository.save(newPm)).thenReturn(newPm);

        PaymentMethod result = paymentMethodService.savePaymentMethod("u1", newPm);

        assertTrue(result.getIsDefault());
        assertEquals(user, result.getUser());
    }

    @Test
    void savePaymentMethod_NewDefault_UnsetsOldDefaults() {
        User user = createUser("u1");
        PaymentMethod oldDefault = createPM("pm1", user, true);
        
        PaymentMethod newPm = new PaymentMethod();
        newPm.setIsDefault(true);

        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(paymentMethodRepository.findActiveByUserId("u1")).thenReturn(List.of(oldDefault));
        when(paymentMethodRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        paymentMethodService.savePaymentMethod("u1", newPm);

        // Old default should have been updated to false
        assertFalse(oldDefault.getIsDefault());
        verify(paymentMethodRepository).save(oldDefault); // Verify save was called to update old
        verify(paymentMethodRepository).save(newPm); // Verify new one was saved
    }

    // =======================================================
    // setDefault
    // =======================================================

    @Test
    void setDefault_Unauthorized_ThrowsException() {
        User user1 = createUser("u1");
        PaymentMethod target = createPM("pm1", user1, false);

        when(paymentMethodRepository.findById("pm1")).thenReturn(Optional.of(target));

        // Caller is "u2", owner is "u1"
        assertThrows(RuntimeException.class, () -> 
            paymentMethodService.setDefault("u2", "pm1"));
    }

    @Test
    void setDefault_UpdatesCorrectly() {
        User user = createUser("u1");
        PaymentMethod pm1 = createPM("pm1", user, false);
        PaymentMethod pm2 = createPM("pm2", user, true); // currently default

        when(paymentMethodRepository.findById("pm1")).thenReturn(Optional.of(pm1));
        when(paymentMethodRepository.findActiveByUserId("u1")).thenReturn(List.of(pm1, pm2));
        when(paymentMethodRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        PaymentMethod result = paymentMethodService.setDefault("u1", "pm1");

        assertTrue(pm1.getIsDefault());
        assertFalse(pm2.getIsDefault());
        verify(paymentMethodRepository).save(pm1);
        verify(paymentMethodRepository).save(pm2);
    }

    // =======================================================
    // deletePaymentMethod
    // =======================================================

    @Test
    void deletePaymentMethod_SoftDeletes_AndAutoPromotesNewDefault() {
        User user = createUser("u1");
        PaymentMethod target = createPM("pm1", user, true); // Deleting the default
        PaymentMethod remainingPm = createPM("pm2", user, false);

        when(paymentMethodRepository.findById("pm1")).thenReturn(Optional.of(target));
        when(paymentMethodRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        
        // After deletion, remaining active is just pm2
        when(paymentMethodRepository.findActiveByUserId("u1")).thenReturn(List.of(remainingPm));

        paymentMethodService.deletePaymentMethod("u1", "pm1");

        assertFalse(target.getIsActive());
        assertFalse(target.getIsDefault());
        verify(paymentMethodRepository).save(target);

        // Auto promotion check
        assertTrue(remainingPm.getIsDefault());
        verify(paymentMethodRepository).save(remainingPm);
    }

    @Test
    void deletePaymentMethod_Unauthorized_ThrowsException() {
        User user = createUser("u1");
        PaymentMethod target = createPM("pm1", user, false);

        when(paymentMethodRepository.findById("pm1")).thenReturn(Optional.of(target));

        assertThrows(RuntimeException.class, () -> 
            paymentMethodService.deletePaymentMethod("hacker", "pm1"));
    }
}
