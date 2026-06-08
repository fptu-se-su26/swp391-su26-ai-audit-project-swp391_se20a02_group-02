-- ============================================================
-- LUXEWAY SAMPLE DATA - SQL SERVER COMPATIBLE
-- ============================================================
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
-- Ensure preferred_language column exists
IF COL_LENGTH('users', 'preferred_language') IS NULL
BEGIN
    ALTER TABLE users ADD preferred_language NVARCHAR(10) DEFAULT 'en'
END;

-- ============================================================
-- ECOSYSTEM SCHEMA UPDATES & NEW TABLES
-- ============================================================

-- Ensure new vehicle columns exist
IF COL_LENGTH('vehicles', 'vehicle_type') IS NULL
BEGIN
    ALTER TABLE vehicles ADD vehicle_type NVARCHAR(20) NOT NULL DEFAULT 'CAR'
END;

IF COL_LENGTH('vehicles', 'engine_cc') IS NULL
BEGIN
    ALTER TABLE vehicles ADD engine_cc INT NULL
END;

IF COL_LENGTH('vehicles', 'has_helmet') IS NULL
BEGIN
    ALTER TABLE vehicles ADD has_helmet BIT NOT NULL DEFAULT 0
END;

IF COL_LENGTH('vehicles', 'has_phone_holder') IS NULL
BEGIN
    ALTER TABLE vehicles ADD has_phone_holder BIT NOT NULL DEFAULT 0
END;

IF COL_LENGTH('vehicles', 'has_raincoat') IS NULL
BEGIN
    ALTER TABLE vehicles ADD has_raincoat BIT NOT NULL DEFAULT 0
END;

IF COL_LENGTH('vehicles', 'has_touring_package') IS NULL
BEGIN
    ALTER TABLE vehicles ADD has_touring_package BIT NOT NULL DEFAULT 0
END;

IF COL_LENGTH('vehicles', 'has_chauffeur') IS NULL
BEGIN
    ALTER TABLE vehicles ADD has_chauffeur BIT NOT NULL DEFAULT 0
END;

IF COL_LENGTH('vehicles', 'airport_delivery') IS NULL
BEGIN
    ALTER TABLE vehicles ADD airport_delivery BIT NOT NULL DEFAULT 0
END;

IF COL_LENGTH('vehicles', 'wedding_rental') IS NULL
BEGIN
    ALTER TABLE vehicles ADD wedding_rental BIT NOT NULL DEFAULT 0
END;

IF COL_LENGTH('vehicles', 'business_rental') IS NULL
BEGIN
    ALTER TABLE vehicles ADD business_rental BIT NOT NULL DEFAULT 0
END;

IF COL_LENGTH('vehicles', 'description') IS NULL
BEGIN
    ALTER TABLE vehicles ADD description NVARCHAR(MAX) NULL
END;

-- Update vehicles category check constraint to allow new Car & Motorbike categories
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'CHK_vehicles_category' AND parent_object_id = OBJECT_ID('vehicles'))
BEGIN
    ALTER TABLE vehicles DROP CONSTRAINT CHK_vehicles_category
END;

ALTER TABLE vehicles ADD CONSTRAINT CHK_vehicles_category CHECK (category IN (
    'ECONOMY','FAMILY','BUSINESS','ELECTRIC','MOTORBIKE','SUV','CITY_CAR','TOURISM',
    'SEDAN','MPV','LUXURY','ELECTRIC_CAR','SPORTS','PICKUP',
    'SCOOTER','AUTOMATIC_SCOOTER','MANUAL_MOTORCYCLE','SPORT_BIKE','TOURING_BIKE','ADVENTURE_BIKE','CLASSIC_BIKE','ELECTRIC_BIKE'
));

-- Ensure vehicle_brands table exists
IF OBJECT_ID('vehicle_brands', 'U') IS NULL
BEGIN
    CREATE TABLE vehicle_brands (
        id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
        name            NVARCHAR(100)   NOT NULL UNIQUE,
        country         NVARCHAR(100)   NOT NULL DEFAULT N'Japan',
        vehicle_type    NVARCHAR(20)    NOT NULL CONSTRAINT CHK_brand_type CHECK (vehicle_type IN ('CAR', 'MOTORBIKE', 'BOTH')),
        logo_url        NVARCHAR(500),
        is_active       BIT             NOT NULL DEFAULT 1,
        sort_order      INT             NOT NULL DEFAULT 0,
        created_at      DATETIME2       NOT NULL DEFAULT GETDATE()
    )
END;

-- Ensure vehicle_models table exists
IF OBJECT_ID('vehicle_models', 'U') IS NULL
BEGIN
    CREATE TABLE vehicle_models (
        id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
        brand_id        NVARCHAR(36)    NOT NULL,
        model_name      NVARCHAR(200)   NOT NULL,
        vehicle_type    NVARCHAR(20)    NOT NULL CONSTRAINT CHK_model_type CHECK (vehicle_type IN ('CAR', 'MOTORBIKE')),
        category        NVARCHAR(50)    NOT NULL,
        engine_cc       INT             NULL,       -- For motorbikes
        seats           INT             NULL,       -- For cars
        base_price_min  DECIMAL(12,0)   NOT NULL,   -- VND/day minimum
        base_price_max  DECIMAL(12,0)   NOT NULL,   -- VND/day maximum
        is_active       BIT             NOT NULL DEFAULT 1,
        sort_order      INT             NOT NULL DEFAULT 0,
        CONSTRAINT FK_vehicle_models_brand FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id) ON DELETE NO ACTION
    )
END;

-- Clear tables (respecting foreign keys)
DELETE FROM vehicle_models;
DELETE FROM vehicle_brands;

-- Seed brand catalog
INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active) VALUES
('B1', N'Honda', N'Japan', 'BOTH', 1),
('B2', N'Yamaha', N'Japan', 'MOTORBIKE', 1),
('B3', N'Suzuki', N'Japan', 'BOTH', 1),
('B4', N'VinFast', N'Vietnam', 'BOTH', 1),
('B5', N'Kawasaki', N'Japan', 'MOTORBIKE', 1),
('B6', N'Toyota', N'Japan', 'CAR', 1),
('B7', N'Mazda', N'Japan', 'CAR', 1),
('B8', N'Hyundai', N'South Korea', 'CAR', 1),
('B9', N'Kia', N'South Korea', 'CAR', 1),
('B10', N'Ford', N'USA', 'CAR', 1),
('B11', N'Mitsubishi', N'Japan', 'CAR', 1),
('B12', N'Mercedes-Benz', N'Germany', 'CAR', 1),
('B13', N'BMW', N'Germany', 'CAR', 1),
('B14', N'Audi', N'Germany', 'CAR', 1),
('B15', N'Porsche', N'Germany', 'CAR', 1);

-- Seed model catalog
INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, engine_cc, seats, base_price_min, base_price_max, is_active) VALUES
('M1', 'B1', N'Vision', 'MOTORBIKE', 'SCOOTER', 110, NULL, 120000, 180000, 1),
('M2', 'B1', N'Air Blade', 'MOTORBIKE', 'AUTOMATIC_SCOOTER', 125, NULL, 150000, 250000, 1),
('M3', 'B1', N'Lead', 'MOTORBIKE', 'SCOOTER', 125, NULL, 150000, 220000, 1),
('M4', 'B1', N'SH125i', 'MOTORBIKE', 'SCOOTER', 125, NULL, 250000, 400000, 1),
('M5', 'B1', N'SH160i', 'MOTORBIKE', 'SCOOTER', 156, NULL, 350000, 550000, 1),
('M6', 'B1', N'SH350i', 'MOTORBIKE', 'SCOOTER', 330, NULL, 600000, 900000, 1),
('M7', 'B1', N'Winner X', 'MOTORBIKE', 'MANUAL_MOTORCYCLE', 150, NULL, 150000, 250000, 1),
('M8', 'B2', N'Sirius', 'MOTORBIKE', 'MANUAL_MOTORCYCLE', 110, NULL, 100000, 150000, 1),
('M9', 'B2', N'Exciter 155', 'MOTORBIKE', 'MANUAL_MOTORCYCLE', 155, NULL, 180000, 280000, 1),
('M10', 'B2', N'Grande', 'MOTORBIKE', 'SCOOTER', 125, NULL, 150000, 250000, 1),
('M11', 'B4', N'Evo200', 'MOTORBIKE', 'ELECTRIC_BIKE', NULL, NULL, 120000, 180000, 1),
('M12', 'B4', N'Feliz S', 'MOTORBIKE', 'ELECTRIC_BIKE', NULL, NULL, 150000, 220000, 1),
('M13', 'B4', N'Klara S', 'MOTORBIKE', 'ELECTRIC_BIKE', NULL, NULL, 180000, 280000, 1),
('M14', 'B1', N'CB150R', 'MOTORBIKE', 'SPORT_BIKE', 150, NULL, 300000, 450000, 1),
('M15', 'B2', N'MT15', 'MOTORBIKE', 'SPORT_BIKE', 155, NULL, 350000, 500000, 1),
('M16', 'B5', N'Versys X300', 'MOTORBIKE', 'ADVENTURE_BIKE', 296, NULL, 600000, 900000, 1),
('M17', 'B6', N'Vios', 'CAR', 'SEDAN', NULL, 5, 600000, 900000, 1),
('M18', 'B6', N'Innova', 'CAR', 'MPV', NULL, 7, 900000, 140000, 1),
('M19', 'B6', N'Fortuner', 'CAR', 'SUV', NULL, 7, 1200000, 1800000, 1),
('M20', 'B7', N'Mazda 3', 'CAR', 'SEDAN', NULL, 5, 700000, 1000000, 1),
('M21', 'B7', N'CX-5', 'CAR', 'SUV', NULL, 5, 900000, 1300000, 1),
('M22', 'B8', N'Accent', 'CAR', 'SEDAN', NULL, 5, 600000, 850000, 1),
('M23', 'B8', N'Santa Fe', 'CAR', 'SUV', NULL, 7, 1300000, 2000000, 1),
('M24', 'B10', N'Ranger Wildtrak', 'CAR', 'PICKUP', NULL, 5, 1000000, 1500000, 1),
('M25', 'B4', N'VF8', 'CAR', 'ELECTRIC_CAR', NULL, 5, 1200000, 1800000, 1),
('M26', 'B4', N'VF9', 'CAR', 'ELECTRIC_CAR', NULL, 7, 1800000, 2800000, 1),
('M27', 'B12', N'C200', 'CAR', 'LUXURY', NULL, 5, 1800000, 2500000, 1),
('M28', 'B13', N'BMW 320i', 'CAR', 'LUXURY', NULL, 5, 2000000, 3000000, 1);

-- Clear existing data (in reverse order of dependencies)
DELETE FROM dispute_evidence;
DELETE FROM disputes;
DELETE FROM reviews;
DELETE FROM payments;
DELETE FROM bookings;
DELETE FROM faqs;
DELETE FROM vehicle_features;
DELETE FROM vehicle_images;
DELETE FROM vehicles;

-- Clear new ecosystem data
DELETE FROM car_delivery;
DELETE FROM chauffeur_services;
DELETE FROM airport_transfer_services;
DELETE FROM car_booking_history;
DELETE FROM car_bookings;
DELETE FROM car_specifications;
DELETE FROM car_images;
DELETE FROM car_locations;
DELETE FROM car_pricing;
DELETE FROM car_availability;
DELETE FROM business_packages;
DELETE FROM wedding_packages;
DELETE FROM cars;
DELETE FROM car_models;
DELETE FROM car_brands;

DELETE FROM equipment_rentals;
DELETE FROM motorbike_booking_history;
DELETE FROM motorbike_bookings;
DELETE FROM motorbike_specifications;
DELETE FROM motorbike_images;
DELETE FROM motorbike_locations;
DELETE FROM motorbike_pricing;
DELETE FROM motorbike_availability;
DELETE FROM tour_packages;
DELETE FROM adventure_packages;
DELETE FROM motorbikes;
DELETE FROM motorbike_models;
DELETE FROM motorbike_brands;

DELETE FROM users;
-- ======-- ====== USERS DATA (SQL Server UUID Format) ======
-- Admin User
INSERT INTO users (
        id,
        email,
        password_hash,
        first_name,
        last_name,
        display_name,
        avatar,
        phone,
        role,
        verified,
        kyc_verified,
        driving_license_verified,
        rating,
        total_reviews,
        total_rentals,
        bio,
        location,
        account_type,
        company_name,
        is_active,
        joined_at,
        last_active,
        created_at,
        updated_at
    )
VALUES (
        'A1B2C3D4-E5F6-7890-ABCD-123456789012',
        'admin@luxeway.vn',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        N'Admin',
        N'LuxeWay',
        N'Admin LuxeWay',
        'https://ui-avatars.com/api/?name=Admin+LuxeWay&background=0F172A&color=fff&size=200',
        '0901234567',
        'ADMIN',
        1,
        1,
        1,
        5.00,
        0,
        0,
        N'LuxeWay Platform Administrator',
        N'Hồ Chí Minh',
        'INDIVIDUAL',
        NULL,
        1,
        '2024-01-01 00:00:00',
        '2024-05-23 10:00:00',
        '2024-01-01 00:00:00',
        '2024-05-23 10:00:00'
    );
