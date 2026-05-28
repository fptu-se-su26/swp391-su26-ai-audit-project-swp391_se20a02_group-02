-- ============================================================
-- LUXEWAY SAMPLE DATA - SQL SERVER COMPATIBLE
-- ============================================================

-- Clear existing data (in reverse order of dependencies)
DELETE FROM vehicle_features;
DELETE FROM vehicle_images;
DELETE FROM vehicles;
DELETE FROM users;

-- ====== USERS DATA (SQL Server UUID Format) ======
-- Admin User
INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, avatar, phone, role, verified, kyc_verified, driving_license_verified, rating, total_reviews, total_rentals, bio, location, is_business, business_name, business_license, is_active, joined_at, last_active, created_at, updated_at) VALUES
('A1B2C3D4-E5F6-7890-ABCD-123456789012', 'admin@luxeway.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'LuxeWay', 'Admin LuxeWay', 'https://ui-avatars.com/api/?name=Admin+LuxeWay&background=0F172A&color=fff&size=200', '0901234567', 'admin', 1, 1, 1, 5.00, 0, 0, 'LuxeWay Platform Administrator', 'Hồ Chí Minh', 0, NULL, NULL, 1, '2024-01-01 00:00:00', '2024-05-23 10:00:00', '2024-01-01 00:00:00', '2024-05-23 10:00:00');

-- Customer Users
INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, avatar, phone, role, verified, kyc_verified, driving_license_verified, rating, total_reviews, total_rentals, bio, location, is_business, business_name, business_license, is_active, joined_at, last_active, created_at, updated_at) VALUES
('B2C3D4E5-F6G7-8901-BCDE-234567890123', 'nguyen.van.a@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn', 'Văn A', 'Nguyễn Văn A', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', '0901111111', 'customer', 1, 1, 1, 4.80, 15, 8, 'Yêu thích du lịch và khám phá những địa điểm mới', 'Hà Nội', 0, NULL, NULL, 1, '2024-02-15 08:30:00', '2024-05-23 09:45:00', '2024-02-15 08:30:00', '2024-05-23 09:45:00'),
('C3D4E5F6-G7H8-9012-CDEF-345678901234', 'tran.thi.b@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần', 'Thị B', 'Trần Thị B', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop', '0902222222', 'customer', 1, 1, 1, 4.90, 22, 12, 'Thích lái xe và trải nghiệm các dòng xe khác nhau', 'Hồ Chí Minh', 0, NULL, NULL, 1, '2024-03-01 14:20:00', '2024-05-23 08:15:00', '2024-03-01 14:20:00', '2024-05-23 08:15:00'),
('D4E5F6G7-H8I9-0123-DEFG-456789012345', 'le.van.c@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lê', 'Văn C', 'Lê Văn C', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', '0903333333', 'customer', 1, 0, 1, 4.60, 8, 5, 'Sinh viên đại học, thường thuê xe cho các chuyến đi ngắn', 'Đà Nẵng', 0, NULL, NULL, 1, '2024-04-10 11:45:00', '2024-05-22 20:30:00', '2024-04-10 11:45:00', '2024-05-22 20:30:00');

-- Vehicle Owner Users (Individual)
INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, avatar, phone, role, verified, kyc_verified, driving_license_verified, rating, total_reviews, total_rentals, bio, location, is_business, business_name, business_license, is_active, joined_at, last_active, created_at, updated_at) VALUES
('E5F6G7H8-I9J0-1234-EFGH-567890123456', 'pham.minh.d@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Phạm', 'Minh D', 'Phạm Minh D', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', '0904444444', 'owner', 1, 1, 1, 4.95, 45, 0, 'Chủ sở hữu 3 chiếc xe, cam kết chất lượng dịch vụ tốt nhất', 'Hà Nội', 0, NULL, NULL, 1, '2024-01-20 09:15:00', '2024-05-23 07:20:00', '2024-01-20 09:15:00', '2024-05-23 07:20:00'),
('F6G7H8I9-J0K1-2345-FGHI-678901234567', 'hoang.thi.e@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hoàng', 'Thị E', 'Hoàng Thị E', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', '0905555555', 'owner', 1, 1, 1, 4.85, 38, 0, 'Chuyên cho thuê xe cao cấp, dịch vụ chuyên nghiệp', 'Hồ Chí Minh', 0, NULL, NULL, 1, '2024-02-05 16:30:00', '2024-05-23 06:45:00', '2024-02-05 16:30:00', '2024-05-23 06:45:00');

-- Business Owner Users
INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, avatar, phone, role, verified, kyc_verified, driving_license_verified, rating, total_reviews, total_rentals, bio, location, is_business, business_name, business_license, is_active, joined_at, last_active, created_at, updated_at) VALUES
('G7H8I9J0-K1L2-3456-GHIJ-789012345678', 'contact@saigoncarrental.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn', 'Văn F', 'Saigon Car Rental', 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=200&h=200&fit=crop', '0906666666', 'owner', 1, 1, 1, 4.92, 156, 0, 'Công ty cho thuê xe hàng đầu tại TP.HCM với đội xe đa dạng', 'Hồ Chí Minh', 1, 'Saigon Car Rental Co., Ltd', 'BL-HCM-2023-001', 1, '2023-12-01 08:00:00', '2024-05-23 05:30:00', '2023-12-01 08:00:00', '2024-05-23 05:30:00'),
('H8I9J0K1-L2M3-4567-HIJK-890123456789', 'info@hanoiautorental.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần', 'Văn G', 'Hanoi Auto Rental', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop', '0907777777', 'owner', 1, 1, 1, 4.88, 89, 0, 'Dịch vụ cho thuê xe tự lái uy tín tại Hà Nội', 'Hà Nội', 1, 'Hanoi Auto Rental JSC', 'BL-HN-2024-002', 1, '2024-01-15 10:20:00', '2024-05-23 04:15:00', '2024-01-15 10:20:00', '2024-05-23 04:15:00');
-- ====== VEHICLES DATA ======
-- Individual Owner Vehicles
INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, description, thumbnail_url, price_per_day, price_per_week, deposit, city, country, address, latitude, longitude, horsepower, top_speed, acceleration, seats, doors, transmission, fuel_type, range_km, engine_size, color, license_plate, min_rental_days, max_rental_days, advance_booking_days, status, rating, total_reviews, total_bookings, is_verified, is_featured, instant_book, delivery_available, delivery_fee, created_at, updated_at) VALUES
('V1A2B3C4-D5E6-7890-VHCL-111111111111', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', 'Honda City 2023 - Xe Đẹp Như Mới', 'Honda', 'City', 2023, 'economy', 'Honda City 2023 màu trắng, nội thất đen sang trọng. Xe được bảo dưỡng định kỳ, sạch sẽ, tiết kiệm nhiên liệu. Phù hợp cho gia đình nhỏ và các chuyến đi trong thành phố.', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop', 800000.00, 5200000.00, 3000000.00, 'Hà Nội', 'Vietnam', '123 Đường Láng, Đống Đa, Hà Nội', 21.0285, 105.8542, 120, 180, 11.5, 5, 4, 'automatic', 'gasoline', 600, '1.5L', 'Trắng', '30A-12345', 1, 15, 365, 'available', 4.80, 25, 18, 1, 0, 1, 1, 50000.00, '2024-02-01 10:00:00', '2024-05-23 08:00:00'),

('V2B3C4D5-E6F7-8901-VHCL-222222222222', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', 'Toyota Vios 2022 - Tiết Kiệm Nhiên Liệu', 'Toyota', 'Vios', 2022, 'economy', 'Toyota Vios 2022 màu bạc, số tự động, máy lạnh mát, âm thanh tốt. Xe gia đình sử dụng ít, còn rất mới. Lý tưởng cho các chuyến đi xa và trong thành phố.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop', 750000.00, 4900000.00, 2800000.00, 'Hà Nội', 'Vietnam', '456 Phố Huế, Hai Bà Trưng, Hà Nội', 21.0245, 105.8525, 107, 175, 12.3, 5, 4, 'automatic', 'gasoline', 650, '1.5L', 'Bạc', '30B-67890', 1, 20, 365, 'available', 4.90, 31, 22, 1, 1, 1, 1, 50000.00, '2024-02-15 14:30:00', '2024-05-22 19:45:00'),

('V3C4D5E6-F7G8-9012-VHCL-333333333333', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', 'Honda Air Blade 2023 - Xe Máy Cao Cấp', 'Honda', 'Air Blade', 2023, 'motorbike', 'Honda Air Blade 2023 màu đỏ đen thể thao, phanh ABS, khóa thông minh. Xe mới 100%, phù hợp di chuyển nhanh trong thành phố, tiết kiệm và linh hoạt.', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop', 200000.00, 1300000.00, 1000000.00, 'Hà Nội', 'Vietnam', '789 Giải Phóng, Hoàng Mai, Hà Nội', 21.0122, 105.8667, 11, 100, 9.5, 2, 0, 'automatic', 'gasoline', 200, '150cc', 'Đỏ Đen', '29X1-12345', 1, 10, 180, 'available', 4.70, 18, 35, 1, 0, 1, 1, 30000.00, '2024-03-01 09:15:00', '2024-05-23 07:30:00'),

('V4D5E6F7-G8H9-0123-VHCL-444444444444', 'F6G7H8I9-J0K1-2345-FGHI-678901234567', 'Mercedes C200 2021 - Sang Trọng', 'Mercedes-Benz', 'C200', 2021, 'business', 'Mercedes C200 2021 màu đen, nội thất da cao cấp, đầy đủ tiện nghi hiện đại. Xe dành cho khách hàng VIP, các sự kiện quan trọng và chuyến công tác.', 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&auto=format&fit=crop', 2500000.00, 16000000.00, 8000000.00, 'Hồ Chí Minh', 'Vietnam', '123 Nguyễn Huệ, Quận 1, TP.HCM', 10.7769, 106.7009, 184, 230, 7.7, 5, 4, 'automatic', 'gasoline', 500, '1.5L Turbo', 'Đen', '51A-99999', 2, 7, 365, 'available', 4.95, 42, 28, 1, 1, 0, 1, 100000.00, '2024-02-20 11:45:00', '2024-05-23 06:20:00'),

('V5E6F7G8-H9I0-1234-VHCL-555555555555', 'F6G7H8I9-J0K1-2345-FGHI-678901234567', 'BMW X3 2022 - SUV Thể Thao', 'BMW', 'X3', 2022, 'suv', 'BMW X3 2022 màu xanh dương metallic, động cơ mạnh mẽ, hệ thống an toàn hiện đại. Phù hợp cho gia đình lớn và các chuyến đi địa hình.', 'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&auto=format&fit=crop', 3200000.00, 20000000.00, 10000000.00, 'Hồ Chí Minh', 'Vietnam', '456 Lê Lợi, Quận 1, TP.HCM', 10.7756, 106.7019, 248, 213, 6.3, 5, 4, 'automatic', 'gasoline', 450, '2.0L Turbo', 'Xanh Dương', '51B-88888', 2, 14, 365, 'available', 4.85, 35, 19, 1, 1, 0, 1, 120000.00, '2024-03-10 16:20:00', '2024-05-22 18:10:00');

-- Business Vehicles (Saigon Car Rental)
INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, description, thumbnail_url, price_per_day, price_per_week, deposit, city, country, address, latitude, longitude, horsepower, top_speed, acceleration, seats, doors, transmission, fuel_type, range_km, engine_size, color, license_plate, min_rental_days, max_rental_days, advance_booking_days, status, rating, total_reviews, total_bookings, is_verified, is_featured, instant_book, delivery_available, delivery_fee, created_at, updated_at) VALUES
('V6F7G8H9-I0J1-2345-VHCL-666666666666', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', 'Toyota Camry 2023 - Hạng Sang', 'Toyota', 'Camry', 2023, 'business', 'Toyota Camry 2023 màu đen, nội thất da beige, đầy đủ tính năng an toàn và tiện nghi. Xe doanh nghiệp cao cấp, phù hợp cho các cuộc họp và sự kiện quan trọng.', 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800&auto=format&fit=crop', 1800000.00, 11500000.00, 6000000.00, 'Hồ Chí Minh', 'Vietnam', '789 Nguyễn Văn Cừ, Quận 5, TP.HCM', 10.7589, 106.6789, 178, 210, 8.4, 5, 4, 'automatic', 'gasoline', 520, '2.5L', 'Đen', '51C-77777', 1, 30, 365, 'available', 4.92, 67, 45, 1, 1, 1, 1, 80000.00, '2024-01-05 08:30:00', '2024-05-23 05:45:00'),

('V7G8H9I0-J1K2-3456-VHCL-777777777777', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', 'Honda CR-V 2023 - SUV Gia Đình', 'Honda', 'CR-V', 2023, 'family', 'Honda CR-V 2023 màu trắng ngọc trai, 7 chỗ ngồi rộng rãi, cốp xe lớn. Lý tưởng cho gia đình đông người và các chuyến du lịch dài ngày.', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop', 1500000.00, 9800000.00, 5000000.00, 'Hồ Chí Minh', 'Vietnam', '321 Võ Văn Tần, Quận 3, TP.HCM', 10.7756, 106.6917, 190, 195, 9.1, 7, 4, 'automatic', 'gasoline', 480, '1.5L Turbo', 'Trắng', '51D-66666', 1, 21, 365, 'available', 4.88, 52, 38, 1, 0, 1, 1, 70000.00, '2024-01-15 12:00:00', '2024-05-22 20:15:00'),

('V8H9I0J1-K2L3-4567-VHCL-888888888888', 'G7H8I9J0-K1L2-3456-GHIJ-789012345678', 'VinFast VF8 2023 - Xe Điện Thông Minh', 'VinFast', 'VF8', 2023, 'electric', 'VinFast VF8 2023 màu xanh lá, xe điện thông minh với công nghệ tự lái cấp độ 2, màn hình cảm ứng lớn. Thân thiện môi trường, vận hành êm ái.', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop', 2200000.00, 14000000.00, 7000000.00, 'Hồ Chí Minh', 'Vietnam', '654 Lê Văn Sỹ, Quận 3, TP.HCM', 10.7869, 106.6831, 408, 200, 5.9, 5, 4, 'automatic', 'electric', 420, 'Electric', 'Xanh Lá', '51E-55555', 1, 14, 365, 'available', 4.75, 28, 15, 1, 1, 1, 1, 90000.00, '2024-02-01 14:45:00', '2024-05-23 04:30:00');
-- Business Vehicles (Hanoi Auto Rental)
INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, description, thumbnail_url, price_per_day, price_per_week, deposit, city, country, address, latitude, longitude, horsepower, top_speed, acceleration, seats, doors, transmission, fuel_type, range_km, engine_size, color, license_plate, min_rental_days, max_rental_days, advance_booking_days, status, rating, total_reviews, total_bookings, is_verified, is_featured, instant_book, delivery_available, delivery_fee, created_at, updated_at) VALUES
('V9I0J1K2-L3M4-5678-VHCL-999999999999', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', 'Mazda CX-5 2023 - SUV Nhật Bản', 'Mazda', 'CX-5', 2023, 'suv', 'Mazda CX-5 2023 màu đỏ pha lê, thiết kế KODO đẹp mắt, công nghệ SKYACTIV tiết kiệm nhiên liệu. Xe SUV 5 chỗ cao cấp, phù hợp mọi địa hình.', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop', 1600000.00, 10500000.00, 5500000.00, 'Hà Nội', 'Vietnam', '987 Phạm Hùng, Nam Từ Liêm, Hà Nội', 21.0378, 105.7804, 188, 200, 8.7, 5, 4, 'automatic', 'gasoline', 500, '2.5L', 'Đỏ', '30C-44444', 1, 20, 365, 'available', 4.90, 41, 29, 1, 1, 1, 1, 60000.00, '2024-01-25 09:30:00', '2024-05-23 03:20:00'),

('VA0J1K2L-M3N4-6789-VHCL-AAAAAAAAAAAA', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', 'Hyundai Tucson 2022 - Crossover Hiện Đại', 'Hyundai', 'Tucson', 2022, 'suv', 'Hyundai Tucson 2022 màu xám titan, thiết kế hiện đại với đèn LED Parametric. Nội thất rộng rãi, công nghệ SmartSense an toàn cao.', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop', 1400000.00, 9100000.00, 4800000.00, 'Hà Nội', 'Vietnam', '147 Trần Duy Hưng, Cầu Giấy, Hà Nội', 21.0313, 105.7981, 177, 193, 9.3, 5, 4, 'automatic', 'gasoline', 485, '2.0L', 'Xám', '30D-33333', 1, 18, 365, 'available', 4.85, 36, 24, 1, 0, 1, 1, 55000.00, '2024-02-10 11:15:00', '2024-05-22 17:40:00'),

('VB1K2L3M-N4O5-7890-VHCL-BBBBBBBBBBBB', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', 'Kia Morning 2023 - Xe Nhỏ Gọn', 'Kia', 'Morning', 2023, 'city_car', 'Kia Morning 2023 màu vàng chanh, xe nhỏ gọn lý tưởng cho việc di chuyển trong thành phố. Tiết kiệm nhiên liệu, dễ đậu xe, phù hợp với sinh viên và nhân viên văn phòng.', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop', 600000.00, 3900000.00, 2200000.00, 'Hà Nội', 'Vietnam', '258 Tô Hiệu, Lê Chân, Hải Phòng', 20.8449, 106.6881, 83, 155, 14.2, 5, 4, 'manual', 'gasoline', 550, '1.25L', 'Vàng', '15A-22222', 1, 12, 180, 'available', 4.60, 22, 31, 1, 0, 1, 0, 40000.00, '2024-03-05 15:45:00', '2024-05-23 02:10:00'),

('VC2L3M4N-O5P6-8901-VHCL-CCCCCCCCCCCC', 'H8I9J0K1-L2M3-4567-HIJK-890123456789', 'Ford Everest 2022 - SUV 7 Chỗ', 'Ford', 'Everest', 2022, 'tourism', 'Ford Everest 2022 màu nâu đồng, SUV 7 chỗ mạnh mẽ với khả năng vượt địa hình tốt. Phù hợp cho các chuyến du lịch gia đình và khám phá thiên nhiên.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop', 2000000.00, 13000000.00, 6500000.00, 'Hà Nội', 'Vietnam', '369 Nguyễn Trãi, Thanh Xuân, Hà Nội', 21.0058, 105.8086, 213, 180, 10.2, 7, 4, 'automatic', 'diesel', 400, '2.0L Turbo', 'Nâu', '30E-11111', 2, 21, 365, 'available', 4.78, 33, 18, 1, 0, 0, 1, 75000.00, '2024-02-28 13:20:00', '2024-05-22 16:55:00');

-- ====== VEHICLE IMAGES ======
INSERT INTO vehicle_images (id, vehicle_id, url, is_primary, sort_order, created_at) VALUES
-- Honda City images
('IMG1A2B3-C4D5-6789-IMGS-111111111111', 'V1A2B3C4-D5E6-7890-VHCL-111111111111', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop', 1, 1, '2024-02-01 10:05:00'),
('IMG2B3C4-D5E6-7890-IMGS-222222222222', 'V1A2B3C4-D5E6-7890-VHCL-111111111111', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop', 0, 2, '2024-02-01 10:05:00'),
('IMG3C4D5-E6F7-8901-IMGS-333333333333', 'V1A2B3C4-D5E6-7890-VHCL-111111111111', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop', 0, 3, '2024-02-01 10:05:00'),

-- Toyota Vios images
('IMG4D5E6-F7G8-9012-IMGS-444444444444', 'V2B3C4D5-E6F7-8901-VHCL-222222222222', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop', 1, 1, '2024-02-15 14:35:00'),
('IMG5E6F7-G8H9-0123-IMGS-555555555555', 'V2B3C4D5-E6F7-8901-VHCL-222222222222', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop', 0, 2, '2024-02-15 14:35:00'),

-- Honda Air Blade images
('IMG6F7G8-H9I0-1234-IMGS-666666666666', 'V3C4D5E6-F7G8-9012-VHCL-333333333333', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop', 1, 1, '2024-03-01 09:20:00'),
('IMG7G8H9-I0J1-2345-IMGS-777777777777', 'V3C4D5E6-F7G8-9012-VHCL-333333333333', 'https://images.unsplash.com/photo-1558980394-0a37b3636608?w=800&auto=format&fit=crop', 0, 2, '2024-03-01 09:20:00'),

-- Mercedes C200 images
('IMG8H9I0-J1K2-3456-IMGS-888888888888', 'V4D5E6F7-G8H9-0123-VHCL-444444444444', 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&auto=format&fit=crop', 1, 1, '2024-02-20 11:50:00'),
('IMG9I0J1-K2L3-4567-IMGS-999999999999', 'V4D5E6F7-G8H9-0123-VHCL-444444444444', 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800&auto=format&fit=crop', 0, 2, '2024-02-20 11:50:00'),
('IMGAJ1K2-L3M4-5678-IMGS-AAAAAAAAAAAA', 'V4D5E6F7-G8H9-0123-VHCL-444444444444', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop', 0, 3, '2024-02-20 11:50:00'),

-- BMW X3 images
('IMGBK2L3-M4N5-6789-IMGS-BBBBBBBBBBBB', 'V5E6F7G8-H9I0-1234-VHCL-555555555555', 'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&auto=format&fit=crop', 1, 1, '2024-03-10 16:25:00'),
('IMGCL3M4-N5O6-7890-IMGS-CCCCCCCCCCCC', 'V5E6F7G8-H9I0-1234-VHCL-555555555555', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop', 0, 2, '2024-03-10 16:25:00');
-- ====== VEHICLE FEATURES ======
INSERT INTO vehicle_features (id, vehicle_id, feature) VALUES
-- Honda City features
('FEAT1A2B-3C4D-5678-FEAT-111111111111', 'V1A2B3C4-D5E6-7890-VHCL-111111111111', 'Điều hòa tự động'),
('FEAT2B3C-4D5E-6789-FEAT-222222222222', 'V1A2B3C4-D5E6-7890-VHCL-111111111111', 'Camera lùi'),
('FEAT3C4D-5E6F-7890-FEAT-333333333333', 'V1A2B3C4-D5E6-7890-VHCL-111111111111', 'Bluetooth'),
('FEAT4D5E-6F7G-8901-FEAT-444444444444', 'V1A2B3C4-D5E6-7890-VHCL-111111111111', 'USB/AUX'),
('FEAT5E6F-7G8H-9012-FEAT-555555555555', 'V1A2B3C4-D5E6-7890-VHCL-111111111111', 'Cảm biến áp suất lốp'),

-- Toyota Vios features
('FEAT6F7G-8H9I-0123-FEAT-666666666666', 'V2B3C4D5-E6F7-8901-VHCL-222222222222', 'Điều hòa tự động'),
('FEAT7G8H-9I0J-1234-FEAT-777777777777', 'V2B3C4D5-E6F7-8901-VHCL-222222222222', 'Camera 360 độ'),
('FEAT8H9I-0J1K-2345-FEAT-888888888888', 'V2B3C4D5-E6F7-8901-VHCL-222222222222', 'Bluetooth'),
('FEAT9I0J-1K2L-3456-FEAT-999999999999', 'V2B3C4D5-E6F7-8901-VHCL-222222222222', 'Cảm biến va chạm'),
('FEATAJ1K-2L3M-4567-FEAT-AAAAAAAAAAAA', 'V2B3C4D5-E6F7-8901-VHCL-222222222222', 'Khởi động bằng nút bấm'),

-- Honda Air Blade features
('FEATBK2L-3M4N-5678-FEAT-BBBBBBBBBBBB', 'V3C4D5E6-F7G8-9012-VHCL-333333333333', 'Phanh ABS'),
('FEATCL3M-4N5O-6789-FEAT-CCCCCCCCCCCC', 'V3C4D5E6-F7G8-9012-VHCL-333333333333', 'Khóa thông minh'),
('FEATDM4N-5O6P-7890-FEAT-DDDDDDDDDDDD', 'V3C4D5E6-F7G8-9012-VHCL-333333333333', 'Đèn LED'),
('FEATEN5O-6P7Q-8901-FEAT-EEEEEEEEEEEE', 'V3C4D5E6-F7G8-9012-VHCL-333333333333', 'Cốp xe rộng'),

-- Mercedes C200 features
('FEATFO6P-7Q8R-9012-FEAT-FFFFFFFFFFFF', 'V4D5E6F7-G8H9-0123-VHCL-444444444444', 'Nội thất da cao cấp'),
('FEATGP7Q-8R9S-0123-FEAT-GGGGGGGGGGGG', 'V4D5E6F7-G8H9-0123-VHCL-444444444444', 'Hệ thống âm thanh Burmester'),
('FEATHQ8R-9S0T-1234-FEAT-HHHHHHHHHHHH', 'V4D5E6F7-G8H9-0123-VHCL-444444444444', 'Điều hòa tự động 2 vùng'),
('FEATIR9S-0T1U-2345-FEAT-IIIIIIIIIIII', 'V4D5E6F7-G8H9-0123-VHCL-444444444444', 'Cửa sổ trời'),
('FEATJS0T-1U2V-3456-FEAT-JJJJJJJJJJJJ', 'V4D5E6F7-G8H9-0123-VHCL-444444444444', 'Hệ thống an toàn Mercedes me'),
('FEATKT1U-2V3W-4567-FEAT-KKKKKKKKKKKK', 'V4D5E6F7-G8H9-0123-VHCL-444444444444', 'Ghế chỉnh điện'),

-- BMW X3 features
('FEATLU2V-3W4X-5678-FEAT-LLLLLLLLLLLL', 'V5E6F7G8-H9I0-1234-VHCL-555555555555', 'Hệ thống iDrive'),
('FEATMV3W-4X5Y-6789-FEAT-MMMMMMMMMMMM', 'V5E6F7G8-H9I0-1234-VHCL-555555555555', 'Dẫn động 4 bánh xDrive'),
('FEATNW4X-5Y6Z-7890-FEAT-NNNNNNNNNNNN', 'V5E6F7G8-H9I0-1234-VHCL-555555555555', 'Hệ thống âm thanh Harman Kardon'),
('FEATOX5Y-6Z7A-8901-FEAT-OOOOOOOOOOOO', 'V5E6F7G8-H9I0-1234-VHCL-555555555555', 'Cửa sổ trời toàn cảnh'),
('FEATPY6Z-7A8B-9012-FEAT-PPPPPPPPPPPP', 'V5E6F7G8-H9I0-1234-VHCL-555555555555', 'Hỗ trợ đỗ xe tự động');

-- ====== SYSTEM SETTINGS ======
INSERT INTO system_settings (id, key_name, value, data_type, description, is_public, created_at, updated_at) VALUES
('SET1A2B3-C4D5-6789-SETT-111111111111', 'platform_commission_rate', '0.15', 'number', 'Tỷ lệ hoa hồng platform (15%)', 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('SET2B3C4-D5E6-7890-SETT-222222222222', 'service_fee_rate', '0.12', 'number', 'Tỷ lệ phí dịch vụ (12%)', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('SET3C4D5-E6F7-8901-SETT-333333333333', 'tax_rate', '0.08', 'number', 'Tỷ lệ thuế (8%)', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('SET4D5E6-F7G8-9012-SETT-444444444444', 'max_advance_booking_days', '365', 'number', 'Số ngày tối đa có thể đặt trước', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('SET5E6F7-G8H9-0123-SETT-555555555555', 'min_cancellation_hours', '24', 'number', 'Số giờ tối thiểu để hủy booking', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('SET6F7G8-H9I0-1234-SETT-666666666666', 'platform_name', 'LuxeWay', 'string', 'Tên platform', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('SET7G8H9-I0J1-2345-SETT-777777777777', 'support_email', 'support@luxeway.vn', 'string', 'Email hỗ trợ khách hàng', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('SET8H9I0-J1K2-3456-SETT-888888888888', 'support_phone', '1900-LUXEWAY', 'string', 'Hotline hỗ trợ', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- ====== COUPONS ======
INSERT INTO coupons (id, code, type, value, min_amount, max_discount, usage_limit, usage_count, expires_at, valid_for_first_time, is_active, created_at) VALUES
('CPN1A2B3-C4D5-6789-CUPN-111111111111', 'WELCOME2024', 'percentage', 15.00, 500000.00, 200000.00, 1000, 245, '2024-12-31 23:59:59', 1, 1, '2024-01-01 00:00:00'),
('CPN2B3C4-D5E6-7890-CUPN-222222222222', 'SUMMER50K', 'fixed', 50000.00, 1000000.00, NULL, 500, 123, '2024-08-31 23:59:59', 0, 1, '2024-06-01 00:00:00'),
('CPN3C4D5-E6F7-8901-CUPN-333333333333', 'LONGTERM20', 'percentage', 20.00, 2000000.00, 500000.00, 200, 45, '2024-12-31 23:59:59', 0, 1, '2024-01-01 00:00:00'),
('CPN4D5E6-F7G8-9012-CUPN-444444444444', 'STUDENT100K', 'fixed', 100000.00, 1500000.00, NULL, 300, 78, '2024-12-31 23:59:59', 0, 1, '2024-03-01 00:00:00'),
('CPN5E6F7-G8H9-0123-CUPN-555555555555', 'VIP25', 'percentage', 25.00, 5000000.00, 1000000.00, 100, 12, '2024-12-31 23:59:59', 0, 1, '2024-01-01 00:00:00');

-- Success message
PRINT 'LuxeWay sample data has been successfully inserted!';
PRINT 'Total Users: 8 (1 Admin, 3 Customers, 2 Individual Owners, 2 Business Owners)';
PRINT 'Total Vehicles: 12 (Various categories from Economy to Luxury)';
PRINT 'Total Vehicle Images: 12';
PRINT 'Total Vehicle Features: 25';
PRINT 'Total System Settings: 8';
PRINT 'Total Coupons: 5';
PRINT '';
PRINT 'Test Accounts:';
PRINT 'Admin: admin@luxeway.vn / password';
PRINT 'Customer: nguyen.van.a@gmail.com / password';
PRINT 'Owner: pham.minh.d@gmail.com / password';
PRINT 'Business: contact@saigoncarrental.vn / password';
PRINT '';
PRINT 'Ready to start LuxeWay backend development! 🚗✨';