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

    private static final String[] CITIES = {"Ho Chi Minh", "Ha Noi", "Da Nang", "Nha Trang", "Da Lat", "Hue"};
    
    @Transactional
    public void seedAll() {
        log.info("Starting enterprise data seeding...");
        User owner = getOrCreateDefaultOwner();

        // 1. Seed Cars (120+ records)
        if (carRepository.count() < 120) {
            log.info("Seeding 120+ real Vietnam market cars...");
            seedCars(owner);
        } else {
            log.info("Car repository already has {} records, skipping seeding.", carRepository.count());
        }

        // 2. Seed Motorbikes (80+ records)
        if (motorbikeRepository.count() < 80) {
            log.info("Seeding 80+ real Vietnam market motorbikes...");
            seedMotorbikes(owner);
        } else {
            log.info("Motorbike repository already has {} records, skipping seeding.", motorbikeRepository.count());
        }

        log.info("Enterprise database seeding completed successfully.");
    }

    private User getOrCreateDefaultOwner() {
        return userRepository.findByEmail("owner@luxeway.com").orElseGet(() -> {
            User newOwner = User.builder()
                    .id(UUID.randomUUID().toString())
                    .email("owner@luxeway.com")
                    .password(passwordEncoder.encode("password123"))
                    .firstName("LuxeWay")
                    .lastName("Owner")
                    .displayName("LuxeWay Partner")
                    .role(UserRole.OWNER)
                    .verified(true)
                    .kycVerified(true)
                    .drivingLicenseVerified(true)
                    .rating(new BigDecimal("4.85"))
                    .totalReviews(12)
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
                            .address(100 + carIndex + " LuxeWay Boulevard, " + city)
                            .latitude(new BigDecimal(10.762622 + (carIndex % 10) * 0.01))
                            .longitude(new BigDecimal(106.660172 + (carIndex % 10) * 0.01))
                            .build();
                    car.setLocation(loc);

                    // Add primary image
                    CarImage img = CarImage.builder()
                            .car(car)
                            .url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop")
                            .isPrimary(true)
                            .sortOrder(0)
                            .build();
                    car.setImages(new HashSet<>(Collections.singletonList(img)));

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
                            .address(50 + bikeIndex + " Motorway Avenue, " + city)
                            .latitude(new BigDecimal(10.762622 + (bikeIndex % 8) * 0.005))
                            .longitude(new BigDecimal(106.660172 + (bikeIndex % 8) * 0.005))
                            .build();
                    motorbike.setLocation(loc);

                    // Add primary image
                    MotorbikeImage img = MotorbikeImage.builder()
                            .motorbike(motorbike)
                            .url("https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop")
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
}
