package com.luxeway.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("Running custom database migrations...");
        try {
            // Alter payments table: booking_id should be NULL (for wallet top-ups)
            jdbcTemplate.execute("ALTER TABLE payments ALTER COLUMN booking_id NVARCHAR(36) NULL");
            log.info("Successfully altered payments table: booking_id is now nullable (SQL Server)");
        } catch (Exception e) {
            log.warn("Failed to alter payments table using SQL Server syntax: {}. Trying standard SQL...", e.getMessage());
            try {
                // Try standard SQL for MySQL / H2
                jdbcTemplate.execute("ALTER TABLE payments MODIFY booking_id VARCHAR(36) NULL");
                log.info("Successfully altered payments table: booking_id is now nullable (Standard)");
            } catch (Exception ex) {
                log.error("Failed to alter payments table: {}", ex.getMessage());
            }
        }
        
        try {
            // Alter users table: add wallet_balance column if not exists
            jdbcTemplate.execute("ALTER TABLE users ADD wallet_balance DECIMAL(18,2) NOT NULL DEFAULT 0.00");
            log.info("Successfully added wallet_balance column to users table (SQL Server)");
        } catch (Exception e) {
            try {
                // Try standard SQL for MySQL / H2
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(18,2) NOT NULL DEFAULT 0.00");
                log.info("Successfully added wallet_balance column to users table (Standard)");
            } catch (Exception ex) {
                log.info("wallet_balance column already exists or alter failed: {}", ex.getMessage());
            }
        }
    }
}
