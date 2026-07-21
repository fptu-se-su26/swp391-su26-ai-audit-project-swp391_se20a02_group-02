USE car_rental_platform;
GO

DECLARE @RealPlates TABLE (license_plate NVARCHAR(50));
INSERT INTO @RealPlates VALUES 
('30K-12345'), ('51K-55555'), ('30K-88888'), ('51K-99999'), ('43A-12345'),
('30K-56789'), ('51K-11111'), ('43A-66666'), ('51K-77777'), ('30K-99999'),
('51K-68686'), ('30K-33333'), ('43A-11111'), ('51K-22222'), ('30K-44444');

-- Find all vehicle IDs to delete
SELECT id INTO #VehiclesToDelete FROM vehicles WHERE license_plate NOT IN (SELECT license_plate FROM @RealPlates);

-- Delete child records
DELETE FROM booking_status_history WHERE booking_id IN (SELECT id FROM bookings WHERE vehicle_id IN (SELECT id FROM #VehiclesToDelete));
DELETE FROM digital_contracts WHERE booking_id IN (SELECT id FROM bookings WHERE vehicle_id IN (SELECT id FROM #VehiclesToDelete));
DELETE FROM payments WHERE booking_id IN (SELECT id FROM bookings WHERE vehicle_id IN (SELECT id FROM #VehiclesToDelete));
DELETE FROM invoices WHERE booking_id IN (SELECT id FROM bookings WHERE vehicle_id IN (SELECT id FROM #VehiclesToDelete));
DELETE FROM support_tickets WHERE booking_id IN (SELECT id FROM bookings WHERE vehicle_id IN (SELECT id FROM #VehiclesToDelete));
DELETE FROM disputes WHERE booking_id IN (SELECT id FROM bookings WHERE vehicle_id IN (SELECT id FROM #VehiclesToDelete));
DELETE FROM bookings WHERE vehicle_id IN (SELECT id FROM #VehiclesToDelete);

DELETE FROM vehicle_features WHERE vehicle_id IN (SELECT id FROM #VehiclesToDelete);
DELETE FROM vehicle_images WHERE vehicle_id IN (SELECT id FROM #VehiclesToDelete);
DELETE FROM vehicle_availability WHERE vehicle_id IN (SELECT id FROM #VehiclesToDelete);
DELETE FROM reviews WHERE vehicle_id IN (SELECT id FROM #VehiclesToDelete);
DELETE FROM audit_logs WHERE target_id IN (SELECT id FROM #VehiclesToDelete);

-- Delete the mock vehicles
DELETE FROM vehicles WHERE id IN (SELECT id FROM #VehiclesToDelete);

DROP TABLE #VehiclesToDelete;
GO
