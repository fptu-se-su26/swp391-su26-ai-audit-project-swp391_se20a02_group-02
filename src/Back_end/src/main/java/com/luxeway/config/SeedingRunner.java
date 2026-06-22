package com.luxeway.config;

import com.luxeway.service.SeedingService;
import com.luxeway.service.NotificationHubService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class SeedingRunner implements CommandLineRunner {

    private final SeedingService seedingService;
    private final NotificationHubService notificationHubService;

    @Override
    public void run(String... args) {
        log.info("Running LuxeWay enterprise data seeder...");
        try {
            notificationHubService.seedTemplates();
            seedingService.seedAll();
            log.info("Successfully finished data seeding runner.");
        } catch (Exception e) {
            log.error("Error running data seeding: {}", e.getMessage(), e);
        }
    }
}
