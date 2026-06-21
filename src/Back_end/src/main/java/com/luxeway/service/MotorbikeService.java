package com.luxeway.service;

import com.luxeway.dto.motorbike.MotorbikeDTOs;
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
public class MotorbikeService {

    private final VehicleRepository vehicleRepository;
    private final MotorbikeBrandRepository motorbikeBrandRepository;
    private final MotorbikeModelRepository motorbikeModelRepository;
    private final UserRepository userRepository;

    public Page<MotorbikeDTOs.MotorbikeResponse> searchMotorbikes(
            String city, Integer engineCc, String transmission,
            Boolean helmetIncluded, Boolean raincoatIncluded, Boolean phoneHolder, Boolean luggageRack,
            int page, int size) {
        
        com.luxeway.enums.TransmissionType transEnum = null;
        if (transmission != null && !transmission.trim().isEmpty()) {
            try {
                transEnum = com.luxeway.enums.TransmissionType.valueOf(transmission.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid transmission type
            }
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Vehicle> vehiclePage = vehicleRepository.filterVehiclesMulti(
            city, // location
            null, // categories
            null, // brands
            null, // minPrice
            null, // maxPrice
            null, // minSeats
            transEnum, // transmission
            null, // fuelType
            null, // minRating
            false, // isFeatured
            false, // instantBook
            false, // deliveryAvailable
            com.luxeway.enums.VehicleType.MOTORBIKE, // vehicleType
            engineCc, // minEngineCc
            engineCc, // maxEngineCc
            Boolean.TRUE.equals(helmetIncluded), // hasHelmet
            Boolean.TRUE.equals(phoneHolder), // hasPhoneHolder
            Boolean.TRUE.equals(raincoatIncluded), // hasRaincoat
            Boolean.TRUE.equals(luggageRack), // hasTouringPackage (luggageRack)
            false, // hasChauffeur
            false, // airportDelivery
            false, // weddingRental
            false, // businessRental
            null, // startDate
            null, // endDate
            pageable
        );
        return vehiclePage.map(this::toResponse);
    }

    public MotorbikeDTOs.MotorbikeResponse getMotorbikeById(String id) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Motorbike not found with ID: " + id));
        if (vehicle.getVehicleType() != com.luxeway.enums.VehicleType.MOTORBIKE) {
            throw new RuntimeException("Vehicle found is not a MOTORBIKE");
        }
        return toResponse(vehicle);
    }

    @Transactional
    public MotorbikeDTOs.MotorbikeResponse createMotorbike(MotorbikeDTOs.CreateMotorbikeRequest request, String ownerId) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Owner not found"));

        MotorbikeModel model = motorbikeModelRepository.findById(request.getModelId())
            .orElseThrow(() -> new RuntimeException("Motorbike Model not found"));

        com.luxeway.enums.VehicleCategory categoryEnum = com.luxeway.enums.VehicleCategory.MOTORBIKE;
        if (model.getCategory() != null) {
            try {
                categoryEnum = com.luxeway.enums.VehicleCategory.valueOf(model.getCategory().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Vehicle vehicle = Vehicle.builder()
            .owner(owner)
            .name(request.getName())
            .brand(model.getBrand().getName())
            .model(model.getName())
            .year(java.time.LocalDate.now().getYear())
            .category(categoryEnum)
            .vehicleType(com.luxeway.enums.VehicleType.MOTORBIKE)
            .engineCc(request.getEngineCc())
            .transmission(request.getTransmission() != null ? request.getTransmission() : com.luxeway.enums.TransmissionType.MANUAL)
            .hasHelmet(request.getHelmetIncluded() != null ? request.getHelmetIncluded() : true)
            .hasRaincoat(request.getRaincoatIncluded() != null ? request.getRaincoatIncluded() : true)
            .hasPhoneHolder(request.getPhoneHolder() != null ? request.getPhoneHolder() : false)
            .hasTouringPackage(request.getLuggageRack() != null ? request.getLuggageRack() : false)
            .pricePerDay(request.getPricePerDay())
            .deposit(request.getDeposit())
            .city(request.getCity())
            .address(request.getAddress())
            .latitude(request.getLatitude() != null ? java.math.BigDecimal.valueOf(request.getLatitude()) : null)
            .longitude(request.getLongitude() != null ? java.math.BigDecimal.valueOf(request.getLongitude()) : null)
            .seats(2) // Default for motorbike
            .fuelType(com.luxeway.enums.FuelType.GASOLINE) // Default for motorbike
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
    public void deleteMotorbike(String id) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        vehicleRepository.delete(vehicle);
    }

    public MotorbikeDTOs.MotorbikeResponse toResponse(Vehicle motorbike) {
        MotorbikeDTOs.MotorbikeResponse response = new MotorbikeDTOs.MotorbikeResponse();
        response.setId(motorbike.getId());
        response.setName(motorbike.getName());
        response.setBrandName(motorbike.getBrand());
        response.setModelName(motorbike.getModel());
        response.setCategory(motorbike.getCategory() != null ? motorbike.getCategory().name().toLowerCase() : null);
        response.setLicensePlate(motorbike.getLicensePlate());
        response.setPricePerDay(motorbike.getPricePerDay());
        response.setDeposit(motorbike.getDeposit());
        response.setStatus(motorbike.getStatus().name());
        response.setRating(motorbike.getRating().doubleValue());
        response.setTotalReviews(motorbike.getTotalReviews());

        response.setCity(motorbike.getCity());
        response.setAddress(motorbike.getAddress());
        response.setLatitude(motorbike.getLatitude() != null ? motorbike.getLatitude().doubleValue() : null);
        response.setLongitude(motorbike.getLongitude() != null ? motorbike.getLongitude().doubleValue() : null);

        response.setEngineCc(motorbike.getEngineCc());
        response.setTransmission(motorbike.getTransmission() != null ? motorbike.getTransmission().name() : null);
        response.setHelmetIncluded(motorbike.getHasHelmet());
        response.setRaincoatIncluded(motorbike.getHasRaincoat());
        response.setPhoneHolder(motorbike.getHasPhoneHolder());
        response.setLuggageRack(motorbike.getHasTouringPackage()); // maps back from touring package

        if (motorbike.getImages() != null) {
            response.setImages(motorbike.getImages().stream()
                .map(VehicleImage::getUrl)
                .collect(Collectors.toList()));
        }

        if (motorbike.getOwner() != null) {
            MotorbikeDTOs.OwnerInfo ownerInfo = new MotorbikeDTOs.OwnerInfo();
            ownerInfo.setId(motorbike.getOwner().getId());
            ownerInfo.setDisplayName(motorbike.getOwner().getDisplayName());
            ownerInfo.setAvatar(motorbike.getOwner().getAvatar());
            response.setOwner(ownerInfo);
        }

        return response;
    }
}