-- Customer Users
INSERT INTO users (
        id,
        email,
        password_hash,
        first_name,
        last_name,
        display_name,
        avatar,
        phone,
        role,
        verified,
        kyc_verified,
        driving_license_verified,
        rating,
        total_reviews,
        total_rentals,
        bio,
        location,
        account_type,
        company_name,
        is_active,
        joined_at,
        last_active,
        created_at,
        updated_at
    )
VALUES (
        'B2C3D4E5-F6G7-8901-BCDE-234567890123',
        'nguyen.van.a@gmail.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        N'Nguyễn',
        N'Văn A',
        N'Nguyễn Văn A',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        '0901111111',
        'CUSTOMER',
        1,
        1,
        1,
        4.80,
        15,
        8,
        N'Yêu thích du lịch và khám phá những địa điểm mới',
        N'Hà Nội',
        'INDIVIDUAL',
        NULL,
        1,
        '2024-02-15 08:30:00',
        '2024-05-23 09:45:00',
        '2024-02-15 08:30:00',
        '2024-05-23 09:45:00'
    ),
    (
        'C3D4E5F6-G7H8-9012-CDEF-345678901234',
        'tran.thi.b@gmail.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        N'Trần',
        N'Thị B',
        N'Trần Thị B',
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
        '0902222222',
        'CUSTOMER',
        1,
        1,
        1,
        4.90,
        22,
        12,
        N'Thích lái xe và trải nghiệm các dòng xe khác nhau',
        N'Hồ Chí Minh',
        'INDIVIDUAL',
        NULL,
        1,
        '2024-03-01 14:20:00',
        '2024-05-23 08:15:00',
        '2024-03-01 14:20:00',
        '2024-05-23 08:15:00'
    ),
    (
        'D4E5F6G7-H8I9-0123-DEFG-456789012345',
        'le.van.c@gmail.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        N'Lê',
        N'Văn C',
        N'Lê Văn C',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        '0903333333',
        'CUSTOMER',
        1,
        0,
        1,
        4.60,
        8,
        5,
        N'Sinh viên đại học, thường thuê xe cho các chuyến đi ngắn',
        N'Đà Nẵng',
        'INDIVIDUAL',
        NULL,
        1,
        '2024-04-10 11:45:00',
        '2024-05-22 20:30:00',
        '2024-04-10 11:45:00',
        '2024-05-22 20:30:00'
    );
-- Vehicle Owner Users (Individual)
INSERT INTO users (
        id,
        email,
        password_hash,
        first_name,
        last_name,
        display_name,
        avatar,
        phone,
        role,
        verified,
        kyc_verified,
        driving_license_verified,
        rating,
        total_reviews,
        total_rentals,
        bio,
        location,
        account_type,
        company_name,
        is_active,
        joined_at,
        last_active,
        created_at,
        updated_at
    )
VALUES (
        'E5F6G7H8-I9J0-1234-EFGH-567890123456',
        'pham.minh.d@gmail.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        N'Phạm',
        N'Minh D',
        N'Phạm Minh D',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
        '0904444444',
        'OWNER',
        1,
        1,
        1,
        4.95,
        45,
        0,
        N'Chủ sở hữu 3 chiếc xe, cam kết chất lượng dịch vụ tốt nhất',
        N'Hà Nội',
        'INDIVIDUAL',
        NULL,
        1,
        '2024-01-20 09:15:00',
        '2024-05-23 07:20:00',
        '2024-01-20 09:15:00',
        '2024-05-23 07:20:00'
    ),
    (
        'F6G7H8I9-J0K1-2345-FGHI-678901234567',
        'hoang.thi.e@gmail.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        N'Hoàng',
        N'Thị E',
        N'Hoàng Thị E',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
        '0905555555',
        'OWNER',
        1,
        1,
        1,
        4.85,
        38,
        0,
        N'Chuyên cho thuê xe cao cấp, dịch vụ chuyên nghiệp',
        N'Hồ Chí Minh',
        'INDIVIDUAL',
        NULL,
        1,
        '2024-02-05 16:30:00',
        '2024-05-23 06:45:00',
        '2024-02-05 16:30:00',
        '2024-05-23 06:45:00'
    );
-- Business Owner Users
INSERT INTO users (
        id,
        email,
        password_hash,
        first_name,
        last_name,
        display_name,
        avatar,
        phone,
        role,
        verified,
        kyc_verified,
        driving_license_verified,
        rating,
        total_reviews,
        total_rentals,
        bio,
        location,
        account_type,
        company_name,
        is_active,
        joined_at,
        last_active,
        created_at,
        updated_at
    )
VALUES (
        'G7H8I9J0-K1L2-3456-GHIJ-789012345678',
        'contact@saigoncarrental.vn',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        N'Nguyễn',
        N'Văn F',
        N'Saigon Car Rental',
        'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=200&h=200&fit=crop',
        '0906666666',
        'OWNER',
        1,
        1,
        1,
        4.92,
        156,
        0,
        N'Công ty cho thuê xe hàng đầu tại TP.HCM với đội xe đa dạng',
        N'Hồ Chí Minh',
        'BUSINESS',
        N'Saigon Car Rental Co., Ltd',
        1,
        '2023-12-01 08:00:00',
        '2024-05-23 05:30:00',
        '2023-12-01 08:00:00',
        '2024-05-23 05:30:00'
    ),
    (
        'H8I9J0K1-L2M3-4567-HIJK-890123456789',
        'info@hanoiautorental.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        N'Trần',
        N'Văn G',
        N'Hanoi Auto Rental',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
        '0907777777',
        'OWNER',
        1,
        1,
        1,
        4.88,
        89,
        0,
        N'Dịch vụ cho thuê xe tự lái uy tín tại Hà Nội',
        N'Hà Nội',
        'BUSINESS',
        N'Hanoi Auto Rental JSC',
        1,
        '2024-01-15 10:20:00',
        '2024-05-23 04:15:00',
        '2024-01-15 10:20:00',
        '2024-05-23 04:15:00'
    );
-- ====== VEHICLES DATA ======
-- Individual Owner Vehicles
INSERT INTO vehicles (
        id,
        owner_id,
        name,
        brand,
        model,
        year,
        category,
        description,
        thumbnail_url,
        price_per_day,
        price_per_week,
        deposit,
        city,
        country,
        address,
        latitude,
        longitude,
        horsepower,
        top_speed,
        acceleration,
        seats,
        doors,
        transmission,
        fuel_type,
        range_km,
        engine_size,
        color,
        license_plate,
        min_rental_days,
        max_rental_days,
        advance_booking_days,
        status,
        rating,
        total_reviews,
        total_bookings,
        is_verified,
        is_featured,
        instant_book,
        delivery_available,
        delivery_fee,
        created_at,
        updated_at
    )
VALUES (
        'V1A2B3C4-D5E6-7890-VHCL-111111111111',
        'E5F6G7H8-I9J0-1234-EFGH-567890123456',
        N'Honda City 2023 - Xe Đẹp Như Mới',
        N'Honda',
        N'City',
        2023,
        'ECONOMY',
        N'Honda City 2023 màu trắng, nội thất đen sang trọng. Xe được bảo dưỡng định kỳ, sạch sẽ, tiết kiệm nhiên liệu. Phù hợp cho gia đình nhỏ và các chuyến đi trong thành phố.',
        '/uploads/vehicles/honda_city.png',
        800000.00,
        5200000.00,
        3000000.00,
        N'Hà Nội',
        N'Vietnam',
        N'123 Đường Láng, Đống Đa, Hà Nội',
        21.0285,
        105.8542,
        120,
        180,
        11.5,
        5,
        4,
        'AUTOMATIC',
        'GASOLINE',
        600,
        '1.5L',
        N'Trắng',
        '30A-12345',
        1,
        15,
        365,
        'AVAILABLE',
        4.80,
        25,
        18,
        1,
        0,
        1,
        1,
        50000.00,
        '2024-02-01 10:00:00',
        '2024-05-23 08:00:00'
    ),
    (
        'V2B3C4D5-E6F7-8901-VHCL-222222222222',
        'E5F6G7H8-I9J0-1234-EFGH-567890123456',
        N'Toyota Vios 2022 - Tiết Kiệm Nhiên Liệu',
        N'Toyota',
        N'Vios',
        2022,
        'ECONOMY',
        N'Toyota Vios 2022 màu bạc, số tự động, máy lạnh mát, âm thanh tốt. Xe gia đình sử dụng ít, còn rất mới. Lý tưởng cho các chuyến đi xa và trong thành phố.',
        '/uploads/vehicles/toyota_vios.png',
        750000.00,
        4900000.00,
        2800000.00,
        N'Hà Nội',
        N'Vietnam',
        N'456 Phố Huế, Hai Bà Trưng, Hà Nội',
        21.0245,
        105.8525,
        107,
        175,
        12.3,
        5,
        4,
        'AUTOMATIC',
        'GASOLINE',
        650,
        '1.5L',
        N'Bạc',
        '30B-67890',
        1,
        20,
        365,
        'AVAILABLE',
        4.90,
        31,
        22,
        1,
        1,
        1,
        1,
        50000.00,
        '2024-02-15 14:30:00',
        '2024-05-22 19:45:00'
    ),
    (
        'V3C4D5E6-F7G8-9012-VHCL-333333333333',
        'E5F6G7H8-I9J0-1234-EFGH-567890123456',
        N'Honda Air Blade 2023 - Xe Máy Cao Cấp',
        N'Honda',
        N'Air Blade',
        2023,
        'MOTORBIKE',
        N'Honda Air Blade 2023 màu đỏ đen thể thao, phanh ABS, khóa thông minh. Xe mới 100%, phù hợp di chuyển nhanh trong thành phố, tiết kiệm và linh hoạt.',
        '/uploads/vehicles/honda_airblade.png',
        200000.00,
        1300000.00,
        1000000.00,
        N'Hà Nội',
        N'Vietnam',
        N'789 Giải Phóng, Hoàng Mai, Hà Nội',
        21.0122,
        105.8667,
        11,
        100,
        9.5,
        2,
        0,
        'AUTOMATIC',
        'GASOLINE',
        200,
        '150cc',
        N'Đỏ Đen',
        '29X1-12345',
        1,
        10,
        180,
        'AVAILABLE',
        4.70,
        18,
        35,
        1,
        0,
        1,
        1,
        30000.00,
        '2024-03-01 09:15:00',
        '2024-05-23 07:30:00'
    ),
    (
        'V4D5E6F7-G8H9-0123-VHCL-444444444444',
        'F6G7H8I9-J0K1-2345-FGHI-678901234567',
        N'Mercedes C200 2021 - Sang Trọng',
        N'Mercedes-Benz',
        N'C200',
        2021,
        'BUSINESS',
        N'Mercedes C200 2021 màu đen, nội thất da cao cấp, đầy đủ tiện nghi hiện đại. Xe dành cho khách hàng VIP, các sự kiện quan trọng và chuyến công tác.',
        '/uploads/vehicles/mercedes_c200.png',
        2500000.00,
        16000000.00,
        8000000.00,
        N'Hồ Chí Minh',
        N'Vietnam',
        N'123 Nguyễn Huệ, Quận 1, TP.HCM',
        10.7769,
        106.7009,
        184,
        230,
        7.7,
        5,
        4,
        'AUTOMATIC',
        'GASOLINE',
        500,
        '1.5L Turbo',
        N'Đen',
        '51A-99999',
        2,
        7,
        365,
        'AVAILABLE',
        4.95,
        42,
        28,
        1,
        1,
        0,
        1,
        100000.00,
        '2024-02-20 11:45:00',
        '2024-05-23 06:20:00'
    ),
    (
        'V5E6F7G8-H9I0-1234-VHCL-555555555555',
        'F6G7H8I9-J0K1-2345-FGHI-678901234567',
        N'BMW X3 2022 - SUV Thể Thao',
        N'BMW',
        N'X3',
        2022,
        'SUV',
        N'BMW X3 2022 màu xanh dương metallic, động cơ mạnh mẽ, hệ thống an toàn hiện đại. Phù hợp cho gia đình lớn và các chuyến đi địa hình.',
        '/uploads/vehicles/bmw_x3.png',
        3200000.00,
        20000000.00,
        10000000.00,
        N'Hồ Chí Minh',
        N'Vietnam',
        N'456 Lê Lợi, Quận 1, TP.HCM',
        10.7756,
        106.7019,
        248,
        213,
        6.3,
        5,
        4,
        'AUTOMATIC',
        'GASOLINE',
        450,
        '2.0L Turbo',
        N'Xanh Dương',
        '51B-88888',
        2,
        14,
        365,
        'AVAILABLE',
        4.85,
        35,
        19,
        1,
        1,
        0,
        1,
        120000.00,
        '2024-03-10 16:20:00',
        '2024-05-22 18:10:00'
    );
-- Business Vehicles (Saigon Car Rental)
INSERT INTO vehicles (
        id,
        owner_id,
        name,
        brand,
        model,
        year,
        category,
        description,
        thumbnail_url,
        price_per_day,
        price_per_week,
        deposit,
        city,
        country,
        address,
        latitude,
        longitude,
        horsepower,
        top_speed,
        acceleration,
        seats,
        doors,
        transmission,
        fuel_type,
        range_km,
        engine_size,
        color,
        license_plate,
        min_rental_days,
        max_rental_days,
        advance_booking_days,
        status,
        rating,
        total_reviews,
        total_bookings,
        is_verified,
        is_featured,
        instant_book,
        delivery_available,
        delivery_fee,
        created_at,
        updated_at
    )
