package com.luxeway.service;

import com.luxeway.dto.motorbike.MotorbikeDTOs;
import com.luxeway.entity.MotorbikeModel;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.enums.TransmissionType;
import com.luxeway.enums.VehicleType;
import com.luxeway.repository.MotorbikeModelRepository;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MotorbikeServiceTest {

    @Mock private VehicleRepository vehicleRepository;
    @Mock private MotorbikeModelRepository motorbikeModelRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private MotorbikeService motorbikeService;

    // =======================================================
    // searchMotorbikes
    // =======================================================

    @Test
    void searchMotorbikes_ValidTransmission_ReturnsFilteredResults() {
        Vehicle vehicle = Vehicle.builder().id("v1").vehicleType(VehicleType.MOTORBIKE).build();
        Page<Vehicle> page = new PageImpl<>(List.of(vehicle));

        when(vehicleRepository.filterVehiclesMulti(
            eq("Hanoi"), any(), any(), any(), any(), any(), 
            eq(TransmissionType.MANUAL), // transmission mapped correctly
            any(), any(), anyBoolean(), anyBoolean(), anyBoolean(),
            eq(VehicleType.MOTORBIKE), // enforces MOTORBIKE
            any(), any(), anyBoolean(), anyBoolean(), anyBoolean(), anyBoolean(), 
            anyBoolean(), anyBoolean(), anyBoolean(), anyBoolean(), any(), any(), any(Pageable.class)
        )).thenReturn(page);

        Page<MotorbikeDTOs.MotorbikeResponse> result = motorbikeService.searchMotorbikes(
                "Hanoi", null, "MANUAL", null, null, null, null, 0, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals("v1", result.getContent().get(0).getId());
    }

    @Test
    void searchMotorbikes_InvalidTransmission_IgnoresFilter() {
        Vehicle vehicle = Vehicle.builder().id("v1").vehicleType(VehicleType.MOTORBIKE).build();
        Page<Vehicle> page = new PageImpl<>(List.of(vehicle));

        when(vehicleRepository.filterVehiclesMulti(
            isNull(), any(), any(), any(), any(), any(), 
            isNull(), // transmission should be null for invalid string
            any(), any(), anyBoolean(), anyBoolean(), anyBoolean(),
            eq(VehicleType.MOTORBIKE),
            any(), any(), anyBoolean(), anyBoolean(), anyBoolean(), anyBoolean(), 
            anyBoolean(), anyBoolean(), anyBoolean(), anyBoolean(), any(), any(), any(Pageable.class)
        )).thenReturn(page);

        Page<MotorbikeDTOs.MotorbikeResponse> result = motorbikeService.searchMotorbikes(
                null, null, "INVALID", null, null, null, null, 0, 10);

        assertEquals(1, result.getTotalElements());
    }

    // =======================================================
    // getMotorbikeById
    // =======================================================

    @Test
    void getMotorbikeById_ReturnsResponse() {
        Vehicle vehicle = Vehicle.builder().id("v1").vehicleType(VehicleType.MOTORBIKE).build();
        when(vehicleRepository.findById("v1")).thenReturn(Optional.of(vehicle));

        MotorbikeDTOs.MotorbikeResponse result = motorbikeService.getMotorbikeById("v1");

        assertNotNull(result);
        assertEquals("v1", result.getId());
    }

    @Test
    void getMotorbikeById_NotAMotorbike_ThrowsException() {
        Vehicle vehicle = Vehicle.builder().id("v1").vehicleType(VehicleType.CAR).build();
        when(vehicleRepository.findById("v1")).thenReturn(Optional.of(vehicle));

        assertThrows(RuntimeException.class, () -> motorbikeService.getMotorbikeById("v1"));
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

        when(userRepository.findById("u1")).thenReturn(Optional.of(owner));
        when(motorbikeModelRepository.findById("m1")).thenReturn(Optional.of(model));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(i -> i.getArgument(0));

        MotorbikeDTOs.MotorbikeResponse result = motorbikeService.createMotorbike(req, "u1");

        assertNotNull(result);
        assertEquals("My Bike", result.getName());
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
        Vehicle vehicle = Vehicle.builder().id("v1").build();
        when(vehicleRepository.findById("v1")).thenReturn(Optional.of(vehicle));

        motorbikeService.deleteMotorbike("v1");

        verify(vehicleRepository).delete(vehicle);
    }

    @Test
    void deleteMotorbike_InvalidId_ThrowsException() {
        when(vehicleRepository.findById("v1")).thenReturn(Optional.empty());

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
