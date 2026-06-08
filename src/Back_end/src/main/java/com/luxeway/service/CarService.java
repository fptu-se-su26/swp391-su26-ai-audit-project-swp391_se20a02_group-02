package com.luxeway.service;

import com.luxeway.dto.car.CarDTOs;
import com.luxeway.entity.*;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;
    private final CarBrandRepository carBrandRepository;
    private final CarModelRepository carModelRepository;
    private final UserRepository userRepository;

    public Page<CarDTOs.CarResponse> searchCars(
            String city, Integer seats, String transmission, String fuelType,
            Boolean hasChauffeur, Boolean airportDelivery, Boolean electric, Boolean hybrid,
            int page, int size) {
        
        com.luxeway.enums.TransmissionType transEnum = null;
        if (transmission != null && !transmission.trim().isEmpty()) {
            try {
                transEnum = com.luxeway.enums.TransmissionType.valueOf(transmission.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid transmission type
            }
        }

        com.luxeway.enums.FuelType fuelEnum = null;
        if (fuelType != null && !fuelType.trim().isEmpty()) {
            try {
                fuelEnum = com.luxeway.enums.FuelType.valueOf(fuelType.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid fuel type
            }
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Car> carPage = carRepository.searchCars(
            city, seats, transEnum, fuelEnum, hasChauffeur, airportDelivery, electric, hybrid, pageable
        );
        return carPage.map(this::toResponse);
    }

    public CarDTOs.CarResponse getCarById(String id) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Car not found with ID: " + id));
        return toResponse(car);
    }

    @Transactional
    public CarDTOs.CarResponse createCar(CarDTOs.CreateCarRequest request, String ownerId) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Owner not found"));

        CarModel model = carModelRepository.findById(request.getModelId())
            .orElseThrow(() -> new RuntimeException("Car Model not found"));

        Car car = Car.builder()
            .name(request.getName())
            .model(model)
            .owner(owner)
            .licensePlate(request.getLicensePlate())
            .pricePerDay(request.getPricePerDay())
            .deposit(request.getDeposit())
            .status(VehicleStatus.AVAILABLE)
            .build();

        car = carRepository.save(car);

        CarSpecification spec = CarSpecification.builder()
            .car(car)
            .seats(request.getSeats())
            .doors(request.getDoors() != null ? request.getDoors() : 4)
            .transmission(request.getTransmission())
            .fuelType(request.getFuelType())
            .hasChauffeur(request.getHasChauffeur() != null ? request.getHasChauffeur() : false)
            .airportDelivery(request.getAirportDelivery() != null ? request.getAirportDelivery() : false)
            .electric(request.getElectric() != null ? request.getElectric() : false)
            .hybrid(request.getHybrid() != null ? request.getHybrid() : false)
            .build();
        car.setSpecification(spec);

        CarLocation loc = CarLocation.builder()
            .car(car)
            .city(request.getCity())
            .address(request.getAddress())
            .latitude(request.getLatitude() != null ? java.math.BigDecimal.valueOf(request.getLatitude()) : null)
            .longitude(request.getLongitude() != null ? java.math.BigDecimal.valueOf(request.getLongitude()) : null)
            .build();
        car.setLocation(loc);

        if (request.getImageUrls() != null) {
            Set<CarImage> images = new HashSet<>();
            int order = 0;
            for (String url : request.getImageUrls()) {
                images.add(CarImage.builder()
                    .car(car)
                    .url(url)
                    .isPrimary(order == 0)
                    .sortOrder(order++)
                    .build());
            }
            car.setImages(images);
        }

        return toResponse(carRepository.save(car));
    }

    @Transactional
    public void deleteCar(String id) {
        if (!carRepository.existsById(id)) {
            throw new RuntimeException("Car not found");
        }
        carRepository.deleteById(id);
    }

    public CarDTOs.CarResponse toResponse(Car car) {
        CarDTOs.CarResponse response = new CarDTOs.CarResponse();
        response.setId(car.getId());
        response.setName(car.getName());
        response.setBrandName(car.getModel().getBrand().getName());
        response.setModelName(car.getModel().getName());
        response.setCategory(car.getModel().getCategory());
        response.setLicensePlate(car.getLicensePlate());
        response.setPricePerDay(car.getPricePerDay());
        response.setDeposit(car.getDeposit());
        response.setStatus(car.getStatus().name());
        response.setRating(car.getRating().doubleValue());
        response.setTotalReviews(car.getTotalReviews());

        if (car.getLocation() != null) {
            response.setCity(car.getLocation().getCity());
            response.setAddress(car.getLocation().getAddress());
            response.setLatitude(car.getLocation().getLatitude() != null ? car.getLocation().getLatitude().doubleValue() : null);
            response.setLongitude(car.getLocation().getLongitude() != null ? car.getLocation().getLongitude().doubleValue() : null);
        }

        if (car.getSpecification() != null) {
            response.setSeats(car.getSpecification().getSeats());
            response.setDoors(car.getSpecification().getDoors());
            response.setTransmission(car.getSpecification().getTransmission().name());
            response.setFuelType(car.getSpecification().getFuelType().name());
            response.setHasChauffeur(car.getSpecification().getHasChauffeur());
            response.setAirportDelivery(car.getSpecification().getAirportDelivery());
            response.setElectric(car.getSpecification().getElectric());
            response.setHybrid(car.getSpecification().getHybrid());
        }

        if (car.getImages() != null) {
            response.setImages(car.getImages().stream()
                .map(CarImage::getUrl)
                .collect(Collectors.toList()));
        }

        if (car.getOwner() != null) {
            CarDTOs.OwnerInfo ownerInfo = new CarDTOs.OwnerInfo();
            ownerInfo.setId(car.getOwner().getId());
            ownerInfo.setDisplayName(car.getOwner().getDisplayName());
            ownerInfo.setAvatar(car.getOwner().getAvatar());
            response.setOwner(ownerInfo);
        }

        return response;
    }
}