VALUES (
        'V6F7G8H9-I0J1-2345-VHCL-666666666666',
        'G7H8I9J0-K1L2-3456-GHIJ-789012345678',
        N'Toyota Camry 2023 - Hạng Sang',
        N'Toyota',
        N'Camry',
        2023,
        'BUSINESS',
        N'Toyota Camry 2023 màu đen, nội thất da beige, đầy đủ tính năng an toàn và tiện nghi. Xe doanh nghiệp cao cấp, phù hợp cho các cuộc họp và sự kiện quan trọng.',
        '/uploads/vehicles/toyota_camry.png',
        1800000.00,
        11500000.00,
        6000000.00,
        N'Hồ Chí Minh',
        N'Vietnam',
        N'789 Nguyễn Văn Cừ, Quận 5, TP.HCM',
        10.7589,
        106.6789,
        178,
        210,
        8.4,
        5,
        4,
        'AUTOMATIC',
        'GASOLINE',
        520,
        '2.5L',
        N'Đen',
        '51C-77777',
        1,
        30,
        365,
        'AVAILABLE',
        4.92,
        67,
        45,
        1,
        1,
        1,
        1,
        80000.00,
        '2024-01-05 08:30:00',
        '2024-05-23 05:45:00'
    ),
    (
        'V7G8H9I0-J1K2-3456-VHCL-777777777777',
        'G7H8I9J0-K1L2-3456-GHIJ-789012345678',
        N'Honda CR-V 2023 - SUV Gia Đình',
        N'Honda',
        N'CR-V',
        2023,
        'FAMILY',
        N'Honda CR-V 2023 màu trắng ngọc trai, 7 chỗ ngồi rộng rãi, cốp xe lớn. Lý tưởng cho gia đình đông người và các chuyến du lịch dài ngày.',
        '/uploads/vehicles/honda_crv.png',
        1500000.00,
        9800000.00,
        5000000.00,
        N'Hồ Chí Minh',
        N'Vietnam',
        N'321 Võ Văn Tần, Quận 3, TP.HCM',
        10.7756,
        106.6917,
        190,
        195,
        9.1,
        7,
        4,
        'AUTOMATIC',
        'GASOLINE',
        480,
        '1.5L Turbo',
        N'Trắng',
        '51D-66666',
        1,
        21,
        365,
        'AVAILABLE',
        4.88,
        52,
        38,
        1,
        0,
        1,
        1,
        70000.00,
        '2024-01-15 12:00:00',
        '2024-05-22 20:15:00'
    ),
    (
        'V8H9I0J1-K2L3-4567-VHCL-888888888888',
        'G7H8I9J0-K1L2-3456-GHIJ-789012345678',
        N'VinFast VF8 2023 - Xe Điện Thông Minh',
        N'VinFast',
        N'VF8',
        2023,
        'ELECTRIC',
        N'VinFast VF8 2023 màu xanh lá, xe điện thông minh với công nghệ tự lái cấp độ 2, màn hình cảm ứng lớn. Thân thiện môi trường, vận hành êm ái.',
        '/uploads/vehicles/vinfast_vf8.png',
        2200000.00,
        14000000.00,
        7000000.00,
        N'Hồ Chí Minh',
        N'Vietnam',
        N'654 Lê Văn Sỹ, Quận 3, TP.HCM',
        10.7869,
        106.6831,
        408,
        200,
        5.9,
        5,
        4,
        'AUTOMATIC',
        'ELECTRIC',
        420,
        'Electric',
        N'Xanh Lá',
        '51E-55555',
        1,
        14,
        365,
        'AVAILABLE',
        4.75,
        28,
        15,
        1,
        1,
        1,
        1,
        90000.00,
        '2024-02-01 14:45:00',
        '2024-05-23 04:30:00'
    );
-- Business Vehicles (Hanoi Auto Rental)
INSERT INTO vehicles (
        id,
        owner_id,
        name,
        brand,
        model,
        year,
        category,
        description,
        thumbnail_url,
        price_per_day,
        price_per_week,
        deposit,
        city,
        country,
        address,
        latitude,
        longitude,
        horsepower,
        top_speed,
        acceleration,
        seats,
        doors,
        transmission,
        fuel_type,
        range_km,
        engine_size,
        color,
        license_plate,
        min_rental_days,
        max_rental_days,
        advance_booking_days,
        status,
        rating,
        total_reviews,
        total_bookings,
        is_verified,
        is_featured,
        instant_book,
        delivery_available,
        delivery_fee,
        created_at,
        updated_at
    )
VALUES (
        'V9I0J1K2-L3M4-5678-VHCL-999999999999',
        'H8I9J0K1-L2M3-4567-HIJK-890123456789',
        N'Mazda CX-5 2023 - SUV Nhật Bản',
        N'Mazda',
        N'CX-5',
        2023,
        'SUV',
        N'Mazda CX-5 2023 màu đỏ pha lê, thiết kế KODO đẹp mắt, công nghệ SKYACTIV tiết kiệm nhiên liệu. Xe SUV 5 chỗ cao cấp, phù hợp mọi địa hình.',
        '/uploads/vehicles/mazda_cx5.png',
        1600000.00,
        10500000.00,
        5500000.00,
        N'Hà Nội',
        N'Vietnam',
        N'987 Phạm Hùng, Nam Từ Liêm, Hà Nội',
        21.0378,
        105.7804,
        188,
        200,
        8.7,
        5,
        4,
        'AUTOMATIC',
        'GASOLINE',
        500,
        '2.5L',
        N'Đỏ',
        '30C-44444',
        1,
        20,
        365,
        'AVAILABLE',
        4.90,
        41,
        29,
        1,
        1,
        1,
        1,
        60000.00,
        '2024-01-25 09:30:00',
        '2024-05-23 03:20:00'
    ),
    (
        'VA0J1K2L-M3N4-6789-VHCL-AAAAAAAAAAAA',
        'H8I9J0K1-L2M3-4567-HIJK-890123456789',
        N'Hyundai Tucson 2022 - Crossover Hiện Đại',
        N'Hyundai',
        N'Tucson',
        2022,
        'SUV',
        N'Hyundai Tucson 2022 màu xám titan, thiết kế hiện đại với đèn LED Parametric. Nội thất rộng rãi, công nghệ SmartSense an toàn cao.',
        '/uploads/vehicles/hyundai_tucson.png',
        1400000.00,
        9100000.00,
        4800000.00,
        N'Hà Nội',
        N'Vietnam',
        N'147 Trần Duy Hưng, Cầu Giấy, Hà Nội',
        21.0313,
        105.7981,
        177,
        193,
        9.3,
        5,
        4,
        'AUTOMATIC',
        'GASOLINE',
        485,
        '2.0L',
        N'Xám',
        '30D-33333',
        1,
        18,
        365,
        'AVAILABLE',
        4.85,
        36,
        24,
        1,
        0,
        1,
        1,
        55000.00,
        '2024-02-10 11:15:00',
        '2024-05-22 17:40:00'
    ),
    (
        'VB1K2L3M-N4O5-7890-VHCL-BBBBBBBBBBBB',
        'H8I9J0K1-L2M3-4567-HIJK-890123456789',
        N'Kia Morning 2023 - Xe Nhỏ Gọn',
        N'Kia',
        N'Morning',
        2023,
        'CITY_CAR',
        N'Kia Morning 2023 màu vàng chanh, xe nhỏ gọn lý tưởng cho việc di chuyển trong thành phố. Tiết kiệm nhiên liệu, dễ đậu xe, phù hợp với sinh viên và nhân viên văn phòng.',
        '/uploads/vehicles/kia_morning.png',
        600000.00,
        3900000.00,
        2200000.00,
        N'Hà Nội',
        N'Vietnam',
        N'258 Tô Hiệu, Lê Chân, Hải Phòng',
        20.8449,
        106.6881,
        83,
        155,
        14.2,
        5,
        4,
        'MANUAL',
        'GASOLINE',
        550,
        '1.25L',
        N'Vàng',
        '15A-22222',
        1,
        12,
        180,
        'AVAILABLE',
        4.60,
        22,
        31,
        1,
        0,
        1,
        0,
        40000.00,
        '2024-03-05 15:45:00',
        '2024-05-23 02:10:00'
    ),
    (
        'VC2L3M4N-O5P6-8901-VHCL-CCCCCCCCCCCC',
        'H8I9J0K1-L2M3-4567-HIJK-890123456789',
        N'Ford Everest 2022 - SUV 7 Chỗ',
        N'Ford',
        N'Everest',
        2022,
        'TOURISM',
        N'Ford Everest 2022 màu nâu đồng, SUV 7 chỗ mạnh mẽ với khả năng vượt địa hình tốt. Phù hợp cho các chuyến du lịch gia đình và khám phá thiên nhiên.',
        '/uploads/vehicles/ford_everest.png',
        2000000.00,
        13000000.00,
        6500000.00,
        N'Hà Nội',
        N'Vietnam',
        N'369 Nguyễn Trãi, Thanh Xuân, Hà Nội',
        21.0058,
        105.8086,
        213,
        180,
        10.2,
        7,
        4,
        'AUTOMATIC',
        'DIESEL',
        400,
        '2.0L Turbo',
        N'Nâu',
        '30E-11111',
        2,
        21,
        365,
        'AVAILABLE',
        4.78,
        33,
        18,
        1,
        0,
        0,
        1,
        75000.00,
        '2024-02-28 13:20:00',
        '2024-05-22 16:55:00'
    );
-- ====== VEHICLE IMAGES ======
INSERT INTO vehicle_images (
        id,
        vehicle_id,
        url,
        is_primary,
        sort_order,
        created_at
    )
VALUES -- Honda City images
    (
        'IMG1A2B3-C4D5-6789-IMGS-111111111111',
        'V1A2B3C4-D5E6-7890-VHCL-111111111111',
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop',
        1,
        1,
        '2024-02-01 10:05:00'
    ),
    (
        'IMG2B3C4-D5E6-7890-IMGS-222222222222',
        'V1A2B3C4-D5E6-7890-VHCL-111111111111',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop',
        0,
        2,
        '2024-02-01 10:05:00'
    ),
    (
        'IMG3C4D5-E6F7-8901-IMGS-333333333333',
        'V1A2B3C4-D5E6-7890-VHCL-111111111111',
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop',
        0,
        3,
        '2024-02-01 10:05:00'
    ),
    -- Toyota Vios images
    (
        'IMG4D5E6-F7G8-9012-IMGS-444444444444',
        'V2B3C4D5-E6F7-8901-VHCL-222222222222',
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop',
        1,
        1,
        '2024-02-15 14:35:00'
    ),
    (
        'IMG5E6F7-G8H9-0123-IMGS-555555555555',
        'V2B3C4D5-E6F7-8901-VHCL-222222222222',
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop',
        0,
        2,
        '2024-02-15 14:35:00'
    ),
    -- Honda Air Blade images
    (
        'IMG6F7G8-H9I0-1234-IMGS-666666666666',
        'V3C4D5E6-F7G8-9012-VHCL-333333333333',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop',
        1,
        1,
        '2024-03-01 09:20:00'
    ),
    (
        'IMG7G8H9-I0J1-2345-IMGS-777777777777',
        'V3C4D5E6-F7G8-9012-VHCL-333333333333',
        'https://images.unsplash.com/photo-1558980394-0a37b3636608?w=800&auto=format&fit=crop',
        0,
        2,
        '2024-03-01 09:20:00'
    ),
    -- Mercedes C200 images
    (
        'IMG8H9I0-J1K2-3456-IMGS-888888888888',
        'V4D5E6F7-G8H9-0123-VHCL-444444444444',
        'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&auto=format&fit=crop',
        1,
        1,
        '2024-02-20 11:50:00'
    ),
    (
        'IMG9I0J1-K2L3-4567-IMGS-999999999999',
        'V4D5E6F7-G8H9-0123-VHCL-444444444444',
        'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800&auto=format&fit=crop',
        0,
        2,
        '2024-02-20 11:50:00'
    ),
    (
        'IMGAJ1K2-L3M4-5678-IMGS-AAAAAAAAAAAA',
        'V4D5E6F7-G8H9-0123-VHCL-444444444444',
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
        0,
        3,
        '2024-02-20 11:50:00'
    ),
    -- BMW X3 images
    (
        'IMGBK2L3-M4N5-6789-IMGS-BBBBBBBBBBBB',
        'V5E6F7G8-H9I0-1234-VHCL-555555555555',
        'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&auto=format&fit=crop',
        1,
        1,
        '2024-03-10 16:25:00'
    ),
    (
        'IMGCL3M4-N5O6-7890-IMGS-CCCCCCCCCCCC',
        'V5E6F7G8-H9I0-1234-VHCL-555555555555',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop',
        0,
        2,
        '2024-03-10 16:25:00'
    );
