USE car_rental_platform;
GO

UPDATE vehicles SET price_per_day = 5000 WHERE name = 'Honda SH 150i ABS';

UPDATE vehicles SET city = 'Hanoi', address = 'Downtown Hanoi' WHERE license_plate = '30K-12345';
UPDATE vehicles SET city = 'Ho Chi Minh City', address = 'District 1, HCMC' WHERE license_plate = '51K-55555';
UPDATE vehicles SET city = 'Hanoi', address = 'Hanoi' WHERE license_plate = '30K-88888';
UPDATE vehicles SET city = 'Ho Chi Minh City', address = 'District 3, HCMC' WHERE license_plate = '51K-99999';
UPDATE vehicles SET city = 'Da Nang', address = 'Da Nang Airport' WHERE license_plate = '43A-12345';
UPDATE vehicles SET city = 'Hanoi', address = 'Cau Giay, Hanoi' WHERE license_plate = '30K-56789';
UPDATE vehicles SET city = 'Ho Chi Minh City', address = 'Tan Binh, HCMC' WHERE license_plate = '51K-11111';
UPDATE vehicles SET city = 'Da Nang', address = 'Da Nang' WHERE license_plate = '43A-66666';
UPDATE vehicles SET city = 'Ho Chi Minh City', address = 'District 7, HCMC' WHERE license_plate = '51K-77777';
UPDATE vehicles SET city = 'Hanoi', address = 'My Dinh, Hanoi' WHERE license_plate = '30K-99999';
UPDATE vehicles SET city = 'Ho Chi Minh City', address = 'Landmark 81, HCMC' WHERE license_plate = '51K-68686';
UPDATE vehicles SET city = 'Hanoi', address = 'Ocean Park, Hanoi' WHERE license_plate = '30K-33333';
UPDATE vehicles SET city = 'Da Nang', address = 'Hai Chau, Da Nang' WHERE license_plate = '43A-11111';
UPDATE vehicles SET city = 'Ho Chi Minh City', address = 'District 1, HCMC' WHERE license_plate = '51K-22222';
UPDATE vehicles SET city = 'Hanoi', address = 'Tay Ho, Hanoi' WHERE license_plate = '30K-44444';
GO
