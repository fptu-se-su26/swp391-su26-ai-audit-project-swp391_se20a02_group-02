-- ===========================================================
-- LUXEWAY VEHICLE SEED SCRIPT (GENERATED VIA SCRAPER PIPELINE)
-- Generated at: 2026-06-14 23:42:14
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
        price_per_day = 500000,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Kia Morning MT', 'Kia', 'Morning MT', 2023, 'ECONOMY', 500000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00001', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 500000, 'Kia Morning MT', 'Đà Nẵng', '{"source": "MIOTO", "name": "Kia Morning MT", "brand": "Kia", "model": "Morning MT", "year": "2023", "original_price": "500000₫", "location": "Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689218176455_kia morning.jpeg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 500000, "local_image_url": ""}');


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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Kia Forte 1.6 MT', 'Kia', 'Forte 1.6', 2023, 'ECONOMY', 700000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00002', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Kia Forte 1.6 MT', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Kia Forte 1.6 MT", "brand": "Kia", "model": "Forte 1.6", "year": "2023", "original_price": "700000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/default-image.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');


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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Honda Civic MT', 'Honda', 'Civic MT', 2023, 'ECONOMY', 700000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00003', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Honda Civic MT', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Honda Civic MT", "brand": "Honda", "model": "Civic MT", "year": "2023", "original_price": "700000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689309307704_honda civic.jpeg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');


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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Hyundai Grand i10 Hatchback 1.0 AT', 'Hyundai', 'Grand i10', 2023, 'ECONOMY', 700000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00004', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Hyundai Grand i10 Hatchback 1.0 AT', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Hyundai Grand i10 Hatchback 1.0 AT", "brand": "Hyundai", "model": "Grand i10", "year": "2023", "original_price": "700000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689143255811_hyundai i10.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');


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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Nissan Sunny XL', 'Nissan', 'Sunny XL', 2023, 'ECONOMY', 700000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00005', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Nissan Sunny XL', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Nissan Sunny XL", "brand": "Nissan", "model": "Sunny XL", "year": "2023", "original_price": "700000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689318398716_nissan sunny.png", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');


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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Toyota Vios MT', 'Toyota', 'Vios MT', 2023, 'ECONOMY', 700000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00006', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Toyota Vios MT', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Toyota Vios MT", "brand": "Toyota", "model": "Vios MT", "year": "2023", "original_price": "700000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689132278841_Vios MT.png", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');


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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Hyundai Avante AT', 'Hyundai', 'Avante AT', 2023, 'ECONOMY', 700000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00007', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Hyundai Avante AT', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Hyundai Avante AT", "brand": "Hyundai", "model": "Avante AT", "year": "2023", "original_price": "700000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689134881883_hyundai avante.jpeg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');


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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Geely Coolray Coolray Flagship', 'Geely', 'Coolray Coolray', 2023, 'ECONOMY', 730000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00008', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 730000, 'Geely Coolray Coolray Flagship', 'Đà Nẵng', '{"source": "MIOTO", "name": "Geely Coolray Coolray Flagship", "brand": "Geely", "model": "Coolray Coolray", "year": "2023", "original_price": "730000₫", "location": "Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1762309920454_geely-coolray-250303-c05.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 730000, "local_image_url": ""}');


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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'Toyota Vios AT', 'Toyota', 'Vios AT', 2023, 'ECONOMY', 800000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00009', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 800000, 'Toyota Vios AT', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Toyota Vios AT", "brand": "Toyota", "model": "Vios AT", "year": "2023", "original_price": "800000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689132331746_Vios MT.png", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 800000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'K3 PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'K3 PREMIUM', 'CAR', 'ECONOMY', 9490008, 9490008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00010')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9490008,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA K3 PREMIUM 2023', 'KIA', 'K3 PREMIUM', 2023, 'ECONOMY', 9490008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00010', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9490008, 'KIA K3 PREMIUM 2023', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "KIA K3 PREMIUM 2023", "brand": "KIA", "model": "K3 PREMIUM", "year": "2023", "original_price": "949000859000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/das4MKBaEGMCjL6cnouY3g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 949000859000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'OMODA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'OMODA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'C5 LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'OMODA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'OMODA'), 'C5 LUXURY', 'CAR', 'ECONOMY', 1219000, 1219000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00011')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1219000,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'OMODA C5 LUXURY 2026', 'OMODA', 'C5 LUXURY', 2023, 'ECONOMY', 1219000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00011', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1219000, 'OMODA C5 LUXURY 2026', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "OMODA C5 LUXURY 2026", "brand": "OMODA", "model": "C5 LUXURY", "year": "2026", "original_price": "12190001119000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/ucQSoB0Ww60ZYgeUwSkMyQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12190001119000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CX5 Deluxe' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), 'CX5 Deluxe', 'CAR', 'ECONOMY', 1199000, 1199000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00012')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1199000,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA CX5 Deluxe 2025', 'MAZDA', 'CX5 Deluxe', 2023, 'ECONOMY', 1199000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00012', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1199000, 'MAZDA CX5 Deluxe 2025', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA CX5 Deluxe 2025", "brand": "MAZDA", "model": "CX5 Deluxe", "year": "2025", "original_price": "11990001099000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/0goBQTU8EE5_FakPxCO8PA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11990001099000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CARENS 2026' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'CARENS 2026', 'CAR', 'ECONOMY', 1034000, 1034000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00013')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1034000,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CARENS 2026', 'KIA', 'CARENS 2026', 2023, 'ECONOMY', 1034000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00013', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1034000, 'KIA CARENS 2026', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "KIA CARENS 2026", "brand": "KIA", "model": "CARENS 2026", "year": "2026", "original_price": "1034000944000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/0ccVszv4qC7QUIw8-PlD9Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1034000944000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CIVIC E' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'CIVIC E', 'CAR', 'ECONOMY', 8500007, 8500007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00014')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8500007,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CIVIC E 2018', 'HONDA', 'CIVIC E', 2023, 'ECONOMY', 8500007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00014', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8500007, 'HONDA CIVIC E 2018', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "HONDA CIVIC E 2018", "brand": "HONDA", "model": "CIVIC E", "year": "2018", "original_price": "850000760000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/yIDn4mcdySWdX9Ijwa1w7Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 850000760000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'PEUGEOT')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'PEUGEOT', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '3008 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'PEUGEOT'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'PEUGEOT'), '3008 2022', 'CAR', 'ECONOMY', 1079000, 1079000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00015')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1079000,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'PEUGEOT 3008 2022', 'PEUGEOT', '3008 2022', 2023, 'ECONOMY', 1079000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00015', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1079000, 'PEUGEOT 3008 2022', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "PEUGEOT 3008 2022", "brand": "PEUGEOT", "model": "3008 2022", "year": "2022", "original_price": "1079000979000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/_ou6ATSxq_ZJy3ckwDQ1Xw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1079000979000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'GEELY')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'GEELY', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'COOLRAY FLAGSHIP' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'GEELY'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'GEELY'), 'COOLRAY FLAGSHIP', 'CAR', 'ECONOMY', 9300008, 9300008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00016')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9300008,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'GEELY COOLRAY FLAGSHIP 2025', 'GEELY', 'COOLRAY FLAGSHIP', 2023, 'ECONOMY', 9300008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00016', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9300008, 'GEELY COOLRAY FLAGSHIP 2025', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "GEELY COOLRAY FLAGSHIP 2025", "brand": "GEELY", "model": "COOLRAY FLAGSHIP", "year": "2025", "original_price": "930000820000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/owFqC2MONI4SZBHwty-kxQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 930000820000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XL7 HYBRID' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'XL7 HYBRID', 'CAR', 'ECONOMY', 8790007, 8790007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00017')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8790007,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI XL7 HYBRID 2024', 'SUZUKI', 'XL7 HYBRID', 2023, 'ECONOMY', 8790007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00017', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8790007, 'SUZUKI XL7 HYBRID 2024', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "SUZUKI XL7 HYBRID 2024", "brand": "SUZUKI", "model": "XL7 HYBRID", "year": "2024", "original_price": "879000789000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/yvmbLyuAU5KV5LXAYGhosA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 879000789000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '3 Deluxe' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '3 Deluxe', 'CAR', 'ECONOMY', 8500007, 8500007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00018')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8500007,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 3 Deluxe 2022', 'MAZDA', '3 Deluxe', 2023, 'ECONOMY', 8500007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00018', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8500007, 'MAZDA 3 Deluxe 2022', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA 3 Deluxe 2022", "brand": "MAZDA", "model": "3 Deluxe", "year": "2022", "original_price": "850000760000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/LdoWI_bq5a9axEZUB6QNHQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 850000760000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ZS STANDARD' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'), 'ZS STANDARD', 'CAR', 'ECONOMY', 7990006, 7990006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00019')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7990006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG ZS STANDARD 2024', 'MG', 'ZS STANDARD', 2023, 'ECONOMY', 7990006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00019', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7990006, 'MG ZS STANDARD 2024', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "MG ZS STANDARD 2024", "brand": "MG", "model": "ZS STANDARD", "year": "2024", "original_price": "799000699000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/UuIGRRc5lDaOunD2J2AlqA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 799000699000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ACCENT 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'ACCENT 2024', 'CAR', 'ECONOMY', 7790006, 7790006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00020')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7790006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI ACCENT 2024', 'HYUNDAI', 'ACCENT 2024', 2023, 'ECONOMY', 7790006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00020', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7790006, 'HYUNDAI ACCENT 2024', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "HYUNDAI ACCENT 2024", "brand": "HYUNDAI", "model": "ACCENT 2024", "year": "2024", "original_price": "779000679000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/es2bXjM54i3H5YIGBpOHAw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 779000679000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'FOCUS 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'FOCUS 2019', 'CAR', 'ECONOMY', 7030006, 7030006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00021')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7030006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD FOCUS 2019', 'FORD', 'FOCUS 2019', 2023, 'ECONOMY', 7030006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00021', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7030006, 'FORD FOCUS 2019', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "FORD FOCUS 2019", "brand": "FORD", "model": "FOCUS 2019", "year": "2019", "original_price": "703000613000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/AdGppWFkiNJCTSsbmf-87g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 703000613000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '2 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '2 2024', 'CAR', 'ECONOMY', 7390006, 7390006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00022')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7390006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 2 2024', 'MAZDA', '2 2024', 2023, 'ECONOMY', 7390006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00022', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7390006, 'MAZDA 2 2024', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA 2 2024", "brand": "MAZDA", "model": "2 2024", "year": "2024", "original_price": "739000649000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/__azAr-XmshurxKWQV69ig.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 739000649000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'FADIL 2020' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'FADIL 2020', 'CAR', 'ECONOMY', 5560004, 5560004, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00023')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5560004,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST FADIL 2020', 'VINFAST', 'FADIL 2020', 2023, 'ECONOMY', 5560004, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00023', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5560004, 'VINFAST FADIL 2020', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "VINFAST FADIL 2020", "brand": "VINFAST", "model": "FADIL 2020", "year": "2020", "original_price": "556000466000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/2GpRxLfjaSM358FSQhpsxg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 556000466000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '3 Deluxe' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '3 Deluxe', 'CAR', 'ECONOMY', 7500006, 7500006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00024')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7500006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 3 Deluxe 2019', 'MAZDA', '3 Deluxe', 2023, 'ECONOMY', 7500006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00024', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7500006, 'MAZDA 3 Deluxe 2019', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA 3 Deluxe 2019", "brand": "MAZDA", "model": "3 Deluxe", "year": "2019", "original_price": "750000660000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/VgJMtU_ZbosQyfnFvD3GXQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 750000660000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '2 LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '2 LUXURY', 'CAR', 'ECONOMY', 7390006, 7390006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00025')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7390006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 2 LUXURY 2023', 'MAZDA', '2 LUXURY', 2023, 'ECONOMY', 7390006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00025', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7390006, 'MAZDA 2 LUXURY 2023', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA 2 LUXURY 2023", "brand": "MAZDA", "model": "2 LUXURY", "year": "2023", "original_price": "739000639000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/RSeh0hRKAlU0My_t61Gedg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 739000639000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CAMRY 2.0E' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'CAMRY 2.0E', 'CAR', 'ECONOMY', 9760008, 9760008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00026')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9760008,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA CAMRY 2.0E 2016', 'TOYOTA', 'CAMRY 2.0E', 2023, 'ECONOMY', 9760008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00026', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9760008, 'TOYOTA CAMRY 2.0E 2016', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA CAMRY 2.0E 2016", "brand": "TOYOTA", "model": "CAMRY 2.0E", "year": "2016", "original_price": "976000856000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/I9vm8VW82f6mTlE_WLZ_SA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 976000856000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'I10 2021' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'I10 2021', 'CAR', 'ECONOMY', 5850004, 5850004, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00027')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5850004,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI I10 2021', 'HYUNDAI', 'I10 2021', 2023, 'ECONOMY', 5850004, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00027', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5850004, 'HYUNDAI I10 2021', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI I10 2021", "brand": "HYUNDAI", "model": "I10 2021", "year": "2021", "original_price": "585000495000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/yfFXu3Q0w0UYjMp_GDLRLg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 585000495000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'STARGAZER PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'STARGAZER PREMIUM', 'CAR', 'ECONOMY', 7350006, 7350006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00028')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7350006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI STARGAZER PREMIUM 2022', 'HYUNDAI', 'STARGAZER PREMIUM', 2023, 'ECONOMY', 7350006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00028', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7350006, 'HYUNDAI STARGAZER PREMIUM 2022', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI STARGAZER PREMIUM 2022", "brand": "HYUNDAI", "model": "STARGAZER PREMIUM", "year": "2022", "original_price": "735000645000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/-Nf0AUbGTm2vIFURaHy6lw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 735000645000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VIOS 2023' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'VIOS 2023', 'CAR', 'ECONOMY', 7690006, 7690006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00029')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7690006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA VIOS 2023', 'TOYOTA', 'VIOS 2023', 2023, 'ECONOMY', 7690006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00029', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7690006, 'TOYOTA VIOS 2023', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "TOYOTA VIOS 2023", "brand": "TOYOTA", "model": "VIOS 2023", "year": "2023", "original_price": "769000669000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/dI1xc2t2tQWL9GWGu4jGyg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 769000669000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG5')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG5', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'STANDARD 2023' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'), 'STANDARD 2023', 'CAR', 'ECONOMY', 7500006, 7500006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00030')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7500006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 STANDARD 2023', 'MG5', 'STANDARD 2023', 2023, 'ECONOMY', 7500006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00030', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7500006, 'MG5 STANDARD 2023', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "MG5 STANDARD 2023", "brand": "MG5", "model": "STANDARD 2023", "year": "2023", "original_price": "750000660000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/pYVjsj2kE90K5ekre-gC3A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 750000660000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'RONDO 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'RONDO 2022', 'CAR', 'ECONOMY', 7790006, 7790006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00031')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7790006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA RONDO 2022', 'KIA', 'RONDO 2022', 2023, 'ECONOMY', 7790006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00031', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7790006, 'KIA RONDO 2022', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "KIA RONDO 2022", "brand": "KIA", "model": "RONDO 2022", "year": "2022", "original_price": "779000689000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/EmVIg4SCb_rBHROP8oPa5g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 779000689000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG5')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG5', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'STANDARD 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'), 'STANDARD 2024', 'CAR', 'ECONOMY', 7790006, 7790006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00032')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7790006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 STANDARD 2024', 'MG5', 'STANDARD 2024', 2023, 'ECONOMY', 7790006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00032', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7790006, 'MG5 STANDARD 2024', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "MG5 STANDARD 2024", "brand": "MG5", "model": "STANDARD 2024", "year": "2024", "original_price": "779000689000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/2-vmNsnVe5o0t04LZUJn7Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 779000689000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ACCENT 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'ACCENT 2022', 'CAR', 'ECONOMY', 7090006, 7090006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00033')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7090006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI ACCENT 2022', 'HYUNDAI', 'ACCENT 2022', 2023, 'ECONOMY', 7090006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00033', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7090006, 'HYUNDAI ACCENT 2022', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI ACCENT 2022", "brand": "HYUNDAI", "model": "ACCENT 2022", "year": "2022", "original_price": "709000609000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/C2oZGCcqgD7P8fQSedCsxQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 709000609000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SELTOS LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'SELTOS LUXURY', 'CAR', 'ECONOMY', 8690007, 8690007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00034')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8690007,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA SELTOS LUXURY 2021', 'KIA', 'SELTOS LUXURY', 2023, 'ECONOMY', 8690007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00034', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8690007, 'KIA SELTOS LUXURY 2021', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "KIA SELTOS LUXURY 2021", "brand": "KIA", "model": "SELTOS LUXURY", "year": "2021", "original_price": "869000769000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/_Q19cePvgHTyGYkX4HyalQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 869000769000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XL7 2021' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'XL7 2021', 'CAR', 'ECONOMY', 7440006, 7440006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00035')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7440006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI XL7 2021', 'SUZUKI', 'XL7 2021', 2023, 'ECONOMY', 7440006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00035', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7440006, 'SUZUKI XL7 2021', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "SUZUKI XL7 2021", "brand": "SUZUKI", "model": "XL7 2021", "year": "2021", "original_price": "744000654000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/PCt_MjmNZSuIZu1yOXEebQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 744000654000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ACCENT 2023' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'ACCENT 2023', 'CAR', 'ECONOMY', 7500006, 7500006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00036')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7500006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI ACCENT 2023', 'HYUNDAI', 'ACCENT 2023', 2023, 'ECONOMY', 7500006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00036', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7500006, 'HYUNDAI ACCENT 2023', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI ACCENT 2023", "brand": "HYUNDAI", "model": "ACCENT 2023", "year": "2023", "original_price": "750000650000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/me3xV9fgKSkrRN6nPrTNsQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 750000650000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ELANTRA 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'ELANTRA 2019', 'CAR', 'ECONOMY', 7790006, 7790006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00037')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7790006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI ELANTRA 2019', 'HYUNDAI', 'ELANTRA 2019', 2023, 'ECONOMY', 7790006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00037', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7790006, 'HYUNDAI ELANTRA 2019', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI ELANTRA 2019", "brand": "HYUNDAI", "model": "ELANTRA 2019", "year": "2019", "original_price": "779000689000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/MTFqD7oTPl3i1VncH-vq0A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 779000689000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'FADIL 2021' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'FADIL 2021', 'CAR', 'ECONOMY', 5850004, 5850004, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00038')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5850004,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST FADIL 2021', 'VINFAST', 'FADIL 2021', 2023, 'ECONOMY', 5850004, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00038', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5850004, 'VINFAST FADIL 2021', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "VINFAST FADIL 2021", "brand": "VINFAST", "model": "FADIL 2021", "year": "2021", "original_price": "585000495000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/7nOFGgypecdV1G5h2MB8Lg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 585000495000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'KONA 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'KONA 2019', 'CAR', 'ECONOMY', 7190006, 7190006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00039')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7190006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI KONA 2019', 'HYUNDAI', 'KONA 2019', 2023, 'ECONOMY', 7190006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00039', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7190006, 'HYUNDAI KONA 2019', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI KONA 2019", "brand": "HYUNDAI", "model": "KONA 2019", "year": "2019", "original_price": "719000619000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/w5LYbid1SN9szB2XUP3GFw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 719000619000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'LUX A' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'LUX A', 'CAR', 'ECONOMY', 9860008, 9860008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00040')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9860008,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST LUX A 2022', 'VINFAST', 'LUX A', 2023, 'ECONOMY', 9860008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00040', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9860008, 'VINFAST LUX A 2022', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "VINFAST LUX A 2022", "brand": "VINFAST", "model": "LUX A", "year": "2022", "original_price": "986000866000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/3FKBD4vubdp1vnPB9eBiWQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 986000866000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'RAIZE 2023' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'RAIZE 2023', 'CAR', 'ECONOMY', 8090007, 8090007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00041')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8090007,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA RAIZE 2023', 'TOYOTA', 'RAIZE 2023', 2023, 'ECONOMY', 8090007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00041', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8090007, 'TOYOTA RAIZE 2023', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "TOYOTA RAIZE 2023", "brand": "TOYOTA", "model": "RAIZE 2023", "year": "2023", "original_price": "809000709000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/We-rt15AbeQGayrg4IRctg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 809000709000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG5')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG5', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'LUXURY 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'), 'LUXURY 2022', 'CAR', 'ECONOMY', 7590006, 7590006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00042')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7590006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 LUXURY 2022', 'MG5', 'LUXURY 2022', 2023, 'ECONOMY', 7590006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00042', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7590006, 'MG5 LUXURY 2022', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "MG5 LUXURY 2022", "brand": "MG5", "model": "LUXURY 2022", "year": "2022", "original_price": "759000669000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/NjGtIPwGCdpVOjmCRIWeqA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 759000669000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ERTIGA 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'ERTIGA 2022', 'CAR', 'ECONOMY', 7440006, 7440006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00043')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7440006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI ERTIGA 2022', 'SUZUKI', 'ERTIGA 2022', 2023, 'ECONOMY', 7440006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00043', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7440006, 'SUZUKI ERTIGA 2022', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "SUZUKI ERTIGA 2022", "brand": "SUZUKI", "model": "ERTIGA 2022", "year": "2022", "original_price": "744000654000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/6AnqqbNQkCv5SWhk9aI4xA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 744000654000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'COROLLA ALTIS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'COROLLA ALTIS', 'CAR', 'ECONOMY', 9290008, 9290008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00044')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9290008,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA COROLLA ALTIS 2021', 'TOYOTA', 'COROLLA ALTIS', 2023, 'ECONOMY', 9290008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00044', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9290008, 'TOYOTA COROLLA ALTIS 2021', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "TOYOTA COROLLA ALTIS 2021", "brand": "TOYOTA", "model": "COROLLA ALTIS", "year": "2021", "original_price": "929000809000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/XLlQgr86ZVsP3C9288jTUw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 929000809000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'TERRITORY TREND' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'TERRITORY TREND', 'CAR', 'ECONOMY', 1199000, 1199000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00045')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1199000,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD TERRITORY TREND 2025', 'FORD', 'TERRITORY TREND', 2023, 'ECONOMY', 1199000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00045', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1199000, 'FORD TERRITORY TREND 2025', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "FORD TERRITORY TREND 2025", "brand": "FORD", "model": "TERRITORY TREND", "year": "2025", "original_price": "11990001099000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/P7zIoBiq53pLsxMbf0qO2A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11990001099000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG5')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG5', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'), '2024', 'CAR', 'ECONOMY', 6690005, 6690005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00046')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6690005,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 2024', 'MG5', '2024', 2023, 'ECONOMY', 6690005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00046', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6690005, 'MG5 2024', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "MG5 2024", "brand": "MG5", "model": "2024", "year": "2024", "original_price": "669000579000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/dM94O62gMIbZm4w1phSqtw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 669000579000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CITY RS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'CITY RS', 'CAR', 'ECONOMY', 8290007, 8290007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00047')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8290007,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CITY RS 2024', 'HONDA', 'CITY RS', 2023, 'ECONOMY', 8290007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00047', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8290007, 'HONDA CITY RS 2024', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "HONDA CITY RS 2024", "brand": "HONDA", "model": "CITY RS", "year": "2024", "original_price": "829000729000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/yjzrslLr0MUbn0DQGvsIPw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 829000729000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '2 2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '2 2025', 'CAR', 'ECONOMY', 7790006, 7790006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00048')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7790006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 2 2025', 'MAZDA', '2 2025', 2023, 'ECONOMY', 7790006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00048', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7790006, 'MAZDA 2 2025', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "MAZDA 2 2025", "brand": "MAZDA", "model": "2 2025", "year": "2025", "original_price": "779000679000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/zJwC-mXbHKrQaFPcgz7K0Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 779000679000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'COROLLA ALTIS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'COROLLA ALTIS', 'CAR', 'ECONOMY', 9470008, 9470008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00049')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9470008,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA COROLLA ALTIS 2022', 'TOYOTA', 'COROLLA ALTIS', 2023, 'ECONOMY', 9470008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00049', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9470008, 'TOYOTA COROLLA ALTIS 2022', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "TOYOTA COROLLA ALTIS 2022", "brand": "TOYOTA", "model": "COROLLA ALTIS", "year": "2022", "original_price": "947000827000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/BNEO9aGylGh1Lan_NGqGUw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 947000827000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ELANTRA 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'ELANTRA 2024', 'CAR', 'ECONOMY', 845000, 845000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00050')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 845000,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI ELANTRA 2024', 'HYUNDAI', 'ELANTRA 2024', 2023, 'ECONOMY', 845000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00050', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 845000, 'HYUNDAI ELANTRA 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "HYUNDAI ELANTRA 2024", "brand": "HYUNDAI", "model": "ELANTRA 2024", "year": "2024", "original_price": "845000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/olDlVEnaNVkW0rtF7MsY8w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 845000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'WIGO 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'WIGO 2024', 'CAR', 'ECONOMY', 6060005, 6060005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00051')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6060005,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA WIGO 2024', 'TOYOTA', 'WIGO 2024', 2023, 'ECONOMY', 6060005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00051', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6060005, 'TOYOTA WIGO 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA WIGO 2024", "brand": "TOYOTA", "model": "WIGO 2024", "year": "2024", "original_price": "606000516000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/Vj755R1vKtgf6iS94Sn1xQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 606000516000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ZS LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'), 'ZS LUXURY', 'CAR', 'ECONOMY', 7390006, 7390006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00052')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7390006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG ZS LUXURY 2021', 'MG', 'ZS LUXURY', 2023, 'ECONOMY', 7390006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00052', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7390006, 'MG ZS LUXURY 2021', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "MG ZS LUXURY 2021", "brand": "MG", "model": "ZS LUXURY", "year": "2021", "original_price": "739000639000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/575uuVIeKs2nPEnH2DWgLQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 739000639000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CITY RS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'CITY RS', 'CAR', 'ECONOMY', 8890007, 8890007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00053')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8890007,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CITY RS 2026', 'HONDA', 'CITY RS', 2023, 'ECONOMY', 8890007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00053', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8890007, 'HONDA CITY RS 2026', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "HONDA CITY RS 2026", "brand": "HONDA", "model": "CITY RS", "year": "2026", "original_price": "889000789000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/oJ1a13dZl7mZOJ1Yx69Ffg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 889000789000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'K5 PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'K5 PREMIUM', 'CAR', 'ECONOMY', 1190000, 1190000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00054')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1190000,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA K5 PREMIUM 2023', 'KIA', 'K5 PREMIUM', 2023, 'ECONOMY', 1190000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00054', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1190000, 'KIA K5 PREMIUM 2023', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "KIA K5 PREMIUM 2023", "brand": "KIA", "model": "K5 PREMIUM", "year": "2023", "original_price": "11900001070000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/eWxU3Lamz1GMgDq0uIIZkQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11900001070000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG5')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG5', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'), '2025', 'CAR', 'ECONOMY', 6990006, 6990006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00055')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6990006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 2025', 'MG5', '2025', 2023, 'ECONOMY', 6990006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00055', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6990006, 'MG5 2025', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "MG5 2025", "brand": "MG5", "model": "2025", "year": "2025", "original_price": "699000609000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/I_B1M8uQ00NFj5mEGpSd6w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 699000609000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ECOSPORT 2015' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'ECOSPORT 2015', 'CAR', 'ECONOMY', 6390005, 6390005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00056')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6390005,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD ECOSPORT 2015', 'FORD', 'ECOSPORT 2015', 2023, 'ECONOMY', 6390005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00056', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6390005, 'FORD ECOSPORT 2015', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "FORD ECOSPORT 2015", "brand": "FORD", "model": "ECOSPORT 2015", "year": "2015", "original_price": "639000539000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/AkVa3pi-Rf25_MDnmA5Hgg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 639000539000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VENUE 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'VENUE 2024', 'CAR', 'ECONOMY', 7810006, 7810006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00057')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7810006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI VENUE 2024', 'HYUNDAI', 'VENUE 2024', 2023, 'ECONOMY', 7810006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00057', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7810006, 'HYUNDAI VENUE 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "HYUNDAI VENUE 2024", "brand": "HYUNDAI", "model": "VENUE 2024", "year": "2024", "original_price": "781000681000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/GQPnc87soLHTcmSJ-hVjeQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 781000681000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'FIESTA 2017' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'FIESTA 2017', 'CAR', 'ECONOMY', 5590004, 5590004, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00058')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5590004,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD FIESTA 2017', 'FORD', 'FIESTA 2017', 2023, 'ECONOMY', 5590004, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00058', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5590004, 'FORD FIESTA 2017', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "FORD FIESTA 2017", "brand": "FORD", "model": "FIESTA 2017", "year": "2017", "original_price": "559000459000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/aY4xc1yQzmappR7QFD2yRA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 559000459000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG5')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG5', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'STANDARD 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'), 'STANDARD 2022', 'CAR', 'ECONOMY', 7090006, 7090006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00059')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7090006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 STANDARD 2022', 'MG5', 'STANDARD 2022', 2023, 'ECONOMY', 7090006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00059', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7090006, 'MG5 STANDARD 2022', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "MG5 STANDARD 2022", "brand": "MG5", "model": "STANDARD 2022", "year": "2022", "original_price": "709000619000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/kMP1gcqkL4bO_BGHMpq8lA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 709000619000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ECOSPORT 2018' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'ECOSPORT 2018', 'CAR', 'ECONOMY', 6590005, 6590005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00060')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6590005,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD ECOSPORT 2018', 'FORD', 'ECOSPORT 2018', 2023, 'ECONOMY', 6590005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00060', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6590005, 'FORD ECOSPORT 2018', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "FORD ECOSPORT 2018", "brand": "FORD", "model": "ECOSPORT 2018", "year": "2018", "original_price": "659000559000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/5_s0eFOsHbothybuYQfkWQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 659000559000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF3 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF3 2024', 'CAR', 'ECONOMY', 5050004, 5050004, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00061')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5050004,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF3 2024', 'VINFAST', 'VF3 2024', 2023, 'ECONOMY', 5050004, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00061', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5050004, 'VINFAST VF3 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "VINFAST VF3 2024", "brand": "VINFAST", "model": "VF3 2024", "year": "2024", "original_price": "505000425000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/CX2S9Nx1gUc1uiiFcESYtw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 505000425000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '3 Deluxe' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '3 Deluxe', 'CAR', 'ECONOMY', 6890005, 6890005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00062')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6890005,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 3 Deluxe 2016', 'MAZDA', '3 Deluxe', 2023, 'ECONOMY', 6890005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00062', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6890005, 'MAZDA 3 Deluxe 2016', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA 3 Deluxe 2016", "brand": "MAZDA", "model": "3 Deluxe", "year": "2016", "original_price": "689000589000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/aY1fLMepoic-HXVAknU8ZA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 689000589000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VIOS 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'VIOS 2022', 'CAR', 'ECONOMY', 6800005, 6800005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00063')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6800005,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA VIOS 2022', 'TOYOTA', 'VIOS 2022', 2023, 'ECONOMY', 6800005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00063', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6800005, 'TOYOTA VIOS 2022', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA VIOS 2022", "brand": "TOYOTA", "model": "VIOS 2022", "year": "2022", "original_price": "680000580000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/JqaE5_AexA9lAG-AuHvC1Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 680000580000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'I10 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'I10 2022', 'CAR', 'ECONOMY', 6060005, 6060005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00064')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6060005,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI I10 2022', 'HYUNDAI', 'I10 2022', 2023, 'ECONOMY', 6060005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00064', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6060005, 'HYUNDAI I10 2022', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "HYUNDAI I10 2022", "brand": "HYUNDAI", "model": "I10 2022", "year": "2022", "original_price": "606000516000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/MrFaHb1w9RgOxtlLthPS9Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 606000516000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'STARGAZER PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'STARGAZER PREMIUM', 'CAR', 'ECONOMY', 7440006, 7440006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00065')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7440006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI STARGAZER PREMIUM 2025', 'HYUNDAI', 'STARGAZER PREMIUM', 2023, 'ECONOMY', 7440006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00065', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7440006, 'HYUNDAI STARGAZER PREMIUM 2025', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "HYUNDAI STARGAZER PREMIUM 2025", "brand": "HYUNDAI", "model": "STARGAZER PREMIUM", "year": "2025", "original_price": "744000654000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/lLaKVFwANCZtgN6e26JujQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 744000654000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ERTIGA 2021' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'ERTIGA 2021', 'CAR', 'ECONOMY', 6530005, 6530005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00066')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6530005,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI ERTIGA 2021', 'SUZUKI', 'ERTIGA 2021', 2023, 'ECONOMY', 6530005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00066', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6530005, 'SUZUKI ERTIGA 2021', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "SUZUKI ERTIGA 2021", "brand": "SUZUKI", "model": "ERTIGA 2021", "year": "2021", "original_price": "653000563000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/lfAlzmbfAhTNNMp5Slop0A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 653000563000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'STARGAZER 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'STARGAZER 2022', 'CAR', 'ECONOMY', 7070006, 7070006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00067')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7070006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI STARGAZER 2022', 'HYUNDAI', 'STARGAZER 2022', 2023, 'ECONOMY', 7070006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00067', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7070006, 'HYUNDAI STARGAZER 2022', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "HYUNDAI STARGAZER 2022", "brand": "HYUNDAI", "model": "STARGAZER 2022", "year": "2022", "original_price": "707000617000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/tlqMlg6QKkcrdJHJji8nkw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 707000617000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VIOS 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'VIOS 2024', 'CAR', 'ECONOMY', 7990006, 7990006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00068')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7990006,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA VIOS 2024', 'TOYOTA', 'VIOS 2024', 2023, 'ECONOMY', 7990006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00068', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7990006, 'TOYOTA VIOS 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA VIOS 2024", "brand": "TOYOTA", "model": "VIOS 2024", "year": "2024", "original_price": "799000699000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/rI1WiNN_JvX_fo-8wur0CA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 799000699000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'RANGER XLS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'RANGER XLS', 'CAR', 'ECONOMY', 1025000, 1025000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00069')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1025000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00069'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD RANGER XLS 4x2 2023', 'FORD', 'RANGER XLS', 2023, 'ECONOMY', 1025000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00069', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1025000, 'FORD RANGER XLS 4x2 2023', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "FORD RANGER XLS 4x2 2023", "brand": "FORD", "model": "RANGER XLS", "year": "2023", "original_price": "1025000905000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/gAIz-OQ-NYih_0Sc-1LnQQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1025000905000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'CHEVROLET')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'CHEVROLET', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CRUZE 2017' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'CHEVROLET'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'CHEVROLET'), 'CRUZE 2017', 'CAR', 'ECONOMY', 6590005, 6590005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00070')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6590005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00070'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'CHEVROLET CRUZE 2017', 'CHEVROLET', 'CRUZE 2017', 2023, 'ECONOMY', 6590005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00070', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6590005, 'CHEVROLET CRUZE 2017', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "CHEVROLET CRUZE 2017", "brand": "CHEVROLET", "model": "CRUZE 2017", "year": "2017", "original_price": "659000569000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/Ryuxyx2sgdHFkd-lLG1heg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 659000569000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'COROLLA ALTIS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'COROLLA ALTIS', 'CAR', 'ECONOMY', 8090006, 8090006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00071')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8090006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00071'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA COROLLA ALTIS 2015', 'TOYOTA', 'COROLLA ALTIS', 2023, 'ECONOMY', 8090006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00071', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8090006, 'TOYOTA COROLLA ALTIS 2015', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA COROLLA ALTIS 2015", "brand": "TOYOTA", "model": "COROLLA ALTIS", "year": "2015", "original_price": "809000689000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/EKGFrV1Hlme3SXfYzbWy_Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 809000689000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG5')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG5', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'LUXURY 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'), 'LUXURY 2024', 'CAR', 'ECONOMY', 8190007, 8190007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00072')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8190007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00072'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 LUXURY 2024', 'MG5', 'LUXURY 2024', 2023, 'ECONOMY', 8190007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00072', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8190007, 'MG5 LUXURY 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "MG5 LUXURY 2024", "brand": "MG5", "model": "LUXURY 2024", "year": "2024", "original_price": "819000729000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/gMjNfCxSUY347OVsuxmyYg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 819000729000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'FORTUNER 2011' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'FORTUNER 2011', 'CAR', 'ECONOMY', 7530006, 7530006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00073')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7530006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00073'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA FORTUNER 2011', 'TOYOTA', 'FORTUNER 2011', 2023, 'ECONOMY', 7530006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00073', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7530006, 'TOYOTA FORTUNER 2011', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA FORTUNER 2011", "brand": "TOYOTA", "model": "FORTUNER 2011", "year": "2011", "original_price": "753000633000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/efJLAopLjOLponIMDag1Sg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 753000633000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF3 2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF3 2025', 'CAR', 'ECONOMY', 5740005, 5740005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00074')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5740005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00074'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF3 2025', 'VINFAST', 'VF3 2025', 2023, 'ECONOMY', 5740005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00074', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5740005, 'VINFAST VF3 2025', 'Phường 19, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF3 2025", "brand": "VINFAST", "model": "VF3 2025", "year": "2025", "original_price": "574000524000", "location": "Phường 19, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/7I4fvjUbs9lYoLbKFkfFxQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 574000524000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XL7 2020' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'XL7 2020', 'CAR', 'ECONOMY', 9640008, 9640008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00075')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9640008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00075'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI XL7 2020', 'SUZUKI', 'XL7 2020', 2023, 'ECONOMY', 9640008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00075', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9640008, 'SUZUKI XL7 2020', 'Phường 07, Quận Phú Nhuận', '{"source": "MIOTO", "name": "SUZUKI XL7 2020", "brand": "SUZUKI", "model": "XL7 2020", "year": "2020", "original_price": "964000844000", "location": "Phường 07, Quận Phú Nhuận", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/ODY7O7WolNKmCd5-8gZgFA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 964000844000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2021' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2021', 'CAR', 'ECONOMY', 9700008, 9700008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00076')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9700008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00076'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2021', 'MITSUBISHI', 'XPANDER 2021', 2023, 'ECONOMY', 9700008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00076', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9700008, 'MITSUBISHI XPANDER 2021', 'Phường 15, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2021", "brand": "MITSUBISHI", "model": "XPANDER 2021", "year": "2021", "original_price": "970000850000", "location": "Phường 15, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/1YnuDhXWF1OyH4RxO7CMzg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 970000850000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2026' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2026', 'CAR', 'ECONOMY', 1032000, 1032000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00077')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1032000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00077'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2026', 'MITSUBISHI', 'XPANDER 2026', 2023, 'ECONOMY', 1032000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00077', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1032000, 'MITSUBISHI XPANDER 2026', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2026", "brand": "MITSUBISHI", "model": "XPANDER 2026", "year": "2026", "original_price": "1032000912000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/Iwdr-3JTOOiA9MojrprwfA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1032000912000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF6 PLUS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF6 PLUS', 'CAR', 'ECONOMY', 1032000, 1032000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00078')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1032000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00078'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF6 PLUS 2025', 'VINFAST', 'VF6 PLUS', 2023, 'ECONOMY', 1032000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00078', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1032000, 'VINFAST VF6 PLUS 2025', 'Phường Tân Định, Quận 1', '{"source": "MIOTO", "name": "VINFAST VF6 PLUS 2025", "brand": "VINFAST", "model": "VF6 PLUS", "year": "2025", "original_price": "1032000952000", "location": "Phường Tân Định, Quận 1", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/uek-z1NXY8xBx-Jxha41Hw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1032000952000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'EVEREST TITANIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'EVEREST TITANIUM', 'CAR', 'ECONOMY', 1412000, 1412000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00079')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1412000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00079'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD EVEREST TITANIUM 2018', 'FORD', 'EVEREST TITANIUM', 2023, 'ECONOMY', 1412000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00079', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1412000, 'FORD EVEREST TITANIUM 2018', 'Phường 02, Quận Bình Thạnh', '{"source": "MIOTO", "name": "FORD EVEREST TITANIUM 2018", "brand": "FORD", "model": "EVEREST TITANIUM", "year": "2018", "original_price": "14120001292000", "location": "Phường 02, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/9X5TNrvNtAX-ZU8B3VbOAA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 14120001292000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF8 PLUS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF8 PLUS', 'CAR', 'ECONOMY', 1491000, 1491000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00080')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1491000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00080'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF8 PLUS 2025', 'VINFAST', 'VF8 PLUS', 2023, 'ECONOMY', 1491000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00080', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1491000, 'VINFAST VF8 PLUS 2025', 'Phường 25, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF8 PLUS 2025", "brand": "VINFAST", "model": "VF8 PLUS", "year": "2025", "original_price": "14910001411000", "location": "Phường 25, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/JfpIYaWlNB-N9N2mZG4OBg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 14910001411000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'STARGAZER PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'STARGAZER PREMIUM', 'CAR', 'ECONOMY', 1033000, 1033000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00081')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1033000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00081'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI STARGAZER PREMIUM 2023', 'HYUNDAI', 'STARGAZER PREMIUM', 2023, 'ECONOMY', 1033000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00081', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000, 'HYUNDAI STARGAZER PREMIUM 2023', 'Phường Đa Kao, Quận 1', '{"source": "MIOTO", "name": "HYUNDAI STARGAZER PREMIUM 2023", "brand": "HYUNDAI", "model": "STARGAZER PREMIUM", "year": "2023", "original_price": "1033000913000", "location": "Phường Đa Kao, Quận 1", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/L4QmnhrmAiqGYQVxrPOPcQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000913000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SEDONA LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'SEDONA LUXURY', 'CAR', 'ECONOMY', 1550000, 1550000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00082')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1550000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00082'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA SEDONA LUXURY 2021', 'KIA', 'SEDONA LUXURY', 2023, 'ECONOMY', 1550000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00082', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1550000, 'KIA SEDONA LUXURY 2021', 'Phường Đa Kao, Quận 1', '{"source": "MIOTO", "name": "KIA SEDONA LUXURY 2021", "brand": "KIA", "model": "SEDONA LUXURY", "year": "2021", "original_price": "15500001430000", "location": "Phường Đa Kao, Quận 1", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/Sypl2bnH2qLUvY7Og_c4mA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 15500001430000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF6 PLUS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF6 PLUS', 'CAR', 'ECONOMY', 1089000, 1089000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00083')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1089000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00083'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF6 PLUS 2026', 'VINFAST', 'VF6 PLUS', 2023, 'ECONOMY', 1089000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00083', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1089000, 'VINFAST VF6 PLUS 2026', 'Phường 24, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF6 PLUS 2026", "brand": "VINFAST", "model": "VF6 PLUS", "year": "2026", "original_price": "10890001009000", "location": "Phường 24, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/bqT-hCNnhoexoZQvJpDC0g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 10890001009000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF5 2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF5 2025', 'CAR', 'ECONOMY', 8600007, 8600007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00084')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8600007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00084'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF5 2025', 'VINFAST', 'VF5 2025', 2023, 'ECONOMY', 8600007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00084', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8600007, 'VINFAST VF5 2025', 'Phường 25, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF5 2025", "brand": "VINFAST", "model": "VF5 2025", "year": "2025", "original_price": "860000785000", "location": "Phường 25, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/nlbOOkj7qsh8RExgMv9xYQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 860000785000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'INNOVA 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'INNOVA 2019', 'CAR', 'ECONOMY', 9620008, 9620008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00085')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9620008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00085'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA INNOVA 2019', 'TOYOTA', 'INNOVA 2019', 2023, 'ECONOMY', 9620008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00085', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9620008, 'TOYOTA INNOVA 2019', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2019", "brand": "TOYOTA", "model": "INNOVA 2019", "year": "2019", "original_price": "962000842000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/S2iZd1bwTm-xz4ZLQuIxTQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 962000842000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF6 ECO' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF6 ECO', 'CAR', 'ECONOMY', 9170008, 9170008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00086')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9170008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00086'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF6 ECO 2024', 'VINFAST', 'VF6 ECO', 2023, 'ECONOMY', 9170008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00086', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9170008, 'VINFAST VF6 ECO 2024', 'Phường 05, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF6 ECO 2024", "brand": "VINFAST", "model": "VF6 ECO", "year": "2024", "original_price": "917000837000", "location": "Phường 05, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/HgkN0X0Fw-wTI16V5I63Bw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 917000837000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF3 2026' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF3 2026', 'CAR', 'ECONOMY', 6310005, 6310005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00087')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6310005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00087'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF3 2026', 'VINFAST', 'VF3 2026', 2023, 'ECONOMY', 6310005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00087', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6310005, 'VINFAST VF3 2026', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF3 2026", "brand": "VINFAST", "model": "VF3 2026", "year": "2026", "original_price": "631000576000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/mE43x9VoCMwPXjmSoHIFZg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 631000576000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER CROSS', 'CAR', 'ECONOMY', 1148000, 1148000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00088')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1148000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00088'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER CROSS 2023', 'MITSUBISHI', 'XPANDER CROSS', 2023, 'ECONOMY', 1148000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00088', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1148000, 'MITSUBISHI XPANDER CROSS 2023', 'Phường Đa Kao, Quận 1', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER CROSS 2023", "brand": "MITSUBISHI", "model": "XPANDER CROSS", "year": "2023", "original_price": "11480001028000", "location": "Phường Đa Kao, Quận 1", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/0diL2az9yFx7Rt694chPJQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11480001028000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2019', 'CAR', 'ECONOMY', 9180007, 9180007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00089')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9180007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00089'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2019', 'MITSUBISHI', 'XPANDER 2019', 2023, 'ECONOMY', 9180007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00089', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9180007, 'MITSUBISHI XPANDER 2019', 'Phường 11, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2019", "brand": "MITSUBISHI", "model": "XPANDER 2019", "year": "2019", "original_price": "918000798000", "location": "Phường 11, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/ML8NqEGz975K1yWa9Di8rg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 918000798000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CUSTIN LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'CUSTIN LUXURY', 'CAR', 'ECONOMY', 1351000, 1351000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00090')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1351000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00090'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI CUSTIN LUXURY 2024', 'HYUNDAI', 'CUSTIN LUXURY', 2023, 'ECONOMY', 1351000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00090', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1351000, 'HYUNDAI CUSTIN LUXURY 2024', 'Phường 24, Quận Bình Thạnh', '{"source": "MIOTO", "name": "HYUNDAI CUSTIN LUXURY 2024", "brand": "HYUNDAI", "model": "CUSTIN LUXURY", "year": "2024", "original_price": "13510001231000", "location": "Phường 24, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/Nin7XkDV1D_VQE5FOVlM4w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 13510001231000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'INNOVA 2015' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'INNOVA 2015', 'CAR', 'ECONOMY', 8380007, 8380007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00091')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8380007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00091'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA INNOVA 2015', 'TOYOTA', 'INNOVA 2015', 2023, 'ECONOMY', 8380007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00091', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8380007, 'TOYOTA INNOVA 2015', 'Phường 11, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2015", "brand": "TOYOTA", "model": "INNOVA 2015", "year": "2015", "original_price": "838000718000", "location": "Phường 11, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/1Dz7-UR4netnSFV22bJp-g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 838000718000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2022', 'CAR', 'ECONOMY', 9760008, 9760008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00092')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9760008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00092'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2022', 'MITSUBISHI', 'XPANDER 2022', 2023, 'ECONOMY', 9760008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00092', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9760008, 'MITSUBISHI XPANDER 2022', 'Phường 22, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2022", "brand": "MITSUBISHI", "model": "XPANDER 2022", "year": "2022", "original_price": "976000856000", "location": "Phường 22, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/abMXSvZ9SunczZ2poox15g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 976000856000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CRV G' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'CRV G', 'CAR', 'ECONOMY', 1182000, 1182000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00093')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1182000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00093'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CRV G 2018', 'HONDA', 'CRV G', 2023, 'ECONOMY', 1182000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00093', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1182000, 'HONDA CRV G 2018', 'Phường Bến Nghé, Quận 1', '{"source": "MIOTO", "name": "HONDA CRV G 2018", "brand": "HONDA", "model": "CRV G", "year": "2018", "original_price": "11820001062000", "location": "Phường Bến Nghé, Quận 1", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/hOCJ44honJTABQRbEp57mA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11820001062000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'INNOVA 2021' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'INNOVA 2021', 'CAR', 'ECONOMY', 1033000, 1033000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00094')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1033000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00094'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA INNOVA 2021', 'TOYOTA', 'INNOVA 2021', 2023, 'ECONOMY', 1033000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00094', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000, 'TOYOTA INNOVA 2021', 'Phường 22, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2021", "brand": "TOYOTA", "model": "INNOVA 2021", "year": "2021", "original_price": "1033000913000", "location": "Phường 22, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/o0VDALKvyQcnrOFJ9LwzPA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000913000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'ISUZU')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'ISUZU', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'MUX 4X2' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'ISUZU'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'ISUZU'), 'MUX 4X2', 'CAR', 'ECONOMY', 1068000, 1068000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00095')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1068000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00095'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'ISUZU MUX 4X2 2016', 'ISUZU', 'MUX 4X2', 2023, 'ECONOMY', 1068000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00095', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1068000, 'ISUZU MUX 4X2 2016', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "ISUZU MUX 4X2 2016", "brand": "ISUZU", "model": "MUX 4X2", "year": "2016", "original_price": "1068000948000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/R-JTuuyK6Sajt0wORYFJ8g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1068000948000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER CROSS', 'CAR', 'ECONOMY', 8040006, 8040006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00096')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8040006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00096'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER CROSS 2021', 'MITSUBISHI', 'XPANDER CROSS', 2023, 'ECONOMY', 8040006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00096', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8040006, 'MITSUBISHI XPANDER CROSS 2021', 'Phường 25, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER CROSS 2021", "brand": "MITSUBISHI", "model": "XPANDER CROSS", "year": "2021", "original_price": "804000684000", "location": "Phường 25, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/gONn_griqXuNh8jKXXrLpA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 804000684000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'LIMO GREEN' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'LIMO GREEN', 'CAR', 'ECONOMY', 1364000, 1364000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00097')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1364000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00097'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST LIMO GREEN 2025', 'VINFAST', 'LIMO GREEN', 2023, 'ECONOMY', 1364000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00097', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1364000, 'VINFAST LIMO GREEN 2025', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST LIMO GREEN 2025", "brand": "VINFAST", "model": "LIMO GREEN", "year": "2025", "original_price": "13640001284000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/DTaeGWvUARRukkQp_yTr3Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 13640001284000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'CHEVROLET')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'CHEVROLET', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SPARK 2016' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'CHEVROLET'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'CHEVROLET'), 'SPARK 2016', 'CAR', 'ECONOMY', 5300004, 5300004, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00098')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5300004,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00098'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'CHEVROLET SPARK 2016', 'CHEVROLET', 'SPARK 2016', 2023, 'ECONOMY', 5300004, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00098', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5300004, 'CHEVROLET SPARK 2016', 'Phường 22, Quận Bình Thạnh', '{"source": "MIOTO", "name": "CHEVROLET SPARK 2016", "brand": "CHEVROLET", "model": "SPARK 2016", "year": "2016", "original_price": "530000450000", "location": "Phường 22, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/zNeIGSg73oZ45JdK0NY6aQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 530000450000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2023' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2023', 'CAR', 'ECONOMY', 1033000, 1033000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00099')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1033000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00099'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2023', 'MITSUBISHI', 'XPANDER 2023', 2023, 'ECONOMY', 1033000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00099', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000, 'MITSUBISHI XPANDER 2023', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2023", "brand": "MITSUBISHI", "model": "XPANDER 2023", "year": "2023", "original_price": "1033000913000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/6IGkTyBnRzvedOZvycZrkQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000913000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CARNIVAL PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'CARNIVAL PREMIUM', 'CAR', 'ECONOMY', 2049000, 2049000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00100')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 2049000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00100'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CARNIVAL PREMIUM 2022', 'KIA', 'CARNIVAL PREMIUM', 2023, 'ECONOMY', 2049000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00100', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 2049000, 'KIA CARNIVAL PREMIUM 2022', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "KIA CARNIVAL PREMIUM 2022", "brand": "KIA", "model": "CARNIVAL PREMIUM", "year": "2022", "original_price": "20490001929000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/c4WqnlJycm9Y8Q9ts6Dpxg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 20490001929000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'G50 LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG'), 'G50 LUXURY', 'CAR', 'ECONOMY', 1452000, 1452000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00101')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1452000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00101'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG G50 LUXURY 2026', 'MG', 'G50 LUXURY', 2023, 'ECONOMY', 1452000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00101', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1452000, 'MG G50 LUXURY 2026', 'Phường 05, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MG G50 LUXURY 2026", "brand": "MG", "model": "G50 LUXURY", "year": "2026", "original_price": "14520001332000", "location": "Phường 05, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/LaJRKx7NnRhNbXRwKdvNtA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 14520001332000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'SORENTO DELUXE' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'SORENTO DELUXE', 'CAR', 'ECONOMY', 1238000, 1238000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00102')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1238000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00102'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA SORENTO DELUXE 2018', 'KIA', 'SORENTO DELUXE', 2023, 'ECONOMY', 1238000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00102', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1238000, 'KIA SORENTO DELUXE 2018', 'Phường 07, Quận Bình Thạnh', '{"source": "MIOTO", "name": "KIA SORENTO DELUXE 2018", "brand": "KIA", "model": "SORENTO DELUXE", "year": "2018", "original_price": "12380001118000", "location": "Phường 07, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/WukVX0x4vCmIcqtFN5ikxQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12380001118000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2024', 'CAR', 'ECONOMY', 1010000, 1010000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00103')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1010000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00103'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2024', 'MITSUBISHI', 'XPANDER 2024', 2023, 'ECONOMY', 1010000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00103', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1010000, 'MITSUBISHI XPANDER 2024', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2024", "brand": "MITSUBISHI", "model": "XPANDER 2024", "year": "2024", "original_price": "1010000890000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/YgMLzSw6cRUgQVYYOlKShA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1010000890000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2020' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2020', 'CAR', 'ECONOMY', 8610007, 8610007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00104')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8610007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_xpander 2020_2020_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00104'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2020', 'MITSUBISHI', 'XPANDER 2020', 2023, 'ECONOMY', 8610007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_xpander 2020_2020_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00104', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8610007, 'MITSUBISHI XPANDER 2020', 'Phường 14, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2020", "brand": "MITSUBISHI", "model": "XPANDER 2020", "year": "2020", "original_price": "861000741000", "location": "Phường 14, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_2020/p/g/2024/02/07/10/KhvOqyr-oT7GO_TCW7YsEA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 861000741000, "local_image_url": "/images/cars/MIOTO_mitsubishi_xpander 2020_2020_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VELOZ CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'VELOZ CROSS', 'CAR', 'ECONOMY', 1275000, 1275000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00105')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1275000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_veloz cross_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00105'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA VELOZ CROSS 2025', 'TOYOTA', 'VELOZ CROSS', 2023, 'ECONOMY', 1275000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_veloz cross_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00105', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1275000, 'TOYOTA VELOZ CROSS 2025', 'Phường 22, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA VELOZ CROSS 2025", "brand": "TOYOTA", "model": "VELOZ CROSS", "year": "2025", "original_price": "12750001155000", "location": "Phường 22, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_veloz_cross_2025/p/g/2025/06/17/22/QWMSgQvdQGKVGA8UUQ505A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12750001155000, "local_image_url": "/images/cars/MIOTO_toyota_veloz cross_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG5')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG5', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'LUXURY 2023' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'), 'LUXURY 2023', 'CAR', 'ECONOMY', 998000, 998000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00106')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 998000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mg5_luxury 2023_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00106'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 LUXURY 2023', 'MG5', 'LUXURY 2023', 2023, 'ECONOMY', 998000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mg5_luxury 2023_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00106', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 998000, 'MG5 LUXURY 2023', 'Phường 01, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MG5 LUXURY 2023", "brand": "MG5", "model": "LUXURY 2023", "year": "2023", "original_price": "998000", "location": "Phường 01, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mg5_luxury_2023/p/g/2024/07/12/20/o09l4JvWAhET8gGFtTnb_A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 998000, "local_image_url": "/images/cars/MIOTO_mg5_luxury 2023_2023_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00107')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1147000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_hyundai_creta luxury_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00107'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI CRETA LUXURY 2025', 'HYUNDAI', 'CRETA LUXURY', 2023, 'ECONOMY', 1147000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_hyundai_creta luxury_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00107', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1147000, 'HYUNDAI CRETA LUXURY 2025', 'Phường 25, Quận Bình Thạnh', '{"source": "MIOTO", "name": "HYUNDAI CRETA LUXURY 2025", "brand": "HYUNDAI", "model": "CRETA LUXURY", "year": "2025", "original_price": "1147000", "location": "Phường 25, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_creta_luxury_2025/p/g/2026/01/19/22/YeqKSNj6QQ7ggO8hj6DeDQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1147000, "local_image_url": "/images/cars/MIOTO_hyundai_creta luxury_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VIOS 2017' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'VIOS 2017', 'CAR', 'ECONOMY', 574000, 574000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00108')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 574000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_vios 2017_2017_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00108'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA VIOS 2017', 'TOYOTA', 'VIOS 2017', 2023, 'ECONOMY', 574000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_vios 2017_2017_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00108', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 574000, 'TOYOTA VIOS 2017', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA VIOS 2017", "brand": "TOYOTA", "model": "VIOS 2017", "year": "2017", "original_price": "574000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_vios_2017/p/g/2025/05/11/09/V-nonpJ_dIpWyw1ztNi-HA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 574000, "local_image_url": "/images/cars/MIOTO_toyota_vios 2017_2017_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ECOSPORT 2017' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'ECOSPORT 2017', 'CAR', 'ECONOMY', 850000, 850000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00109')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 850000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_ford_ecosport 2017_2017_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00109'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD ECOSPORT 2017', 'FORD', 'ECOSPORT 2017', 2023, 'ECONOMY', 850000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_ford_ecosport 2017_2017_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00109', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 850000, 'FORD ECOSPORT 2017', 'Phường 08, Quận 3', '{"source": "MIOTO", "name": "FORD ECOSPORT 2017", "brand": "FORD", "model": "ECOSPORT 2017", "year": "2017", "original_price": "850000", "location": "Phường 08, Quận 3", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/ford_ecosport_2017/p/g/2025/07/08/19/Zn8KZ1mOVwJHT_06hGd6ug.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 850000, "local_image_url": "/images/cars/MIOTO_ford_ecosport 2017_2017_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CIVIC RS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'CIVIC RS', 'CAR', 'ECONOMY', 1288000, 1288000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00110')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1288000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_honda_civic rs_2020_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00110'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CIVIC RS 2020', 'HONDA', 'CIVIC RS', 2023, 'ECONOMY', 1288000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_honda_civic rs_2020_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00110', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1288000, 'HONDA CIVIC RS 2020', 'Phường Bến Nghé, Quận 1', '{"source": "MIOTO", "name": "HONDA CIVIC RS 2020", "brand": "HONDA", "model": "CIVIC RS", "year": "2020", "original_price": "1288000", "location": "Phường Bến Nghé, Quận 1", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_civic_rs_2020/p/g/2024/07/11/21/_7ctTWixrbhCqu9nLUjrBg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1288000, "local_image_url": "/images/cars/MIOTO_honda_civic rs_2020_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CIAZ 2021' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'CIAZ 2021', 'CAR', 'ECONOMY', 734000, 734000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00111')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 734000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_suzuki_ciaz 2021_2021_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00111'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI CIAZ 2021', 'SUZUKI', 'CIAZ 2021', 2023, 'ECONOMY', 734000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_suzuki_ciaz 2021_2021_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00111', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 734000, 'SUZUKI CIAZ 2021', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "SUZUKI CIAZ 2021", "brand": "SUZUKI", "model": "CIAZ 2021", "year": "2021", "original_price": "734000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/suzuki_ciaz_2021/p/g/2024/04/02/15/kwaHxl_pXMY1lbgYCkOCBg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 734000, "local_image_url": "/images/cars/MIOTO_suzuki_ciaz 2021_2021_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '6 PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '6 PREMIUM', 'CAR', 'ECONOMY', 1091000, 1091000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00112')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1091000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_6 premium_2018_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00112'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 6 PREMIUM 2018', 'MAZDA', '6 PREMIUM', 2023, 'ECONOMY', 1091000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_6 premium_2018_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00112', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1091000, 'MAZDA 6 PREMIUM 2018', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MAZDA 6 PREMIUM 2018", "brand": "MAZDA", "model": "6 PREMIUM", "year": "2018", "original_price": "1091000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mazda_6_premium_2018/p/g/2026/02/05/19/_Qg0wHqTIg6bWYEAR0xDKg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1091000, "local_image_url": "/images/cars/MIOTO_mazda_6 premium_2018_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUBARU')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUBARU', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'FORESTER 2.0i-S' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUBARU'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUBARU'), 'FORESTER 2.0i-S', 'CAR', 'ECONOMY', 1597000, 1597000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00113')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1597000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_subaru_forester 2.0i-s_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00113'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUBARU FORESTER 2.0i-S Eyesight 2024', 'SUBARU', 'FORESTER 2.0i-S', 2023, 'ECONOMY', 1597000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_subaru_forester 2.0i-s_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00113', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1597000, 'SUBARU FORESTER 2.0i-S Eyesight 2024', 'Phường 11, Quận Bình Thạnh', '{"source": "MIOTO", "name": "SUBARU FORESTER 2.0i-S Eyesight 2024", "brand": "SUBARU", "model": "FORESTER 2.0i-S", "year": "2024", "original_price": "1597000", "location": "Phường 11, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/subaru_forester_2.0i-s_eyesight_2024/p/g/2026/05/09/15/xoPN3eQof3zsSzWjfiLDjg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1597000, "local_image_url": "/images/cars/MIOTO_subaru_forester 2.0i-s_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'CHEVROLET')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'CHEVROLET', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CRUZE 2018' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'CHEVROLET'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'CHEVROLET'), 'CRUZE 2018', 'CAR', 'ECONOMY', 700000, 700000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00114')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 700000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_chevrolet_cruze 2018_2018_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00114'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'CHEVROLET CRUZE 2018', 'CHEVROLET', 'CRUZE 2018', 2023, 'ECONOMY', 700000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_chevrolet_cruze 2018_2018_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00114', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'CHEVROLET CRUZE 2018', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "CHEVROLET CRUZE 2018", "brand": "CHEVROLET", "model": "CRUZE 2018", "year": "2018", "original_price": "700000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/chevrolet_cruze_2018/p/g/2023/07/29/13/G4SYK5MaIlUYzgW335Vf8A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": "/images/cars/MIOTO_chevrolet_cruze 2018_2018_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'COROLLA CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'COROLLA CROSS', 'CAR', 'ECONOMY', 1112000, 1112000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00115')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1112000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_corolla cross_2020_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00115'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA COROLLA CROSS G 2020', 'TOYOTA', 'COROLLA CROSS', 2023, 'ECONOMY', 1112000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_corolla cross_2020_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00115', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1112000, 'TOYOTA COROLLA CROSS G 2020', 'Phường 05, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA COROLLA CROSS G 2020", "brand": "TOYOTA", "model": "COROLLA CROSS", "year": "2020", "original_price": "1112000", "location": "Phường 05, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_corolla_cross_g_2020/p/g/2024/02/22/11/JpG4c0R-Vu6Z73SBZzJ7xg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1112000, "local_image_url": "/images/cars/MIOTO_toyota_corolla cross_2020_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'RONDO 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'RONDO 2019', 'CAR', 'ECONOMY', 746000, 746000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00116')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 746000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_rondo 2019_2019_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00116'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA RONDO 2019', 'KIA', 'RONDO 2019', 2023, 'ECONOMY', 746000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_rondo 2019_2019_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00116', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 746000, 'KIA RONDO 2019', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "KIA RONDO 2019", "brand": "KIA", "model": "RONDO 2019", "year": "2019", "original_price": "746000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_rondo_2019/p/g/2022/11/12/08/OkjqEmF_xe7KMUay5tuFJg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 746000, "local_image_url": "/images/cars/MIOTO_kia_rondo 2019_2019_mioto.jpg"}');