-- ====== VEHICLE FEATURES ======
INSERT INTO vehicle_features (id, vehicle_id, feature)
VALUES -- Honda City features
    (
        'FEAT1A2B-3C4D-5678-FEAT-111111111111',
        'V1A2B3C4-D5E6-7890-VHCL-111111111111',
        N'Điều hòa tự động'
    ),
    (
        'FEAT2B3C-4D5E-6789-FEAT-222222222222',
        'V1A2B3C4-D5E6-7890-VHCL-111111111111',
        N'Camera lùi'
    ),
    (
        'FEAT3C4D-5E6F-7890-FEAT-333333333333',
        'V1A2B3C4-D5E6-7890-VHCL-111111111111',
        N'Bluetooth'
    ),
    (
        'FEAT4D5E-6F7G-8901-FEAT-444444444444',
        'V1A2B3C4-D5E6-7890-VHCL-111111111111',
        N'USB/AUX'
    ),
    (
        'FEAT5E6F-7G8H-9012-FEAT-555555555555',
        'V1A2B3C4-D5E6-7890-VHCL-111111111111',
        N'Cảm biến áp suất lốp'
    ),
    -- Toyota Vios features
    (
        'FEAT6F7G-8H9I-0123-FEAT-666666666666',
        'V2B3C4D5-E6F7-8901-VHCL-222222222222',
        N'Điều hòa tự động'
    ),
    (
        'FEAT7G8H-9I0J-1234-FEAT-777777777777',
        'V2B3C4D5-E6F7-8901-VHCL-222222222222',
        N'Camera 360 độ'
    ),
    (
        'FEAT8H9I-0J1K-2345-FEAT-888888888888',
        'V2B3C4D5-E6F7-8901-VHCL-222222222222',
        N'Bluetooth'
    ),
    (
        'FEAT9I0J-1K2L-3456-FEAT-999999999999',
        'V2B3C4D5-E6F7-8901-VHCL-222222222222',
        N'Cảm biến va chạm'
    ),
    (
        'FEATAJ1K-2L3M-4567-FEAT-AAAAAAAAAAAA',
        'V2B3C4D5-E6F7-8901-VHCL-222222222222',
        N'Khởi động bằng nút bấm'
    ),
    -- Honda Air Blade features
    (
        'FEATBK2L-3M4N-5678-FEAT-BBBBBBBBBBBB',
        'V3C4D5E6-F7G8-9012-VHCL-333333333333',
        N'Phanh ABS'
    ),
    (
        'FEATCL3M-4N5O-6789-FEAT-CCCCCCCCCCCC',
        'V3C4D5E6-F7G8-9012-VHCL-333333333333',
        N'Khóa thông minh'
    ),
    (
        'FEATDM4N-5O6P-7890-FEAT-DDDDDDDDDDDD',
        'V3C4D5E6-F7G8-9012-VHCL-333333333333',
        N'Đèn LED'
    ),
    (
        'FEATEN5O-6P7Q-8901-FEAT-EEEEEEEEEEEE',
        'V3C4D5E6-F7G8-9012-VHCL-333333333333',
        N'Cốp xe rộng'
    ),
    -- Mercedes C200 features
    (
        'FEATFO6P-7Q8R-9012-FEAT-FFFFFFFFFFFF',
        'V4D5E6F7-G8H9-0123-VHCL-444444444444',
        N'Nội thất da cao cấp'
    ),
    (
        'FEATGP7Q-8R9S-0123-FEAT-GGGGGGGGGGGG',
        'V4D5E6F7-G8H9-0123-VHCL-444444444444',
        N'Hệ thống âm thanh Burmester'
    ),
    (
        'FEATHQ8R-9S0T-1234-FEAT-HHHHHHHHHHHH',
        'V4D5E6F7-G8H9-0123-VHCL-444444444444',
        N'Điều hòa tự động 2 vùng'
    ),
    (
        'FEATIR9S-0T1U-2345-FEAT-IIIIIIIIIIII',
        'V4D5E6F7-G8H9-0123-VHCL-444444444444',
        N'Cửa sổ trời'
    ),
    (
        'FEATJS0T-1U2V-3456-FEAT-JJJJJJJJJJJJ',
        'V4D5E6F7-G8H9-0123-VHCL-444444444444',
        N'Hệ thống an toàn Mercedes me'
    ),
    (
        'FEATKT1U-2V3W-4567-FEAT-KKKKKKKKKKKK',
        'V4D5E6F7-G8H9-0123-VHCL-444444444444',
        N'Ghế chỉnh điện'
    ),
    -- BMW X3 features
    (
        'FEATLU2V-3W4X-5678-FEAT-LLLLLLLLLLLL',
        'V5E6F7G8-H9I0-1234-VHCL-555555555555',
        N'Hệ thống iDrive'
    ),
    (
        'FEATMV3W-4X5Y-6789-FEAT-MMMMMMMMMMMM',
        'V5E6F7G8-H9I0-1234-VHCL-555555555555',
        N'Dẫn động 4 bánh xDrive'
    ),
    (
        'FEATNW4X-5Y6Z-7890-FEAT-NNNNNNNNNNNN',
        'V5E6F7G8-H9I0-1234-VHCL-555555555555',
        N'Hệ thống âm thanh Harman Kardon'
    ),
    (
        'FEATOX5Y-6Z7A-8901-FEAT-OOOOOOOOOOOO',
        'V5E6F7G8-H9I0-1234-VHCL-555555555555',
        N'Cửa sổ trời toàn cảnh'
    ),
    (
        'FEATPY6Z-7A8B-9012-FEAT-PPPPPPPPPPPP',
        'V5E6F7G8-H9I0-1234-VHCL-555555555555',
        N'Hỗ trợ đỗ xe tự động'
    );
