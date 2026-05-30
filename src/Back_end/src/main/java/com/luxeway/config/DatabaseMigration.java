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

        // CREATE TABLE: conversations
        try {
            jdbcTemplate.execute("CREATE TABLE conversations (" +
                    "id NVARCHAR(36) NOT NULL PRIMARY KEY, " +
                    "vehicle_id NVARCHAR(36) NULL, " +
                    "last_activity DATETIME2 NOT NULL, " +
                    "created_at DATETIME2 NOT NULL)");
            log.info("Successfully created table: conversations");
        } catch (Exception e) {
            log.debug("conversations table already exists: {}", e.getMessage());
        }

        // CREATE TABLE: conversation_participants
        try {
            jdbcTemplate.execute("CREATE TABLE conversation_participants (" +
                    "conversation_id NVARCHAR(36) NOT NULL, " +
                    "user_id NVARCHAR(36) NOT NULL, " +
                    "PRIMARY KEY (conversation_id, user_id))");
            log.info("Successfully created table: conversation_participants");
        } catch (Exception e) {
            log.debug("conversation_participants table already exists: {}", e.getMessage());
        }

        // CREATE TABLE: messages
        try {
            jdbcTemplate.execute("CREATE TABLE messages (" +
                    "id NVARCHAR(36) NOT NULL PRIMARY KEY, " +
                    "conversation_id NVARCHAR(36) NOT NULL, " +
                    "sender_id NVARCHAR(36) NOT NULL, " +
                    "receiver_id NVARCHAR(36) NOT NULL, " +
                    "type NVARCHAR(20) NOT NULL DEFAULT 'text', " +
                    "content NVARCHAR(MAX) NOT NULL, " +
                    "is_read BIT NOT NULL DEFAULT 0, " +
                    "created_at DATETIME2 NOT NULL)");
            log.info("Successfully created table: messages");
        } catch (Exception e) {
            log.debug("messages table already exists: {}", e.getMessage());
        }

        // CREATE TABLE: invoices
        try {
            jdbcTemplate.execute("CREATE TABLE invoices (" +
                    "id NVARCHAR(36) NOT NULL PRIMARY KEY, " +
                    "booking_id NVARCHAR(36) NOT NULL UNIQUE, " +
                    "user_id NVARCHAR(36) NOT NULL, " +
                    "invoice_number NVARCHAR(100) NOT NULL UNIQUE, " +
                    "amount DECIMAL(12,2) NOT NULL, " +
                    "tax_amount DECIMAL(12,2) NOT NULL, " +
                    "status NVARCHAR(20) NOT NULL DEFAULT 'UNPAID', " +
                    "created_at DATETIME2 NOT NULL, " +
                    "issued_at DATETIME2 NULL)");
            log.info("Successfully created table: invoices");
        } catch (Exception e) {
            log.debug("invoices table already exists: {}", e.getMessage());
        }

        // CREATE TABLE: employees
        try {
            jdbcTemplate.execute("CREATE TABLE employees (" +
                    "id NVARCHAR(36) NOT NULL PRIMARY KEY, " +
                    "owner_id NVARCHAR(36) NOT NULL, " +
                    "name NVARCHAR(200) NOT NULL, " +
                    "email NVARCHAR(255) NOT NULL, " +
                    "phone NVARCHAR(20) NOT NULL, " +
                    "role NVARCHAR(50) NOT NULL, " +
                    "status NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE', " +
                    "created_at DATETIME2 NOT NULL)");
            log.info("Successfully created table: employees");
        } catch (Exception e) {
            log.debug("employees table already exists: {}", e.getMessage());
        }

        // CREATE TABLE: employee_vehicle_assignments
        try {
            jdbcTemplate.execute("CREATE TABLE employee_vehicle_assignments (" +
                    "employee_id NVARCHAR(36) NOT NULL, " +
                    "vehicle_id NVARCHAR(36) NOT NULL, " +
                    "assigned_at DATETIME2 NOT NULL DEFAULT GETDATE(), " +
                    "PRIMARY KEY (employee_id, vehicle_id))");
            log.info("Successfully created table: employee_vehicle_assignments");
        } catch (Exception e) {
            log.debug("employee_vehicle_assignments table already exists: {}", e.getMessage());
        }

        // Add fallback constraint check if table was already created
        try {
            jdbcTemplate.execute("ALTER TABLE employee_vehicle_assignments ADD CONSTRAINT DF_eva_assigned_at DEFAULT GETDATE() FOR assigned_at");
            log.info("Successfully added default constraint DF_eva_assigned_at");
        } catch (Exception e) {
            log.debug("DF_eva_assigned_at constraint already exists or failed: {}", e.getMessage());
        }

        // CREATE TABLE: analytics
        try {
            jdbcTemplate.execute("CREATE TABLE analytics (" +
                    "id NVARCHAR(36) NOT NULL PRIMARY KEY, " +
                    "record_date DATE NOT NULL UNIQUE, " +
                    "revenue DECIMAL(18,2) NOT NULL DEFAULT 0.00, " +
                    "bookings_count INT NOT NULL DEFAULT 0, " +
                    "active_rentals INT NOT NULL DEFAULT 0, " +
                    "new_users INT NOT NULL DEFAULT 0, " +
                    "new_vehicles INT NOT NULL DEFAULT 0, " +
                    "created_at DATETIME2 NOT NULL DEFAULT GETDATE())");
            log.info("Successfully created table: analytics");
        } catch (Exception e) {
            log.debug("analytics table already exists: {}", e.getMessage());
        }

        // CREATE TABLE: system_settings
        try {
            jdbcTemplate.execute("CREATE TABLE system_settings (" +
                    "id NVARCHAR(36) NOT NULL PRIMARY KEY, " +
                    "setting_key NVARCHAR(100) NOT NULL UNIQUE, " +
                    "setting_value NVARCHAR(MAX) NOT NULL, " +
                    "description NVARCHAR(500) NULL, " +
                    "updated_at DATETIME2 NOT NULL DEFAULT GETDATE())");
            log.info("Successfully created table: system_settings");

            // Seed default settings
            try {
                jdbcTemplate.execute("INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES " +
                        "('S1', 'service_fee_rate', '0.12', 'Platform service fee rate percentage'), " +
                        "('S2', 'tax_rate', '0.08', 'Platform tax rate percentage'), " +
                        "('S3', 'commission_rate', '0.15', 'Owner payout commission rate percentage')");
                log.info("Successfully seeded default system_settings");
            } catch (Exception ex) {
                log.debug("Default settings already seeded or insert failed: {}", ex.getMessage());
            }
        } catch (Exception e) {
            log.debug("system_settings table already exists: {}", e.getMessage());
        }
    }
}
