USE car_rental_platform;
GO

UPDATE vehicles SET price_per_day = 5000 WHERE name = 'Honda SH 150i ABS';

UPDATE vehicles SET city = 'Hanoi' WHERE city = N'Hà Nội';
UPDATE vehicles SET city = 'Ho Chi Minh City' WHERE city = N'TP. Hồ Chí Minh';
UPDATE vehicles SET city = 'Da Nang' WHERE city = N'Đà Nẵng';

UPDATE vehicles SET address = 'Downtown Hanoi' WHERE address = N'Trung tâm Hà Nội';
UPDATE vehicles SET address = 'District 1, HCMC' WHERE address = N'Quận 1, TP.HCM';
UPDATE vehicles SET address = 'District 3, HCMC' WHERE address = N'Quận 3, TP.HCM';
UPDATE vehicles SET address = 'District 7, HCMC' WHERE address = N'Quận 7, TP.HCM';
UPDATE vehicles SET address = 'Tan Binh, HCMC' WHERE address = N'Tân Bình, TP.HCM';
UPDATE vehicles SET address = 'Landmark 81, HCMC' WHERE address = N'Landmark 81, TP.HCM';
UPDATE vehicles SET address = 'Hanoi' WHERE address = N'Hà Nội';
UPDATE vehicles SET address = 'Da Nang' WHERE address = N'Đà Nẵng';
UPDATE vehicles SET address = 'Da Nang Airport' WHERE address = N'Sân bay Đà Nẵng';
UPDATE vehicles SET address = 'Cau Giay, Hanoi' WHERE address = N'Cầu Giấy, Hà Nội';
UPDATE vehicles SET address = 'My Dinh, Hanoi' WHERE address = N'Mỹ Đình, Hà Nội';
UPDATE vehicles SET address = 'Ocean Park, Hanoi' WHERE address = N'Ocean Park, Hà Nội';
UPDATE vehicles SET address = 'Hai Chau, Da Nang' WHERE address = N'Hải Châu, Đà Nẵng';
UPDATE vehicles SET address = 'Tay Ho, Hanoi' WHERE address = N'Tây Hồ, Hà Nội';

UPDATE vehicles SET description = 'Premium BMW 320i Sport 2024. Sporty design, ultimate driving experience, and luxurious interior.' WHERE license_plate = '30K-12345';
UPDATE vehicles SET description = 'Luxury sedan BMW 520i M-Sport with advanced technology. Perfect for business trips or client meetings.' WHERE license_plate = '51K-55555';
UPDATE vehicles SET description = 'Premium mid-size SUV BMW X5. Spacious, powerful, and absolutely safe for the family.' WHERE license_plate = '30K-88888';
UPDATE vehicles SET description = 'Executive car Toyota Camry 2.5Q. Smooth ride, highly durable, and very fuel efficient.' WHERE license_plate = '51K-99999';
UPDATE vehicles SET description = 'Honda CR-V L trim. Spacious interior, advanced Honda Sensing safety technology.' WHERE license_plate = '43A-12345';
UPDATE vehicles SET description = 'Hyundai Santa Fe Premium Diesel. Powerful, fuel-efficient, perfect for outdoor trips.' WHERE license_plate = '30K-56789';
UPDATE vehicles SET description = 'Futuristic design, tech-filled interior. 100% brand new, deep cleaned.' WHERE license_plate = '51K-11111';
UPDATE vehicles SET description = 'Mazda CX-5 Premium 2024. Exciting driving experience, elegant Kodo design.' WHERE license_plate = '43A-66666';
UPDATE vehicles SET description = 'The king of family MPVs. Most spacious in segment, absolute soundproofing.' WHERE license_plate = '51K-77777';
UPDATE vehicles SET description = 'Ford Everest Titanium+ 4x4. Impressive offroad capabilities, luxury amenities.' WHERE license_plate = '30K-99999';
UPDATE vehicles SET description = 'Luxury sports SUV. Pure class right from the first glance.' WHERE license_plate = '51K-68686';
UPDATE vehicles SET description = 'Smart electric SUV VinFast VF8 Plus. Global EV experience, ultra smooth acceleration.' WHERE license_plate = '30K-33333';
UPDATE vehicles SET description = 'Premium scooter Honda SH 150i ABS. Luxurious and powerful performance.' WHERE license_plate = '43A-11111';
UPDATE vehicles SET description = 'Sporty Yamaha NVX 155. Ultimate speed experience.' WHERE license_plate = '51K-22222';
UPDATE vehicles SET description = 'KTM Duke 390 warrior machine. Super lightweight, powerful, easy to handle.' WHERE license_plate = '30K-44444';
GO
