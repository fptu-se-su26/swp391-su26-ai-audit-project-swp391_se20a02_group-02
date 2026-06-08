package com.luxeway.service;

import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.entity.VehicleFeature;
import com.luxeway.entity.VehicleImage;
import com.luxeway.enums.FuelType;
import com.luxeway.enums.TransmissionType;
import com.luxeway.enums.VehicleCategory;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // ====== Get all (with filters) ======

    public Page<VehicleDTOs.VehicleResponse> getVehicles(VehicleDTOs.VehicleFilterRequest filter) {
        Pageable pageable = buildPageable(filter.getSortBy(), filter.getPage(), filter.getSize());

        // Normalize location: supports both Vietnamese ("Hà Nội") and plain ASCII ("Ha Noi")
        String resolvedLocation = resolveLocation(filter.getLocation());

        // Parse categories (multi-select)
        List<VehicleCategory> categoryList = null;
        if (filter.getCategories() != null && !filter.getCategories().isEmpty()) {
            categoryList = filter.getCategories().stream()
                .map(c -> {
                    try { return VehicleCategory.valueOf(c.toUpperCase()); }
                    catch (IllegalArgumentException e) { return null; }
                })
                .filter(c -> c != null)
                .collect(Collectors.toList());
        } else if (filter.getCategory() != null && !filter.getCategory().isBlank()) {
            // Legacy single category fallback
            try {
                categoryList = List.of(VehicleCategory.valueOf(filter.getCategory().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }

        // Brands (lowercase for case-insensitive IN query)
        List<String> brandList = (filter.getBrands() != null && !filter.getBrands().isEmpty())
            ? filter.getBrands().stream().map(String::toLowerCase).collect(Collectors.toList())
            : null;

        TransmissionType transmission = null;
        if (filter.getTransmission() != null && !filter.getTransmission().isBlank()) {
            try { transmission = TransmissionType.valueOf(filter.getTransmission().toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        FuelType fuelType = null;
        if (filter.getFuelType() != null && !filter.getFuelType().isBlank()) {
            try { fuelType = FuelType.valueOf(filter.getFuelType().toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        com.luxeway.enums.VehicleType vehicleType = null;
        if (filter.getVehicleType() != null && !filter.getVehicleType().isBlank()) {
            try { vehicleType = com.luxeway.enums.VehicleType.valueOf(filter.getVehicleType().toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        Page<Vehicle> page = vehicleRepository.filterVehiclesMulti(
            resolvedLocation,
            categoryList,
            brandList,
            filter.getMinPrice(),
            filter.getMaxPrice(),
            filter.getMinSeats(),
            transmission,
            fuelType,
            filter.getMinRating(),
            filter.isFeatured(),
            filter.isInstantBook(),
            filter.isDeliveryAvailable(),
            vehicleType,
            filter.getMinEngineCc(),
            filter.getMaxEngineCc(),
            filter.getHasHelmet() != null ? filter.getHasHelmet() : false,
            filter.getHasPhoneHolder() != null ? filter.getHasPhoneHolder() : false,
            filter.getHasRaincoat() != null ? filter.getHasRaincoat() : false,
            filter.getHasTouringPackage() != null ? filter.getHasTouringPackage() : false,
            filter.getHasChauffeur() != null ? filter.getHasChauffeur() : false,
            filter.getAirportDelivery() != null ? filter.getAirportDelivery() : false,
            filter.getWeddingRental() != null ? filter.getWeddingRental() : false,
            filter.getBusinessRental() != null ? filter.getBusinessRental() : false,
            filter.getStartDate(),
            filter.getEndDate(),
            pageable
        );

        return page.map(this::toResponse);
    }

    /**
     * Resolves location string to the Vietnamese form stored in the database.
     * Handles both diacritic form ("Hà Nội") and plain ASCII form ("Ha Noi", "ha noi").
     * If no mapping is found, returns the original string (allows partial matching via LIKE).
     */
    private String resolveLocation(String location) {
        if (location == null || location.isBlank()) return null;

        // Mapping table: lowercase no-diacritic form → Vietnamese form in DB
        java.util.Map<String, String> cityMap = new java.util.HashMap<>();
        cityMap.put("ho chi minh",  "Hồ Chí Minh");
        cityMap.put("hcm",          "Hồ Chí Minh");
        cityMap.put("tp hcm",       "Hồ Chí Minh");
        cityMap.put("sai gon",      "Hồ Chí Minh");
        cityMap.put("saigon",       "Hồ Chí Minh");
        cityMap.put("ha noi",       "Hà Nội");
        cityMap.put("hanoi",        "Hà Nội");
        cityMap.put("da nang",      "Đà Nẵng");
        cityMap.put("danang",       "Đà Nẵng");
        cityMap.put("nha trang",    "Nha Trang");
        cityMap.put("nhatrang",     "Nha Trang");
        cityMap.put("da lat",       "Đà Lạt");
        cityMap.put("dalat",        "Đà Lạt");
        cityMap.put("hai phong",    "Hải Phòng");
        cityMap.put("haiphong",     "Hải Phòng");
        cityMap.put("hue",          "Huế");
        cityMap.put("can tho",      "Cần Thơ");
        cityMap.put("cantho",       "Cần Thơ");
        cityMap.put("vung tau",     "Vũng Tàu");
        cityMap.put("vungtau",      "Vũng Tàu");

        String key = location.toLowerCase().trim();
        return cityMap.getOrDefault(key, location); // fallback: use as-is (supports Vietnamese input & partial match)
    }

    // ====== Search ======

    public Page<VehicleDTOs.VehicleResponse> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return vehicleRepository.searchVehicles(query, pageable).map(this::toResponse);
    }

    // ====== Get by ID ======

    public VehicleDTOs.VehicleResponse getById(String id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));
        return toResponse(vehicle);
    }

    // ====== Featured vehicles ======

    public List<VehicleDTOs.VehicleResponse> getFeatured() {
        return vehicleRepository
                .findByIsFeaturedTrueAndStatusOrderByRatingDesc(VehicleStatus.AVAILABLE)
                .stream()
                .limit(9)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ====== Get vehicles by owner ======

    public List<VehicleDTOs.VehicleResponse> getByOwner(String ownerId) {
        return vehicleRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ====== Create ======

    @Transactional
    public VehicleDTOs.VehicleResponse create(String ownerId, VehicleDTOs.CreateVehicleRequest req) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        com.luxeway.enums.VehicleType vehicleType = com.luxeway.enums.VehicleType.CAR;
        if (req.getVehicleType() != null) {
            try {
                vehicleType = com.luxeway.enums.VehicleType.valueOf(req.getVehicleType().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Vehicle vehicle = Vehicle.builder()
                .owner(owner)
                .name(req.getName())
                .brand(req.getBrand())
                .model(req.getModel())
                .year(req.getYear())
                .category(req.getCategory())
                .vehicleType(vehicleType)
                .engineCc(req.getEngineCc())
                .hasHelmet(req.getHasHelmet() != null ? req.getHasHelmet() : false)
                .hasPhoneHolder(req.getHasPhoneHolder() != null ? req.getHasPhoneHolder() : false)
                .hasRaincoat(req.getHasRaincoat() != null ? req.getHasRaincoat() : false)
                .hasTouringPackage(req.getHasTouringPackage() != null ? req.getHasTouringPackage() : false)
                .hasChauffeur(req.getHasChauffeur() != null ? req.getHasChauffeur() : false)
                .airportDelivery(req.getAirportDelivery() != null ? req.getAirportDelivery() : false)
                .weddingRental(req.getWeddingRental() != null ? req.getWeddingRental() : false)
                .businessRental(req.getBusinessRental() != null ? req.getBusinessRental() : false)
                .description(req.getDescription())
                .pricePerDay(req.getPricePerDay())
                .pricePerWeek(req.getPricePerWeek())
                .deposit(req.getDeposit())
                .city(req.getCity())
                .country(req.getCountry() != null ? req.getCountry() : "Vietnam")
                .address(req.getAddress())
                .latitude(req.getLatitude() != null ? BigDecimal.valueOf(req.getLatitude()) : null)
                .longitude(req.getLongitude() != null ? BigDecimal.valueOf(req.getLongitude()) : null)
                .seats(req.getSeats())
                .doors(req.getDoors())
                .horsepower(req.getHorsepower())
                .topSpeed(req.getTopSpeed())
                .transmission(req.getTransmission())
                .fuelType(req.getFuelType())
                .rangeKm(req.getRangeKm())
                .engineSize(req.getEngineSize())
                .color(req.getColor())
                .licensePlate(req.getLicensePlate())
                .minRentalDays(req.getMinRentalDays())
                .maxRentalDays(req.getMaxRentalDays())
                .instantBook(req.getInstantBook())
                .deliveryAvailable(req.getDeliveryAvailable())
                .deliveryFee(req.getDeliveryFee())
                .status(VehicleStatus.PENDING_APPROVAL)
                .build();

        vehicle = vehicleRepository.save(vehicle);

        // Add images
        if (req.getImageUrls() != null) {
            Vehicle finalVehicle = vehicle;
            var images = req.getImageUrls().stream()
                    .map(url -> VehicleImage.builder()
                            .vehicle(finalVehicle)
                            .url(url)
                            .isPrimary(false)
                            .build())
                    .collect(Collectors.toSet());
            if (!images.isEmpty()) {
                images.iterator().next().setIsPrimary(true);
                vehicle.setImages(images);
                vehicle.setThumbnailUrl(req.getImageUrls().get(0));
            }
        }

        // Add features
        if (req.getFeatures() != null) {
            Vehicle finalVehicle = vehicle;
            var features = req.getFeatures().stream()
                    .map(f -> VehicleFeature.builder()
                            .vehicle(finalVehicle)
                            .feature(f)
                            .build())
                    .collect(Collectors.toSet());
            vehicle.setFeatures(features);
        }

        vehicle = vehicleRepository.save(vehicle);
        log.info("Vehicle created: {} by owner {}", vehicle.getId(), ownerId);
        try {
            emailService.sendAdminNotification(
                "New Vehicle Listing Pending Approval",
                "Vehicle: " + vehicle.getBrand() + " " + vehicle.getModel() + " (" + vehicle.getLicensePlate() + ") has been submitted by Owner ID: " + ownerId
            );
        } catch (Exception e) {
            log.warn("Failed to send admin notification email for new vehicle creation: {}", e.getMessage());
        }
        return toResponse(vehicle);
    }

    // ====== Update ======

    @Transactional
    public VehicleDTOs.VehicleResponse update(String vehicleId, String ownerId,
                                              VehicleDTOs.CreateVehicleRequest req, boolean isAdmin) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!isAdmin && !vehicle.getOwner().getId().equals(ownerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to update this vehicle");
        }

        vehicle.setName(req.getName());
        vehicle.setBrand(req.getBrand());
        vehicle.setModel(req.getModel());
        if (req.getVehicleType() != null) {
            try {
                vehicle.setVehicleType(com.luxeway.enums.VehicleType.valueOf(req.getVehicleType().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }
        vehicle.setEngineCc(req.getEngineCc());
        if (req.getHasHelmet() != null) vehicle.setHasHelmet(req.getHasHelmet());
        if (req.getHasPhoneHolder() != null) vehicle.setHasPhoneHolder(req.getHasPhoneHolder());
        if (req.getHasRaincoat() != null) vehicle.setHasRaincoat(req.getHasRaincoat());
        if (req.getHasTouringPackage() != null) vehicle.setHasTouringPackage(req.getHasTouringPackage());
        if (req.getHasChauffeur() != null) vehicle.setHasChauffeur(req.getHasChauffeur());
        if (req.getAirportDelivery() != null) vehicle.setAirportDelivery(req.getAirportDelivery());
        if (req.getWeddingRental() != null) vehicle.setWeddingRental(req.getWeddingRental());
        if (req.getBusinessRental() != null) vehicle.setBusinessRental(req.getBusinessRental());
        vehicle.setDescription(req.getDescription());
        vehicle.setPricePerDay(req.getPricePerDay());
        vehicle.setDeposit(req.getDeposit());
        vehicle.setCity(req.getCity());
        vehicle.setAddress(req.getAddress());
        vehicle.setSeats(req.getSeats());
        vehicle.setTransmission(req.getTransmission());
        vehicle.setFuelType(req.getFuelType());
        vehicle.setInstantBook(req.getInstantBook());
        vehicle.setDeliveryAvailable(req.getDeliveryAvailable());

        return toResponse(vehicleRepository.save(vehicle));
    }

    // ====== Delete ======

    @Transactional
    public void delete(String vehicleId, String requesterId, boolean isAdmin) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!isAdmin && !vehicle.getOwner().getId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to delete this vehicle");
        }

        vehicleRepository.delete(vehicle);
        log.info("Vehicle deleted: {}", vehicleId);
    }

    // ====== Map to response DTO ======

    public VehicleDTOs.VehicleResponse toResponse(Vehicle v) {
        VehicleDTOs.VehicleResponse r = new VehicleDTOs.VehicleResponse();
        r.setId(v.getId());
        r.setName(v.getName());
        r.setBrand(v.getBrand());
        r.setModel(v.getModel());
        r.setYear(v.getYear());
        r.setCategory(v.getCategory().name().toLowerCase());
        r.setDescription(v.getDescription());
        r.setThumbnailUrl(v.getThumbnailUrl());
        r.setPricePerDay(v.getPricePerDay());
        r.setPricePerWeek(v.getPricePerWeek());
        r.setDeposit(v.getDeposit());
        r.setCity(v.getCity());
        r.setCountry(v.getCountry());
        r.setAddress(v.getAddress());
        r.setSeats(v.getSeats());
        r.setDoors(v.getDoors());
        r.setHorsepower(v.getHorsepower());
        r.setTransmission(v.getTransmission() != null ? v.getTransmission().name().toLowerCase() : null);
        r.setFuelType(v.getFuelType() != null ? v.getFuelType().name().toLowerCase() : null);
        r.setColor(v.getColor());
        r.setLicensePlate(v.getLicensePlate());
        r.setStatus(v.getStatus().name().toLowerCase());
        r.setRating(v.getRating() != null ? v.getRating().doubleValue() : 0.0);
        r.setTotalReviews(v.getTotalReviews());
        r.setTotalBookings(v.getTotalBookings());
        r.setIsVerified(v.getIsVerified());
        r.setIsFeatured(v.getIsFeatured());
        r.setInstantBook(v.getInstantBook());
        r.setDeliveryAvailable(v.getDeliveryAvailable());
        r.setDeliveryFee(v.getDeliveryFee());
        r.setCreatedAt(v.getCreatedAt() != null ? v.getCreatedAt().toString() : null);
        r.setUpdatedAt(v.getUpdatedAt() != null ? v.getUpdatedAt().toString() : null);

        // Ecosystem additions
        r.setVehicleType(v.getVehicleType() != null ? v.getVehicleType().name().toLowerCase() : null);
        r.setEngineCc(v.getEngineCc());
        r.setHasHelmet(v.getHasHelmet());
        r.setHasPhoneHolder(v.getHasPhoneHolder());
        r.setHasRaincoat(v.getHasRaincoat());
        r.setHasTouringPackage(v.getHasTouringPackage());
        r.setHasChauffeur(v.getHasChauffeur());
        r.setAirportDelivery(v.getAirportDelivery());
        r.setWeddingRental(v.getWeddingRental());
        r.setBusinessRental(v.getBusinessRental());

        // Images
        if (v.getImages() != null) {
            r.setImages(v.getImages().stream()
                    .sorted(java.util.Comparator.comparing(i -> !i.getIsPrimary()))
                    .map(VehicleImage::getUrl)
                    .collect(Collectors.toList()));
        }

        // Features
        if (v.getFeatures() != null) {
            r.setFeatures(v.getFeatures().stream()
                    .map(VehicleFeature::getFeature)
                    .collect(Collectors.toList()));
        }

        // Owner info
        if (v.getOwner() != null) {
            VehicleDTOs.VehicleResponse.OwnerInfo ownerInfo = new VehicleDTOs.VehicleResponse.OwnerInfo();
            User o = v.getOwner();
            ownerInfo.setId(o.getId());
            ownerInfo.setDisplayName(o.getDisplayName());
            ownerInfo.setAvatar(o.getAvatar());
            ownerInfo.setRating(o.getRating() != null ? o.getRating().doubleValue() : 0.0);
            ownerInfo.setTotalReviews(o.getTotalReviews());
            ownerInfo.setVerified(o.getVerified());
            ownerInfo.setAccountType(o.getAccountType());
            ownerInfo.setCompanyName(o.getCompanyName());
            r.setOwner(ownerInfo);
        }

        return r;
    }

    private Pageable buildPageable(String sortBy, int page, int size) {
        Sort sort = switch (sortBy == null ? "" : sortBy) {
            case "price_asc"  -> Sort.by("pricePerDay").ascending();
            case "price_desc" -> Sort.by("pricePerDay").descending();
            case "rating"     -> Sort.by("rating").descending();
            case "newest"     -> Sort.by("createdAt").descending();
            case "popular"    -> Sort.by("totalBookings").descending();
            default           -> Sort.by("isFeatured").descending().and(Sort.by("rating").descending());
        };
        return PageRequest.of(page, size, sort);
    }
}
