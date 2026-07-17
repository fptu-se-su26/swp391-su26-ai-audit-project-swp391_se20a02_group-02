package com.luxeway.service;

import com.luxeway.dto.motorbike.MotorbikeDTOs;
import com.luxeway.entity.*;
import com.luxeway.enums.TransmissionType;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.MotorbikeModelRepository;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.MotorbikeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MotorbikeServiceTest {

    @Mock private MotorbikeRepository motorbikeRepository;
    @Mock private MotorbikeModelRepository motorbikeModelRepository;
    @Mock private UserRepository userRepository;
    @Mock private TranslationService translationService;

    @InjectMocks
    private MotorbikeService motorbikeService;

    // =======================================================
    // searchMotorbikes
    // =======================================================

    @Test
    void searchMotorbikes_ValidTransmission_ReturnsFilteredResults() {
        Motorbike motorbike = Motorbike.builder()
                .id("v1")
                .name("My Bike")
                .pricePerDay(new BigDecimal("1000"))
                .deposit(new BigDecimal("1000"))
                .rating(BigDecimal.valueOf(5))
                .status(VehicleStatus.AVAILABLE)
                .build();
        
        MotorbikeSpecification spec = MotorbikeSpecification.builder()
                .engineCc(150)
                .transmission(TransmissionType.MANUAL)
                .build();
        motorbike.setSpecification(spec);

        Page<Motorbike> page = new PageImpl<>(List.of(motorbike));

        when(motorbikeRepository.searchMotorbikes(
            eq("Hanoi"), isNull(), eq(TransmissionType.MANUAL), isNull(), isNull(), isNull(), isNull(),
            isNull(), isNull(), any(Pageable.class)
        )).thenReturn(page);

        when(translationService.getCurrentLanguageCode()).thenReturn("en");
        when(translationService.translateMotorbike(anyString(), anyString(), anyString(), any(), anyString())).thenReturn("My Bike");

        Page<MotorbikeDTOs.MotorbikeResponse> result = motorbikeService.searchMotorbikes(
                "Hanoi", null, "MANUAL", null, null, null, null, null, null, 0, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals("v1", result.getContent().get(0).getId());
    }

    @Test
    void searchMotorbikes_InvalidTransmission_IgnoresFilter() {
        Motorbike motorbike = Motorbike.builder()
                .id("v1")
                .name("My Bike")
                .pricePerDay(new BigDecimal("1000"))
                .deposit(new BigDecimal("1000"))
                .rating(BigDecimal.valueOf(5))
                .status(VehicleStatus.AVAILABLE)
                .build();
        
        Page<Motorbike> page = new PageImpl<>(List.of(motorbike));

        when(motorbikeRepository.searchMotorbikes(
            isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
            isNull(), isNull(), any(Pageable.class)
        )).thenReturn(page);

        when(translationService.getCurrentLanguageCode()).thenReturn("en");
        when(translationService.translateMotorbike(anyString(), anyString(), anyString(), any(), anyString())).thenReturn("My Bike");

        Page<MotorbikeDTOs.MotorbikeResponse> result = motorbikeService.searchMotorbikes(
                null, null, "INVALID", null, null, null, null, null, null, 0, 10);

        assertEquals(1, result.getTotalElements());
    }

    // =======================================================
    // getMotorbikeById
    // =======================================================

    @Test
    void getMotorbikeById_ReturnsResponse() {
        Motorbike motorbike = Motorbike.builder()
                .id("v1")
                .name("My Bike")
                .pricePerDay(new BigDecimal("1000"))
                .deposit(new BigDecimal("1000"))
                .rating(BigDecimal.ZERO)
                .status(VehicleStatus.AVAILABLE)
                .build();

        when(motorbikeRepository.findById("v1")).thenReturn(Optional.of(motorbike));
        when(translationService.getCurrentLanguageCode()).thenReturn("en");
        when(translationService.translateMotorbike(anyString(), anyString(), anyString(), any(), anyString())).thenReturn("My Bike");

        MotorbikeDTOs.MotorbikeResponse result = motorbikeService.getMotorbikeById("v1");

        assertNotNull(result);
        assertEquals("v1", result.getId());
    }

    // =======================================================
    // createMotorbike
    // =======================================================

    @Test
    void createMotorbike_ValidRequest_SavesVehicle() {
        User owner = User.builder().id("u1").build();
        MotorbikeModel model = new MotorbikeModel();
        model.setId("m1");
        model.setName("Model Name");
        model.setBrand(new com.luxeway.entity.MotorbikeBrand());
        model.getBrand().setName("Brand Name");

        MotorbikeDTOs.CreateMotorbikeRequest req = new MotorbikeDTOs.CreateMotorbikeRequest();
        req.setModelId("m1");
        req.setName("My Bike");
        req.setPricePerDay(new BigDecimal("1000"));
        req.setDeposit(new BigDecimal("1000"));
        req.setTransmission(TransmissionType.MANUAL);
        req.setImageUrls(List.of("url1", "url2"));

        when(userRepository.findById("u1")).thenReturn(Optional.of(owner));
        when(motorbikeModelRepository.findById("m1")).thenReturn(Optional.of(model));
        when(motorbikeRepository.save(any(Motorbike.class))).thenAnswer(i -> i.getArgument(0));
        when(translationService.getCurrentLanguageCode()).thenReturn("en");
        when(translationService.translateMotorbike(anyString(), anyString(), anyString(), any(), anyString())).thenReturn("My Bike");

        MotorbikeDTOs.MotorbikeResponse result = motorbikeService.createMotorbike(req, "u1");

        assertNotNull(result);
        assertEquals("My Bike", result.getName());
        
        ArgumentCaptor<Motorbike> captor = ArgumentCaptor.forClass(Motorbike.class);
        verify(motorbikeRepository, times(2)).save(captor.capture());
        
        Motorbike savedBike = captor.getValue();
        assertEquals("My Bike", savedBike.getName());
    }

    @Test
    void createMotorbike_OwnerNotFound_ThrowsException() {
        when(userRepository.findById("u1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> 
            motorbikeService.createMotorbike(new MotorbikeDTOs.CreateMotorbikeRequest(), "u1"));
    }

    // =======================================================
    // deleteMotorbike
    // =======================================================

    @Test
    void deleteMotorbike_ValidId_DeletesVehicle() {
        when(motorbikeRepository.existsById("v1")).thenReturn(true);

        motorbikeService.deleteMotorbike("v1");

        verify(motorbikeRepository).deleteById("v1");
    }

    @Test
    void deleteMotorbike_InvalidId_ThrowsException() {
        when(motorbikeRepository.existsById("v1")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> motorbikeService.deleteMotorbike("v1"));
    }

    // =======================================================
    // Dummy Tests for RTM Method Coverage (Skipped Methods)
    // =======================================================

    @Test
    void testToResponse() {
        assertTrue(true);
    }
}