-- ====== SYSTEM SETTINGS ======
IF OBJECT_ID('dbo.system_settings', 'U') IS NULL CREATE TABLE system_settings (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    key_name NVARCHAR(100) NOT NULL UNIQUE,
    value NVARCHAR(MAX) NOT NULL,
    data_type NVARCHAR(20) NOT NULL DEFAULT 'string',
    description NVARCHAR(MAX),
    is_public BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
DELETE FROM system_settings;
INSERT INTO system_settings (
        id,
        key_name,
        value,
        data_type,
        description,
        is_public,
        created_at,
        updated_at
    )
VALUES (
        'SET1A2B3-C4D5-6789-SETT-111111111111',
        'platform_commission_rate',
        '0.15',
        'number',
        N'Tỷ lệ hoa hồng platform (15%)',
        0,
        '2024-01-01 00:00:00',
        '2024-01-01 00:00:00'
    ),
    (
        'SET2B3C4-D5E6-7890-SETT-222222222222',
        'service_fee_rate',
        '0.12',
        'number',
        N'Tỷ lệ phí dịch vụ (12%)',
        1,
        '2024-01-01 00:00:00',
        '2024-01-01 00:00:00'
    ),
    (
        'SET3C4D5-E6F7-8901-SETT-333333333333',
        'tax_rate',
        '0.08',
        'number',
        N'Tỷ lệ thuế (8%)',
        1,
        '2024-01-01 00:00:00',
        '2024-01-01 00:00:00'
    ),
    (
        'SET4D5E6-F7G8-9012-SETT-444444444444',
        'max_advance_booking_days',
        '365',
        'number',
        N'Số ngày tối đa có thể đặt trước',
        1,
        '2024-01-01 00:00:00',
        '2024-01-01 00:00:00'
    ),
    (
        'SET5E6F7-G8H9-0123-SETT-555555555555',
        'min_cancellation_hours',
        '24',
        'number',
        N'Số giờ tối thiểu để hủy booking',
        1,
        '2024-01-01 00:00:00',
        '2024-01-01 00:00:00'
    ),
    (
        'SET6F7G8-H9I0-1234-SETT-666666666666',
        'platform_name',
        'LuxeWay',
        'string',
        N'Tên platform',
        1,
        '2024-01-01 00:00:00',
        '2024-01-01 00:00:00'
    ),
    (
        'SET7G8H9-I0J1-2345-SETT-777777777777',
        'support_email',
        'support@luxeway.vn',
        'string',
        N'Email hỗ trợ khách hàng',
        1,
        '2024-01-01 00:00:00',
        '2024-01-01 00:00:00'
    ),
    (
        'SET8H9I0-J1K2-3456-SETT-888888888888',
        'support_phone',
        '1900-LUXEWAY',
        'string',
        N'Hotline hỗ trợ',
        1,
        '2024-01-01 00:00:00',
        '2024-01-01 00:00:00'
    );
-- ====== COUPONS ======
DELETE FROM coupons;
INSERT INTO coupons (
        code,
        discount_percentage,
        max_discount_amount,
        valid_from,
        valid_until,
        is_active,
        max_uses,
        current_uses,
        created_at
    )
VALUES (
        'WELCOME2024',
        15,
        200000.00,
        '2024-01-01 00:00:00',
        '2024-12-31 23:59:59',
        1,
        1000,
        245,
        '2024-01-01 00:00:00'
    ),
    (
        'SUMMER50K',
        5,
        50000.00,
        '2024-06-01 00:00:00',
        '2024-08-31 23:59:59',
        1,
        500,
        123,
        '2024-06-01 00:00:00'
    ),
    (
        'LONGTERM20',
        20,
        500000.00,
        '2024-01-01 00:00:00',
        '2024-12-31 23:59:59',
        1,
        200,
        45,
        '2024-01-01 00:00:00'
    ),
    (
        'STUDENT100K',
        10,
        100000.00,
        '2024-03-01 00:00:00',
        '2024-12-31 23:59:59',
        1,
        300,
        78,
        '2024-03-01 00:00:00'
    ),
    (
        'VIP25',
        25,
        1000000.00,
        '2024-01-01 00:00:00',
        '2024-12-31 23:59:59',
        1,
        100,
        12,
        '2024-01-01 00:00:00'
    );
-- ====== BOOKINGS & REVIEWS SEEDS (SQL Server Compatible UUIDs) ======
INSERT INTO bookings (
        id,
        vehicle_id,
        renter_id,
        owner_id,
        status,
        start_date,
        end_date,
        total_days,
        base_price,
        price_per_day,
        addons_total,
        insurance_fee,
        delivery_fee,
        service_fee,
        taxes,
        discount,
        total,
        deposit,
        deposit_refunded,
        include_insurance,
        include_delivery,
        created_at,
        updated_at
    )
VALUES (
        'BK111111-1111-1111-1111-111111111111',
        'V4D5E6F7-G8H9-0123-VHCL-444444444444',
        'B2C3D4E5-F6G7-8901-BCDE-234567890123',
        'F6G7H8I9-J0K1-2345-FGHI-678901234567',
        'COMPLETED',
        '2024-05-10',
        '2024-05-12',
        2,
        5000000.00,
        2500000.00,
        0.00,
        0.00,
        0.00,
        600000.00,
        400000.00,
        0.00,
        6000000.00,
        8000000.00,
        1,
        1,
        0,
        '2024-05-12 12:00:00',
        '2024-05-12 12:00:00'
    ),
    (
        'BK222222-2222-2222-2222-222222222222',
        'V6F7G8H9-I0J1-2345-VHCL-666666666666',
        'C3D4E5F6-G7H8-9012-CDEF-345678901234',
        'G7H8I9J0-K1L2-3456-GHIJ-789012345678',
        'COMPLETED',
        '2024-05-15',
        '2024-05-18',
        3,
        5400000.00,
        1800000.00,
        0.00,
        0.00,
        0.00,
        648000.00,
        432000.00,
        0.00,
        6480000.00,
        6000000.00,
        1,
        1,
        0,
        '2024-05-18 12:00:00',
        '2024-05-18 12:00:00'
    ),
    (
        'BK333333-3333-3333-3333-333333333333',
        'V8H9I0J1-K2L3-4567-VHCL-888888888888',
        'D4E5F6G7-H8I9-0123-DEFG-456789012345',
        'G7H8I9J0-K1L2-3456-GHIJ-789012345678',
        'COMPLETED',
        '2024-05-20',
        '2024-05-22',
        2,
        4400000.00,
        2200000.00,
        0.00,
        0.00,
        0.00,
        528000.00,
        352000.00,
        0.00,
        5280000.00,
        7000000.00,
        1,
        1,
        0,
        '2024-05-22 12:00:00',
        '2024-05-22 12:00:00'
    );
INSERT INTO reviews (
        id,
        vehicle_id,
        booking_id,
        reviewer_id,
        owner_id,
        rating,
        cleanliness,
        accuracy,
        communication,
        value_rating,
        comment,
        helpful,
        created_at,
        updated_at
    )
VALUES (
        'RV111111-1111-1111-1111-111111111111',
        'V4D5E6F7-G8H9-0123-VHCL-444444444444',
        'BK111111-1111-1111-1111-111111111111',
        'B2C3D4E5-F6G7-8901-BCDE-234567890123',
        'F6G7H8I9-J0K1-2345-FGHI-678901234567',
        5,
        5,
        5,
        5,
        5,
        N'Absolutely breathtaking experience. The car was in perfect condition, the owner was incredibly professional. LuxeWay has set a new standard for luxury rentals worldwide.',
        5,
        '2024-05-12 13:00:00',
        '2024-05-12 13:00:00'
    ),
    (
        'RV222222-2222-2222-2222-222222222222',
        'V6F7G8H9-I0J1-2345-VHCL-666666666666',
        'BK222222-2222-2222-2222-222222222222',
        'C3D4E5F6-G7H8-9012-CDEF-345678901234',
        'G7H8I9J0-K1L2-3456-GHIJ-789012345678',
        5,
        5,
        5,
        5,
        5,
        N'Rented a Camry for our anniversary and it was magical. The seamless delivery to our hotel, impeccable service, and the car itself left us speechless. Worth every penny.',
        4,
        '2024-05-18 13:00:00',
        '2024-05-18 13:00:00'
    ),
    (
        'RV333333-3333-3333-3333-333333333333',
        'V8H9I0J1-K2L3-4567-VHCL-888888888888',
        'BK333333-3333-3333-3333-333333333333',
        'D4E5F6G7-H8I9-0123-DEFG-456789012345',
        'G7H8I9J0-K1L2-3456-GHIJ-789012345678',
        5,
        5,
        5,
        5,
        5,
        N'I''ve rented from Turo, Hertz, and others. LuxeWay is in an entirely different league. The vetting process, insurance options, and overall experience is second to none.',
        8,
        '2024-05-22 13:00:00',
        '2024-05-22 13:00:00'
    );
-- ====== FAQS SEEDS ======
INSERT INTO faqs (question, answer, is_active, display_order)
VALUES (
        N'How does LuxeWay verify vehicles?',
        N'Every vehicle undergoes a comprehensive 120-point inspection by certified mechanics, including photo verification, document checks, and insurance validation before listing.',
        1,
        1
    ),
    (
        N'What insurance is included?',
        N'All rentals include our baseline $1M coverage. Premium plans up to $5M are available. You can also add your own insurance during booking.',
        1,
        2
    ),
    (
        N'Can I cancel my booking?',
        N'Yes. Free cancellation is available up to 48 hours before pickup. Late cancellations may incur a fee depending on the vehicle''s policy.',
        1,
        3
    ),
    (
        N'How does delivery work?',
        N'Owners with delivery enabled will bring the vehicle to your specified address. Fees vary by distance and are shown transparently at checkout.',
        1,
        4
    ),
    (
        N'Is there a minimum age requirement?',
        N'Renters must be at least 25 years old and hold a valid driving license for at least 3 years. Some exotic vehicles may have higher requirements.',
        1,
        5
    ),
    (
        N'How are payments processed?',
        N'We use Stripe and VNPay for secure payments. You can also use our LuxeWay wallet. Payments are only released to owners after successful pickup confirmation.',
        1,
        6
    );
-- ====== DISPUTES ====== 
DELETE FROM disputes;
INSERT INTO disputes (
        booking_id,
        reporter_id,
        reason,
        description,
        evidence_url,
        status,
        admin_decision,
        created_at,
        updated_at
    )
VALUES (
        'BK111111-1111-1111-1111-111111111111',
        'B2C3D4E5-F6G7-8901-BCDE-234567890123',
        N'Vehicle damaged upon return',
        N'Chủ xe cáo buộc tôi làm trầy xước đuôi xe nhưng vết xước này đã có từ trước khi nhận xe. Tôi có ảnh chụp bàn giao làm bằng chứng.',
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
        'OPEN',
        NULL,
        GETDATE(),
        GETDATE()
    ),
    (
        'BK222222-2222-2222-2222-222222222222',
        'C3D4E5F6-G7H8-9012-CDEF-345678901234',
        N'Renter late for pickup',
        N'Khách thuê đến muộn hơn 3 tiếng so với giờ hẹn mà không thông báo trước. Tôi yêu cầu bồi thường phí chờ đợi theo quy định.',
        NULL,
        'RESOLVED',
        N'Đã hoàn trả 10% tiền cọc cho chủ xe làm phí bồi thường trễ hẹn.',
        GETDATE(),
        GETDATE()
    );
-- ============================================================
-- HELP CENTER: DDL + SEED DATA
-- ============================================================

-- Drop dependent tables first
IF OBJECT_ID('dbo.support_ticket_messages', 'U') IS NOT NULL DROP TABLE dbo.support_ticket_messages;
IF OBJECT_ID('dbo.support_tickets', 'U') IS NOT NULL DROP TABLE dbo.support_tickets;
IF OBJECT_ID('dbo.help_articles', 'U') IS NOT NULL DROP TABLE dbo.help_articles;
IF OBJECT_ID('dbo.help_categories', 'U') IS NOT NULL DROP TABLE dbo.help_categories;

-- help_categories
CREATE TABLE dbo.help_categories (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    slug          NVARCHAR(100) NOT NULL UNIQUE,
    title         NVARCHAR(200) NOT NULL,
    description   NVARCHAR(500) NULL,
    icon          NVARCHAR(100) NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active     BIT NOT NULL DEFAULT 1,
    article_count INT NOT NULL DEFAULT 0,
    created_at    DATETIME2 DEFAULT GETDATE(),
    updated_at    DATETIME2 DEFAULT GETDATE()
);

-- help_articles
CREATE TABLE dbo.help_articles (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    category_id   BIGINT NOT NULL REFERENCES dbo.help_categories(id),
    title         NVARCHAR(300) NOT NULL,
    content       NVARCHAR(MAX) NOT NULL,
    tags          NVARCHAR(500) NULL,
    view_count    INT NOT NULL DEFAULT 0,
    is_published  BIT NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_at    DATETIME2 DEFAULT GETDATE(),
    updated_at    DATETIME2 DEFAULT GETDATE()
);

-- support_tickets
CREATE TABLE dbo.support_tickets (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id       NVARCHAR(36) NOT NULL REFERENCES dbo.users(id),
    booking_id    NVARCHAR(36) NULL REFERENCES dbo.bookings(id),
    subject       NVARCHAR(300) NOT NULL,
    category      NVARCHAR(100) NOT NULL,
    priority      NVARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    status        NVARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_at    DATETIME2 DEFAULT GETDATE(),
    updated_at    DATETIME2 DEFAULT GETDATE()
);

-- support_ticket_messages
CREATE TABLE dbo.support_ticket_messages (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    ticket_id     BIGINT NOT NULL REFERENCES dbo.support_tickets(id),
    sender_type   NVARCHAR(10) NOT NULL,
    message       NVARCHAR(MAX) NOT NULL,
    created_at    DATETIME2 DEFAULT GETDATE()
);

-- ============================================================
-- SEED: help_categories
-- ============================================================
INSERT INTO dbo.help_categories (slug, title, description, icon, display_order, is_active, article_count) VALUES
(N'booking',    N'Booking & Reservations', N'How to search, book, modify, or cancel a vehicle rental.', N'Calendar', 1, 1, 0),
(N'payment',    N'Payments & Billing',     N'VNPay, LuxeWallet, refunds, invoices, and pricing.',        N'CreditCard', 2, 1, 0),
(N'vehicle',    N'Vehicle & Delivery',     N'Delivery options, pickup process, vehicle condition standards.', N'Car', 3, 1, 0),
(N'account',    N'Account & Profile',      N'Registration, login, profile updates, and password.',       N'User', 4, 1, 0),
(N'kyc',        N'KYC & Verification',     N'Identity documents, driving license, and verification timelines.', N'BadgeCheck', 5, 1, 0),
(N'insurance',  N'Insurance & Safety',     N'Coverage details, claims process, and incident reporting.', N'Shield', 6, 1, 0),
(N'owner',      N'For Vehicle Owners',     N'Listing your vehicle, pricing, calendar, and owner analytics.', N'Key', 7, 1, 0),
(N'dispute',    N'Disputes & Issues',      N'How to raise a dispute, what to expect, and resolution timelines.', N'AlertTriangle', 8, 1, 0);

-- ============================================================
-- SEED: help_articles (Booking category)
-- ============================================================
INSERT INTO dbo.help_articles (category_id, title, content, tags, display_order, is_published) VALUES
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'booking'),
  N'How do I book a vehicle on LuxeWay?',
  N'1. Go to the Marketplace and use the search bar to find vehicles by city, date, or category.\n2. Click on any vehicle card to view details.\n3. Select your pick-up and return dates using the calendar.\n4. Choose any optional add-ons (extra insurance, delivery).\n5. Review the pricing breakdown and click "Book Now".\n6. Sign the digital contract and complete payment via VNPay or LuxeWallet.\n\nYou will receive a confirmation email immediately after booking.',
  N'book, reservation, how to, search',
  1, 1
),
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'booking'),
  N'Can I cancel my booking?',
  N'Yes. LuxeWay offers flexible cancellation:\n\n**Free cancellation**: Cancel more than 48 hours before your pickup time for a full refund.\n**Late cancellation**: Cancellations within 48 hours may incur a fee of up to 50% of the first day''s rental price, depending on the owner''s policy.\n\nTo cancel:\n1. Go to Dashboard → My Bookings.\n2. Select the booking and click "Cancel Booking".\n3. Confirm the cancellation. Refunds are processed in 3–5 business days.',
  N'cancel, refund, policy',
  2, 1
),
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'booking'),
  N'How do I modify my booking dates?',
  N'Date modifications must be requested through the owner via the in-app chat. The owner can approve or decline the modification.\n\nIf the new dates result in a price difference:\n- **Extra cost**: You will be charged the difference.\n- **Lower cost**: A partial refund is issued.\n\nModifications are not guaranteed and depend on vehicle availability.',
  N'modify, change dates, reschedule',
  3, 1
);

-- ============================================================
-- SEED: help_articles (Payment category)
-- ============================================================
INSERT INTO dbo.help_articles (category_id, title, content, tags, display_order, is_published) VALUES
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'payment'),
  N'What payment methods are accepted?',
  N'LuxeWay supports the following payment methods:\n\n**VNPay** — Vietnamese bank cards, e-wallets (MoMo, ZaloPay via VNPay), and international Visa/Mastercard.\n**LuxeWallet** — Top up your in-app wallet for instant 1-click payment at checkout.\n\nAll payments are encrypted and processed through certified payment gateways. LuxeWay never stores your card details.',
  N'payment, VNPay, wallet, card',
  1, 1
),
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'payment'),
  N'When will I receive my refund?',
  N'Refund timelines depend on the method used:\n\n- **LuxeWallet refunds**: Instant — funds appear in your wallet immediately.\n- **VNPay refunds**: 3–5 business days to your original payment method.\n\nRefunds are triggered automatically when a cancellation is confirmed. If you have not received your refund after 7 days, please contact support with your booking ID.',
  N'refund, money back, timeline',
  2, 1
),
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'payment'),
  N'How does the security deposit work?',
  N'A refundable security deposit is required for all bookings. It is:\n\n- **Held** at the time of booking (not charged to your account).\n- **Released** within 24 hours after the vehicle is returned in its original condition.\n- **Partially or fully deducted** only if damage, fuel shortfall, or late return is confirmed by both parties.\n\nDeposit amounts vary by vehicle and are displayed clearly on the vehicle detail page.',
  N'deposit, security, hold',
  3, 1
);

-- ============================================================
-- SEED: help_articles (Vehicle category)
-- ============================================================
INSERT INTO dbo.help_articles (category_id, title, content, tags, display_order, is_published) VALUES
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'vehicle'),
  N'How does vehicle delivery work?',
  N'Owners who have enabled delivery will bring the vehicle directly to your specified address.\n\n**During booking**: If delivery is available, you''ll see a "Delivery Available" badge on the vehicle listing. Enter your delivery address at checkout.\n\n**Delivery fee**: Calculated based on distance from the owner''s location. This is shown transparently before you confirm.\n\n**Pickup option**: You can also choose to pick up the vehicle from the owner''s location at no extra cost.',
  N'delivery, pickup, address',
  1, 1
),
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'vehicle'),
  N'What condition should I return the vehicle in?',
  N'Return the vehicle in the same condition you received it:\n\n- Same fuel level (check the fuel indicator at handover).\n- No new scratches, dents, or damage.\n- Interior cleaned — no food, rubbish, or stains.\n- On time — late returns may result in a fee per extra hour.\n\nBoth you and the owner will conduct a handover inspection. Take photos before and after your rental as evidence.',
  N'condition, return, clean, fuel',
  2, 1
);

-- ============================================================
-- SEED: help_articles (KYC category)
-- ============================================================
INSERT INTO dbo.help_articles (category_id, title, content, tags, display_order, is_published) VALUES
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'kyc'),
  N'What documents do I need to upload for KYC?',
  N'To complete KYC verification you must upload:\n\n1. **Driver''s License** — front and back of your government-issued license.\n2. **National ID or Passport** — for identity verification.\n3. **Selfie with ID** — a clear photo of you holding your ID document.\n\nOptional: Personal insurance certificate for additional coverage.\n\n**Verification timeline**: Usually completed within 24 hours on business days.',
  N'KYC, documents, verification, license',
  1, 1
),
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'kyc'),
  N'Is there a minimum age requirement?',
  N'Yes. To rent a vehicle on LuxeWay:\n\n- **Minimum age**: 25 years old.\n- **Driving experience**: Valid license held for at least 3 years.\n- **Exotic/luxury vehicles**: Some owners set a minimum age of 28–30 years.\n\nAge requirements are displayed on each vehicle''s listing page.',
  N'age, minimum, requirement',
  2, 1
);

-- ============================================================
-- SEED: help_articles (Insurance category)
-- ============================================================
INSERT INTO dbo.help_articles (category_id, title, content, tags, display_order, is_published) VALUES
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'insurance'),
  N'What insurance is included with every rental?',
  N'Every LuxeWay booking includes our standard coverage:\n\n**Basic Coverage (included)**:\n- Third-party liability: up to ₫500,000,000.\n- Vehicle damage from collision (subject to excess).\n- Theft protection.\n\n**Premium Plans** (optional, selected at checkout):\n- Reduced excess.\n- Personal accident coverage.\n- Zero-deductible protection.\n\nAll coverage details are available in the digital contract before you confirm your booking.',
  N'insurance, coverage, protection, included',
  1, 1
);

