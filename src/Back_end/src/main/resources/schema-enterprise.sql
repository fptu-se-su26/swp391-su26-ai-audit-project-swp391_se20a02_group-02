-- ============================================================
-- LUXEWAY ENTERPRISE SCHEMA MIGRATIONS (PHASES 1-10)
-- Target Database: SQL Server
-- ============================================================

-- 1. ISOLATION TABLES (PHASE 1)
IF OBJECT_ID('car_reviews', 'U') IS NULL
BEGIN
    CREATE TABLE car_reviews (
        id NVARCHAR(36) PRIMARY KEY,
        car_id NVARCHAR(36) NOT NULL,
        booking_id NVARCHAR(36) NOT NULL,
        reviewer_id NVARCHAR(36) NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        cleanliness INT NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
        accuracy INT NOT NULL CHECK (accuracy BETWEEN 1 AND 5),
        communication INT NOT NULL CHECK (communication BETWEEN 1 AND 5),
        value_rating INT NOT NULL CHECK (value_rating BETWEEN 1 AND 5),
        comment NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE NO ACTION
    );
END

IF OBJECT_ID('motorbike_reviews', 'U') IS NULL
BEGIN
    CREATE TABLE motorbike_reviews (
        id NVARCHAR(36) PRIMARY KEY,
        motorbike_id NVARCHAR(36) NOT NULL,
        booking_id NVARCHAR(36) NOT NULL,
        reviewer_id NVARCHAR(36) NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        cleanliness INT NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
        accuracy INT NOT NULL CHECK (accuracy BETWEEN 1 AND 5),
        communication INT NOT NULL CHECK (communication BETWEEN 1 AND 5),
        value_rating INT NOT NULL CHECK (value_rating BETWEEN 1 AND 5),
        comment NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE NO ACTION
    );
END

IF OBJECT_ID('car_insurances', 'U') IS NULL
BEGIN
    CREATE TABLE car_insurances (
        id NVARCHAR(36) PRIMARY KEY,
        car_id NVARCHAR(36) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500) NULL,
        cost_per_day DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        coverage_limit DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        is_active BIT NOT NULL DEFAULT 1,
        FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('motorbike_deposits', 'U') IS NULL
BEGIN
    CREATE TABLE motorbike_deposits (
        id NVARCHAR(36) PRIMARY KEY,
        motorbike_id NVARCHAR(36) NOT NULL,
        amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        description NVARCHAR(500) NULL,
        is_active BIT NOT NULL DEFAULT 1,
        FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('car_addons', 'U') IS NULL
BEGIN
    CREATE TABLE car_addons (
        id NVARCHAR(36) PRIMARY KEY,
        car_id NVARCHAR(36) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500) NULL,
        price_per_day DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        is_active BIT NOT NULL DEFAULT 1,
        FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('motorbike_addons', 'U') IS NULL
BEGIN
    CREATE TABLE motorbike_addons (
        id NVARCHAR(36) PRIMARY KEY,
        motorbike_id NVARCHAR(36) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500) NULL,
        price_per_day DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        is_active BIT NOT NULL DEFAULT 1,
        FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE
    );
END

-- 2. DYNAMIC PRICING ENGINE (PHASE 3)
IF OBJECT_ID('pricing_rules', 'U') IS NULL
BEGIN
    CREATE TABLE pricing_rules (
        id NVARCHAR(36) PRIMARY KEY,
        vehicle_id NVARCHAR(36) NOT NULL,
        rule_type NVARCHAR(50) NOT NULL, -- WEEKEND, HOLIDAY, SEASONAL, SURGE, LOYALTY
        multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
        start_date DATE NULL,
        end_date DATE NULL,
        name NVARCHAR(100) NOT NULL,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END

-- 3. REWARD LOYALTY PROGRAM (PHASE 6)
IF OBJECT_ID('user_loyalty', 'U') IS NULL
BEGIN
    CREATE TABLE user_loyalty (
        user_id NVARCHAR(36) PRIMARY KEY,
        points INT NOT NULL DEFAULT 0,
        tier NVARCHAR(20) NOT NULL DEFAULT 'SILVER', -- SILVER, GOLD, PLATINUM, DIAMOND
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('reward_transactions', 'U') IS NULL
BEGIN
    CREATE TABLE reward_transactions (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NOT NULL,
        points INT NOT NULL,
        transaction_type NVARCHAR(20) NOT NULL, -- EARNED, REDEEMED, EXPIRED
        description NVARCHAR(500) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END

-- 4. CORPORATE COMPANY ACCOUNTS (PHASE 7)
IF OBJECT_ID('companies', 'U') IS NULL
BEGIN
    CREATE TABLE companies (
        id NVARCHAR(36) PRIMARY KEY,
        name NVARCHAR(200) NOT NULL,
        domain NVARCHAR(100) NULL,
        billing_address NVARCHAR(500) NULL,
        registration_number NVARCHAR(100) NULL,
        budget_limit DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        budget_spent DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END

IF OBJECT_ID('departments', 'U') IS NULL
BEGIN
    CREATE TABLE departments (
        id NVARCHAR(36) PRIMARY KEY,
        company_id NVARCHAR(36) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        budget_limit DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        budget_spent DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('corporate_employees', 'U') IS NULL
BEGIN
    CREATE TABLE corporate_employees (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NOT NULL,
        department_id NVARCHAR(36) NOT NULL,
        corporate_role NVARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE', -- EMPLOYEE, MANAGER, ADMIN
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('company_bookings', 'U') IS NULL
BEGIN
    CREATE TABLE company_bookings (
        booking_id NVARCHAR(36) PRIMARY KEY,
        company_id NVARCHAR(36) NOT NULL,
        department_id NVARCHAR(36) NOT NULL,
        approved_by NVARCHAR(36) NULL,
        status NVARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED, REJECTED
        approved_at DATETIME2 NULL,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE NO ACTION,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE NO ACTION
    );
END

-- 5. ENTERPRISE NOTIFICATION TEMPLATES (PHASE 9)
IF OBJECT_ID('notification_templates', 'U') IS NULL
BEGIN
    CREATE TABLE notification_templates (
        id NVARCHAR(36) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        subject NVARCHAR(200) NOT NULL,
        body_template NVARCHAR(MAX) NOT NULL,
        channel NVARCHAR(20) NOT NULL, -- IN_APP, EMAIL, PUSH, SMS
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END

IF OBJECT_ID('notification_logs', 'U') IS NULL
BEGIN
    CREATE TABLE notification_logs (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NOT NULL,
        template_id NVARCHAR(36) NULL,
        title NVARCHAR(200) NOT NULL,
        body NVARCHAR(MAX) NOT NULL,
        channel NVARCHAR(20) NOT NULL, -- IN_APP, EMAIL, PUSH, SMS
        status NVARCHAR(20) NOT NULL DEFAULT 'SENT', -- SENT, FAILED
        sent_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        error_message NVARCHAR(MAX) NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (template_id) REFERENCES notification_templates(id) ON DELETE SET NULL
    );
END

-- 6. GLOBAL AUDIT TRAIL LEDGER (PHASE 10)
IF OBJECT_ID('audit_logs', 'U') IS NULL
BEGIN
    CREATE TABLE audit_logs (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NULL,
        action NVARCHAR(100) NOT NULL,
        target_type NVARCHAR(50) NOT NULL,
        target_id NVARCHAR(36) NULL,
        old_values NVARCHAR(MAX) NULL,
        new_values NVARCHAR(MAX) NULL,
        ip_address NVARCHAR(45) NULL,
        user_agent NVARCHAR(500) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
