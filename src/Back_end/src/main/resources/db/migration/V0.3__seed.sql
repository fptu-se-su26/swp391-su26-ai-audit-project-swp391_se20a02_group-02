-- ===========================================================
-- LUXEWAY VEHICLE SEED SCRIPT (GENERATED VIA SCRAPER PIPELINE)
-- Generated at: 2026-06-18 14:04:30
-- Database: SQL Server
-- ===========================================================


IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='raw_vehicle_data' and xtype='U')
BEGIN
    CREATE TABLE raw_vehicle_data (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        source VARCHAR(50),
        scrape_date DATETIME DEFAULT GETDATE(),
        original_price DECIMAL(18,2),
        vehicle_name NVARCHAR(255),
        location NVARCHAR(255),
        raw_json NVARCHAR(MAX)
    )
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'Kia')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'Kia', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'Morning MT' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Kia'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Kia'), 'Morning MT', 'CAR', 'ECONOMY', 500000, 500000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00001')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00001'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Kia Morning MT', 'Kia', 'Morning MT', 2023, 'ECONOMY', 500000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00001', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 500000, 'Kia Morning MT', 'Da Nang', '{"source": "MIOTO", "name": "Kia Morning MT", "brand": "Kia", "model": "Morning MT", "year": "2023", "original_price": "500000₫", "location": "Da Nang", "image_url": "./Cho thuê ô tô_files/1689218176455_kia morning.jpeg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 500000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'Kia')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'Kia', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'Forte 1.6' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Kia'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Kia'), 'Forte 1.6', 'CAR', 'ECONOMY', 700000, 700000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00002')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 700000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00002'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Kia Forte 1.6 MT', 'Kia', 'Forte 1.6', 2023, 'ECONOMY', 700000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00002', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Kia Forte 1.6 MT', 'Tp. Da Nang', '{"source": "MIOTO", "name": "Kia Forte 1.6 MT", "brand": "Kia", "model": "Forte 1.6", "year": "2023", "original_price": "700000₫", "location": "Tp. Da Nang", "image_url": "./Cho thuê ô tô_files/default-image.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'Honda')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'Honda', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'Civic MT' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Honda'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Honda'), 'Civic MT', 'CAR', 'ECONOMY', 700000, 700000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00003')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 700000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00003'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Honda Civic MT', 'Honda', 'Civic MT', 2023, 'ECONOMY', 700000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00003', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Honda Civic MT', 'Tp. Da Nang', '{"source": "MIOTO", "name": "Honda Civic MT", "brand": "Honda", "model": "Civic MT", "year": "2023", "original_price": "700000₫", "location": "Tp. Da Nang", "image_url": "./Cho thuê ô tô_files/1689309307704_honda civic.jpeg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'Hyundai')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'Hyundai', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'Grand i10' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Hyundai'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Hyundai'), 'Grand i10', 'CAR', 'ECONOMY', 700000, 700000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00004')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 700000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00004'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Hyundai Grand i10 Hatchback 1.0 AT', 'Hyundai', 'Grand i10', 2023, 'ECONOMY', 700000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00004', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Hyundai Grand i10 Hatchback 1.0 AT', 'Tp. Da Nang', '{"source": "MIOTO", "name": "Hyundai Grand i10 Hatchback 1.0 AT", "brand": "Hyundai", "model": "Grand i10", "year": "2023", "original_price": "700000₫", "location": "Tp. Da Nang", "image_url": "./Cho thuê ô tô_files/1689143255811_hyundai i10.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'Nissan')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'Nissan', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'Sunny XL' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Nissan'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Nissan'), 'Sunny XL', 'CAR', 'ECONOMY', 700000, 700000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00005')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 700000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00005'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Nissan Sunny XL', 'Nissan', 'Sunny XL', 2023, 'ECONOMY', 700000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00005', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Nissan Sunny XL', 'Tp. Da Nang', '{"source": "MIOTO", "name": "Nissan Sunny XL", "brand": "Nissan", "model": "Sunny XL", "year": "2023", "original_price": "700000₫", "location": "Tp. Da Nang", "image_url": "./Cho thuê ô tô_files/1689318398716_nissan sunny.png", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'Toyota')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'Toyota', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'Vios MT' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Toyota'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Toyota'), 'Vios MT', 'CAR', 'ECONOMY', 700000, 700000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00006')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 700000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00006'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Toyota Vios MT', 'Toyota', 'Vios MT', 2023, 'ECONOMY', 700000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00006', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Toyota Vios MT', 'Tp. Da Nang', '{"source": "MIOTO", "name": "Toyota Vios MT", "brand": "Toyota", "model": "Vios MT", "year": "2023", "original_price": "700000₫", "location": "Tp. Da Nang", "image_url": "./Cho thuê ô tô_files/1689132278841_Vios MT.png", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'Hyundai')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'Hyundai', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'Avante AT' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Hyundai'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Hyundai'), 'Avante AT', 'CAR', 'ECONOMY', 700000, 700000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00007')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 700000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00007'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Hyundai Avante AT', 'Hyundai', 'Avante AT', 2023, 'ECONOMY', 700000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00007', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Hyundai Avante AT', 'Tp. Da Nang', '{"source": "MIOTO", "name": "Hyundai Avante AT", "brand": "Hyundai", "model": "Avante AT", "year": "2023", "original_price": "700000₫", "location": "Tp. Da Nang", "image_url": "./Cho thuê ô tô_files/1689134881883_hyundai avante.jpeg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'Geely')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'Geely', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'Coolray Coolray' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Geely'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Geely'), 'Coolray Coolray', 'CAR', 'ECONOMY', 730000, 730000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00008')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 730000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00008'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Geely Coolray Coolray Flagship', 'Geely', 'Coolray Coolray', 2023, 'ECONOMY', 730000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00008', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 730000, 'Geely Coolray Coolray Flagship', 'Da Nang', '{"source": "MIOTO", "name": "Geely Coolray Coolray Flagship", "brand": "Geely", "model": "Coolray Coolray", "year": "2023", "original_price": "730000₫", "location": "Da Nang", "image_url": "./Cho thuê ô tô_files/1762309920454_geely-coolray-250303-c05.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 730000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'Toyota')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'Toyota', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'Vios AT' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Toyota'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'Toyota'), 'Vios AT', 'CAR', 'ECONOMY', 800000, 800000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00009')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 800000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00009'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Toyota Vios AT', 'Toyota', 'Vios AT', 2023, 'ECONOMY', 800000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00009', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 800000, 'Toyota Vios AT', 'Tp. Da Nang', '{"source": "MIOTO", "name": "Toyota Vios AT", "brand": "Toyota", "model": "Vios AT", "year": "2023", "original_price": "800000₫", "location": "Tp. Da Nang", "image_url": "./Cho thuê ô tô_files/1689132331746_Vios MT.png", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 800000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF3 2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF3 2025', 'CAR', 'ECONOMY', 6070005, 6070005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00010')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6070005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00010'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF3 2025', 'VINFAST', 'VF3 2025', 2023, 'ECONOMY', 6070005, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00010', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6070005, 'VINFAST VF3 2025', 'Phường Phước Ninh, Quận Hải Châu', '{"source": "MIOTO", "name": "VINFAST VF3 2025", "brand": "VINFAST", "model": "VF3 2025", "year": "2025", "original_price": "607000554000", "location": "Phường Phước Ninh, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/srRQ5_ML1PyFFCAhbgwReg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 607000554000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF3 2026' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF3 2026', 'CAR', 'ECONOMY', 6600006, 6600006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00011')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6600006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00011'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF3 2026', 'VINFAST', 'VF3 2026', 2023, 'ECONOMY', 6600006, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00011', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6600006, 'VINFAST VF3 2026', 'Phường Thanh Bình, Quận Hải Châu', '{"source": "MIOTO", "name": "VINFAST VF3 2026", "brand": "VINFAST", "model": "VF3 2026", "year": "2026", "original_price": "660000603000", "location": "Phường Thanh Bình, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/mqe8LZI4sh0r3_v-K5UUBw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 660000603000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ERTIGA 2021' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'ERTIGA 2021', 'CAR', 'ECONOMY', 7580006, 7580006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00012')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7580006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00012'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI ERTIGA 2021', 'SUZUKI', 'ERTIGA 2021', 2023, 'ECONOMY', 7580006, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00012', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7580006, 'SUZUKI ERTIGA 2021', 'Phường Nại Hiên Đông, Quận Sơn Trà', '{"source": "MIOTO", "name": "SUZUKI ERTIGA 2021", "brand": "SUZUKI", "model": "ERTIGA 2021", "year": "2021", "original_price": "758000638000", "location": "Phường Nại Hiên Đông, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/ADHzL4M3Hc6jZ3OIQ0IPUA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 758000638000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF5 2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF5 2025', 'CAR', 'ECONOMY', 8840008, 8840008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00013')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8840008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00013'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF5 2025', 'VINFAST', 'VF5 2025', 2023, 'ECONOMY', 8840008, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00013', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8840008, 'VINFAST VF5 2025', 'Phường Nam Dương, Quận Hải Châu', '{"source": "MIOTO", "name": "VINFAST VF5 2025", "brand": "VINFAST", "model": "VF5 2025", "year": "2025", "original_price": "884000807000", "location": "Phường Nam Dương, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/HjskVJnF3Rg8rbH-YgLf4g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 884000807000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'INNOVA 2018' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'INNOVA 2018', 'CAR', 'ECONOMY', 8610007, 8610007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00014')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8610007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00014'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA INNOVA 2018', 'TOYOTA', 'INNOVA 2018', 2023, 'ECONOMY', 8610007, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00014', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8610007, 'TOYOTA INNOVA 2018', 'Phường An Hải Bắc, Quận Sơn Trà', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2018", "brand": "TOYOTA", "model": "INNOVA 2018", "year": "2018", "original_price": "861000741000", "location": "Phường An Hải Bắc, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/sJK7kaL0wQHJy5zfx067iA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 861000741000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'NISSAN')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'NISSAN', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SUNNY 2017' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'NISSAN'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'NISSAN'), 'SUNNY 2017', 'CAR', 'ECONOMY', 6310005, 6310005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00015')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6310005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00015'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'NISSAN SUNNY 2017', 'NISSAN', 'SUNNY 2017', 2023, 'ECONOMY', 6310005, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00015', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6310005, 'NISSAN SUNNY 2017', 'Phường An Hải Bắc, Quận Sơn Trà', '{"source": "MIOTO", "name": "NISSAN SUNNY 2017", "brand": "NISSAN", "model": "SUNNY 2017", "year": "2017", "original_price": "631000531000", "location": "Phường An Hải Bắc, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/zJgCPGXHEwXyZN_L6QbdZw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 631000531000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'INNOVA CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'INNOVA CROSS', 'CAR', 'ECONOMY', 1297000, 1297000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00016')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1297000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00016'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA INNOVA CROSS  2025', 'TOYOTA', 'INNOVA CROSS', 2023, 'ECONOMY', 1297000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00016', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1297000, 'TOYOTA INNOVA CROSS  2025', 'Phường Phước Ninh, Quận Hải Châu', '{"source": "MIOTO", "name": "TOYOTA INNOVA CROSS  2025", "brand": "TOYOTA", "model": "INNOVA CROSS", "year": "2025", "original_price": "12970001177000", "location": "Phường Phước Ninh, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/RPUtR3oQ5RVrd8uSIw_KSw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12970001177000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'LUX SA' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'LUX SA', 'CAR', 'ECONOMY', 1148000, 1148000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00017')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1148000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00017'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST LUX SA  2021', 'VINFAST', 'LUX SA', 2023, 'ECONOMY', 1148000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00017', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1148000, 'VINFAST LUX SA  2021', 'Phường An Hải Bắc, Quận Sơn Trà', '{"source": "MIOTO", "name": "VINFAST LUX SA  2021", "brand": "VINFAST", "model": "LUX SA", "year": "2021", "original_price": "11480001028000", "location": "Phường An Hải Bắc, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/_YB4Xsk6b6tdRjZNYEdXUA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11480001028000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'K3 PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'K3 PREMIUM', 'CAR', 'ECONOMY', 1034000, 1034000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00018')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1034000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00018'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA K3 PREMIUM 2022', 'KIA', 'K3 PREMIUM', 2023, 'ECONOMY', 1034000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00018', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1034000, 'KIA K3 PREMIUM 2022', 'Phường Tam Thuận, Quận Thanh Khê', '{"source": "MIOTO", "name": "KIA K3 PREMIUM 2022", "brand": "KIA", "model": "K3 PREMIUM", "year": "2022", "original_price": "1034000934000", "location": "Phường Tam Thuận, Quận Thanh Khê", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/2iKSUZm-PaIZTTe0teSoSg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1034000934000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF5 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF5 2024', 'CAR', 'ECONOMY', 8840008, 8840008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00019')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8840008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00019'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF5 2024', 'VINFAST', 'VF5 2024', 2023, 'ECONOMY', 8840008, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00019', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8840008, 'VINFAST VF5 2024', 'Phường Mân Thái, Quận Sơn Trà', '{"source": "MIOTO", "name": "VINFAST VF5 2024", "brand": "VINFAST", "model": "VF5 2024", "year": "2024", "original_price": "884000807000", "location": "Phường Mân Thái, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/LcfJv0GpHnmxMD4VoJetlg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 884000807000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2023' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2023', 'CAR', 'ECONOMY', 1022000, 1022000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00020')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1022000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00020'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2023', 'MITSUBISHI', 'XPANDER 2023', 2023, 'ECONOMY', 1022000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00020', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1022000, 'MITSUBISHI XPANDER 2023', 'Phường Thạch Thang, Quận Hải Châu', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2023", "brand": "MITSUBISHI", "model": "XPANDER 2023", "year": "2023", "original_price": "1022000902000", "location": "Phường Thạch Thang, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/H_T4uEjzI0lyglsa0x-N9Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1022000902000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VIOS 2018' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'VIOS 2018', 'CAR', 'ECONOMY', 8150007, 8150007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00021')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8150007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00021'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA VIOS 2018', 'TOYOTA', 'VIOS 2018', 2023, 'ECONOMY', 8150007, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00021', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8150007, 'TOYOTA VIOS 2018', 'Phường Nại Hiên Đông, Quận Sơn Trà', '{"source": "MIOTO", "name": "TOYOTA VIOS 2018", "brand": "TOYOTA", "model": "VIOS 2018", "year": "2018", "original_price": "815000715000", "location": "Phường Nại Hiên Đông, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/wTBcjcUkwtDKq0TcZ1RL9g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 815000715000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'CHEVROLET')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'CHEVROLET', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SPARK 2012' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'CHEVROLET'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'CHEVROLET'), 'SPARK 2012', 'CAR', 'ECONOMY', 4920004, 4920004, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00022')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 4920004,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00022'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'CHEVROLET SPARK 2012', 'CHEVROLET', 'SPARK 2012', 2023, 'ECONOMY', 4920004, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00022', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 4920004, 'CHEVROLET SPARK 2012', 'Phường Nại Hiên Đông, Quận Sơn Trà', '{"source": "MIOTO", "name": "CHEVROLET SPARK 2012", "brand": "CHEVROLET", "model": "SPARK 2012", "year": "2012", "original_price": "492000412000", "location": "Phường Nại Hiên Đông, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/07NhP7x0GWu90R58DPa2Tg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 492000412000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'STARGAZER 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'STARGAZER 2024', 'CAR', 'ECONOMY', 1135000, 1135000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00023')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1135000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00023'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI STARGAZER 2024', 'HYUNDAI', 'STARGAZER 2024', 2023, 'ECONOMY', 1135000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00023', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1135000, 'HYUNDAI STARGAZER 2024', 'Phường Thanh Bình, Quận Hải Châu', '{"source": "MIOTO", "name": "HYUNDAI STARGAZER 2024", "brand": "HYUNDAI", "model": "STARGAZER 2024", "year": "2024", "original_price": "11350001015000", "location": "Phường Thanh Bình, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/UAHdx90UKx_L6lCZblocHA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11350001015000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '3 Deluxe' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '3 Deluxe', 'CAR', 'ECONOMY', 8720007, 8720007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00024')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8720007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00024'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 3 Deluxe 2017', 'MAZDA', '3 Deluxe', 2023, 'ECONOMY', 8720007, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00024', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8720007, 'MAZDA 3 Deluxe 2017', 'Phường Thạch Thang, Quận Hải Châu', '{"source": "MIOTO", "name": "MAZDA 3 Deluxe 2017", "brand": "MAZDA", "model": "3 Deluxe", "year": "2017", "original_price": "872000772000", "location": "Phường Thạch Thang, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/5oDhv736WGBWvD4DlldnkQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 872000772000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2022', 'CAR', 'ECONOMY', 1099000, 1099000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00025')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1099000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00025'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2022', 'MITSUBISHI', 'XPANDER 2022', 2023, 'ECONOMY', 1099000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00025', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1099000, 'MITSUBISHI XPANDER 2022', 'Phường An Hải Bắc, Quận Sơn Trà', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2022", "brand": "MITSUBISHI", "model": "XPANDER 2022", "year": "2022", "original_price": "1099000979000", "location": "Phường An Hải Bắc, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/pLI3UIb5DrebOuQYcQdAZA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1099000979000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XL7 2023' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'XL7 2023', 'CAR', 'ECONOMY', 1033000, 1033000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00026')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1033000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00026'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI XL7 2023', 'SUZUKI', 'XL7 2023', 2023, 'ECONOMY', 1033000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00026', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000, 'SUZUKI XL7 2023', 'Phường An Hải Bắc, Quận Sơn Trà', '{"source": "MIOTO", "name": "SUZUKI XL7 2023", "brand": "SUZUKI", "model": "XL7 2023", "year": "2023", "original_price": "1033000883000", "location": "Phường An Hải Bắc, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/1Cbo05uYNIjmYa0WzIT46w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000883000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'PAJERO SPORT' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'PAJERO SPORT', 'CAR', 'ECONOMY', 1079000, 1079000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00027')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1079000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00027'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI PAJERO SPORT 2015', 'MITSUBISHI', 'PAJERO SPORT', 2023, 'ECONOMY', 1079000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00027', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1079000, 'MITSUBISHI PAJERO SPORT 2015', 'Phường Thanh Bình, Quận Hải Châu', '{"source": "MIOTO", "name": "MITSUBISHI PAJERO SPORT 2015", "brand": "MITSUBISHI", "model": "PAJERO SPORT", "year": "2015", "original_price": "1079000929000", "location": "Phường Thanh Bình, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/RbpUgRNO-16FxTNmbcoQ5Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1079000929000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CX5 LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), 'CX5 LUXURY', 'CAR', 'ECONOMY', 1435000, 1435000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00028')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1435000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00028'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA CX5 LUXURY 2023', 'MAZDA', 'CX5 LUXURY', 2023, 'ECONOMY', 1435000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00028', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1435000, 'MAZDA CX5 LUXURY 2023', 'Phường Thạc Gián, Quận Thanh Khê', '{"source": "MIOTO", "name": "MAZDA CX5 LUXURY 2023", "brand": "MAZDA", "model": "CX5 LUXURY", "year": "2023", "original_price": "14350001285000", "location": "Phường Thạc Gián, Quận Thanh Khê", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/C2JBzR7BctJ-1DVmmAng5A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 14350001285000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'LIMO GREEN' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'LIMO GREEN', 'CAR', 'ECONOMY', 1389000, 1389000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00029')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1389000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00029'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST LIMO GREEN 2026', 'VINFAST', 'LIMO GREEN', 2023, 'ECONOMY', 1389000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00029', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1389000, 'VINFAST LIMO GREEN 2026', 'Phường Tam Thuận, Quận Thanh Khê', '{"source": "MIOTO", "name": "VINFAST LIMO GREEN 2026", "brand": "VINFAST", "model": "LIMO GREEN", "year": "2026", "original_price": "13890001239000", "location": "Phường Tam Thuận, Quận Thanh Khê", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/HdLB2sqocVP91okMUhCOVg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 13890001239000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER CROSS', 'CAR', 'ECONOMY', 1187000, 1187000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00030')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1187000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00030'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER CROSS 2023', 'MITSUBISHI', 'XPANDER CROSS', 2023, 'ECONOMY', 1187000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00030', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1187000, 'MITSUBISHI XPANDER CROSS 2023', 'Phường Thạch Thang, Quận Hải Châu', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER CROSS 2023", "brand": "MITSUBISHI", "model": "XPANDER CROSS", "year": "2023", "original_price": "11870001067000", "location": "Phường Thạch Thang, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/BhwVqhwUV8OJ8-SW2rBrZA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11870001067000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'CHEVROLET')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'CHEVROLET', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CAPTIVA 2016' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'CHEVROLET'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'CHEVROLET'), 'CAPTIVA 2016', 'CAR', 'ECONOMY', 9960008, 9960008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00031')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9960008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00031'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'CHEVROLET CAPTIVA 2016', 'CHEVROLET', 'CAPTIVA 2016', 2023, 'ECONOMY', 9960008, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00031', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9960008, 'CHEVROLET CAPTIVA 2016', 'Phường An Hải Bắc, Quận Sơn Trà', '{"source": "MIOTO", "name": "CHEVROLET CAPTIVA 2016", "brand": "CHEVROLET", "model": "CAPTIVA 2016", "year": "2016", "original_price": "996000876000", "location": "Phường An Hải Bắc, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/29J1dDm1wLnTNhiao6g2ug.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 996000876000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CERATO 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'CERATO 2019', 'CAR', 'ECONOMY', 9070008, 9070008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00032')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9070008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00032'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CERATO 2019', 'KIA', 'CERATO 2019', 2023, 'ECONOMY', 9070008, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00032', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9070008, 'KIA CERATO 2019', 'Phường Thuận Phước, Quận Hải Châu', '{"source": "MIOTO", "name": "KIA CERATO 2019", "brand": "KIA", "model": "CERATO 2019", "year": "2019", "original_price": "907000807000", "location": "Phường Thuận Phước, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/f5Qvq8N3mnRH6vjpGfJtMw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 907000807000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CARENS 2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'CARENS 2025', 'CAR', 'ECONOMY', 1389000, 1389000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00033')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1389000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00033'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CARENS 2025', 'KIA', 'CARENS 2025', 2023, 'ECONOMY', 1389000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00033', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1389000, 'KIA CARENS 2025', 'Phường Hải Châu  I, Quận Hải Châu', '{"source": "MIOTO", "name": "KIA CARENS 2025", "brand": "KIA", "model": "CARENS 2025", "year": "2025", "original_price": "13890001269000", "location": "Phường Hải Châu  I, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/gEQ3LptfTjiQza9G8qmboA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 13890001269000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SELTOS LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'SELTOS LUXURY', 'CAR', 'ECONOMY', 916000, 916000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00034')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 916000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00034'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA SELTOS LUXURY 2023', 'KIA', 'SELTOS LUXURY', 2023, 'ECONOMY', 916000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00034', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 916000, 'KIA SELTOS LUXURY 2023', 'Phường Thanh Bình, Quận Hải Châu', '{"source": "MIOTO", "name": "KIA SELTOS LUXURY 2023", "brand": "KIA", "model": "SELTOS LUXURY", "year": "2023", "original_price": "916000", "location": "Phường Thanh Bình, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/nCtkcwxHIpbZNU70sj3jpw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 916000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SELTOS DELUXE' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'SELTOS DELUXE', 'CAR', 'ECONOMY', 1149000, 1149000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00035')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1149000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00035'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA SELTOS DELUXE 2023', 'KIA', 'SELTOS DELUXE', 2023, 'ECONOMY', 1149000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00035', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1149000, 'KIA SELTOS DELUXE 2023', 'Phường Thuận Phước, Quận Hải Châu', '{"source": "MIOTO", "name": "KIA SELTOS DELUXE 2023", "brand": "KIA", "model": "SELTOS DELUXE", "year": "2023", "original_price": "1149000", "location": "Phường Thuận Phước, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/iSvKmoTAacfagP810eeJVQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1149000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CX5 LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), 'CX5 LUXURY', 'CAR', 'ECONOMY', 1372000, 1372000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00036')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1372000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00036'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA CX5 LUXURY 2024', 'MAZDA', 'CX5 LUXURY', 2023, 'ECONOMY', 1372000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00036', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1372000, 'MAZDA CX5 LUXURY 2024', 'Phường Thanh Bình, Quận Hải Châu', '{"source": "MIOTO", "name": "MAZDA CX5 LUXURY 2024", "brand": "MAZDA", "model": "CX5 LUXURY", "year": "2024", "original_price": "1372000", "location": "Phường Thanh Bình, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/pzA5qk0sDG3HCb2mobEbaw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1372000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SELTOS PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'SELTOS PREMIUM', 'CAR', 'ECONOMY', 1091000, 1091000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00037')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1091000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00037'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA SELTOS PREMIUM 2020', 'KIA', 'SELTOS PREMIUM', 2023, 'ECONOMY', 1091000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00037', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1091000, 'KIA SELTOS PREMIUM 2020', 'Phường Thanh Bình, Quận Hải Châu', '{"source": "MIOTO", "name": "KIA SELTOS PREMIUM 2020", "brand": "KIA", "model": "SELTOS PREMIUM", "year": "2020", "original_price": "1091000", "location": "Phường Thanh Bình, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/8H4NADdjPlK5XBvpeUyIlQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1091000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'JAECOO')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'JAECOO', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'J7 FLAGSHIP' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'JAECOO'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'JAECOO'), 'J7 FLAGSHIP', 'CAR', 'ECONOMY', 1498000, 1498000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00038')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1498000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00038'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'JAECOO J7 FLAGSHIP 2025', 'JAECOO', 'J7 FLAGSHIP', 2023, 'ECONOMY', 1498000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00038', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1498000, 'JAECOO J7 FLAGSHIP 2025', 'Phường Thanh Bình, Quận Hải Châu', '{"source": "MIOTO", "name": "JAECOO J7 FLAGSHIP 2025", "brand": "JAECOO", "model": "J7 FLAGSHIP", "year": "2025", "original_price": "1498000", "location": "Phường Thanh Bình, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/WZZrS7ky3NSBmgLCuyOHIw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1498000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VELOZ CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'VELOZ CROSS', 'CAR', 'ECONOMY', 1079000, 1079000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00039')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1079000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00039'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA VELOZ CROSS 2024', 'TOYOTA', 'VELOZ CROSS', 2023, 'ECONOMY', 1079000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00039', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1079000, 'TOYOTA VELOZ CROSS 2024', 'Phường Hải Châu II, Quận Hải Châu', '{"source": "MIOTO", "name": "TOYOTA VELOZ CROSS 2024", "brand": "TOYOTA", "model": "VELOZ CROSS", "year": "2024", "original_price": "1079000959000", "location": "Phường Hải Châu II, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/XN90IWHUOoCR6ezSjk8B4Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1079000959000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF3 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF3 2024', 'CAR', 'ECONOMY', 5740005, 5740005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00040')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5740005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00040'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF3 2024', 'VINFAST', 'VF3 2024', 2023, 'ECONOMY', 5740005, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00040', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5740005, 'VINFAST VF3 2024', 'Phường Nại Hiên Đông, Quận Sơn Trà', '{"source": "MIOTO", "name": "VINFAST VF3 2024", "brand": "VINFAST", "model": "VF3 2024", "year": "2024", "original_price": "574000524000", "location": "Phường Nại Hiên Đông, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/rygN5PS4x0Cka6J0vThAZA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 574000524000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '3 LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '3 LUXURY', 'CAR', 'ECONOMY', 1021000, 1021000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00041')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1021000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00041'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 3 LUXURY 2023', 'MAZDA', '3 LUXURY', 2023, 'ECONOMY', 1021000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00041', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1021000, 'MAZDA 3 LUXURY 2023', 'Phường Thuận Phước, Quận Hải Châu', '{"source": "MIOTO", "name": "MAZDA 3 LUXURY 2023", "brand": "MAZDA", "model": "3 LUXURY", "year": "2023", "original_price": "1021000921000", "location": "Phường Thuận Phước, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/CNWOF1YUfYpDDb9SyAnHPA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1021000921000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF6 PLUS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF6 PLUS', 'CAR', 'ECONOMY', 1056000, 1056000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00042')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1056000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00042'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF6 PLUS 2024', 'VINFAST', 'VF6 PLUS', 2023, 'ECONOMY', 1056000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00042', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1056000, 'VINFAST VF6 PLUS 2024', 'Phường Phước Ninh, Quận Hải Châu', '{"source": "MIOTO", "name": "VINFAST VF6 PLUS 2024", "brand": "VINFAST", "model": "VF6 PLUS", "year": "2024", "original_price": "1056000976000", "location": "Phường Phước Ninh, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/jCVU_qiMfK1KDIQef_LhSQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1056000976000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CARNIVAL PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'CARNIVAL PREMIUM', 'CAR', 'ECONOMY', 2058000, 2058000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00043')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 2058000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00043'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CARNIVAL PREMIUM 2021', 'KIA', 'CARNIVAL PREMIUM', 2023, 'ECONOMY', 2058000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00043', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 2058000, 'KIA CARNIVAL PREMIUM 2021', 'Phường Thuận Phước, Quận Hải Châu', '{"source": "MIOTO", "name": "KIA CARNIVAL PREMIUM 2021", "brand": "KIA", "model": "CARNIVAL PREMIUM", "year": "2021", "original_price": "20580001938000", "location": "Phường Thuận Phước, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/O0iza3i025ad_E19h6Eg6w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 20580001938000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '2 2023' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '2 2023', 'CAR', 'ECONOMY', 8970007, 8970007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00044')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8970007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00044'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 2 2023', 'MAZDA', '2 2023', 2023, 'ECONOMY', 8970007, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00044', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8970007, 'MAZDA 2 2023', 'Phường Mân Thái, Quận Sơn Trà', '{"source": "MIOTO", "name": "MAZDA 2 2023", "brand": "MAZDA", "model": "2 2023", "year": "2023", "original_price": "897000797000", "location": "Phường Mân Thái, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/hhruIO5APnmkBM-GdtLA7Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 897000797000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CARENS LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'CARENS LUXURY', 'CAR', 'ECONOMY', 1263000, 1263000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00045')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1263000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00045'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CARENS LUXURY 2025', 'KIA', 'CARENS LUXURY', 2023, 'ECONOMY', 1263000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00045', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1263000, 'KIA CARENS LUXURY 2025', 'Phường An Hải Bắc, Quận Sơn Trà', '{"source": "MIOTO", "name": "KIA CARENS LUXURY 2025", "brand": "KIA", "model": "CARENS LUXURY", "year": "2025", "original_price": "12630001143000", "location": "Phường An Hải Bắc, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/poRz8-PBmnV0QWNWji7VQg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12630001143000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG5')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG5', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'STANDARD 2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'), 'STANDARD 2025', 'CAR', 'ECONOMY', 8610007, 8610007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00046')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8610007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00046'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 STANDARD 2025', 'MG5', 'STANDARD 2025', 2023, 'ECONOMY', 8610007, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00046', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8610007, 'MG5 STANDARD 2025', 'Phường Thuận Phước, Quận Hải Châu', '{"source": "MIOTO", "name": "MG5 STANDARD 2025", "brand": "MG5", "model": "STANDARD 2025", "year": "2025", "original_price": "861000761000", "location": "Phường Thuận Phước, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/ycIjXk9E2WYqQ_4oW5_CoQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 861000761000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'HRV G' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'HRV G', 'CAR', 'ECONOMY', 1068000, 1068000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00047')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1068000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00047'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA HRV G 2023', 'HONDA', 'HRV G', 2023, 'ECONOMY', 1068000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00047', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1068000, 'HONDA HRV G 2023', 'Phường Thạch Thang, Quận Hải Châu', '{"source": "MIOTO", "name": "HONDA HRV G 2023", "brand": "HONDA", "model": "HRV G", "year": "2023", "original_price": "1068000", "location": "Phường Thạch Thang, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/Oq1uvdHuaJl_e4Q1StourQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1068000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'AVANZA 2023' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'AVANZA 2023', 'CAR', 'ECONOMY', 1068000, 1068000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00048')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1068000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00048'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA AVANZA 2023', 'TOYOTA', 'AVANZA 2023', 2023, 'ECONOMY', 1068000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00048', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1068000, 'TOYOTA AVANZA 2023', 'Phường Nại Hiên Đông, Quận Sơn Trà', '{"source": "MIOTO", "name": "TOYOTA AVANZA 2023", "brand": "TOYOTA", "model": "AVANZA 2023", "year": "2023", "original_price": "1068000", "location": "Phường Nại Hiên Đông, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/nuXaYLqElMAB9UOYWBtgKA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1068000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ZS STANDARD' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'), 'ZS STANDARD', 'CAR', 'ECONOMY', 861000, 861000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00049')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 861000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00049'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG ZS STANDARD 2024', 'MG', 'ZS STANDARD', 2023, 'ECONOMY', 861000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00049', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 861000, 'MG ZS STANDARD 2024', 'Phường Thuận Phước, Quận Hải Châu', '{"source": "MIOTO", "name": "MG ZS STANDARD 2024", "brand": "MG", "model": "ZS STANDARD", "year": "2024", "original_price": "861000", "location": "Phường Thuận Phước, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/h8RzSnzlh6thcGmWXSXKdQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 861000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CARNIVAL PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'CARNIVAL PREMIUM', 'CAR', 'ECONOMY', 2296000, 2296000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00050')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 2296000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00050'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CARNIVAL PREMIUM 2024', 'KIA', 'CARNIVAL PREMIUM', 2023, 'ECONOMY', 2296000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00050', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 2296000, 'KIA CARNIVAL PREMIUM 2024', 'Phường An Hải Bắc, Quận Sơn Trà', '{"source": "MIOTO", "name": "KIA CARNIVAL PREMIUM 2024", "brand": "KIA", "model": "CARNIVAL PREMIUM", "year": "2024", "original_price": "2296000", "location": "Phường An Hải Bắc, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/7kmv9VLKeKiIJMhH0Evv7A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 2296000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SWIFT HATCHBACK' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'SWIFT HATCHBACK', 'CAR', 'ECONOMY', 6560005, 6560005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00051')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6560005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00051'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI SWIFT HATCHBACK 2016', 'SUZUKI', 'SWIFT HATCHBACK', 2023, 'ECONOMY', 6560005, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00051', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6560005, 'SUZUKI SWIFT HATCHBACK 2016', 'Phường Mỹ An, Quận Ngũ Hành Sơn', '{"source": "MIOTO", "name": "SUZUKI SWIFT HATCHBACK 2016", "brand": "SUZUKI", "model": "SWIFT HATCHBACK", "year": "2016", "original_price": "656000556000", "location": "Phường Mỹ An, Quận Ngũ Hành Sơn", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/G5lI17BZbPi18h4hZJ_lnw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 656000556000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CITY 2016' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'CITY 2016', 'CAR', 'ECONOMY', 6890005, 6890005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00052')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6890005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00052'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CITY 2016', 'HONDA', 'CITY 2016', 2023, 'ECONOMY', 6890005, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00052', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6890005, 'HONDA CITY 2016', 'Phường An Hải Đông, Quận Sơn Trà', '{"source": "MIOTO", "name": "HONDA CITY 2016", "brand": "HONDA", "model": "CITY 2016", "year": "2016", "original_price": "689000589000", "location": "Phường An Hải Đông, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/jmosQr4wmM78ks_U2xox0A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 689000589000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CITY RS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'CITY RS', 'CAR', 'ECONOMY', 9760008, 9760008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00053')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9760008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00053'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CITY RS 2025', 'HONDA', 'CITY RS', 2023, 'ECONOMY', 9760008, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00053', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9760008, 'HONDA CITY RS 2025', 'Phường Chính Gián, Quận Thanh Khê', '{"source": "MIOTO", "name": "HONDA CITY RS 2025", "brand": "HONDA", "model": "CITY RS", "year": "2025", "original_price": "976000876000", "location": "Phường Chính Gián, Quận Thanh Khê", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/5xu4tkTw8SfcxjP4LDi9SQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 976000876000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'OUTLANDER 2018' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'OUTLANDER 2018', 'CAR', 'ECONOMY', 1091000, 1091000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00054')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1091000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00054'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI OUTLANDER 2018', 'MITSUBISHI', 'OUTLANDER 2018', 2023, 'ECONOMY', 1091000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00054', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1091000, 'MITSUBISHI OUTLANDER 2018', 'Phường Mỹ An, Quận Ngũ Hành Sơn', '{"source": "MIOTO", "name": "MITSUBISHI OUTLANDER 2018", "brand": "MITSUBISHI", "model": "OUTLANDER 2018", "year": "2018", "original_price": "1091000971000", "location": "Phường Mỹ An, Quận Ngũ Hành Sơn", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/EGzQN5CEZ8dX7nZznC7e6g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1091000971000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ATTRAGE 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'ATTRAGE 2022', 'CAR', 'ECONOMY', 6650005, 6650005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00055')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6650005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00055'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI ATTRAGE 2022', 'MITSUBISHI', 'ATTRAGE 2022', 2023, 'ECONOMY', 6650005, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00055', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6650005, 'MITSUBISHI ATTRAGE 2022', 'Phường Mỹ An, Quận Ngũ Hành Sơn', '{"source": "MIOTO", "name": "MITSUBISHI ATTRAGE 2022", "brand": "MITSUBISHI", "model": "ATTRAGE 2022", "year": "2022", "original_price": "665000565000", "location": "Phường Mỹ An, Quận Ngũ Hành Sơn", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/iY8jNWtBGlHLpbRyLDlG-g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 665000565000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF5 2026' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF5 2026', 'CAR', 'ECONOMY', 9060008, 9060008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00056')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9060008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00056'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF5 2026', 'VINFAST', 'VF5 2026', 2023, 'ECONOMY', 9060008, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00056', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9060008, 'VINFAST VF5 2026', 'Phường Mỹ An, Quận Ngũ Hành Sơn', '{"source": "MIOTO", "name": "VINFAST VF5 2026", "brand": "VINFAST", "model": "VF5 2026", "year": "2026", "original_price": "906000827000", "location": "Phường Mỹ An, Quận Ngũ Hành Sơn", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/pvDxdbwM88S7jYJ9J_fW5w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 906000827000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ACCENT 2012' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'ACCENT 2012', 'CAR', 'ECONOMY', 6260005, 6260005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00057')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6260005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00057'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI ACCENT 2012', 'HYUNDAI', 'ACCENT 2012', 2023, 'ECONOMY', 6260005, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00057', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6260005, 'HYUNDAI ACCENT 2012', 'Phường Hòa Cường Bắc, Quận Hải Châu', '{"source": "MIOTO", "name": "HYUNDAI ACCENT 2012", "brand": "HYUNDAI", "model": "ACCENT 2012", "year": "2012", "original_price": "626000526000", "location": "Phường Hòa Cường Bắc, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/s8NzuFe3IAhZXV4uY78P6g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 626000526000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '3 LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '3 LUXURY', 'CAR', 'ECONOMY', 1010000, 1010000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00058')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1010000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00058'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 3 LUXURY 2024', 'MAZDA', '3 LUXURY', 2023, 'ECONOMY', 1010000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00058', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1010000, 'MAZDA 3 LUXURY 2024', 'Phường Phước Mỹ, Quận Sơn Trà', '{"source": "MIOTO", "name": "MAZDA 3 LUXURY 2024", "brand": "MAZDA", "model": "3 LUXURY", "year": "2024", "original_price": "1010000910000", "location": "Phường Phước Mỹ, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/fuMBv8Z9pyXaYSmGbnitgQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1010000910000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ELANTRA 2018' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'ELANTRA 2018', 'CAR', 'ECONOMY', 8040007, 8040007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00059')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8040007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00059'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI ELANTRA 2018', 'HYUNDAI', 'ELANTRA 2018', 2023, 'ECONOMY', 8040007, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00059', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8040007, 'HYUNDAI ELANTRA 2018', 'Phường Hòa Thuận Đông, Quận Hải Châu', '{"source": "MIOTO", "name": "HYUNDAI ELANTRA 2018", "brand": "HYUNDAI", "model": "ELANTRA 2018", "year": "2018", "original_price": "804000704000", "location": "Phường Hòa Thuận Đông, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/PHUtiS-dEy2LlFFIUvU3Kg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 804000704000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SANTAFE 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'SANTAFE 2024', 'CAR', 'ECONOMY', 1722000, 1722000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00060')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1722000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00060'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI SANTAFE 2024', 'HYUNDAI', 'SANTAFE 2024', 2023, 'ECONOMY', 1722000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00060', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1722000, 'HYUNDAI SANTAFE 2024', 'Phường Chính Gián, Quận Thanh Khê', '{"source": "MIOTO", "name": "HYUNDAI SANTAFE 2024", "brand": "HYUNDAI", "model": "SANTAFE 2024", "year": "2024", "original_price": "17220001602000", "location": "Phường Chính Gián, Quận Thanh Khê", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/ZCmZrUesK9q4xMsASbyCKw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 17220001602000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'LUX A' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'LUX A', 'CAR', 'ECONOMY', 1171000, 1171000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00061')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1171000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00061'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST LUX A 2019', 'VINFAST', 'LUX A', 2023, 'ECONOMY', 1171000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00061', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1171000, 'VINFAST LUX A 2019', 'Phường Hòa Cường Bắc, Quận Hải Châu', '{"source": "MIOTO", "name": "VINFAST LUX A 2019", "brand": "VINFAST", "model": "LUX A", "year": "2019", "original_price": "11710001071000", "location": "Phường Hòa Cường Bắc, Quận Hải Châu", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/d8hA1pYmhWh-IFuIa0diwg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11710001071000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VELOSER HATCHBACK' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'VELOSER HATCHBACK', 'CAR', 'ECONOMY', 5450004, 5450004, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00062')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5450004,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00062'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI VELOSER HATCHBACK 2011', 'HYUNDAI', 'VELOSER HATCHBACK', 2023, 'ECONOMY', 5450004, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00062', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5450004, 'HYUNDAI VELOSER HATCHBACK 2011', 'Phường Xuân Hà, Quận Thanh Khê', '{"source": "MIOTO", "name": "HYUNDAI VELOSER HATCHBACK 2011", "brand": "HYUNDAI", "model": "VELOSER HATCHBACK", "year": "2011", "original_price": "545000445000", "location": "Phường Xuân Hà, Quận Thanh Khê", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/_5KyRe0iYODsxkDOm_q2RQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 545000445000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2020' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2020', 'CAR', 'ECONOMY', 7810006, 7810006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00063')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7810006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00063'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2020', 'MITSUBISHI', 'XPANDER 2020', 2023, 'ECONOMY', 7810006, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00063', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7810006, 'MITSUBISHI XPANDER 2020', 'Phường Xuân Hà, Quận Thanh Khê', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2020", "brand": "MITSUBISHI", "model": "XPANDER 2020", "year": "2020", "original_price": "781000661000", "location": "Phường Xuân Hà, Quận Thanh Khê", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/YvwXVHvldczHMGEIKqFteg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 781000661000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF6 ECO' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF6 ECO', 'CAR', 'ECONOMY', 1022000, 1022000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00064')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1022000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00064'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF6 ECO 2025', 'VINFAST', 'VF6 ECO', 2023, 'ECONOMY', 1022000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00064', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1022000, 'VINFAST VF6 ECO 2025', 'Phường Hòa Khê, Quận Thanh Khê', '{"source": "MIOTO", "name": "VINFAST VF6 ECO 2025", "brand": "VINFAST", "model": "VF6 ECO", "year": "2025", "original_price": "1022000942000", "location": "Phường Hòa Khê, Quận Thanh Khê", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/GkX8I6oYDJvES79nvhowUg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1022000942000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'INNOVA 2017' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'INNOVA 2017', 'CAR', 'ECONOMY', 8480007, 8480007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00065')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8480007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00065'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA INNOVA 2017', 'TOYOTA', 'INNOVA 2017', 2023, 'ECONOMY', 8480007, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00065', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8480007, 'TOYOTA INNOVA 2017', 'Phường Thạc Gián, Quận Thanh Khê', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2017", "brand": "TOYOTA", "model": "INNOVA 2017", "year": "2017", "original_price": "848000728000", "location": "Phường Thạc Gián, Quận Thanh Khê", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/2YHTFeoPYtLeGMmkHcNItQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 848000728000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SOLUTO 2021' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'SOLUTO 2021', 'CAR', 'ECONOMY', 7450006, 7450006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00066')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7450006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00066'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA SOLUTO 2021', 'KIA', 'SOLUTO 2021', 2023, 'ECONOMY', 7450006, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00066', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7450006, 'KIA SOLUTO 2021', 'Phường Hòa Khê, Quận Thanh Khê', '{"source": "MIOTO", "name": "KIA SOLUTO 2021", "brand": "KIA", "model": "SOLUTO 2021", "year": "2021", "original_price": "745000645000", "location": "Phường Hòa Khê, Quận Thanh Khê", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/iX_cIqFaMaX0qDXE5cnKEg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 745000645000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF6 ECO' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF6 ECO', 'CAR', 'ECONOMY', 1062000, 1062000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00067')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1062000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00067'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF6 ECO 2024', 'VINFAST', 'VF6 ECO', 2023, 'ECONOMY', 1062000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00067', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1062000, 'VINFAST VF6 ECO 2024', 'Phường An Hải Tây, Quận Sơn Trà', '{"source": "MIOTO", "name": "VINFAST VF6 ECO 2024", "brand": "VINFAST", "model": "VF6 ECO", "year": "2024", "original_price": "1062000982000", "location": "Phường An Hải Tây, Quận Sơn Trà", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/lX-_4ppfFhjFdAZRn78USA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1062000982000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF7 PLUS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF7 PLUS', 'CAR', 'ECONOMY', 1793000, 1793000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00068')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1793000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00068'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF7 PLUS 2026', 'VINFAST', 'VF7 PLUS', 2023, 'ECONOMY', 1793000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00068', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1793000, 'VINFAST VF7 PLUS 2026', 'Phường Thạc Gián, Quận Thanh Khê', '{"source": "MIOTO", "name": "VINFAST VF7 PLUS 2026", "brand": "VINFAST", "model": "VF7 PLUS", "year": "2026", "original_price": "17930001713000", "location": "Phường Thạc Gián, Quận Thanh Khê", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/8zCHt77Ez3GxUgQ8u1ssdA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 17930001713000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ECOSPORT 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'ECOSPORT 2019', 'CAR', 'ECONOMY', 8590007, 8590007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00069')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8590007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_ford_ecosport 2019_2019_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00069'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD ECOSPORT 2019', 'FORD', 'ECOSPORT 2019', 2023, 'ECONOMY', 8590007, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_ford_ecosport 2019_2019_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00069', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8590007, 'FORD ECOSPORT 2019', 'Phường Thạc Gián, Quận Thanh Khê', '{"source": "MIOTO", "name": "FORD ECOSPORT 2019", "brand": "FORD", "model": "ECOSPORT 2019", "year": "2019", "original_price": "859000709000", "location": "Phường Thạc Gián, Quận Thanh Khê", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/ford_ecosport_2019/p/g/2026/04/31/11/uk-wrlprRZwbPYPwk0Vtqg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 859000709000, "local_image_url": "/images/cars/MIOTO_ford_ecosport 2019_2019_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VELOZ CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'VELOZ CROSS', 'CAR', 'ECONOMY', 1159000, 1159000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00070')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1159000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_veloz cross_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00070'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA VELOZ CROSS 2025', 'TOYOTA', 'VELOZ CROSS', 2023, 'ECONOMY', 1159000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_veloz cross_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00070', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1159000, 'TOYOTA VELOZ CROSS 2025', 'Phường Hòa Cường Nam, Quận Hải Châu', '{"source": "MIOTO", "name": "TOYOTA VELOZ CROSS 2025", "brand": "TOYOTA", "model": "VELOZ CROSS", "year": "2025", "original_price": "11590001009000", "location": "Phường Hòa Cường Nam, Quận Hải Châu", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/toyota_veloz_cross_2025/p/g/2026/05/04/10/k27-pFKRsT1xx1BHSSOpUg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11590001009000, "local_image_url": "/images/cars/MIOTO_toyota_veloz cross_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG5')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG5', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'), '2025', 'CAR', 'ECONOMY', 7990006, 7990006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00071')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7990006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mg5_2025_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00071'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 2025', 'MG5', '2025', 2023, 'ECONOMY', 7990006, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mg5_2025_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00071', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7990006, 'MG5 2025', 'Phường Thọ Quang, Quận Sơn Trà', '{"source": "MIOTO", "name": "MG5 2025", "brand": "MG5", "model": "2025", "year": "2025", "original_price": "799000699000", "location": "Phường Thọ Quang, Quận Sơn Trà", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/mg5_2025/p/g/2025/09/15/19/11l8oC6Cj4MV_rxYzI5U6w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 799000699000, "local_image_url": "/images/cars/MIOTO_mg5_2025_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MERCEDES')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MERCEDES', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'C200 2008' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MERCEDES'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MERCEDES'), 'C200 2008', 'CAR', 'ECONOMY', 9850008, 9850008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00072')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9850008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mercedes_c200 2008_2008_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00072'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MERCEDES C200 2008', 'MERCEDES', 'C200 2008', 2023, 'ECONOMY', 9850008, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mercedes_c200 2008_2008_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00072', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9850008, 'MERCEDES C200 2008', 'Phường Mân Thái, Quận Sơn Trà', '{"source": "MIOTO", "name": "MERCEDES C200 2008", "brand": "MERCEDES", "model": "C200 2008", "year": "2008", "original_price": "985000885000", "location": "Phường Mân Thái, Quận Sơn Trà", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/mercedes_c200_2008/p/g/2026/00/14/14/7WYdjRjI03ReTDxfSt62gg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 985000885000, "local_image_url": "/images/cars/MIOTO_mercedes_c200 2008_2008_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SORENTO PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'SORENTO PREMIUM', 'CAR', 'ECONOMY', 1364000, 1364000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00073')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1364000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_sorento premium_2018_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00073'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA SORENTO PREMIUM  2018', 'KIA', 'SORENTO PREMIUM', 2023, 'ECONOMY', 1364000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_sorento premium_2018_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00073', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1364000, 'KIA SORENTO PREMIUM  2018', 'Phường Mỹ An, Quận Ngũ Hành Sơn', '{"source": "MIOTO", "name": "KIA SORENTO PREMIUM  2018", "brand": "KIA", "model": "SORENTO PREMIUM", "year": "2018", "original_price": "13640001244000", "location": "Phường Mỹ An, Quận Ngũ Hành Sơn", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/kia_sorento_premium__2018/p/g/2026/02/18/21/1rtJrnsoclr3LGauIZ2qSg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 13640001244000, "local_image_url": "/images/cars/MIOTO_kia_sorento premium_2018_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'OUTLANDER 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'OUTLANDER 2022', 'CAR', 'ECONOMY', 1225000, 1225000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00074')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1225000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_outlander 2022_2022_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00074'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI OUTLANDER 2022', 'MITSUBISHI', 'OUTLANDER 2022', 2023, 'ECONOMY', 1225000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_outlander 2022_2022_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00074', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1225000, 'MITSUBISHI OUTLANDER 2022', 'Phường Mỹ An, Quận Ngũ Hành Sơn', '{"source": "MIOTO", "name": "MITSUBISHI OUTLANDER 2022", "brand": "MITSUBISHI", "model": "OUTLANDER 2022", "year": "2022", "original_price": "12250001105000", "location": "Phường Mỹ An, Quận Ngũ Hành Sơn", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/mitsubishi_outlander_2022/p/g/2023/02/15/09/vZbdV5pGAcX5ummZchDx7g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12250001105000, "local_image_url": "/images/cars/MIOTO_mitsubishi_outlander 2022_2022_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VIOS 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'VIOS 2022', 'CAR', 'ECONOMY', 8950007, 8950007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00075')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8950007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_vios 2022_2022_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00075'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA VIOS 2022', 'TOYOTA', 'VIOS 2022', 2023, 'ECONOMY', 8950007, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_vios 2022_2022_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00075', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8950007, 'TOYOTA VIOS 2022', 'Phường Hòa Thuận Tây, Quận Hải Châu', '{"source": "MIOTO", "name": "TOYOTA VIOS 2022", "brand": "TOYOTA", "model": "VIOS 2022", "year": "2022", "original_price": "895000795000", "location": "Phường Hòa Thuận Tây, Quận Hải Châu", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/toyota_vios_2022/p/g/2023/00/11/20/cYnqHJQPHgKySIfKxrVnPA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 895000795000, "local_image_url": "/images/cars/MIOTO_toyota_vios 2022_2022_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '3 PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '3 PREMIUM', 'CAR', 'ECONOMY', 8040007, 8040007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00076')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8040007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_3 premium_2017_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00076'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 3 PREMIUM 2017', 'MAZDA', '3 PREMIUM', 2023, 'ECONOMY', 8040007, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_3 premium_2017_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00076', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8040007, 'MAZDA 3 PREMIUM 2017', 'Phường Chính Gián, Quận Thanh Khê', '{"source": "MIOTO", "name": "MAZDA 3 PREMIUM 2017", "brand": "MAZDA", "model": "3 PREMIUM", "year": "2017", "original_price": "804000704000", "location": "Phường Chính Gián, Quận Thanh Khê", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/mazda_3_premium_2017/p/g/2025/04/06/21/G9_mPjSdmOCft5gLhaboTw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 804000704000, "local_image_url": "/images/cars/MIOTO_mazda_3 premium_2017_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SORENTO LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'SORENTO LUXURY', 'CAR', 'ECONOMY', 1085000, 1085000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00077')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1085000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_sorento luxury_2015_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00077'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA SORENTO LUXURY 2015', 'KIA', 'SORENTO LUXURY', 2023, 'ECONOMY', 1085000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_sorento luxury_2015_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00077', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1085000, 'KIA SORENTO LUXURY 2015', 'Phường Mỹ An, Quận Ngũ Hành Sơn', '{"source": "MIOTO", "name": "KIA SORENTO LUXURY 2015", "brand": "KIA", "model": "SORENTO LUXURY", "year": "2015", "original_price": "1085000965000", "location": "Phường Mỹ An, Quận Ngũ Hành Sơn", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/kia_sorento_luxury_2015/p/g/2026/02/22/20/wuUGrS4LLrzs5ayCwBSiyA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1085000965000, "local_image_url": "/images/cars/MIOTO_kia_sorento luxury_2015_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2025', 'CAR', 'ECONOMY', 1124000, 1124000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00078')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1124000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_xpander 2025_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00078'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2025', 'MITSUBISHI', 'XPANDER 2025', 2023, 'ECONOMY', 1124000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_xpander 2025_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00078', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1124000, 'MITSUBISHI XPANDER 2025', 'Phường Nại Hiên Đông, Quận Sơn Trà', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2025", "brand": "MITSUBISHI", "model": "XPANDER 2025", "year": "2025", "original_price": "11240001004000", "location": "Phường Nại Hiên Đông, Quận Sơn Trà", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/mitsubishi_xpander_2025/p/g/2025/09/17/08/gkMyXYKROlu2YfTOGxYLGA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11240001004000, "local_image_url": "/images/cars/MIOTO_mitsubishi_xpander 2025_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'PEUGEOT')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'PEUGEOT', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '3008 2018' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'PEUGEOT'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'PEUGEOT'), '3008 2018', 'CAR', 'ECONOMY', 861000, 861000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00079')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 861000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_peugeot_3008 2018_2018_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00079'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'PEUGEOT 3008 2018', 'PEUGEOT', '3008 2018', 2023, 'ECONOMY', 861000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_peugeot_3008 2018_2018_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00079', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 861000, 'PEUGEOT 3008 2018', 'Phường Thạc Gián, Quận Thanh Khê', '{"source": "MIOTO", "name": "PEUGEOT 3008 2018", "brand": "PEUGEOT", "model": "3008 2018", "year": "2018", "original_price": "861000", "location": "Phường Thạc Gián, Quận Thanh Khê", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/peugeot_3008_2018/p/g/2026/03/19/12/tD6mdowbnUYM2lD8Yti1MQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 861000, "local_image_url": "/images/cars/MIOTO_peugeot_3008 2018_2018_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CRETA LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'CRETA LUXURY', 'CAR', 'ECONOMY', 1147000, 1147000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00080')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1147000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_hyundai_creta luxury_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00080'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI CRETA LUXURY 2025', 'HYUNDAI', 'CRETA LUXURY', 2023, 'ECONOMY', 1147000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_hyundai_creta luxury_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00080', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1147000, 'HYUNDAI CRETA LUXURY 2025', 'Phường An Hải Bắc, Quận Sơn Trà', '{"source": "MIOTO", "name": "HYUNDAI CRETA LUXURY 2025", "brand": "HYUNDAI", "model": "CRETA LUXURY", "year": "2025", "original_price": "1147000", "location": "Phường An Hải Bắc, Quận Sơn Trà", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/hyundai_creta_luxury_2025/p/g/2026/03/07/08/YmSdOR9_pQyU4AKbib75mw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1147000, "local_image_url": "/images/cars/MIOTO_hyundai_creta luxury_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'TERRITORY TITANIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'TERRITORY TITANIUM', 'CAR', 'ECONOMY', 1263000, 1263000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00081')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1263000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_ford_territory titanium_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00081'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD TERRITORY TITANIUM 2023', 'FORD', 'TERRITORY TITANIUM', 2023, 'ECONOMY', 1263000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_ford_territory titanium_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00081', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1263000, 'FORD TERRITORY TITANIUM 2023', 'Phường Vĩnh Trung, Quận Thanh Khê', '{"source": "MIOTO", "name": "FORD TERRITORY TITANIUM 2023", "brand": "FORD", "model": "TERRITORY TITANIUM", "year": "2023", "original_price": "1263000", "location": "Phường Vĩnh Trung, Quận Thanh Khê", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/ford_territory_titanium_2023/p/g/2024/10/21/10/XvRDZuPvsPR3b_C1XlKj6w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1263000, "local_image_url": "/images/cars/MIOTO_ford_territory titanium_2023_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'RX5 STANDARD' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'), 'RX5 STANDARD', 'CAR', 'ECONOMY', 1111000, 1111000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00082')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1111000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mg_rx5 standard_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00082'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG RX5 STANDARD 2023', 'MG', 'RX5 STANDARD', 2023, 'ECONOMY', 1111000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mg_rx5 standard_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00082', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1111000, 'MG RX5 STANDARD 2023', 'Phường Mân Thái, Quận Sơn Trà', '{"source": "MIOTO", "name": "MG RX5 STANDARD 2023", "brand": "MG", "model": "RX5 STANDARD", "year": "2023", "original_price": "1111000", "location": "Phường Mân Thái, Quận Sơn Trà", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/mg_rx5_standard_2023/p/g/2025/03/14/14/88f2ZifjFi6MQy_xJnShvQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1111000, "local_image_url": "/images/cars/MIOTO_mg_rx5 standard_2023_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CX5 Deluxe' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), 'CX5 Deluxe', 'CAR', 'ECONOMY', 1378000, 1378000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00083')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1378000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_cx5 deluxe_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00083'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA CX5 Deluxe 2024', 'MAZDA', 'CX5 Deluxe', 2023, 'ECONOMY', 1378000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_cx5 deluxe_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00083', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1378000, 'MAZDA CX5 Deluxe 2024', 'Phường Khuê Mỹ, Quận Ngũ Hành Sơn', '{"source": "MIOTO", "name": "MAZDA CX5 Deluxe 2024", "brand": "MAZDA", "model": "CX5 Deluxe", "year": "2024", "original_price": "1378000", "location": "Phường Khuê Mỹ, Quận Ngũ Hành Sơn", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/mazda_cx5_deluxe_2024/p/g/2026/01/13/08/i-vsixlSkB-3mDoMqy2BXQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1378000, "local_image_url": "/images/cars/MIOTO_mazda_cx5 deluxe_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'HS LUX' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'), 'HS LUX', 'CAR', 'ECONOMY', 1091000, 1091000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00084')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1091000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mg_hs lux_2020_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00084'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG HS LUX TROPHY 2020', 'MG', 'HS LUX', 2023, 'ECONOMY', 1091000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mg_hs lux_2020_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00084', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1091000, 'MG HS LUX TROPHY 2020', 'Phường Phước Mỹ, Quận Sơn Trà', '{"source": "MIOTO", "name": "MG HS LUX TROPHY 2020", "brand": "MG", "model": "HS LUX", "year": "2020", "original_price": "1091000", "location": "Phường Phước Mỹ, Quận Sơn Trà", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/mg_hs_lux_trophy_2020/p/g/2025/06/02/15/Mv1eViCvdUhUa9-4nhpziA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1091000, "local_image_url": "/images/cars/MIOTO_mg_hs lux_2020_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CX5 LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), 'CX5 LUXURY', 'CAR', 'ECONOMY', 1435000, 1435000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00085')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1435000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_cx5 luxury_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00085'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA CX5 LUXURY 2025', 'MAZDA', 'CX5 LUXURY', 2023, 'ECONOMY', 1435000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_cx5 luxury_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00085', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1435000, 'MAZDA CX5 LUXURY 2025', 'Phường Thanh Khê Tây, Quận Thanh Khê', '{"source": "MIOTO", "name": "MAZDA CX5 LUXURY 2025", "brand": "MAZDA", "model": "CX5 LUXURY", "year": "2025", "original_price": "1435000", "location": "Phường Thanh Khê Tây, Quận Thanh Khê", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/mazda_cx5_luxury_2025/p/g/2025/07/10/20/mLXhtXNPio8pgqT56tcQKw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1435000, "local_image_url": "/images/cars/MIOTO_mazda_cx5 luxury_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ZS STANDARD' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'), 'ZS STANDARD', 'CAR', 'ECONOMY', 953000, 953000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00086')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 953000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mg_zs standard_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00086'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG ZS STANDARD 2025', 'MG', 'ZS STANDARD', 2023, 'ECONOMY', 953000, 0, N'Hanoi', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mg_zs standard_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00086', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 953000, 'MG ZS STANDARD 2025', 'Phường Hòa Thuận Tây, Quận Hải Châu', '{"source": "MIOTO", "name": "MG ZS STANDARD 2025", "brand": "MG", "model": "ZS STANDARD", "year": "2025", "original_price": "953000", "location": "Phường Hòa Thuận Tây, Quận Hải Châu", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_danang/mg_zs_standard_2025/p/g/2025/10/22/15/I_dBAp-RgdONNqiWuVW_rw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 953000, "local_image_url": "/images/cars/MIOTO_mg_zs standard_2025_mioto.jpg"}');
