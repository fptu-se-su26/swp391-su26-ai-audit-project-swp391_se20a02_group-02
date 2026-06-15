package com.luxeway.service;

import com.luxeway.entity.*;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("all")
public class RecommendationService {

    private final CarRepository carRepository;
    private final MotorbikeRepository motorbikeRepository;

    public List<Car> getSimilarCars(String carId, int limit) {
        log.info("Computing similar cars for carId: {}", carId);
        Car target = carRepository.findById(carId).orElse(null);
        if (target == null) return Collections.emptyList();

        String category = target.getModel().getCategory();
        return carRepository.findAll().stream()
                .filter(c -> !c.getId().equals(carId) && 
                             c.getStatus() == com.luxeway.enums.VehicleStatus.AVAILABLE &&
                             (c.getModel().getCategory().equalsIgnoreCase(category) || 
                              c.getModel().getBrand().getId().equals(target.getModel().getBrand().getId())))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Motorbike> getSimilarMotorbikes(String bikeId, int limit) {
        log.info("Computing similar motorbikes for bikeId: {}", bikeId);
        Motorbike target = motorbikeRepository.findById(bikeId).orElse(null);
        if (target == null) return Collections.emptyList();

        String category = target.getModel().getCategory();
        return motorbikeRepository.findAll().stream()
                .filter(b -> !b.getId().equals(bikeId) && 
                             b.getStatus() == com.luxeway.enums.VehicleStatus.AVAILABLE &&
                             (b.getModel().getCategory().equalsIgnoreCase(category) || 
                              b.getModel().getBrand().getId().equals(target.getModel().getBrand().getId())))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Car> getPopularCars(String city, int limit) {
        log.info("Computing popular cars near: {}", city);
        return carRepository.findAll().stream()
                .filter(c -> c.getStatus() == com.luxeway.enums.VehicleStatus.AVAILABLE &&
                             (city == null || c.getLocation().getCity().equalsIgnoreCase(city)))
                .sorted((c1, c2) -> c2.getTotalBookings().compareTo(c1.getTotalBookings()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Motorbike> getPopularMotorbikes(String city, int limit) {
        log.info("Computing popular motorbikes near: {}", city);
        return motorbikeRepository.findAll().stream()
                .filter(b -> b.getStatus() == com.luxeway.enums.VehicleStatus.AVAILABLE &&
                             (city == null || b.getLocation().getCity().equalsIgnoreCase(city)))
                .sorted((b1, b2) -> b2.getTotalBookings().compareTo(b1.getTotalBookings()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Car> getRecommendedCarsForUser(String userId, int limit) {
        log.info("Computing personalized recommendations for user: {}", userId);
        // Fallback: Highest rated featured cars
        return carRepository.findAll().stream()
                .filter(c -> c.getStatus() == com.luxeway.enums.VehicleStatus.AVAILABLE)
                .sorted((c1, c2) -> c2.getRating().compareTo(c1.getRating()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Motorbike> getRecommendedMotorbikesForUser(String userId, int limit) {
        log.info("Computing personalized motorbike recommendations for user: {}", userId);
        // Fallback: Highest rated featured motorbikes
        return motorbikeRepository.findAll().stream()
                .filter(b -> b.getStatus() == com.luxeway.enums.VehicleStatus.AVAILABLE)
                .sorted((b1, b2) -> b2.getRating().compareTo(b1.getRating()))
                .limit(limit)
                .collect(Collectors.toList());
    }
}
