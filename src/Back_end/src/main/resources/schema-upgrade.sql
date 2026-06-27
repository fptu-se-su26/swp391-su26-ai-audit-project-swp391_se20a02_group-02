-- ============================================================
-- LUXEWAY ENTERPRISE DATABASE SCHEMA UPGRADE
-- Target Database: SQL Server
-- ============================================================

-- 1. BASE SYSTEM TABLES (UPGRADED)
IF OBJECT_ID('owners', 'U') IS NULL
BEGIN
    CREATE TABLE owners (
        owner_id NVARCHAR(36) PRIMARY KEY,
        bio NVARCHAR(MAX) NULL,
        account_type NVARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL' CHECK (account_type IN ('INDIVIDUAL', 'BUSINESS')),
        company_name NVARCHAR(200) NULL,
        stripe_account_id NVARCHAR(100) NULL,
        wallet_balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NULL,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );
END

-- 2. OWNER METRICS & VERIFICATIONS
IF OBJECT_ID('owner_verifications', 'U') IS NULL
BEGIN
    CREATE TABLE owner_verifications (
        id NVARCHAR(36) PRIMARY KEY,
        owner_id NVARCHAR(36) NOT NULL,
        document_type NVARCHAR(50) NOT NULL,
        document_number NVARCHAR(100) NOT NULL,
        document_image_url NVARCHAR(500) NOT NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
        reviewer_comment NVARCHAR(500) NULL,
        verified_at DATETIME2 NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (owner_id) REFERENCES owners(owner_id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('owner_ratings', 'U') IS NULL
BEGIN
    CREATE TABLE owner_ratings (
        owner_id NVARCHAR(36) PRIMARY KEY,
        avg_rating DECIMAL(3,2) NOT NULL DEFAULT 5.00,
        total_reviews INT NOT NULL DEFAULT 0,
        response_rate DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        avg_response_time_minutes INT NOT NULL DEFAULT 15,
        FOREIGN KEY (owner_id) REFERENCES owners(owner_id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('owner_analytics', 'U') IS NULL
BEGIN
    CREATE TABLE owner_analytics (
        owner_id NVARCHAR(36) NOT NULL,
        year_month NVARCHAR(7) NOT NULL, -- 'YYYY-MM'
        monthly_revenue DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        completed_bookings INT NOT NULL DEFAULT 0,
        utilization_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        PRIMARY KEY (owner_id, year_month),
        FOREIGN KEY (owner_id) REFERENCES owners(owner_id) ON DELETE CASCADE
    );
END

-- 3. VEHICLE MODIFICATIONS & SPECIFICATIONS
IF OBJECT_ID('vehicle_specifications', 'U') IS NULL
BEGIN
    CREATE TABLE vehicle_specifications (
        vehicle_id NVARCHAR(36) PRIMARY KEY,
        horsepower INT NULL,
        top_speed_kmh INT NULL,
        acceleration_sec DECIMAL(4,2) NULL,
        seats INT NOT NULL DEFAULT 4,
        doors INT NULL,
        transmission NVARCHAR(20) NOT NULL CHECK (transmission IN ('MANUAL', 'AUTOMATIC')),
        fuel_type NVARCHAR(20) NOT NULL CHECK (fuel_type IN ('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID')),
        range_km INT NULL,
        engine_size NVARCHAR(20) NULL,
        color NVARCHAR(50) NULL,
        license_plate NVARCHAR(20) UNIQUE NOT NULL,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('vehicle_locations', 'U') IS NULL
BEGIN
    CREATE TABLE vehicle_locations (
        vehicle_id NVARCHAR(36) PRIMARY KEY,
        city NVARCHAR(100) NOT NULL,
        country NVARCHAR(100) NOT NULL DEFAULT 'Vietnam',
        address NVARCHAR(500) NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        timezone NVARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('vehicle_availability', 'U') IS NULL
BEGIN
    CREATE TABLE vehicle_availability (
        id NVARCHAR(36) PRIMARY KEY,
        vehicle_id NVARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        is_available BIT NOT NULL DEFAULT 1,
        booking_id NVARCHAR(36) NULL,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('vehicle_pricing_rules', 'U') IS NULL
BEGIN
    CREATE TABLE vehicle_pricing_rules (
        id NVARCHAR(36) PRIMARY KEY,
        vehicle_id NVARCHAR(36) NOT NULL,
        rule_type NVARCHAR(20) NOT NULL CHECK (rule_type IN ('WEEKEND', 'HOLIDAY', 'SEASONAL')),
        multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
        start_date DATE NULL,
        end_date DATE NULL,
        name NVARCHAR(100) NULL,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );
END

-- 4. INSURANCE & BOOKING DETAILS
IF OBJECT_ID('insurance_packages', 'U') IS NULL
BEGIN
    CREATE TABLE insurance_packages (
        id NVARCHAR(36) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        provider NVARCHAR(100) NOT NULL,
        cost_per_day DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        coverage_limit DECIMAL(18,2) NOT NULL,
        description NVARCHAR(MAX) NULL,
        is_active BIT NOT NULL DEFAULT 1
    );
END

IF OBJECT_ID('booking_status_history', 'U') IS NULL
BEGIN
    CREATE TABLE booking_status_history (
        id NVARCHAR(36) PRIMARY KEY,
        booking_id NVARCHAR(36) NOT NULL,
        status NVARCHAR(30) NOT NULL,
        comment NVARCHAR(500) NULL,
        changed_by NVARCHAR(36) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('booking_delivery', 'U') IS NULL
BEGIN
    CREATE TABLE booking_delivery (
        booking_id NVARCHAR(36) PRIMARY KEY,
        address NVARCHAR(500) NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        status NVARCHAR(30) NOT NULL CHECK (status IN ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED')),
        delivered_at DATETIME2 NULL,
        returned_at DATETIME2 NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('booking_cancellations', 'U') IS NULL
BEGIN
    CREATE TABLE booking_cancellations (
        booking_id NVARCHAR(36) PRIMARY KEY,
        cancelled_by NVARCHAR(36) NOT NULL,
        reason NVARCHAR(500) NOT NULL,
        refund_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        penalty_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (cancelled_by) REFERENCES users(id)
    );
END

IF OBJECT_ID('insurance_claims', 'U') IS NULL
BEGIN
    CREATE TABLE insurance_claims (
        id NVARCHAR(36) PRIMARY KEY,
        booking_id NVARCHAR(36) NOT NULL,
        package_id NVARCHAR(36) NOT NULL,
        claim_amount DECIMAL(18,2) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        resolved_at DATETIME2 NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (package_id) REFERENCES insurance_packages(id)
    );
END

-- 5. REVIEWS & ANALYTICS TABLES
IF OBJECT_ID('review_images', 'U') IS NULL
BEGIN
    CREATE TABLE review_images (
        id NVARCHAR(36) PRIMARY KEY,
        review_id NVARCHAR(36) NOT NULL,
        image_url NVARCHAR(500) NOT NULL,
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('favorite_vehicles', 'U') IS NULL
BEGIN
    CREATE TABLE favorite_vehicles (
        user_id NVARCHAR(36) NOT NULL,
        vehicle_id NVARCHAR(36) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        PRIMARY KEY (user_id, vehicle_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE NO ACTION
    );
END

IF OBJECT_ID('search_logs', 'U') IS NULL
BEGIN
    CREATE TABLE search_logs (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id NVARCHAR(36) NULL,
        query_string NVARCHAR(255) NULL,
        filter_json NVARCHAR(MAX) NULL,
        searched_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
END

IF OBJECT_ID('vehicle_views', 'U') IS NULL
BEGIN
    CREATE TABLE vehicle_views (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        vehicle_id NVARCHAR(36) NOT NULL,
        viewer_id NVARCHAR(36) NULL,
        viewed_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        ip_address NVARCHAR(45) NULL,
        user_agent NVARCHAR(255) NULL,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE NO ACTION
    );
END
GO

-- 6. VEHICLE REAL-TIME TRACKING & ROUTING UPGRADES
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('vehicles') AND name = 'current_lat')
BEGIN
    ALTER TABLE vehicles ADD current_lat DECIMAL(10,8) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('vehicles') AND name = 'current_lng')
BEGIN
    ALTER TABLE vehicles ADD current_lng DECIMAL(11,8) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('vehicles') AND name = 'last_location_update')
BEGIN
    ALTER TABLE vehicles ADD last_location_update DATETIME2 NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('vehicles') AND name = 'location_status')
BEGIN
    ALTER TABLE vehicles ADD location_status NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('bookings') AND name = 'pickup_lat')
BEGIN
    ALTER TABLE bookings ADD pickup_lat DECIMAL(10,8) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('bookings') AND name = 'pickup_lng')
BEGIN
    ALTER TABLE bookings ADD pickup_lng DECIMAL(11,8) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('bookings') AND name = 'dropoff_lat')
BEGIN
    ALTER TABLE bookings ADD dropoff_lat DECIMAL(10,8) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('bookings') AND name = 'dropoff_lng')
BEGIN
    ALTER TABLE bookings ADD dropoff_lng DECIMAL(11,8) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('bookings') AND name = 'route_distance')
BEGIN
    ALTER TABLE bookings ADD route_distance DECIMAL(10,2) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('bookings') AND name = 'estimated_time')
BEGIN
    ALTER TABLE bookings ADD estimated_time INT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('bookings') AND name = 'route_polyline')
BEGIN
    ALTER TABLE bookings ADD route_polyline NVARCHAR(MAX) NULL;
END
GO

IF OBJECT_ID('vehicle_tracking', 'U') IS NULL
BEGIN
    CREATE TABLE vehicle_tracking (
        id NVARCHAR(36) PRIMARY KEY,
        vehicle_id NVARCHAR(36) NOT NULL,
        booking_id NVARCHAR(36) NULL,
        lat DECIMAL(10,8) NOT NULL,
        lng DECIMAL(11,8) NOT NULL,
        speed DECIMAL(6,2) NULL,
        heading DECIMAL(5,2) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
    );
END
GO

-- 7. TEMPORARY AVAILABILITY LOCKING
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('vehicle_availability') AND name = 'locked_until')
BEGIN
    ALTER TABLE vehicle_availability ADD locked_until DATETIME2 NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('vehicle_availability') AND name = 'locked_by')