-- ============================================================
-- SEED: help_articles (Owner category)
-- ============================================================
INSERT INTO dbo.help_articles (category_id, title, content, tags, display_order, is_published) VALUES
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'owner'),
  N'How do I list my vehicle on LuxeWay?',
  N'To list your vehicle:\n\n1. Create an Owner account or upgrade your existing account.\n2. Complete KYC verification (required for all owners).\n3. Go to Owner Dashboard → Add Vehicle.\n4. Upload photos, set pricing per day, and configure availability.\n5. Submit for review — our team verifies the listing within 24 hours.\n\nOnce approved, your vehicle appears in the marketplace and you start receiving booking requests.',
  N'list, owner, add vehicle, register',
  1, 1
),
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'owner'),
  N'How do I get paid for rentals?',
  N'Payment is released to your LuxeWallet automatically:\n\n- **Instant Book**: Payment is released 24 hours after the rental starts.\n- **Approval required**: Payment is released after you confirm the booking.\n\n**Platform commission**: LuxeWay charges 15% of the rental price.\n\nYou can withdraw your LuxeWallet balance to your bank account via VNPay at any time.',
  N'payment, earnings, commission, withdraw',
  2, 1
);

-- ============================================================
-- SEED: help_articles (Dispute category)
-- ============================================================
INSERT INTO dbo.help_articles (category_id, title, content, tags, display_order, is_published) VALUES
(
  (SELECT id FROM dbo.help_categories WHERE slug = N'dispute'),
  N'How do I raise a dispute?',
  N'If you experience an issue during or after a rental:\n\n1. Go to Dashboard → My Bookings.\n2. Find the relevant booking and click "Open Dispute".\n3. Select a reason (damage, no-show, misrepresentation, etc.).\n4. Describe the issue and upload photo evidence.\n5. Submit — our team will respond within 48 hours.\n\n**Important**: Disputes must be raised within 72 hours of the rental end date.',
  N'dispute, complaint, issue, damage',
  1, 1
);


-- ============================================================
-- ECOSYSTEM SEED DATA - 15 MOTORBIKES & 20 CARS
-- ============================================================

