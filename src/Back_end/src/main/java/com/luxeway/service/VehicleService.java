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
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.VehicleAvailabilityRepository;
import com.luxeway.entity.VehicleAvailability;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final TranslationService translationService;
    private final BookingRepository bookingRepository;
    private final VehicleAvailabilityRepository vehicleAvailabilityRepository;
    private final NotificationService notificationService;

    // ====== Get all (with filters) ======

    @Transactional(readOnly = true)
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

        boolean isNearestSort = "nearest".equalsIgnoreCase(filter.getSortBy()) && filter.getUserLat() != null && filter.getUserLng() != null;
        boolean needsManualProcessing = isNearestSort || (filter.getKeyword() != null && !filter.getKeyword().isBlank());
        Pageable queryPageable = needsManualProcessing ? PageRequest.of(0, 10000) : pageable;

        Page<Vehicle> page = vehicleRepository.filterVehiclesMulti(
            filter.getKeyword(),
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
            filter.getMinLatitude(),
            filter.getMaxLatitude(),
            filter.getMinLongitude(),
            filter.getMaxLongitude(),
            filter.getStartDate(),
            filter.getEndDate(),
            queryPageable
        );

        List<Vehicle> list = page.getContent();

        // 1. Filter by keyword in Java
        if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
            String kw = filter.getKeyword().toLowerCase().trim();
            list = list.stream()
                .filter(v -> (v.getName() != null && v.getName().toLowerCase().contains(kw)) ||
                             (v.getBrand() != null && v.getBrand().toLowerCase().contains(kw)) ||
                             (v.getModel() != null && v.getModel().toLowerCase().contains(kw)))
                .collect(Collectors.toList());
        }

        // 2. Map and calculate distance
        List<VehicleDTOs.VehicleResponse> responses = list.stream().map(v -> {
            VehicleDTOs.VehicleResponse r = toResponse(v);
            if (filter.getUserLat() != null && filter.getUserLng() != null && v.getLatitude() != null && v.getLongitude() != null) {
                r.setDistanceKm(calculateHaversineDistance(filter.getUserLat(), filter.getUserLng(), v.getLatitude().doubleValue(), v.getLongitude().doubleValue()));
            }
            return r;
        }).collect(Collectors.toList());

        // 3. Sort by distance in Java if requested
        if (isNearestSort) {
            responses.sort((r1, r2) -> {
                Double d1 = r1.getDistanceKm();
                Double d2 = r2.getDistanceKm();
                if (d1 == null && d2 == null) return 0;
                if (d1 == null) return 1;
                if (d2 == null) return -1;
                return d1.compareTo(d2);
            });
        }

        // 4. Paginate manually in Java if manual processing was performed
        if (needsManualProcessing) {
            int start = filter.getPage() * filter.getSize();
            int end = Math.min(start + filter.getSize(), responses.size());
            List<VehicleDTOs.VehicleResponse> pagedList = (start < responses.size())
                ? responses.subList(start, end)
                : List.of();
            return new PageImpl<>(pagedList, pageable, responses.size());
        }

        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }

    /**
     * Resolves location string to the Vietnamese form stored in the database.
     * Handles both diacritic form ("Hà Nội") and plain ASCII form ("Ha Noi", "ha noi").
     * If no mapping is found, returns the original string (allows partial matching via LIKE).
     */
    private String resolveLocation(String location) {
        if (location == null || location.isBlank()) return null;
        String resolved = resolveKnownLocation(location);
        if (resolved != null) return resolved;

        // Mapping table: lowercase form (both with and without diacritics) → English form in DB
        java.util.Map<String, String> cityMap = new java.util.HashMap<>();
        // Ho Chi Minh
        cityMap.put("ho chi minh",   "Ho Chi Minh");
        cityMap.put("hồ chí minh",   "Ho Chi Minh");
        cityMap.put("hổ chí minh",   "Ho Chi Minh");
        cityMap.put("hcm",           "Ho Chi Minh");
        cityMap.put("tp hcm",        "Ho Chi Minh");
        cityMap.put("tp. hồ chí minh","Ho Chi Minh");
        cityMap.put("sai gon",       "Ho Chi Minh");
        cityMap.put("saigon",        "Ho Chi Minh");
        // Ha Noi
        cityMap.put("ha noi",        "Ha Noi");
        cityMap.put("hà nội",        "Ha Noi");
        cityMap.put("hanoi",         "Ha Noi");
        // Da Nang
        cityMap.put("da nang",       "Da Nang");
        cityMap.put("đà nẵng",       "Da Nang");
        cityMap.put("danang",        "Da Nang");
        // Nha Trang
        cityMap.put("nha trang",     "Nha Trang");
        cityMap.put("nhatrang",      "Nha Trang");
        // Da Lat
        cityMap.put("da lat",        "Da Lat");
        cityMap.put("đà lạt",        "Da Lat");
        cityMap.put("dalat",         "Da Lat");
        // Hai Phong
        cityMap.put("hai phong",     "Hai Phong");
        cityMap.put("hải phòng",     "Hai Phong");
        cityMap.put("haiphong",      "Hai Phong");
        // Hue
        cityMap.put("hue",           "Hue");
        cityMap.put("huế",           "Hue");
        // Can Tho
        cityMap.put("can tho",       "Can Tho");
        cityMap.put("cần thơ",       "Can Tho");
        cityMap.put("cantho",        "Can Tho");
        // Vung Tau
        cityMap.put("vung tau",      "Vung Tau");
        cityMap.put("vũng tàu",      "Vung Tau");
        cityMap.put("vungtau",       "Vung Tau");
        // Phu Quoc
        cityMap.put("phu quoc",      "Phu Quoc");
        cityMap.put("phú quốc",      "Phu Quoc");
        cityMap.put("phuquoc",       "Phu Quoc");

        String key = location.toLowerCase().trim();
        return cityMap.getOrDefault(key, location); // fallback: use as-is
    }

    private String resolveKnownLocation(String location) {
        Map<String, String> cityMap = new HashMap<>();
        cityMap.put("ho chi minh", "Ho Chi Minh");
        cityMap.put("hcm", "Ho Chi Minh");
        cityMap.put("tp hcm", "Ho Chi Minh");
        cityMap.put("tp ho chi minh", "Ho Chi Minh");
        cityMap.put("sai gon", "Ho Chi Minh");
        cityMap.put("saigon", "Ho Chi Minh");
        cityMap.put("ha noi", "Ha Noi");
        cityMap.put("hanoi", "Ha Noi");
        cityMap.put("da nang", "Da Nang");
        cityMap.put("danang", "Da Nang");
        cityMap.put("nha trang", "Nha Trang");
        cityMap.put("nhatrang", "Nha Trang");
        cityMap.put("da lat", "Da Lat");
        cityMap.put("dalat", "Da Lat");
        cityMap.put("hai phong", "Hai Phong");
        cityMap.put("haiphong", "Hai Phong");
        cityMap.put("hue", "Hue");
        cityMap.put("can tho", "Can Tho");
        cityMap.put("cantho", "Can Tho");
        cityMap.put("vung tau", "Vung Tau");
        cityMap.put("vungtau", "Vung Tau");
        cityMap.put("phu quoc", "Phu Quoc");
        cityMap.put("phuquoc", "Phu Quoc");
        return cityMap.get(normalizeLocationKey(location));
    }

    private String normalizeLocationKey(String location) {
        String normalized = Normalizer.normalize(location.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replace('Đ', 'D')
                .toLowerCase();
        return normalized
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    // ====== Search ======

    @Transactional(readOnly = true)
    public Page<VehicleDTOs.VehicleResponse> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return vehicleRepository.searchVehicles(query, VehicleStatus.AVAILABLE, pageable).map(this::toResponse);
    }

    // ====== Get by ID ======

    @Transactional(readOnly = true)
    public VehicleDTOs.VehicleResponse getById(String id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));
        return toResponse(vehicle);
    }

    // ====== Featured vehicles ======

    @Transactional(readOnly = true)
    public List<VehicleDTOs.VehicleResponse> getFeatured() {
        return vehicleRepository
                .findFeaturedApproved(VehicleStatus.AVAILABLE)
                .stream()
                .limit(9)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ====== Get vehicles by owner ======

    @Transactional(readOnly = true)
    public List<VehicleDTOs.VehicleResponse> getByOwner(String ownerId) {
        return vehicleRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ====== Create ======

    @Transactional
    public VehicleDTOs.VehicleResponse create(String ownerId, VehicleDTOs.CreateVehicleRequest req) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));



        if (req.getBrand() == null || req.getBrand().isBlank()) {
            throw new IllegalArgumentException("Brand is required");
        }
        if (req.getModel() == null || req.getModel().isBlank()) {
            throw new IllegalArgumentException("Model is required");
        }
        int currentYear = java.time.LocalDate.now().getYear();
        if (req.getYear() == null || req.getYear() < 1950 || req.getYear() > currentYear + 1) {
            throw new IllegalArgumentException("Invalid year. Must be between 1950 and " + (currentYear + 1));
        }
        if (req.getPricePerDay() == null || req.getPricePerDay().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price per day must be positive");
        }
        if (req.getLicensePlate() == null || req.getLicensePlate().isBlank()) {
            throw new IllegalArgumentException("License plate is required");
        }
        if (vehicleRepository.existsByLicensePlate(req.getLicensePlate())) {
            throw new IllegalArgumentException("License plate already exists");
        }
        if (req.getImageUrls() == null || req.getImageUrls().size() < 3 || req.getImageUrls().stream().anyMatch(String::isBlank)) {
            throw new IllegalArgumentException("At least three vehicle images are required");
        }
        if (req.getVehicleType() == null || req.getVehicleType().isBlank()) {
            throw new IllegalArgumentException("Vehicle type is required");
        }
        if (req.getCity() == null || req.getCity().isBlank()) {
            throw new IllegalArgumentException("Location is required");
        }

        com.luxeway.enums.VehicleType vehicleType;
        try {
            vehicleType = com.luxeway.enums.VehicleType.valueOf(req.getVehicleType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid vehicle type. Must be CAR or MOTORBIKE");
        }

        boolean isOwnerAdmin = owner.getRole() != null && owner.getRole().hasAdminAccess();
        if (!isOwnerAdmin) {
            String statusStr = req.getStatus();
            String approvalStatusStr = req.getApprovalStatus();
            if ((statusStr != null && (statusStr.equalsIgnoreCase("APPROVED") || statusStr.equalsIgnoreCase("AVAILABLE") || statusStr.equalsIgnoreCase("BLOCKED"))) ||
                (approvalStatusStr != null && (approvalStatusStr.equalsIgnoreCase("APPROVED") || approvalStatusStr.equalsIgnoreCase("AVAILABLE") || approvalStatusStr.equalsIgnoreCase("BLOCKED")))) {
                throw new org.springframework.security.access.AccessDeniedException("Not authorized to set status to APPROVED, AVAILABLE, or BLOCKED");
            }
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
                .vin(req.getVin())
                .minRentalDays(req.getMinRentalDays())
                .maxRentalDays(req.getMaxRentalDays())
                .instantBook(req.getInstantBook())
                .deliveryAvailable(req.getDeliveryAvailable())
                .deliveryFee(req.getDeliveryFee())
                .status(VehicleStatus.PENDING_APPROVAL)
                .approvalStatus(VehicleStatus.PENDING_APPROVAL)
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

        // Create notifications for all admins
        try {
            List<User> admins = userRepository.findByRole(com.luxeway.enums.UserRole.ADMIN);
            for (User admin : admins) {
                notificationService.createNotification(
                    admin.getId(),
                    "VEHICLE_APPROVAL",
                    "New Vehicle Listing Pending Approval",
                    "Vehicle: " + vehicle.getBrand() + " " + vehicle.getModel() + " (" + vehicle.getLicensePlate() + ") has been submitted by Owner: " + owner.getDisplayName(),
                    "/admin?tab=vehicles&id=" + vehicle.getId()
                );
            }
        } catch (Exception e) {
            log.warn("Failed to create notifications for admin: {}", e.getMessage());
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
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized vehicle access");
        }

        // Validations
        if (req.getBrand() == null || req.getBrand().isBlank()) {
            throw new IllegalArgumentException("Brand is required");
        }
        if (req.getModel() == null || req.getModel().isBlank()) {
            throw new IllegalArgumentException("Model is required");
        }
        int currentYear = java.time.LocalDate.now().getYear();
        if (req.getYear() == null || req.getYear() < 1950 || req.getYear() > currentYear + 1) {
            throw new IllegalArgumentException("Invalid year. Must be between 1950 and " + (currentYear + 1));
        }
        if (req.getPricePerDay() == null || req.getPricePerDay().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price per day must be positive");
        }
        if (req.getLicensePlate() == null || req.getLicensePlate().isBlank()) {
            throw new IllegalArgumentException("License plate is required");
        }
        if (vehicleRepository.existsByLicensePlateAndIdNot(req.getLicensePlate(), vehicleId)) {
            throw new IllegalArgumentException("License plate already exists");
        }
        if (req.getImageUrls() == null || req.getImageUrls().isEmpty() || req.getImageUrls().stream().allMatch(String::isBlank)) {
            throw new IllegalArgumentException("At least one vehicle image is required");
        }
        if (req.getVehicleType() == null || req.getVehicleType().isBlank()) {
            throw new IllegalArgumentException("Vehicle type is required");
        }
        try {
            com.luxeway.enums.VehicleType.valueOf(req.getVehicleType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid vehicle type. Must be CAR or MOTORBIKE");
        }

        // Access check for status manual changes and core details transitions
        if (!isAdmin) {
            String statusStr = req.getStatus();
            String approvalStatusStr = req.getApprovalStatus();
            if ((statusStr != null && (statusStr.equalsIgnoreCase("APPROVED") || statusStr.equalsIgnoreCase("AVAILABLE") || statusStr.equalsIgnoreCase("BLOCKED"))) ||
                (approvalStatusStr != null && (approvalStatusStr.equalsIgnoreCase("APPROVED") || approvalStatusStr.equalsIgnoreCase("AVAILABLE") || approvalStatusStr.equalsIgnoreCase("BLOCKED")))) {
                throw new org.springframework.security.access.AccessDeniedException("Not authorized to set status to APPROVED, AVAILABLE, or BLOCKED");
            }

            VehicleStatus currentStatus = vehicle.getStatus();
            VehicleStatus currentApprovalStatus = vehicle.getApprovalStatus();

            if (currentStatus == VehicleStatus.AVAILABLE || currentApprovalStatus == VehicleStatus.APPROVED) {
                boolean coreDetailsChanged = false;
                
                if (req.getPricePerDay() != null && vehicle.getPricePerDay().compareTo(req.getPricePerDay()) != 0) {
                    coreDetailsChanged = true;
                }
                if (!java.util.Objects.equals(vehicle.getDescription(), req.getDescription())) {
                    coreDetailsChanged = true;
                }
                List<String> oldImages = vehicle.getImagesList();
                List<String> newImages = req.getImageUrls() != null ? req.getImageUrls() : new java.util.ArrayList<>();
                if (!oldImages.equals(newImages)) {
                    coreDetailsChanged = true;
                }
                if (vehicle.getTransmission() != req.getTransmission() ||
                    vehicle.getFuelType() != req.getFuelType() ||
                    (req.getVehicleType() != null && !vehicle.getVehicleType().name().equalsIgnoreCase(req.getVehicleType())) ||
                    !java.util.Objects.equals(vehicle.getSeats(), req.getSeats()) ||
                    !java.util.Objects.equals(vehicle.getDoors(), req.getDoors()) ||
                    !java.util.Objects.equals(vehicle.getHorsepower(), req.getHorsepower()) ||
                    !java.util.Objects.equals(vehicle.getTopSpeed(), req.getTopSpeed()) ||
                    !java.util.Objects.equals(vehicle.getEngineCc(), req.getEngineCc()) ||
                    !java.util.Objects.equals(vehicle.getYear(), req.getYear()) ||
                    !java.util.Objects.equals(vehicle.getBrand(), req.getBrand()) ||
                    !java.util.Objects.equals(vehicle.getModel(), req.getModel()) ||
                    !java.util.Objects.equals(vehicle.getHasHelmet(), req.getHasHelmet()) ||
                    !java.util.Objects.equals(vehicle.getHasPhoneHolder(), req.getHasPhoneHolder()) ||
                    !java.util.Objects.equals(vehicle.getHasRaincoat(), req.getHasRaincoat()) ||
                    !java.util.Objects.equals(vehicle.getHasTouringPackage(), req.getHasTouringPackage()) ||
                    !java.util.Objects.equals(vehicle.getHasChauffeur(), req.getHasChauffeur()) ||
                    !java.util.Objects.equals(vehicle.getAirportDelivery(), req.getAirportDelivery()) ||
                    !java.util.Objects.equals(vehicle.getWeddingRental(), req.getWeddingRental()) ||
                    !java.util.Objects.equals(vehicle.getBusinessRental(), req.getBusinessRental())) {
                    coreDetailsChanged = true;
                }

                if (coreDetailsChanged) {
                    vehicle.setStatus(VehicleStatus.PENDING_APPROVAL);
                    vehicle.setApprovalStatus(VehicleStatus.PENDING_APPROVAL);
                    
                    try {
                        List<User> admins = userRepository.findByRole(com.luxeway.enums.UserRole.ADMIN);
                        List<User> superAdmins = userRepository.findByRole(com.luxeway.enums.UserRole.SUPER_ADMIN);
                        for (User admin : admins) {
                            notificationService.createNotification(
                                admin.getId(),
                                "VEHICLE_APPROVAL",
                                "Vehicle update requires approval",
                                "Vehicle: " + req.getBrand() + " " + req.getModel() + " has been updated by Owner and needs re-approval.",
                                "/admin?tab=vehicles&id=" + vehicle.getId()
                            );
                        }
                        for (User superAdmin : superAdmins) {
                            notificationService.createNotification(
                                superAdmin.getId(),
                                "VEHICLE_APPROVAL",
                                "Vehicle update requires approval",
                                "Vehicle: " + req.getBrand() + " " + req.getModel() + " has been updated by Owner and needs re-approval.",
                                "/admin?tab=vehicles&id=" + vehicle.getId()
                            );
                        }
                        notificationService.createNotification(
                            vehicle.getOwner().getId(),
                            "VEHICLE_APPROVAL",
                            "Vehicle update pending approval",
                            "Your vehicle " + req.getBrand() + " " + req.getModel() + " has been set to pending approval due to core changes.",
                            "/owner/vehicles"
                        );
                    } catch (Exception e) {
                        log.warn("Failed to notify admins of vehicle update: {}", e.getMessage());
                    }
                } else {
                    vehicle.setStatus(currentStatus);
                    vehicle.setApprovalStatus(currentApprovalStatus);
                }
            } else if (currentStatus == VehicleStatus.DRAFT) {
                vehicle.setStatus(VehicleStatus.PENDING_APPROVAL);
                vehicle.setApprovalStatus(VehicleStatus.PENDING_APPROVAL);
                
                try {
                    List<User> admins = userRepository.findByRole(com.luxeway.enums.UserRole.ADMIN);
                    List<User> superAdmins = userRepository.findByRole(com.luxeway.enums.UserRole.SUPER_ADMIN);
                    for (User admin : admins) {
                        notificationService.createNotification(
                            admin.getId(),
                            "VEHICLE_APPROVAL",
                            "New vehicle waiting for approval",
                            "Vehicle: " + req.getBrand() + " " + req.getModel() + " has been resubmitted from Draft.",
                            "/admin?tab=vehicles&id=" + vehicle.getId()
                        );
                    }
                    for (User superAdmin : superAdmins) {
                        notificationService.createNotification(
                            superAdmin.getId(),
                            "VEHICLE_APPROVAL",
                            "New vehicle waiting for approval",
                            "Vehicle: " + req.getBrand() + " " + req.getModel() + " has been resubmitted from Draft.",
                            "/admin?tab=vehicles&id=" + vehicle.getId()
                        );
                    }
                } catch (Exception e) {
                    log.warn("Failed to notify admins of vehicle update: {}", e.getMessage());
                }
            } else if (currentStatus == VehicleStatus.REJECTED || currentApprovalStatus == VehicleStatus.REJECTED) {
                vehicle.setStatus(VehicleStatus.PENDING_APPROVAL);
                vehicle.setApprovalStatus(VehicleStatus.PENDING_APPROVAL);
                
                try {
                    List<User> admins = userRepository.findByRole(com.luxeway.enums.UserRole.ADMIN);
                    List<User> superAdmins = userRepository.findByRole(com.luxeway.enums.UserRole.SUPER_ADMIN);
                    for (User admin : admins) {
                        notificationService.createNotification(
                            admin.getId(),
                            "VEHICLE_APPROVAL",
                            "New vehicle waiting for approval",
                            "Vehicle: " + req.getBrand() + " " + req.getModel() + " has been edited by Owner and resubmitted.",
                            "/admin?tab=vehicles&id=" + vehicle.getId()
                        );
                    }
                    for (User superAdmin : superAdmins) {
                        notificationService.createNotification(
                            superAdmin.getId(),
                            "VEHICLE_APPROVAL",
                            "New vehicle waiting for approval",
                            "Vehicle: " + req.getBrand() + " " + req.getModel() + " has been edited by Owner and resubmitted.",
                            "/admin?tab=vehicles&id=" + vehicle.getId()
                        );
                    }
                } catch (Exception e) {
                    log.warn("Failed to notify admins of vehicle update: {}", e.getMessage());
                }
            } else {
                vehicle.setStatus(currentStatus);
                vehicle.setApprovalStatus(currentApprovalStatus);
            }
        }

        vehicle.setName(req.getName());
        vehicle.setBrand(req.getBrand());
        vehicle.setModel(req.getModel());
        vehicle.setYear(req.getYear());
        vehicle.setCategory(req.getCategory());
        
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
        vehicle.setPricePerWeek(req.getPricePerWeek());
        vehicle.setDeposit(req.getDeposit());
        vehicle.setCity(req.getCity());
        vehicle.setCountry(req.getCountry() != null ? req.getCountry() : "Vietnam");
        vehicle.setAddress(req.getAddress());
        
        if (req.getLatitude() != null) vehicle.setLatitude(BigDecimal.valueOf(req.getLatitude()));
        if (req.getLongitude() != null) vehicle.setLongitude(BigDecimal.valueOf(req.getLongitude()));
        
        vehicle.setSeats(req.getSeats());
        vehicle.setDoors(req.getDoors());
        vehicle.setHorsepower(req.getHorsepower());
        vehicle.setTopSpeed(req.getTopSpeed());
        vehicle.setTransmission(req.getTransmission());
        vehicle.setFuelType(req.getFuelType());
        vehicle.setRangeKm(req.getRangeKm());
        vehicle.setEngineSize(req.getEngineSize());
        vehicle.setColor(req.getColor());
        vehicle.setLicensePlate(req.getLicensePlate());
        vehicle.setVin(req.getVin());
        
        vehicle.setMinRentalDays(req.getMinRentalDays());
        vehicle.setMaxRentalDays(req.getMaxRentalDays());
        vehicle.setInstantBook(req.getInstantBook());
        vehicle.setDeliveryAvailable(req.getDeliveryAvailable());
        vehicle.setDeliveryFee(req.getDeliveryFee() != null ? req.getDeliveryFee() : BigDecimal.ZERO);

        // Update images
        if (vehicle.getImages() == null) {
            vehicle.setImages(new java.util.HashSet<>());
        }
        if (req.getImageUrls() != null) {
            vehicle.getImages().clear();
            Vehicle finalVehicle = vehicle;
            var newImages = req.getImageUrls().stream()
                    .map(url -> VehicleImage.builder()
                            .vehicle(finalVehicle)
                            .url(url)
                            .isPrimary(false)
                            .build())
                    .collect(Collectors.toSet());
            if (!newImages.isEmpty()) {
                newImages.iterator().next().setIsPrimary(true);
                vehicle.getImages().addAll(newImages);
                vehicle.setThumbnailUrl(req.getImageUrls().get(0));
            } else {
                vehicle.setThumbnailUrl(null);
            }
        }

        // Update features
        if (vehicle.getFeatures() == null) {
            vehicle.setFeatures(new java.util.HashSet<>());
        }
        if (req.getFeatures() != null) {
            vehicle.getFeatures().clear();
            Vehicle finalVehicle = vehicle;
            var newFeatures = req.getFeatures().stream()
                    .map(f -> VehicleFeature.builder()
                            .vehicle(finalVehicle)
                            .feature(f)
                            .build())
                    .collect(Collectors.toSet());
            vehicle.getFeatures().addAll(newFeatures);
        }

        return toResponse(vehicleRepository.save(vehicle));
    }

    // ====== Delete ======

    @Transactional
    public void delete(String vehicleId, String requesterId, boolean isAdmin) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!isAdmin) {
            if (!vehicle.getOwner().getId().equals(requesterId)) {
                throw new org.springframework.security.access.AccessDeniedException("Unauthorized vehicle access");
            }
            if (vehicle.getApprovalStatus() != VehicleStatus.DRAFT && vehicle.getApprovalStatus() != VehicleStatus.REJECTED) {
                throw new RuntimeException("Only vehicles in DRAFT or REJECTED status can be deleted");
            }
        }

        if (vehicle.getStatus() == VehicleStatus.RENTED) {
            throw new RuntimeException("Cannot delete currently rented vehicle");
        }

        boolean hasActiveBooking = bookingRepository.existsByVehicleIdAndStatusIn(
            vehicleId, 
            List.of(com.luxeway.enums.BookingStatus.ACTIVE, com.luxeway.enums.BookingStatus.CONFIRMED, com.luxeway.enums.BookingStatus.PENDING)
        );
        if (hasActiveBooking) {
            throw new RuntimeException("Cannot delete vehicle with active bookings");
        }

        vehicleRepository.delete(vehicle);
        log.info("Vehicle deleted: {}", vehicleId);
    }

    @Transactional(readOnly = true)
    public VehicleDTOs.VehicleResponse getVehicleDetail(String id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));

        // Constraint: Only return AVAILABLE and APPROVED vehicles
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE || vehicle.getApprovalStatus() != VehicleStatus.APPROVED) {
            throw new org.springframework.security.access.AccessDeniedException("This vehicle is currently unavailable or unapproved");
        }

        return toResponse(vehicle);
    }

    // ====== Map to response DTO ======

    public VehicleDTOs.VehicleResponse toResponse(Vehicle v) {
        String lang = translationService.getCurrentLanguageCode();
        VehicleDTOs.VehicleResponse r = new VehicleDTOs.VehicleResponse();
        r.setId(v.getId());
        r.setName(translationService.translateVehicle(v.getId(), lang, v.getName(), v.getDescription(), v.getCity(), v.getAddress(), "name"));
        r.setBrand(v.getBrand());
        r.setModel(v.getModel());
        r.setYear(v.getYear());
        r.setCategory(v.getCategory().name().toLowerCase());
        r.setDescription(translationService.translateVehicle(v.getId(), lang, v.getName(), v.getDescription(), v.getCity(), v.getAddress(), "description"));
        r.setThumbnailUrl(v.getThumbnailUrl());
        r.setPricePerDay(v.getPricePerDay());
        r.setPricePerWeek(v.getPricePerWeek());
        r.setDeposit(v.getDeposit());
        r.setCity(translationService.translateVehicle(v.getId(), lang, v.getName(), v.getDescription(), v.getCity(), v.getAddress(), "city"));
        r.setCountry(v.getCountry());
        r.setAddress(translationService.translateVehicle(v.getId(), lang, v.getName(), v.getDescription(), v.getCity(), v.getAddress(), "address"));
        r.setLatitude(v.getLatitude() != null ? v.getLatitude().doubleValue() : null);
        r.setLongitude(v.getLongitude() != null ? v.getLongitude().doubleValue() : null);
        r.setSeats(v.getSeats());
        r.setDoors(v.getDoors());
        r.setHorsepower(v.getHorsepower());
        r.setTransmission(v.getTransmission() != null ? v.getTransmission().name().toLowerCase() : null);
        r.setFuelType(v.getFuelType() != null ? v.getFuelType().name().toLowerCase() : null);
        r.setColor(v.getColor());
        r.setLicensePlate(v.getLicensePlate());
        r.setVin(v.getVin());
        r.setIsLocked(v.getIsLocked() != null ? v.getIsLocked() : true);
        r.setStatus(v.getStatus().name().toLowerCase());
        r.setApprovalStatus(v.getApprovalStatus() != null ? v.getApprovalStatus().name().toLowerCase() : null);
        r.setApprovalNote(v.getApprovalNote());
        r.setApprovedBy(v.getApprovedBy());
        r.setApprovedAt(v.getApprovedAt() != null ? v.getApprovedAt().toString() : null);
        r.setRating(v.getRating() != null ? v.getRating().doubleValue() : 0.0);
        r.setTotalReviews(v.getTotalReviews());
        r.setTotalBookings(v.getTotalBookings());
        r.setRangeKm(v.getRangeKm());
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

        // seatNumber & location
        r.setSeatNumber(v.getSeats());
        r.setLocation(v.getAddress() != null && !v.getAddress().isBlank() 
                      ? v.getAddress() + ", " + v.getCity() 
                      : v.getCity());

        // Discount and final price calculation
        BigDecimal discount = BigDecimal.ZERO;
        if (Boolean.TRUE.equals(v.getIsFeatured())) {
            discount = BigDecimal.valueOf(10); // 10% discount for featured
        }
        r.setDiscount(discount);
        BigDecimal price = v.getPricePerDay();
        BigDecimal finalPrice = price;
        if (discount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmt = price.multiply(discount).divide(BigDecimal.valueOf(100));
            finalPrice = price.subtract(discountAmt);
        }
        r.setFinalPrice(finalPrice);

        // Images mapping priority: vehicle_images table -> primary image -> gallery
        if (v.getImages() != null && !v.getImages().isEmpty()) {
            List<VehicleImage> sortedImages = v.getImages().stream()
                    .sorted(java.util.Comparator.comparing(VehicleImage::getIsPrimary, java.util.Comparator.reverseOrder())
                            .thenComparing(VehicleImage::getId))
                    .collect(Collectors.toList());
            List<String> imgUrls = sortedImages.stream()
                    .map(VehicleImage::getUrl)
                    .collect(Collectors.toList());
            r.setPrimaryImage(imgUrls.get(0));
            if (imgUrls.size() > 1) {
                r.setGalleryImages(imgUrls.subList(1, imgUrls.size()));
            } else {
                r.setGalleryImages(new ArrayList<>());
            }
            r.setVehicleImages(imgUrls);
            r.setThumbnailUrl(imgUrls.get(0));
        } else {
            // Fallback only if empty
            if (v.getThumbnailUrl() != null && !v.getThumbnailUrl().isBlank()) {
                r.setPrimaryImage(v.getThumbnailUrl());
                r.setGalleryImages(new ArrayList<>());
                r.setVehicleImages(List.of(v.getThumbnailUrl()));
                r.setThumbnailUrl(v.getThumbnailUrl());
            } else {
                r.setPrimaryImage("");
                r.setGalleryImages(new ArrayList<>());
                r.setVehicleImages(new ArrayList<>());
                r.setThumbnailUrl("");
            }
        }

        // Policies mapping based on vehicleType
        if (v.getVehicleType() == com.luxeway.enums.VehicleType.CAR) {
            r.setRequiredDocuments("GPLX hạng B1/B2 trở lên + CCCD hoặc Hộ chiếu (bản gốc/quét)");
            r.setBasicInsurance("Bảo hiểm bắt buộc trách nhiệm dân sự. Khách hàng tự chi trả tối đa 10,000,000đ/vụ cho bảo hiểm vật chất xe.");
            r.setExtraInsurance("Bảo hiểm vật chất xe nâng cao (Miễn thường tối đa 2,000,000đ/vụ, phí 15% giá thuê/ngày).");
            r.setCancellationPolicy("Miễn phí hủy chuyến trong vòng 1 giờ sau khi đặt. Trước 24h nhận xe, hoàn tiền 100%. Hủy chuyến muộn hơn phạt 1 ngày tiền thuê xe.");
            r.setDepositPolicy(v.getDeposit().compareTo(BigDecimal.ZERO) == 0 ? "Không cần đặt cọc" : "Đặt cọc tài sản trị giá " + v.getDeposit().longValue() + "đ hoặc tiền mặt khi nhận xe.");
            r.setRentalRules("Vui lòng giữ gìn xe sạch sẽ. Không hút thuốc trong xe. Không sử dụng xe vào mục đích vi phạm pháp luật. Trả xe đúng hẹn.");
        } else {
            r.setRequiredDocuments("GPLX hạng A1/A2 trở lên + CCCD hoặc Hộ chiếu (bản gốc/quét)");
            r.setBasicInsurance("Bảo hiểm bắt buộc trách nhiệm dân sự chủ xe cơ giới.");
            r.setExtraInsurance("Bảo hiểm tai nạn người ngồi trên xe.");
            r.setCancellationPolicy("Miễn phí hủy chuyến trong vòng 1 giờ sau khi đặt. Trước 24h nhận xe, hoàn tiền 100%. Hủy chuyến muộn hơn phạt 1 ngày tiền thuê xe.");
            r.setDepositPolicy(v.getDeposit().compareTo(BigDecimal.ZERO) == 0 ? "Không cần đặt cọc" : "Thế chấp xe máy trị giá " + v.getDeposit().longValue() + "đ hoặc đặt cọc tiền mặt tương đương.");
            r.setRentalRules("Chấp hành đúng luật giao thông đường bộ. Trả xe đúng giờ. Giữ gìn xe sạch sẽ.");
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

            // Detailed host statistics mapping (Mioto Style)
            ownerInfo.setOwnerId(o.getId());
            ownerInfo.setOwnerName(o.getDisplayName());
            ownerInfo.setApprovalBadge(o.getVerified());

            long totalTrips = bookingRepository.countByOwnerId(o.getId());
            ownerInfo.setTotalTrips((int) totalTrips);

            double responseRate = 100.0;
            int responseTime = 15;
            if (o.getOwnerProfile() != null && o.getOwnerProfile().getRating() != null) {
                com.luxeway.entity.OwnerRating ownerRating = o.getOwnerProfile().getRating();
                if (ownerRating.getResponseRate() != null) {
                    responseRate = ownerRating.getResponseRate().doubleValue();
                }
                if (ownerRating.getAvgResponseTimeMinutes() != null) {
                    responseTime = ownerRating.getAvgResponseTimeMinutes();
                }
            }
            ownerInfo.setResponseRate(responseRate);
            ownerInfo.setResponseTime(responseTime);

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

    @Transactional
    public boolean lockAvailability(String vehicleId, String userId, LocalDate start, LocalDate end) {
        log.info("Attempting to lock availability for vehicle: {}, user: {}, from {} to {}", vehicleId, userId, start, end);
        
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + vehicleId));
        
        if (bookingRepository.hasConflictingBooking(vehicleId, start, end)) {
            log.warn("Conflicting booking exists for vehicle: {} between {} and {}", vehicleId, start, end);
            return false;
        }
        
        List<VehicleAvailability> conflictingLocks = vehicleAvailabilityRepository.findConflictingLocks(
            vehicleId, start, end, LocalDateTime.now(), userId
        );
        if (!conflictingLocks.isEmpty()) {
            log.warn("Conflicting locks exist for vehicle: {} between {} and {}", vehicleId, start, end);
            return false;
        }
        
        LocalDateTime lockExpiry = LocalDateTime.now().plusMinutes(10);
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            final LocalDate currentDate = date;
            List<VehicleAvailability> existing = vehicleAvailabilityRepository.findByVehicleIdAndDateBetween(vehicleId, currentDate, currentDate);
            
            VehicleAvailability slot;
            if (!existing.isEmpty()) {
                slot = existing.get(0);
                slot.setIsAvailable(false);
                slot.setLockedUntil(lockExpiry);
                slot.setLockedBy(userId);
            } else {
                slot = VehicleAvailability.builder()
                        .vehicle(vehicle)
                        .date(currentDate)
                        .isAvailable(false)
                        .lockedUntil(lockExpiry)
                        .lockedBy(userId)
                        .build();
            }
            vehicleAvailabilityRepository.save(slot);
        }
        
        return true;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailabilityList(String vehicleId) {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusYears(1);
        
        List<VehicleAvailability> slots = vehicleAvailabilityRepository.findByVehicleIdAndDateBetween(vehicleId, start, end);
        List<Map<String, Object>> result = new ArrayList<>();
        
        Map<LocalDate, VehicleAvailability> slotMap = new HashMap<>();
        for (VehicleAvailability slot : slots) {
            slotMap.put(slot.getDate(), slot);
        }

        // Batch-load bookings to avoid N+1 query overhead inside the loop
        List<String> bookingIds = slots.stream()
                .map(VehicleAvailability::getBookingId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        Map<String, com.luxeway.entity.Booking> bookingMap = new HashMap<>();
        if (!bookingIds.isEmpty()) {
            bookingRepository.findAllById(bookingIds).forEach(b -> bookingMap.put(b.getId(), b));
        }
        
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            String dateStr = date.toString();
            String status = "AVAILABLE";
            
            VehicleAvailability slot = slotMap.get(date);
            if (slot != null && !slot.getIsAvailable()) {
                boolean isLocked = slot.getLockedUntil() != null && slot.getLockedUntil().isAfter(LocalDateTime.now());
                if (slot.getBookingId() != null) {
                    com.luxeway.entity.Booking booking = bookingMap.get(slot.getBookingId());
                    status = (booking != null && booking.getStatus() == com.luxeway.enums.BookingStatus.PENDING) 
                            ? "PENDING" : "BOOKED";
                } else if (isLocked) {
                    status = "PENDING";
                } else {
                    status = "MAINTENANCE";
                }
            }
            
            if (!"AVAILABLE".equals(status)) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("date", dateStr);
                entry.put("status", status);
                result.add(entry);
            }
        }
        return result;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public VehicleDTOs.VehicleLocationResponse toLocationResponse(Vehicle v) {
        String lang = "vi";
        VehicleDTOs.VehicleLocationResponse r = new VehicleDTOs.VehicleLocationResponse();
        r.setId(v.getId());
        
        String name = translationService.translateVehicle(v.getId(), lang, v.getName(), v.getDescription(), v.getCity(), v.getAddress(), "name");
        r.setName(name);
        r.setBrand(v.getBrand());
        r.setType(v.getVehicleType() != null ? v.getVehicleType().name() : null);
        
        // Thumbnail url mapping priority
        if (v.getImages() != null && !v.getImages().isEmpty()) {
            Optional<VehicleImage> primary = v.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst();
            if (primary.isPresent()) {
                r.setThumbnail(primary.get().getUrl());
            } else {
                r.setThumbnail(v.getImages().iterator().next().getUrl());
            }
        } else {
            r.setThumbnail(v.getThumbnailUrl());
        }
        
        r.setPricePerDay(v.getPricePerDay());
        
        BigDecimal discount = BigDecimal.ZERO;
        if (Boolean.TRUE.equals(v.getIsFeatured())) {
            discount = BigDecimal.valueOf(10);
        }
        r.setDiscount(discount);
        
        BigDecimal price = v.getPricePerDay();
        BigDecimal finalPrice = price;
        if (discount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmt = price.multiply(discount).divide(BigDecimal.valueOf(100));
            finalPrice = price.subtract(discountAmt);
        }
        r.setFinalPrice(finalPrice);
        
        r.setRating(v.getRating() != null ? v.getRating().doubleValue() : 5.0);
        r.setTotalTrips(v.getTotalBookings());
        
        r.setAddress(translationService.translateVehicle(v.getId(), lang, v.getName(), v.getDescription(), v.getCity(), v.getAddress(), "address"));
        r.setCity(translationService.translateVehicle(v.getId(), lang, v.getName(), v.getDescription(), v.getCity(), v.getAddress(), "city"));
        
        double[] coords = resolveMapCoordinates(v);
        r.setLatitude(coords[0]);
        r.setLongitude(coords[1]);
        r.setAvailable(v.getStatus() == com.luxeway.enums.VehicleStatus.AVAILABLE);
        r.setOwnerName(v.getOwner() != null ? v.getOwner().getDisplayName() : null);
        
        return r;
    }

    private double[] resolveMapCoordinates(Vehicle v) {
        if (v.getLatitude() != null && v.getLongitude() != null) {
            double lat = v.getLatitude().doubleValue();
            double lng = v.getLongitude().doubleValue();
            if (lat != 0 && lng != 0 && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                return new double[] { lat, lng };
            }
        }

        String text = String.join(" ",
                Optional.ofNullable(v.getCity()).orElse(""),
                Optional.ofNullable(v.getAddress()).orElse(""));
        String key = normalizeLocationKey(text);

        double[] base = new double[] { 10.7756, 106.7004 }; // District 1, Ho Chi Minh City
        if (key.contains("ha noi") || key.contains("hanoi")) {
            base = new double[] { 21.0285, 105.8542 };
        } else if (key.contains("da nang") || key.contains("danang")) {
            base = new double[] { 16.0544, 108.2022 };
        } else if (key.contains("nha trang")) {
            base = new double[] { 12.2451, 109.1943 };
        } else if (key.contains("da lat") || key.contains("dalat")) {
            base = new double[] { 11.9404, 108.4583 };
        } else if (key.contains("can tho")) {
            base = new double[] { 10.0371, 105.7882 };
        } else if (key.contains("hai phong")) {
            base = new double[] { 20.8449, 106.6881 };
        } else if (key.contains("hue")) {
            base = new double[] { 16.4637, 107.5909 };
        } else if (key.contains("thu duc")) {
            base = new double[] { 10.8501, 106.7712 };
        } else if (key.contains("quan 7") || key.contains("district 7")) {
            base = new double[] { 10.7323, 106.7176 };
        } else if (key.contains("phu quoc")) {
            base = new double[] { 10.2186, 103.9607 };
        } else if (key.contains("vung tau")) {
            base = new double[] { 10.3458, 107.0843 };
        }

        int hash = Math.abs(Optional.ofNullable(v.getId()).orElse(v.getName()).hashCode());
        double angle = Math.toRadians(hash % 360);
        double radius = 0.006 + (hash % 9) * 0.0018;
        double lat = base[0] + Math.sin(angle) * radius;
        double lng = base[1] + Math.cos(angle) * radius;
        return new double[] { lat, lng };
    }

    @Transactional(readOnly = true)
    public List<VehicleDTOs.VehicleLocationResponse> getVehiclesForMap(VehicleDTOs.VehicleFilterRequest filter) {
        // Query maximum 10000 vehicles
        Pageable pageable = PageRequest.of(0, 10000);

        String resolvedLocation = resolveLocation(filter.getLocation());

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
            try {
                categoryList = List.of(VehicleCategory.valueOf(filter.getCategory().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }

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
            filter.getKeyword(),
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
            filter.getMinLatitude(),
            filter.getMaxLatitude(),
            filter.getMinLongitude(),
            filter.getMaxLongitude(),
            filter.getStartDate(),
            filter.getEndDate(),
            pageable
        );

        List<Vehicle> list = page.getContent();

        // Keyword filter in Java
        if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
            String kw = filter.getKeyword().toLowerCase().trim();
            list = list.stream()
                .filter(v -> (v.getName() != null && v.getName().toLowerCase().contains(kw)) ||
                             (v.getBrand() != null && v.getBrand().toLowerCase().contains(kw)) ||
                             (v.getModel() != null && v.getModel().toLowerCase().contains(kw)))
                .collect(Collectors.toList());
        }

        // Map responses
        return list.stream().map(v -> {
            VehicleDTOs.VehicleLocationResponse r = toLocationResponse(v);
            if (filter.getUserLat() != null && filter.getUserLng() != null && v.getLatitude() != null && v.getLongitude() != null) {
                r.setDistanceKm(calculateHaversineDistance(filter.getUserLat(), filter.getUserLng(), v.getLatitude().doubleValue(), v.getLongitude().doubleValue()));
            }
            return r;
        }).collect(Collectors.toList());
    }
}
