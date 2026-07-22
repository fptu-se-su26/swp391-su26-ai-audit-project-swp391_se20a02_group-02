package com.luxeway.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DatabaseMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("Running custom database migrations...");

        // Reset corrupt database diacritics (e.g., C?n Tho or Mu B?O Hi?M) to force fresh clean English seeding
        try {
            boolean needsReset = false;
            try {
                Integer countCity = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM vehicles WHERE city LIKE '%?%'", Integer.class);
                if (countCity != null && countCity > 0) {
                    needsReset = true;
                }
            } catch (Exception e) {}
            
            try {
                Integer countFeature = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM vehicle_features WHERE name LIKE '%?%'", Integer.class);
                if (countFeature != null && countFeature > 0) {
                    needsReset = true;
                }
            } catch (Exception e) {}

            if (needsReset) {
                log.info("Detected encoding errors or question marks in database values. Performing database tables cleanup for fresh English seeding...");
                String[] tables = {
                    "booking_payments", "payments", "bookings", "vehicle_reviews", "reviews", 
                    "vehicle_features", "vehicle_images", "vehicle_translations", "employee_vehicle_assignments",
                    "employees", "invoices", "messages", "conversation_participants", "conversations",
                    "vehicles", "owner_verifications", "owner_ratings", "owners", "users"
                };
                for (String table : tables) {
                    try {
                        jdbcTemplate.execute("DELETE FROM " + table);
                    } catch (Exception ex) {
                        log.debug("Could not delete from table " + table + ": " + ex.getMessage());
                    }
                }
                log.info("Database cleanup completed successfully.");
            }
        } catch (Exception e) {
            log.error("Failed database diacritics reset check: {}", e.getMessage());
        }

        // Programmatically run sample data seeding if database is empty
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users'", Integer.class);
            if (count != null && count > 0) {
                Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE email = 'admin@luxeway.vn'", Integer.class);
                if (userCount == null || userCount == 0) {
                    log.info("No sample data detected. Seeding database using import-data.sql...");
                    ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
                        new ClassPathResource("import-data.sql")
                    );
                    populator.execute(Objects.requireNonNull(jdbcTemplate.getDataSource()));
                    log.info("Database successfully seeded with sample data.");
                } else {
                    log.info("Sample data already exists. Skipping import-data.sql seeding.");
                }
            } else {
                log.warn("users table does not exist yet! Skipping import-data.sql seeding.");
            }
        } catch (Exception e) {
            log.error("Failed to seed database using import-data.sql: {}", e.getMessage(), e);
        }

        if ("true".equalsIgnoreCase(System.getenv("LUXEWAY_RESET_TEST_PASSWORDS"))) {
            try {
                String demoPasswordHash = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";
                Object[][] demoUsers = new Object[][] {
                    {"admin-user-id-001", "admin@luxeway.vn", "Admin", "LuxeWay", "Admin LuxeWay", "0901234567", "ADMIN", "Ho Chi Minh City", java.math.BigDecimal.ZERO, "B2", "LXW-ADMIN-DEMO"},
                    {"customer-user-id-002", "customer@luxeway.vn", "Customer", "LuxeWay", "Customer LuxeWay", "0901111111", "CUSTOMER", "Hanoi", new java.math.BigDecimal("10000000.00"), "B2", "LXW-CUSTOMER-DEMO"},
                    {"owner-user-id-003", "owner@luxeway.vn", "Owner", "LuxeWay", "Owner LuxeWay", "0904444444", "OWNER", "Ho Chi Minh City", new java.math.BigDecimal("50000000.00"), "B2", "LXW-OWNER-DEMO"}
                };

                int changed = 0;
                for (Object[] user : demoUsers) {
                    String id = (String) user[0];
                    String email = (String) user[1];
                    Integer existing = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM users WHERE email = ?",
                        Integer.class,
                        email
                    );

                    if (existing != null && existing > 0) {
                        changed += jdbcTemplate.update(
                            "UPDATE users SET password_hash = ?, first_name = ?, last_name = ?, display_name = ?, " +
                            "phone = ?, role = ?, location = ?, wallet_balance = ?, is_active = 1, verified = 1, " +
                            "kyc_verified = 1, driving_license_verified = 1, kyc_status = 'VERIFIED', " +
                            "driver_license_status = 'VERIFIED', license_class = ?, license_number = ?, provider = 'LOCAL' WHERE email = ?",
                            demoPasswordHash, user[2], user[3], user[4], user[5], user[6], user[7], user[8], user[9], user[10], email
                        );
                    } else {
                        changed += jdbcTemplate.update(
                            "INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, phone, role, " +
                            "verified, kyc_verified, driving_license_verified, rating, total_reviews, total_rentals, location, " +
                            "account_type, is_active, joined_at, last_active, created_at, updated_at, wallet_balance, " +
                            "kyc_status, driver_license_status, license_class, license_number, provider, preferred_language) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, 5.00, 0, 0, ?, 'INDIVIDUAL', 1, " +
                            "CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, " +
                            "'VERIFIED', 'VERIFIED', ?, ?, 'LOCAL', 'en')",
                            id, email, demoPasswordHash, user[2], user[3], user[4], user[5], user[6], user[7], user[8], user[9], user[10]
                        );
                    }
                }
                log.info("Prepared {} release demo account record(s) with the shared test password.", changed);
            } catch (Exception e) {
                log.warn("Failed to reset release demo account passwords: {}", e.getMessage());
            }
        }

        // Fix CHK_user_docs_type check constraint to include 'SELFIE'
        try {
            jdbcTemplate.execute("IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'CHK_user_docs_type' AND type = 'C') " +
                    "ALTER TABLE user_documents DROP CONSTRAINT CHK_user_docs_type");
            jdbcTemplate.execute("ALTER TABLE user_documents ADD CONSTRAINT CHK_user_docs_type CHECK (document_type IN ('PASSPORT','NATIONAL_ID','DRIVING_LICENSE','INSURANCE','CCCD_FRONT','CCCD_BACK','DRIVER_LICENSE_FRONT','DRIVER_LICENSE_BACK','SELFIE','SELFIE_WITH_ID','INSURANCE_CERTIFICATE'))");
            log.info("Successfully updated CHK_user_docs_type check constraint to include 'SELFIE'");
        } catch (Exception e) {
            log.debug("Failed to alter check constraint (already updated or non-SQL Server environment): {}", e.getMessage());
        }

        updateBookingStatusStorageAndConstraint();
        ensureUserSettingsColumns();
        
        try {
            Integer tablesCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN ('notification_translations', 'disputes')", Integer.class);
            if (tablesCount != null && tablesCount >= 2) {
                log.info("Database is already fully migrated (found notification_translations and disputes tables). Skipping DDL migration scripts to boot faster.");
                return;
            }
        } catch (Exception e) {
            log.debug("Database check failed or tables do not exist yet. Running full DDL migrations.");
        }

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

        // Add provider and provider_id columns to users table
        try {
            jdbcTemplate.execute("ALTER TABLE users ADD provider NVARCHAR(20) NOT NULL DEFAULT 'LOCAL'");
            log.info("Successfully added provider column to users table (SQL Server)");
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL'");
                log.info("Successfully added provider column to users table (Standard)");
            } catch (Exception ex) {
                log.info("provider column already exists or alter failed: {}", ex.getMessage());
            }
        }

        try {
            jdbcTemplate.execute("ALTER TABLE users ADD provider_id NVARCHAR(200) NULL");
            log.info("Successfully added provider_id column to users table (SQL Server)");
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN provider_id VARCHAR(200) NULL");
                log.info("Successfully added provider_id column to users table (Standard)");
            } catch (Exception ex) {
                log.info("provider_id column already exists or alter failed: {}", ex.getMessage());
            }
        }

        ensureUserSettingsColumns();

        addNullableColumn("user_documents", "license_class", "NVARCHAR(10)", "VARCHAR(10)");
        addNullableColumn("user_documents", "license_number", "NVARCHAR(50)", "VARCHAR(50)");
        addNullableColumn("user_documents", "license_full_name", "NVARCHAR(200)", "VARCHAR(200)");
        addNullableColumn("user_documents", "license_date_of_birth", "NVARCHAR(50)", "VARCHAR(50)");
        addNullableColumn("user_documents", "license_residence", "NVARCHAR(500)", "VARCHAR(500)");
        addNullableColumn("user_documents", "license_nationality", "NVARCHAR(100)", "VARCHAR(100)");

        // CREATE TABLE: owners
        try {
            jdbcTemplate.execute("IF OBJECT_ID('owners', 'U') IS NULL " +
                    "BEGIN " +
                    "    CREATE TABLE owners (" +
                    "        owner_id NVARCHAR(36) PRIMARY KEY, " +
                    "        bio NVARCHAR(MAX) NULL, " +
                    "        account_type NVARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL', " +
                    "        company_name NVARCHAR(200) NULL, " +
                    "        stripe_account_id NVARCHAR(100) NULL, " +
                    "        wallet_balance DECIMAL(18,2) NOT NULL DEFAULT 0.00, " +
                    "        is_active BIT NOT NULL DEFAULT 1, " +
                    "        created_at DATETIME2 NOT NULL DEFAULT GETDATE(), " +
                    "        updated_at DATETIME2 NULL, " +
                    "        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE" +
                    "    ); " +
                    "END");
            log.info("Successfully created table: owners");
        } catch (Exception e) {
            log.debug("owners table creation failed or already exists: {}", e.getMessage());
            try {
                // Fallback for MySQL/H2
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS owners (" +
                        "owner_id VARCHAR(36) PRIMARY KEY, " +
                        "bio TEXT NULL, " +
                        "account_type VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL', " +
                        "company_name VARCHAR(200) NULL, " +
                        "stripe_account_id VARCHAR(100) NULL, " +
                        "wallet_balance DECIMAL(18,2) NOT NULL DEFAULT 0.00, " +
                        "is_active BOOLEAN NOT NULL DEFAULT TRUE, " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                        "updated_at TIMESTAMP NULL, " +
                        "FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE" +
                        ")");
                log.info("Successfully created table: owners (Standard)");
            } catch (Exception ex) {
                log.error("Failed to create owners table: {}", ex.getMessage());
            }
        }

        // CREATE TABLE: owner_ratings
        try {
            jdbcTemplate.execute("IF OBJECT_ID('owner_ratings', 'U') IS NULL " +
                    "BEGIN " +
                    "    CREATE TABLE owner_ratings (" +
                    "        owner_id NVARCHAR(36) PRIMARY KEY, " +
                    "        avg_rating DECIMAL(3,2) NOT NULL DEFAULT 5.00, " +
                    "        total_reviews INT NOT NULL DEFAULT 0, " +
                    "        response_rate DECIMAL(5,2) NOT NULL DEFAULT 100.00, " +
                    "        avg_response_time_minutes INT NOT NULL DEFAULT 15, " +
                    "        FOREIGN KEY (owner_id) REFERENCES owners(owner_id) ON DELETE CASCADE" +
                    "    ); " +
                    "END");
            log.info("Successfully created table: owner_ratings");
        } catch (Exception e) {
            log.debug("owner_ratings table creation failed or already exists: {}", e.getMessage());
            try {
                // Fallback for MySQL/H2
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS owner_ratings (" +
                        "owner_id VARCHAR(36) PRIMARY KEY, " +
                        "avg_rating DECIMAL(3,2) NOT NULL DEFAULT 5.00, " +
                        "total_reviews INT NOT NULL DEFAULT 0, " +
                        "response_rate DECIMAL(5,2) NOT NULL DEFAULT 100.00, " +
                        "avg_response_time_minutes INT NOT NULL DEFAULT 15, " +
                        "FOREIGN KEY (owner_id) REFERENCES owners(owner_id) ON DELETE CASCADE" +
                        ")");
                log.info("Successfully created table: owner_ratings (Standard)");
            } catch (Exception ex) {
                log.error("Failed to create owner_ratings table: {}", ex.getMessage());
            }
        }

        // CREATE TABLE: owner_verifications
        try {
            jdbcTemplate.execute("IF OBJECT_ID('owner_verifications', 'U') IS NULL " +
                    "BEGIN " +
                    "    CREATE TABLE owner_verifications (" +
                    "        id NVARCHAR(36) PRIMARY KEY, " +
                    "        owner_id NVARCHAR(36) NOT NULL, " +
                    "        document_type NVARCHAR(50) NOT NULL, " +
                    "        document_number NVARCHAR(100) NOT NULL, " +
                    "        document_image_url NVARCHAR(500) NOT NULL, " +
                    "        status NVARCHAR(20) NOT NULL DEFAULT 'PENDING', " +
                    "        reviewer_comment NVARCHAR(500) NULL, " +
                    "        verified_at DATETIME2 NULL, " +
                    "        created_at DATETIME2 NOT NULL DEFAULT GETDATE(), " +
                    "        FOREIGN KEY (owner_id) REFERENCES owners(owner_id) ON DELETE CASCADE" +
                    "    ); " +
                    "END");
            log.info("Successfully created table: owner_verifications");
        } catch (Exception e) {
            log.debug("owner_verifications table creation failed or already exists: {}", e.getMessage());
            try {
                // Fallback for MySQL/H2
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS owner_verifications (" +
                        "id VARCHAR(36) PRIMARY KEY, " +
                        "owner_id VARCHAR(36) NOT NULL, " +
                        "document_type VARCHAR(50) NOT NULL, " +
                        "document_number VARCHAR(100) NOT NULL, " +
                        "document_image_url VARCHAR(500) NOT NULL, " +
                        "status VARCHAR(20) NOT NULL DEFAULT 'PENDING', " +
                        "reviewer_comment VARCHAR(500) NULL, " +
                        "verified_at TIMESTAMP NULL, " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                        "FOREIGN KEY (owner_id) REFERENCES owners(owner_id) ON DELETE CASCADE" +
                        ")");
                log.info("Successfully created table: owner_verifications (Standard)");
            } catch (Exception ex) {
                log.error("Failed to create owner_verifications table: {}", ex.getMessage());
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
            // If the table exists but doesn't have the record_date column (old schema), drop it
            jdbcTemplate.execute("IF OBJECT_ID('analytics', 'U') IS NOT NULL AND COL_LENGTH('analytics', 'record_date') IS NULL DROP TABLE analytics");
        } catch (Exception e) {
            log.warn("Failed to check/drop old analytics table: {}", e.getMessage());
        }

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

        try {
            jdbcTemplate.execute("ALTER TABLE system_settings ADD setting_key NVARCHAR(100)");
        } catch (Exception e) {
            log.debug("system_settings.setting_key already exists or cannot be added: {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute("UPDATE system_settings SET setting_key = key_name WHERE setting_key IS NULL AND key_name IS NOT NULL");
        } catch (Exception e) {
            log.debug("No legacy key_name column to migrate in system_settings: {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute("ALTER TABLE system_settings ADD setting_value NVARCHAR(MAX)");
        } catch (Exception e) {
            log.debug("system_settings.setting_value already exists or cannot be added: {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute("UPDATE system_settings SET setting_value = \"value\" WHERE setting_value IS NULL AND \"value\" IS NOT NULL");
        } catch (Exception e) {
            log.debug("No legacy value column to migrate in system_settings: {}", e.getMessage());
        }

        // CREATE TABLE: destination_analytics
        try {
            jdbcTemplate.execute("IF OBJECT_ID('destination_analytics', 'U') IS NULL " +
                    "BEGIN " +
                    "    CREATE TABLE destination_analytics (" +
                    "        city NVARCHAR(100) PRIMARY KEY, " +
                    "        vehicle_count INT NOT NULL DEFAULT 0, " +
                    "        average_price BIGINT NOT NULL DEFAULT 0, " +
                    "        top_category NVARCHAR(50) NOT NULL DEFAULT 'economy', " +
                    "        image_url NVARCHAR(500) NULL, " +
                    "        display_order INT NOT NULL DEFAULT 0, " +
                    "        active BIT NOT NULL DEFAULT 1" +
                    "    ); " +
                    "END");
            log.info("Successfully created table: destination_analytics");

            // Seed default destinations
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM destination_analytics", Integer.class);
            if (count == null || count == 0) {
                jdbcTemplate.execute("INSERT INTO destination_analytics (city, vehicle_count, average_price, top_category, image_url, display_order, active) VALUES " +
                        "('Ho Chi Minh', 240, 750000, 'suv', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop', 1, 1), " +
                        "('Ha Noi', 186, 650000, 'economy', 'https://images.unsplash.com/photo-1509060464153-44667396260f?q=80&w=800&auto=format&fit=crop', 2, 1), " +
                        "('Da Nang', 94, 700000, 'motorbike', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop', 3, 1), " +
                        "('Nha Trang', 120, 600000, 'family', 'https://images.unsplash.com/photo-1571508601936-6ca847b47ae4?q=80&w=800&auto=format&fit=crop', 4, 1), " +
                        "('Da Lat', 158, 580000, 'motorbike', 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=800&auto=format&fit=crop', 5, 1), " +
                        "('Hue', 85, 520000, 'economy', 'https://images.unsplash.com/photo-1571005471113-94993ec92454?q=80&w=800&auto=format&fit=crop', 6, 1)");
                log.info("Successfully seeded default destination_analytics");
            } else {
                // Migrate existing records to correct URLs if they contain the old placeholder photos
                try {
                    jdbcTemplate.execute("UPDATE destination_analytics SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop' WHERE city = 'Da Nang' AND (image_url LIKE '%photo-1518684079%' OR image_url IS NULL)");
                    jdbcTemplate.execute("UPDATE destination_analytics SET image_url = 'https://images.unsplash.com/photo-1571508601936-6ca847b47ae4?q=80&w=800&auto=format&fit=crop' WHERE city = 'Nha Trang' AND (image_url LIKE '%photo-1506966953%' OR image_url IS NULL)");
                    jdbcTemplate.execute("UPDATE destination_analytics SET image_url = 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=800&auto=format&fit=crop' WHERE city = 'Da Lat' AND (image_url LIKE '%photo-1580655653885%' OR image_url IS NULL)");
                    jdbcTemplate.execute("UPDATE destination_analytics SET image_url = 'https://images.unsplash.com/photo-1571005471113-94993ec92454?q=80&w=800&auto=format&fit=crop' WHERE city = 'Hue' AND (image_url LIKE '%photo-1560969184%' OR image_url IS NULL)");
                    log.info("Successfully updated destination image URLs to premium Vietnamese locations in DB");
                } catch (Exception e) {
                    log.warn("Migration of destination image URLs failed: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.debug("destination_analytics table creation or seeding failed: {}", e.getMessage());
            try {
                // Standard SQL fallback for MySQL/H2
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS destination_analytics (" +
                        "city VARCHAR(100) PRIMARY KEY, " +
                        "vehicle_count INT NOT NULL DEFAULT 0, " +
                        "average_price BIGINT NOT NULL DEFAULT 0, " +
                        "top_category VARCHAR(50) NOT NULL DEFAULT 'economy', " +
                        "image_url VARCHAR(500) NULL, " +
                        "display_order INT NOT NULL DEFAULT 0, " +
                        "active BOOLEAN NOT NULL DEFAULT TRUE" +
                        ")");
                log.info("Successfully created table: destination_analytics (Standard)");
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM destination_analytics", Integer.class);
                if (count == null || count == 0) {
                    jdbcTemplate.execute("INSERT INTO destination_analytics (city, vehicle_count, average_price, top_category, image_url, display_order, active) VALUES " +
                            "('Ho Chi Minh', 240, 750000, 'suv', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop', 1, true), " +
                            "('Ha Noi', 186, 650000, 'economy', 'https://images.unsplash.com/photo-1509060464153-44667396260f?q=80&w=800&auto=format&fit=crop', 2, true), " +
                            "('Da Nang', 94, 700000, 'motorbike', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop', 3, true), " +
                            "('Nha Trang', 120, 600000, 'family', 'https://images.unsplash.com/photo-1571508601936-6ca847b47ae4?q=80&w=800&auto=format&fit=crop', 4, true), " +
                            "('Da Lat', 158, 580000, 'motorbike', 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=800&auto=format&fit=crop', 5, true), " +
                            "('Hue', 85, 520000, 'economy', 'https://images.unsplash.com/photo-1571005471113-94993ec92454?q=80&w=800&auto=format&fit=crop', 6, true)");
                    log.info("Successfully seeded default destination_analytics (Standard)");
                }
            } catch (Exception ex) {
                log.error("Failed to create destination_analytics table: {}", ex.getMessage());
            }
        }

        // CREATE TABLE: promotions
        try {
            jdbcTemplate.execute("IF OBJECT_ID('promotions', 'U') IS NULL " +
                    "BEGIN " +
                    "    CREATE TABLE promotions (" +
                    "        id NVARCHAR(36) PRIMARY KEY, " +
                    "        title NVARCHAR(255) NOT NULL, " +
                    "        description NVARCHAR(MAX) NULL, " +
                    "        image_url NVARCHAR(500) NULL, " +
                    "        discount_percent INT NOT NULL DEFAULT 0, " +
                    "        badge_text NVARCHAR(100) NULL, " +
                    "        cta_text NVARCHAR(100) NOT NULL DEFAULT 'Book Now', " +
                    "        cta_url NVARCHAR(500) NOT NULL DEFAULT '/marketplace', " +
                    "        start_date DATETIME2 NULL, " +
                    "        end_date DATETIME2 NULL, " +
                    "        active BIT NOT NULL DEFAULT 1, " +
                    "        display_order INT NOT NULL DEFAULT 0, " +
                    "        created_at DATETIME2 NOT NULL DEFAULT GETDATE()" +
                    "    ); " +
                    "END");
            log.info("Successfully created table: promotions");

            // Seed default promotions
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM promotions", Integer.class);
            if (count == null || count == 0) {
                jdbcTemplate.execute("INSERT INTO promotions (id, title, description, image_url, discount_percent, badge_text, cta_text, cta_url, active, display_order) VALUES " +
                        "('P1', 'Summer Getaway', 'Save up to 15% on all SUV bookings this summer!', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop', 15, 'Summer Deal', 'Rent Now', '/marketplace?category=SUV', 1, 1), " +
                        "('P2', 'Electric Revolution', 'Go green! Get 10% off on Tesla and other electric vehicles.', 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop', 10, 'Eco Friendly', 'Explore', '/marketplace?category=ELECTRIC', 1, 2)");
                log.info("Successfully seeded default promotions");
            }
        } catch (Exception e) {
            log.debug("promotions table creation or seeding failed: {}", e.getMessage());
            try {
                // Standard SQL fallback for MySQL/H2
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS promotions (" +
                        "id VARCHAR(36) PRIMARY KEY, " +
                        "title VARCHAR(255) NOT NULL, " +
                        "description TEXT NULL, " +
                        "image_url VARCHAR(500) NULL, " +
                        "discount_percent INT NOT NULL DEFAULT 0, " +
                        "badge_text VARCHAR(100) NULL, " +
                        "cta_text VARCHAR(100) NOT NULL DEFAULT 'Book Now', " +
                        "cta_url VARCHAR(500) NOT NULL DEFAULT '/marketplace', " +
                        "start_date TIMESTAMP NULL, " +
                        "end_date TIMESTAMP NULL, " +
                        "active BOOLEAN NOT NULL DEFAULT TRUE, " +
                        "display_order INT NOT NULL DEFAULT 0, " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                        ")");
                log.info("Successfully created table: promotions (Standard)");
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM promotions", Integer.class);
                if (count == null || count == 0) {
                    jdbcTemplate.execute("INSERT INTO promotions (id, title, description, image_url, discount_percent, badge_text, cta_text, cta_url, active, display_order) VALUES " +
                            "('P1', 'Summer Getaway', 'Save up to 15% on all SUV bookings this summer!', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop', 15, 'Summer Deal', 'Rent Now', '/marketplace?category=SUV', true, 1), " +
                            "('P2', 'Electric Revolution', 'Go green! Get 10% off on Tesla and other electric vehicles.', 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop', 10, 'Eco Friendly', 'Explore', '/marketplace?category=ELECTRIC', true, 2)");
                    log.info("Successfully seeded default promotions (Standard)");
                }
            } catch (Exception ex) {
                log.error("Failed to create promotions table: {}", ex.getMessage());
            }
        }

        // ====== 6. MULTILINGUAL TRANSLATION TABLES & INDEXES ======
        // preferred_language check on users
        try {
            jdbcTemplate.execute("ALTER TABLE users ADD preferred_language NVARCHAR(10) NULL DEFAULT 'en'");
            log.info("Successfully checked/added preferred_language to users table (SQL Server)");
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN preferred_language VARCHAR(10) NULL DEFAULT 'en'");
                log.info("Successfully checked/added preferred_language to users table (Standard)");
            } catch (Exception ex) {
                log.debug("preferred_language column already exists or alter failed: {}", ex.getMessage());
            }
        }

        // vehicle_translations
        try {
            jdbcTemplate.execute("IF OBJECT_ID('vehicle_translations', 'U') IS NULL " +
                    "BEGIN " +
                    "    CREATE TABLE vehicle_translations (" +
                    "        id NVARCHAR(36) PRIMARY KEY, " +
                    "        vehicle_id NVARCHAR(36) NOT NULL, " +
                    "        language_code NVARCHAR(10) NOT NULL, " +
                    "        name NVARCHAR(200) NOT NULL, " +
                    "        description NVARCHAR(MAX) NULL, " +
                    "        city NVARCHAR(100) NULL, " +
                    "        address NVARCHAR(MAX) NULL, " +
                    "        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE, " +
                    "        CONSTRAINT UQ_vehicle_translations UNIQUE (vehicle_id, language_code)" +
                    "    ); " +
                    "    CREATE INDEX IX_vehicle_language ON vehicle_translations (vehicle_id, language_code); " +
                    "END");
            log.info("Successfully created table: vehicle_translations");
        } catch (Exception e) {
            log.debug("vehicle_translations table creation failed or already exists: {}", e.getMessage());
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS vehicle_translations (" +
                        "id VARCHAR(36) PRIMARY KEY, " +
                        "vehicle_id VARCHAR(36) NOT NULL, " +
                        "language_code VARCHAR(10) NOT NULL, " +
                        "name VARCHAR(200) NOT NULL, " +
                        "description TEXT NULL, " +
                        "city VARCHAR(100) NULL, " +
                        "address TEXT NULL, " +
                        "FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE, " +
                        "UNIQUE (vehicle_id, language_code)" +
                        ")");
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS IX_vehicle_language ON vehicle_translations (vehicle_id, language_code)");
                log.info("Successfully created table: vehicle_translations (Standard)");
            } catch (Exception ex) {
                log.error("Failed to create vehicle_translations table: {}", ex.getMessage());
            }
        }

        // car_translations
        try {
            jdbcTemplate.execute("IF OBJECT_ID('car_translations', 'U') IS NULL " +
                    "BEGIN " +
                    "    CREATE TABLE car_translations (" +
                    "        id NVARCHAR(36) PRIMARY KEY, " +
                    "        car_id NVARCHAR(36) NOT NULL, " +
                    "        language_code NVARCHAR(10) NOT NULL, " +
                    "        name NVARCHAR(200) NOT NULL, " +
                    "        description NVARCHAR(MAX) NULL, " +
                    "        FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE, " +
                    "        CONSTRAINT UQ_car_translations UNIQUE (car_id, language_code)" +
                    "    ); " +
                    "    CREATE INDEX IX_car_language ON car_translations (car_id, language_code); " +
                    "END");
            log.info("Successfully created table: car_translations");
        } catch (Exception e) {
            log.debug("car_translations table creation failed or already exists: {}", e.getMessage());
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS car_translations (" +
                        "id VARCHAR(36) PRIMARY KEY, " +
                        "car_id VARCHAR(36) NOT NULL, " +
                        "language_code VARCHAR(10) NOT NULL, " +
                        "name VARCHAR(200) NOT NULL, " +
                        "description TEXT NULL, " +
                        "FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE, " +
                        "UNIQUE (car_id, language_code)" +
                        ")");
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS IX_car_language ON car_translations (car_id, language_code)");
                log.info("Successfully created table: car_translations (Standard)");
            } catch (Exception ex) {
                log.error("Failed to create car_translations table: {}", ex.getMessage());
            }
        }

        // motorbike_translations
        try {
            jdbcTemplate.execute("IF OBJECT_ID('motorbike_translations', 'U') IS NULL " +
                    "BEGIN " +
                    "    CREATE TABLE motorbike_translations (" +
                    "        id NVARCHAR(36) PRIMARY KEY, " +
                    "        motorbike_id NVARCHAR(36) NOT NULL, " +
                    "        language_code NVARCHAR(10) NOT NULL, " +
                    "        name NVARCHAR(200) NOT NULL, " +
                    "        description NVARCHAR(MAX) NULL, " +
                    "        FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE, " +
                    "        CONSTRAINT UQ_motorbike_translations UNIQUE (motorbike_id, language_code)" +
                    "    ); " +
                    "    CREATE INDEX IX_motorbike_language ON motorbike_translations (motorbike_id, language_code); " +
                    "END");
            log.info("Successfully created table: motorbike_translations");
        } catch (Exception e) {
            log.debug("motorbike_translations table creation failed or already exists: {}", e.getMessage());
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS motorbike_translations (" +
                        "id VARCHAR(36) PRIMARY KEY, " +
                        "motorbike_id VARCHAR(36) NOT NULL, " +
                        "language_code VARCHAR(10) NOT NULL, " +
                        "name VARCHAR(200) NOT NULL, " +
                        "description TEXT NULL, " +
                        "FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE, " +
                        "UNIQUE (motorbike_id, language_code)" +
                        ")");
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS IX_motorbike_language ON motorbike_translations (motorbike_id, language_code)");
                log.info("Successfully created table: motorbike_translations (Standard)");
            } catch (Exception ex) {
                log.error("Failed to create motorbike_translations table: {}", ex.getMessage());
            }
        }

        // review_translations
        try {
            jdbcTemplate.execute("IF OBJECT_ID('review_translations', 'U') IS NULL " +
                    "BEGIN " +
                    "    CREATE TABLE review_translations (" +
                    "        id NVARCHAR(36) PRIMARY KEY, " +
                    "        review_id NVARCHAR(36) NOT NULL, " +
                    "        language_code NVARCHAR(10) NOT NULL, " +
                    "        comment NVARCHAR(MAX) NOT NULL, " +
                    "        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE, " +
                    "        CONSTRAINT UQ_review_translations UNIQUE (review_id, language_code)" +
                    "    ); " +
                    "    CREATE INDEX IX_review_language ON review_translations (review_id, language_code); " +
                    "END");
            log.info("Successfully created table: review_translations");
        } catch (Exception e) {
            log.debug("review_translations table creation failed or already exists: {}", e.getMessage());
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS review_translations (" +
                        "id VARCHAR(36) PRIMARY KEY, " +
                        "review_id VARCHAR(36) NOT NULL, " +
                        "language_code VARCHAR(10) NOT NULL, " +
                        "comment TEXT NOT NULL, " +
                        "FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE, " +
                        "UNIQUE (review_id, language_code)" +
                        ")");
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS IX_review_language ON review_translations (review_id, language_code)");
                log.info("Successfully created table: review_translations (Standard)");
            } catch (Exception ex) {
                log.error("Failed to create review_translations table: {}", ex.getMessage());
            }
        }

        // notification_translations
        try {
            jdbcTemplate.execute("IF OBJECT_ID('notification_translations', 'U') IS NULL " +
                    "BEGIN " +
                    "    CREATE TABLE notification_translations (" +
                    "        id NVARCHAR(36) PRIMARY KEY, " +
                    "        notification_id NVARCHAR(36) NOT NULL, " +
                    "        language_code NVARCHAR(10) NOT NULL, " +
                    "        title NVARCHAR(255) NOT NULL, " +
                    "        body NVARCHAR(MAX) NOT NULL, " +
                    "        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE, " +
                    "        CONSTRAINT UQ_notification_translations UNIQUE (notification_id, language_code)" +
                    "    ); " +
                    "    CREATE INDEX IX_notification_language ON notification_translations (notification_id, language_code); " +
                    "END");
            log.info("Successfully created table: notification_translations");
        } catch (Exception e) {
            log.debug("notification_translations table creation failed or already exists: {}", e.getMessage());
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS notification_translations (" +
                        "id VARCHAR(36) PRIMARY KEY, " +
                        "notification_id VARCHAR(36) NOT NULL, " +
                        "language_code VARCHAR(10) NOT NULL, " +
                        "title VARCHAR(255) NOT NULL, " +
                        "body TEXT NOT NULL, " +
                        "FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE, " +
                        "UNIQUE (notification_id, language_code)" +
                        ")");
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS IX_notification_language ON notification_translations (notification_id, language_code)");
                log.info("Successfully created table: notification_translations (Standard)");
            } catch (Exception ex) {
                log.error("Failed to create notification_translations table: {}", ex.getMessage());
            }
        }
        
        // ====== 7. ENTERPRISE SCHEMA MIGRATIONS (PHASES 1-10) ======
        try {
            String sqlContent = null;
            java.io.File file = new java.io.File("src/Back_end/src/main/resources/schema-enterprise.sql");
            if (file.exists()) {
                log.info("Loading schema-enterprise.sql from file system...");
                sqlContent = new String(java.nio.file.Files.readAllBytes(file.toPath()), java.nio.charset.StandardCharsets.UTF_8);
            } else {
                log.info("Loading schema-enterprise.sql from classpath...");
                org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource("schema-enterprise.sql");
                if (resource.exists()) {
                    byte[] data = org.springframework.util.FileCopyUtils.copyToByteArray(resource.getInputStream());
                    sqlContent = new String(data, java.nio.charset.StandardCharsets.UTF_8);
                }
            }

            if (sqlContent != null) {
                // Split by double newlines or run as blocks
                String[] blocks = sqlContent.split("(?:\r?\n){2,}");
                for (String block : blocks) {
                    block = block.trim();
                    while (block.startsWith("--")) {
                        int nextNewLine = block.indexOf('\n');
                        if (nextNewLine == -1) {
                            block = "";
                            break;
                        }
                        block = block.substring(nextNewLine + 1).trim();
                    }
                    if (!block.isEmpty()) {
                        try {
                            jdbcTemplate.execute(block);
                        } catch (Exception ex) {
                            log.warn("Error executing migration block: {} - Error: {}", 
                                     block.substring(0, Math.min(block.length(), 60)) + "...", ex.getMessage());
                        }
                    }
                }
                log.info("Successfully completed schema-enterprise.sql database migration.");
            } else {
                log.warn("schema-enterprise.sql not found!");
            }
        } catch (Exception e) {
            log.error("Error running schema-enterprise.sql: {}", e.getMessage(), e);
        }

        // CREATE TABLE: booking_counters
        try {
            jdbcTemplate.execute("CREATE TABLE booking_counters (" +
                    "name NVARCHAR(50) NOT NULL PRIMARY KEY, " +
                    "counter_value BIGINT NOT NULL)");
            log.info("Successfully created table: booking_counters");
        } catch (Exception e) {
            log.debug("booking_counters table already exists: {}", e.getMessage());
        }

        // Seed initial counter value if not present
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM booking_counters WHERE name = 'bookings'", Integer.class);
            if (count == null || count == 0) {
                jdbcTemplate.execute("INSERT INTO booking_counters (name, counter_value) VALUES ('bookings', 100000)");
                log.info("Successfully seeded table: booking_counters");
            }
        } catch (Exception e) {
            log.warn("Failed to seed booking_counters: {}", e.getMessage());
        }

        // CREATE TABLE: payment_settings
        try {
            jdbcTemplate.execute("CREATE TABLE payment_settings (" +
                    "id NVARCHAR(36) NOT NULL PRIMARY KEY, " +
                    "bank_name NVARCHAR(100) NOT NULL, " +
                    "account_number NVARCHAR(100) NOT NULL, " +
                    "owner_name NVARCHAR(100) NOT NULL, " +
                    "enabled BIT NOT NULL DEFAULT 1, " +
                    "version INT NOT NULL DEFAULT 1, " +
                    "updated_by NVARCHAR(100) NULL, " +
                    "updated_time DATETIME2 NOT NULL DEFAULT GETDATE())");
            log.info("Successfully created table: payment_settings");
        } catch (Exception e) {
            log.debug("payment_settings table already exists: {}", e.getMessage());
        }

        // Seed initial payment setting if not present
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM payment_settings WHERE id = 'P1'", Integer.class);
            if (count == null || count == 0) {
                jdbcTemplate.execute("INSERT INTO payment_settings (id, bank_name, account_number, owner_name, enabled, version, updated_by, updated_time) " +
                        "VALUES ('P1', 'MB Bank', '0377096245', 'NGUYEN VAN DANG', 1, 1, 'SYSTEM', GETDATE())");
                log.info("Successfully seeded table: payment_settings");
            }
        } catch (Exception e) {
            log.warn("Failed to seed payment_settings: {}", e.getMessage());
        }

        // Add columns to bookings
        addNullableColumn("bookings", "booking_code", "NVARCHAR(50)", "VARCHAR(50)");
        addNullableColumn("bookings", "cleaning_fee", "DECIMAL(12,0) NOT NULL DEFAULT 0", "DECIMAL(12,0) NOT NULL DEFAULT 0");
        addNullableColumn("bookings", "version", "INT NOT NULL DEFAULT 0", "INT NOT NULL DEFAULT 0");

        // Add unique index on booking_code
        try {
            jdbcTemplate.execute("CREATE UNIQUE INDEX UQ_bookings_booking_code ON bookings (booking_code) WHERE booking_code IS NOT NULL");
            log.info("Successfully created index: UQ_bookings_booking_code");
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("CREATE UNIQUE INDEX UQ_bookings_booking_code ON bookings (booking_code)");
            } catch (Exception ignore) {}
        }

        // Add columns to payments
        addNullableColumn("payments", "verified_by", "NVARCHAR(100)", "VARCHAR(100)");
        addNullableColumn("payments", "verified_time", "DATETIME2", "TIMESTAMP");
        addNullableColumn("payments", "rejected_reason", "NVARCHAR(500)", "VARCHAR(500)");
        addNullableColumn("payments", "transfer_content", "NVARCHAR(100)", "VARCHAR(100)");
    }

    private void updateBookingStatusStorageAndConstraint() {
        try {
            try {
                jdbcTemplate.execute("IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'CHK_bookings_status' AND type = 'C') " +
                        "ALTER TABLE bookings DROP CONSTRAINT CHK_bookings_status");
            } catch (Exception ex) {
                try {
                    jdbcTemplate.execute("ALTER TABLE bookings DROP CONSTRAINT CHK_bookings_status");
                } catch (Exception ignore) {}
            }
            dropH2BookingStatusCheckConstraints();

            alterStatusColumnLength("bookings");
            alterStatusColumnLength("car_bookings");
            alterStatusColumnLength("motorbike_bookings");

            jdbcTemplate.execute("ALTER TABLE bookings ADD CONSTRAINT CHK_bookings_status CHECK (status IN (" +
                    "'PENDING', 'CONFIRMED', 'PICKING_UP', 'IN_PROGRESS', 'ACTIVE', 'DISPUTED', " +
                    "'CANCELLED', " +
                    "'DRAFT', 'WAITING_PAYMENT', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED', " +
                    "'OWNER_APPROVED', 'READY_FOR_PICKUP', 'CHECKED_OUT', 'IN_RENTAL', " +
                    "'RETURN_PENDING', 'RETURN_COMPLETED', 'COMPLETED', 'PAYMENT_EXPIRED', " +
                    "'PAYMENT_REJECTED', 'CANCELLATION_REQUESTED', 'CUSTOMER_CANCELLED', " +
                    "'OWNER_CANCELLED', 'SYSTEM_CANCELLED'))");
            log.info("Successfully updated booking status storage and CHK_bookings_status constraint");
        } catch (Exception e) {
            log.warn("Failed to update booking status storage/check constraint: {}", e.getMessage());
        }
    }

    private void dropH2BookingStatusCheckConstraints() {
        try {
            List<Map<String, Object>> constraints = jdbcTemplate.queryForList(
                    "SELECT tc.CONSTRAINT_NAME " +
                    "FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc " +
                    "JOIN INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc " +
                    "ON tc.CONSTRAINT_CATALOG = cc.CONSTRAINT_CATALOG " +
                    "AND tc.CONSTRAINT_SCHEMA = cc.CONSTRAINT_SCHEMA " +
                    "AND tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME " +
                    "WHERE UPPER(tc.TABLE_NAME) = 'BOOKINGS' " +
                    "AND UPPER(tc.CONSTRAINT_TYPE) = 'CHECK' " +
                    "AND UPPER(cc.CHECK_CLAUSE) LIKE '%STATUS%'"
            );

            for (Map<String, Object> row : constraints) {
                Object rawName = row.get("CONSTRAINT_NAME");
                if (rawName == null) continue;
                String constraintName = rawName.toString();
                jdbcTemplate.execute("ALTER TABLE bookings DROP CONSTRAINT " + constraintName);
                log.info("Dropped H2 booking status check constraint: {}", constraintName);
            }
        } catch (Exception e) {
            log.debug("Could not inspect/drop H2 booking status constraints: {}", e.getMessage());
            try {
                jdbcTemplate.execute("ALTER TABLE bookings DROP CONSTRAINT CONSTRAINT_A");
                log.info("Dropped fallback H2 booking status check constraint: CONSTRAINT_A");
            } catch (Exception ignore) {}
        }
    }

    private void alterStatusColumnLength(String tableName) {
        try {
            jdbcTemplate.execute("ALTER TABLE " + tableName + " ALTER COLUMN status NVARCHAR(32) NOT NULL");
            log.info("Widened {}.status to NVARCHAR(32)", tableName);
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("ALTER TABLE " + tableName + " ALTER COLUMN status VARCHAR(32) NOT NULL");
                log.info("Widened {}.status to VARCHAR(32)", tableName);
            } catch (Exception ex) {
                log.debug("Could not widen {}.status: {}", tableName, ex.getMessage());
            }
        }
    }

    private void ensureUserSettingsColumns() {
        addNullableColumn("users", "preferred_currency", "NVARCHAR(10)", "VARCHAR(10)");
        addNullableColumn("users", "email_booking_notifications", "BIT", "BOOLEAN");
        addNullableColumn("users", "email_review_notifications", "BIT", "BOOLEAN");
        addNullableColumn("users", "email_marketing_notifications", "BIT", "BOOLEAN");
        addNullableColumn("users", "push_notifications", "BIT", "BOOLEAN");
        addNullableColumn("users", "owner_bank_name", "NVARCHAR(120)", "VARCHAR(120)");
        addNullableColumn("users", "owner_bank_account_number", "NVARCHAR(80)", "VARCHAR(80)");
        addNullableColumn("users", "owner_bank_account_holder", "NVARCHAR(160)", "VARCHAR(160)");
        addNullableColumn("users", "owner_payout_enabled", "BIT", "BOOLEAN");
        addNullableColumn("users", "security_two_factor_enabled", "BIT", "BOOLEAN");
        backfillUserDefaults();
    }

    private void backfillUserDefaults() {
        updateNullUserColumn("provider", "'LOCAL'");
        updateNullUserColumn("account_type", "'INDIVIDUAL'");
        updateNullUserColumn("preferred_language", "'en'");
        updateNullUserColumn("preferred_currency", "'VND'");
        updateNullUserColumn("kyc_status", "'NOT_UPLOADED'");
        updateNullUserColumn("driver_license_status", "'NOT_UPLOADED'");
        updateNullUserColumn("verified", "0");
        updateNullUserColumn("kyc_verified", "0");
        updateNullUserColumn("driving_license_verified", "0");
        updateNullUserColumn("rating", "0");
        updateNullUserColumn("total_reviews", "0");
        updateNullUserColumn("total_rentals", "0");
        updateNullUserColumn("wallet_balance", "0");
        updateNullUserColumn("is_active", "1");
        updateNullUserColumn("email_booking_notifications", "1");
        updateNullUserColumn("email_review_notifications", "1");
        updateNullUserColumn("email_marketing_notifications", "0");
        updateNullUserColumn("push_notifications", "1");
        updateNullUserColumn("owner_payout_enabled", "0");
        updateNullUserColumn("security_two_factor_enabled", "0");
        updateNullUserColumn("joined_at", "CURRENT_TIMESTAMP");
        updateNullUserColumn("created_at", "CURRENT_TIMESTAMP");
        updateNullUserColumn("updated_at", "CURRENT_TIMESTAMP");
        updateNullUserColumn("last_active", "CURRENT_TIMESTAMP");
    }

    private void updateNullUserColumn(String columnName, String sqlValue) {
        try {
            int updated = jdbcTemplate.update("UPDATE users SET " + columnName + " = " + sqlValue + " WHERE " + columnName + " IS NULL");
            if (updated > 0) {
                log.info("Backfilled {} NULL users.{} value(s)", updated, columnName);
            }
        } catch (Exception e) {
            log.debug("Could not backfill users.{}: {}", columnName, e.getMessage());
        }
    }

    private void addNullableColumn(String tableName, String columnName, String sqlServerType, String standardType) {
        try {
            jdbcTemplate.execute("IF COL_LENGTH('" + tableName + "', '" + columnName + "') IS NULL " +
                    "ALTER TABLE " + tableName + " ADD " + columnName + " " + sqlServerType + " NULL");
            log.info("Checked/added column {}.{} (SQL Server)", tableName, columnName);
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + standardType + " NULL");
                log.info("Added column {}.{} (Standard)", tableName, columnName);
            } catch (Exception ex) {
                log.debug("Column {}.{} already exists or alter failed: {}", tableName, columnName, ex.getMessage());
            }
        }
    }
}
