USE car_rental_platform;
GO

-- Đảm bảo owner-user-id-003 tồn tại để gán chủ xe
IF NOT EXISTS (SELECT 1 FROM users WHERE id = 'owner-user-id-003')
BEGIN
    INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, role, verified, kyc_verified, driving_license_verified, rating, account_type, is_active, created_at)
    VALUES ('owner-user-id-003', 'owner@luxeway.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Owner', N'LuxeWay', N'LuxeWay Premium Garage', 'owner', 1, 1, 1, 4.95, 'INDIVIDUAL', 1, GETDATE());
END
GO

-- Xóa các xe thuộc owner-user-id-003 chưa có booking để tránh đầy DB (nếu có)
-- Không xóa xe lung tung để tránh lỗi khóa ngoại

-- Chèn dữ liệu xe chuyên nghiệp với ảnh chuẩn file name local
INSERT INTO vehicles (
    id, owner_id, name, brand, model, year, category, description, thumbnail_url, price_per_day, deposit, 
    city, country, address, seats, transmission, fuel_type, status, approval_status, 
    rating, total_reviews, total_bookings, is_verified, is_featured, instant_book, 
    delivery_available, delivery_fee, vehicle_type, license_plate, created_at, updated_at
) VALUES
(NEWID(), 'owner-user-id-003', N'BMW 320i Sport', 'BMW', '320i', 2024, 'BUSINESS', N'Premium BMW 320i Sport 2024. Sporty design, ultimate driving experience, and luxurious interior.', 'BMW_320i.jpg', 2500000, 5000000, N'Hanoi', N'Vietnam', N'Downtown Hanoi', 5, 'AUTOMATIC', 'GASOLINE', 'AVAILABLE', 'APPROVED', 4.9, 15, 20, 1, 1, 1, 1, 0, 'CAR', '30K-12345', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'BMW 520i M-Sport', 'BMW', '520i', 2024, 'BUSINESS', N'Luxury sedan BMW 520i M-Sport with advanced technology. Perfect for business trips or client meetings.', 'BMW_520i.jpg', 3200000, 8000000, N'Ho Chi Minh City', N'Vietnam', N'District 1, HCMC', 5, 'AUTOMATIC', 'GASOLINE', 'AVAILABLE', 'APPROVED', 5.0, 10, 12, 1, 1, 1, 1, 0, 'CAR', '51K-55555', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'BMW X5 xDrive40i', 'BMW', 'X5', 2023, 'SUV', N'Premium mid-size SUV BMW X5. Spacious, powerful, and absolutely safe for the family.', 'BMW_X5.jpg', 4000000, 10000000, N'Hanoi', N'Vietnam', N'Hanoi', 7, 'AUTOMATIC', 'GASOLINE', 'AVAILABLE', 'APPROVED', 4.8, 8, 15, 1, 0, 1, 1, 0, 'CAR', '30K-88888', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'Toyota Camry 2.5Q', 'Toyota', 'Camry', 2024, 'BUSINESS', N'Executive car Toyota Camry 2.5Q. Smooth ride, highly durable, and very fuel efficient.', 'caramy_2.5Q.avif', 1800000, 3000000, N'Ho Chi Minh City', N'Vietnam', N'District 3, HCMC', 5, 'AUTOMATIC', 'GASOLINE', 'AVAILABLE', 'APPROVED', 4.9, 25, 40, 1, 1, 1, 1, 0, 'CAR', '51K-99999', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'Honda CR-V 2024', 'Honda', 'CR-V', 2024, 'SUV', N'Honda CR-V L trim. Spacious interior, advanced Honda Sensing safety technology.', 'Honda_CrV.jpg', 1600000, 3000000, N'Da Nang', N'Vietnam', N'Da Nang Airport', 7, 'AUTOMATIC', 'GASOLINE', 'AVAILABLE', 'APPROVED', 4.8, 30, 45, 1, 1, 1, 1, 0, 'CAR', '43A-12345', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'Hyundai Santa Fe 2024', 'Hyundai', 'Santa Fe', 2024, 'SUV', N'Hyundai Santa Fe Premium Diesel. Powerful, fuel-efficient, perfect for outdoor trips.', 'hyundai_santa_fe.jpg', 1700000, 3500000, N'Hanoi', N'Vietnam', N'Cau Giay, Hanoi', 7, 'AUTOMATIC', 'DIESEL', 'AVAILABLE', 'APPROVED', 4.9, 20, 35, 1, 0, 1, 1, 0, 'CAR', '30K-56789', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'Hyundai Tucson 2024', 'Hyundai', 'Tucson', 2024, 'SUV', N'Futuristic design, tech-filled interior. 100% brand new, deep cleaned.', 'hyundai_tuscon.jpg', 1500000, 3000000, N'Ho Chi Minh City', N'Vietnam', N'Tan Binh, HCMC', 5, 'AUTOMATIC', 'GASOLINE', 'AVAILABLE', 'APPROVED', 4.7, 15, 20, 1, 0, 1, 1, 0, 'CAR', '51K-11111', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'Mazda CX-5 Premium', 'Mazda', 'CX-5', 2024, 'SUV', N'Mazda CX-5 Premium 2024. Exciting driving experience, elegant Kodo design.', 'Mazda_cx5.jpg', 1400000, 3000000, N'Da Nang', N'Vietnam', N'Da Nang', 5, 'AUTOMATIC', 'GASOLINE', 'AVAILABLE', 'APPROVED', 4.9, 45, 60, 1, 1, 1, 1, 0, 'CAR', '43A-66666', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'Kia Carnival Signature', 'Kia', 'Carnival', 2023, 'FAMILY', N'The king of family MPVs. Most spacious in segment, absolute soundproofing.', 'kia_carnival.jpg', 2200000, 5000000, N'Ho Chi Minh City', N'Vietnam', N'District 7, HCMC', 7, 'AUTOMATIC', 'DIESEL', 'AVAILABLE', 'APPROVED', 5.0, 30, 50, 1, 1, 1, 1, 0, 'CAR', '51K-77777', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'Ford Everest Titanium+', 'Ford', 'Everest', 2023, 'SUV', N'Ford Everest Titanium+ 4x4. Impressive offroad capabilities, luxury amenities.', 'ford_everest.jpg', 2000000, 4000000, N'Hanoi', N'Vietnam', N'My Dinh, Hanoi', 7, 'AUTOMATIC', 'DIESEL', 'AVAILABLE', 'APPROVED', 4.8, 12, 18, 1, 0, 1, 1, 0, 'CAR', '30K-99999', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'Porsche Cayenne', 'Porsche', 'Cayenne', 2022, 'BUSINESS', N'Luxury sports SUV. Pure class right from the first glance.', 'porsche_cayenne.jpg', 8000000, 20000000, N'Ho Chi Minh City', N'Vietnam', N'Landmark 81, HCMC', 5, 'AUTOMATIC', 'GASOLINE', 'AVAILABLE', 'APPROVED', 5.0, 5, 8, 1, 1, 1, 1, 0, 'CAR', '51K-68686', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'VinFast VF8 Plus', 'VinFast', 'VF8', 2023, 'ELECTRIC', N'Smart electric SUV VinFast VF8 Plus. Global EV experience, ultra smooth acceleration.', 'vinfast_v8.jpg', 1600000, 3000000, N'Hanoi', N'Vietnam', N'Ocean Park, Hanoi', 5, 'AUTOMATIC', 'ELECTRIC', 'AVAILABLE', 'APPROVED', 4.7, 22, 30, 1, 1, 1, 1, 0, 'CAR', '30K-33333', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'Honda SH 150i ABS', 'Honda', 'SH 150i', 2023, 'MOTORBIKE', N'Premium scooter Honda SH 150i ABS. Luxurious and powerful performance.', 'Honda_Sh_150i.jpg', 5000, 2000000, N'Da Nang', N'Vietnam', N'Hai Chau, Da Nang', 2, 'AUTOMATIC', 'GASOLINE', 'AVAILABLE', 'APPROVED', 4.9, 50, 100, 1, 1, 1, 1, 0, 'MOTORBIKE', '43A-11111', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'Yamaha NVX 155 VVA', 'Yamaha', 'NVX 155', 2022, 'MOTORBIKE', N'Sporty Yamaha NVX 155. Ultimate speed experience.', 'Yamaha_NVX_155.webp', 250000, 1500000, N'Ho Chi Minh City', N'Vietnam', N'District 1, HCMC', 2, 'AUTOMATIC', 'GASOLINE', 'AVAILABLE', 'APPROVED', 4.8, 30, 45, 1, 0, 1, 1, 0, 'MOTORBIKE', '51K-22222', GETDATE(), GETDATE()),
(NEWID(), 'owner-user-id-003', N'KTM Duke 390', 'KTM', 'Duke 390', 2023, 'TOURISM', N'KTM Duke 390 warrior machine. Super lightweight, powerful, easy to handle.', 'KTM_Duke_390.jpg', 500000, 3000000, N'Hanoi', N'Vietnam', N'Tay Ho, Hanoi', 2, 'MANUAL', 'GASOLINE', 'AVAILABLE', 'APPROVED', 4.9, 20, 35, 1, 1, 1, 1, 0, 'MOTORBIKE', '30K-44444', GETDATE(), GETDATE());
GO

-- ============================================================
-- FIX ENUM CASE SENSITIVITY FOR HIBERNATE
-- ============================================================
-- JPA/Hibernate @Enumerated(EnumType.STRING) requires exact case match (UPPERCASE)
UPDATE vehicles 
SET status = UPPER(status), 
    approval_status = UPPER(approval_status), 
    category = UPPER(category), 
    vehicle_type = UPPER(vehicle_type), 
    transmission = UPPER(transmission), 
    fuel_type = UPPER(fuel_type);
GO

PRINT 'Real professional vehicles have been successfully imported into car_rental_platform.'
GO