BEGIN
    ALTER TABLE vehicle_availability ADD locked_by NVARCHAR(36) NULL;
END
GO

-- 8. AI SUPPORT CHATBOT PERSISTENCE
IF OBJECT_ID('chat_sessions', 'U') IS NULL
BEGIN
    CREATE TABLE chat_sessions (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
END
GO

IF OBJECT_ID('chat_messages', 'U') IS NULL
BEGIN
    CREATE TABLE chat_messages (
        id NVARCHAR(36) PRIMARY KEY,
        session_id NVARCHAR(36) NOT NULL,
        sender NVARCHAR(50) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );
END
GO-- 9. VIETNAM KYC & DRIVER LICENSE VERIFICATION UPGRADE
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'kyc_status')
BEGIN
    ALTER TABLE users ADD kyc_status NVARCHAR(20) NOT NULL DEFAULT 'REJECTED';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'driver_license_status')
BEGIN
    ALTER TABLE users ADD driver_license_status NVARCHAR(20) NOT NULL DEFAULT 'NONE';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('user_documents') AND name = 'file_url')
BEGIN
    ALTER TABLE user_documents ADD file_url NVARCHAR(500) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('user_documents') AND name = 'ocr_data')
BEGIN
    ALTER TABLE user_documents ADD ocr_data NVARCHAR(MAX) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('user_documents') AND name = 'verification_status')
BEGIN
    ALTER TABLE user_documents ADD verification_status NVARCHAR(20) NOT NULL DEFAULT 'NOT_UPLOADED';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('user_documents') AND name = 'verified_by_admin')
BEGIN
    ALTER TABLE user_documents ADD verified_by_admin NVARCHAR(36) NULL;
END
GO

-- 10. VEHICLE APPROVAL WORKFLOW UPGRADE
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('vehicles') AND name = 'approval_status')
BEGIN
    ALTER TABLE vehicles ADD approval_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL';
    ALTER TABLE vehicles ADD CONSTRAINT CHK_vehicles_approval_status CHECK (approval_status IN ('DRAFT','PENDING_APPROVAL','APPROVED','REJECTED','BLOCKED'));
END
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_notif_type' AND parent_object_id = OBJECT_ID('notifications'))
BEGIN
    ALTER TABLE notifications DROP CONSTRAINT CHK_notif_type;
END
GO
ALTER TABLE notifications ADD CONSTRAINT CHK_notif_type CHECK (type IN ('booking','payment','message','review','system','promotion', 'VEHICLE_APPROVAL', 'VEHICLE_APPROVED', 'VEHICLE_REJECTED'));
GO

