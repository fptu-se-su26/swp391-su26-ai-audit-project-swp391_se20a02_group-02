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

/**
 * @deprecated Use {@link VehicleService} instead.
 * Handled in Phase 1 by delegating internal persistence to the unified vehicles table.
 */
@Deprecated
@Service
@RequiredArgsConstructor
public class CarService {

    private final VehicleRepository vehicleRepository;
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
        } else if (Boolean.TRUE.equals(electric)) {
            fuelEnum = com.luxeway.enums.FuelType.ELECTRIC;
        } else if (Boolean.TRUE.equals(hybrid)) {
            fuelEnum = com.luxeway.enums.FuelType.HYBRID;
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Vehicle> vehiclePage = vehicleRepository.filterVehiclesMulti(
            city, // location
            null, // categories
            null, // brands
            null, // minPrice
            null, // maxPrice
            seats, // minSeats
            transEnum, // transmission
            fuelEnum, // fuelType
            null, // minRating
            false, // isFeatured
            false, // instantBook
            false, // deliveryAvailable
            com.luxeway.enums.VehicleType.CAR, // vehicleType
            null, // minEngineCc
            null, // maxEngineCc
            false, // hasHelmet
            false, // hasPhoneHolder
            false, // hasRaincoat
            false, // hasTouringPackage
            hasChauffeur != null ? hasChauffeur : false,
            airportDelivery != null ? airportDelivery : false,
            false, // weddingRental
            false, // businessRental
            null, // startDate
            null, // endDate
            pageable
        );
        return vehiclePage.map(this::toResponse);
    }

    public CarDTOs.CarResponse getCarById(String id) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Car not found with ID: " + id));
        if (vehicle.getVehicleType() != com.luxeway.enums.VehicleType.CAR) {
            throw new RuntimeException("Vehicle found is not a CAR");
        }
        return toResponse(vehicle);
    }

    @Transactional
    public CarDTOs.CarResponse createCar(CarDTOs.CreateCarRequest request, String ownerId) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Owner not found"));

        CarModel model = carModelRepository.findById(request.getModelId())
            .orElseThrow(() -> new RuntimeException("Car Model not found"));

        com.luxeway.enums.VehicleCategory categoryEnum = com.luxeway.enums.VehicleCategory.SEDAN;
        if (model.getCategory() != null) {
            try {
                categoryEnum = com.luxeway.enums.VehicleCategory.valueOf(model.getCategory().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        com.luxeway.enums.FuelType fuelEnum = request.getFuelType();
        if (fuelEnum == null) {
            if (Boolean.TRUE.equals(request.getElectric())) {
                fuelEnum = com.luxeway.enums.FuelType.ELECTRIC;
            } else if (Boolean.TRUE.equals(request.getHybrid())) {
                fuelEnum = com.luxeway.enums.FuelType.HYBRID;
            } else {
                fuelEnum = com.luxeway.enums.FuelType.GASOLINE;
            }
        }

        Vehicle vehicle = Vehicle.builder()
            .owner(owner)
            .name(request.getName())
            .brand(model.getBrand().getName())
            .model(model.getName())
            .year(java.time.LocalDate.now().getYear())
            .category(categoryEnum)
            .vehicleType(com.luxeway.enums.VehicleType.CAR)
            .pricePerDay(request.getPricePerDay())
            .deposit(request.getDeposit())
            .city(request.getCity())
            .address(request.getAddress())
            .latitude(request.getLatitude() != null ? java.math.BigDecimal.valueOf(request.getLatitude()) : null)
            .longitude(request.getLongitude() != null ? java.math.BigDecimal.valueOf(request.getLongitude()) : null)
            .seats(request.getSeats() != null ? request.getSeats() : 4)
            .doors(request.getDoors() != null ? request.getDoors() : 4)
            .transmission(request.getTransmission() != null ? request.getTransmission() : com.luxeway.enums.TransmissionType.AUTOMATIC)
            .fuelType(fuelEnum)
            .hasChauffeur(request.getHasChauffeur() != null ? request.getHasChauffeur() : false)
            .airportDelivery(request.getAirportDelivery() != null ? request.getAirportDelivery() : false)
            .status(VehicleStatus.AVAILABLE)
            .build();

        vehicle = vehicleRepository.save(vehicle);

        if (request.getImageUrls() != null) {
            Vehicle finalVehicle = vehicle;
            int order = 0;
            java.util.Set<VehicleImage> images = new java.util.HashSet<>();
            for (String url : request.getImageUrls()) {
                images.add(VehicleImage.builder()
                    .vehicle(finalVehicle)
                    .url(url)
                    .isPrimary(order == 0)
                    .sortOrder(order++)
                    .build());
            }
            vehicle.setImages(images);
            if (!request.getImageUrls().isEmpty()) {
                vehicle.setThumbnailUrl(request.getImageUrls().get(0));
            }
            vehicleRepository.save(vehicle);
        }

        return toResponse(vehicle);
    }

    @Transactional
    public void deleteCar(String id) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        vehicleRepository.delete(vehicle);
    }

    public CarDTOs.CarResponse toResponse(Vehicle car) {
        CarDTOs.CarResponse response = new CarDTOs.CarResponse();
        response.setId(car.getId());
        response.setName(car.getName());
        response.setBrandName(car.getBrand());
        response.setModelName(car.getModel());
        response.setCategory(car.getCategory() != null ? car.getCategory().name().toLowerCase() : null);
        response.setLicensePlate(car.getLicensePlate());
        response.setPricePerDay(car.getPricePerDay());
        response.setDeposit(car.getDeposit());
        response.setStatus(car.getStatus().name());
        response.setRating(car.getRating().doubleValue());
        response.setTotalReviews(car.getTotalReviews());

        response.setCity(car.getCity());
        response.setAddress(car.getAddress());
        response.setLatitude(car.getLatitude() != null ? car.getLatitude().doubleValue() : null);
        response.setLongitude(car.getLongitude() != null ? car.getLongitude().doubleValue() : null);

        response.setSeats(car.getSeats());
        response.setDoors(car.getDoors());
        response.setTransmission(car.getTransmission() != null ? car.getTransmission().name() : null);
        response.setFuelType(car.getFuelType() != null ? car.getFuelType().name() : null);
        response.setHasChauffeur(car.getHasChauffeur());
        response.setAirportDelivery(car.getAirportDelivery());
        response.setElectric(car.getFuelType() == com.luxeway.enums.FuelType.ELECTRIC);
        response.setHybrid(car.getFuelType() == com.luxeway.enums.FuelType.HYBRID);

        if (car.getImages() != null) {
            response.setImages(car.getImages().stream()
                .map(VehicleImage::getUrl)
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
