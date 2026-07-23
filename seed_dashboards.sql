-- ==========================================
-- LuxeWay Dashboard Data Seeding Script
-- ==========================================
USE car_rental_platform;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

DECLARE @customerId NVARCHAR(36) = 'customer-nguyen-van-a';
DECLARE @ownerId NVARCHAR(36) = 'owner-pham-minh-d';

-- Clear existing mock bookings to avoid duplicates if re-run
DELETE FROM payments WHERE booking_id LIKE 'mock-booking-%';
DELETE FROM bookings WHERE id LIKE 'mock-booking-%';
DELETE FROM vehicles WHERE id LIKE 'mock-vehicle-%';

-- ==========================================
-- 1. Insert Vehicles for Owner
-- ==========================================
INSERT INTO vehicles (
    id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, country,
    seats, transmission, fuel_type, is_locked, min_rental_days, max_rental_days, advance_booking_days, status, approval_status,
    delivery_available, has_helmet, has_phone_holder, has_raincoat, has_touring_package, has_chauffeur, airport_delivery, wedding_rental,
    instant_book, is_featured, is_verified, delivery_fee, rating, total_reviews, total_bookings, vehicle_type,
    created_at, updated_at
) VALUES 
('mock-vehicle-1', @ownerId, 'Ferrari F8 Tributo', 'Ferrari', 'F8', 2023, 'LUXURY', 8500000, 20000000, 'Ho Chi Minh', 'Vietnam', 2, 'AUTOMATIC', 'GASOLINE', 0, 1, 30, 365, 'AVAILABLE', 'APPROVED', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 5.0, 1, 1, 'CAR', GETDATE(), GETDATE()),
('mock-vehicle-2', @ownerId, 'Porsche 911 Carrera', 'Porsche', '911', 2022, 'SPORTS', 7200000, 15000000, 'Ho Chi Minh', 'Vietnam', 4, 'AUTOMATIC', 'GASOLINE', 0, 1, 30, 365, 'AVAILABLE', 'APPROVED', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 5.0, 1, 1, 'CAR', GETDATE(), GETDATE());

-- Insert vehicle images
INSERT INTO vehicle_images (id, vehicle_id, url, is_primary, created_at, sort_order) VALUES
(NEWID(), 'mock-vehicle-1', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888', 1, GETDATE(), 0),
(NEWID(), 'mock-vehicle-2', 'https://images.unsplash.com/photo-1503376762361-1c3905085e68', 1, GETDATE(), 0);

-- ==========================================
-- 2. Insert Bookings (Past & Active)
-- ==========================================

-- Booking 1: COMPLETED
INSERT INTO bookings (
    id, vehicle_id, renter_id, owner_id, status, start_date, end_date, total_days, 
    base_price, price_per_day, service_fee, taxes, total, deposit, created_at, updated_at, version, cleaning_fee,
    deposit_refunded, include_insurance, include_delivery
) VALUES (
    'mock-booking-1', 'mock-vehicle-1', @customerId, @ownerId, 'COMPLETED',
    DATEADD(day, -10, GETDATE()), DATEADD(day, -8, GETDATE()), 2,
    17000000, 8500000, 500000, 1750000, 19250000, 20000000, DATEADD(day, -15, GETDATE()), DATEADD(day, -8, GETDATE()), 0, 0,
    0, 0, 0
);

-- Booking 2: IN_RENTAL (Active)
INSERT INTO bookings (
    id, vehicle_id, renter_id, owner_id, status, start_date, end_date, total_days, 
    base_price, price_per_day, service_fee, taxes, total, deposit, created_at, updated_at, version, cleaning_fee,
    deposit_refunded, include_insurance, include_delivery
) VALUES (
    'mock-booking-2', 'mock-vehicle-2', @customerId, @ownerId, 'IN_RENTAL',
    DATEADD(day, -1, GETDATE()), DATEADD(day, 2, GETDATE()), 3,
    21600000, 7200000, 500000, 2210000, 24310000, 15000000, DATEADD(day, -3, GETDATE()), GETDATE(), 0, 0,
    0, 0, 0
);

-- ==========================================
-- 3. Insert Payments
-- ==========================================
INSERT INTO payments (
    id, booking_id, user_id, amount, currency, status, method, created_at, processed_at
) VALUES 
(NEWID(), 'mock-booking-1', @customerId, 19250000, 'VND', 'SUCCEEDED', 'STRIPE', DATEADD(day, -15, GETDATE()), DATEADD(day, -15, GETDATE())),
(NEWID(), 'mock-booking-2', @customerId, 24310000, 'VND', 'SUCCEEDED', 'VNPAY', DATEADD(day, -3, GETDATE()), DATEADD(day, -3, GETDATE()));


-- ==========================================
-- 4. Update Users Stats
-- ==========================================
UPDATE users 
SET total_rentals = 2, wallet_balance = 0
WHERE id = @customerId;

UPDATE users 
SET wallet_balance = 34500000, rating = 5.0, total_rentals = 2
WHERE id = @ownerId;

UPDATE vehicles
SET total_bookings = 1
WHERE id IN ('mock-vehicle-1', 'mock-vehicle-2');

GO
