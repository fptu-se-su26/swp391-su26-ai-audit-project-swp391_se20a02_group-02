-- ============================================================
-- LUXEWAY SAMPLE DATA - VIETNAMESE MARKET FOCUSED
-- ============================================================

-- Clear existing data (in reverse order of dependencies)
DELETE FROM audit_trails;
DELETE FROM feature_flags;
DELETE FROM external_integrations;
DELETE FROM webhook_deliveries;
DELETE FROM webhooks;
DELETE FROM api_keys;
DELETE FROM promotional_campaigns;
DELETE FROM vehicle_maintenance;
DELETE FROM insurance_claims;
DELETE FROM loyalty_points;
DELETE FROM referral_programs;
DELETE FROM email_templates;
DELETE FROM system_settings;
DELETE FROM admin_logs;
DELETE FROM analytics;
DELETE FROM wishlists;
DELETE FROM payment_methods;
DELETE FROM vehicle_availability;
DELETE FROM dispute_evidence;
DELETE FROM disputes;
DELETE FROM conversation_participants;
DELETE FROM booking_addons;
DELETE FROM vehicle_addons;
DELETE FROM vehicle_features;
DELETE FROM vehicle_images;
DELETE FROM user_documents;
DELETE FROM notifications;
DELETE FROM conversations;
DELETE FROM messages;
DELETE FROM reviews;
DELETE FROM payments;
DELETE FROM bookings;
DELETE FROM vehicles;
DELETE FROM coupons;
DELETE FROM users;

