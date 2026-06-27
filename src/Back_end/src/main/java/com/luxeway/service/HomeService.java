package com.luxeway.service;

import com.luxeway.entity.*;
import com.luxeway.enums.BookingStatus;
import com.luxeway.enums.VehicleCategory;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HomeService {

    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final DestinationAnalyticsRepository destinationAnalyticsRepository;
    private final FAQRepository faqRepository;

    // ====== /api/home/stats ======
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        try {
            long totalVehicles = vehicleRepository.countByStatusAndApprovalStatus(VehicleStatus.AVAILABLE, VehicleStatus.APPROVED);
            long totalCustomers = userRepository.count();
            long totalBookings = bookingRepository.count();
            Double avgRating = reviewRepository.getAverageRating();
            double rating = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 4.9;

            stats.put("totalVehicles", totalVehicles);
            stats.put("totalCustomers", totalCustomers);
            stats.put("totalBookings", totalBookings);
            stats.put("averageRating", rating);
            stats.put("qualityVehicles", totalVehicles);
            stats.put("provinces", vehicleRepository.countDistinctCity());
            stats.put("happyClients", totalCustomers);

            // Category counts
            Map<String, Long> categoryCounts = new HashMap<>();
            for (VehicleCategory cat : VehicleCategory.values()) {
                categoryCounts.put(cat.name().toLowerCase(),
                    vehicleRepository.countByCategoryAndStatusAndApprovalStatus(cat, VehicleStatus.AVAILABLE, VehicleStatus.APPROVED));
            }
            stats.put("categoryCounts", categoryCounts);
        } catch (Exception e) {
            log.error("Error fetching home stats: {}", e.getMessage());
            stats.put("totalVehicles", 0);
            stats.put("totalCustomers", 0);
            stats.put("totalBookings", 0);
            stats.put("averageRating", 4.9);
            stats.put("categoryCounts", new HashMap<>());
        }
        return stats;
    }

    // ====== /api/home/promotions ======
    public List<Map<String, Object>> getActivePromotions() {
        try {
            List<Promotion> promotions = promotionRepository.findActivePromotions(LocalDateTime.now());
            if (promotions.isEmpty()) {
                return getDefaultPromotions();
            }
            return promotions.stream().map(p -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", p.getId());
                m.put("title", p.getTitle());
                m.put("description", p.getDescription());
                m.put("imageUrl", p.getImageUrl());
                m.put("discountPercent", p.getDiscountPercent());
                m.put("badgeText", p.getBadgeText());
                m.put("ctaText", p.getCtaText());
                m.put("ctaUrl", p.getCtaUrl());
                m.put("endDate", p.getEndDate() != null ? p.getEndDate().toString() : null);
                return m;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching promotions: {}", e.getMessage());
            return getDefaultPromotions();
        }
    }

    // ====== /api/home/trending ======
    public List<Map<String, Object>> getTrendingVehicles() {
        try {
            // Get top vehicles sorted by totalBookings desc, then rating desc
            var pageable = PageRequest.of(0, 8, Sort.by(
                Sort.Order.desc("totalBookings"),
                Sort.Order.desc("rating")
            ));
            var vehicles = vehicleRepository.findByStatusAndApprovalStatus(VehicleStatus.AVAILABLE, VehicleStatus.APPROVED, pageable);
            return vehicles.getContent().stream().map(v -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", v.getId());
                m.put("name", v.getName());
                m.put("brand", v.getBrand());
                m.put("model", v.getModel());
                m.put("year", v.getYear());
                m.put("category", v.getCategory() != null ? v.getCategory().name().toLowerCase() : "economy");
                m.put("thumbnailUrl", v.getThumbnailUrl());
                m.put("pricePerDay", v.getPricePerDay());
                m.put("rating", v.getRating());
                m.put("totalReviews", v.getTotalReviews());
                m.put("totalBookings", v.getTotalBookings());
                m.put("isVerified", v.getIsVerified());
                m.put("instantBook", v.getInstantBook());
                m.put("city", v.getCity());
                m.put("isOwnerVerified", v.getOwner() != null && Boolean.TRUE.equals(v.getOwner().getKycVerified()));
                return m;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching trending vehicles: {}", e.getMessage());
            return List.of();
        }
    }

    // ====== /api/home/categories ======
    public Map<String, Object> getCategories() {
        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> cars = new LinkedHashMap<>();
            cars.put("economy", vehicleRepository.countByCategoryAndStatusAndApprovalStatus(VehicleCategory.ECONOMY, VehicleStatus.AVAILABLE, VehicleStatus.APPROVED));
            cars.put("family", vehicleRepository.countByCategoryAndStatusAndApprovalStatus(VehicleCategory.FAMILY, VehicleStatus.AVAILABLE, VehicleStatus.APPROVED));
            cars.put("suv", vehicleRepository.countByCategoryAndStatusAndApprovalStatus(VehicleCategory.SUV, VehicleStatus.AVAILABLE, VehicleStatus.APPROVED));
            cars.put("business", vehicleRepository.countByCategoryAndStatusAndApprovalStatus(VehicleCategory.BUSINESS, VehicleStatus.AVAILABLE, VehicleStatus.APPROVED));
            cars.put("electric", vehicleRepository.countByCategoryAndStatusAndApprovalStatus(VehicleCategory.ELECTRIC, VehicleStatus.AVAILABLE, VehicleStatus.APPROVED));
            cars.put("tourism", vehicleRepository.countByCategoryAndStatusAndApprovalStatus(VehicleCategory.TOURISM, VehicleStatus.AVAILABLE, VehicleStatus.APPROVED));

            Map<String, Object> motorbikes = new LinkedHashMap<>();
            motorbikes.put("motorbike", vehicleRepository.countByCategoryAndStatusAndApprovalStatus(VehicleCategory.MOTORBIKE, VehicleStatus.AVAILABLE, VehicleStatus.APPROVED));
            motorbikes.put("city_car", vehicleRepository.countByCategoryAndStatusAndApprovalStatus(VehicleCategory.CITY_CAR, VehicleStatus.AVAILABLE, VehicleStatus.APPROVED));

            result.put("cars", cars);
            result.put("motorbikes", motorbikes);
            result.put("total", vehicleRepository.countByStatusAndApprovalStatus(VehicleStatus.AVAILABLE, VehicleStatus.APPROVED));
        } catch (Exception e) {
            log.error("Error fetching categories: {}", e.getMessage());
            result.put("cars", new HashMap<>());
            result.put("motorbikes", new HashMap<>());
        }
        return result;
    }

    private String normalizeCityName(String city) {
        if (city == null) return "";
        String lower = city.toLowerCase().trim();
        if (lower.contains("ho chi minh") || lower.contains("hcm")) {
            return "Hồ Chí Minh";
        }
        if (lower.contains("ha noi") || lower.contains("hanoi")) {
            return "Hà Nội";
        }
        if (lower.contains("da nang") || lower.contains("danang")) {
            return "Đà Nẵng";
        }
        if (lower.contains("nha trang")) {
            return "Nha Trang";
        }
        if (lower.contains("da lat") || lower.contains("dalat")) {
            return "Đà Lạt";
        }
        if (lower.contains("hue")) {
            return "Huế";
        }
        return city;
    }

    // ====== /api/home/destinations ======
    public List<Map<String, Object>> getDestinations() {
        try {
            List<DestinationAnalytics> destinations = destinationAnalyticsRepository.findByActiveOrderByDisplayOrderAsc(true);
            if (destinations.isEmpty()) {
                return getDefaultDestinations();
            }
            // Enrich with live vehicle counts
            return destinations.stream().map(d -> {
                Map<String, Object> m = new HashMap<>();
                m.put("city", d.getCity());
                m.put("imageUrl", d.getImageUrl());
                m.put("topCategory", d.getTopCategory());
                // Try to get live vehicle count
                try {
                    String normCity = normalizeCityName(d.getCity());
                    long liveCount = vehicleRepository.findByCityContainingIgnoreCase(normCity)
                        .stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE && v.getApprovalStatus() == VehicleStatus.APPROVED).count();
                    m.put("vehicleCount", liveCount);
                } catch (Exception ex) {
                    m.put("vehicleCount", 0L);
                }
                m.put("averagePrice", d.getAveragePrice());
                return m;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching destinations: {}", e.getMessage());
            return getDefaultDestinations();
        }
    }

    // ====== /api/home/testimonials ======
    public Map<String, Object> getTestimonials() {
        Map<String, Object> result = new HashMap<>();
        try {
            var pageable = PageRequest.of(0, 6);
            var page = reviewRepository.findByRatingGreaterThanEqualOrderByCreatedAtDesc(4, pageable);
            Double avg = reviewRepository.getAverageRating();
            long total = reviewRepository.count();

            List<Map<String, Object>> reviews = page.getContent().stream().map(r -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", r.getId());
                m.put("rating", r.getRating());
                m.put("comment", r.getComment());
                m.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
                if (r.getReviewer() != null) {
                    m.put("customerName", r.getReviewer().getDisplayName());
                    m.put("avatar", r.getReviewer().getAvatar());
                }
                if (r.getVehicle() != null) {
                    m.put("rentedVehicle", r.getVehicle().getName());
                    m.put("vehicleCategory", r.getVehicle().getCategory() != null ? r.getVehicle().getCategory().name().toLowerCase() : "car");
                }
                return m;
            }).collect(Collectors.toList());

            result.put("reviews", reviews);
            result.put("averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 4.9);
            result.put("totalReviews", total);
        } catch (Exception e) {
            log.error("Error fetching testimonials: {}", e.getMessage());
            result.put("reviews", List.of());
            result.put("averageRating", 4.9);
            result.put("totalReviews", 0);
        }
        return result;
    }

    // ====== /api/home/owner-stats ======
    public Map<String, Object> getOwnerStats() {
        Map<String, Object> stats = new HashMap<>();
        try {
            var totalRevenue = bookingRepository.sumTotalRevenue();
            long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);
            long totalOwners = userRepository.countByRole(com.luxeway.enums.UserRole.OWNER);
            Double avgRating = reviewRepository.getAverageRating();

            // Average monthly revenue per owner (if owners > 0)
            long avgMonthlyRevenue = 0;
            if (totalOwners > 0 && totalRevenue != null) {
                avgMonthlyRevenue = totalRevenue.longValue() / Math.max(totalOwners, 1) / 12;
            }

            stats.put("averageMonthlyRevenue", avgMonthlyRevenue > 0 ? avgMonthlyRevenue : 15_000_000L);
            stats.put("vehicleUtilization", 78.5);
            stats.put("completedBookings", completedBookings);
            stats.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 4.8);
            stats.put("totalOwners", totalOwners);
        } catch (Exception e) {
            log.error("Error fetching owner stats: {}", e.getMessage());
            stats.put("averageMonthlyRevenue", 15_000_000L);
            stats.put("vehicleUtilization", 78.5);
            stats.put("completedBookings", 0);
            stats.put("averageRating", 4.8);
            stats.put("totalOwners", 0);
        }
        return stats;
    }

    // ====== /api/home/faqs ======
    public List<Map<String, Object>> getFAQs() {
        try {
            var faqs = faqRepository.findAll();
            return faqs.stream()
                .filter(f -> Boolean.TRUE.equals(f.getIsActive()))
                .sorted(Comparator.comparing(FAQ::getDisplayOrder))
                .map(f -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", f.getId());
                    m.put("q", f.getQuestion());
                    m.put("a", f.getAnswer());
                    return m;
                }).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching FAQs: {}", e.getMessage());
            return List.of();
        }
    }

    // ====== Default fallback data ======

    private List<Map<String, Object>> getDefaultPromotions() {
        List<Map<String, Object>> promos = new ArrayList<>();

        Map<String, Object> p1 = new HashMap<>();
        p1.put("id", "promo-summer");
        p1.put("title", "Summer Escape – 15% Off");
        p1.put("description", "Beat the summer heat with 15% off on all SUV and Family car rentals. Perfect for weekend getaways!");
        p1.put("imageUrl", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920&auto=format&fit=crop");
        p1.put("discountPercent", 15);
        p1.put("badgeText", "Limited Time");
        p1.put("ctaText", "Book Now");
        p1.put("ctaUrl", "/marketplace?category=suv");
        promos.add(p1);

        Map<String, Object> p2 = new HashMap<>();
        p2.put("id", "promo-first");
        p2.put("title", "First Ride Free – 10% Off Your First Booking");
        p2.put("description", "New to LuxeWay? Use code FIRSTRIDE to get 10% off your very first rental. Valid for all vehicle types.");
        p2.put("imageUrl", "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920&auto=format&fit=crop");
        p2.put("discountPercent", 10);
        p2.put("badgeText", "New Users");
        p2.put("ctaText", "Get Coupon");
        p2.put("ctaUrl", "/marketplace");
        promos.add(p2);

        Map<String, Object> p3 = new HashMap<>();
        p3.put("id", "promo-weekend");
        p3.put("title", "Weekend Deals – Free Delivery Included");
        p3.put("description", "Book any vehicle for Sat–Sun and get free door-to-door delivery. Available in HCM, Hanoi & Da Nang.");
        p3.put("imageUrl", "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1920&auto=format&fit=crop");
        p3.put("discountPercent", 0);
        p3.put("badgeText", "Weekend Special");
        p3.put("ctaText", "See Deals");
        p3.put("ctaUrl", "/marketplace");
        promos.add(p3);

        return promos;
    }

    private List<Map<String, Object>> getDefaultDestinations() {
        List<Map<String, Object>> dests = new ArrayList<>();
        // BUG-17 FIX: Removed unused hardcoded vehicle counts (array index [1]).
        // The actual vehicle count is always fetched live from the DB below (liveCount).
        // Format: { city, averagePrice (VND), topCategory, imageUrl }
        String[][] data = {
            {"Ho Chi Minh", "750000", "suv", "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop"},
            {"Ha Noi", "650000", "economy", "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop"},
            {"Da Nang", "700000", "motorbike", "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop"},
            {"Nha Trang", "600000", "family", "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?q=80&w=800&auto=format&fit=crop"},
            {"Da Lat", "580000", "motorbike", "https://images.unsplash.com/photo-1580655653885-65763b2597d0?q=80&w=800&auto=format&fit=crop"},
            {"Hue", "520000", "economy", "https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=800&auto=format&fit=crop"},
        };
        for (String[] d : data) {
            Map<String, Object> m = new HashMap<>();
            m.put("city", d[0]);
            
            // Fetch live vehicle count from DB (never use hardcoded values)
            long liveCount = 0;
            try {
                String normCity = normalizeCityName(d[0]);
                liveCount = vehicleRepository.findByCityContainingIgnoreCase(normCity)
                    .stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE && v.getApprovalStatus() == VehicleStatus.APPROVED).count();
            } catch (Exception ex) {
                // Ignore - leave as 0
            }
            m.put("vehicleCount", liveCount);
            m.put("averagePrice", Long.parseLong(d[1]));
            m.put("topCategory", d[2]);
            m.put("imageUrl", d[3]);
            dests.add(m);
        }
        return dests;
    }

    // ====== /api/home/vehicles ======
    public Map<String, Object> getHomeVehicles() {
        Map<String, Object> result = new HashMap<>();
        try {
            // Popular (trending) vehicles (sorted by totalBookings desc, rating desc)
            var pageablePopular = PageRequest.of(0, 8, Sort.by(
                Sort.Order.desc("totalBookings"),
                Sort.Order.desc("rating")
            ));
            var popularVehicles = vehicleRepository.findByStatusAndApprovalStatus(VehicleStatus.AVAILABLE, VehicleStatus.APPROVED, pageablePopular);
            List<Map<String, Object>> popular = popularVehicles.getContent().stream().map(v -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", v.getId());
                m.put("name", v.getName());
                m.put("brand", v.getBrand());
                m.put("model", v.getModel());
                m.put("year", v.getYear());
                m.put("category", v.getCategory() != null ? v.getCategory().name().toLowerCase() : "economy");
                m.put("thumbnailUrl", v.getThumbnailUrl());
                m.put("pricePerDay", v.getPricePerDay());
                m.put("rating", v.getRating());
                m.put("totalReviews", v.getTotalReviews());
                m.put("totalBookings", v.getTotalBookings());
                m.put("isVerified", v.getIsVerified());
                m.put("instantBook", v.getInstantBook());
                m.put("city", v.getCity());
                m.put("isOwnerVerified", v.getOwner() != null && Boolean.TRUE.equals(v.getOwner().getKycVerified()));
                return m;
            }).collect(Collectors.toList());

            // Latest approved vehicles (sorted by createdAt desc)
            var pageableLatest = PageRequest.of(0, 8, Sort.by(Sort.Order.desc("createdAt")));
            var latestVehicles = vehicleRepository.findByStatusAndApprovalStatus(VehicleStatus.AVAILABLE, VehicleStatus.APPROVED, pageableLatest);
            List<Map<String, Object>> latest = latestVehicles.getContent().stream().map(v -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", v.getId());
                m.put("name", v.getName());
                m.put("brand", v.getBrand());
                m.put("model", v.getModel());
                m.put("year", v.getYear());
                m.put("category", v.getCategory() != null ? v.getCategory().name().toLowerCase() : "economy");
                m.put("thumbnailUrl", v.getThumbnailUrl());
                m.put("pricePerDay", v.getPricePerDay());
                m.put("rating", v.getRating());
                m.put("totalReviews", v.getTotalReviews());
                m.put("totalBookings", v.getTotalBookings());
                m.put("isVerified", v.getIsVerified());
                m.put("instantBook", v.getInstantBook());
                m.put("city", v.getCity());
                m.put("isOwnerVerified", v.getOwner() != null && Boolean.TRUE.equals(v.getOwner().getKycVerified()));
                return m;
            }).collect(Collectors.toList());

            result.put("popular", popular);
            result.put("latest", latest);
        } catch (Exception e) {
            log.error("Error fetching home vehicles: {}", e.getMessage());
            result.put("popular", List.of());
            result.put("latest", List.of());
        }
        return result;
    }
}
