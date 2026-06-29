-- ============================================================
-- IMPORT LUXEWAY SAMPLE DATA TO SQL SERVER
-- ============================================================
-- Run this script in SQL Server Management Studio
-- Database: car_rental_platform

USE car_rental_platform;


-- Insert Users
INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, avatar, phone, role, verified, kyc_verified, driving_license_verified, rating, total_reviews, total_rentals, bio, location, account_type, company_name, stripe_customer_id, is_active, joined_at, last_active, created_at, updated_at, wallet_balance, kyc_status, driver_license_status, provider) VALUES
('A1B2C3D4-E5F6-7890-ABCD-123456789012', 'admin@luxeway.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Admin', N'LuxeWay', N'Admin LuxeWay', 'https://ui-avatars.com/api/?name=Admin+LuxeWay&background=0F172A&color=fff&size=200', '0901234567', 'ADMIN', 1, 1, 1, 5.00, 0, 0, N'LuxeWay Platform Administrator', N'Hồ Chí Minh', 'INDIVIDUAL', NULL, NULL, 1, '2024-01-01 00:00:00', '2024-05-23 10:00:00', '2024-01-01 00:00:00', '2024-05-23 10:00:00', 0, 'VERIFIED', 'VERIFIED', 'LOCAL'),
('B2C3D4E5-F6G7-8901-BCDE-234567890123', 'nguyen.van.a@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Nguyễn', N'Văn A', N'Nguyễn Văn A', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', '0901111111', 'CUSTOMER', 1, 1, 1, 4.80, 15, 8, N'Yêu thích du lịch và khám phá những địa điểm mới', N'Hà Nội', 'INDIVIDUAL', NULL, NULL, 1, '2024-02-15 08:30:00', '2024-05-23 09:45:00', '2024-02-15 08:30:00', '2024-05-23 09:45:00', 0, 'VERIFIED', 'VERIFIED', 'LOCAL'),
('E5F6G7H8-I9J0-1234-EFGH-567890123456', 'pham.minh.d@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Phạm', N'Minh D', N'Phạm Minh D', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', '0904444444', 'OWNER', 1, 1, 1, 4.95, 45, 0, N'Chủ sở hữu đội xe gia đình chạy dịch vụ, cam kết chất lượng tốt nhất', N'Hồ Chí Minh', 'INDIVIDUAL', NULL, NULL, 1, '2024-01-20 09:15:00', '2024-05-23 07:20:00', '2024-01-20 09:15:00', '2024-05-23 07:20:00', 0, 'VERIFIED', 'VERIFIED', 'LOCAL'),
('D4E5F6G7-H8I9-0123-CDFG-456789012345', 'business@luxeway.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Doanh Nghiệp', N'LuxeWay', N'LuxeWay Enterprise', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop', '0909999999', 'OWNER', 1, 1, 1, 5.00, 0, 0, N'LuxeWay Enterprise - Đơn vị cung cấp dịch vụ thuê xe sang trọng hàng đầu Việt Nam', N'Hà Nội', 'BUSINESS', N'LuxeWay Enterprise', NULL, 1, '2024-01-01 00:00:00', '2024-05-23 10:00:00', '2024-01-01 00:00:00', '2024-05-23 10:00:00', 0, 'VERIFIED', 'VERIFIED', 'LOCAL');

-- Insert Vehicles (16 Cars + 10 Motorbikes)
-- status = 'AVAILABLE', approval_status = 'APPROVED'
INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, description, thumbnail_url, price_per_day, price_per_week, deposit, city, country, address, latitude, longitude, horsepower, top_speed, acceleration, seats, doors, transmission, fuel_type, range_km, engine_size, color, license_plate, min_rental_days, max_rental_days, advance_booking_days, status, approval_status, rating, total_reviews, total_bookings, is_verified, is_featured, instant_book, delivery_available, delivery_fee, vehicle_type, created_at, updated_at) VALUES
-- 1. VinFast VF3 (Electric - HCM) - OWNER
('V-VF3-2026-001', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'VinFast VF3 2026 - Xe Điện Mini Cực Kỳ Cá Tính', 'VinFast', 'VF3', 2026, 'ELECTRIC', N'VinFast VF3 phiên bản mới nhất 2026. Thiết kế nhỏ gọn, năng động, rất phù hợp di chuyển trong đô thị đông đúc. Xe sạch sẽ, sạc đầy đi được 210km.', '/images/cars/MIOTO_vinfast_vf3 2026_2026_mioto.jpg', 500000.00, 3200000.00, 2000000.00, N'Hồ Chí Minh', N'Vietnam', N'Vincom Center Đồng Khởi, Quận 1', 10.7779, 106.7020, 44, 100, 15.0, 4, 3, 'AUTOMATIC', 'ELECTRIC', 210, '30 kWh', N'Vàng Cát', '51K-999.33', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.90, 8, 12, 1, 1, 1, 1, 50000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 2. Honda City RS (Economy - HCM) - OWNER
('V-CITY-RS-2025-002', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda City RS 2025 - Thể Thao & Hiện Đại', 'Honda', 'City', 2025, 'ECONOMY', N'Honda City RS 2025 màu đỏ thể thao. Động cơ mạnh mẽ, tiết kiệm nhiên liệu, trang bị đầy đủ gói an toàn Honda SENSING.', '/images/cars/MIOTO_honda_city rs_2025_mioto.jpg', 850000.00, 5500000.00, 3000000.00, N'Hồ Chí Minh', N'Vietnam', N'321 Trần Hưng Đạo, Quận 1', 10.7624, 106.6908, 119, 180, 10.2, 5, 4, 'AUTOMATIC', 'GASOLINE', 650, '1.5L i-VTEC', N'Đỏ', '51L-123.45', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.85, 14, 20, 1, 1, 1, 1, 60000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 3. Kia Carens (Family - HCM) - OWNER
('V-CARENS-2026-003', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Kia Carens 2026 - Xe 7 Chỗ Gia Đình Rộng Rãi', 'Kia', 'Carens', 2026, 'FAMILY', N'Kia Carens thế hệ mới 2026. Không gian nội thất 7 chỗ vô cùng rộng rãi và tiện nghi. Xe chạy êm, cách âm tốt, điều hòa mát sâu.', '/images/cars/MIOTO_kia_carens 2026_2026_mioto.jpg', 1100000.00, 7200000.00, 5000000.00, N'Hồ Chí Minh', N'Vietnam', N'789 Nguyễn Văn Linh, Quận 7', 10.7294, 106.7214, 115, 170, 11.8, 7, 5, 'AUTOMATIC', 'GASOLINE', 600, '1.5L Smartstream', N'Trắng', '51M-567.89', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.95, 22, 35, 1, 1, 0, 1, 70000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 4. Toyota Veloz Cross (Family - HN) - BUSINESS_OWNER
('V-VELOZ-2026-004', 'D4E5F6G7-H8I9-0123-CDFG-456789012345', N'Toyota Veloz Cross 2026 - Sang Trọng & Tiện Nghi', 'Toyota', 'Veloz Cross', 2026, 'FAMILY', N'Toyota Veloz Cross 2026 màu bạc. Dòng xe 7 chỗ đa dụng hiện đại với nhiều tính năng an toàn cao cấp Toyota Safety Sense. Rất thích hợp cho gia đình đi du lịch.', '/images/cars/MIOTO_toyota_veloz cross_2026_mioto.jpg', 1000000.00, 6500000.00, 4000000.00, N'Hà Nội', N'Vietnam', N'88 Lê Văn Lương, Thanh Xuân, Hà Nội', 21.0105, 105.8012, 105, 165, 12.5, 7, 5, 'AUTOMATIC', 'GASOLINE', 620, '1.5L Dual VVT-i', N'Bạc', '30L-987.65', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.90, 18, 29, 1, 1, 1, 1, 50000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 5. Mazda 3 Luxury (Business - HN) - BUSINESS_OWNER
('V-MAZDA3-2026-005', 'D4E5F6G7-H8I9-0123-CDFG-456789012345', N'Mazda 3 Luxury 2026 - Kiệt Tác Thiết Kế KODO', 'Mazda', '3', 2026, 'BUSINESS', N'Mazda 3 Luxury 2026 màu xám ghi vô cùng thời thượng. Thiết kế quyến rũ, khoang nội thất bọc da cao cấp, trang bị âm thanh 8 loa sống động.', '/images/cars/MIOTO_mazda_3 luxury_2026_mioto.jpg', 950000.00, 6200000.00, 4000000.00, N'Hà Nội', N'Vietnam', N'18 Nguyễn Trãi, Thanh Xuân, Hà Nội', 20.9984, 105.8124, 110, 190, 9.8, 5, 4, 'AUTOMATIC', 'GASOLINE', 680, '1.5L SkyActiv-G', N'Xám', '30M-111.22', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.92, 11, 17, 1, 1, 1, 1, 50000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 6. Hyundai Accent (Economy - HN) - OWNER
('V-ACCENT-2025-006', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Hyundai Accent 2025 - Tiết Kiệm & Bền Bỉ', 'Hyundai', 'Accent', 2025, 'ECONOMY', N'Hyundai Accent 2025 số tự động màu trắng sạch sẽ. Đầy đủ tiện nghi cơ bản, điều hòa mát rượi, màn hình giải trí thông minh.', '/images/cars/MIOTO_hyundai_accent 2025_2025_mioto.jpg', 700000.00, 4500000.00, 2500000.00, N'Hà Nội', N'Vietnam', N'456 Phố Huế, Hai Bà Trưng, Hà Nội', 21.0118, 105.8504, 100, 170, 11.2, 5, 4, 'AUTOMATIC', 'GASOLINE', 600, '1.4L MPI', N'Trắng', '30K-444.55', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.78, 25, 38, 1, 0, 1, 1, 40000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 7. Ford Territory Titanium (SUV - HCM) - BUSINESS_OWNER
('V-TERRITORY-2024-007', 'D4E5F6G7-H8I9-0123-CDFG-456789012345', N'Ford Territory Titanium 2024 - Đẳng Cấp Mỹ', 'Ford', 'Territory', 2024, 'SUV', N'Ford Territory Titanium 2024 cực rộng. Cửa sổ trời toàn cảnh, camera 360 độ, màn hình đôi sắc nét. Xe lái cực sướng, đầm chắc đặc trưng dòng xe Ford.', '/images/cars/MIOTO_ford_territory titanium_2024_mioto.jpg', 1300000.00, 8500000.00, 5000000.00, N'Hồ Chí Minh', N'Vietnam', N'12 Hoàng Diệu, Quận 4', 10.7602, 106.7067, 160, 190, 8.9, 5, 5, 'AUTOMATIC', 'GASOLINE', 580, '1.5L Ecoboost', N'Đen', '51K-112.23', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.96, 9, 15, 1, 1, 1, 1, 80000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 8. Geely Coolray Flagship (SUV - HN) - OWNER
('V-COOLRAY-2025-008', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Geely Coolray Flagship 2025 - Thể Thao Đột Phá', 'Geely', 'Coolray', 2025, 'SUV', N'Geely Coolray phiên bản cao cấp nhất Flagship 2025. Thiết kế thể thao hầm hố, nội thất phối màu đỏ đen cá tính, động cơ tăng áp tăng tốc vượt trội.', '/images/cars/MIOTO_geely_coolray flagship_2025_mioto.jpg', 1200000.00, 7800000.00, 4000000.00, N'Hà Nội', N'Vietnam', N'26 Láng Hạ, Đống Đa, Hà Nội', 21.0175, 105.8158, 177, 195, 7.9, 5, 5, 'AUTOMATIC', 'GASOLINE', 590, '1.5L Turbo', N'Xanh Dương', '30L-555.66', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.85, 6, 9, 1, 0, 1, 1, 50000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 9. Kia Carnival Premium (Tourism - HCM) - BUSINESS_OWNER
('V-CARNIVAL-2022-009', 'D4E5F6G7-H8I9-0123-CDFG-456789012345', N'Kia Carnival Premium 2022 - Chuyên Cơ Mặt Đất', 'Kia', 'Carnival', 2022, 'TOURISM', N'Kia Carnival Premium 2022 cấu hình 7 chỗ sang trọng. Ghế thương gia chỉnh điện, có sưởi và làm mát, cửa lùa tự động. Dòng xe VIP phục vụ đưa đón nguyên thủ, gia đình VIP.', '/images/cars/MIOTO_kia_carnival premium_2022_mioto.jpg', 2200000.00, 14500000.00, 10000000.00, N'Hồ Chí Minh', N'Vietnam', N'99 Nguyễn Thị Minh Khai, Quận 3', 10.7745, 106.6912, 199, 190, 9.0, 7, 5, 'AUTOMATIC', 'DIESEL', 750, '2.2L Smartstream', N'Đen', '51G-888.88', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.99, 41, 62, 1, 1, 1, 1, 100000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 10. Mitsubishi Xforce Ultimate (SUV - Đà Nẵng) - OWNER
('V-XFORCE-2025-010', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Mitsubishi Xforce Ultimate 2025 - Chuẩn Mực Đô Thị', 'Mitsubishi', 'Xforce', 2025, 'SUV', N'Mitsubishi Xforce Ultimate 2025 màu vàng cam ấn tượng. Hệ thống âm thanh cao cấp Dynamic Sound Yamaha, gói an toàn chủ động ADAS, 4 chế độ lái.', '/images/cars/MIOTO_mitsubishi_xforce ultimate_2025_mioto.jpg', 1050000.00, 6800000.00, 4000000.00, N'Đà Nẵng', N'Vietnam', N'15 Điện Biên Phủ, Thanh Khê, Đà Nẵng', 16.0624, 108.2014, 105, 170, 11.5, 5, 5, 'AUTOMATIC', 'GASOLINE', 610, '1.5L MIVEC', N'Vàng Cam', '43A-666.88', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.90, 10, 16, 1, 0, 1, 1, 50000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 11. VinFast VF9 Eco (Electric - Đà Nẵng) - BUSINESS_OWNER
('V-VF9-2025-011', 'D4E5F6G7-H8I9-0123-CDFG-456789012345', N'VinFast VF9 Eco 2025 - SUV Điện Full-Size Đẳng Cấp', 'VinFast', 'VF9', 2025, 'ELECTRIC', N'VinFast VF9 Eco 2025 màu xanh dương. SUV điện cỡ lớn 7 chỗ ngồi sang trọng rộng rãi vượt trội, trang bị trợ lý ảo thông minh, quãng đường di chuyển 438km.', '/images/cars/MIOTO_vinfast_vf9 eco_2025_mioto.jpg', 2500000.00, 16000000.00, 15000000.00, N'Đà Nẵng', N'Vietnam', N'234 Nguyễn Văn Linh, Đà Nẵng', 16.0598, 108.2123, 402, 200, 6.5, 7, 5, 'AUTOMATIC', 'ELECTRIC', 438, '92 kWh', N'Xanh Dương', '43A-777.99', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.94, 7, 11, 1, 1, 1, 1, 80000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 12. Toyota Camry 2.0E (Business - Đà Lạt) - OWNER
('V-CAMRY-2016-012', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Toyota Camry 2.0E 2016 - Đỉnh Cao Xe Sedan Hạng D', 'Toyota', 'Camry', 2016, 'BUSINESS', N'Toyota Camry 2.0E màu đen huyền bí lịch lãm. Khoang sau cực kỳ rộng rãi, đi đầm chắc, cách âm hoàn hảo. Xe phù hợp đi công tác, tiếp khách hàng VIP.', '/images/cars/MIOTO_toyota_camry 2.0e_2016_mioto.jpg', 1200000.00, 7800000.00, 5000000.00, N'Đà Lạt', N'Vietnam', N'10 Đường Ba Tháng Tư, Đà Lạt', 11.9324, 108.4485, 165, 210, 9.3, 5, 4, 'AUTOMATIC', 'GASOLINE', 650, '2.0L VVT-iW', N'Đen', '49A-333.22', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.82, 19, 28, 1, 0, 1, 1, 60000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 13. Honda CRV L (SUV - Nha Trang) - OWNER
('V-CRV-2019-013', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda CRV L 2019 - 7 Chỗ Đa Dụng Tiện Nghi', 'Honda', 'CR-V', 2019, 'SUV', N'Honda CR-V bản L cao cấp nhất 2019. Động cơ Turbo mạnh mẽ tiết kiệm, cửa sổ trời panorama toàn cảnh, cốp điện rảnh tay, ghế da sang trọng.', '/images/cars/MIOTO_honda_crv g_2018_mioto.jpg', 1300000.00, 8500000.00, 5000000.00, N'Nha Trang', N'Vietnam', N'45 Trần Phú, Lộc Thọ, Nha Trang', 12.2415, 109.1965, 188, 200, 8.8, 7, 5, 'AUTOMATIC', 'GASOLINE', 620, '1.5L Turbo VTEC', N'Đồng Kim Loại', '79A-444.88', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.88, 15, 24, 1, 0, 0, 1, 50000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 14. Mazda CX9 (Tourism - Nha Trang) - BUSINESS_OWNER
('V-CX9-2013-014', 'D4E5F6G7-H8I9-0123-CDFG-456789012345', N'Mazda CX9 2013 - Xe 7 Chỗ Nhập Khẩu Mỹ Rộng Rãi', 'Mazda', 'CX-9', 2013, 'TOURISM', N'Mazda CX9 nhập khẩu nguyên chiếc. Động cơ V6 3.7L siêu khỏe, hệ dẫn động 2 cầu toàn thời gian AWD vượt mọi địa hình. Nội thất cực kỳ rộng, điều hòa 3 vùng độc lập.', '/images/cars/MIOTO_mazda_cx9 2013_2013_mioto.jpg', 1500000.00, 9800000.00, 8000000.00, N'Nha Trang', N'Vietnam', N'2 Pasteur, Nha Trang', 12.2505, 109.1944, 273, 200, 8.2, 7, 5, 'AUTOMATIC', 'GASOLINE', 500, '3.7L V6', N'Trắng', '79A-123.77', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.75, 8, 12, 1, 0, 1, 1, 60000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 15. Mercedes S500 (Business - Phú Quốc) - BUSINESS_OWNER
('V-S500-2014-015', 'D4E5F6G7-H8I9-0123-CDFG-456789012345', N'Mercedes Benz S500 Luxury 2014 - Đỉnh Cao Xa Hoa', 'Mercedes-Benz', 'S-Class', 2014, 'BUSINESS', N'Mercedes-Benz S500 Luxury. Đỉnh cao của sự xa xỉ với hệ thống treo khí nén êm ái, hàng ghế thương gia massage đá nóng, tủ lạnh mini, hệ thống âm thanh Burmester đỉnh cao.', '/images/cars/MIOTO_mercedes_s500 2014_2014_mioto.jpg', 500000.00, 32000000.00, 50000000.00, N'Phú Quốc', N'Vietnam', N'Trần Hưng Đạo, Dương Đông, Phú Quốc', 10.2185, 103.9604, 455, 250, 4.8, 5, 4, 'AUTOMATIC', 'GASOLINE', 600, '4.7L V8 Biturbo', N'Đen', '68A-999.99', 1, 15, 365, 'AVAILABLE', 'APPROVED', 5.00, 5, 8, 1, 1, 0, 1, 200000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 16. VinFast VF6 Plus (Electric - Phú Quốc) - OWNER
('V-VF6-2026-016', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'VinFast VF6 Plus 2026 - SUV Điện Đô Thị Hiện Đại', 'VinFast', 'VF6', 2026, 'ELECTRIC', N'VinFast VF6 Plus 2026 thế hệ mới màu xanh rêu độc đáo. Phân khúc C-SUV rộng rãi, động cơ điện 201 mã lực tăng tốc cực bốc, trang bị ADAS thông minh hỗ trợ lái.', '/images/cars/MIOTO_vinfast_vf6 plus_2026_mioto.jpg', 1200000.00, 7800000.00, 4000000.00, N'Phú Quốc', N'Vietnam', N'Sân bay Phú Quốc, Dương Tơ', 10.1685, 103.9912, 201, 185, 7.5, 5, 5, 'AUTOMATIC', 'ELECTRIC', 399, '59.6 kWh', N'Xanh Rêu', '68A-123.55', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.90, 3, 5, 1, 1, 1, 1, 50000.00, 'CAR', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- ==========================================
-- MOTORBIKES (10 Vehicles)
-- ==========================================
-- 17. Vespa Sprint 150 (Motorbike - HCM)
('V-VESPA-2025-017', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Vespa Sprint S 150 2025 - Phong Cách Ý Lịch Lãm', 'Vespa', 'Sprint', 2025, 'MOTORBIKE', N'Vespa Sprint S 150 thế hệ mới, phanh ABS an toàn. Kiểu dáng thời trang phong cách Ý lịch lãm, đi rất đầm và êm ái thích hợp dạo phố chụp ảnh.', 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=800&auto=format&fit=crop', 350000.00, 2200000.00, 2000000.00, N'Hồ Chí Minh', N'Vietnam', N'120 Lê Lợi, Quận 1', 10.7738, 106.6998, 13, 110, 15.0, 2, 0, 'AUTOMATIC', 'GASOLINE', 0, '150cc i-Get', N'Xám Xi Măng', '51A-111.22', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.92, 24, 38, 1, 1, 1, 1, 30000.00, 'MOTORBIKE', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 18. Honda SH 150i (Motorbike - HCM)
('V-SH150-2024-018', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda SH 150i ABS 2024 - Đẳng Cấp Xe Ga Cao Cấp', 'Honda', 'SH', 2024, 'MOTORBIKE', N'Honda SH 150i đời 2024 bản phanh ABS. Động cơ eSP+ 4 van thế hệ mới mạnh mẽ vượt trội. Xe cao ráo, đi cực sang trọng và tôn dáng.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop', 400000.00, 2600000.00, 3000000.00, N'Hồ Chí Minh', N'Vietnam', N'230 Nguyễn Trãi, Quận 1', 10.7602, 106.6812, 16, 120, 11.0, 2, 0, 'AUTOMATIC', 'GASOLINE', 0, '150cc eSP+', N'Đen Bóng', '51B-222.33', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.95, 18, 27, 1, 1, 1, 1, 30000.00, 'MOTORBIKE', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 19. Yamaha Exciter 155 (Motorbike - HCM)
('V-EXCITER-2025-019', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Yamaha Exciter 155 VVA 2025 - Vua Côn Tay Phượt Thủ', 'Yamaha', 'Exciter', 2025, 'MOTORBIKE', N'Yamaha Exciter 155 VVA thế hệ mới, trang bị côn tay cực bốc và công nghệ van biến thiên VVA thích hợp cho các cung phượt từ HCM đi Vũng Tàu, Đà Lạt.', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop', 200000.00, 1300000.00, 1000000.00, N'Hồ Chí Minh', N'Vietnam', N'Sân bay Tân Sơn Nhất, Tân Bình', 10.8185, 106.6588, 18, 130, 8.5, 2, 0, 'MANUAL', 'GASOLINE', 0, '155cc VVA', N'Xanh GP', '51C-333.44', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.80, 31, 45, 1, 0, 1, 1, 40000.00, 'MOTORBIKE', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 20. Honda Air Blade 160 (Motorbike - HN)
('V-AIRBLADE-2024-020', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda Air Blade 160 ABS 2024 - Mạnh Mẽ & Thể Thao', 'Honda', 'Air Blade', 2024, 'MOTORBIKE', N'Honda Air Blade 160cc phanh ABS. Động cơ 160cc cực khỏe, xe chạy đầm lướt, cốp xe siêu rộng đựng được nhiều đồ đạc cá nhân di chuyển trong Hà Nội.', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop', 250000.00, 1600000.00, 1500000.00, N'Hà Nội', N'Vietnam', N'Ga Hà Nội, Đống Đa', 21.0254, 105.8412, 15, 115, 12.0, 2, 0, 'AUTOMATIC', 'GASOLINE', 0, '160cc eSP+', N'Xanh Xám', '30F-123.45', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.87, 42, 60, 1, 1, 1, 1, 20000.00, 'MOTORBIKE', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 21. Honda Vision (Motorbike - HN)
('V-VISION-2024-021', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda Vision 110 Smartkey 2024 - Nhẹ Nhàng & Tiết Kiệm', 'Honda', 'Vision', 2024, 'MOTORBIKE', N'Honda Vision 2024 khóa thông minh Smartkey cực kỳ an toàn và tiện lợi. Xe nhẹ nhàng dễ dắt, siêu tiết kiệm xăng thích hợp cho các bạn nữ dạo phố Hà Nội cổ kính.', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop', 150000.00, 950000.00, 1000000.00, N'Hà Nội', N'Vietnam', N'Hồ Hoàn Kiếm, Hoàn Kiếm', 21.0285, 105.8542, 9, 95, 16.0, 2, 0, 'AUTOMATIC', 'GASOLINE', 0, '110cc eSP', N'Trắng Ngọc Trai', '30G-555.66', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.79, 53, 85, 1, 0, 1, 1, 20000.00, 'MOTORBIKE', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 22. Vespa Primavera (Motorbike - Đà Nẵng)
('V-PRIMAVERA-2025-022', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Vespa Primavera 125 2025 - Nữ Hoàng Thời Trang', 'Vespa', 'Primavera', 2025, 'MOTORBIKE', N'Vespa Primavera 125 màu hồng pastel cực kỳ kẹo ngọt dễ thương. Dòng xe ga thời thượng chuyên phục vụ các bạn nữ chụp ảnh sống ảo bên bãi biển Mỹ Khê Đà Nẵng.', 'https://images.unsplash.com/photo-1591378603123-2d14fa264166?w=800&auto=format&fit=crop', 350000.00, 2200000.00, 2000000.00, N'Đà Nẵng', N'Vietnam', N'Cầu Rồng, Sơn Trà, Đà Nẵng', 16.0612, 108.2268, 11, 105, 15.0, 2, 0, 'AUTOMATIC', 'GASOLINE', 0, '125cc i-Get', N'Hồng Pastel', '43B-123.45', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.93, 15, 24, 1, 1, 1, 1, 30000.00, 'MOTORBIKE', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 23. Yamaha Grande (Motorbike - Đà Nẵng)
('V-GRANDE-2024-023', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Yamaha Grande Hybrid 2024 - Siêu Tiết Kiệm Nhiên Liệu', 'Yamaha', 'Grande', 2024, 'MOTORBIKE', N'Yamaha Grande động cơ Blue Core Hybrid 125cc siêu êm ái và siêu tiết kiệm nhiên liệu số 1 Việt Nam. Cốp xe siêu to chứa 2 mũ bảo hiểm rộng rãi.', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop', 200000.00, 1300000.00, 1000000.00, N'Đà Nẵng', N'Vietnam', N'Sân bay Đà Nẵng, Hải Châu', 16.0438, 108.1985, 8, 100, 16.0, 2, 0, 'AUTOMATIC', 'GASOLINE', 0, '125cc Blue Core', N'Trắng Sữa', '43C-567.89', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.88, 12, 19, 1, 0, 1, 1, 30000.00, 'MOTORBIKE', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 24. Honda Winner X (Motorbike - Đà Lạt)
('V-WINNER-2024-024', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda Winner X V3 2024 - Thể Thao Phá Cách', 'Honda', 'Winner X', 2024, 'MOTORBIKE', N'Honda Winner X phiên bản mới V3 với thiết kế đầu xe cực ngầu, trang bị xích có vòng phớt O-ring bền bỉ, pô kêu giòn thể thao. Dòng xe leo dốc đèo Đà Lạt siêu khỏe.', 'https://images.unsplash.com/photo-1515777315835-281b94c9589f?w=800&auto=format&fit=crop', 200000.00, 1300000.00, 1000000.00, N'Đà Lạt', N'Vietnam', N'Hồ Xuân Hương, Đà Lạt', 11.9412, 108.4385, 15, 125, 9.2, 2, 0, 'MANUAL', 'GASOLINE', 0, '150cc DOHC', N'Đỏ Đen', '49B-999.88', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.82, 21, 32, 1, 0, 1, 1, 30000.00, 'MOTORBIKE', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 25. Suzuki Raider R150 (Motorbike - Đà Lạt)
('V-RAIDER-2024-025', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Suzuki Raider R150 Fi 2024 - Tốc Độ Xé Gió Hyper-Underbone', 'Suzuki', 'Raider', 2024, 'MOTORBIKE', N'Suzuki Raider R150 phun xăng điện tử Fi. Thiết kế phong cách Hyper-Underbone thể thao thuần khiết, động cơ 18.5 mã lực mạnh nhất phân khúc 150cc bứt tốc xé gió.', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop', 250000.00, 1600000.00, 1500000.00, N'Đà Lạt', N'Vietnam', N'Chợ Đà Lạt, Dương Minh Khai', 11.9424, 108.4365, 18, 140, 7.8, 2, 0, 'MANUAL', 'GASOLINE', 0, '150cc DOHC Fi', N'Xanh Đen', '49C-123.45', 1, 30, 365, 'AVAILABLE', 'APPROVED', 4.72, 10, 14, 1, 0, 1, 1, 30000.00, 'MOTORBIKE', '2024-05-01 10:00:00', '2024-05-23 08:00:00'),

-- 26. Ducati Scrambler Icon (Motorbike - Nha Trang)
('V-SCRAMBLER-2025-026', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Ducati Scrambler Icon 2025 - Phân Khối Lớn Đẳng Cấp', 'Ducati', 'Scrambler', 2025, 'MOTORBIKE', N'Ducati Scrambler Icon phân khối lớn 800cc đẳng cấp hoàng gia châu Âu. Thiết kế tân cổ điển cực kỳ phong trần và uy mãnh. Âm thanh pô L-Twin vang dội bãi biển Nha Trang.', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop', 1200000.00, 7800000.00, 10000000.00, N'Nha Trang', N'Vietnam', N'Tháp Bà Ponagar, Nha Trang', 12.2654, 109.1912, 73, 195, 4.5, 2, 0, 'MANUAL', 'GASOLINE', 0, '803cc L-Twin', N'Vàng Ducati', '79A-888.66', 1, 15, 365, 'AVAILABLE', 'APPROVED', 4.98, 9, 15, 1, 1, 0, 1, 50000.00, 'MOTORBIKE', '2024-05-01 10:00:00', '2024-05-23 08:00:00');

-- Insert Vehicle Images (Primary Image matching the vehicle thumbnail_url)
INSERT INTO vehicle_images (id, vehicle_id, url, is_primary, sort_order, created_at) VALUES
('IMG-001-A', 'V-VF3-2026-001', '/images/cars/MIOTO_vinfast_vf3 2026_2026_mioto.jpg', 1, 1, GETDATE()),
('IMG-001-B', 'V-VF3-2026-001', '/images/cars/MIOTO_vinfast_vf3 2025_2025_mioto.jpg', 0, 2, GETDATE()),
('IMG-002-A', 'V-CITY-RS-2025-002', '/images/cars/MIOTO_honda_city rs_2025_mioto.jpg', 1, 1, GETDATE()),
('IMG-002-B', 'V-CITY-RS-2025-002', '/images/cars/MIOTO_honda_city rs_2022_mioto.jpg', 0, 2, GETDATE()),
('IMG-003-A', 'V-CARENS-2026-003', '/images/cars/MIOTO_kia_carens 2026_2026_mioto.jpg', 1, 1, GETDATE()),
('IMG-003-B', 'V-CARENS-2026-003', '/images/cars/MIOTO_kia_carens luxury_2024_mioto.jpg', 0, 2, GETDATE()),
('IMG-004-A', 'V-VELOZ-2026-004', '/images/cars/MIOTO_toyota_veloz cross_2026_mioto.jpg', 1, 1, GETDATE()),
('IMG-004-B', 'V-VELOZ-2026-004', '/images/cars/MIOTO_toyota_veloz cross_2025_mioto.jpg', 0, 2, GETDATE()),
('IMG-005-A', 'V-MAZDA3-2026-005', '/images/cars/MIOTO_mazda_3 luxury_2026_mioto.jpg', 1, 1, GETDATE()),
('IMG-005-B', 'V-MAZDA3-2026-005', '/images/cars/MIOTO_mazda_3 deluxe_2022_mioto.jpg', 0, 2, GETDATE()),
('IMG-006-A', 'V-ACCENT-2025-006', '/images/cars/MIOTO_hyundai_accent 2025_2025_mioto.jpg', 1, 1, GETDATE()),
('IMG-007-A', 'V-TERRITORY-2024-007', '/images/cars/MIOTO_ford_territory titanium_2024_mioto.jpg', 1, 1, GETDATE()),
('IMG-008-A', 'V-COOLRAY-2025-008', '/images/cars/MIOTO_geely_coolray flagship_2025_mioto.jpg', 1, 1, GETDATE()),
('IMG-009-A', 'V-CARNIVAL-2022-009', '/images/cars/MIOTO_kia_carnival premium_2022_mioto.jpg', 1, 1, GETDATE()),
('IMG-010-A', 'V-XFORCE-2025-010', '/images/cars/MIOTO_mitsubishi_xforce ultimate_2025_mioto.jpg', 1, 1, GETDATE()),
('IMG-011-A', 'V-VF9-2025-011', '/images/cars/MIOTO_vinfast_vf9 eco_2025_mioto.jpg', 1, 1, GETDATE()),
('IMG-012-A', 'V-CAMRY-2016-012', '/images/cars/MIOTO_toyota_camry 2.0e_2016_mioto.jpg', 1, 1, GETDATE()),
('IMG-013-A', 'V-CRV-2019-013', '/images/cars/MIOTO_honda_crv l_2019_mioto.jpg', 1, 1, GETDATE()),
('IMG-014-A', 'V-CX9-2013-014', '/images/cars/MIOTO_mazda_cx9 2013_2013_mioto.jpg', 1, 1, GETDATE()),
('IMG-015-A', 'V-S500-2014-015', '/images/cars/MIOTO_mercedes_s500 2014_2014_mioto.jpg', 1, 1, GETDATE()),
('IMG-016-A', 'V-VF6-2026-016', '/images/cars/MIOTO_vinfast_vf6 plus_2026_mioto.jpg', 1, 1, GETDATE()),
('IMG-017-A', 'V-VESPA-2025-017', 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=800&auto=format&fit=crop', 1, 1, GETDATE()),
('IMG-018-A', 'V-SH150-2024-018', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop', 1, 1, GETDATE()),
('IMG-019-A', 'V-EXCITER-2025-019', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop', 1, 1, GETDATE()),
('IMG-020-A', 'V-AIRBLADE-2024-020', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop', 1, 1, GETDATE()),
('IMG-021-A', 'V-VISION-2024-021', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop', 1, 1, GETDATE()),
('IMG-022-A', 'V-PRIMAVERA-2025-022', 'https://images.unsplash.com/photo-1591378603123-2d14fa264166?w=800&auto=format&fit=crop', 1, 1, GETDATE()),
('IMG-023-A', 'V-GRANDE-2024-023', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop', 1, 1, GETDATE()),
('IMG-024-A', 'V-WINNER-2024-024', 'https://images.unsplash.com/photo-1515777315835-281b94c9589f?w=800&auto=format&fit=crop', 1, 1, GETDATE()),
('IMG-025-A', 'V-RAIDER-2024-025', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop', 1, 1, GETDATE()),
('IMG-026-A', 'V-SCRAMBLER-2025-026', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop', 1, 1, GETDATE());

-- Insert Vehicle Features (Rich specs & amenities)
INSERT INTO vehicle_features (id, vehicle_id, feature) VALUES
('F-001-A', 'V-VF3-2026-001', N'Màn hình giải trí cảm ứng 10 inch'),
('F-001-B', 'V-VF3-2026-001', N'Hỗ trợ kết nối Apple CarPlay & Android Auto'),
('F-001-C', 'V-VF3-2026-001', N'Điều hòa tích hợp màng lọc bụi mịn'),
('F-001-D', 'V-VF3-2026-001', N'Cảm biến lùi phía sau xe'),
('F-002-A', 'V-CITY-RS-2025-002', N'Gói an toàn cao cấp Honda SENSING'),
('F-002-B', 'V-CITY-RS-2025-002', N'Đèn pha Full LED hiện đại'),
('F-002-C', 'V-CITY-RS-2025-002', N'Khởi động từ xa bằng chìa khóa thông minh'),
('F-002-D', 'V-CITY-RS-2025-002', N'Camera lùi 3 góc quay sắc nét'),
('F-003-A', 'V-CARENS-2026-003', N'Không gian 7 chỗ rộng rãi bọc da cao cấp'),
('F-003-B', 'V-CARENS-2026-003', N'Đèn viền nội thất Ambient Light nhiều màu'),
('F-003-C', 'V-CARENS-2026-003', N'Cửa gió điều hòa cho cả 3 hàng ghế'),
('F-003-D', 'V-CARENS-2026-003', N'Cảm biến hỗ trợ đỗ xe trước sau'),
('F-004-A', 'V-VELOZ-2026-004', N'Hệ thống an toàn cao cấp Toyota Safety Sense'),
('F-004-B', 'V-VELOZ-2026-004', N'Camera 360 độ quan sát toàn cảnh'),
('F-004-C', 'V-VELOZ-2026-004', N'Sạc điện thoại không dây chuẩn Qi'),
('F-004-D', 'V-VELOZ-2026-004', N'Phanh tay điện tử & giữ phanh tự động Auto Hold'),
('F-005-A', 'V-MAZDA3-2026-005', N'Màn hình hiển thị thông tin kính lái HUD'),
('F-005-B', 'V-MAZDA3-2026-005', N'Hệ thống kiểm soát gia tốc GVC Plus lái cực mượt'),
('F-005-C', 'V-MAZDA3-2026-005', N'Hàng ghế trước chỉnh điện nhớ 2 vị trí'),
('F-005-D', 'V-MAZDA3-2026-005', N'Đèn pha tự động thích ứng thông minh ALH'),
('F-007-A', 'V-TERRITORY-2024-007', N'Cửa sổ trời toàn cảnh Panorama cực thoáng'),
('F-007-B', 'V-TERRITORY-2024-007', N'Màn hình đôi kỹ thuật số 12.3 inch siêu nét'),
('F-007-C', 'V-TERRITORY-2024-007', N'Hệ thống đỗ xe tự động thông minh'),
('F-009-A', 'V-CARNIVAL-2022-009', N'Ghế thương gia hàng hai chỉnh điện đa hướng, có đệm đỡ chân'),
('F-009-B', 'V-CARNIVAL-2022-009', N'Hai cửa sổ trời độc lập trước và sau'),
('F-009-C', 'V-CARNIVAL-2022-009', N'Cửa lùa điện & Cốp điện thông minh rảnh tay'),
('F-011-A', 'V-VF9-2025-011', N'Trợ lý ảo thông minh tiếng Việt Vivi'),
('F-011-B', 'V-VF9-2025-011', N'Hệ thống hỗ trợ lái nâng cao ADAS cấp độ 2'),
('F-015-A', 'V-S500-2014-015', N'Hệ thống âm thanh vòm Burmester High-End 3D 24 loa'),
('F-015-B', 'V-S500-2014-015', N'Hệ thống massage đá nóng cho hàng ghế sau VIP'),
('F-015-C', 'V-S500-2014-015', N'Hệ thống treo khí nén Magic Body Control siêu êm'),
('F-017-A', 'V-VESPA-2025-017', N'Hệ thống phanh chống bó cứng ABS bánh trước'),
('F-017-B', 'V-VESPA-2025-017', N'Cổng sạc điện thoại USB ở hộc đồ trước tiện lợi'),
('F-018-A', 'V-SH150-2024-018', N'Đèn chiếu sáng Full LED siêu sáng đẳng cấp'),
('F-018-B', 'V-SH150-2024-018', N'Hệ thống kiểm soát lực kéo HSTC chống trơn trượt'),
('F-020-A', 'V-AIRBLADE-2024-020', N'Cốp xe U-box siêu rộng chứa được laptop'),
('F-020-B', 'V-AIRBLADE-2024-020', N'Cổng sạc USB tích hợp nắp chống nước ở cốp xe'),
('F-026-A', 'V-SCRAMBLER-2025-026', N'Hệ thống đèn xi-nhan LED đuôi độc đáo'),
('F-026-B', 'V-SCRAMBLER-2025-026', N'Màn hình màu TFT kết nối điện thoại qua Bluetooth');

-- Insert Promotions
INSERT INTO promotions (id, title, description, image_url, discount_percent, badge_text, cta_text, cta_url, start_date, end_date, active, display_order, created_at) VALUES
('promo-summer', N'Summer Escape – Giảm Ngay 15%', N'Đánh bay cái nóng mùa hè với ưu đãi giảm 15% cho tất cả các dòng xe SUV và xe gia đình 7 chỗ cực rộng rãi. Lên lịch vi vu ngay!', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920&auto=format&fit=crop', 15, N'Mùa Hè Vẫy Gọi', N'Đặt Xe Ngay', '/marketplace?category=suv', '2026-06-01 00:00:00', '2026-09-30 23:59:59', 1, 1, GETDATE()),
('promo-first', N'First Ride Free – Giảm 10% Xe Đầu Tiên', N'Thành viên mới của gia đình LuxeWay? Nhập mã FIRSTRIDE tại trang thanh toán để nhận ngay ưu đãi giảm 10% cho chuyến đi đầu tiên của bạn!', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920&auto=format&fit=crop', 10, N'Thành Viên Mới', N'Đăng Ký Ngay', '/auth/register', '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1, 2, GETDATE()),
('promo-weekend', N'Weekend Luxury Roadtrip – Giảm 20% Xe Sang', N'Trải nghiệm đẳng cấp với các dòng xe thương gia (Business class). Thuê từ 3 ngày cuối tuần trở lên nhận ngay ưu đãi 20% tổng hóa đơn.', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1920&auto=format&fit=crop', 20, N'Ưu Đãi Cuối Tuần', N'Khám Phá Xe Sang', '/marketplace?category=business', '2026-06-01 00:00:00', '2026-09-30 23:59:59', 1, 3, GETDATE());

-- Insert Destination Analytics ( Vietnamese Cities with real image and live linkage)
INSERT INTO destination_analytics (city, vehicle_count, average_price, top_category, image_url, display_order, active) VALUES
(N'Hồ Chí Minh', 12, 1200000, 'SUV', 'https://images.unsplash.com/photo-1509060464153-44667396260f?q=80&w=800&auto=format&fit=crop', 1, 1),
(N'Hà Nội', 10, 1100000, 'economy', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop', 2, 1),
(N'Đà Nẵng', 8, 1300000, 'tourism', 'https://images.unsplash.com/photo-1559592443-7f87a8016958?q=80&w=800&auto=format&fit=crop', 3, 1),
(N'Đà Lạt', 6, 1400000, 'suv', 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=800&auto=format&fit=crop', 4, 1),
(N'Nha Trang', 5, 1150000, 'economy', 'https://images.unsplash.com/photo-1583249890652-f1015156771b?q=80&w=800&auto=format&fit=crop', 5, 1),
(N'Phú Quốc', 4, 1500000, 'tourism', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop', 6, 1);

-- Insert FAQs
SET IDENTITY_INSERT faqs ON;
INSERT INTO faqs (id, question, answer, is_active, display_order) VALUES
(1, N'Làm thế nào để tôi đặt một chiếc xe trên LuxeWay?', N'Quy trình đặt xe vô cùng đơn giản: 1. Đăng ký hoặc đăng nhập tài khoản. 2. Tìm kiếm xe theo thành phố, ngày nhận/trả xe và bộ lọc yêu thích. 3. Chọn chiếc xe phù hợp, điền thông tin người lái. 4. Tiến hành thanh toán đặt cọc an toàn qua cổng VNPay hoặc Stripe. 5. Liên hệ chủ xe để xác nhận điểm nhận xe.', 1, 1),
(2, N'Yêu cầu giấy tờ bắt buộc để thuê xe là gì?', N'Để nhận xe, bạn cần chuẩn bị: 1. Giấy phép lái xe hợp lệ (còn hạn sử dụng) tương thích với loại xe thuê (ví dụ hạng B1/B2 đối với ô tô). 2. CCCD/Hộ chiếu bản gốc. 3. Hoàn tất xác minh định danh (KYC) trên ứng dụng LuxeWay trước khi khởi hành chuyến đi đầu tiên.', 1, 2),
(3, N'Chi phí thuê xe đã bao gồm bảo hiểm chưa?', N'Tất cả các xe được niêm yết trên LuxeWay đều được trang bị bảo hiểm trách nhiệm dân sự bắt buộc của chủ xe. Ngoài ra, trong quá trình đặt xe, LuxeWay cung cấp thêm tùy chọn gói bảo hiểm chuyến đi cao cấp (LuxeWay Shield) giúp bảo vệ toàn diện trước các sự cố va quẹt, tai nạn hoặc trộm cắp tài sản.', 1, 3),
(4, N'Tôi làm thế nào để đăng ký làm chủ xe hoặc đối tác doanh nghiệp?', N'Rất đơn giản! Bạn chỉ cần nhấn nút "Đăng Ký", chọn vai trò "Chủ Xe" (Owner). Sau khi đăng nhập, bạn có thể dễ dàng đăng ký thông tin xe, hình ảnh và mức giá mong muốn. Nếu bạn sở hữu doanh nghiệp vận tải, hãy vào phần Profile cá nhân chọn nâng cấp lên "Tài Khoản Doanh Nghiệp" để kích hoạt các công cụ quản lý đội xe nâng cao.', 1, 4);
SET IDENTITY_INSERT faqs OFF;

PRINT '✅ Sample data with 100% REAL approved vehicles, promotions, destinations, and FAQs imported successfully!';
PRINT '';
PRINT 'Test Accounts:';
PRINT 'Admin: admin@luxeway.vn / password';
PRINT 'Customer: nguyen.van.a@gmail.com / password';
PRINT 'Owner (Individual): pham.minh.d@gmail.com / password';
PRINT 'Owner (Business): business@luxeway.vn / password';