-- ====== USERS DATA ======
-- Admin User
INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, avatar, phone, role, verified, kyc_verified, driving_license_verified, rating, total_reviews, total_rentals, bio, location, is_business, business_name, business_license, is_active, joined_at, last_active, created_at, updated_at) VALUES
('c8392678-66d8-47d5-a988-1b92ff5c0abf', 'admin@luxeway.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'LuxeWay', 'Admin LuxeWay', 'https://ui-avatars.com/api/?name=Admin+LuxeWay&background=0F172A&color=fff&size=200', '0901234567', 'ADMIN', 1, 1, 1, 5.00, 0, 0, 'LuxeWay Platform Administrator', 'Hồ Chí Minh', 0, NULL, NULL, 1, '2024-01-01 00:00:00', '2024-05-23 10:00:00', '2024-01-01 00:00:00', '2024-05-23 10:00:00');

-- Customer Users
INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, avatar, phone, role, verified, kyc_verified, driving_license_verified, rating, total_reviews, total_rentals, bio, location, is_business, business_name, business_license, is_active, joined_at, last_active, created_at, updated_at) VALUES
('customer-001', 'nguyen.van.a@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn', 'Văn A', 'Nguyễn Văn A', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', '0901111111', 'CUSTOMER', 1, 1, 1, 4.80, 15, 8, 'Yêu thích du lịch và khám phá những địa điểm mới', 'Hà Nội', 0, NULL, NULL, 1, '2024-02-15 08:30:00', '2024-05-23 09:45:00', '2024-02-15 08:30:00', '2024-05-23 09:45:00'),
('customer-002', 'tran.thi.b@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần', 'Thị B', 'Trần Thị B', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop', '0902222222', 'CUSTOMER', 1, 1, 1, 4.90, 22, 12, 'Thích lái xe và trải nghiệm các dòng xe khác nhau', 'Hồ Chí Minh', 0, NULL, NULL, 1, '2024-03-01 14:20:00', '2024-05-23 08:15:00', '2024-03-01 14:20:00', '2024-05-23 08:15:00'),
('customer-003', 'le.van.c@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lê', 'Văn C', 'Lê Văn C', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', '0903333333', 'CUSTOMER', 1, 0, 1, 4.60, 8, 5, 'Sinh viên đại học, thường thuê xe cho các chuyến đi ngắn', 'Đà Nẵng', 0, NULL, NULL, 1, '2024-04-10 11:45:00', '2024-05-22 20:30:00', '2024-04-10 11:45:00', '2024-05-22 20:30:00');

-- Vehicle Owner Users (Individual)
INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, avatar, phone, role, verified, kyc_verified, driving_license_verified, rating, total_reviews, total_rentals, bio, location, is_business, business_name, business_license, is_active, joined_at, last_active, created_at, updated_at) VALUES
('owner-001', 'pham.minh.d@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Phạm', 'Minh D', 'Phạm Minh D', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', '0904444444', 'OWNER', 1, 1, 1, 4.95, 45, 0, 'Chủ sở hữu 3 chiếc xe, cam kết chất lượng dịch vụ tốt nhất', 'Hà Nội', 0, NULL, NULL, 1, '2024-01-20 09:15:00', '2024-05-23 07:20:00', '2024-01-20 09:15:00', '2024-05-23 07:20:00'),
('owner-002', 'hoang.thi.e@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hoàng', 'Thị E', 'Hoàng Thị E', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', '0905555555', 'OWNER', 1, 1, 1, 4.85, 38, 0, 'Chuyên cho thuê xe cao cấp, dịch vụ chuyên nghiệp', 'Hồ Chí Minh', 0, NULL, NULL, 1, '2024-02-05 16:30:00', '2024-05-23 06:45:00', '2024-02-05 16:30:00', '2024-05-23 06:45:00');

-- Business Owner Users
INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, avatar, phone, role, verified, kyc_verified, driving_license_verified, rating, total_reviews, total_rentals, bio, location, is_business, business_name, business_license, is_active, joined_at, last_active, created_at, updated_at) VALUES
('business-001', 'contact@saigoncarrental.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn', 'Văn F', 'Saigon Car Rental', 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=200&h=200&fit=crop', '0906666666', 'OWNER', 1, 1, 1, 4.92, 156, 0, 'Công ty cho thuê xe hàng đầu tại TP.HCM với đội xe đa dạng', 'Hồ Chí Minh', 1, 'Saigon Car Rental Co., Ltd', 'BL-HCM-2023-001', 1, '2023-12-01 08:00:00', '2024-05-23 05:30:00', '2023-12-01 08:00:00', '2024-05-23 05:30:00'),
('business-002', 'info@hanoiautorental.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần', 'Văn G', 'Hanoi Auto Rental', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop', '0907777777', 'OWNER', 1, 1, 1, 4.88, 89, 0, 'Dịch vụ cho thuê xe tự lái uy tín tại Hà Nội', 'Hà Nội', 1, 'Hanoi Auto Rental JSC', 'BL-HN-2024-002', 1, '2024-01-15 10:20:00', '2024-05-23 04:15:00', '2024-01-15 10:20:00', '2024-05-23 04:15:00');
-- ====== VEHICLES DATA ======
-- Individual Owner Vehicles
INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, description, thumbnail_url, price_per_day, price_per_week, deposit, city, country, address, latitude, longitude, horsepower, top_speed, acceleration, seats, doors, transmission, fuel_type, range_km, engine_size, color, license_plate, min_rental_days, max_rental_days, advance_booking_days, status, rating, total_reviews, total_bookings, is_verified, is_featured, instant_book, delivery_available, delivery_fee, created_at, updated_at) VALUES
('vehicle-001', 'owner-001', 'Honda City 2023 - Xe Đẹp Như Mới', 'Honda', 'City', 2023, 'ECONOMY', 'Honda City 2023 màu trắng, nội thất đen sang trọng. Xe được bảo dưỡng định kỳ, sạch sẽ, tiết kiệm nhiên liệu. Phù hợp cho gia đình nhỏ và các chuyến đi trong thành phố.', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop', 800000.00, 5200000.00, 3000000.00, 'Hà Nội', 'Vietnam', '123 Đường Láng, Đống Đa, Hà Nội', 21.0285, 105.8542, 120, 180, 11.5, 5, 4, 'AUTOMATIC', 'GASOLINE', 600, '1.5L', 'Trắng', '30A-12345', 1, 15, 365, 'AVAILABLE', 4.80, 25, 18, 1, 0, 1, 1, 50000.00, '2024-02-01 10:00:00', '2024-05-23 08:00:00'),

('vehicle-002', 'owner-001', 'Toyota Vios 2022 - Tiết Kiệm Nhiên Liệu', 'Toyota', 'Vios', 2022, 'ECONOMY', 'Toyota Vios 2022 màu bạc, số tự động, máy lạnh mát, âm thanh tốt. Xe gia đình sử dụng ít, còn rất mới. Lý tưởng cho các chuyến đi xa và trong thành phố.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop', 750000.00, 4900000.00, 2800000.00, 'Hà Nội', 'Vietnam', '456 Phố Huế, Hai Bà Trưng, Hà Nội', 21.0245, 105.8525, 107, 175, 12.3, 5, 4, 'AUTOMATIC', 'GASOLINE', 650, '1.5L', 'Bạc', '30B-67890', 1, 20, 365, 'AVAILABLE', 4.90, 31, 22, 1, 1, 1, 1, 50000.00, '2024-02-15 14:30:00', '2024-05-22 19:45:00'),

('vehicle-003', 'owner-001', 'Honda Air Blade 2023 - Xe Máy Cao Cấp', 'Honda', 'Air Blade', 2023, 'MOTORBIKE', 'Honda Air Blade 2023 màu đỏ đen thể thao, phanh ABS, khóa thông minh. Xe mới 100%, phù hợp di chuyển nhanh trong thành phố, tiết kiệm và linh hoạt.', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop', 200000.00, 1300000.00, 1000000.00, 'Hà Nội', 'Vietnam', '789 Giải Phóng, Hoàng Mai, Hà Nội', 21.0122, 105.8667, 11, 100, 9.5, 2, 0, 'AUTOMATIC', 'GASOLINE', 200, '150cc', 'Đỏ Đen', '29X1-12345', 1, 10, 180, 'AVAILABLE', 4.70, 18, 35, 1, 0, 1, 1, 30000.00, '2024-03-01 09:15:00', '2024-05-23 07:30:00'),

('vehicle-004', 'owner-002', 'Mercedes C200 2021 - Sang Trọng', 'Mercedes-Benz', 'C200', 2021, 'BUSINESS', 'Mercedes C200 2021 màu đen, nội thất da cao cấp, đầy đủ tiện nghi hiện đại. Xe dành cho khách hàng VIP, các sự kiện quan trọng và chuyến công tác.', 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&auto=format&fit=crop', 2500000.00, 16000000.00, 8000000.00, 'Hồ Chí Minh', 'Vietnam', '123 Nguyễn Huệ, Quận 1, TP.HCM', 10.7769, 106.7009, 184, 230, 7.7, 5, 4, 'AUTOMATIC', 'GASOLINE', 500, '1.5L Turbo', 'Đen', '51A-99999', 2, 7, 365, 'AVAILABLE', 4.95, 42, 28, 1, 1, 0, 1, 100000.00, '2024-02-20 11:45:00', '2024-05-23 06:20:00'),

('vehicle-005', 'owner-002', 'BMW X3 2022 - SUV Thể Thao', 'BMW', 'X3', 2022, 'SUV', 'BMW X3 2022 màu xanh dương metallic, động cơ mạnh mẽ, hệ thống an toàn hiện đại. Phù hợp cho gia đình lớn và các chuyến đi địa hình.', 'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&auto=format&fit=crop', 3200000.00, 20000000.00, 10000000.00, 'Hồ Chí Minh', 'Vietnam', '456 Lê Lợi, Quận 1, TP.HCM', 10.7756, 106.7019, 248, 213, 6.3, 5, 4, 'AUTOMATIC', 'GASOLINE', 450, '2.0L Turbo', 'Xanh Dương', '51B-88888', 2, 14, 365, 'AVAILABLE', 4.85, 35, 19, 1, 1, 0, 1, 120000.00, '2024-03-10 16:20:00', '2024-05-22 18:10:00');

-- Business Vehicles (Saigon Car Rental)
INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, description, thumbnail_url, price_per_day, price_per_week, deposit, city, country, address, latitude, longitude, horsepower, top_speed, acceleration, seats, doors, transmission, fuel_type, range_km, engine_size, color, license_plate, min_rental_days, max_rental_days, advance_booking_days, status, rating, total_reviews, total_bookings, is_verified, is_featured, instant_book, delivery_available, delivery_fee, created_at, updated_at) VALUES
('vehicle-006', 'business-001', 'Toyota Camry 2023 - Hạng Sang', 'Toyota', 'Camry', 2023, 'BUSINESS', 'Toyota Camry 2023 màu đen, nội thất da beige, đầy đủ tính năng an toàn và tiện nghi. Xe doanh nghiệp cao cấp, phù hợp cho các cuộc họp và sự kiện quan trọng.', 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800&auto=format&fit=crop', 1800000.00, 11500000.00, 6000000.00, 'Hồ Chí Minh', 'Vietnam', '789 Nguyễn Văn Cừ, Quận 5, TP.HCM', 10.7589, 106.6789, 178, 210, 8.4, 5, 4, 'AUTOMATIC', 'GASOLINE', 520, '2.5L', 'Đen', '51C-77777', 1, 30, 365, 'AVAILABLE', 4.92, 67, 45, 1, 1, 1, 1, 80000.00, '2024-01-05 08:30:00', '2024-05-23 05:45:00'),

('vehicle-007', 'business-001', 'Honda CR-V 2023 - SUV Gia Đình', 'Honda', 'CR-V', 2023, 'FAMILY', 'Honda CR-V 2023 màu trắng ngọc trai, 7 chỗ ngồi rộng rãi, cốp xe lớn. Lý tưởng cho gia đình đông người và các chuyến du lịch dài ngày.', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop', 1500000.00, 9800000.00, 5000000.00, 'Hồ Chí Minh', 'Vietnam', '321 Võ Văn Tần, Quận 3, TP.HCM', 10.7756, 106.6917, 190, 195, 9.1, 7, 4, 'AUTOMATIC', 'GASOLINE', 480, '1.5L Turbo', 'Trắng', '51D-66666', 1, 21, 365, 'AVAILABLE', 4.88, 52, 38, 1, 0, 1, 1, 70000.00, '2024-01-15 12:00:00', '2024-05-22 20:15:00'),

('vehicle-008', 'business-001', 'VinFast VF8 2023 - Xe Điện Thông Minh', 'VinFast', 'VF8', 2023, 'ELECTRIC', 'VinFast VF8 2023 màu xanh lá, xe điện thông minh với công nghệ tự lái cấp độ 2, màn hình cảm ứng lớn. Thân thiện môi trường, vận hành êm ái.', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop', 2200000.00, 14000000.00, 7000000.00, 'Hồ Chí Minh', 'Vietnam', '654 Lê Văn Sỹ, Quận 3, TP.HCM', 10.7869, 106.6831, 408, 200, 5.9, 5, 4, 'AUTOMATIC', 'ELECTRIC', 420, 'Electric', 'Xanh Lá', '51E-55555', 1, 14, 365, 'AVAILABLE', 4.75, 28, 15, 1, 1, 1, 1, 90000.00, '2024-02-01 14:45:00', '2024-05-23 04:30:00');

-- Business Vehicles (Hanoi Auto Rental)
INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, description, thumbnail_url, price_per_day, price_per_week, deposit, city, country, address, latitude, longitude, horsepower, top_speed, acceleration, seats, doors, transmission, fuel_type, range_km, engine_size, color, license_plate, min_rental_days, max_rental_days, advance_booking_days, status, rating, total_reviews, total_bookings, is_verified, is_featured, instant_book, delivery_available, delivery_fee, created_at, updated_at) VALUES
('vehicle-009', 'business-002', 'Mazda CX-5 2023 - SUV Nhật Bản', 'Mazda', 'CX-5', 2023, 'SUV', 'Mazda CX-5 2023 màu đỏ pha lê, thiết kế KODO đẹp mắt, công nghệ SKYACTIV tiết kiệm nhiên liệu. Xe SUV 5 chỗ cao cấp, phù hợp mọi địa hình.', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop', 1600000.00, 10500000.00, 5500000.00, 'Hà Nội', 'Vietnam', '987 Phạm Hùng, Nam Từ Liêm, Hà Nội', 21.0378, 105.7804, 188, 200, 8.7, 5, 4, 'AUTOMATIC', 'GASOLINE', 500, '2.5L', 'Đỏ', '30C-44444', 1, 20, 365, 'AVAILABLE', 4.90, 41, 29, 1, 1, 1, 1, 60000.00, '2024-01-25 09:30:00', '2024-05-23 03:20:00'),

('vehicle-010', 'business-002', 'Hyundai Tucson 2022 - Crossover Hiện Đại', 'Hyundai', 'Tucson', 2022, 'SUV', 'Hyundai Tucson 2022 màu xám titan, thiết kế hiện đại với đèn LED Parametric. Nội thất rộng rãi, công nghệ SmartSense an toàn cao.', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop', 1400000.00, 9100000.00, 4800000.00, 'Hà Nội', 'Vietnam', '147 Trần Duy Hưng, Cầu Giấy, Hà Nội', 21.0313, 105.7981, 177, 193, 9.3, 5, 4, 'AUTOMATIC', 'GASOLINE', 485, '2.0L', 'Xám', '30D-33333', 1, 18, 365, 'AVAILABLE', 4.85, 36, 24, 1, 0, 1, 1, 55000.00, '2024-02-10 11:15:00', '2024-05-22 17:40:00'),

('vehicle-011', 'business-002', 'Kia Morning 2023 - Xe Nhỏ Gọn', 'Kia', 'Morning', 2023, 'CITY_CAR', 'Kia Morning 2023 màu vàng chanh, xe nhỏ gọn lý tưởng cho việc di chuyển trong thành phố. Tiết kiệm nhiên liệu, dễ đậu xe, phù hợp với sinh viên và nhân viên văn phòng.', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop', 600000.00, 3900000.00, 2200000.00, 'Hà Nội', 'Vietnam', '258 Tô Hiệu, Lê Chân, Hải Phòng', 20.8449, 106.6881, 83, 155, 14.2, 5, 4, 'MANUAL', 'GASOLINE', 550, '1.25L', 'Vàng', '15A-22222', 1, 12, 180, 'AVAILABLE', 4.60, 22, 31, 1, 0, 1, 0, 40000.00, '2024-03-05 15:45:00', '2024-05-23 02:10:00'),

('vehicle-012', 'business-002', 'Ford Everest 2022 - SUV 7 Chỗ', 'Ford', 'Everest', 2022, 'TOURISM', 'Ford Everest 2022 màu nâu đồng, SUV 7 chỗ mạnh mẽ với khả năng vượt địa hình tốt. Phù hợp cho các chuyến du lịch gia đình và khám phá thiên nhiên.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop', 2000000.00, 13000000.00, 6500000.00, 'Hà Nội', 'Vietnam', '369 Nguyễn Trãi, Thanh Xuân, Hà Nội', 21.0058, 105.8086, 213, 180, 10.2, 7, 4, 'AUTOMATIC', 'DIESEL', 400, '2.0L Turbo', 'Nâu', '30E-11111', 2, 21, 365, 'AVAILABLE', 4.78, 33, 18, 1, 0, 0, 1, 75000.00, '2024-02-28 13:20:00', '2024-05-22 16:55:00');

-- ====== VEHICLE IMAGES ======
INSERT INTO vehicle_images (id, vehicle_id, url, is_primary, sort_order, created_at) VALUES
-- Honda City images
('img-001', 'vehicle-001', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop', 1, 1, '2024-02-01 10:05:00'),
('img-002', 'vehicle-001', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop', 0, 2, '2024-02-01 10:05:00'),
('img-003', 'vehicle-001', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop', 0, 3, '2024-02-01 10:05:00'),

-- Toyota Vios images
('img-004', 'vehicle-002', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop', 1, 1, '2024-02-15 14:35:00'),
('img-005', 'vehicle-002', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop', 0, 2, '2024-02-15 14:35:00'),

-- Honda Air Blade images
('img-006', 'vehicle-003', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop', 1, 1, '2024-03-01 09:20:00'),
('img-007', 'vehicle-003', 'https://images.unsplash.com/photo-1558980394-0a37b3636608?w=800&auto=format&fit=crop', 0, 2, '2024-03-01 09:20:00'),

-- Mercedes C200 images
('img-008', 'vehicle-004', 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&auto=format&fit=crop', 1, 1, '2024-02-20 11:50:00'),
('img-009', 'vehicle-004', 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800&auto=format&fit=crop', 0, 2, '2024-02-20 11:50:00'),
('img-010', 'vehicle-004', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop', 0, 3, '2024-02-20 11:50:00'),

-- BMW X3 images
('img-011', 'vehicle-005', 'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&auto=format&fit=crop', 1, 1, '2024-03-10 16:25:00'),
('img-012', 'vehicle-005', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop', 0, 2, '2024-03-10 16:25:00');

-- ====== VEHICLE FEATURES ======
INSERT INTO vehicle_features (id, vehicle_id, feature) VALUES
-- Honda City features
('feat-001', 'vehicle-001', 'Điều hòa tự động'),
('feat-002', 'vehicle-001', 'Camera lùi'),
('feat-003', 'vehicle-001', 'Bluetooth'),
('feat-004', 'vehicle-001', 'USB/AUX'),
('feat-005', 'vehicle-001', 'Cảm biến áp suất lốp'),

-- Toyota Vios features
('feat-006', 'vehicle-002', 'Điều hòa tự động'),
('feat-007', 'vehicle-002', 'Camera 360 độ'),
('feat-008', 'vehicle-002', 'Bluetooth'),
('feat-009', 'vehicle-002', 'Cảm biến va chạm'),
('feat-010', 'vehicle-002', 'Khởi động bằng nút bấm'),

-- Honda Air Blade features
('feat-011', 'vehicle-003', 'Phanh ABS'),
('feat-012', 'vehicle-003', 'Khóa thông minh'),
('feat-013', 'vehicle-003', 'Đèn LED'),
('feat-014', 'vehicle-003', 'Cốp xe rộng'),

-- Mercedes C200 features
('feat-015', 'vehicle-004', 'Nội thất da cao cấp'),
('feat-016', 'vehicle-004', 'Hệ thống âm thanh Burmester'),
('feat-017', 'vehicle-004', 'Điều hòa tự động 2 vùng'),
('feat-018', 'vehicle-004', 'Cửa sổ trời'),
('feat-019', 'vehicle-004', 'Hệ thống an toàn Mercedes me'),
('feat-020', 'vehicle-004', 'Ghế chỉnh điện'),

-- BMW X3 features
('feat-021', 'vehicle-005', 'Hệ thống iDrive'),
('feat-022', 'vehicle-005', 'Dẫn động 4 bánh xDrive'),
('feat-023', 'vehicle-005', 'Hệ thống âm thanh Harman Kardon'),
('feat-024', 'vehicle-005', 'Cửa sổ trời toàn cảnh'),
('feat-025', 'vehicle-005', 'Hỗ trợ đỗ xe tự động');