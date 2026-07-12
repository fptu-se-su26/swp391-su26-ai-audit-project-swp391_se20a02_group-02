-- ============================================================
-- V5: Booking & Payment Flow Overhaul
-- ============================================================

-- 1. Create booking_counters table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'booking_counters')
BEGIN
    CREATE TABLE booking_counters (
        name NVARCHAR(50) NOT NULL PRIMARY KEY,
        counter_value BIGINT NOT NULL
    );
    -- Seed initial counter value
    INSERT INTO booking_counters (name, counter_value) VALUES ('bookings', 100000);
END
GO

-- 2. Create payment_settings table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'payment_settings')
BEGIN
    CREATE TABLE payment_settings (
        id NVARCHAR(36) NOT NULL PRIMARY KEY,
        bank_name NVARCHAR(100) NOT NULL,
        account_number NVARCHAR(100) NOT NULL,
        owner_name NVARCHAR(100) NOT NULL,
        enabled BIT NOT NULL DEFAULT 1,
        version INT NOT NULL DEFAULT 1,
        updated_by NVARCHAR(100) NULL,
        updated_time DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    -- Seed default single owner payment settings
    INSERT INTO payment_settings (id, bank_name, account_number, owner_name, enabled, version, updated_by, updated_time)
    VALUES ('P1', 'MB Bank', '0377096245', 'NGUYEN VAN DANG', 1, 1, 'SYSTEM', GETDATE());
END
GO

-- 3. Modify check constraints on bookings status
-- Drop old check constraint if exists
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_bookings_status')
BEGIN
    ALTER TABLE bookings DROP CONSTRAINT CHK_bookings_status;
END
GO

-- Recreate with expanded lifecycle status enums
ALTER TABLE bookings ADD CONSTRAINT CHK_bookings_status CHECK (
    status IN (
        'PENDING', 'CONFIRMED', 'PICKING_UP', 'IN_PROGRESS', 'ACTIVE', 'DISPUTED',
        'DRAFT', 'WAITING_PAYMENT', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED', 
        'OWNER_APPROVED', 'READY_FOR_PICKUP', 'CHECKED_OUT', 'IN_RENTAL', 
        'RETURN_PENDING', 'RETURN_COMPLETED', 'COMPLETED', 'PAYMENT_EXPIRED', 
        'PAYMENT_REJECTED', 'CUSTOMER_CANCELLED', 'OWNER_CANCELLED', 'SYSTEM_CANCELLED'
    )
);
GO

-- 4. Add columns to bookings
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('bookings') AND name = 'booking_code')
BEGIN
    ALTER TABLE bookings ADD booking_code NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('bookings') AND name = 'cleaning_fee')
BEGIN
    ALTER TABLE bookings ADD cleaning_fee DECIMAL(12,0) NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('bookings') AND name = 'version')
BEGIN
    ALTER TABLE bookings ADD version INT NOT NULL DEFAULT 0;
END
GO

-- Create unique index on bookings(booking_code) where it's not null
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_bookings_booking_code' AND object_id = OBJECT_ID('bookings'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UQ_bookings_booking_code 
    ON bookings (booking_code) 
    WHERE booking_code IS NOT NULL;
END
GO

-- 5. Add columns to payments for manual verification auditing
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('payments') AND name = 'verified_by')
BEGIN
    ALTER TABLE payments ADD verified_by NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('payments') AND name = 'verified_time')
BEGIN
    ALTER TABLE payments ADD verified_time DATETIME2 NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('payments') AND name = 'rejected_reason')
BEGIN
    ALTER TABLE payments ADD rejected_reason NVARCHAR(500) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('payments') AND name = 'transfer_content')
BEGIN
    ALTER TABLE payments ADD transfer_content NVARCHAR(100) NULL;
END
GO