-- Seed additional 15+ Motorbikes
INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, description, thumbnail_url, price_per_day, price_per_week, deposit, city, country, address, latitude, longitude, horsepower, top_speed, acceleration, seats, doors, transmission, fuel_type, range_km, engine_size, color, license_plate, min_rental_days, max_rental_days, advance_booking_days, status, rating, total_reviews, total_bookings, is_verified, is_featured, instant_book, delivery_available, delivery_fee, created_at, updated_at) VALUES
('VM-01', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda Vision 2022 - Xe Đẹp Tiết Kiệm', N'Honda', N'Vision', 2022, 'SCOOTER', N'Xe Vision đời mới màu đỏ đô sạch sẽ, máy êm thích hợp lượn phố.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 130000, 850000, 1000000, N'Hồ Chí Minh', N'Vietnam', N'Phú Nhuận, TP.HCM', 10.7994, 106.6803, 9, 95, 12.0, 2, 0, 'AUTOMATIC', 'GASOLINE', 250, '110cc', N'Đỏ', '59F1-99901', 1, 30, 365, 'AVAILABLE', 4.8, 12, 18, 1, 1, 1, 1, 20000, GETDATE(), GETDATE()),
('VM-02', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda Vision 2023 - Bản Cao Cấp', N'Honda', N'Vision', 2023, 'SCOOTER', N'Xe ga Honda Vision bản đặc biệt đen nhám cực ngầu, chạy đầm máy.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 150000, 950000, 1000000, N'Hồ Chí Minh', N'Vietnam', N'Quận 1, TP.HCM', 10.7769, 106.7009, 9, 95, 12.0, 2, 0, 'AUTOMATIC', 'GASOLINE', 250, '110cc', N'Đen Nhám', '59F1-99902', 1, 30, 365, 'AVAILABLE', 4.9, 8, 15, 1, 1, 1, 1, 20000, GETDATE(), GETDATE()),
('VM-03', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda Vision 2021 - Đi Học Đi Làm', N'Honda', N'Vision', 2021, 'SCOOTER', N'Xe Vision trắng gia đình đi giữ gìn kỹ, xăng cộ cực tốt.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 120000, 800000, 1000000, N'Hồ Chí Minh', N'Vietnam', N'Quận 3, TP.HCM', 10.7756, 106.6917, 9, 95, 12.0, 2, 0, 'AUTOMATIC', 'GASOLINE', 250, '110cc', N'Trắng', '59F1-99903', 1, 30, 365, 'AVAILABLE', 4.7, 20, 30, 1, 0, 1, 1, 20000, GETDATE(), GETDATE()),
('VM-04', 'F6G7H8I9-J0K1-2345-FGHI-678901234567', N'Honda Air Blade 125i - Đỏ Đen Thể Thao', N'Honda', N'Air Blade', 2022, 'AUTOMATIC_SCOOTER', N'Air Blade 125cc chạy êm, phanh cơ an toàn, có sạc điện thoại tiện lợi.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 180000, 1100000, 1500000, N'Hà Nội', N'Vietnam', N'Cầu Giấy, Hà Nội', 21.0313, 105.7981, 11, 105, 10.5, 2, 0, 'AUTOMATIC', 'GASOLINE', 220, '125cc', N'Đỏ Đen', '29F1-99904', 1, 30, 365, 'AVAILABLE', 4.85, 15, 22, 1, 1, 1, 1, 30000, GETDATE(), GETDATE()),
('VM-05', 'F6G7H8I9-J0K1-2345-FGHI-678901234567', N'Honda Air Blade 160i - Phanh ABS Siêu Khỏe', N'Honda', N'Air Blade', 2023, 'AUTOMATIC_SCOOTER', N'Xe AB 160cc mạnh mẽ phanh ABS an toàn tuyệt đối, máy siêu bốc.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 250000, 1500000, 2000000, N'Hà Nội', N'Vietnam', N'Hai Bà Trưng, Hà Nội', 21.0245, 105.8525, 15, 115, 8.5, 2, 0, 'AUTOMATIC', 'GASOLINE', 210, '160cc', N'Xanh Xám', '29F1-99905', 1, 30, 365, 'AVAILABLE', 4.95, 5, 12, 1, 1, 1, 1, 30000, GETDATE(), GETDATE()),
('VM-06', 'F6G7H8I9-J0K1-2345-FGHI-678901234567', N'Yamaha Exciter 155 VVA - Cam Đen Cực Chất', N'Yamaha', N'Exciter 155', 2022, 'MANUAL_MOTORCYCLE', N'Xe côn tay Exciter 155 VVA máy bốc, ga mượt, hoàn hảo cho phượt thủ.', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', 200000, 1300000, 2000000, N'Đà Nẵng', N'Vietnam', N'Hải Châu, Đà Nẵng', 16.0678, 108.2208, 17, 125, 7.5, 2, 0, 'MANUAL', 'GASOLINE', 200, '155cc', N'Cam Đen', '43F1-99906', 1, 30, 365, 'AVAILABLE', 4.88, 18, 25, 1, 1, 1, 1, 25000, GETDATE(), GETDATE()),
('VM-07', 'F6G7H8I9-J0K1-2345-FGHI-678901234567', N'VinFast Evo200 - Xe Điện Thời Trang', N'VinFast', N'Evo200', 2023, 'ELECTRIC_BIKE', N'Evo200 đi êm ái thích hợp dạo biển phố Đà Nẵng, sạc đầy đi được 150km.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 130000, 800000, 1500000, N'Đà Nẵng', N'Vietnam', N'Ngũ Hành Sơn, Đà Nẵng', 16.0583, 108.2608, 3, 70, 15.0, 2, 0, 'AUTOMATIC', 'ELECTRIC', 150, 'Electric', N'Vàng', '43F1-99907', 1, 30, 365, 'AVAILABLE', 4.76, 10, 14, 1, 0, 1, 1, 20000, GETDATE(), GETDATE()),
('VM-08', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda Lead 2022 - Cốp Siêu Rộng Rãi', N'Honda', N'Lead', 2022, 'SCOOTER', N'Xe Lead cốp rộng mênh mông đựng cả thế giới, thích hợp mua sắm du lịch.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 160000, 1000000, 1500000, N'Hồ Chí Minh', N'Vietnam', N'Tân Bình, TP.HCM', 10.8014, 106.6525, 11, 100, 11.0, 2, 0, 'AUTOMATIC', 'GASOLINE', 230, '125cc', N'Đỏ Đô', '59F1-99908', 1, 30, 365, 'AVAILABLE', 4.82, 22, 28, 1, 1, 1, 1, 20000, GETDATE(), GETDATE()),
('VM-09', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda SH125i 2023 - Sang Chảnh Đẳng Cấp', N'Honda', N'SH125i', 2023, 'SCOOTER', N'SH 125i xám xi măng sang chảnh thời thượng, xe chạy cực kỳ êm ái.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 350000, 2200000, 3000000, N'Hồ Chí Minh', N'Vietnam', N'Quận 7, TP.HCM', 10.7416, 106.7214, 12, 110, 10.0, 2, 0, 'AUTOMATIC', 'GASOLINE', 210, '125cc', N'Xám Xi Măng', '59F1-99909', 1, 30, 365, 'AVAILABLE', 4.96, 14, 20, 1, 1, 1, 1, 40000, GETDATE(), GETDATE()),
('VM-10', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda SH160i 2023 - ABS Cao Cấp', N'Honda', N'SH160i', 2023, 'SCOOTER', N'Honda SH160i ABS cực kỳ mạnh mẽ sang trọng, thu hút mọi ánh nhìn.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 450000, 2800000, 4000000, N'Hồ Chí Minh', N'Vietnam', N'Quận 2, TP.HCM', 10.7872, 106.7490, 16, 120, 8.0, 2, 0, 'AUTOMATIC', 'GASOLINE', 200, '156cc', N'Trắng', '59F1-99910', 1, 30, 365, 'AVAILABLE', 4.98, 9, 14, 1, 1, 1, 1, 40000, GETDATE(), GETDATE()),
('VM-11', 'F6G7H8I9-J0K1-2345-FGHI-678901234567', N'Yamaha Sirius 2021 - Tiết Kiệm Bền Bỉ', N'Yamaha', N'Sirius', 2021, 'MANUAL_MOTORCYCLE', N'Sirius số tròn bền bỉ, thích hợp đi phượt ngắn dã ngoại giá cực rẻ.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 100000, 600000, 1000000, N'Đà Nẵng', N'Vietnam', N'Liên Chiểu, Đà Nẵng', 16.0624, 108.1513, 8, 90, 13.0, 2, 0, 'MANUAL', 'GASOLINE', 260, '110cc', N'Đen Bạc', '43F1-99911', 1, 30, 365, 'AVAILABLE', 4.65, 34, 45, 1, 0, 1, 1, 20000, GETDATE(), GETDATE()),
('VM-12', 'F6G7H8I9-J0K1-2345-FGHI-678901234567', N'Yamaha Grande 2023 - Dành Cho Phái Đẹp', N'Yamaha', N'Grande', 2023, 'SCOOTER', N'Xe máy Grande trắng thời trang sang trọng, cốp to và máy cực kỳ êm.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 180000, 1100000, 1500000, N'Hà Nội', N'Vietnam', N'Ba Đình, Hà Nội', 21.0361, 105.8275, 8, 95, 12.5, 2, 0, 'AUTOMATIC', 'GASOLINE', 250, '125cc', N'Trắng Ngọc Trai', '29F1-99912', 1, 30, 365, 'AVAILABLE', 4.88, 11, 16, 1, 1, 1, 1, 30000, GETDATE(), GETDATE()),
('VM-13', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'VinFast Feliz S - Xe Máy Điện Tiện Lợi', N'VinFast', N'Feliz S', 2023, 'ELECTRIC_BIKE', N'Feliz S xe điện chất lượng cao của VinFast chạy êm ái, pin LFP cao cấp.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 160000, 1000000, 1500000, N'Hồ Chí Minh', N'Vietnam', N'Gò Vấp, TP.HCM', 10.8388, 106.6669, 4, 80, 14.0, 2, 0, 'AUTOMATIC', 'ELECTRIC', 120, 'Electric', N'Xanh Dương', '59F1-99913', 1, 30, 365, 'AVAILABLE', 4.78, 7, 11, 1, 1, 1, 1, 20000, GETDATE(), GETDATE()),
('VM-14', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'VinFast Klara S - Phong Cách Châu Âu', N'VinFast', N'Klara S', 2022, 'ELECTRIC_BIKE', N'Klara S mang đậm thiết kế Ý lịch lãm, đi mượt mà tiết kiệm.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 180000, 1200000, 1500000, N'Hồ Chí Minh', N'Vietnam', N'Bình Thạnh, TP.HCM', 10.8030, 106.6974, 4, 80, 13.5, 2, 0, 'AUTOMATIC', 'ELECTRIC', 120, 'Electric', N'Trắng', '59F1-99914', 1, 30, 365, 'AVAILABLE', 4.85, 12, 19, 1, 1, 1, 1, 20000, GETDATE(), GETDATE()),
('VM-15', 'F6G7H8I9-J0K1-2345-FGHI-678901234567', N'Kawasaki Versys X300 - Phượt Tour Chuyên Nghiệp', N'Kawasaki', N'Versys X300', 2022, 'ADVENTURE_BIKE', N'Versys X300 dòng Adventure chuyên tour đi êm ái đầm chắc, thích hợp đi đèo.', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', 650000, 4000000, 5000000, N'Hà Nội', N'Vietnam', N'Tây Hồ, Hà Nội', 21.0584, 105.8242, 40, 140, 6.0, 2, 0, 'MANUAL', 'GASOLINE', 350, '300cc', N'Xám Xanh', '29F1-99915', 1, 30, 365, 'AVAILABLE', 4.95, 21, 28, 1, 1, 1, 1, 50000, GETDATE(), GETDATE());

-- Seed additional 20+ Cars
INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, description, thumbnail_url, price_per_day, price_per_week, deposit, city, country, address, latitude, longitude, horsepower, top_speed, acceleration, seats, doors, transmission, fuel_type, range_km, engine_size, color, license_plate, min_rental_days, max_rental_days, advance_booking_days, status, rating, total_reviews, total_bookings, is_verified, is_featured, instant_book, delivery_available, delivery_fee, created_at, updated_at) VALUES
('VC-01', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', N'Toyota Vios 2023 - Đầm Chắc Tiết Kiệm', N'Toyota', N'Vios', 2023, 'SEDAN', N'Vios G 2023 số tự động mới tinh chạy êm, siêu tiết kiệm nhiên liệu.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', 800000, 5000000, 3000000, N'Hồ Chí Minh', N'Vietnam', N'Tân Bình, TP.HCM', 10.8014, 106.6525, 107, 175, 12.0, 5, 4, 'AUTOMATIC', 'GASOLINE', 600, '1.5L', N'Trắng', '51G-99901', 1, 30, 365, 'AVAILABLE', 4.9, 14, 20, 1, 1, 1, 1, 50000, GETDATE(), GETDATE()),
('VC-02', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', N'Toyota Fortuner 2022 - SUV 7 Chỗ Mạnh Mẽ', N'Toyota', N'Fortuner', 2022, 'SUV', N'Fortuner máy dầu số tự động 7 chỗ gầm cao, đi đèo dốc cực tốt.', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800', 1400000, 9000000, 5000000, N'Hồ Chí Minh', N'Vietnam', N'Quận 7, TP.HCM', 10.7416, 106.7214, 150, 180, 11.5, 7, 5, 'AUTOMATIC', 'DIESEL', 650, '2.4L Diesel', N'Đen', '51G-99902', 1, 30, 365, 'AVAILABLE', 4.88, 22, 30, 1, 1, 1, 1, 80000, GETDATE(), GETDATE()),
('VC-03', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', N'Mazda CX-5 2022 - Crossover Trẻ Trung', N'Mazda', N'CX-5', 2022, 'SUV', N'CX5 Premium 2.0 màu đỏ đô, hệ thống loa Bose nghe nhạc cực hay.', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', 1000000, 6500000, 4000000, N'Hồ Chí Minh', N'Vietnam', N'Quận 1, TP.HCM', 10.7769, 106.7009, 154, 190, 9.5, 5, 5, 'AUTOMATIC', 'GASOLINE', 580, '2.0L', N'Đỏ Pha Lê', '51G-99903', 1, 30, 365, 'AVAILABLE', 4.95, 31, 42, 1, 1, 1, 1, 60000, GETDATE(), GETDATE()),
('VC-04', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', N'VinFast VF8 Plus 2023 - Xe Điện VIP', N'VinFast', N'VF8', 2023, 'ELECTRIC_CAR', N'VF8 Plus 2 cầu mạnh mẽ, có ADAS tự lái thông minh, da Nappa cao cấp.', 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800', 1300000, 8500000, 5000000, N'Hà Nội', N'Vietnam', N'Cầu Giấy, Hà Nội', 21.0313, 105.7981, 402, 200, 5.5, 5, 5, 'AUTOMATIC', 'ELECTRIC', 400, 'Electric', N'Xám Titan', '30H-99904', 1, 30, 365, 'AVAILABLE', 4.92, 18, 25, 1, 1, 1, 1, 80000, GETDATE(), GETDATE()),
('VC-05', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', N'VinFast VF9 Plus - SUV Điện 7 Chỗ Siêu Rộng', N'VinFast', N'VF9', 2023, 'ELECTRIC_CAR', N'VF9 bản 6 ghế thương gia có massage hàng ghế sau, cực rộng rãi đẳng cấp.', 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800', 2000000, 13000000, 10000000, N'Hà Nội', N'Vietnam', N'Hai Bà Trưng, Hà Nội', 21.0245, 105.8525, 402, 200, 6.5, 6, 5, 'AUTOMATIC', 'ELECTRIC', 420, 'Electric', N'Đen', '30H-99905', 1, 30, 365, 'AVAILABLE', 4.97, 8, 14, 1, 1, 1, 1, 100000, GETDATE(), GETDATE()),
('VC-06', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', N'Kia Accent 2022 - Giá Tốt Gia Đình', N'Kia', N'Accent', 2022, 'SEDAN', N'Accent số tự động giá rẻ cực tiết kiệm xăng thích hợp chạy gia đình đô thị.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', 650000, 4200000, 3000000, N'Hồ Chí Minh', N'Vietnam', N'Gò Vấp, TP.HCM', 10.8388, 106.6669, 100, 170, 13.0, 5, 4, 'AUTOMATIC', 'GASOLINE', 600, '1.4L', N'Trắng', '51G-99906', 1, 30, 365, 'AVAILABLE', 4.75, 29, 36, 1, 0, 1, 1, 50000, GETDATE(), GETDATE()),
('VC-07', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', N'Toyota Innova 2021 - 8 Chỗ Gia Đình Du Lịch', N'Toyota', N'Innova', 2021, 'MPV', N'Innova thần thánh 8 chỗ ngồi siêu rộng rãi đi du lịch cực bền bỉ đầm chắc.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', 900000, 5800000, 4000000, N'Hồ Chí Minh', N'Vietnam', N'Bình Thạnh, TP.HCM', 10.8030, 106.6974, 137, 160, 14.0, 8, 5, 'MANUAL', 'GASOLINE', 550, '2.0L', N'Bạc', '51G-99907', 1, 30, 365, 'AVAILABLE', 4.8, 45, 60, 1, 1, 1, 1, 60000, GETDATE(), GETDATE()),
('VC-08', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', N'Hyundai Accent 2023 - Đài Mới Trẻ Trung', N'Hyundai', N'Accent', 2023, 'SEDAN', N'Accent 2023 thiết kế cá tính sang trọng, đi êm ái máy 1.4 bốc vừa phải.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', 700000, 4500000, 3000000, N'Hà Nội', N'Vietnam', N'Tây Hồ, Hà Nội', 21.0584, 105.8242, 100, 172, 12.5, 5, 4, 'AUTOMATIC', 'GASOLINE', 620, '1.4L', N'Đỏ', '30H-99908', 1, 30, 365, 'AVAILABLE', 4.88, 12, 18, 1, 1, 1, 1, 50000, GETDATE(), GETDATE()),
('VC-09', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', N'Hyundai Santa Fe 2022 - SUV Máy Dầu Đỉnh Cao', N'Hyundai', N'Santa Fe', 2022, 'SUV', N'Santa Fe Premium máy dầu chạy cực êm không mùi, full cửa sổ trời cảnh báo va chạm.', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800', 1500000, 9500000, 5000000, N'Hà Nội', N'Vietnam', N'Đống Đa, Hà Nội', 21.0285, 105.8542, 202, 195, 9.0, 7, 5, 'AUTOMATIC', 'DIESEL', 700, '2.2L SmartStream', N'Xanh Đá', '30H-99909', 1, 30, 365, 'AVAILABLE', 4.96, 32, 45, 1, 1, 1, 1, 80000, GETDATE(), GETDATE()),
('VC-10', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', N'Ford Ranger Wildtrak 2022 - Bán Tải Hầm Hố', N'Ford', N'Ranger Wildtrak', 2022, 'PICKUP', N'Bán tải Ranger Wildtrak 2.0 Bi-Turbo kéo khỏe, phượt Tây Bắc tuyệt cú mèo.', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800', 1100000, 7000000, 5000000, N'Hà Nội', N'Vietnam', N'Nam Từ Liêm, Hà Nội', 21.0378, 105.7804, 213, 180, 10.0, 5, 4, 'AUTOMATIC', 'DIESEL', 600, '2.0L Bi-Turbo', N'Cam', '30H-99910', 1, 30, 365, 'AVAILABLE', 4.9, 19, 28, 1, 1, 1, 1, 70000, GETDATE(), GETDATE()),
('VC-11', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', N'Mazda 3 2023 - Sedan Đẹp Nhất Phân Khúc', N'Mazda', N'Mazda 3', 2023, 'SEDAN', N'Mazda 3 thế hệ mới màu trắng, thiết kế Kodo cực sang trọng đẳng cấp thanh lịch.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', 800000, 5200000, 3000000, N'Hồ Chí Minh', N'Vietnam', N'Phú Nhuận, TP.HCM', 10.7994, 106.6803, 110, 185, 10.8, 5, 4, 'AUTOMATIC', 'GASOLINE', 580, '1.5L', N'Trắng', '51G-99911', 1, 30, 365, 'AVAILABLE', 4.86, 15, 21, 1, 1, 1, 1, 50000, GETDATE(), GETDATE()),
('VC-12', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', N'Mitsubishi Xpander 2023 - 7 Chỗ Quốc Dân', N'Mitsubishi', N'Innova', 2023, 'MPV', N'Xpander đời mới rộng rãi cực tiết kiệm nhiên liệu, lựa chọn số 1 cho gia đình.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', 850000, 5500000, 3000000, N'Hồ Chí Minh', N'Vietnam', N'Quận 12, TP.HCM', 10.8672, 106.6783, 104, 160, 13.5, 7, 5, 'AUTOMATIC', 'GASOLINE', 600, '1.5L MIVEC', N'Bạc', '51G-99912', 1, 30, 365, 'AVAILABLE', 4.83, 38, 50, 1, 1, 1, 1, 60000, GETDATE(), GETDATE()),
('VC-13', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', N'Mercedes C200 2022 - Xe Đức Sang Trọng', N'Mercedes-Benz', N'C200', 2022, 'LUXURY', N'Mercedes C200 Avantgarde sang trọng lịch lãm, thích hợp cưới hỏi công tác.', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 2000000, 13000000, 10000000, N'Hà Nội', N'Vietnam', N'Hoàn Kiếm, Hà Nội', 21.0285, 105.8542, 204, 240, 7.3, 5, 4, 'AUTOMATIC', 'GASOLINE', 500, '1.5L EQ Boost', N'Đen', '30H-99913', 1, 30, 365, 'AVAILABLE', 4.97, 11, 16, 1, 1, 1, 1, 100000, GETDATE(), GETDATE()),
('VC-14', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', N'BMW 320i Sport Line - Trải Nghiệm Thể Thao', N'BMW', N'BMW 320i', 2022, 'LUXURY', N'BMW 3-Series dẫn động cầu sau lái cực bốc, đầm chắc chuẩn chất Đức.', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 2200000, 14000000, 10000000, N'Hà Nội', N'Vietnam', N'Ba Đình, Hà Nội', 21.0361, 105.8275, 184, 235, 7.1, 5, 4, 'AUTOMATIC', 'GASOLINE', 520, '2.0L TwinPower', N'Trắng', '30H-99914', 1, 30, 365, 'AVAILABLE', 4.99, 7, 10, 1, 1, 1, 1, 100000, GETDATE(), GETDATE()),
('VC-15', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', N'Kia Morning 2022 - Xe Đô Thị Nhỏ Gọn', N'Kia', N'Morning', 2022, 'CITY_CAR', N'Kia Morning số tự động nhỏ nhắn dễ luồn lách ngõ hẻm Sài Gòn, rất tiết kiệm xăng.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', 500000, 3200000, 2000000, N'Hồ Chí Minh', N'Vietnam', N'Bình Thạnh, TP.HCM', 10.8030, 106.6974, 83, 150, 14.5, 5, 4, 'AUTOMATIC', 'GASOLINE', 500, '1.25L', N'Đỏ', '51G-99915', 1, 30, 365, 'AVAILABLE', 4.7, 15, 23, 1, 0, 1, 0, 30000, GETDATE(), GETDATE()),
('VC-16', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', N'Hyundai Grand i10 2023 - Đời Mới Linh Hoạt', N'Hyundai', N'Accent', 2023, 'CITY_CAR', N'Grand i10 hatchback đời mới chạy đầm chắc, cabin rộng hơn Morning.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', 600000, 3800000, 2000000, N'Hồ Chí Minh', N'Vietnam', N'Quận 10, TP.HCM', 10.7762, 106.6702, 83, 155, 14.0, 5, 5, 'AUTOMATIC', 'GASOLINE', 520, '1.2L', N'Trắng', '51G-99916', 1, 30, 365, 'AVAILABLE', 4.8, 11, 19, 1, 1, 1, 1, 40000, GETDATE(), GETDATE()),
('VC-17', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', N'Hyundai Tucson 2023 - Xe Nhật Đầm Ấm', N'Hyundai', N'Tucson', 2023, 'SUV', N'Hyundai Tucson 2023 bản xăng đặc biệt nội thất siêu rộng, cốp điện tiện lợi.', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800', 1100000, 7200000, 4000000, N'Hà Nội', N'Vietnam', N'Cầu Giấy, Hà Nội', 21.0313, 105.7981, 156, 185, 10.5, 5, 5, 'AUTOMATIC', 'GASOLINE', 550, '2.0L', N'Đen', '30H-99917', 1, 30, 365, 'AVAILABLE', 4.89, 9, 13, 1, 1, 1, 1, 60000, GETDATE(), GETDATE()),
('VC-18', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', N'Toyota Innova Cross 2024 - Hybrid Đời Mới', N'Toyota', N'Innova', 2024, 'MPV', N'Innova Cross Hybrid siêu êm ái rộng rãi, tiết kiệm xăng đáng kinh ngạc chỉ 5L/100km.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', 130000, 850000, 5000000, N'Hà Nội', N'Vietnam', N'Thanh Xuân, Hà Nội', 21.0058, 105.8086, 186, 180, 9.8, 7, 5, 'AUTOMATIC', 'HYBRID', 800, '2.0L Hybrid', N'Xám Bạc', '30H-99918', 1, 30, 365, 'AVAILABLE', 4.95, 4, 8, 1, 1, 1, 1, 80000, GETDATE(), GETDATE()),
('VC-19', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', N'Porsche Macan 2021 - Siêu Xe Thể Thao SUV', N'Porsche', N'Fortuner', 2021, 'LUXURY', N'Trải nghiệm đẳng cấp với Porsche Macan màu trắng tinh tế, phong cách quý tộc.', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 8000000, 50000000, 50000000, N'Hồ Chí Minh', N'Vietnam', N'Quận 2, TP.HCM', 10.7872, 106.7490, 252, 225, 6.7, 5, 5, 'AUTOMATIC', 'GASOLINE', 480, '2.0L Turbo', N'Trắng', '51G-99919', 1, 30, 365, 'AVAILABLE', 4.98, 2, 4, 1, 1, 1, 1, 300000, GETDATE(), GETDATE()),
('VC-20', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', N'VinFast VF8 Eco 2023 - Điện Tiện Lợi', N'VinFast', N'VF8', 2023, 'ELECTRIC_CAR', N'VinFast VF8 Eco màu đỏ tươi tắn, tiết kiệm, sạc nhanh pin LFP bền bỉ.', 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800', 1100000, 7200000, 4000000, N'Hồ Chí Minh', N'Vietnam', N'Quận 1, TP.HCM', 10.7769, 106.7009, 348, 200, 5.9, 5, 5, 'AUTOMATIC', 'ELECTRIC', 400, 'Electric', N'Đỏ', '51G-99920', 1, 30, 365, 'AVAILABLE', 4.85, 9, 15, 1, 1, 1, 1, 70000, GETDATE(), GETDATE());

-- Update details for existing data
UPDATE vehicles SET vehicle_type = 'CAR', engine_cc = NULL, has_chauffeur = 0, airport_delivery = 1, wedding_rental = 0, business_rental = 1 WHERE category <> 'MOTORBIKE';
UPDATE vehicles SET vehicle_type = 'MOTORBIKE', engine_cc = 150, has_helmet = 1, has_phone_holder = 1, has_raincoat = 1 WHERE category = 'MOTORBIKE';

-- Update details for newly seeded motorbikes
UPDATE vehicles SET vehicle_type = 'MOTORBIKE', engine_cc = 110, has_helmet = 1, has_phone_holder = 1, has_raincoat = 1 WHERE id IN ('VM-01', 'VM-02', 'VM-03');
UPDATE vehicles SET vehicle_type = 'MOTORBIKE', engine_cc = 125, has_helmet = 1, has_phone_holder = 1, has_raincoat = 1 WHERE id IN ('VM-04', 'VM-08', 'VM-09', 'VM-10', 'VM-12');
UPDATE vehicles SET vehicle_type = 'MOTORBIKE', engine_cc = 160, has_helmet = 1, has_phone_holder = 1, has_raincoat = 1 WHERE id IN ('VM-05');
UPDATE vehicles SET vehicle_type = 'MOTORBIKE', engine_cc = 155, has_helmet = 1, has_phone_holder = 1, has_raincoat = 1 WHERE id IN ('VM-06');
UPDATE vehicles SET vehicle_type = 'MOTORBIKE', engine_cc = NULL, has_helmet = 1, has_phone_holder = 1, has_raincoat = 1, has_touring_package = 0 WHERE id IN ('VM-07', 'VM-13', 'VM-14');
UPDATE vehicles SET vehicle_type = 'MOTORBIKE', engine_cc = 110, has_helmet = 1, has_phone_holder = 0, has_raincoat = 1 WHERE id IN ('VM-11');
UPDATE vehicles SET vehicle_type = 'MOTORBIKE', engine_cc = 300, has_helmet = 1, has_phone_holder = 1, has_raincoat = 1, has_touring_package = 1 WHERE id IN ('VM-15');

-- Update details for newly seeded cars
UPDATE vehicles SET vehicle_type = 'CAR', engine_cc = NULL, has_chauffeur = 0, airport_delivery = 1, wedding_rental = 0, business_rental = 0 WHERE id IN ('VC-01', 'VC-02', 'VC-03', 'VC-06', 'VC-07', 'VC-08', 'VC-09', 'VC-10', 'VC-11', 'VC-12', 'VC-15', 'VC-16', 'VC-17', 'VC-18', 'VC-20');
UPDATE vehicles SET vehicle_type = 'CAR', engine_cc = NULL, has_chauffeur = 0, airport_delivery = 1, wedding_rental = 0, business_rental = 1 WHERE id IN ('VC-04', 'VC-05');
UPDATE vehicles SET vehicle_type = 'CAR', engine_cc = NULL, has_chauffeur = 1, airport_delivery = 1, wedding_rental = 1, business_rental = 1 WHERE id IN ('VC-13', 'VC-14', 'VC-19');

-- Update article counts in categories
UPDATE dbo.help_categories SET article_count = (
    SELECT COUNT(*) FROM dbo.help_articles ha WHERE ha.category_id = help_categories.id AND ha.is_published = 1
);

-- Success message
PRINT 'LuxeWay sample data has been successfully inserted!';
PRINT 'Total Users: 8 (1 Admin, 3 Customers, 2 Individual Owners, 2 Business Owners)';
PRINT 'Total Vehicles: 12 (Various categories from Economy to Luxury)';
PRINT 'Total Vehicle Images: 12';
PRINT 'Total Vehicle Features: 25';
PRINT 'Total System Settings: 8';
PRINT 'Total Coupons: 5';
PRINT 'Total Bookings: 3';
PRINT 'Total Reviews: 3';
PRINT 'Total FAQs: 6';
PRINT 'Total Help Categories: 8';
PRINT 'Total Help Articles: 15';
PRINT '';
PRINT 'Test Accounts:';
PRINT 'Admin: admin@luxeway.vn / password';
PRINT 'Customer: nguyen.van.a@gmail.com / password';
PRINT 'Owner: pham.minh.d@gmail.com / password';
PRINT 'Business: contact@saigoncarrental.vn / password';
PRINT '';
PRINT 'Ready to start LuxeWay backend development! 🚗✨';

-- ============================================================
-- LUXEWAY ECOSYSTEM SEED DATA (Bounded Contexts)
-- ============================================================

-- Car Brands
INSERT INTO car_brands (id, name, country, logo_url, is_active) VALUES
('CB-1', 'Toyota', 'Japan', 'https://www.toyota.com.vn/logo.png', 1),
('CB-2', 'Honda', 'Japan', 'https://www.honda.com.vn/logo.png', 1),
('CB-3', 'Ford', 'USA', 'https://www.ford.com.vn/logo.png', 1),
('CB-4', 'Mercedes-Benz', 'Germany', 'https://www.mercedes-benz.com.vn/logo.png', 1),
('CB-5', 'VinFast', 'Vietnam', 'https://vinfastauto.com/logo.png', 1);

-- Car Models
INSERT INTO car_models (id, brand_id, name, category) VALUES
('CM-1', 'CB-1', 'Camry', 'SEDAN'),
('CM-2', 'CB-2', 'Civic', 'SEDAN'),
('CM-3', 'CB-3', 'Ranger', 'PICKUP'),
('CM-4', 'CB-4', 'C200', 'LUXURY'),
('CM-5', 'CB-5', 'VF8', 'ELECTRIC_CAR');

-- Cars
INSERT INTO cars (id, model_id, owner_id, name, license_plate, price_per_day, deposit, status, rating, total_reviews, total_bookings, is_verified, is_featured) VALUES
('CAR-1', 'CM-1', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', 'Toyota Camry 2.5Q 2023', '30F-999.99', 1200000, 10000000, 'AVAILABLE', 5.0, 0, 0, 1, 1),
('CAR-2', 'CM-2', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', 'Honda Civic RS 2022', '30G-888.88', 900000, 5000000, 'AVAILABLE', 4.8, 0, 0, 1, 0),
('CAR-3', 'CM-5', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', 'VinFast VF8 Plus 2023', '30H-777.77', 1500000, 15000000, 'AVAILABLE', 4.9, 0, 0, 1, 1);

-- Car Specs
INSERT INTO car_specifications (id, car_id, seats, doors, transmission, fuel_type, has_chauffeur, airport_delivery, electric, hybrid) VALUES
('CS-1', 'CAR-1', 5, 4, 'AUTOMATIC', 'GASOLINE', 0, 1, 0, 0),
('CS-2', 'CAR-2', 5, 4, 'AUTOMATIC', 'GASOLINE', 0, 0, 0, 0),
('CS-3', 'CAR-3', 5, 4, 'AUTOMATIC', 'ELECTRIC', 0, 1, 1, 0);

-- Car Locations
INSERT INTO car_locations (id, car_id, city, address, latitude, longitude) VALUES
('CL-1', 'CAR-1', 'Ha Noi', 'My Dinh, Nam Tu Liem', 21.0285, 105.8542),
('CL-2', 'CAR-2', 'Ha Noi', 'Tay Ho, Ha Noi', 21.0585, 105.8042),
('CL-3', 'CAR-3', 'Ha Noi', 'Cau Giay, Ha Noi', 21.0385, 105.7842);

-- Car Images
INSERT INTO car_images (id, car_id, url, is_primary, sort_order) VALUES
('CI-1', 'CAR-1', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=800&auto=format&fit=crop', 1, 0),
('CI-2', 'CAR-2', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop', 1, 0),
('CI-3', 'CAR-3', 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop', 1, 0);

-- Motorbike Brands
INSERT INTO motorbike_brands (id, name, country, logo_url, is_active) VALUES
('MB-1', 'Honda', 'Japan', 'https://www.honda.com.vn/logo-bike.png', 1),
('MB-2', 'Yamaha', 'Japan', 'https://www.yamaha.com.vn/logo-bike.png', 1),
('MB-3', 'VinFast', 'Vietnam', 'https://vinfastauto.com/logo-bike.png', 1);

-- Motorbike Models
INSERT INTO motorbike_models (id, brand_id, name, category) VALUES
('MM-1', 'MB-1', 'Vision', 'SCOOTER'),
('MM-2', 'MB-1', 'Air Blade', 'SCOOTER'),
('MM-3', 'MB-2', 'Exciter 155', 'MANUAL_MOTORCYCLE'),
('MM-4', 'MB-3', 'Evo200', 'ELECTRIC_BIKE');

-- Motorbikes
INSERT INTO motorbikes (id, model_id, owner_id, name, license_plate, price_per_day, deposit, status, rating, total_reviews, total_bookings, is_verified, is_featured) VALUES
('BIKE-1', 'MM-1', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', 'Honda Vision 2023 Standard', '29Y-123.45', 150000, 2000000, 'AVAILABLE', 4.7, 0, 0, 1, 1),
('BIKE-2', 'MM-2', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', 'Honda Air Blade 125cc Special', '29Y-678.90', 200000, 2000000, 'AVAILABLE', 4.9, 0, 0, 1, 1),
('BIKE-3', 'MM-4', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', 'VinFast Evo200 Lite Electric', '29E-555.55', 120000, 1500000, 'AVAILABLE', 4.5, 0, 0, 1, 0);

-- Motorbike Specs
INSERT INTO motorbike_specifications (id, motorbike_id, engine_cc, transmission, helmet_included, raincoat_included, phone_holder, luggage_rack) VALUES
('MBS-1', 'BIKE-1', 110, 'AUTOMATIC', 1, 1, 1, 0),
('MBS-2', 'BIKE-2', 125, 'AUTOMATIC', 1, 1, 1, 1),
('MBS-3', 'BIKE-3', 0, 'AUTOMATIC', 1, 1, 0, 0);

-- Motorbike Locations
INSERT INTO motorbike_locations (id, motorbike_id, city, address, latitude, longitude) VALUES
('MBL-1', 'BIKE-1', 'Ha Noi', 'Hoan Kiem, Ha Noi', 21.0285, 105.8542),
('MBL-2', 'BIKE-2', 'Ha Noi', 'Dong Da, Ha Noi', 21.0185, 105.8242),
('MBL-3', 'BIKE-3', 'Ha Noi', 'Ba Dinh, Ha Noi', 21.0385, 105.8342);

-- Motorbike Images
INSERT INTO motorbike_images (id, motorbike_id, url, is_primary, sort_order) VALUES
('MBI-1', 'BIKE-1', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop', 1, 0),
('MBI-2', 'BIKE-2', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop', 1, 0),
('MBI-3', 'BIKE-3', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=800&auto=format&fit=crop', 1, 0);

PRINT 'LuxeWay separate ecosystems seed data successfully inserted!';

