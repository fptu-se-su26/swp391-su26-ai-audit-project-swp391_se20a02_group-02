package com.luxeway.service;

import com.luxeway.dto.motorbike.MotorbikeDTOs;
import com.luxeway.entity.*;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * LW-134: searchMotorbikes  (UTC-023-001)
 * LW-135: getMotorbikeById  (UTC-023-002)
 * LW-136: createMotorbike   (UTC-023-003)
 * LW-137: deleteMotorbike   (UTC-023-004)
 */
@ExtendWith(MockitoExtension.class)
class MotorbikeServiceTest {

    @Mock private MotorbikeRepository motorbikeRepository;
    @Mock private MotorbikeModelRepository motorbikeModelRepository;
    @Mock private UserRepository userRepository;
    @Mock private TranslationService translationService;

    @InjectMocks
    private MotorbikeService service;

    private Motorbike motorbike;
    private User owner;
    private MotorbikeModel model;

    @BeforeEach
    void setUp() {
        MotorbikeBrand brand = new MotorbikeBrand();
        brand.setId("brand1");
        brand.setName("Honda");

        model = new MotorbikeModel();
        model.setId("model1");
        model.setName("Wave");
        model.setBrand(brand);
        model.setCategory("MANUAL");

        owner = new User();
        owner.setId("u1");
        owner.setDisplayName("Owner A");

        motorbike = new Motorbike();
        motorbike.setId("v1");
        motorbike.setName("Honda Wave Alpha");
        motorbike.setModel(model);
        motorbike.setOwner(owner);
        motorbike.setStatus(VehicleStatus.AVAILABLE);
        motorbike.setLicensePlate("59A-11111");
        motorbike.setPricePerDay(new BigDecimal("200000"));
        motorbike.setDeposit(new BigDecimal("1000000"));
        motorbike.setRating(new BigDecimal("4.5"));
        motorbike.setTotalReviews(10);
    }

    // ===== LW-134: searchMotorbikes =====

