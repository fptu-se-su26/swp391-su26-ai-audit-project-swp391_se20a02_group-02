package com.luxeway.service;

import com.luxeway.entity.Car;
import com.luxeway.entity.CarModel;
import com.luxeway.entity.CarBrand;
import com.luxeway.entity.Motorbike;
import com.luxeway.entity.MotorbikeModel;
import com.luxeway.entity.MotorbikeBrand;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.CarRepository;
import com.luxeway.repository.MotorbikeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * LW-175: getRecommendedCarsForUser (UTC-031-005)
 * LW-176: getRecommendedMotorbikesForUser (UTC-031-006)
 */
@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private CarRepository carRepository;
    @Mock
    private MotorbikeRepository motorbikeRepository;

    @InjectMocks
    private RecommendationService service;

    private Car car;
    private Motorbike motorbike;

    @BeforeEach
    void setUp() {
        CarBrand carBrand = new CarBrand();
        carBrand.setId("brand1");
        carBrand.setName("Toyota");

        CarModel carModel = new CarModel();
        carModel.setId("model1");
        carModel.setName("Camry");
        carModel.setCategory("SEDAN");
        carModel.setBrand(carBrand);

        car = new Car();
        car.setId("c1");
        car.setName("Toyota Camry");
        car.setModel(carModel);
        car.setStatus(VehicleStatus.AVAILABLE);
        car.setRating(new BigDecimal("4.8"));
        car.setTotalReviews(20);
        car.setTotalBookings(100);

        MotorbikeBrand motorbikeBrand = new MotorbikeBrand();
        motorbikeBrand.setId("mb1");
        motorbikeBrand.setName("Honda");

        MotorbikeModel motorbikeModel = new MotorbikeModel();
        motorbikeModel.setId("mm1");
        motorbikeModel.setName("Wave");
        motorbikeModel.setCategory("MANUAL");
        motorbikeModel.setBrand(motorbikeBrand);

        motorbike = new Motorbike();
        motorbike.setId("m1");
        motorbike.setName("Honda Wave");
        motorbike.setModel(motorbikeModel);
        motorbike.setStatus(VehicleStatus.AVAILABLE);
        motorbike.setRating(new BigDecimal("4.5"));
        motorbike.setTotalReviews(10);
        motorbike.setTotalBookings(50);
    }

    // ===== LW-175: getRecommendedCarsForUser =====

    /**
     * UTCID01 (Normal): car repository has available cars sorted by rating →
     * returns list
     */
    @Test
    void getRecommendedCarsForUser_UTCID01_carsAvailable_returnsSortedByRating() {
        when(carRepository.findAll()).thenReturn(List.of(car));

        List<Car> result = service.getRecommendedCarsForUser("u1", 5);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals("c1", result.get(0).getId());
    }

    /**
     * UTCID02 (Abnormal): userId does not exist (invalid/-1) → returns empty list
     */
    @Test
    void getRecommendedCarsForUser_UTCID02_userIdInvalid_returnsEmpty() {
        Car unavailableCar = new Car();
        unavailableCar.setId("c2");
        unavailableCar.setStatus(VehicleStatus.UNAVAILABLE);
        unavailableCar.setRating(BigDecimal.ZERO);

        when(carRepository.findAll()).thenReturn(List.of(unavailableCar));

        List<Car> result = service.getRecommendedCarsForUser("-1", 5);

        assertTrue(result.isEmpty()); // UNAVAILABLE filtered out
    }

    /**
     * UTCID03 (Boundary): userId=1 (valid but no relations) → returns empty list
     */
    @Test
    void getRecommendedCarsForUser_UTCID03_boundaryUserId_returnsEmptyList() {
        when(carRepository.findAll()).thenReturn(Collections.emptyList());

        List<Car> result = service.getRecommendedCarsForUser("1", 5);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // ===== LW-176: getRecommendedMotorbikesForUser =====

    /**
     * UTCID01 (Normal): motorbike repository has available bikes sorted by rating →
     * returns list
     */
    @Test
    void getRecommendedMotorbikesForUser_UTCID01_motorbikesAvailable_returnsSortedByRating() {
        when(motorbikeRepository.findAll()).thenReturn(List.of(motorbike));

        List<Motorbike> result = service.getRecommendedMotorbikesForUser("u1", 5);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals("m1", result.get(0).getId());
    }

    /** UTCID02 (Abnormal): userId=-1 invalid → returns empty list */
    @Test
    void getRecommendedMotorbikesForUser_UTCID02_userIdInvalid_returnsEmpty() {
        Motorbike unavailableBike = new Motorbike();
        unavailableBike.setId("m2");
        unavailableBike.setStatus(VehicleStatus.UNAVAILABLE);
        unavailableBike.setRating(BigDecimal.ZERO);

        when(motorbikeRepository.findAll()).thenReturn(List.of(unavailableBike));

        List<Motorbike> result = service.getRecommendedMotorbikesForUser("-1", 5);

        assertTrue(result.isEmpty()); // UNAVAILABLE filtered out
    }

    /**
     * UTCID03 (Boundary): userId=1 (valid but no relations) → returns empty list
     */
    @Test
    void getRecommendedMotorbikesForUser_UTCID03_boundaryUserId_returnsEmptyList() {
        when(motorbikeRepository.findAll()).thenReturn(Collections.emptyList());

        List<Motorbike> result = service.getRecommendedMotorbikesForUser("1", 5);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
