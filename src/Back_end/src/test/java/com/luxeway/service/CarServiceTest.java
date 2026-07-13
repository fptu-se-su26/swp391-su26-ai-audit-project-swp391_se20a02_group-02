package com.luxeway.service;

import com.luxeway.dto.car.CarDTOs;
import com.luxeway.entity.Car;
import com.luxeway.entity.CarBrand;
import com.luxeway.entity.CarImage;
import com.luxeway.entity.CarModel;
import com.luxeway.entity.User;
import com.luxeway.enums.FuelType;
import com.luxeway.enums.TransmissionType;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.CarModelRepository;
import com.luxeway.repository.CarRepository;
import com.luxeway.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
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
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class CarServiceTest {

    @Mock private CarRepository carRepository;
    @Mock private CarModelRepository carModelRepository;
    @Mock private UserRepository userRepository;
    @Mock private TranslationService translationService;

    @InjectMocks
    private CarService carService;

    @BeforeEach
    void setUpTranslation() {
        lenient().when(translationService.getCurrentLanguageCode()).thenReturn("en");
        lenient().when(translationService.translateCar(any(), eq("en"), any(), isNull(), eq("name")))
            .thenAnswer(invocation -> invocation.getArgument(2));
    }

    @Test
    void searchCars_MapsEnumTypesCorrectly() {
        Car car = Car.builder()
            .id("c1")
            .name("My Tesla")
            .status(VehicleStatus.AVAILABLE)
            .rating(BigDecimal.valueOf(5))
            .build();
        Page<Car> page = new PageImpl<>(List.of(car));

        when(carRepository.searchCars(
            eq("London"),
            eq(5),
            eq(TransmissionType.AUTOMATIC),
            eq(FuelType.ELECTRIC),
            eq(false),
            eq(false),
            eq(true),
            eq(false),
            eq("Tesla"),
            eq("SEDAN"),
            any(Pageable.class)
        )).thenReturn(page);

        Page<CarDTOs.CarResponse> result = carService.searchCars(
            "London", 5, "AUTOMATIC", "ELECTRIC", false, false, true, false,
            "Tesla", "SEDAN", 0, 10
        );

        assertEquals(1, result.getTotalElements());
        assertEquals("c1", result.getContent().get(0).getId());
    }

    @Test
    void getCarById_WhenMissing_ThrowsException() {
        when(carRepository.findById("c1")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> carService.getCarById("c1"));
        // Message may vary slightly across implementations; assert it mentions the missing car
        assertTrue(ex.getMessage().contains("Car not found"));
    }

    @Test
    void getCarById_WhenCar_ReturnsDto() {
        Car car = Car.builder()
            .id("c1")
            .name("My Tesla")
            .status(VehicleStatus.AVAILABLE)
            .rating(BigDecimal.ZERO)
            .totalReviews(0)
            .build();
        when(carRepository.findById("c1")).thenReturn(Optional.of(car));

        CarDTOs.CarResponse res = carService.getCarById("c1");

        assertEquals("c1", res.getId());
        assertEquals("My Tesla", res.getName());
    }

    @Test
    void createCar_ValidRequest_BuildsEntityCorrectly() {
        CarDTOs.CreateCarRequest req = new CarDTOs.CreateCarRequest();
        req.setModelId("m1");
        req.setName("My Tesla");
        req.setLicensePlate("51A-12345");
        req.setPricePerDay(new BigDecimal("1000"));
        req.setDeposit(new BigDecimal("5000"));
        req.setSeats(5);
        req.setTransmission(TransmissionType.AUTOMATIC);
        req.setFuelType(FuelType.ELECTRIC);
        req.setElectric(true);
        req.setCity("London");
        req.setAddress("Main Street");
        req.setImageUrls(List.of("url1", "url2"));

        User owner = User.builder().id("o1").displayName("Owner").build();
        CarBrand brand = CarBrand.builder().name("Tesla").build();
        CarModel model = CarModel.builder().id("m1").brand(brand).name("Model 3").category("SEDAN").build();

        when(userRepository.findById("o1")).thenReturn(Optional.of(owner));
        when(carModelRepository.findById("m1")).thenReturn(Optional.of(model));
        when(carRepository.save(any(Car.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CarDTOs.CarResponse res = carService.createCar(req, "o1");

        ArgumentCaptor<Car> captor = ArgumentCaptor.forClass(Car.class);
        verify(carRepository, times(2)).save(captor.capture());

        Car savedCar = captor.getValue();
        assertEquals("My Tesla", savedCar.getName());
        assertEquals("Tesla", savedCar.getModel().getBrand().getName());
        assertEquals("Model 3", savedCar.getModel().getName());
        assertEquals(VehicleStatus.AVAILABLE, savedCar.getStatus());
        assertEquals(FuelType.ELECTRIC, savedCar.getSpecification().getFuelType());
        assertEquals(TransmissionType.AUTOMATIC, savedCar.getSpecification().getTransmission());
        assertEquals(5, savedCar.getSpecification().getSeats());
        assertEquals(4, savedCar.getSpecification().getDoors());
        assertEquals("London", savedCar.getLocation().getCity());

        List<CarImage> images = savedCar.getImages().stream()
            .sorted(Comparator.comparing(CarImage::getSortOrder))
            .toList();
        assertEquals(2, images.size());
        assertEquals("url1", images.get(0).getUrl());
        assertTrue(images.get(0).getIsPrimary());
        assertFalse(images.get(1).getIsPrimary());

        assertEquals("My Tesla", res.getName());
        assertEquals("Tesla", res.getBrandName());
        assertEquals("Model 3", res.getModelName());
    }

    @Test
    void deleteCar_ExistingId_DeletesVehicle() {
        when(carRepository.existsById("c1")).thenReturn(true);

        carService.deleteCar("c1");

        verify(carRepository).deleteById("c1");
    }

    @Test
    void deleteCar_MissingId_ThrowsException() {
        when(carRepository.existsById("c1")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> carService.deleteCar("c1"));
        assertTrue(ex.getMessage().contains("Car not found"));
    }
}