    /** UTCID01 (Normal): city=Hanoi, transmission=MANUAL → returns paged result */
    @Test
    void searchMotorbikes_UTCID01_validTransmission_returnsPage() {
        Page<Motorbike> page = new PageImpl<>(Collections.singletonList(motorbike));
        when(motorbikeRepository.searchMotorbikes(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(page);
        when(translationService.getCurrentLanguageCode()).thenReturn("vi");
        when(translationService.translateMotorbike(any(), any(), any(), any(), any())).thenReturn("Honda Wave Alpha");

        Page<MotorbikeDTOs.MotorbikeResponse> result =
                service.searchMotorbikes("Hanoi", null, "MANUAL", null, null, null, null, null, null, 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    /** UTCID02 (Normal): city=null, transmission=null → still returns result */
    @Test
    void searchMotorbikes_UTCID02_nullParams_returnsPage() {
        Page<Motorbike> page = new PageImpl<>(Collections.singletonList(motorbike));
        when(motorbikeRepository.searchMotorbikes(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(page);
        when(translationService.getCurrentLanguageCode()).thenReturn("vi");
        when(translationService.translateMotorbike(any(), any(), any(), any(), any())).thenReturn("Honda Wave Alpha");

        Page<MotorbikeDTOs.MotorbikeResponse> result =
                service.searchMotorbikes(null, null, null, null, null, null, null, null, null, 0, 10);
        assertNotNull(result);
    }

    /** UTCID03 (Abnormal): page=-1, size=0 → throws IllegalArgumentException */
    @Test
    void searchMotorbikes_UTCID03_negativePagination_throwsException() {
        assertThrows(IllegalArgumentException.class, () ->
                service.searchMotorbikes(null, null, null, null, null, null, null, null, null, -1, 0));
    }

    /** UTCID04 (Boundary): page=MAX_VALUE, size=MAX_VALUE → returns empty page without error */
    @Test
    void searchMotorbikes_UTCID04_maxPagination_returnsEmptyPage() {
        Page<Motorbike> page = new PageImpl<>(Collections.emptyList());
        when(motorbikeRepository.searchMotorbikes(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        assertDoesNotThrow(() ->
                service.searchMotorbikes(null, null, null, null, null, null, null, null, null,
                        Integer.MAX_VALUE, Integer.MAX_VALUE));
    }

    // ===== LW-135: getMotorbikeById =====

    /** UTCID01 (Normal): id="v1", vehicle is MOTORBIKE → returns MotorbikeResponse */
    @Test
    void getMotorbikeById_UTCID01_existsAndMotorbike_returnsResponse() {
        when(motorbikeRepository.findById("v1")).thenReturn(Optional.of(motorbike));
        when(translationService.getCurrentLanguageCode()).thenReturn("vi");
        when(translationService.translateMotorbike(any(), any(), any(), any(), any())).thenReturn("Honda Wave Alpha");

        MotorbikeDTOs.MotorbikeResponse result = service.getMotorbikeById("v1");

        assertNotNull(result);
        assertEquals("v1", result.getId());
    }

    /** UTCID02 (Normal): vehicle not found (wrong type) → throws RuntimeException */
    @Test
    void getMotorbikeById_UTCID02_vehicleNotFound_throwsRuntimeException() {
        when(motorbikeRepository.findById("v1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.getMotorbikeById("v1"));
    }

    /** UTCID03 (Abnormal): id=-1 does not exist → throws RuntimeException */
    @Test
    void getMotorbikeById_UTCID03_idNotExist_throwsRuntimeException() {
        when(motorbikeRepository.findById("-1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.getMotorbikeById("-1"));
    }

    /** UTCID04 (Boundary): id=1, object has no relations (empty lists) → returns response */
    @Test
    void getMotorbikeById_UTCID04_validIdNoRelations_returnsResponseWithEmptyLists() {
        Motorbike bare = new Motorbike();
        bare.setId("1");
        bare.setName("Bare Bike");
        bare.setStatus(VehicleStatus.AVAILABLE);
        bare.setRating(BigDecimal.ZERO);
        bare.setTotalReviews(0);
        when(motorbikeRepository.findById("1")).thenReturn(Optional.of(bare));
        when(translationService.getCurrentLanguageCode()).thenReturn("vi");
        when(translationService.translateMotorbike(any(), any(), any(), any(), any())).thenReturn("Bare Bike");

        MotorbikeDTOs.MotorbikeResponse result = service.getMotorbikeById("1");

        assertNotNull(result);
        assertEquals("1", result.getId());
        assertNull(result.getModelName());
    }

    // ===== LW-136: createMotorbike =====

    /** UTCID01 (Normal): owner exists, valid request → returns saved MotorbikeResponse */
    @Test
    void createMotorbike_UTCID01_ownerExists_returnsMotorbikeResponse() {
        MotorbikeDTOs.CreateMotorbikeRequest req = new MotorbikeDTOs.CreateMotorbikeRequest();
        req.setModelId("model1");
        req.setName("Honda Wave Alpha");
        req.setLicensePlate("59A-99999");
        req.setPricePerDay(new BigDecimal("200000"));
        req.setDeposit(new BigDecimal("1000000"));

        when(userRepository.findById("u1")).thenReturn(Optional.of(owner));
        when(motorbikeModelRepository.findById("model1")).thenReturn(Optional.of(model));
        when(motorbikeRepository.save(any())).thenReturn(motorbike);
        when(translationService.getCurrentLanguageCode()).thenReturn("vi");
        when(translationService.translateMotorbike(any(), any(), any(), any(), any())).thenReturn("Honda Wave Alpha");

        MotorbikeDTOs.MotorbikeResponse result = service.createMotorbike(req, "u1");

        assertNotNull(result);
        assertEquals("v1", result.getId());
        verify(motorbikeRepository, atLeastOnce()).save(any());
    }

    /** UTCID02 (Normal): owner does not exist in repository → throws RuntimeException */
    @Test
    void createMotorbike_UTCID02_ownerNotFound_throwsRuntimeException() {
        MotorbikeDTOs.CreateMotorbikeRequest req = new MotorbikeDTOs.CreateMotorbikeRequest();
        req.setModelId("model1");
        when(userRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.createMotorbike(req, "unknown"));
    }

    /** UTCID03 (Abnormal): ownerId=-1, does not exist → throws RuntimeException */
    @Test
    void createMotorbike_UTCID03_ownerIdNegative_throwsRuntimeException() {
        MotorbikeDTOs.CreateMotorbikeRequest req = new MotorbikeDTOs.CreateMotorbikeRequest();
        when(userRepository.findById("-1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.createMotorbike(req, "-1"));
    }

    /** UTCID04 (Boundary): ownerId=1, valid but object has no relations → returns response with empty lists */
    @Test
    void createMotorbike_UTCID04_boundaryOwnerId_returnsResponseWithEmptyLists() {
        User boundaryOwner = new User();
        boundaryOwner.setId("1");

        Motorbike savedMotorbike = new Motorbike();
        savedMotorbike.setId("new-id");
        savedMotorbike.setName("Test Bike");
        savedMotorbike.setStatus(VehicleStatus.AVAILABLE);
        savedMotorbike.setRating(BigDecimal.ZERO);
        savedMotorbike.setTotalReviews(0);

        MotorbikeDTOs.CreateMotorbikeRequest req = new MotorbikeDTOs.CreateMotorbikeRequest();
        req.setModelId("model1");
        req.setName("Test Bike");
        req.setPricePerDay(BigDecimal.ONE);
        req.setDeposit(BigDecimal.ONE);

        when(userRepository.findById("1")).thenReturn(Optional.of(boundaryOwner));
        when(motorbikeModelRepository.findById("model1")).thenReturn(Optional.of(model));
        when(motorbikeRepository.save(any())).thenReturn(savedMotorbike);
        when(translationService.getCurrentLanguageCode()).thenReturn("vi");
        when(translationService.translateMotorbike(any(), any(), any(), any(), any())).thenReturn("Test Bike");

        MotorbikeDTOs.MotorbikeResponse result = service.createMotorbike(req, "1");
        assertNotNull(result);
        assertEquals("new-id", result.getId());
    }

    // ===== LW-137: deleteMotorbike =====

    /** UTCID01 (Normal): id="v1", vehicle exists → deleteById called, no exception */
    @Test
    void deleteMotorbike_UTCID01_vehicleExists_deletesSuccessfully() {
        when(motorbikeRepository.existsById("v1")).thenReturn(true);
        doNothing().when(motorbikeRepository).deleteById("v1");

        assertDoesNotThrow(() -> service.deleteMotorbike("v1"));
        verify(motorbikeRepository).deleteById("v1");
    }

    /** UTCID02 (Normal): id="v1" not found → throws RuntimeException */
    @Test
    void deleteMotorbike_UTCID02_vehicleNotFound_throwsRuntimeException() {
        when(motorbikeRepository.existsById("v1")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> service.deleteMotorbike("v1"));
        verify(motorbikeRepository, never()).deleteById(any());
    }

    /** UTCID03 (Abnormal): id=-1 does not exist → throws RuntimeException */
    @Test
    void deleteMotorbike_UTCID03_idNotExist_throwsRuntimeException() {
        when(motorbikeRepository.existsById("-1")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> service.deleteMotorbike("-1"));
    }

    /** UTCID04 (Boundary): id=1, object has no relations → delete succeeds */
    @Test
    void deleteMotorbike_UTCID04_boundaryId_deletesSuccessfully() {
        when(motorbikeRepository.existsById("1")).thenReturn(true);
        doNothing().when(motorbikeRepository).deleteById("1");

        assertDoesNotThrow(() -> service.deleteMotorbike("1"));
        verify(motorbikeRepository).deleteById("1");
    }
}
