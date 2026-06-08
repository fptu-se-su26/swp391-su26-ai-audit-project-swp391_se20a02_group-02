-- ============================================================
-- IMPORT LUXEWAY SAMPLE DATA TO SQL SERVER
-- ============================================================
-- Run this script in SQL Server Management Studio
-- Database: car_rental_platform

USE car_rental_platform;
GO

-- Check if tables exist
IF OBJECT_ID('users', 'U') IS NULL
BEGIN
    PRINT 'ERROR: Tables not found! Please run the backend first to create tables.'
    RETURN
END

-- Clear existing data
DELETE FROM vehicle_features;
DELETE FROM vehicle_images;
DELETE FROM vehicles;
DELETE FROM users;

-- Insert Users
INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, avatar, phone, role, verified, kyc_verified, driving_license_verified, rating, total_reviews, total_rentals, bio, location, account_type, company_name, stripe_customer_id, is_active, joined_at, last_active, created_at, updated_at) VALUES
('A1B2C3D4-E5F6-7890-ABCD-123456789012', 'admin@luxeway.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Admin', N'LuxeWay', N'Admin LuxeWay', 'https://ui-avatars.com/api/?name=Admin+LuxeWay&background=0F172A&color=fff&size=200', '0901234567', 'ADMIN', 1, 1, 1, 5.00, 0, 0, N'LuxeWay Platform Administrator', N'Hồ Chí Minh', 'INDIVIDUAL', NULL, NULL, 1, '2024-01-01 00:00:00', '2024-05-23 10:00:00', '2024-01-01 00:00:00', '2024-05-23 10:00:00'),
('B2C3D4E5-F6G7-8901-BCDE-234567890123', 'nguyen.van.a@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Nguyễn', N'Văn A', N'Nguyễn Văn A', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', '0901111111', 'CUSTOMER', 1, 1, 1, 4.80, 15, 8, N'Yêu thích du lịch và khám phá những địa điểm mới', N'Hà Nội', 'INDIVIDUAL', NULL, NULL, 1, '2024-02-15 08:30:00', '2024-05-23 09:45:00', '2024-02-15 08:30:00', '2024-05-23 09:45:00'),
('E5F6G7H8-I9J0-1234-EFGH-567890123456', 'pham.minh.d@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Phạm', N'Minh D', N'Phạm Minh D', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', '0904444444', 'OWNER', 1, 1, 1, 4.95, 45, 0, N'Chủ sở hữu 3 chiếc xe, cam kết chất lượng dịch vụ tốt nhất', N'Hà Nội', 'INDIVIDUAL', NULL, NULL, 1, '2024-01-20 09:15:00', '2024-05-23 07:20:00', '2024-01-20 09:15:00', '2024-05-23 07:20:00');
/
-- Insert Vehicles
INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, description, thumbnail_url, price_per_day, price_per_week, deposit, city, country, address, latitude, longitude, horsepower, top_speed, acceleration, seats, doors, transmission, fuel_type, range_km, engine_size, color, license_plate, min_rental_days, max_rental_days, advance_booking_days, status, rating, total_reviews, total_bookings, is_verified, is_featured, instant_book, delivery_available, delivery_fee, created_at, updated_at) VALUES
('V1A2B3C4-D5E6-7890-VHCL-111111111111', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Honda City 2023 - Xe Đẹp Như Mới', 'Honda', 'City', 2023, 'ECONOMY', N'Honda City 2023 màu trắng, nội thất đen sang trọng. Xe được bảo dưỡng định kỳ, sạch sẽ, tiết kiệm nhiên liệu.', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop', 800000.00, 5200000.00, 3000000.00, N'Hà Nội', N'Vietnam', N'123 Đường Láng, Đống Đa, Hà Nội', 21.0285, 105.8542, 120, 180, 11.5, 5, 4, 'AUTOMATIC', 'GASOLINE', 600, '1.5L', N'Trắng', '30A-12345', 1, 15, 365, 'AVAILABLE', 4.80, 25, 18, 1, 0, 1, 1, 50000.00, '2024-02-01 10:00:00', '2024-05-23 08:00:00'),
('V2B3C4D5-E6F7-8901-VHCL-222222222222', 'E5F6G7H8-I9J0-1234-EFGH-567890123456', N'Toyota Vios 2022 - Tiết Kiệm Nhiên Liệu', 'Toyota', 'Vios', 2022, 'ECONOMY', N'Toyota Vios 2022 màu bạc, số tự động, máy lạnh mát, âm thanh tốt.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop', 750000.00, 4900000.00, 2800000.00, N'Hà Nội', N'Vietnam', N'456 Phố Huế, Hai Bà Trưng, Hà Nội', 21.0245, 105.8525, 107, 175, 12.3, 5, 4, 'AUTOMATIC', 'GASOLINE', 650, '1.5L', N'Bạc', '30B-67890', 1, 20, 365, 'AVAILABLE', 4.90, 31, 22, 1, 1, 1, 1, 50000.00, '2024-02-15 14:30:00', '2024-05-22 19:45:00');

-- Insert Vehicle Images
INSERT INTO vehicle_images (id, vehicle_id, url, is_primary, sort_order, created_at) VALUES
('IMG1A2B3-C4D5-6789-IMGS-111111111111', 'V1A2B3C4-D5E6-7890-VHCL-111111111111', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop', 1, 1, '2024-02-01 10:05:00'),
('IMG4D5E6-F7G8-9012-IMGS-444444444444', 'V2B3C4D5-E6F7-8901-VHCL-222222222222', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop', 1, 1, '2024-02-15 14:35:00');

-- Insert Vehicle Features
INSERT INTO vehicle_features (id, vehicle_id, feature) VALUES
('FEAT1A2B-3C4D-5678-FEAT-111111111111', 'V1A2B3C4-D5E6-7890-VHCL-111111111111', N'Điều hòa tự động'),
('FEAT2B3C-4D5E-6789-FEAT-222222222222', 'V1A2B3C4-D5E6-7890-VHCL-111111111111', N'Camera lùi'),
('FEAT3C4D-5E6F-7890-FEAT-333333333333', 'V1A2B3C4-D5E6-7890-VHCL-111111111111', N'Bluetooth'),
('FEAT6F7G-8H9I-0123-FEAT-666666666666', 'V2B3C4D5-E6F7-8901-VHCL-222222222222', N'Điều hòa tự động'),
('FEAT7G8H-9I0J-1234-FEAT-777777777777', 'V2B3C4D5-E6F7-8901-VHCL-222222222222', N'Camera 360 độ');

PRINT '✅ Sample data imported successfully!';
PRINT '';
PRINT 'Test Accounts:';
PRINT 'Admin: admin@luxeway.vn / password';
PRINT 'Customer: nguyen.van.a@gmail.com / password';
PRINT 'Owner: pham.minh.d@gmail.com / password';
GO