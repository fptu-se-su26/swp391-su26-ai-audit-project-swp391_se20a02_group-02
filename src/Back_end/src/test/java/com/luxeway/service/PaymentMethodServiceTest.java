package com.luxeway.service;

import com.luxeway.entity.PaymentMethod;
import com.luxeway.entity.User;
import com.luxeway.repository.PaymentMethodRepository;
import com.luxeway.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * LW-154: getUserPaymentMethods (UTC-027-001)
 * LW-155: savePaymentMethod     (UTC-027-002)
 * LW-156: setDefault            (UTC-027-003)
 * LW-157: deletePaymentMethod   (UTC-027-004)
 */
@ExtendWith(MockitoExtension.class)
class PaymentMethodServiceTest {

    @Mock private PaymentMethodRepository paymentMethodRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private PaymentMethodService service;

    private User user;
    private PaymentMethod pm1;
    private PaymentMethod pm2;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId("u1");
        user.setDisplayName("Nguyen Van A");

        pm1 = new PaymentMethod();
        pm1.setId("pm1");
        pm1.setUser(user);
        pm1.setIsDefault(true);
        pm1.setIsActive(true);
        pm1.setType("CARD");
        pm1.setLabel("Visa *1234");

        pm2 = new PaymentMethod();
        pm2.setId("pm2");
        pm2.setUser(user);
        pm2.setIsDefault(false);
        pm2.setIsActive(true);
        pm2.setType("CARD");
        pm2.setLabel("Mastercard *5678");
    }

    // ===== LW-154: getUserPaymentMethods =====

    /** UTCID01 (Normal): user has active payment methods → returns list */
    @Test
    void getUserPaymentMethods_UTCID01_userHasMethods_returnsList() {
        when(paymentMethodRepository.findActiveByUserId("u1")).thenReturn(List.of(pm1, pm2));

        List<PaymentMethod> result = service.getUserPaymentMethods("u1");

        assertNotNull(result);
        assertEquals(2, result.size());
    }

    /** UTCID02 (Abnormal): userId does not exist → returns empty list */
    @Test
    void getUserPaymentMethods_UTCID02_userNotExist_returnsEmpty() {
        when(paymentMethodRepository.findActiveByUserId("non-existent")).thenReturn(Collections.emptyList());

        List<PaymentMethod> result = service.getUserPaymentMethods("non-existent");
        assertTrue(result.isEmpty());
    }

    /** UTCID03 (Boundary): userId=1 (valid but no relations) → returns empty list */
    @Test
    void getUserPaymentMethods_UTCID03_boundaryUserId_returnsEmpty() {
        when(paymentMethodRepository.findActiveByUserId("1")).thenReturn(Collections.emptyList());

        List<PaymentMethod> result = service.getUserPaymentMethods("1");
        assertTrue(result.isEmpty());
    }

    // ===== LW-155: savePaymentMethod =====

    /** UTCID01 (Normal): user does not exist → throws RuntimeException */
    @Test
    void savePaymentMethod_UTCID01_userNotFound_throwsRuntimeException() {
        when(userRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.savePaymentMethod("unknown", new PaymentMethod()));
    }

    /** UTCID02 (Normal): user exists, no existing payment methods → first PM set as default */
    @Test
    void savePaymentMethod_UTCID02_firstMethod_forcesDefault() {
        PaymentMethod newPm = new PaymentMethod();
        newPm.setIsDefault(false);
        newPm.setId("pm-new");

        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(paymentMethodRepository.findActiveByUserId("u1")).thenReturn(Collections.emptyList());
        when(paymentMethodRepository.save(any())).thenReturn(newPm);

        PaymentMethod result = service.savePaymentMethod("u1", newPm);

        assertTrue(newPm.getIsDefault()); // forced to true
        assertNotNull(result);
    }

    /** UTCID03 (Normal): user exists with existing methods, newPm.isDefault=true → updates old defaults */
    @Test
    void savePaymentMethod_UTCID03_existingMethods_updatesDefaults() {
        PaymentMethod newPm = new PaymentMethod();
        newPm.setIsDefault(true);
        newPm.setId("pm-new");

        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(paymentMethodRepository.findActiveByUserId("u1")).thenReturn(List.of(pm1));
        when(paymentMethodRepository.save(any())).thenReturn(newPm);

        PaymentMethod result = service.savePaymentMethod("u1", newPm);

        assertFalse(pm1.getIsDefault()); // old default reset
        assertNotNull(result);
    }

    /** UTCID04 (Abnormal): userId=-1 does not exist → throws RuntimeException */
    @Test
    void savePaymentMethod_UTCID04_userIdNegative_throwsRuntimeException() {
        when(userRepository.findById("-1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.savePaymentMethod("-1", new PaymentMethod()));
    }

    /** UTCID05 (Boundary): userId=1, valid but no relations → returns empty-listed object */
    @Test
    void savePaymentMethod_UTCID05_boundaryUserId_returnsEmptyLists() {
        User boundaryUser = new User();
        boundaryUser.setId("1");
        PaymentMethod newPm = new PaymentMethod();
        newPm.setId("pm-boundary");
        newPm.setIsDefault(false);

        when(userRepository.findById("1")).thenReturn(Optional.of(boundaryUser));
        when(paymentMethodRepository.findActiveByUserId("1")).thenReturn(Collections.emptyList());
        when(paymentMethodRepository.save(any())).thenReturn(newPm);

        PaymentMethod result = service.savePaymentMethod("1", newPm);
        assertNotNull(result);
    }

    // ===== LW-156: setDefault =====

    /** UTCID01 (Normal): PM belongs to different user (unauthorized) → throws RuntimeException */
    @Test
    void setDefault_UTCID01_unauthorized_throwsRuntimeException() {
        User otherUser = new User();
        otherUser.setId("u2");
        pm1.setUser(otherUser);

        when(paymentMethodRepository.findById("pm1")).thenReturn(Optional.of(pm1));

        assertThrows(RuntimeException.class, () -> service.setDefault("u1", "pm1"));
    }

    /** UTCID02 (Normal): PM belongs to user → sets as default, resets others */
    @Test
    void setDefault_UTCID02_authorized_setsDefaultAndResetsOthers() {
        when(paymentMethodRepository.findById("pm1")).thenReturn(Optional.of(pm1));
        when(paymentMethodRepository.findActiveByUserId("u1")).thenReturn(List.of(pm1, pm2));
        when(paymentMethodRepository.save(any())).thenReturn(pm1);

        PaymentMethod result = service.setDefault("u1", "pm1");

        assertNotNull(result);
        assertTrue(pm1.getIsDefault());
        assertFalse(pm2.getIsDefault());
    }

    /** UTCID03 (Abnormal): userId=-1 does not exist → PM not found → throws RuntimeException */
    @Test
    void setDefault_UTCID03_userIdNegative_throwsRuntimeException() {
        when(paymentMethodRepository.findById("pm1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.setDefault("-1", "pm1"));
    }

    /** UTCID04 (Boundary): userId=1 (valid boundary, no relations) → returns empty-listed object */
    @Test
    void setDefault_UTCID04_boundaryUserId_returnsEmptyLists() {
        User boundaryUser = new User();
        boundaryUser.setId("1");
        pm1.setUser(boundaryUser);

        when(paymentMethodRepository.findById("pm1")).thenReturn(Optional.of(pm1));
        when(paymentMethodRepository.findActiveByUserId("1")).thenReturn(Collections.emptyList());

        PaymentMethod result = service.setDefault("1", "pm1");
        assertNotNull(result);
        assertEquals("pm1", result.getId());
    }

    // ===== LW-157: deletePaymentMethod =====

    /** UTCID01 (Normal): PM belongs to user → soft-deletes and promotes new default */
    @Test
    void deletePaymentMethod_UTCID01_belongsToUser_softDeletesAndPromotes() {
        pm1.setIsDefault(true);
        when(paymentMethodRepository.findById("pm1")).thenReturn(Optional.of(pm1));
        when(paymentMethodRepository.save(any())).thenReturn(pm1);
        when(paymentMethodRepository.findActiveByUserId("u1")).thenReturn(List.of(pm2));

        assertDoesNotThrow(() -> service.deletePaymentMethod("u1", "pm1"));

        assertFalse(pm1.getIsActive());
        verify(paymentMethodRepository, atLeast(2)).save(any());
    }

    /** UTCID02 (Normal): PM belongs to different user → throws RuntimeException */
    @Test
    void deletePaymentMethod_UTCID02_unauthorized_throwsRuntimeException() {
        User otherUser = new User();
        otherUser.setId("hacker");
        pm1.setUser(otherUser);

        when(paymentMethodRepository.findById("pm1")).thenReturn(Optional.of(pm1));

        assertThrows(RuntimeException.class, () -> service.deletePaymentMethod("u1", "pm1"));
    }

    /** UTCID03 (Abnormal): userId=-1 not found → throws RuntimeException */
    @Test
    void deletePaymentMethod_UTCID03_userIdNegative_throwsRuntimeException() {
        when(paymentMethodRepository.findById("pm1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.deletePaymentMethod("-1", "pm1"));
    }

    /** UTCID04 (Boundary): userId=1 (valid boundary, no relations) → returns empty-listed object */
    @Test
    void deletePaymentMethod_UTCID04_boundaryUserId_softDeletes() {
        User boundaryUser = new User();
        boundaryUser.setId("1");
        pm1.setUser(boundaryUser);

        when(paymentMethodRepository.findById("pm1")).thenReturn(Optional.of(pm1));
        when(paymentMethodRepository.save(any())).thenReturn(pm1);
        when(paymentMethodRepository.findActiveByUserId("1")).thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> service.deletePaymentMethod("1", "pm1"));
        assertFalse(pm1.getIsActive());
    }
}
