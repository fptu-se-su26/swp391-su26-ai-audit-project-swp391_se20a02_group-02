package com.luxeway.service;

import com.luxeway.entity.*;
import com.luxeway.enums.*;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("all")
public class SeedingService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final CarBrandRepository carBrandRepository;
    private final CarModelRepository carModelRepository;
    private final CarRepository carRepository;

    private final MotorbikeBrandRepository motorbikeBrandRepository;
    private final MotorbikeModelRepository motorbikeModelRepository;
    private final MotorbikeRepository motorbikeRepository;

    // Unified vehicles table — used by all public APIs
    private final VehicleRepository vehicleRepository;

    private static final String[] CITIES = {"Ho Chi Minh", "Ha Noi", "Da Nang", "Nha Trang", "Da Lat", "Hue"};
    private static final String[] CITIES_VI = {"Ho Chi Minh City", "Hanoi", "Da Nang", "Nha Trang", "Da Lat", "Hue"};
    
    @Transactional
    public void seedAll() {
        log.info("Starting enterprise data seeding...");
        User owner = getOrCreateDefaultOwner();

        // 1. Seed Cars (120+ records) into legacy cars table
        if (carRepository.count() < 120) {
            log.info("Seeding 120+ real Vietnam market cars...");
            seedCars(owner);
        } else {
            log.info("Car repository already has {} records, skipping seeding.", carRepository.count());
        }

        // 2. Seed Motorbikes (80+ records) into legacy motorbikes table
        if (motorbikeRepository.count() < 80) {
            log.info("Seeding 80+ real Vietnam market motorbikes...");
            seedMotorbikes(owner);
        } else {
            log.info("Motorbike repository already has {} records, skipping seeding.", motorbikeRepository.count());
        }

        // 3. Seed unified vehicles table — required for all public APIs (HomeService, VehicleService)
        seedVehicles(owner);

        // 4. Fix any existing vehicles in DB that still have Unsplash/HTTP placeholder images
        updateMockImagesOfExistingVehicles();

        log.info("Enterprise database seeding completed successfully.");
    }

    /**
     * Seeds the unified `vehicles` table which is used by:
     * - HomeService (landing page stats, trending, categories, destinations)
     * - VehicleService (marketplace browse, search, filter)
     * - VehicleRepository (all public queries)
     *
     * Data includes both cars and motorbikes with status=AVAILABLE and approvalStatus=APPROVED
     * so they appear on the public listing immediately.
     */
    @Transactional
    public void seedVehicles(User owner) {
        // Ensure all existing vehicles are approved and available so they are visible on the UI
        try {
            log.info("Ensuring all existing vehicles are approved and available...");
            List<Vehicle> allVehicles = vehicleRepository.findAll();
            boolean updated = false;
            for (Vehicle v : allVehicles) {
                boolean needsSave = false;
                
                // Fix pricePerDay if invalid (must be positive)
                if (v.getPricePerDay() == null || v.getPricePerDay().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                    v.setPricePerDay(new java.math.BigDecimal("1000000")); // 1M VND default
                    needsSave = true;
                }
                
                // Fix deposit if invalid (must be positive)
                if (v.getDeposit() == null || v.getDeposit().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                    v.setDeposit(v.getPricePerDay().multiply(new java.math.BigDecimal("3"))); // 3x pricePerDay
                    needsSave = true;
                }
                
                // Fix status and approval
                if (v.getStatus() != VehicleStatus.AVAILABLE || v.getApprovalStatus() != VehicleStatus.APPROVED) {
                    v.setStatus(VehicleStatus.AVAILABLE);
                    v.setApprovalStatus(VehicleStatus.APPROVED);
                    needsSave = true;
                }
                
                if (needsSave) {
                    vehicleRepository.save(v);
                    updated = true;
                }
            }
            if (updated) {
                log.info("Successfully approved and activated all existing vehicles.");
            }
        } catch (Exception e) {
            log.error("Failed to update existing vehicles status: {}", e.getMessage());
        }

        // Always ensure the 4 popular landing page vehicles exist in the database
        seedFeaturedVehicles(owner);

        long existing = vehicleRepository.count();
        if (existing >= 100) {
            log.info("Unified vehicles table already has {} records, skipping vehicle seeding.", existing);
            return;
        }
        log.info("Seeding unified vehicles table (current count: {})...", existing);

        // ====== CAR IMAGES (Unsplash photos per brand) ======
        Map<String, String> carThumbnails = new HashMap<>();
        carThumbnails.put("Toyota",        "https://images.unsplash.com/photo-1621007947382-cc34aa864ee3?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("Mazda",         "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("Mercedes-Benz", "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("VinFast",       "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("BMW",           "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("Audi",          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("Porsche",       "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("Hyundai",       "https://images.unsplash.com/photo-1567818735868-e71b99932e29?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("Honda",         "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("Kia",           "https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("Ford",          "https://images.unsplash.com/photo-1533513780-f38b4d4f0f00?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("Mitsubishi",    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("Lexus",         "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("Nissan",        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=800&auto=format&fit=crop");
        carThumbnails.put("DEFAULT_CAR",   "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop");

        // ====== CAR DATA (brand → models) ======
        // Format: modelName:CategoryEnum:minPrice:maxPrice:seats
        Map<String, String[]> carData = new LinkedHashMap<>();
        carData.put("Toyota",        new String[]{"Vios:ECONOMY:500000:800000:5", "Camry:SEDAN:1200000:1800000:5", "Fortuner:SUV:1200000:1800000:7", "Innova:FAMILY:800000:1200000:7"});
        carData.put("Mazda",         new String[]{"Mazda 3:SEDAN:700000:900000:5", "CX-5:SUV:1000000:1300000:5", "CX-8:SUV:1300000:1700000:7"});
        carData.put("Mercedes-Benz", new String[]{"C200:BUSINESS:2200000:2800000:5", "E300:BUSINESS:3500000:4500000:5", "GLC300:BUSINESS:3000000:4000000:5"});
        carData.put("VinFast",       new String[]{"Fadil:ECONOMY:450000:600000:5", "VF8:ELECTRIC:1500000:2000000:5", "VF9:ELECTRIC:2200000:3000000:7"});
        carData.put("BMW",           new String[]{"320i:BUSINESS:1800000:2400000:5", "520i:BUSINESS:2500000:3200000:5", "X5:SUV:3500000:4500000:7"});
        carData.put("Audi",          new String[]{"A4:BUSINESS:1800000:2300000:5", "Q5:SUV:2500000:3200000:5"});
        carData.put("Porsche",       new String[]{"Macan:BUSINESS:4500000:6000000:5", "Cayenne:BUSINESS:6000000:8500000:5"});
        carData.put("Hyundai",       new String[]{"Accent:ECONOMY:500000:700000:5", "Tucson:SUV:900000:1200000:5", "Santa Fe:SUV:1200000:1700000:7"});
        carData.put("Honda",         new String[]{"City:SEDAN:500000:700000:5", "CR-V:SUV:1100000:1500000:7"});
        carData.put("Kia",           new String[]{"Morning:ECONOMY:400000:550000:5", "Sorento:SUV:1100000:1500000:7", "Carnival:FAMILY:1800000:2500000:7"});
        carData.put("Ford",          new String[]{"Ranger:ECONOMY:900000:1300000:5", "Everest:SUV:1200000:1800000:7"});
        carData.put("Mitsubishi",    new String[]{"Xpander:FAMILY:700000:950000:7", "Outlander:SUV:1000000:1300000:7"});
        carData.put("Lexus",         new String[]{"ES250:BUSINESS:2500000:3200000:5", "RX350:BUSINESS:4000000:5500000:5"});
        carData.put("Nissan",        new String[]{"Almera:ECONOMY:500000:700000:5", "Navara:ECONOMY:850000:1200000:5"});

        // ====== MOTORBIKE DATA ======
        Map<String, String[]> motoData = new LinkedHashMap<>();
        motoData.put("Honda",  new String[]{"Vision:SCOOTER:120000:150000:110", "Air Blade:SCOOTER:150000:200000:125", "SH 150i:SCOOTER:350000:500000:150", "Winner X:MANUAL_MOTORCYCLE:150000:180000:150"});
        motoData.put("Yamaha", new String[]{"Sirius:MANUAL_MOTORCYCLE:100000:130000:110", "Exciter 155:MANUAL_MOTORCYCLE:160000:200000:155", "Grande:SCOOTER:150000:180000:125", "NVX 155:SCOOTER:180000:220000:155"});
        motoData.put("Vespa",  new String[]{"Sprint:SCOOTER:300000:400000:125", "Primavera:SCOOTER:280000:350000:125"});
        motoData.put("Kawasaki", new String[]{"Ninja 400:SPORT_BIKE:800000:1100000:399", "Z400:SPORT_BIKE:750000:1000000:399"});
        motoData.put("KTM",    new String[]{"Duke 390:SPORT_BIKE:800000:1100000:373", "Adventure 390:ADVENTURE_BIKE:900000:1200000:373"});
        motoData.put("BMW Motorrad", new String[]{"G310GS:ADVENTURE_BIKE:900000:1200000:313"});
        motoData.put("Royal Enfield", new String[]{"Classic 350:CLASSIC_BIKE:700000:900000:349", "Himalayan:ADVENTURE_BIKE:800000:1000000:411"});
        motoData.put("SYM",   new String[]{"Attila:SCOOTER:110000:140000:125"});

        int idx = 0;

        // Seed cars into vehicles table
        for (Map.Entry<String, String[]> entry : carData.entrySet()) {
            String brandName = entry.getKey();
            for (String modelStr : entry.getValue()) {
                String[] parts = modelStr.split(":");
                String modelName = parts[0];
                String thumbnail = getCarRealImage(brandName, modelName);
                VehicleCategory cat;
                try { cat = VehicleCategory.valueOf(parts[1]); } catch (Exception e) { cat = VehicleCategory.ECONOMY; }
                long minP = Long.parseLong(parts[2]);
                long maxP = Long.parseLong(parts[3]);
                int seats = Integer.parseInt(parts[4]);

                String city = CITIES_VI[idx % CITIES_VI.length];
                BigDecimal price = new BigDecimal(minP + (idx % 3) * (maxP - minP) / 2);
                BigDecimal deposit = price.multiply(new BigDecimal("3"));
                String plate = "51A-V" + String.format("%04d", idx + 1000);

                // Skip if license plate already exists
                if (vehicleRepository.existsByLicensePlate(plate)) { idx++; continue; }

                Vehicle v = Vehicle.builder()
                    .owner(owner)
                    .name(brandName + " " + modelName)
                    .brand(brandName)
                    .model(modelName)
                    .year(2019 + (idx % 6))
                    .category(cat)
                    .vehicleType(VehicleType.CAR)
                    .description(brandName + " " + modelName + " - Premium vehicle, excellent condition, ready for rent.")
                    .pricePerDay(price)
                    .deposit(deposit)
                    .city(city)
                    .country("Vietnam")
                    .address(getRealAddress(city, idx))
                    .latitude(getRealLatitude(city, idx))
                    .longitude(getRealLongitude(city, idx))
                    .seats(seats)
                    .doors(seats == 2 ? 2 : 4)
                    .transmission(idx % 2 == 0 ? TransmissionType.AUTOMATIC : TransmissionType.MANUAL)
                    .fuelType(cat == VehicleCategory.ELECTRIC ? FuelType.ELECTRIC : (idx % 4 == 0 ? FuelType.DIESEL : FuelType.GASOLINE))
                    .licensePlate(plate)
                    .thumbnailUrl(thumbnail)
                    .status(VehicleStatus.AVAILABLE)
                    .approvalStatus(VehicleStatus.APPROVED)
                    .isVerified(true)
                    .isFeatured(idx % 8 == 0)
                    .instantBook(idx % 3 == 0)
                    .deliveryAvailable(idx % 4 == 0)
                    .deliveryFee(idx % 4 == 0 ? new BigDecimal("50000") : BigDecimal.ZERO)
                    .rating(new BigDecimal(4.0 + (idx % 11) * 0.09).setScale(2, java.math.RoundingMode.HALF_UP))
                    .totalReviews(idx % 20)
                    .totalBookings(idx % 30 + 5)
                    .hasChauffeur(idx % 7 == 0)
                    .airportDelivery(idx % 5 == 0)
                    .weddingRental(idx % 9 == 0)
                    .businessRental(idx % 6 == 0)
                    .build();

                vehicleRepository.save(v);
                idx++;
            }
        }

        // Seed motorbikes into vehicles table
        for (Map.Entry<String, String[]> entry : motoData.entrySet()) {
            String brandName = entry.getKey();
            for (String modelStr : entry.getValue()) {
                String[] parts = modelStr.split(":");
                String modelName = parts[0];
                VehicleCategory cat;
                try { cat = VehicleCategory.valueOf(parts[1]); } catch (Exception e) { cat = VehicleCategory.SCOOTER; }
                long minP = Long.parseLong(parts[2]);
                long maxP = Long.parseLong(parts[3]);
                int engineCc = Integer.parseInt(parts[4]);

                String city = CITIES_VI[idx % CITIES_VI.length];
                BigDecimal price = new BigDecimal(minP + (idx % 3) * (maxP - minP) / 2);
                BigDecimal deposit = price.multiply(new BigDecimal("2"));
                String plate = "29H1-M" + String.format("%04d", idx + 2000);

                if (vehicleRepository.existsByLicensePlate(plate)) { idx++; continue; }

                boolean isScooter = cat == VehicleCategory.SCOOTER || cat == VehicleCategory.AUTOMATIC_SCOOTER;

                Vehicle v = Vehicle.builder()
                    .owner(owner)
                    .name(brandName + " " + modelName)
                    .brand(brandName)
                    .model(modelName)
                    .year(2019 + (idx % 6))
                    .category(cat)
                    .vehicleType(VehicleType.MOTORBIKE)
                    .description(brandName + " " + modelName + " - High quality motorbike, fully inspected.")
                    .pricePerDay(price)
                    .deposit(deposit)
                    .city(city)
                    .country("Vietnam")
                    .address(getRealAddress(city, idx))
                    .latitude(getRealLatitude(city, idx))
                    .longitude(getRealLongitude(city, idx))
                    .seats(2)
                    .doors(0)
                    .transmission(isScooter ? TransmissionType.AUTOMATIC : TransmissionType.MANUAL)
                    .fuelType(cat == VehicleCategory.ELECTRIC_BIKE ? FuelType.ELECTRIC : FuelType.GASOLINE)
                    .engineCc(engineCc)
                    .licensePlate(plate)
                    .thumbnailUrl(getMotoRealImage(brandName, modelName))
                    .status(VehicleStatus.AVAILABLE)
                    .approvalStatus(VehicleStatus.APPROVED)
                    .isVerified(true)
                    .isFeatured(idx % 8 == 0)
                    .instantBook(idx % 4 == 0)
                    .deliveryAvailable(idx % 3 == 0)
                    .deliveryFee(idx % 3 == 0 ? new BigDecimal("30000") : BigDecimal.ZERO)
                    .rating(new BigDecimal(4.2 + (idx % 9) * 0.09).setScale(2, java.math.RoundingMode.HALF_UP))
                    .totalReviews(idx % 15)
                    .totalBookings(idx % 22 + 2)
                    .hasHelmet(true)
                    .hasPhoneHolder(idx % 2 == 0)
                    .hasRaincoat(idx % 3 == 0)
                    .hasTouringPackage(idx % 5 == 0)
                    .build();

                vehicleRepository.save(v);
                idx++;
            }
        }

        log.info("Unified vehicles table seeded with {} vehicles (cars + motorbikes).", vehicleRepository.count());
    }

    private void seedFeaturedVehicles(User owner) {
        log.info("Checking and seeding 4 landing page featured vehicles...");
        
        // 1. Toyota Camry 2.5Q
        if (!vehicleRepository.existsByLicensePlate("51K-999.99")) {
            Vehicle v = Vehicle.builder()
                .id("featured-car-camry-2.5q")
                .owner(owner)
                .name("Toyota Camry 2.5Q")
                .brand("Toyota")
                .model("Camry 2.5Q")
                .year(2024)
                .category(VehicleCategory.LUXURY)
                .vehicleType(VehicleType.CAR)
                .description("Toyota Camry 2.5Q đẳng cấp doanh nhân, nội thất da cao cấp, trang bị cửa sổ trời, hỗ trợ giao xe tận nơi nội thành TP.HCM.")
                .pricePerDay(new BigDecimal("1800000"))
                .deposit(new BigDecimal("5400000"))
                .city("Ho Chi Minh City")
                .country("Vietnam")
                .address("120 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh")
                .latitude(new BigDecimal("10.7719"))
                .longitude(new BigDecimal("106.6975"))
                .seats(5)
                .doors(4)
                .transmission(TransmissionType.AUTOMATIC)
                .fuelType(FuelType.GASOLINE)
                .licensePlate("51K-999.99")
                .thumbnailUrl("/images/cars/caramy_2.5Q.avif")
                .status(VehicleStatus.AVAILABLE)
                .approvalStatus(VehicleStatus.APPROVED)
                .isVerified(true)
                .isFeatured(true)
                .instantBook(true)
                .deliveryAvailable(true)
                .deliveryFee(new BigDecimal("50000"))
                .rating(new BigDecimal("4.9"))
                .totalReviews(24)
                .totalBookings(45)
                .hasChauffeur(true)
                .airportDelivery(true)
                .businessRental(true)
                .isLocked(false)
                .build();
            vehicleRepository.save(v);
            log.info("Seeded featured vehicle: Toyota Camry 2.5Q");
        }

        // 2. Hyundai Santa Fe 2024
        if (!vehicleRepository.existsByLicensePlate("30K-888.88")) {
            Vehicle v = Vehicle.builder()
                .id("featured-car-santa-fe-2024")
                .owner(owner)
                .name("Hyundai Santa Fe 2024")
                .brand("Hyundai")
                .model("Santa Fe 2024")
                .year(2024)
                .category(VehicleCategory.SUV)
                .vehicleType(VehicleType.CAR)
                .description("Hyundai Santa Fe 2024 SUV 7 chỗ thế hệ mới thiết kế vuông vức cơ bắp, động cơ dầu êm ái, thích hợp đi gia đình dã ngoại.")
                .pricePerDay(new BigDecimal("1500000"))
                .deposit(new BigDecimal("4500000"))
                .city("Hanoi")
                .country("Vietnam")
                .address("36 Hoàng Diệu, Điện Biên, Ba Đình, Hà Nội")
                .latitude(new BigDecimal("21.0336"))
                .longitude(new BigDecimal("105.8398"))
                .seats(7)
                .doors(4)
                .transmission(TransmissionType.AUTOMATIC)
                .fuelType(FuelType.DIESEL)
                .licensePlate("30K-888.88")
                .thumbnailUrl("/images/cars/santa-fe2024.jpg")
                .status(VehicleStatus.AVAILABLE)
                .approvalStatus(VehicleStatus.APPROVED)
                .isVerified(true)
                .isFeatured(true)
                .instantBook(true)
                .deliveryAvailable(true)
                .deliveryFee(new BigDecimal("50000"))
                .rating(new BigDecimal("4.8"))
                .totalReviews(18)
                .totalBookings(35)
                .hasChauffeur(false)
                .airportDelivery(true)
                .weddingRental(true)
                .isLocked(false)
                .build();
            vehicleRepository.save(v);
            log.info("Seeded featured vehicle: Hyundai Santa Fe 2024");
        }

        // 3. VinFast VF8 Plus
        if (!vehicleRepository.existsByLicensePlate("43A-777.77")) {
            Vehicle v = Vehicle.builder()
                .id("featured-car-vf8-plus")
                .owner(owner)
                .name("VinFast VF8 Plus")
                .brand("VinFast")
                .model("VF8 Plus")
                .year(2024)
                .category(VehicleCategory.ELECTRIC_CAR)
                .vehicleType(VehicleType.CAR)
                .description("VinFast VF8 Plus SUV điện thông minh, vận hành êm ái mạnh mẽ, hệ thống an toàn ADAS tân tiến, đầy đủ các tính năng trợ lý ảo thông minh.")
                .pricePerDay(new BigDecimal("1600000"))
                .deposit(new BigDecimal("4800000"))
                .city("Da Nang")
                .country("Vietnam")
                .address("150 Bạch Đằng, Hải Châu 1, Hải Châu, Đà Nẵng")
                .latitude(new BigDecimal("16.0678"))
                .longitude(new BigDecimal("108.2235"))
                .seats(5)
                .doors(4)
                .transmission(TransmissionType.AUTOMATIC)
                .fuelType(FuelType.ELECTRIC)
                .licensePlate("43A-777.77")
                .thumbnailUrl("/images/cars/vf8_plus.jpg")
                .status(VehicleStatus.AVAILABLE)
                .approvalStatus(VehicleStatus.APPROVED)
                .isVerified(true)
                .isFeatured(true)
                .instantBook(true)
                .deliveryAvailable(true)
                .deliveryFee(new BigDecimal("60000"))
                .rating(new BigDecimal("4.7"))
                .totalReviews(15)
                .totalBookings(28)
                .hasChauffeur(false)
                .airportDelivery(true)
                .isLocked(false)
                .build();
            vehicleRepository.save(v);
            log.info("Seeded featured vehicle: VinFast VF8 Plus");
        }

        // 4. Mazda CX-5 Premium
        if (!vehicleRepository.existsByLicensePlate("79A-666.66")) {
            Vehicle v = Vehicle.builder()
                .id("featured-car-cx-5-premium")
                .owner(owner)
                .name("Mazda CX-5 Premium")
                .brand("Mazda")
                .model("CX-5 Premium")
                .year(2024)
                .category(VehicleCategory.SUV)
                .vehicleType(VehicleType.CAR)
                .description("Mazda CX-5 Premium màu trắng ngọc trai cuốn hút, trang bị gói an toàn i-Activesense cao cấp nhất, loa Bose nghe nhạc cực chất.")
                .pricePerDay(new BigDecimal("1200000"))
                .deposit(new BigDecimal("3600000"))
                .city("Nha Trang")
                .country("Vietnam")
                .address("46 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa")
                .latitude(new BigDecimal("12.2422"))
                .longitude(new BigDecimal("109.1963"))
                .seats(5)
                .doors(4)
                .transmission(TransmissionType.AUTOMATIC)
                .fuelType(FuelType.GASOLINE)
                .licensePlate("79A-666.66")
                .thumbnailUrl("/images/cars/2025-Mazda-CX-5_premium.avif")
                .status(VehicleStatus.AVAILABLE)
                .approvalStatus(VehicleStatus.APPROVED)
                .isVerified(true)
                .isFeatured(true)
                .instantBook(true)
                .deliveryAvailable(true)
                .deliveryFee(new BigDecimal("40000"))
                .rating(new BigDecimal("4.8"))
                .totalReviews(22)
                .totalBookings(52)
                .hasChauffeur(false)
                .airportDelivery(true)
                .isLocked(false)
                .build();
            vehicleRepository.save(v);
            log.info("Seeded featured vehicle: Mazda CX-5 Premium");
        }

        // 5. Honda SH350i
        if (!vehicleRepository.existsByLicensePlate("59-T1 999.99")) {
            Vehicle v = Vehicle.builder()
                .id("featured-moto-sh350i")
                .owner(owner)
                .name("Honda SH350i")
                .brand("Honda")
                .model("SH350i")
                .year(2024)
                .category(VehicleCategory.SCOOTER)
                .vehicleType(VehicleType.MOTORBIKE)
                .description("Honda SH350i thời thượng, phân khối lớn mạnh mẽ, vận hành êm ái, xe mới đi giữ gìn sạch sẽ.")
                .pricePerDay(new BigDecimal("650000"))
                .deposit(new BigDecimal("1300000"))
                .city("Ho Chi Minh City")
                .country("Vietnam")
                .address("789 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh")
                .latitude(new BigDecimal("10.7589"))
                .longitude(new BigDecimal("106.6789"))
                .seats(2)
                .doors(0)
                .transmission(TransmissionType.AUTOMATIC)
                .fuelType(FuelType.GASOLINE)
                .licensePlate("59-T1 999.99")
                .thumbnailUrl("/images/motorbikes/Sh350_i.webp")
                .status(VehicleStatus.AVAILABLE)
                .approvalStatus(VehicleStatus.APPROVED)
                .isVerified(true)
                .isFeatured(true)
                .instantBook(true)
                .deliveryAvailable(true)
                .deliveryFee(new BigDecimal("30000"))
                .rating(new BigDecimal("4.9"))
                .totalReviews(14)
                .totalBookings(38)
                .hasHelmet(true)
                .hasPhoneHolder(true)
                .hasRaincoat(true)
                .engineCc(350)
                .isLocked(false)
                .build();
            vehicleRepository.save(v);
            log.info("Seeded featured motorbike: Honda SH350i");
        }

        // 6. Yamaha Exciter 155
        if (!vehicleRepository.existsByLicensePlate("29-H1 888.88")) {
            Vehicle v = Vehicle.builder()
                .id("featured-moto-exciter-155")
                .owner(owner)
                .name("Yamaha Exciter 155")
                .brand("Yamaha")
                .model("Exciter 155")
                .year(2024)
                .category(VehicleCategory.MANUAL_MOTORCYCLE)
                .vehicleType(VehicleType.MOTORBIKE)
                .description("Yamaha Exciter 155 VVA côn tay thể thao, bốc, lướt êm, thích hợp cho các bạn trẻ đam mê xê dịch.")
                .pricePerDay(new BigDecimal("280000"))
                .deposit(new BigDecimal("560000"))
                .city("Hanoi")
                .country("Vietnam")
                .address("101 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội")
                .latitude(new BigDecimal("21.0225"))
                .longitude(new BigDecimal("105.8424"))
                .seats(2)
                .doors(0)
                .transmission(TransmissionType.MANUAL)
                .fuelType(FuelType.GASOLINE)
                .licensePlate("29-H1 888.88")
                .thumbnailUrl("/images/motorbikes/exciter_155.jpg")
                .status(VehicleStatus.AVAILABLE)
                .approvalStatus(VehicleStatus.APPROVED)
                .isVerified(true)
                .isFeatured(true)
                .instantBook(true)
                .deliveryAvailable(true)
                .deliveryFee(new BigDecimal("20000"))
                .rating(new BigDecimal("4.8"))
                .totalReviews(19)
                .totalBookings(42)
                .hasHelmet(true)
                .hasPhoneHolder(true)
                .hasRaincoat(true)
                .engineCc(155)
                .isLocked(false)
                .build();
            vehicleRepository.save(v);
            log.info("Seeded featured motorbike: Yamaha Exciter 155");
        }

        // 7. Honda Winner X
        if (!vehicleRepository.existsByLicensePlate("43-D1 777.77")) {
            Vehicle v = Vehicle.builder()
                .id("featured-moto-winner-x")
                .owner(owner)
                .name("Honda Winner X")
                .brand("Honda")
                .model("Winner X")
                .year(2024)
                .category(VehicleCategory.MANUAL_MOTORCYCLE)
                .vehicleType(VehicleType.MOTORBIKE)
                .description("Honda Winner X côn tay thể thao năng động, phanh ABS an toàn, xe chạy cực bốc và tiết kiệm xăng.")
                .pricePerDay(new BigDecimal("250000"))
                .deposit(new BigDecimal("500000"))
                .city("Da Nang")
                .country("Vietnam")
                .address("200 Nguyễn Văn Linh, Thạc Gián, Thanh Khê, Đà Nẵng")
                .latitude(new BigDecimal("16.0592"))
                .longitude(new BigDecimal("108.2096"))
                .seats(2)
                .doors(0)
                .transmission(TransmissionType.MANUAL)
                .fuelType(FuelType.GASOLINE)
                .licensePlate("43-D1 777.77")
                .thumbnailUrl("/images/motorbikes/winner_x.jpg")
                .status(VehicleStatus.AVAILABLE)
                .approvalStatus(VehicleStatus.APPROVED)
                .isVerified(true)
                .isFeatured(true)
                .instantBook(true)
                .deliveryAvailable(true)
                .deliveryFee(new BigDecimal("20000"))
                .rating(new BigDecimal("4.7"))
                .totalReviews(11)
                .totalBookings(31)
                .hasHelmet(true)
                .hasPhoneHolder(true)
                .hasRaincoat(true)
                .engineCc(150)
                .isLocked(false)
                .build();
            vehicleRepository.save(v);
            log.info("Seeded featured motorbike: Honda Winner X");
        }

        // 8. VinFast Klara S
        if (!vehicleRepository.existsByLicensePlate("49-MD1 666.66")) {
            Vehicle v = Vehicle.builder()
                .id("featured-moto-klara-s")
                .owner(owner)
                .name("VinFast Klara S")
                .brand("VinFast")
                .model("Klara S")
                .year(2024)
                .category(VehicleCategory.ELECTRIC_BIKE)
                .vehicleType(VehicleType.MOTORBIKE)
                .description("VinFast Klara S xe máy điện thời trang, di chuyển êm ái, yên tĩnh, thích hợp dạo quanh phố núi Đà Lạt mộng mơ.")
                .pricePerDay(new BigDecimal("180000"))
                .deposit(new BigDecimal("360000"))
                .city("Da Lạt")
                .country("Vietnam")
                .address("1 Phù Đổng Thiên Vương, Phường 8, Đà Lạt, Lâm Đồng")
                .latitude(new BigDecimal("11.9566"))
                .longitude(new BigDecimal("108.4444"))
                .seats(2)
                .doors(0)
                .transmission(TransmissionType.AUTOMATIC)
                .fuelType(FuelType.ELECTRIC)
                .licensePlate("49-MD1 666.66")
                .thumbnailUrl("/images/motorbikes/kalara_s.jpg")
                .status(VehicleStatus.AVAILABLE)
                .approvalStatus(VehicleStatus.APPROVED)
                .isVerified(true)
                .isFeatured(true)
                .instantBook(true)
                .deliveryAvailable(true)
                .deliveryFee(new BigDecimal("15000"))
                .rating(new BigDecimal("4.6"))
                .totalReviews(8)
                .totalBookings(15)
                .hasHelmet(true)
                .hasPhoneHolder(true)
                .hasRaincoat(true)
                .engineCc(0)
                .isLocked(false)
                .build();
            vehicleRepository.save(v);
            log.info("Seeded featured motorbike: VinFast Klara S");
        }
    }

    private String getCarRealImage(String brand, String model) {
        String b = brand.toLowerCase();
        String m = model.toLowerCase();
        if (b.contains("toyota")) {
            if (m.contains("vios")) return "/images/cars/toyota_vios.jpg";
            if (m.contains("fortuner")) return "/images/cars/toyota_forluner.jpg";
            if (m.contains("innova")) return "/images/cars/toyota_innova.jpg";
            if (m.contains("camry")) return "/images/cars/caramy_2.5Q.avif";
        }
        if (b.contains("mazda")) {
            if (m.contains("3")) return "/images/cars/Mazda_mazda3.jpg";
            if (m.contains("cx-5")) return "/images/cars/Mazda_cx5.jpg";
            if (m.contains("cx-8")) return "/images/cars/Madaz _CX8.jpg";
        }
        if (b.contains("mercedes")) {
            if (m.contains("c200")) return "/images/cars/mereedes_benz_c200.jpg";
            if (m.contains("e300")) return "/images/cars/Mereedes_benz_e300.jpg";
            if (m.contains("glc")) return "/images/cars/mereedes_benz_glc300.jpg";
        }
        if (b.contains("vinfast")) {
            if (m.contains("fadil")) return "/images/cars/vinfast_fadil.jpg";
            if (m.contains("vf8")) return "/images/cars/vinfast_v8.jpg";
            if (m.contains("vf9")) return "/images/cars/vinfast_v9.jpg";
        }
        if (b.contains("bmw")) {
            if (m.contains("320i")) return "/images/cars/BMW_320i.jpg";
            if (m.contains("520i")) return "/images/cars/BMW_520i.jpg";
            if (m.contains("x5")) return "/images/cars/BMW_X5.jpg";
        }
        if (b.contains("audi")) {
            if (m.contains("a4") || m.contains("q4")) return "/images/cars/audi_Q4.jpg";
            if (m.contains("q5")) return "/images/cars/audi_Q5.jpg";
        }
        if (b.contains("porsche")) {
            if (m.contains("macan")) return "/images/cars/porsche_macan.jpg";
            if (m.contains("cayenne")) return "/images/cars/porsche_cayenne.jpg";
        }
        if (b.contains("hyundai")) {
            if (m.contains("tucson")) return "/images/cars/hyundai_tuscon.jpg";
            if (m.contains("santa fe")) return "/images/cars/hyundai_santa_fe.jpg";
            if (m.contains("accent")) return "/images/cars/Hyundai-Aceent.jpg";
        }
        if (b.contains("honda")) {
            if (m.contains("city")) return "/images/cars/honda_city.jpg";
            if (m.contains("cr-v") || m.contains("crv")) return "/images/cars/Honda_CrV.jpg";
        }
        if (b.contains("kia")) {
            if (m.contains("morning")) return "/images/cars/kia_morning.jpg";
            if (m.contains("sorento")) return "/images/cars/kia_sorento.jpg";
            if (m.contains("carnival")) return "/images/cars/kia_carnival.jpg";
        }
        if (b.contains("ford")) {
            if (m.contains("ranger")) return "/images/cars/ford_ranger.jpg";
            if (m.contains("everest")) return "/images/cars/ford_everest.jpg";
        }
        if (b.contains("lexus")) {
            if (m.contains("es250") || m.contains("es")) return "/images/cars/Lexus_es250.jpg";
            if (m.contains("rx350") || m.contains("rx")) return "/images/cars/Lexus_Rx350.jpg";
        }
        if (b.contains("mitsubishi")) {
            if (m.contains("xpander")) return "/images/cars/Mitsibishi_xpannder.jpg";
            if (m.contains("outlander")) return "/images/cars/mitsubishi_outlander.jpg";
        }
        if (b.contains("nissan")) {
            if (m.contains("almera")) return "/images/cars/Nissan_Almera.jpg";
            if (m.contains("navara")) return "/images/cars/Nissan_navara.jpg";
        }
        return "/images/cars/toyota_vios.jpg";
    }

    /**
     * Returns the real local image path for a motorbike.
     * Images are stored in /public/images/motorbikes/
     * File names correspond exactly to the image files added by the team.
     */
    private String getMotoRealImage(String brand, String model) {
        String b = (brand == null) ? "" : brand.toLowerCase();
        String m = (model == null) ? "" : model.toLowerCase();

        // Honda
        if (b.contains("honda")) {
            if (m.contains("sh 150") || m.contains("sh150")) return "/images/motorbikes/Honda_Sh_150i.jpg";
            if (m.contains("sh350") || m.contains("sh 350")) return "/images/motorbikes/Sh350_i.webp";
            if (m.contains("air blade") || m.contains("airblade")) return "/images/motorbikes/Honda_air_blade.jpg";
            if (m.contains("vision")) return "/images/motorbikes/Honda_vision.jpg";
            if (m.contains("winner")) return "/images/motorbikes/Honda_winer_X.jpg";
        }
        // Yamaha
        if (b.contains("yamaha")) {
            if (m.contains("exciter") || m.contains("eceiter")) return "/images/motorbikes/Yamaha_eceiter_155.jpg";
            if (m.contains("grande")) return "/images/motorbikes/Yamaha_Grande.jpg";
            if (m.contains("nvx")) return "/images/motorbikes/Yamaha_NVX_155.webp";
            if (m.contains("sirius")) return "/images/motorbikes/Yamaha_sirius.jpg";
        }
        // Kawasaki
        if (b.contains("kawasaki")) {
            if (m.contains("ninja")) return "/images/motorbikes/Kawaski_ninja_400.jpg";
            if (m.contains("z400") || m.contains("z 400")) return "/images/motorbikes/Kawasaki_Z400.jpg";
        }
        // KTM
        if (b.contains("ktm")) {
            if (m.contains("duke")) return "/images/motorbikes/KTM_Duke_390.jpg";
            if (m.contains("adventure")) return "/images/motorbikes/KTM_adventure_390.jpg";
        }
        // BMW Motorrad
        if (b.contains("bmw")) {
            return "/images/motorbikes/BMW_Motorrad_Gs130Gs.jpg";
        }
        // Royal Enfield
        if (b.contains("royal enfield") || b.contains("royal_enfield")) {
            if (m.contains("himalayan")) return "/images/motorbikes/Royal_Enfield_himalayan.jpg";
            return "/images/motorbikes/Royal_Enfield_classic-250.jpg";
        }
        // SYM
        if (b.contains("sym")) {
            return "/images/motorbikes/SYM_attila.jpg";
        }
        // VinFast (electric bikes)
        if (b.contains("vinfast")) {
            return "/images/motorbikes/kalara_s.jpg";
        }

        // Default fallback: generic exciter image
        return "/images/motorbikes/exciter_155.jpg";
    }

    private void updateMockImagesOfExistingVehicles() {
        log.info("Updating mock/unsplash images of existing vehicles in the database...");
        try {
            // 1. Heal unified vehicles table (cars + motorbikes)
            java.util.List<Vehicle> vehicles = vehicleRepository.findAll();
            int count = 0;
            for (Vehicle v : vehicles) {
                String thumb = v.getThumbnailUrl();
                boolean isMockUrl = thumb != null && (thumb.contains("unsplash.com") || thumb.startsWith("http"));
                if (isMockUrl) {
                    String realImage;
                    if (v.getVehicleType() == VehicleType.MOTORBIKE) {
                        realImage = getMotoRealImage(v.getBrand(), v.getModel());
                    } else {
                        realImage = getCarRealImage(v.getBrand(), v.getModel());
                    }
                    v.setThumbnailUrl(realImage);
                    vehicleRepository.save(v);
                    count++;
                    log.info("Fixed image for {} {} {} -> {}", v.getVehicleType(), v.getBrand(), v.getModel(), realImage);
                }
            }
            if (count > 0) {
                log.info("Successfully updated {} existing vehicles to real images.", count);
            }

            // 2. Heal legacy car_images table
            java.util.List<Car> cars = carRepository.findAll();
            int carCount = 0;
            for (Car c : cars) {
                boolean changed = false;
                if (c.getImages() != null) {
                    for (CarImage img : c.getImages()) {
                        String url = img.getUrl();
                        if (url != null && (url.contains("unsplash.com") || url.startsWith("http"))) {
                            String realImage = getCarRealImage(c.getModel().getBrand().getName(), c.getModel().getName());
                            img.setUrl(realImage);
                            changed = true;
                            carCount++;
                        }
                    }
                }
                if (changed) {
                    carRepository.save(c);
                }
            }
            if (carCount > 0) {
                log.info("Successfully updated {} legacy car images to real images.", carCount);
            }

            // 3. Heal legacy motorbike_images table
            java.util.List<Motorbike> bikes = motorbikeRepository.findAll();
            int bikeCount = 0;
            for (Motorbike mb : bikes) {
                boolean changed = false;
                if (mb.getImages() != null) {
                    for (MotorbikeImage img : mb.getImages()) {
                        String url = img.getUrl();
                        if (url != null && (url.contains("unsplash.com") || url.startsWith("http"))) {
                            String brandName = (mb.getModel() != null && mb.getModel().getBrand() != null)
                                    ? mb.getModel().getBrand().getName() : "";
                            String modelName = (mb.getModel() != null) ? mb.getModel().getName() : "";
                            String realImage = getMotoRealImage(brandName, modelName);
                            img.setUrl(realImage);
                            changed = true;
                            bikeCount++;
                        }
                    }
                }
                if (changed) {
                    motorbikeRepository.save(mb);
                }
            }
            if (bikeCount > 0) {
                log.info("Successfully updated {} legacy motorbike images to real images.", bikeCount);
            }
        } catch (Exception e) {
            log.error("Failed to update existing vehicle images: {}", e.getMessage());
        }
    }

    private User getOrCreateDefaultOwner() {
        return userRepository.findByEmail("owner@luxeway.vn").orElseGet(() -> {
            User newOwner = User.builder()
                    .id("owner-user-id-003")
                    .email("owner@luxeway.vn")
                    .password(passwordEncoder.encode("password"))
                    .firstName("Owner")
                    .lastName("LuxeWay")
                    .displayName("Owner LuxeWay")
                    .role(UserRole.OWNER)
                    .verified(true)
                    .kycVerified(true)
                    .drivingLicenseVerified(true)
                    .rating(new BigDecimal("4.95"))
                    .totalReviews(45)
                    .joinedAt(LocalDateTime.now())
                    .isActive(true)
                    .preferredLanguage("en")
                    .walletBalance(new BigDecimal("50000000.00"))
                    .build();
            return userRepository.save(newOwner);
        });
    }

    private void seedCars(User owner) {
        // Brand, Country, Models (Name, Category, priceRangeMin, priceRangeMax, seats)
        Map<String, String[]> carBrandsMap = new LinkedHashMap<>();
        carBrandsMap.put("Toyota", new String[]{"Japan", "Vios:Sedan:500000:800000:5", "Camry:Sedan:1200000:1800000:5", "Fortuner:SUV:1200000:1800000:7", "Innova:MPV:800000:1200000:7"});
        carBrandsMap.put("Mazda", new String[]{"Japan", "Mazda 3:Sedan:700000:900000:5", "Mazda 6:Sedan:1100000:1400000:5", "CX-5:SUV:1000000:1300000:5", "CX-8:SUV:1300000:1700000:7"});
        carBrandsMap.put("Mercedes-Benz", new String[]{"Germany", "C200:Luxury:2200000:2800000:5", "E300:Luxury:3500000:4500000:5", "S450:Luxury:6000000:9000000:5", "GLC300:Luxury:3000000:4000000:5"});
        carBrandsMap.put("VinFast", new String[]{"Vietnam", "Fadil:Economy:450000:600000:5", "Lux A2.0:Sedan:900000:1200000:5", "VF8:Electric:1500000:2000000:5", "VF9:Electric:2200000:3000000:7"});
        carBrandsMap.put("Porsche", new String[]{"Germany", "Macan:Luxury:4500000:6000000:5", "Cayenne:Luxury:6000000:8500000:5", "Panamera:Luxury:7000000:9500000:5"});
        carBrandsMap.put("BMW", new String[]{"Germany", "320i:Sedan:1800000:2400000:5", "520i:Sedan:2500000:3200000:5", "X5:SUV:3500000:4500000:7"});
        carBrandsMap.put("Audi", new String[]{"Germany", "A4:Sedan:1800000:2300000:5", "Q5:SUV:2500000:3200000:5", "Q7:SUV:3500000:4500000:7"});
        carBrandsMap.put("Lexus", new String[]{"Japan", "ES250:Luxury:2500000:3200000:5", "RX350:Luxury:4000000:5500000:5", "LX570:Luxury:8000000:11000000:7"});
        carBrandsMap.put("Hyundai", new String[]{"South Korea", "Accent:Sedan:500000:700000:5", "Elantra:Sedan:700000:900000:5", "Tucson:SUV:900000:1200000:5", "SantaFe:SUV:1200000:1700000:7"});
        carBrandsMap.put("Honda", new String[]{"Japan", "City:Sedan:500000:700000:5", "Civic:Sedan:800000:1100000:5", "CR-V:SUV:1100000:1500000:7"});
        carBrandsMap.put("Kia", new String[]{"South Korea", "Morning:Economy:400000:550000:5", "Cerato:Sedan:600000:800000:5", "Sorento:SUV:1100000:1500000:7", "Carnival:MPV:1800000:2500000:7"});
        carBrandsMap.put("Mitsubishi", new String[]{"Japan", "Xpander:MPV:700000:950000:7", "Outlander:SUV:1000000:1300000:7"});
        carBrandsMap.put("Ford", new String[]{"USA", "Ranger:Pickup:900000:1300000:5", "Everest:SUV:1200000:1800000:7"});
        carBrandsMap.put("Nissan", new String[]{"Japan", "Almera:Sedan:500000:700000:5", "Navara:Pickup:850000:1200000:5"});
        carBrandsMap.put("Suzuki", new String[]{"Japan", "Swift:Economy:500000:700000:5", "XL7:MPV:700000:950000:7"});
        carBrandsMap.put("Peugeot", new String[]{"France", "2008:SUV:800000:1100000:5", "3008:SUV:1100000:1400000:5", "5008:SUV:1400000:1900000:7"});
        carBrandsMap.put("Subaru", new String[]{"Japan", "Forester:SUV:1100000:1500000:5"});
        carBrandsMap.put("Volvo", new String[]{"Sweden", "XC60:Luxury:2800000:3600000:5", "XC90:Luxury:4500000:6000000:7"});
        carBrandsMap.put("Chevrolet", new String[]{"USA", "Cruze:Sedan:500000:700000:5", "Colorado:Pickup:800000:1100000:5"});

        int carIndex = 0;
        int targetCarCount = 125;
        
        while (carIndex < targetCarCount) {
            for (Map.Entry<String, String[]> entry : carBrandsMap.entrySet()) {
                if (carIndex >= targetCarCount) break;

                String brandName = entry.getKey();
                String[] brandData = entry.getValue();
                String country = brandData[0];

                CarBrand brand = carBrandRepository.findByName(brandName).orElseGet(() -> {
                    CarBrand newBrand = CarBrand.builder()
                            .name(brandName)
                            .country(country)
                            .logoUrl("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=200&auto=format&fit=crop")
                            .isActive(true)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return carBrandRepository.save(newBrand);
                });

                for (int i = 1; i < brandData.length; i++) {
                    if (carIndex >= targetCarCount) break;

                    String[] modelParts = brandData[i].split(":");
                    String modelName = modelParts[0];
                    String category = modelParts[1];
                    long minPrice = Long.parseLong(modelParts[2]);
                    long maxPrice = Long.parseLong(modelParts[3]);
                    int seats = Integer.parseInt(modelParts[4]);

                    CarModel model = carModelRepository.findByName(modelName).orElseGet(() -> {
                        CarModel newModel = CarModel.builder()
                                .brand(brand)
                                .name(modelName)
                                .category(category)
                                .createdAt(LocalDateTime.now())
                                .build();
                        return carModelRepository.save(newModel);
                    });

                    // Generate a car for this model
                    String city = CITIES[carIndex % CITIES.length];
                    String licensePlate = generateCarPlate(carIndex);
                    
                    // Add details
                    BigDecimal pricePerDay = new BigDecimal(minPrice + (carIndex % 3) * (maxPrice - minPrice) / 2);
                    BigDecimal deposit = pricePerDay.multiply(new BigDecimal("3")); // 3 days worth of deposit

                    Car car = Car.builder()
                            .model(model)
                            .owner(owner)
                            .name(brandName + " " + modelName)
                            .licensePlate(licensePlate)
                            .pricePerDay(pricePerDay)
                            .deposit(deposit)
                            .status(VehicleStatus.AVAILABLE)
                            .rating(new BigDecimal(4.0 + (carIndex % 11) * 0.1))
                            .totalReviews(carIndex % 15)
                            .totalBookings(carIndex % 25 + 5)
                            .isVerified(true)
                            .isFeatured(carIndex % 10 == 0)
                            .createdAt(LocalDateTime.now().minusDays(carIndex % 30))
                            .build();

                    car = carRepository.save(car);

                    CarSpecification spec = CarSpecification.builder()
                            .car(car)
                            .seats(seats)
                            .doors(seats == 2 ? 2 : 4)
                            .transmission(carIndex % 2 == 0 ? TransmissionType.AUTOMATIC : TransmissionType.MANUAL)
                            .fuelType(category.equalsIgnoreCase("Electric") ? FuelType.ELECTRIC : (carIndex % 3 == 0 ? FuelType.DIESEL : FuelType.GASOLINE))
                            .hasChauffeur(carIndex % 5 == 0)
                            .airportDelivery(carIndex % 3 == 0)
                            .electric(category.equalsIgnoreCase("Electric"))
                            .hybrid(carIndex % 7 == 0)
                            .build();
                    car.setSpecification(spec);

                    CarLocation loc = CarLocation.builder()
                            .car(car)
                            .city(city)
                            .address(getRealAddress(city, carIndex))
                            .latitude(getRealLatitude(city, carIndex))
                            .longitude(getRealLongitude(city, carIndex))
                            .build();
                    car.setLocation(loc);

                    // Add primary image
                    CarImage img = CarImage.builder()
                            .car(car)
                            .url(getCarRealImage(brandName, modelName))
                            .isPrimary(true)
                            .sortOrder(0)
                            .build();
                    car.setImages(new java.util.HashSet<>(java.util.Collections.singletonList(img)));

                    carRepository.save(car);
                    carIndex++;
                }
            }
        }
        log.info("Successfully seeded {} cars", carIndex);
    }

    private void seedMotorbikes(User owner) {
        // Brand, Country, Models (Name, Category, priceRangeMin, priceRangeMax, engineCc)
        Map<String, String[]> motorbikeBrandsMap = new LinkedHashMap<>();
        motorbikeBrandsMap.put("Honda", new String[]{"Japan", "Vision:Scooter:120000:150000:110", "Air Blade:Scooter:150000:200000:125", "SH 150i:Scooter:350000:500000:150", "Winner X:Manual_Motorcycle:150000:180000:150"});
        motorbikeBrandsMap.put("Yamaha", new String[]{"Japan", "Sirius:Manual_Motorcycle:100000:130000:110", "Exciter 155:Manual_Motorcycle:160000:200000:155", "Grande:Scooter:150000:180000:125", "NVX 155:Scooter:180000:220000:155"});
        motorbikeBrandsMap.put("Vespa", new String[]{"Italy", "Sprint:Scooter:300000:400000:125", "Primavera:Scooter:280000:350000:125", "GTS 300:Scooter:600000:800000:300"});
        motorbikeBrandsMap.put("Ducati", new String[]{"Italy", "Monster 797:Sport_Bike:1200000:1600000:803", "Scrambler:Classic_Bike:1500000:2000000:803"});
        motorbikeBrandsMap.put("Triumph", new String[]{"UK", "Trident 660:Classic_Bike:1200000:1500000:660", "Bonneville T120:Classic_Bike:1800000:2400000:1200"});
        motorbikeBrandsMap.put("Suzuki", new String[]{"Japan", "Raider R150:Manual_Motorcycle:150000:180000:150", "Satria F150:Manual_Motorcycle:160000:190000:150"});
        motorbikeBrandsMap.put("Kawasaki", new String[]{"Japan", "Ninja 400:Sport_Bike:800000:110000:399", "Z400:Sport_Bike:750000:100000:399"});
        motorbikeBrandsMap.put("BMW Motorrad", new String[]{"Germany", "G310GS:Adventure_Bike:900000:1200000:313", "R1250GS:Adventure_Bike:2200000:3000000:1254"});
        motorbikeBrandsMap.put("KTM", new String[]{"Austria", "Duke 390:Sport_Bike:800000:1100000:373", "Adventure 390:Adventure_Bike:900000:1200000:373"});
        motorbikeBrandsMap.put("SYM", new String[]{"Taiwan", "Attila:Scooter:110000:140000:125", "Galaxy:Manual_Motorcycle:100000:120000:110"});
        motorbikeBrandsMap.put("Harley-Davidson", new String[]{"USA", "Iron 883:Classic_Bike:1600000:2200000:883"});
        motorbikeBrandsMap.put("Royal Enfield", new String[]{"India", "Classic 350:Classic_Bike:700000:900000:349", "Himalayan:Adventure_Bike:800000:1000000:411"});

        int bikeIndex = 0;
        int targetBikeCount = 85;
        
        while (bikeIndex < targetBikeCount) {
            for (Map.Entry<String, String[]> entry : motorbikeBrandsMap.entrySet()) {
                if (bikeIndex >= targetBikeCount) break;

                String brandName = entry.getKey();
                String[] brandData = entry.getValue();
                String country = brandData[0];

                MotorbikeBrand brand = motorbikeBrandRepository.findByName(brandName).orElseGet(() -> {
                    MotorbikeBrand newBrand = MotorbikeBrand.builder()
                            .name(brandName)
                            .country(country)
                            .logoUrl("https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=200&auto=format&fit=crop")
                            .isActive(true)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return motorbikeBrandRepository.save(newBrand);
                });

                for (int i = 1; i < brandData.length; i++) {
                    if (bikeIndex >= targetBikeCount) break;

                    String[] modelParts = brandData[i].split(":");
                    String modelName = modelParts[0];
                    String category = modelParts[1];
                    long minPrice = Long.parseLong(modelParts[2]);
                    long maxPrice = Long.parseLong(modelParts[3]);
                    int engineCc = Integer.parseInt(modelParts[4]);

                    MotorbikeModel model = motorbikeModelRepository.findByName(modelName).orElseGet(() -> {
                        MotorbikeModel newModel = MotorbikeModel.builder()
                                .brand(brand)
                                .name(modelName)
                                .category(category)
                                .createdAt(LocalDateTime.now())
                                .build();
                        return motorbikeModelRepository.save(newModel);
                    });

                    // Generate a motorbike for this model
                    String city = CITIES[bikeIndex % CITIES.length];
                    String licensePlate = generateBikePlate(bikeIndex);
                    
                    // Add details
                    BigDecimal pricePerDay = new BigDecimal(minPrice + (bikeIndex % 3) * (maxPrice - minPrice) / 2);
                    BigDecimal deposit = pricePerDay.multiply(new BigDecimal("2")); // 2 days deposit for motorbikes

                    Motorbike motorbike = Motorbike.builder()
                            .model(model)
                            .owner(owner)
                            .name(brandName + " " + modelName)
                            .licensePlate(licensePlate)
                            .pricePerDay(pricePerDay)
                            .deposit(deposit)
                            .status(VehicleStatus.AVAILABLE)
                            .rating(new BigDecimal(4.2 + (bikeIndex % 9) * 0.1))
                            .totalReviews(bikeIndex % 10)
                            .totalBookings(bikeIndex % 18 + 2)
                            .isVerified(true)
                            .isFeatured(bikeIndex % 8 == 0)
                            .createdAt(LocalDateTime.now().minusDays(bikeIndex % 20))
                            .build();

                    motorbike = motorbikeRepository.save(motorbike);

                    MotorbikeSpecification spec = MotorbikeSpecification.builder()
                            .motorbike(motorbike)
                            .engineCc(engineCc)
                            .transmission(category.contains("Scooter") ? TransmissionType.AUTOMATIC : TransmissionType.MANUAL)
                            .helmetIncluded(true)
                            .raincoatIncluded(true)
                            .phoneHolder(bikeIndex % 2 == 0)
                            .luggageRack(bikeIndex % 3 == 0)
                            .build();
                    motorbike.setSpecification(spec);

                    MotorbikeLocation loc = MotorbikeLocation.builder()
                            .motorbike(motorbike)
                            .city(city)
                            .address(getRealAddress(city, bikeIndex))
                            .latitude(getRealLatitude(city, bikeIndex))
                            .longitude(getRealLongitude(city, bikeIndex))
                            .build();
                    motorbike.setLocation(loc);

                    // Add primary image — use real local motorbike image
                    MotorbikeImage img = MotorbikeImage.builder()
                            .motorbike(motorbike)
                            .url(getMotoRealImage(brandName, modelName))
                            .isPrimary(true)
                            .sortOrder(0)
                            .build();
                    motorbike.setImages(new HashSet<>(Collections.singletonList(img)));

                    motorbikeRepository.save(motorbike);
                    bikeIndex++;
                }
            }
        }
        log.info("Successfully seeded {} motorbikes", bikeIndex);
    }

    private String generateCarPlate(int index) {
        // Generates plates like 51A-900.00 to 51A-999.99
        int num = 90000 + index;
        String formatted = String.format("%05d", num);
        return "51A-" + formatted.substring(0, 3) + "." + formatted.substring(3);
    }

    private String generateBikePlate(int index) {
        // Generates plates like 29-H1 800.00
        int num = 80000 + index;
        String formatted = String.format("%05d", num);
        return "29-H1 " + formatted.substring(0, 3) + "." + formatted.substring(3);
    }

    private String getRealAddress(String city, int idx) {
        if ("Hồ Chí Minh".equals(city) || "Ho Chi Minh".equals(city) || "Ho Chi Minh City".equals(city)) {
            String[] addrs = {
                "Tan Son Nhat Airport, Tan Binh, Ho Chi Minh City",
                "Vincom Center, District 1, Ho Chi Minh City",
                "321 Tran Hung Dao, District 1, Ho Chi Minh City",
                "Crescent Mall, District 7, Ho Chi Minh City",
                "Landmark 81, Binh Thanh, Ho Chi Minh City",
                "Phan Xich Long, Phu Nhuan, Ho Chi Minh City",
                "Vietnam National University, Thu Duc, Ho Chi Minh City",
                "Khanh Hoi Park, District 4, Ho Chi Minh City",
                "3/2 Street, District 10, Ho Chi Minh City"
            };
            return addrs[idx % addrs.length];
        } else if ("Hà Nội".equals(city) || "Ha Noi".equals(city) || "Hanoi".equals(city)) {
            String[] addrs = {
                "Hanoi Station, Dong Da, Hanoi",
                "Hoan Kiem Lake, Hoan Kiem, Hanoi",
                "88 Le Van Luong, Thanh Xuan, Hanoi",
                "Duy Tan, Cau Giay, Hanoi",
                "Ho Chi Minh Mausoleum, Ba Dinh, Hanoi",
                "Vincom Ba Trieu, Hai Ba Trung, Hanoi",
                "West Lake, Tay Ho, Hanoi",
                "Keangnam Landmark, Nam Tu Liem, Hanoi"
            };
            return addrs[idx % addrs.length];
        } else if ("Đà Nẵng".equals(city) || "Da Nang".equals(city)) {
            String[] addrs = {
                "Dragon Bridge, Son Tra, Da Nang",
                "Da Nang Airport, Hai Chau, Da Nang",
                "My Khe Beach, Ngu Hanh Son, Da Nang",
                "Dien Bien Phu, Thanh Khe, Da Nang"
            };
            return addrs[idx % addrs.length];
        } else if ("Nha Trang".equals(city)) {
            String[] addrs = {
                "45 Tran Phu, Loc Tho, Nha Trang",
                "Po Nagar Cham Towers, Nha Trang",
                "Vinpearl Land Harbour, Nha Trang"
            };
            return addrs[idx % addrs.length];
        } else if ("Đà Lạt".equals(city) || "Da Lat".equals(city)) {
            String[] addrs = {
                "Xuan Huong Lake, Da Lat",
                "Da Lat Market, Duong Minh Khai, Da Lat",
                "Valley of Love, Da Lat"
            };
            return addrs[idx % addrs.length];
        } else {
            return "Imperial City of Hue, Phu Hau, Hue";
        }
    }

    private BigDecimal getRealLatitude(String city, int idx) {
        double baseLat;
        if ("Hồ Chí Minh".equals(city) || "Ho Chi Minh".equals(city) || "Ho Chi Minh City".equals(city)) {
            double[] lats = {
                10.8185, // Tan Binh (Airport)
                10.7779, // District 1 (Vincom)
                10.7624, // District 1 (Tran Hung Dao)
                10.7292, // District 7 (Crescent)
                10.7978, // Binh Thanh (Landmark 81)
                10.7985, // Phu Nhuan (Phan Xich Long)
                10.8700, // Thu Duc (VNU)
                10.7580, // District 4 (Khanh Hoi)
                10.7745  // District 10 (3/2 St)
            };
            baseLat = lats[idx % lats.length];
        } else if ("Hà Nội".equals(city) || "Ha Noi".equals(city) || "Hanoi".equals(city)) {
            double[] lats = {
                21.0254, // Dong Da
                21.0285, // Hoan Kiem
                21.0020, // Thanh Xuan
                21.0305, // Cau Giay
                21.0360, // Ba Dinh
                21.0125, // Hai Ba Trung
                21.0680, // Tay Ho
                21.0165  // Nam Tu Liem
            };
            baseLat = lats[idx % lats.length];
        } else if ("Đà Nẵng".equals(city) || "Da Nang".equals(city)) {
            double[] lats = {
                16.0612, // Son Tra
                16.0478, // Hai Chau
                16.0438, // Ngu Hanh Son
                16.0650  // Thanh Khe
            };
            baseLat = lats[idx % lats.length];
        } else if ("Nha Trang".equals(city)) {
            double[] lats = {12.2415, 12.2654, 12.2210};
            baseLat = lats[idx % lats.length];
        } else if ("Đà Lạt".equals(city) || "Da Lat".equals(city)) {
            double[] lats = {11.9412, 11.9424, 11.9542};
            baseLat = lats[idx % lats.length];
        } else if ("Cần Thơ".equals(city) || "Can Tho".equals(city)) {
            baseLat = 10.0354;
        } else {
            baseLat = 16.4682;
        }
        
        // Add pseudo-random deterministic jitter to spread vehicles out naturally (50m to 300m range)
        double jitter = (Math.sin(idx * 0.5) * 0.005);
        return new BigDecimal(baseLat + jitter).setScale(8, java.math.RoundingMode.HALF_UP);
    }

    private BigDecimal getRealLongitude(String city, int idx) {
        double baseLng;
        if ("Hồ Chí Minh".equals(city) || "Ho Chi Minh".equals(city) || "Ho Chi Minh City".equals(city)) {
            double[] lngs = {
                106.6588, // Tan Binh
                106.7020, // District 1
                106.6908, // District 1
                106.7210, // District 7
                106.7218, // Binh Thanh
                106.6854, // Phu Nhuan
                106.8030, // Thu Duc
                106.7050, // District 4
                106.6690  // District 10
            };
            baseLng = lngs[idx % lngs.length];
        } else if ("Hà Nội".equals(city) || "Ha Noi".equals(city) || "Hanoi".equals(city)) {
            double[] lngs = {
                105.8412, // Dong Da
                105.8542, // Hoan Kiem
                105.8080, // Thanh Xuan
                105.7830, // Cau Giay
                105.8340, // Ba Dinh
                105.8490, // Hai Ba Trung
                105.8250, // Tay Ho
                105.7840  // Nam Tu Liem
            };
            baseLng = lngs[idx % lngs.length];
        } else if ("Đà Nẵng".equals(city) || "Da Nang".equals(city)) {
            double[] lngs = {
                108.2268, // Son Tra
                108.2200, // Hai Chau
                108.2450, // Ngu Hanh Son
                108.1980  // Thanh Khe
            };
            baseLng = lngs[idx % lngs.length];
        } else if ("Nha Trang".equals(city)) {
            double[] lngs = {109.1965, 109.1912, 109.2150};
            baseLng = lngs[idx % lngs.length];
        } else if ("Đà Lạt".equals(city) || "Da Lat".equals(city)) {
            double[] lngs = {108.4385, 108.4365, 108.4500};
            baseLng = lngs[idx % lngs.length];
        } else if ("Cần Thơ".equals(city) || "Can Tho".equals(city)) {
            baseLng = 105.7865;
        } else {
            baseLng = 107.5985;
        }
        
        // Add pseudo-random deterministic jitter to spread vehicles out naturally (50m to 300m range)
        double jitter = (Math.cos(idx * 0.5) * 0.005);
        return new BigDecimal(baseLng + jitter).setScale(8, java.math.RoundingMode.HALF_UP);
    }

    @Transactional
    public void updateExistingVehicleCoordinates() {
        log.info("Updating existing vehicle coordinates with precise city offsets and jitter...");
        List<Vehicle> allVehicles = vehicleRepository.findAll();
        int updatedCount = 0;
        for (int i = 0; i < allVehicles.size(); i++) {
            Vehicle v = allVehicles.get(i);
            String city = v.getCity();
            if (city != null) {
                BigDecimal correctLat = getRealLatitude(city, i);
                BigDecimal correctLng = getRealLongitude(city, i);
                v.setLatitude(correctLat);
                v.setLongitude(correctLng);
                v.setAddress(getRealAddress(city, i));
                
                // Set current coordinates as well
                v.setCurrentLat(correctLat);
                v.setCurrentLng(correctLng);
                
                vehicleRepository.save(v);
                updatedCount++;
            }
        }
        log.info("Finished updating coordinates for {} vehicles.", updatedCount);
    }
}
