-- ============================================================
-- V1: SOFT DELETE & AUDITING INTEGRATION
-- Core Entities: users, vehicles, bookings
-- ============================================================

-- 1. USERS
IF COL_LENGTH('users', 'is_deleted') IS NULL
BEGIN
    ALTER TABLE users ADD is_deleted BIT NOT NULL DEFAULT 0;
END;

IF COL_LENGTH('users', 'deleted_at') IS NULL
BEGIN
    ALTER TABLE users ADD deleted_at DATETIME2 NULL;
END;

IF COL_LENGTH('users', 'created_by') IS NULL
BEGIN
    ALTER TABLE users ADD created_by NVARCHAR(100) NULL;
END;

IF COL_LENGTH('users', 'updated_by') IS NULL
BEGIN
    ALTER TABLE users ADD updated_by NVARCHAR(100) NULL;
END;


-- 2. VEHICLES
IF COL_LENGTH('vehicles', 'is_deleted') IS NULL
BEGIN
    ALTER TABLE vehicles ADD is_deleted BIT NOT NULL DEFAULT 0;
END;

IF COL_LENGTH('vehicles', 'deleted_at') IS NULL
BEGIN
    ALTER TABLE vehicles ADD deleted_at DATETIME2 NULL;
END;

IF COL_LENGTH('vehicles', 'created_by') IS NULL
BEGIN
    ALTER TABLE vehicles ADD created_by NVARCHAR(100) NULL;
END;

IF COL_LENGTH('vehicles', 'updated_by') IS NULL
BEGIN
    ALTER TABLE vehicles ADD updated_by NVARCHAR(100) NULL;
END;


-- 3. BOOKINGS
IF COL_LENGTH('bookings', 'is_deleted') IS NULL
BEGIN
    ALTER TABLE bookings ADD is_deleted BIT NOT NULL DEFAULT 0;
END;

IF COL_LENGTH('bookings', 'deleted_at') IS NULL
BEGIN
    ALTER TABLE bookings ADD deleted_at DATETIME2 NULL;
END;

IF COL_LENGTH('bookings', 'created_by') IS NULL
BEGIN
    ALTER TABLE bookings ADD created_by NVARCHAR(100) NULL;
END;

IF COL_LENGTH('bookings', 'updated_by') IS NULL
BEGIN
    ALTER TABLE bookings ADD updated_by NVARCHAR(100) NULL;
END;
