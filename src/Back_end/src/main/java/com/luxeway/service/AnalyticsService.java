package com.luxeway.service;

import com.luxeway.entity.Analytics;
import com.luxeway.entity.Booking;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.enums.BookingStatus;
import com.luxeway.repository.AnalyticsRepository;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService implements CommandLineRunner {

    private final AnalyticsRepository analyticsRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    @Override
    public void run(String... args) {
        log.info("Checking platform analytics records...");
        long count = analyticsRepository.count();
        if (count == 0) {
            log.info("Seeding realistic historical analytics for the last 30 days to build premium visual charts...");
            seedHistoricalAnalytics();
        }
    }

    @Transactional
    public void seedHistoricalAnalytics() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(30);
        
        Random random = new Random();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            // Check if record exists
            if (analyticsRepository.findByRecordDate(date).isPresent()) {
                continue;
            }

            // Generate plausible revenue and counts
            BigDecimal dailyRevenue = BigDecimal.valueOf(1500000 + random.nextInt(4500000)); // 1.5M to 6M VND
            int bookingsCount = 2 + random.nextInt(8);
            int activeRentals = 5 + random.nextInt(15);
            int newUsers = 1 + random.nextInt(4);
            int newVehicles = random.nextInt(2);

            Analytics record = Analytics.builder()
                    .recordDate(date)
                    .revenue(dailyRevenue)
                    .bookingsCount(bookingsCount)
                    .activeRentals(activeRentals)
                    .newUsers(newUsers)
                    .newVehicles(newVehicles)
                    .createdAt(LocalDateTime.now())
                    .build();

            analyticsRepository.save(record);
        }
        log.info("Successfully seeded 30 days of platform historical analytics records.");
    }

    /**
     * Aggregates daily platform metrics for a specific date
     */
    @Transactional
    public Analytics compileAnalyticsForDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        // Revenue: Sum of totals for bookings completed on this day
        // Since booking may not have detailed log, we check bookings active/completed
        List<Booking> dayBookings = bookingRepository.findAll();
        BigDecimal dailyRevenue = BigDecimal.ZERO;
        int bookingsCount = 0;
        int activeRentals = 0;

        for (Booking booking : dayBookings) {
            // Placed on this day
            if (booking.getCreatedAt() != null && 
                !booking.getCreatedAt().isBefore(startOfDay) && 
                !booking.getCreatedAt().isAfter(endOfDay)) {
                bookingsCount++;
            }

            // Active on this day
            if (booking.getStatus() != BookingStatus.CANCELLED && 
                booking.getStartDate() != null && booking.getEndDate() != null && 
                !booking.getStartDate().isAfter(date) && !booking.getEndDate().isBefore(date)) {
                activeRentals++;
            }

            // Revenue calculation
            if (booking.getStatus() == BookingStatus.COMPLETED && 
                booking.getUpdatedAt() != null && 
                !booking.getUpdatedAt().isBefore(startOfDay) && 
                !booking.getUpdatedAt().isAfter(endOfDay)) {
                if (booking.getTotal() != null) {
                    dailyRevenue = dailyRevenue.add(booking.getTotal());
                }
            }
        }

        // New accounts count
        int newUsersCount = 0;
        List<User> users = userRepository.findAll();
        for (User u : users) {
            LocalDateTime joined = u.getJoinedAt() != null ? u.getJoinedAt() : u.getCreatedAt();
            if (joined != null && !joined.isBefore(startOfDay) && !joined.isAfter(endOfDay)) {
                newUsersCount++;
            }
        }

        // New vehicles count
        int newVehiclesCount = 0;
        List<Vehicle> vehicles = vehicleRepository.findAll();
        for (Vehicle v : vehicles) {
            if (v.getCreatedAt() != null && !v.getCreatedAt().isBefore(startOfDay) && !v.getCreatedAt().isAfter(endOfDay)) {
                newVehiclesCount++;
            }
        }

        // Find or create daily analytics record
        Analytics analytics = analyticsRepository.findByRecordDate(date)
                .orElse(Analytics.builder().recordDate(date).build());

        analytics.setRevenue(dailyRevenue);
        analytics.setBookingsCount(bookingsCount);
        analytics.setActiveRentals(activeRentals);
        analytics.setNewUsers(newUsersCount);
        analytics.setNewVehicles(newVehiclesCount);

        Analytics saved = analyticsRepository.save(analytics);
        log.info("Compiled platform metrics for date {}: Revenue={}, Bookings={}, ActiveRentals={}, NewUsers={}, NewVehicles={}",
                date, dailyRevenue, bookingsCount, activeRentals, newUsersCount, newVehiclesCount);
        return saved;
    }

    /**
     * Cron schedule: Run aggregation daily at midnight
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void runDailyAggregation() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("Running scheduled daily aggregation for date: {}", yesterday);
        compileAnalyticsForDate(yesterday);
    }

    /**
     * Retrieve platform metrics for the last N days
     */
    @Transactional(readOnly = true)
    public List<Analytics> getHistoricalMetrics(int days) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(days - 1);
        return analyticsRepository.findByRecordDateBetweenOrderByRecordDateAsc(start, end);
    }

    /**
     * Returns platform-wide cumulative summary parameters
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getOverviewStats() {
        Map<String, Object> summary = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long totalVehicles = vehicleRepository.count();
        long totalBookings = bookingRepository.count();
        
        BigDecimal totalRevenue = bookingRepository.sumTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        summary.put("totalUsers", totalUsers);
        summary.put("totalVehicles", totalVehicles);
        summary.put("totalBookings", totalBookings);
        summary.put("totalRevenue", totalRevenue);

        // Calculate dynamic weekly trends
        LocalDate today = LocalDate.now();
        List<Analytics> lastWeek = analyticsRepository.findByRecordDateBetweenOrderByRecordDateAsc(today.minusDays(7), today);
        BigDecimal weeklyRevenue = BigDecimal.ZERO;
        int weeklyBookings = 0;
        for (Analytics a : lastWeek) {
            weeklyRevenue = weeklyRevenue.add(a.getRevenue());
            weeklyBookings += a.getBookingsCount();
        }

        summary.put("weeklyRevenue", weeklyRevenue);
        summary.put("weeklyBookings", weeklyBookings);

        return summary;
    }
}
