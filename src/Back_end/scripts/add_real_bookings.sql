SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
USE car_rental_platform;

-- Insert bookings if they do not exist
IF NOT EXISTS (SELECT 1 FROM bookings WHERE id = 'b1-id-completed-vios')
BEGIN
    INSERT INTO bookings (id, renter_id, owner_id, vehicle_id, status, start_date, end_date, price_per_day, total_days, base_price, deposit, deposit_refunded, service_fee, total, cleaning_fee, include_delivery, include_insurance, taxes, booking_code, created_at, updated_at, version)
    VALUES ('b1-id-completed-vios', 'customer-user-id-002', 'owner-user-id-003', '034641b6-ba72-45d2-aea1-92e6b265344a', 'COMPLETED', '2026-06-10 09:00:00', '2026-06-13 18:00:00', 500000.00, 3, 1500000.00, 2000000.00, 1, 100000.00, 1600000.00, 0.00, 0, 0, 0.00, 'BK-VIOS-001', '2026-06-08 10:00:00', '2026-06-13 18:00:00', 1);
END;

IF NOT EXISTS (SELECT 1 FROM bookings WHERE id = 'b2-id-completed-sh')
BEGIN
    INSERT INTO bookings (id, renter_id, owner_id, vehicle_id, status, start_date, end_date, price_per_day, total_days, base_price, deposit, deposit_refunded, service_fee, total, cleaning_fee, include_delivery, include_insurance, taxes, booking_code, created_at, updated_at, version)
    VALUES ('b2-id-completed-sh', 'customer-user-id-002', 'owner-user-id-003', '08C4D029-45A3-4E38-991A-ACE331C961D8', 'COMPLETED', '2026-06-20 08:00:00', '2026-06-22 17:00:00', 350000.00, 2, 700000.00, 1000000.00, 1, 50000.00, 750000.00, 0.00, 0, 0, 0.00, 'BK-SH-002', '2026-06-19 14:00:00', '2026-06-22 17:00:00', 1);
END;

IF NOT EXISTS (SELECT 1 FROM bookings WHERE id = 'b3-id-confirmed-ktm')
BEGIN
    INSERT INTO bookings (id, renter_id, owner_id, vehicle_id, status, start_date, end_date, price_per_day, total_days, base_price, deposit, deposit_refunded, service_fee, total, cleaning_fee, include_delivery, include_insurance, taxes, booking_code, created_at, updated_at, version)
    VALUES ('b3-id-confirmed-ktm', 'customer-user-id-002', 'owner-user-id-003', '053E187B-6994-4728-A346-3BE8E3E4F30F', 'CONFIRMED', '2026-07-14 09:00:00', '2026-07-18 17:00:00', 950000.00, 4, 3800000.00, 3000000.00, 0, 150000.00, 3950000.00, 0.00, 0, 0, 0.00, 'BK-KTM-003', '2026-07-10 09:00:00', '2026-07-12 11:00:00', 1);
END;

IF NOT EXISTS (SELECT 1 FROM bookings WHERE id = 'b4-id-pending-grande')
BEGIN
    INSERT INTO bookings (id, renter_id, owner_id, vehicle_id, status, start_date, end_date, price_per_day, total_days, base_price, deposit, deposit_refunded, service_fee, total, cleaning_fee, include_delivery, include_insurance, taxes, booking_code, created_at, updated_at, version)
    VALUES ('b4-id-pending-grande', 'customer-user-id-002', 'owner-user-id-003', '082E2DAE-468A-4C84-A6BC-5646D6E212BE', 'PENDING', '2026-07-20 09:00:00', '2026-07-21 17:00:00', 160000.00, 1, 160000.00, 500000.00, 0, 20000.00, 180000.00, 0.00, 0, 0, 0.00, 'BK-YAM-004', '2026-07-12 18:00:00', '2026-07-12 18:00:00', 1);
END;


-- Insert payments
IF NOT EXISTS (SELECT 1 FROM payments WHERE id = 'pay-vios-001')
BEGIN
    INSERT INTO payments (id, amount, created_at, method, status, booking_id, user_id, currency, description, transaction_id)
    VALUES ('pay-vios-001', 1600000.00, '2026-06-08 10:05:00', 'vnpay', 'SUCCEEDED', 'b1-id-completed-vios', 'customer-user-id-002', 'VND', 'Payment for booking BK-VIOS-001', 'TX-VIOS-001');
END;

IF NOT EXISTS (SELECT 1 FROM payments WHERE id = 'pay-sh-002')
BEGIN
    INSERT INTO payments (id, amount, created_at, method, status, booking_id, user_id, currency, description, transaction_id)
    VALUES ('pay-sh-002', 750000.00, '2026-06-19 14:05:00', 'wallet', 'SUCCEEDED', 'b2-id-completed-sh', 'customer-user-id-002', 'VND', 'Payment for booking BK-SH-002', 'TX-SH-002');
END;

IF NOT EXISTS (SELECT 1 FROM payments WHERE id = 'pay-ktm-003')
BEGIN
    INSERT INTO payments (id, amount, created_at, method, status, booking_id, user_id, currency, description, transaction_id)
    VALUES ('pay-ktm-003', 3950000.00, '2026-07-10 09:05:00', 'stripe', 'SUCCEEDED', 'b3-id-confirmed-ktm', 'customer-user-id-002', 'VND', 'Payment for booking BK-KTM-003', 'TX-KTM-003');
END;


-- Insert reviews
IF NOT EXISTS (SELECT 1 FROM reviews WHERE id = 'rev-vios-001')
BEGIN
    INSERT INTO reviews (id, accuracy, cleanliness, comment, communication, created_at, helpful, rating, updated_at, value_rating, booking_id, owner_id, reviewer_id, vehicle_id)
    VALUES ('rev-vios-001', 5, 5, N'Xe đi rất mượt, tiết kiệm nhiên liệu, chủ xe nhiệt tình!', 5, '2026-06-13 19:00:00', 0, 5, '2026-06-13 19:00:00', 5, 'b1-id-completed-vios', 'owner-user-id-003', 'customer-user-id-002', '034641b6-ba72-45d2-aea1-92e6b265344a');
END;

IF NOT EXISTS (SELECT 1 FROM reviews WHERE id = 'rev-sh-002')
BEGIN
    INSERT INTO reviews (id, accuracy, cleanliness, comment, communication, created_at, helpful, rating, updated_at, value_rating, booking_id, owner_id, reviewer_id, vehicle_id)
    VALUES ('rev-sh-002', 5, 4, N'Xe Honda SH chạy rất êm, giao xe đúng giờ.', 5, '2026-06-22 18:00:00', 0, 4, '2026-06-22 18:00:00', 4, 'b2-id-completed-sh', 'owner-user-id-003', 'customer-user-id-002', '08C4D029-45A3-4E38-991A-ACE331C961D8');
END;
