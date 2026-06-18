-- ===========================================================
-- LUXEWAY VEHICLE SEED SCRIPT (GENERATED VIA SCRAPER PIPELINE)
-- Generated at: 2026-06-18 14:19:07
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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00001')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1034000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_carens 2026_2026_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00001'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CARENS 2026', 'KIA', 'CARENS 2026', 2023, 'ECONOMY', 1034000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_carens 2026_2026_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00001', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1034000, 'KIA CARENS 2026', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "KIA CARENS 2026", "brand": "KIA", "model": "CARENS 2026", "year": "2026", "original_price": "1034000944000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_carens_2026/p/g/2026/04/26/22/0ccVszv4qC7QUIw8-PlD9Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1034000944000, "local_image_url": "/images/cars/MIOTO_kia_carens 2026_2026_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00002')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8500007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_honda_civic e_2018_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00002'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CIVIC E 2018', 'HONDA', 'CIVIC E', 2023, 'ECONOMY', 8500007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_honda_civic e_2018_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00002', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8500007, 'HONDA CIVIC E 2018', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "HONDA CIVIC E 2018", "brand": "HONDA", "model": "CIVIC E", "year": "2018", "original_price": "850000750000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_civic_e_2018/p/g/2026/03/29/10/yIDn4mcdySWdX9Ijwa1w7Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 850000750000, "local_image_url": "/images/cars/MIOTO_honda_civic e_2018_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00003')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9860008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_lux a_2022_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00003'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST LUX A 2022', 'VINFAST', 'LUX A', 2023, 'ECONOMY', 9860008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_lux a_2022_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00003', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9860008, 'VINFAST LUX A 2022', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "VINFAST LUX A 2022", "brand": "VINFAST", "model": "LUX A", "year": "2022", "original_price": "986000866000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_lux_a_2022/p/g/2025/11/30/10/97cbizxQGTpd506duDyMgg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 986000866000, "local_image_url": "/images/cars/MIOTO_vinfast_lux a_2022_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00004')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9300008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_geely_coolray flagship_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00004'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'GEELY COOLRAY FLAGSHIP 2025', 'GEELY', 'COOLRAY FLAGSHIP', 2023, 'ECONOMY', 9300008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_geely_coolray flagship_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00004', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9300008, 'GEELY COOLRAY FLAGSHIP 2025', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "GEELY COOLRAY FLAGSHIP 2025", "brand": "GEELY", "model": "COOLRAY FLAGSHIP", "year": "2025", "original_price": "930000820000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/geely_coolray_flagship_2025/p/g/2025/11/03/17/caWp7AMBqQtrbokwiJxWwg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 930000820000, "local_image_url": "/images/cars/MIOTO_geely_coolray flagship_2025_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00005')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9760008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_camry 2.0e_2016_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00005'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA CAMRY 2.0E 2016', 'TOYOTA', 'CAMRY 2.0E', 2023, 'ECONOMY', 9760008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_camry 2.0e_2016_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00005', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9760008, 'TOYOTA CAMRY 2.0E 2016', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA CAMRY 2.0E 2016", "brand": "TOYOTA", "model": "CAMRY 2.0E", "year": "2016", "original_price": "976000856000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_camry_2.0e_2016/p/g/2025/09/22/10/I9vm8VW82f6mTlE_WLZ_SA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 976000856000, "local_image_url": "/images/cars/MIOTO_toyota_camry 2.0e_2016_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00006')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7790006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mg5_standard 2024_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00006'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 STANDARD 2024', 'MG5', 'STANDARD 2024', 2023, 'ECONOMY', 7790006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mg5_standard 2024_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00006', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7790006, 'MG5 STANDARD 2024', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "MG5 STANDARD 2024", "brand": "MG5", "model": "STANDARD 2024", "year": "2024", "original_price": "779000629000", "location": "Phường 8, Quận Gò Vấp", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mg5_standard_2024/p/g/2026/02/04/18/2-vmNsnVe5o0t04LZUJn7Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 779000629000, "local_image_url": "/images/cars/MIOTO_mg5_standard 2024_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CITY RS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'CITY RS', 'CAR', 'ECONOMY', 7290006, 7290006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00007')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7290006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_honda_city rs_2021_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00007'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CITY RS 2021', 'HONDA', 'CITY RS', 2023, 'ECONOMY', 7290006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_honda_city rs_2021_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00007', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7290006, 'HONDA CITY RS 2021', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HONDA CITY RS 2021", "brand": "HONDA", "model": "CITY RS", "year": "2021", "original_price": "729000639000", "location": "Phường 8, Quận Gò Vấp", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_city_rs_2021/p/g/2026/01/27/14/mD_Jmj91SR_BlN3EXc-REQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 729000639000, "local_image_url": "/images/cars/MIOTO_honda_city rs_2021_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ACCENT 2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'ACCENT 2025', 'CAR', 'ECONOMY', 8090006, 8090006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00008')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8090006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_hyundai_accent 2025_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00008'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI ACCENT 2025', 'HYUNDAI', 'ACCENT 2025', 2023, 'ECONOMY', 8090006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_hyundai_accent 2025_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00008', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8090006, 'HYUNDAI ACCENT 2025', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI ACCENT 2025", "brand": "HYUNDAI", "model": "ACCENT 2025", "year": "2025", "original_price": "809000659000", "location": "Phường 8, Quận Gò Vấp", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_accent_2025/p/g/2025/09/27/07/iN4NlGoweSoftBjL4vl_bw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 809000659000, "local_image_url": "/images/cars/MIOTO_hyundai_accent 2025_2025_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00009')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7500006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_hyundai_accent 2023_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00009'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI ACCENT 2023', 'HYUNDAI', 'ACCENT 2023', 2023, 'ECONOMY', 7500006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_hyundai_accent 2023_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00009', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7500006, 'HYUNDAI ACCENT 2023', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI ACCENT 2023", "brand": "HYUNDAI", "model": "ACCENT 2023", "year": "2023", "original_price": "750000660000", "location": "Phường 8, Quận Gò Vấp", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_accent_2023/p/g/2025/09/24/17/me3xV9fgKSkrRN6nPrTNsQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 750000660000, "local_image_url": "/images/cars/MIOTO_hyundai_accent 2023_2023_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '6 Luxury' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '6 Luxury', 'CAR', 'ECONOMY', 8100006, 8100006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00010')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8100006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_6 luxury_2015_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00010'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 6 Luxury 2015', 'MAZDA', '6 Luxury', 2023, 'ECONOMY', 8100006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_6 luxury_2015_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00010', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8100006, 'MAZDA 6 Luxury 2015', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "MAZDA 6 Luxury 2015", "brand": "MAZDA", "model": "6 Luxury", "year": "2015", "original_price": "810000640000", "location": "Phường 8, Quận Gò Vấp", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mazda_6_luxury_2015/p/g/2025/05/30/07/aJjgM1pTMmGucKCM9aY5TQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 810000640000, "local_image_url": "/images/cars/MIOTO_mazda_6 luxury_2015_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00011')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7500006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_3 deluxe_2019_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00011'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 3 Deluxe 2019', 'MAZDA', '3 Deluxe', 2023, 'ECONOMY', 7500006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_3 deluxe_2019_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00011', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7500006, 'MAZDA 3 Deluxe 2019', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "MAZDA 3 Deluxe 2019", "brand": "MAZDA", "model": "3 Deluxe", "year": "2019", "original_price": "750000610000", "location": "Phường 8, Quận Gò Vấp", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mazda_3_deluxe_2019/p/g/2024/00/16/11/SEkqnmBROfLonxCsi0Su5Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 750000610000, "local_image_url": "/images/cars/MIOTO_mazda_3 deluxe_2019_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00012')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8090007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_raize 2023_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00012'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA RAIZE 2023', 'TOYOTA', 'RAIZE 2023', 2023, 'ECONOMY', 8090007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_raize 2023_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00012', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8090007, 'TOYOTA RAIZE 2023', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "TOYOTA RAIZE 2023", "brand": "TOYOTA", "model": "RAIZE 2023", "year": "2023", "original_price": "809000709000", "location": "Phường 15, Quận Tân Bình", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_raize_2023/p/g/2026/04/23/09/We-rt15AbeQGayrg4IRctg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 809000709000, "local_image_url": "/images/cars/MIOTO_toyota_raize 2023_2023_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00013')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8500007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_3 deluxe_2022_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00013'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 3 Deluxe 2022', 'MAZDA', '3 Deluxe', 2023, 'ECONOMY', 8500007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_3 deluxe_2022_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00013', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8500007, 'MAZDA 3 Deluxe 2022', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "MAZDA 3 Deluxe 2022", "brand": "MAZDA", "model": "3 Deluxe", "year": "2022", "original_price": "850000750000", "location": "Phường 15, Quận Tân Bình", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mazda_3_deluxe_2022/p/g/2025/10/23/11/JunEH-lq5ssxpcQZnWV4Sw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 850000750000, "local_image_url": "/images/cars/MIOTO_mazda_3 deluxe_2022_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00014')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5560004,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_fadil 2020_2020_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00014'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST FADIL 2020', 'VINFAST', 'FADIL 2020', 2023, 'ECONOMY', 5560004, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_fadil 2020_2020_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00014', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5560004, 'VINFAST FADIL 2020', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "VINFAST FADIL 2020", "brand": "VINFAST", "model": "FADIL 2020", "year": "2020", "original_price": "556000466000", "location": "Phường 15, Quận Tân Bình", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_fadil_2020/p/g/2026/00/22/13/qBsBr-HQj62ldI8BYlRmOQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 556000466000, "local_image_url": "/images/cars/MIOTO_vinfast_fadil 2020_2020_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'FADIL 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'FADIL 2022', 'CAR', 'ECONOMY', 6060005, 6060005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00015')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6060005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_fadil 2022_2022_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00015'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST FADIL 2022', 'VINFAST', 'FADIL 2022', 2023, 'ECONOMY', 6060005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_fadil 2022_2022_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00015', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6060005, 'VINFAST FADIL 2022', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "VINFAST FADIL 2022", "brand": "VINFAST", "model": "FADIL 2022", "year": "2022", "original_price": "606000516000", "location": "Phường 15, Quận Tân Bình", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_fadil_2022/p/g/2025/05/26/18/ahWwYOrHYGU6EKpV7ntwXg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 606000516000, "local_image_url": "/images/cars/MIOTO_vinfast_fadil 2022_2022_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00016')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6590005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_ford_ecosport 2018_2018_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00016'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD ECOSPORT 2018', 'FORD', 'ECOSPORT 2018', 2023, 'ECONOMY', 6590005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_ford_ecosport 2018_2018_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00016', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6590005, 'FORD ECOSPORT 2018', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "FORD ECOSPORT 2018", "brand": "FORD", "model": "ECOSPORT 2018", "year": "2018", "original_price": "659000559000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/ford_ecosport_2018/p/g/2026/03/29/20/5_s0eFOsHbothybuYQfkWQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 659000559000, "local_image_url": "/images/cars/MIOTO_ford_ecosport 2018_2018_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XFORCE ULTIMATE' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XFORCE ULTIMATE', 'CAR', 'ECONOMY', 9490008, 9490008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00017')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9490008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_xforce ultimate_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00017'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XFORCE ULTIMATE 2025', 'MITSUBISHI', 'XFORCE ULTIMATE', 2023, 'ECONOMY', 9490008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_xforce ultimate_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00017', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9490008, 'MITSUBISHI XFORCE ULTIMATE 2025', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "MITSUBISHI XFORCE ULTIMATE 2025", "brand": "MITSUBISHI", "model": "XFORCE ULTIMATE", "year": "2025", "original_price": "949000849000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xforce_ultimate_2025/p/g/2026/03/17/10/Ff3c93SrndzHpNypewXPFA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 949000849000, "local_image_url": "/images/cars/MIOTO_mitsubishi_xforce ultimate_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '2 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '2 2019', 'CAR', 'ECONOMY', 5890004, 5890004, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00018')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5890004,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_2 2019_2019_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00018'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 2 2019', 'MAZDA', '2 2019', 2023, 'ECONOMY', 5890004, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_2 2019_2019_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00018', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5890004, 'MAZDA 2 2019', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA 2 2019", "brand": "MAZDA", "model": "2 2019", "year": "2019", "original_price": "589000449000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mazda_2_2019/p/g/2025/09/27/07/tdOXQrZ8M3Ki6_ae035o0w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 589000449000, "local_image_url": "/images/cars/MIOTO_mazda_2 2019_2019_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'AVANZA 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'AVANZA 2024', 'CAR', 'ECONOMY', 8440007, 8440007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00019')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8440007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_avanza 2024_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00019'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA AVANZA 2024', 'TOYOTA', 'AVANZA 2024', 2023, 'ECONOMY', 8440007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_avanza 2024_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00019', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8440007, 'TOYOTA AVANZA 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA AVANZA 2024", "brand": "TOYOTA", "model": "AVANZA 2024", "year": "2024", "original_price": "844000754000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_avanza_2024/p/g/2025/09/13/15/3YIwNA97GTUQb9-NzJUfLw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 844000754000, "local_image_url": "/images/cars/MIOTO_toyota_avanza 2024_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF3 2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF3 2025', 'CAR', 'ECONOMY', 6310005, 6310005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00020')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6310005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_vf3 2025_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00020'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF3 2025', 'VINFAST', 'VF3 2025', 2023, 'ECONOMY', 6310005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_vf3 2025_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00020', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6310005, 'VINFAST VF3 2025', 'Phường 14, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF3 2025", "brand": "VINFAST", "model": "VF3 2025", "year": "2025", "original_price": "631000576000", "location": "Phường 14, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf3_2025/p/g/2025/06/02/12/1ahsqoMffGJo1HMMul3ksA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 631000576000, "local_image_url": "/images/cars/MIOTO_vinfast_vf3 2025_2025_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00021')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9640008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_suzuki_xl7 2020_2020_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00021'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI XL7 2020', 'SUZUKI', 'XL7 2020', 2023, 'ECONOMY', 9640008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_suzuki_xl7 2020_2020_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00021', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9640008, 'SUZUKI XL7 2020', 'Phường 07, Quận Phú Nhuận', '{"source": "MIOTO", "name": "SUZUKI XL7 2020", "brand": "SUZUKI", "model": "XL7 2020", "year": "2020", "original_price": "964000844000", "location": "Phường 07, Quận Phú Nhuận", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/suzuki_xl7_2020/p/g/2026/03/23/23/ODY7O7WolNKmCd5-8gZgFA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 964000844000, "local_image_url": "/images/cars/MIOTO_suzuki_xl7 2020_2020_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00022')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9700008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_xpander 2021_2021_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00022'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2021', 'MITSUBISHI', 'XPANDER 2021', 2023, 'ECONOMY', 9700008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_xpander 2021_2021_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00022', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9700008, 'MITSUBISHI XPANDER 2021', 'Phường 15, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2021", "brand": "MITSUBISHI", "model": "XPANDER 2021", "year": "2021", "original_price": "970000850000", "location": "Phường 15, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_2021/p/g/2024/00/26/10/1YnuDhXWF1OyH4RxO7CMzg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 970000850000, "local_image_url": "/images/cars/MIOTO_mitsubishi_xpander 2021_2021_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VELOZ CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'VELOZ CROSS', 'CAR', 'ECONOMY', 1205000, 1205000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00023')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1205000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_veloz cross_2026_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00023'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA VELOZ CROSS 2026', 'TOYOTA', 'VELOZ CROSS', 2023, 'ECONOMY', 1205000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_veloz cross_2026_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00023', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1205000, 'TOYOTA VELOZ CROSS 2026', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA VELOZ CROSS 2026", "brand": "TOYOTA", "model": "VELOZ CROSS", "year": "2026", "original_price": "12050001085000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_veloz_cross_2026/p/g/2026/03/16/14/L46Y3E0wWA_Iy38olZkajQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12050001085000, "local_image_url": "/images/cars/MIOTO_toyota_veloz cross_2026_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00024')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5300004,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_chevrolet_spark 2016_2016_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00024'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'CHEVROLET SPARK 2016', 'CHEVROLET', 'SPARK 2016', 2023, 'ECONOMY', 5300004, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_chevrolet_spark 2016_2016_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00024', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5300004, 'CHEVROLET SPARK 2016', 'Phường 22, Quận Bình Thạnh', '{"source": "MIOTO", "name": "CHEVROLET SPARK 2016", "brand": "CHEVROLET", "model": "SPARK 2016", "year": "2016", "original_price": "530000450000", "location": "Phường 22, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/chevrolet_spark_2016/p/g/2026/00/05/15/zNeIGSg73oZ45JdK0NY6aQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 530000450000, "local_image_url": "/images/cars/MIOTO_chevrolet_spark 2016_2016_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00025')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1550000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_sedona luxury_2021_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00025'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA SEDONA LUXURY 2021', 'KIA', 'SEDONA LUXURY', 2023, 'ECONOMY', 1550000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_sedona luxury_2021_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00025', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1550000, 'KIA SEDONA LUXURY 2021', 'Phường Đa Kao, Quận 1', '{"source": "MIOTO", "name": "KIA SEDONA LUXURY 2021", "brand": "KIA", "model": "SEDONA LUXURY", "year": "2021", "original_price": "15500001430000", "location": "Phường Đa Kao, Quận 1", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_sedona_luxury_2021/p/g/2026/04/19/14/Sypl2bnH2qLUvY7Og_c4mA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 15500001430000, "local_image_url": "/images/cars/MIOTO_kia_sedona luxury_2021_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00026')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1089000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_vf6 plus_2026_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00026'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF6 PLUS 2026', 'VINFAST', 'VF6 PLUS', 2023, 'ECONOMY', 1089000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_vf6 plus_2026_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00026', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1089000, 'VINFAST VF6 PLUS 2026', 'Phường 24, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF6 PLUS 2026", "brand": "VINFAST", "model": "VF6 PLUS", "year": "2026", "original_price": "10890001009000", "location": "Phường 24, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf6_plus_2026/p/g/2026/01/10/21/bqT-hCNnhoexoZQvJpDC0g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 10890001009000, "local_image_url": "/images/cars/MIOTO_vinfast_vf6 plus_2026_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF3 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF3 2024', 'CAR', 'ECONOMY', 6310005, 6310005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00027')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6310005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_vf3 2024_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00027'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF3 2024', 'VINFAST', 'VF3 2024', 2023, 'ECONOMY', 6310005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_vf3 2024_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00027', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6310005, 'VINFAST VF3 2024', 'Phường 05, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF3 2024", "brand": "VINFAST", "model": "VF3 2024", "year": "2024", "original_price": "631000576000", "location": "Phường 05, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf3_2024/p/g/2025/02/14/15/hh2tPoxR5gBOTQXEn_Prsg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 631000576000, "local_image_url": "/images/cars/MIOTO_vinfast_vf3 2024_2024_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00028')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9620008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_innova 2019_2019_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00028'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA INNOVA 2019', 'TOYOTA', 'INNOVA 2019', 2023, 'ECONOMY', 9620008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_innova 2019_2019_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00028', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9620008, 'TOYOTA INNOVA 2019', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2019", "brand": "TOYOTA", "model": "INNOVA 2019", "year": "2019", "original_price": "962000842000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_innova_2019/p/g/2025/01/11/16/S2iZd1bwTm-xz4ZLQuIxTQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 962000842000, "local_image_url": "/images/cars/MIOTO_toyota_innova 2019_2019_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00029')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1148000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_xpander cross_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00029'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER CROSS 2023', 'MITSUBISHI', 'XPANDER CROSS', 2023, 'ECONOMY', 1148000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_xpander cross_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00029', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1148000, 'MITSUBISHI XPANDER CROSS 2023', 'Phường Đa Kao, Quận 1', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER CROSS 2023", "brand": "MITSUBISHI", "model": "XPANDER CROSS", "year": "2023", "original_price": "11480001028000", "location": "Phường Đa Kao, Quận 1", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_cross_2023/p/g/2024/04/16/11/0diL2az9yFx7Rt694chPJQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11480001028000, "local_image_url": "/images/cars/MIOTO_mitsubishi_xpander cross_2023_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00030')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8380007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_innova 2015_2015_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00030'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA INNOVA 2015', 'TOYOTA', 'INNOVA 2015', 2023, 'ECONOMY', 8380007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_innova 2015_2015_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00030', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8380007, 'TOYOTA INNOVA 2015', 'Phường 11, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2015", "brand": "TOYOTA", "model": "INNOVA 2015", "year": "2015", "original_price": "838000718000", "location": "Phường 11, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_innova_2015/p/g/2025/00/03/12/1Dz7-UR4netnSFV22bJp-g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 838000718000, "local_image_url": "/images/cars/MIOTO_toyota_innova 2015_2015_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'FADIL 2021' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'FADIL 2021', 'CAR', 'ECONOMY', 7120006, 7120006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00031')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7120006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_fadil 2021_2021_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00031'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST FADIL 2021', 'VINFAST', 'FADIL 2021', 2023, 'ECONOMY', 7120006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_fadil 2021_2021_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00031', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7120006, 'VINFAST FADIL 2021', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST FADIL 2021", "brand": "VINFAST", "model": "FADIL 2021", "year": "2021", "original_price": "712000632000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_fadil_2021/p/g/2025/09/23/23/7CVSbESrkkyUcqlnrrGEsQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 712000632000, "local_image_url": "/images/cars/MIOTO_vinfast_fadil 2021_2021_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF3 2026' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF3 2026', 'CAR', 'ECONOMY', 6540005, 6540005, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00032')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6540005,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_vf3 2026_2026_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00032'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF3 2026', 'VINFAST', 'VF3 2026', 2023, 'ECONOMY', 6540005, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_vf3 2026_2026_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00032', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6540005, 'VINFAST VF3 2026', 'Phường 07, Quận Phú Nhuận', '{"source": "MIOTO", "name": "VINFAST VF3 2026", "brand": "VINFAST", "model": "VF3 2026", "year": "2026", "original_price": "654000597000", "location": "Phường 07, Quận Phú Nhuận", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf3_2026/p/g/2026/05/10/15/iUCkQionMyVHNtjLoOYE7w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 654000597000, "local_image_url": "/images/cars/MIOTO_vinfast_vf3 2026_2026_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00033')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1182000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_honda_crv g_2018_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00033'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CRV G 2018', 'HONDA', 'CRV G', 2023, 'ECONOMY', 1182000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_honda_crv g_2018_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00033', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1182000, 'HONDA CRV G 2018', 'Phường Bến Nghé, Quận 1', '{"source": "MIOTO", "name": "HONDA CRV G 2018", "brand": "HONDA", "model": "CRV G", "year": "2018", "original_price": "11820001062000", "location": "Phường Bến Nghé, Quận 1", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_crv_g_2018/p/g/2026/01/05/05/hOCJ44honJTABQRbEp57mA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11820001062000, "local_image_url": "/images/cars/MIOTO_honda_crv g_2018_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00034')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1068000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_isuzu_mux 4x2_2016_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00034'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'ISUZU MUX 4X2 2016', 'ISUZU', 'MUX 4X2', 2023, 'ECONOMY', 1068000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_isuzu_mux 4x2_2016_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00034', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1068000, 'ISUZU MUX 4X2 2016', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "ISUZU MUX 4X2 2016", "brand": "ISUZU", "model": "MUX 4X2", "year": "2016", "original_price": "1068000948000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/isuzu_mux_4x2_2016/p/g/2026/00/16/11/R-JTuuyK6Sajt0wORYFJ8g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1068000948000, "local_image_url": "/images/cars/MIOTO_isuzu_mux 4x2_2016_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00035')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1364000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_limo green_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00035'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST LIMO GREEN 2025', 'VINFAST', 'LIMO GREEN', 2023, 'ECONOMY', 1364000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_limo green_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00035', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1364000, 'VINFAST LIMO GREEN 2025', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST LIMO GREEN 2025", "brand": "VINFAST", "model": "LIMO GREEN", "year": "2025", "original_price": "13640001284000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_limo_green_2025/p/g/2026/03/27/20/DTaeGWvUARRukkQp_yTr3Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 13640001284000, "local_image_url": "/images/cars/MIOTO_vinfast_limo green_2025_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00036')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1033000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_xpander 2023_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00036'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2023', 'MITSUBISHI', 'XPANDER 2023', 2023, 'ECONOMY', 1033000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_xpander 2023_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00036', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000, 'MITSUBISHI XPANDER 2023', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2023", "brand": "MITSUBISHI", "model": "XPANDER 2023", "year": "2023", "original_price": "1033000913000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_2023/p/g/2025/04/09/12/6IGkTyBnRzvedOZvycZrkQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000913000, "local_image_url": "/images/cars/MIOTO_mitsubishi_xpander 2023_2023_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00037')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 2049000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_carnival premium_2022_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00037'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CARNIVAL PREMIUM 2022', 'KIA', 'CARNIVAL PREMIUM', 2023, 'ECONOMY', 2049000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_carnival premium_2022_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00037', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 2049000, 'KIA CARNIVAL PREMIUM 2022', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "KIA CARNIVAL PREMIUM 2022", "brand": "KIA", "model": "CARNIVAL PREMIUM", "year": "2022", "original_price": "20490001929000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_carnival_premium_2022/p/g/2024/03/21/17/c4WqnlJycm9Y8Q9ts6Dpxg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 20490001929000, "local_image_url": "/images/cars/MIOTO_kia_carnival premium_2022_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CARENS 2023' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'CARENS 2023', 'CAR', 'ECONOMY', 1154000, 1154000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00038')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1154000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_carens 2023_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00038'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CARENS 2023', 'KIA', 'CARENS 2023', 2023, 'ECONOMY', 1154000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_carens 2023_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00038', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1154000, 'KIA CARENS 2023', 'Phường 22, Quận Bình Thạnh', '{"source": "MIOTO", "name": "KIA CARENS 2023", "brand": "KIA", "model": "CARENS 2023", "year": "2023", "original_price": "11540001034000", "location": "Phường 22, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_carens_2023/p/g/2024/09/18/11/UDwGKULnVR3e2Q3_VCQeJw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11540001034000, "local_image_url": "/images/cars/MIOTO_kia_carens 2023_2023_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'INNOVA 2018' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'INNOVA 2018', 'CAR', 'ECONOMY', 9090007, 9090007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00039')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9090007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_innova 2018_2018_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00039'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA INNOVA 2018', 'TOYOTA', 'INNOVA 2018', 2023, 'ECONOMY', 9090007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_innova 2018_2018_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00039', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9090007, 'TOYOTA INNOVA 2018', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2018", "brand": "TOYOTA", "model": "INNOVA 2018", "year": "2018", "original_price": "909000789000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_innova_2018/p/g/2026/04/22/10/CzF0gpOkogQYVLR3jD6Bog.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 909000789000, "local_image_url": "/images/cars/MIOTO_toyota_innova 2018_2018_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER CROSS', 'CAR', 'ECONOMY', 1147000, 1147000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00040')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1147000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_xpander cross_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00040'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER CROSS 2025', 'MITSUBISHI', 'XPANDER CROSS', 2023, 'ECONOMY', 1147000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_xpander cross_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00040', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1147000, 'MITSUBISHI XPANDER CROSS 2025', 'Phường 01, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER CROSS 2025", "brand": "MITSUBISHI", "model": "XPANDER CROSS", "year": "2025", "original_price": "11470001027000", "location": "Phường 01, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_cross_2025/p/g/2025/06/13/10/LsS_pgutzlalLc1VRED16w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11470001027000, "local_image_url": "/images/cars/MIOTO_mitsubishi_xpander cross_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ECOSPORT 2015' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'ECOSPORT 2015', 'CAR', 'ECONOMY', 8040006, 8040006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00041')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8040006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_ford_ecosport 2015_2015_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00041'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD ECOSPORT 2015', 'FORD', 'ECOSPORT 2015', 2023, 'ECONOMY', 8040006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_ford_ecosport 2015_2015_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00041', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8040006, 'FORD ECOSPORT 2015', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "FORD ECOSPORT 2015", "brand": "FORD", "model": "ECOSPORT 2015", "year": "2015", "original_price": "804000654000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/ford_ecosport_2015/p/g/2026/05/16/15/mQNc20Jdz3kYqaaJSv2JAA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 804000654000, "local_image_url": "/images/cars/MIOTO_ford_ecosport 2015_2015_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2022', 'CAR', 'ECONOMY', 1148000, 1148000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00042')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1148000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_xpander 2022_2022_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00042'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2022', 'MITSUBISHI', 'XPANDER 2022', 2023, 'ECONOMY', 1148000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_xpander 2022_2022_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00042', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1148000, 'MITSUBISHI XPANDER 2022', 'Phường Tân Định, Quận 1', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2022", "brand": "MITSUBISHI", "model": "XPANDER 2022", "year": "2022", "original_price": "11480001028000", "location": "Phường Tân Định, Quận 1", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_2022/p/g/2023/03/09/15/NImZWRnfAxpwjyhktLs70Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11480001028000, "local_image_url": "/images/cars/MIOTO_mitsubishi_xpander 2022_2022_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF7 PLUS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF7 PLUS', 'CAR', 'ECONOMY', 1365000, 1365000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00043')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1365000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_vf7 plus_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00043'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF7 PLUS 2024', 'VINFAST', 'VF7 PLUS', 2023, 'ECONOMY', 1365000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_vf7 plus_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00043', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1365000, 'VINFAST VF7 PLUS 2024', 'Phường 08, Quận 3', '{"source": "MIOTO", "name": "VINFAST VF7 PLUS 2024", "brand": "VINFAST", "model": "VF7 PLUS", "year": "2024", "original_price": "13650001285000", "location": "Phường 08, Quận 3", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf7_plus_2024/p/g/2025/07/08/13/XSeS7CzqYzw3vN3A7JAOjQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 13650001285000, "local_image_url": "/images/cars/MIOTO_vinfast_vf7 plus_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CARENS 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'CARENS 2024', 'CAR', 'ECONOMY', 1182000, 1182000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00044')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1182000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_carens 2024_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00044'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CARENS 2024', 'KIA', 'CARENS 2024', 2023, 'ECONOMY', 1182000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_carens 2024_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00044', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1182000, 'KIA CARENS 2024', 'Phường 07, Quận Phú Nhuận', '{"source": "MIOTO", "name": "KIA CARENS 2024", "brand": "KIA", "model": "CARENS 2024", "year": "2024", "original_price": "11820001062000", "location": "Phường 07, Quận Phú Nhuận", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_carens_2024/p/g/2024/10/03/09/rdcyNZDuy945Nhj3XEx7wg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11820001062000, "local_image_url": "/images/cars/MIOTO_kia_carens 2024_2024_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00045')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8610007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_xpander 2020_2020_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00045'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2020', 'MITSUBISHI', 'XPANDER 2020', 2023, 'ECONOMY', 8610007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_xpander 2020_2020_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00045', 'CAR')
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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00046')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1275000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_veloz cross_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00046'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA VELOZ CROSS 2025', 'TOYOTA', 'VELOZ CROSS', 2023, 'ECONOMY', 1275000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_veloz cross_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00046', 'CAR')
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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00047')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 998000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mg5_luxury 2023_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00047'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 LUXURY 2023', 'MG5', 'LUXURY 2023', 2023, 'ECONOMY', 998000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mg5_luxury 2023_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00047', 'CAR')
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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00048')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1147000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_hyundai_creta luxury_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00048'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI CRETA LUXURY 2025', 'HYUNDAI', 'CRETA LUXURY', 2023, 'ECONOMY', 1147000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_hyundai_creta luxury_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00048', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1147000, 'HYUNDAI CRETA LUXURY 2025', 'Phường 25, Quận Bình Thạnh', '{"source": "MIOTO", "name": "HYUNDAI CRETA LUXURY 2025", "brand": "HYUNDAI", "model": "CRETA LUXURY", "year": "2025", "original_price": "1147000", "location": "Phường 25, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_creta_luxury_2025/p/g/2026/01/19/22/YeqKSNj6QQ7ggO8hj6DeDQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1147000, "local_image_url": "/images/cars/MIOTO_hyundai_creta luxury_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'HRV G' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'HRV G', 'CAR', 'ECONOMY', 1263000, 1263000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00049')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1263000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_honda_hrv g_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00049'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA HRV G 2024', 'HONDA', 'HRV G', 2023, 'ECONOMY', 1263000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_honda_hrv g_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00049', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1263000, 'HONDA HRV G 2024', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "HONDA HRV G 2024", "brand": "HONDA", "model": "HRV G", "year": "2024", "original_price": "1263000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_hrv_g_2024/p/g/2026/04/28/10/D6cVbGIWKKWPLsRxiNKi_w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1263000, "local_image_url": "/images/cars/MIOTO_honda_hrv g_2024_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00050')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 850000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_ford_ecosport 2017_2017_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00050'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD ECOSPORT 2017', 'FORD', 'ECOSPORT 2017', 2023, 'ECONOMY', 850000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_ford_ecosport 2017_2017_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00050', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 850000, 'FORD ECOSPORT 2017', 'Phường 08, Quận 3', '{"source": "MIOTO", "name": "FORD ECOSPORT 2017", "brand": "FORD", "model": "ECOSPORT 2017", "year": "2017", "original_price": "850000", "location": "Phường 08, Quận 3", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/ford_ecosport_2017/p/g/2025/07/08/19/Zn8KZ1mOVwJHT_06hGd6ug.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 850000, "local_image_url": "/images/cars/MIOTO_ford_ecosport 2017_2017_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '3 HATCHBACK' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '3 HATCHBACK', 'CAR', 'ECONOMY', 976000, 976000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00051')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 976000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_3 hatchback_2022_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00051'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 3 HATCHBACK 2022', 'MAZDA', '3 HATCHBACK', 2023, 'ECONOMY', 976000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_3 hatchback_2022_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00051', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 976000, 'MAZDA 3 HATCHBACK 2022', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MAZDA 3 HATCHBACK 2022", "brand": "MAZDA", "model": "3 HATCHBACK", "year": "2022", "original_price": "976000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mazda_3_hatchback_2022/p/g/2024/09/17/10/il9QXi1a7uBSXO2NFl5rtQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 976000, "local_image_url": "/images/cars/MIOTO_mazda_3 hatchback_2022_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00052')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1288000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_honda_civic rs_2020_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00052'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CIVIC RS 2020', 'HONDA', 'CIVIC RS', 2023, 'ECONOMY', 1288000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_honda_civic rs_2020_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00052', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1288000, 'HONDA CIVIC RS 2020', 'Phường Bến Nghé, Quận 1', '{"source": "MIOTO", "name": "HONDA CIVIC RS 2020", "brand": "HONDA", "model": "CIVIC RS", "year": "2020", "original_price": "1288000", "location": "Phường Bến Nghé, Quận 1", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_civic_rs_2020/p/g/2024/07/11/21/_7ctTWixrbhCqu9nLUjrBg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1288000, "local_image_url": "/images/cars/MIOTO_honda_civic rs_2020_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00053')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1597000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_subaru_forester 2.0i-s_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00053'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUBARU FORESTER 2.0i-S Eyesight 2024', 'SUBARU', 'FORESTER 2.0i-S', 2023, 'ECONOMY', 1597000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_subaru_forester 2.0i-s_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00053', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1597000, 'SUBARU FORESTER 2.0i-S Eyesight 2024', 'Phường 11, Quận Bình Thạnh', '{"source": "MIOTO", "name": "SUBARU FORESTER 2.0i-S Eyesight 2024", "brand": "SUBARU", "model": "FORESTER 2.0i-S", "year": "2024", "original_price": "1597000", "location": "Phường 11, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/subaru_forester_2.0i-s_eyesight_2024/p/g/2026/05/09/15/xoPN3eQof3zsSzWjfiLDjg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1597000, "local_image_url": "/images/cars/MIOTO_subaru_forester 2.0i-s_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CX5 Deluxe' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), 'CX5 Deluxe', 'CAR', 'ECONOMY', 1297000, 1297000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00054')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1297000,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA CX5 Deluxe 2025', 'MAZDA', 'CX5 Deluxe', 2023, 'ECONOMY', 1297000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00054', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1297000, 'MAZDA CX5 Deluxe 2025', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MAZDA CX5 Deluxe 2025", "brand": "MAZDA", "model": "CX5 Deluxe", "year": "2025", "original_price": "1297000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/rtjhd10InAq7Ga7i9UldEw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1297000, "local_image_url": ""}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00055')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 700000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_chevrolet_cruze 2018_2018_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00055'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'CHEVROLET CRUZE 2018', 'CHEVROLET', 'CRUZE 2018', 2023, 'ECONOMY', 700000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_chevrolet_cruze 2018_2018_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00055', 'CAR')
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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00056')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1112000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_corolla cross_2020_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00056'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA COROLLA CROSS G 2020', 'TOYOTA', 'COROLLA CROSS', 2023, 'ECONOMY', 1112000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_corolla cross_2020_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00056', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1112000, 'TOYOTA COROLLA CROSS G 2020', 'Phường 05, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA COROLLA CROSS G 2020", "brand": "TOYOTA", "model": "COROLLA CROSS", "year": "2020", "original_price": "1112000", "location": "Phường 05, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_corolla_cross_g_2020/p/g/2024/02/22/11/JpG4c0R-Vu6Z73SBZzJ7xg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1112000, "local_image_url": "/images/cars/MIOTO_toyota_corolla cross_2020_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '3 LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '3 LUXURY', 'CAR', 'ECONOMY', 1297000, 1297000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00057')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1297000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_3 luxury_2026_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00057'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 3 LUXURY 2026', 'MAZDA', '3 LUXURY', 2023, 'ECONOMY', 1297000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_3 luxury_2026_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00057', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1297000, 'MAZDA 3 LUXURY 2026', 'Phường Tân Định, Quận 1', '{"source": "MIOTO", "name": "MAZDA 3 LUXURY 2026", "brand": "MAZDA", "model": "3 LUXURY", "year": "2026", "original_price": "1297000", "location": "Phường Tân Định, Quận 1", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mazda_3_luxury_2026/p/g/2026/02/07/16/agHt0cbmafPWgEFZZJSFbw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1297000, "local_image_url": "/images/cars/MIOTO_mazda_3 luxury_2026_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CX5 PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), 'CX5 PREMIUM', 'CAR', 'ECONOMY', 1573000, 1573000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00058')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1573000,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA CX5 PREMIUM 2024', 'MAZDA', 'CX5 PREMIUM', 2023, 'ECONOMY', 1573000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00058', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1573000, 'MAZDA CX5 PREMIUM 2024', 'Phường 15, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MAZDA CX5 PREMIUM 2024", "brand": "MAZDA", "model": "CX5 PREMIUM", "year": "2024", "original_price": "1573000", "location": "Phường 15, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/HhgER1avNVXfx9SjFOojyw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1573000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'BMW')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'BMW', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '520i 2012' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'BMW'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'BMW'), '520i 2012', 'CAR', 'ECONOMY', 2169000, 2169000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00059')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 2169000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_bmw_520i 2012_2012_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00059'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'BMW 520i 2012', 'BMW', '520i 2012', 2023, 'ECONOMY', 2169000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_bmw_520i 2012_2012_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00059', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 2169000, 'BMW 520i 2012', 'Phường 03, Quận Bình Thạnh', '{"source": "MIOTO", "name": "BMW 520i 2012", "brand": "BMW", "model": "520i 2012", "year": "2012", "original_price": "2169000", "location": "Phường 03, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/bmw_520i_2012/p/g/2026/03/04/23/rlnxl42zo8QtgaHVKw3-Cg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 2169000, "local_image_url": "/images/cars/MIOTO_bmw_520i 2012_2012_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CRETA 2023' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'CRETA 2023', 'CAR', 'ECONOMY', 1033000, 1033000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00060')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1033000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_hyundai_creta 2023_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00060'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI CRETA 2023', 'HYUNDAI', 'CRETA 2023', 2023, 'ECONOMY', 1033000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_hyundai_creta 2023_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00060', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000, 'HYUNDAI CRETA 2023', 'Phường 24, Quận Bình Thạnh', '{"source": "MIOTO", "name": "HYUNDAI CRETA 2023", "brand": "HYUNDAI", "model": "CRETA 2023", "year": "2023", "original_price": "1033000", "location": "Phường 24, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_creta_2023/p/g/2025/10/01/20/Cf27FPbTFPv11iSxtgHkHw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000, "local_image_url": "/images/cars/MIOTO_hyundai_creta 2023_2023_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CITY RS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'CITY RS', 'CAR', 'ECONOMY', 946000, 946000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00061')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 946000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_honda_city rs_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00061'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CITY RS 2025', 'HONDA', 'CITY RS', 2023, 'ECONOMY', 946000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_honda_city rs_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00061', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 946000, 'HONDA CITY RS 2025', 'Phường Tân Định, Quận 1', '{"source": "MIOTO", "name": "HONDA CITY RS 2025", "brand": "HONDA", "model": "CITY RS", "year": "2025", "original_price": "946000", "location": "Phường Tân Định, Quận 1", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_city_rs_2025/p/g/2026/01/02/06/F1QruZSdO_O8QWAdKeT2gA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 946000, "local_image_url": "/images/cars/MIOTO_honda_city rs_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'BMW')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'BMW', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'X6 2009' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'BMW'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'BMW'), 'X6 2009', 'CAR', 'ECONOMY', 1579000, 1579000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00062')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1579000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_bmw_x6 2009_2009_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00062'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'BMW X6 2009', 'BMW', 'X6 2009', 2023, 'ECONOMY', 1579000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_bmw_x6 2009_2009_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00062', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1579000, 'BMW X6 2009', 'Phường 01, Quận Bình Thạnh', '{"source": "MIOTO", "name": "BMW X6 2009", "brand": "BMW", "model": "X6 2009", "year": "2009", "original_price": "1579000", "location": "Phường 01, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/bmw_x6_2009/p/g/2024/07/30/23/nXIh0FTYkFLjY7-XohE6ZQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1579000, "local_image_url": "/images/cars/MIOTO_bmw_x6 2009_2009_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '2 2026' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '2 2026', 'CAR', 'ECONOMY', 872000, 872000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00063')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 872000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_2 2026_2026_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00063'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 2 2026', 'MAZDA', '2 2026', 2023, 'ECONOMY', 872000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_2 2026_2026_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00063', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 872000, 'MAZDA 2 2026', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MAZDA 2 2026", "brand": "MAZDA", "model": "2 2026", "year": "2026", "original_price": "872000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mazda_2_2026/p/g/2026/01/14/18/BCqmaT2e3182yB3wALei-Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 872000, "local_image_url": "/images/cars/MIOTO_mazda_2 2026_2026_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00064')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1033000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_hyundai_stargazer premium_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00064'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI STARGAZER PREMIUM 2023', 'HYUNDAI', 'STARGAZER PREMIUM', 2023, 'ECONOMY', 1033000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_hyundai_stargazer premium_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00064', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000, 'HYUNDAI STARGAZER PREMIUM 2023', 'Phường Đa Kao, Quận 1', '{"source": "MIOTO", "name": "HYUNDAI STARGAZER PREMIUM 2023", "brand": "HYUNDAI", "model": "STARGAZER PREMIUM", "year": "2023", "original_price": "1033000913000", "location": "Phường Đa Kao, Quận 1", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_stargazer_premium_2023/p/g/2026/04/18/13/L4QmnhrmAiqGYQVxrPOPcQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000913000, "local_image_url": "/images/cars/MIOTO_hyundai_stargazer premium_2023_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'RONDO 2018' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'RONDO 2018', 'CAR', 'ECONOMY', 7460006, 7460006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00065')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7460006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_rondo 2018_2018_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00065'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA RONDO 2018', 'KIA', 'RONDO 2018', 2023, 'ECONOMY', 7460006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_rondo 2018_2018_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00065', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7460006, 'KIA RONDO 2018', 'Phường 05, Quận Phú Nhuận', '{"source": "MIOTO", "name": "KIA RONDO 2018", "brand": "KIA", "model": "RONDO 2018", "year": "2018", "original_price": "746000626000", "location": "Phường 05, Quận Phú Nhuận", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_rondo_2018/p/g/2023/05/26/21/PMIDllIHi3pOBqYWAcmWhA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 746000626000, "local_image_url": "/images/cars/MIOTO_kia_rondo 2018_2018_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF9 ECO' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF9 ECO', 'CAR', 'ECONOMY', 1835000, 1835000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00066')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1835000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_vf9 eco_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00066'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF9 ECO 2025', 'VINFAST', 'VF9 ECO', 2023, 'ECONOMY', 1835000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_vf9 eco_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00066', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1835000, 'VINFAST VF9 ECO 2025', 'Phường 21, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF9 ECO 2025", "brand": "VINFAST", "model": "VF9 ECO", "year": "2025", "original_price": "18350001755000", "location": "Phường 21, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf9_eco_2025/p/g/2025/10/26/11/2IdVKH-PEHwuMEnEDr6A0g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 18350001755000, "local_image_url": "/images/cars/MIOTO_vinfast_vf9 eco_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'OUTLANDER Premium' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'OUTLANDER Premium', 'CAR', 'ECONOMY', 1013000, 1013000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00067')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1013000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_outlander premium_2019_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00067'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI OUTLANDER Premium 2019', 'MITSUBISHI', 'OUTLANDER Premium', 2023, 'ECONOMY', 1013000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_outlander premium_2019_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00067', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1013000, 'MITSUBISHI OUTLANDER Premium 2019', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI OUTLANDER Premium 2019", "brand": "MITSUBISHI", "model": "OUTLANDER Premium", "year": "2019", "original_price": "1013000893000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_outlander_premium_2019/p/g/2026/03/08/18/lbvKJg3VRP8CWaOZR6FOLw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1013000893000, "local_image_url": "/images/cars/MIOTO_mitsubishi_outlander premium_2019_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER 2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER 2025', 'CAR', 'ECONOMY', 1148000, 1148000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00068')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1148000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_xpander 2025_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00068'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER 2025', 'MITSUBISHI', 'XPANDER 2025', 2023, 'ECONOMY', 1148000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_xpander 2025_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00068', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1148000, 'MITSUBISHI XPANDER 2025', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2025", "brand": "MITSUBISHI", "model": "XPANDER 2025", "year": "2025", "original_price": "11480001028000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_2025/p/g/2026/01/25/23/yMDZZJI9LzbaH08a3Y4omQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11480001028000, "local_image_url": "/images/cars/MIOTO_mitsubishi_xpander 2025_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF5 2025' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF5 2025', 'CAR', 'ECONOMY', 9170008, 9170008, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00069')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9170008,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_vf5 2025_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00069'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF5 2025', 'VINFAST', 'VF5 2025', 2023, 'ECONOMY', 9170008, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_vf5 2025_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00069', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9170008, 'VINFAST VF5 2025', 'Phường 02, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF5 2025", "brand": "VINFAST", "model": "VF5 2025", "year": "2025", "original_price": "917000837000", "location": "Phường 02, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf5_2025/p/g/2026/01/10/15/r001IIeYxFGGPYeRjTmmvw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 917000837000, "local_image_url": "/images/cars/MIOTO_vinfast_vf5 2025_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XL7 2021' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'XL7 2021', 'CAR', 'ECONOMY', 8610007, 8610007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00070')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8610007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_suzuki_xl7 2021_2021_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00070'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI XL7 2021', 'SUZUKI', 'XL7 2021', 2023, 'ECONOMY', 8610007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_suzuki_xl7 2021_2021_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00070', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8610007, 'SUZUKI XL7 2021', 'Phường Bến Nghé, Quận 1', '{"source": "MIOTO", "name": "SUZUKI XL7 2021", "brand": "SUZUKI", "model": "XL7 2021", "year": "2021", "original_price": "861000741000", "location": "Phường Bến Nghé, Quận 1", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/suzuki_xl7_2021/p/g/2025/04/21/13/Z3r5zvtOZMFxNhJprjVx0A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 861000741000, "local_image_url": "/images/cars/MIOTO_suzuki_xl7 2021_2021_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VELOZ CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'VELOZ CROSS', 'CAR', 'ECONOMY', 1033000, 1033000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00071')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1033000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_veloz cross_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00071'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA VELOZ CROSS 2024', 'TOYOTA', 'VELOZ CROSS', 2023, 'ECONOMY', 1033000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_veloz cross_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00071', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000, 'TOYOTA VELOZ CROSS 2024', 'Phường 03, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA VELOZ CROSS 2024", "brand": "TOYOTA", "model": "VELOZ CROSS", "year": "2024", "original_price": "1033000913000", "location": "Phường 03, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_veloz_cross_2024/p/g/2025/05/23/22/itojWVJlZCrozW2CvH14yw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000913000, "local_image_url": "/images/cars/MIOTO_toyota_veloz cross_2024_mioto.jpg"}');


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


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00072')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1033000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_hyundai_stargazer premium_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00072'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI STARGAZER PREMIUM 2024', 'HYUNDAI', 'STARGAZER PREMIUM', 2023, 'ECONOMY', 1033000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_hyundai_stargazer premium_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00072', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000, 'HYUNDAI STARGAZER PREMIUM 2024', 'Phường 21, Quận Bình Thạnh', '{"source": "MIOTO", "name": "HYUNDAI STARGAZER PREMIUM 2024", "brand": "HYUNDAI", "model": "STARGAZER PREMIUM", "year": "2024", "original_price": "1033000913000", "location": "Phường 21, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_stargazer_premium_2024/p/g/2025/11/26/07/PlrvQhu8pO8Z3JYBBhq0rg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000913000, "local_image_url": "/images/cars/MIOTO_hyundai_stargazer premium_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'RUSH 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'RUSH 2019', 'CAR', 'ECONOMY', 8040006, 8040006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00073')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8040006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_rush 2019_2019_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00073'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA RUSH 2019', 'TOYOTA', 'RUSH 2019', 2023, 'ECONOMY', 8040006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_rush 2019_2019_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00073', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8040006, 'TOYOTA RUSH 2019', 'Phường 14, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA RUSH 2019", "brand": "TOYOTA", "model": "RUSH 2019", "year": "2019", "original_price": "804000684000", "location": "Phường 14, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_rush_2019/p/g/2024/02/07/10/qjI11sik0GUHGEqvi2WrKw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 804000684000, "local_image_url": "/images/cars/MIOTO_toyota_rush 2019_2019_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'OUTLANDER 2020' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'OUTLANDER 2020', 'CAR', 'ECONOMY', 1320000, 1320000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00074')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1320000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_outlander 2020_2020_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00074'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI OUTLANDER 2020', 'MITSUBISHI', 'OUTLANDER 2020', 2023, 'ECONOMY', 1320000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_outlander 2020_2020_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00074', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1320000, 'MITSUBISHI OUTLANDER 2020', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI OUTLANDER 2020", "brand": "MITSUBISHI", "model": "OUTLANDER 2020", "year": "2020", "original_price": "13200001200000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_outlander_2020/p/g/2024/06/18/19/UR_MUW0MHi1YjwCYP8Zd8A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 13200001200000, "local_image_url": "/images/cars/MIOTO_mitsubishi_outlander 2020_2020_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CX9 2013' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), 'CX9 2013', 'CAR', 'ECONOMY', 1401000, 1401000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00075')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1401000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_cx9 2013_2013_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00075'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA CX9 2013', 'MAZDA', 'CX9 2013', 2023, 'ECONOMY', 1401000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_cx9 2013_2013_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00075', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1401000, 'MAZDA CX9 2013', 'Phường 19, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MAZDA CX9 2013", "brand": "MAZDA", "model": "CX9 2013", "year": "2013", "original_price": "14010001281000", "location": "Phường 19, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mazda_cx9_2013/p/g/2024/00/02/10/aCOk6958ZDKil-pcV-W7gQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 14010001281000, "local_image_url": "/images/cars/MIOTO_mazda_cx9 2013_2013_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'LIMO GREEN' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'LIMO GREEN', 'CAR', 'ECONOMY', 1263000, 1263000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00076')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1263000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_limo green_2026_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00076'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST LIMO GREEN 2026', 'VINFAST', 'LIMO GREEN', 2023, 'ECONOMY', 1263000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_limo green_2026_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00076', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1263000, 'VINFAST LIMO GREEN 2026', 'Phường 07, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST LIMO GREEN 2026", "brand": "VINFAST", "model": "LIMO GREEN", "year": "2026", "original_price": "12630001183000", "location": "Phường 07, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_limo_green_2026/p/g/2026/03/05/05/t905s1SCJxd5y0Dd2m1G9w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12630001183000, "local_image_url": "/images/cars/MIOTO_vinfast_limo green_2026_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF5 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF5 2024', 'CAR', 'ECONOMY', 8610007, 8610007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00077')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8610007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_vf5 2024_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00077'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF5 2024', 'VINFAST', 'VF5 2024', 2023, 'ECONOMY', 8610007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_vf5 2024_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00077', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8610007, 'VINFAST VF5 2024', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF5 2024", "brand": "VINFAST", "model": "VF5 2024", "year": "2024", "original_price": "861000786000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf5_2024/p/g/2025/04/22/00/abGnDUsIOjN9CIcuNOihCA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 861000786000, "local_image_url": "/images/cars/MIOTO_vinfast_vf5 2024_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'YARIS CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'YARIS CROSS', 'CAR', 'ECONOMY', 1148000, 1148000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00078')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1148000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_yaris cross_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00078'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA YARIS CROSS 2025', 'TOYOTA', 'YARIS CROSS', 2023, 'ECONOMY', 1148000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_yaris cross_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00078', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1148000, 'TOYOTA YARIS CROSS 2025', 'Phường 05, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA YARIS CROSS 2025", "brand": "TOYOTA", "model": "YARIS CROSS", "year": "2025", "original_price": "1148000", "location": "Phường 05, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_yaris_cross_2025/p/g/2025/07/06/15/yVFCtTNZJoOBDl8FI-f50w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1148000, "local_image_url": "/images/cars/MIOTO_toyota_yaris cross_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ECOSPORT 2020' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'ECOSPORT 2020', 'CAR', 'ECONOMY', 861000, 861000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00079')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 861000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_ford_ecosport 2020_2020_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00079'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD ECOSPORT 2020', 'FORD', 'ECOSPORT 2020', 2023, 'ECONOMY', 861000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_ford_ecosport 2020_2020_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00079', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 861000, 'FORD ECOSPORT 2020', 'Phường 07, Quận Phú Nhuận', '{"source": "MIOTO", "name": "FORD ECOSPORT 2020", "brand": "FORD", "model": "ECOSPORT 2020", "year": "2020", "original_price": "861000", "location": "Phường 07, Quận Phú Nhuận", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/ford_ecosport_2020/p/g/2024/01/24/21/IDM8G6ZFfUsuKqwPNYeH7A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 861000, "local_image_url": "/images/cars/MIOTO_ford_ecosport 2020_2020_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CX5 PREMIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), 'CX5 PREMIUM', 'CAR', 'ECONOMY', 1263000, 1263000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00080')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1263000,
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
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA CX5 PREMIUM 2021', 'MAZDA', 'CX5 PREMIUM', 2023, 'ECONOMY', 1263000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '', 5, 'AVAILABLE', GETDATE(), 'SCR-00080', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1263000, 'MAZDA CX5 PREMIUM 2021', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MAZDA CX5 PREMIUM 2021", "brand": "MAZDA", "model": "CX5 PREMIUM", "year": "2021", "original_price": "1263000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/oKfYVbn5fVXqR5pL_GuKxw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1263000, "local_image_url": ""}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VENUE 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'VENUE 2024', 'CAR', 'ECONOMY', 976000, 976000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00081')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 976000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_hyundai_venue 2024_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00081'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI VENUE 2024', 'HYUNDAI', 'VENUE 2024', 2023, 'ECONOMY', 976000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_hyundai_venue 2024_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00081', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 976000, 'HYUNDAI VENUE 2024', 'Phường 14, Quận Bình Thạnh', '{"source": "MIOTO", "name": "HYUNDAI VENUE 2024", "brand": "HYUNDAI", "model": "VENUE 2024", "year": "2024", "original_price": "976000", "location": "Phường 14, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_venue_2024/p/g/2025/07/22/21/nzGZBngmzoDQRJFhPaqbhA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 976000, "local_image_url": "/images/cars/MIOTO_hyundai_venue 2024_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CITY RS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'CITY RS', 'CAR', 'ECONOMY', 907000, 907000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00082')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 907000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_honda_city rs_2022_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00082'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CITY RS 2022', 'HONDA', 'CITY RS', 2023, 'ECONOMY', 907000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_honda_city rs_2022_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00082', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 907000, 'HONDA CITY RS 2022', 'Phường 05, Quận Phú Nhuận', '{"source": "MIOTO", "name": "HONDA CITY RS 2022", "brand": "HONDA", "model": "CITY RS", "year": "2022", "original_price": "907000", "location": "Phường 05, Quận Phú Nhuận", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_city_rs_2022/p/g/2026/03/14/15/k5jXBoEv1wvBWopqZECICQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 907000, "local_image_url": "/images/cars/MIOTO_honda_city rs_2022_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'FORD')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'FORD', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'TERRITORY TITANIUM' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'FORD'), 'TERRITORY TITANIUM', 'CAR', 'ECONOMY', 1435000, 1435000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00083')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1435000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_ford_territory titanium_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00083'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'FORD TERRITORY TITANIUM X 2024', 'FORD', 'TERRITORY TITANIUM', 2023, 'ECONOMY', 1435000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_ford_territory titanium_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00083', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1435000, 'FORD TERRITORY TITANIUM X 2024', 'Phường 02, Quận Phú Nhuận', '{"source": "MIOTO", "name": "FORD TERRITORY TITANIUM X 2024", "brand": "FORD", "model": "TERRITORY TITANIUM", "year": "2024", "original_price": "1435000", "location": "Phường 02, Quận Phú Nhuận", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/ford_territory_titanium_x_2024/p/g/2026/04/09/17/pxGDfLOjgpO-pn1mgay0jA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1435000, "local_image_url": "/images/cars/MIOTO_ford_territory titanium_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MG5')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MG5', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'LUXURY 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MG5'), 'LUXURY 2022', 'CAR', 'ECONOMY', 781000, 781000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00084')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 781000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mg5_luxury 2022_2022_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00084'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MG5 LUXURY 2022', 'MG5', 'LUXURY 2022', 2023, 'ECONOMY', 781000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mg5_luxury 2022_2022_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00084', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 781000, 'MG5 LUXURY 2022', 'Phường 07, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MG5 LUXURY 2022", "brand": "MG5", "model": "LUXURY 2022", "year": "2022", "original_price": "781000", "location": "Phường 07, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mg5_luxury_2022/p/g/2024/01/28/16/xN8Dwo314w0bf_Eou742HQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 781000, "local_image_url": "/images/cars/MIOTO_mg5_luxury 2022_2022_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'LYNK')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'LYNK', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '& CO' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'LYNK'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'LYNK'), '& CO', 'CAR', 'ECONOMY', 1162000, 1162000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00085')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1162000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_lynk_& co_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00085'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'LYNK & CO 06 2024', 'LYNK', '& CO', 2023, 'ECONOMY', 1162000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_lynk_& co_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00085', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1162000, 'LYNK & CO 06 2024', 'Phường 06, Quận Bình Thạnh', '{"source": "MIOTO", "name": "LYNK & CO 06 2024", "brand": "LYNK", "model": "& CO", "year": "2024", "original_price": "1162000", "location": "Phường 06, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/lynk_&_co_06_2024/p/g/2025/06/31/12/XdGRcs-8WIovItStC9qYbA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1162000, "local_image_url": "/images/cars/MIOTO_lynk_& co_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MERCEDES')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MERCEDES', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'S500 2014' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MERCEDES'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MERCEDES'), 'S500 2014', 'CAR', 'ECONOMY', 6315000, 6315000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00086')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 6315000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mercedes_s500 2014_2014_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00086'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MERCEDES S500 2014', 'MERCEDES', 'S500 2014', 2023, 'ECONOMY', 6315000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mercedes_s500 2014_2014_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00086', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 6315000, 'MERCEDES S500 2014', 'Phường Đa Kao, Quận 1', '{"source": "MIOTO", "name": "MERCEDES S500 2014", "brand": "MERCEDES", "model": "S500 2014", "year": "2014", "original_price": "6315000", "location": "Phường Đa Kao, Quận 1", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mercedes_s500_2014/p/g/2026/03/01/09/bCHd9tPcE807CW4t1CK_8w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 6315000, "local_image_url": "/images/cars/MIOTO_mercedes_s500 2014_2014_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MAZDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MAZDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '3 LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MAZDA'), '3 LUXURY', 'CAR', 'ECONOMY', 1091000, 1091000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00087')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1091000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mazda_3 luxury_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00087'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MAZDA 3 LUXURY 2023', 'MAZDA', '3 LUXURY', 2023, 'ECONOMY', 1091000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mazda_3 luxury_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00087', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1091000, 'MAZDA 3 LUXURY 2023', 'Phường 15, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MAZDA 3 LUXURY 2023", "brand": "MAZDA", "model": "3 LUXURY", "year": "2023", "original_price": "1091000", "location": "Phường 15, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mazda_3_luxury_2023/p/g/2025/07/11/22/SnLdFWiOwUt2Kli5GjVJMg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1091000, "local_image_url": "/images/cars/MIOTO_mazda_3 luxury_2023_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ACCENT 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'ACCENT 2019', 'CAR', 'ECONOMY', 819000, 819000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00088')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 819000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_hyundai_accent 2019_2019_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00088'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI ACCENT 2019', 'HYUNDAI', 'ACCENT 2019', 2023, 'ECONOMY', 819000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_hyundai_accent 2019_2019_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00088', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 819000, 'HYUNDAI ACCENT 2019', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "HYUNDAI ACCENT 2019", "brand": "HYUNDAI", "model": "ACCENT 2019", "year": "2019", "original_price": "819000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_accent_2019/p/g/2026/04/01/08/d4fV4UzLeLxp80KO_K1DEA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 819000, "local_image_url": "/images/cars/MIOTO_hyundai_accent 2019_2019_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'MORNING 2017' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'MORNING 2017', 'CAR', 'ECONOMY', 4580003, 4580003, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00089')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 4580003,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_morning 2017_2017_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00089'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA MORNING 2017', 'KIA', 'MORNING 2017', 2023, 'ECONOMY', 4580003, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_morning 2017_2017_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00089', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 4580003, 'KIA MORNING 2017', 'Phường 13, Quận Bình Thạnh', '{"source": "MIOTO", "name": "KIA MORNING 2017", "brand": "KIA", "model": "MORNING 2017", "year": "2017", "original_price": "458000378000", "location": "Phường 13, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_morning_2017/p/g/2024/09/01/15/dlsvB0nKa3hW_NE-Hy4etQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 458000378000, "local_image_url": "/images/cars/MIOTO_kia_morning 2017_2017_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'MORNING 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'MORNING 2019', 'CAR', 'ECONOMY', 5740004, 5740004, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00090')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 5740004,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_morning 2019_2019_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00090'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA MORNING 2019', 'KIA', 'MORNING 2019', 2023, 'ECONOMY', 5740004, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_morning 2019_2019_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00090', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 5740004, 'KIA MORNING 2019', 'Phường Thảo Điền, Quận Thủ Đức', '{"source": "MIOTO", "name": "KIA MORNING 2019", "brand": "KIA", "model": "MORNING 2019", "year": "2019", "original_price": "574000494000", "location": "Phường Thảo Điền, Quận Thủ Đức", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_morning_2019/p/g/2025/08/19/13/_0t3cakPDIAdCKk2Wpzwsw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 574000494000, "local_image_url": "/images/cars/MIOTO_kia_morning 2019_2019_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'ERTIGA 2022' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'ERTIGA 2022', 'CAR', 'ECONOMY', 8600007, 8600007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00091')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8600007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_suzuki_ertiga 2022_2022_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00091'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI ERTIGA 2022', 'SUZUKI', 'ERTIGA 2022', 2023, 'ECONOMY', 8600007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_suzuki_ertiga 2022_2022_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00091', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8600007, 'SUZUKI ERTIGA 2022', 'Phường 13, Quận Bình Thạnh', '{"source": "MIOTO", "name": "SUZUKI ERTIGA 2022", "brand": "SUZUKI", "model": "ERTIGA 2022", "year": "2022", "original_price": "860000740000", "location": "Phường 13, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/suzuki_ertiga_2022/p/g/2025/04/20/12/bwOK0PaTsd08UJTBYT_xKg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 860000740000, "local_image_url": "/images/cars/MIOTO_suzuki_ertiga 2022_2022_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'VINFAST')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'VINFAST', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'VF6 PLUS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'VINFAST'), 'VF6 PLUS', 'CAR', 'ECONOMY', 1033000, 1033000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00092')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1033000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_vinfast_vf6 plus_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00092'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'VINFAST VF6 PLUS 2024', 'VINFAST', 'VF6 PLUS', 2023, 'ECONOMY', 1033000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_vinfast_vf6 plus_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00092', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000, 'VINFAST VF6 PLUS 2024', 'Phường 13, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF6 PLUS 2024", "brand": "VINFAST", "model": "VF6 PLUS", "year": "2024", "original_price": "1033000953000", "location": "Phường 13, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf6_plus_2024/p/g/2024/03/08/19/Ed8T5rHfZOYAt7p5sYDhtA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000953000, "local_image_url": "/images/cars/MIOTO_vinfast_vf6 plus_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'MITSUBISHI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'MITSUBISHI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XPANDER CROSS' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'MITSUBISHI'), 'XPANDER CROSS', 'CAR', 'ECONOMY', 1111000, 1111000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00093')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1111000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_mitsubishi_xpander cross_2021_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00093'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'MITSUBISHI XPANDER CROSS 2021', 'MITSUBISHI', 'XPANDER CROSS', 2023, 'ECONOMY', 1111000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_mitsubishi_xpander cross_2021_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00093', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1111000, 'MITSUBISHI XPANDER CROSS 2021', 'Phường 03, Quận Gò Vấp', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER CROSS 2021", "brand": "MITSUBISHI", "model": "XPANDER CROSS", "year": "2021", "original_price": "1111000991000", "location": "Phường 03, Quận Gò Vấp", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_cross_2021/p/g/2024/10/22/11/NCCHVBgdBnb8NV3E7XDBRg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1111000991000, "local_image_url": "/images/cars/MIOTO_mitsubishi_xpander cross_2021_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CUSTIN PREMIER' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'CUSTIN PREMIER', 'CAR', 'ECONOMY', 1596000, 1596000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00094')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1596000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_hyundai_custin premier_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00094'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI CUSTIN PREMIER 2024', 'HYUNDAI', 'CUSTIN PREMIER', 2023, 'ECONOMY', 1596000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_hyundai_custin premier_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00094', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1596000, 'HYUNDAI CUSTIN PREMIER 2024', 'Phường 22, Quận Bình Thạnh', '{"source": "MIOTO", "name": "HYUNDAI CUSTIN PREMIER 2024", "brand": "HYUNDAI", "model": "CUSTIN PREMIER", "year": "2024", "original_price": "15960001476000", "location": "Phường 22, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_custin_premier_2024/p/g/2025/10/27/09/FhsrlC24npAlVWVDlo_t5g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 15960001476000, "local_image_url": "/images/cars/MIOTO_hyundai_custin premier_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CARENS LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'CARENS LUXURY', 'CAR', 'ECONOMY', 1205000, 1205000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00095')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1205000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_carens luxury_2023_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00095'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CARENS LUXURY 2023', 'KIA', 'CARENS LUXURY', 2023, 'ECONOMY', 1205000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_carens luxury_2023_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00095', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1205000, 'KIA CARENS LUXURY 2023', 'Phường 13, Quận Bình Thạnh', '{"source": "MIOTO", "name": "KIA CARENS LUXURY 2023", "brand": "KIA", "model": "CARENS LUXURY", "year": "2023", "original_price": "12050001085000", "location": "Phường 13, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_carens_luxury_2023/p/g/2026/00/15/12/VPrCjTfhWZWJZaWPOrbjfA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12050001085000, "local_image_url": "/images/cars/MIOTO_kia_carens luxury_2023_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XL7 HYBRID' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'XL7 HYBRID', 'CAR', 'ECONOMY', 1225000, 1225000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00096')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1225000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_suzuki_xl7 hybrid_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00096'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI XL7 HYBRID 2024', 'SUZUKI', 'XL7 HYBRID', 2023, 'ECONOMY', 1225000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_suzuki_xl7 hybrid_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00096', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1225000, 'SUZUKI XL7 HYBRID 2024', 'Phường 07, Quận Gò Vấp', '{"source": "MIOTO", "name": "SUZUKI XL7 HYBRID 2024", "brand": "SUZUKI", "model": "XL7 HYBRID", "year": "2024", "original_price": "12250001105000", "location": "Phường 07, Quận Gò Vấp", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/suzuki_xl7_hybrid_2024/p/g/2025/03/23/12/FGoyIgWT_D1EUPeE9y_olw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12250001105000, "local_image_url": "/images/cars/MIOTO_suzuki_xl7 hybrid_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CRV L' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'CRV L', 'CAR', 'ECONOMY', 1286000, 1286000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00097')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1286000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_honda_crv l_2019_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00097'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA CRV L 2019', 'HONDA', 'CRV L', 2023, 'ECONOMY', 1286000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_honda_crv l_2019_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00097', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1286000, 'HONDA CRV L 2019', 'Phường 05, Quận Gò Vấp', '{"source": "MIOTO", "name": "HONDA CRV L 2019", "brand": "HONDA", "model": "CRV L", "year": "2019", "original_price": "12860001166000", "location": "Phường 05, Quận Gò Vấp", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_crv_l_2019/p/g/2026/01/27/15/_f-1VUtdb6NHX3L34OMS3Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12860001166000, "local_image_url": "/images/cars/MIOTO_honda_crv l_2019_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'SUZUKI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'SUZUKI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'XL7 HYBRID' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'SUZUKI'), 'XL7 HYBRID', 'CAR', 'ECONOMY', 1091000, 1091000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00098')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1091000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_suzuki_xl7 hybrid_2025_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00098'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'SUZUKI XL7 HYBRID 2025', 'SUZUKI', 'XL7 HYBRID', 2023, 'ECONOMY', 1091000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_suzuki_xl7 hybrid_2025_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00098', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1091000, 'SUZUKI XL7 HYBRID 2025', 'Phường Hiệp Bình Chánh, Quận Thủ Đức', '{"source": "MIOTO", "name": "SUZUKI XL7 HYBRID 2025", "brand": "SUZUKI", "model": "XL7 HYBRID", "year": "2025", "original_price": "1091000971000", "location": "Phường Hiệp Bình Chánh, Quận Thủ Đức", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/suzuki_xl7_hybrid_2025/p/g/2025/07/24/14/azYNXTrgcixWsMQh81v0lQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1091000971000, "local_image_url": "/images/cars/MIOTO_suzuki_xl7 hybrid_2025_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'INNOVA 2017' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'INNOVA 2017', 'CAR', 'ECONOMY', 9090007, 9090007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00099')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 9090007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_innova 2017_2017_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00099'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA INNOVA 2017', 'TOYOTA', 'INNOVA 2017', 2023, 'ECONOMY', 9090007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_innova 2017_2017_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00099', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 9090007, 'TOYOTA INNOVA 2017', 'Phường 12, Quận 10', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2017", "brand": "TOYOTA", "model": "INNOVA 2017", "year": "2017", "original_price": "909000789000", "location": "Phường 12, Quận 10", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_innova_2017/p/g/2024/05/28/22/-eS9NVPpy0L4CUby1nc0aQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 909000789000, "local_image_url": "/images/cars/MIOTO_toyota_innova 2017_2017_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'KIA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'KIA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'CARENS LUXURY' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'KIA'), 'CARENS LUXURY', 'CAR', 'ECONOMY', 1286000, 1286000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00100')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1286000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_kia_carens luxury_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00100'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'KIA CARENS LUXURY 2024', 'KIA', 'CARENS LUXURY', 2023, 'ECONOMY', 1286000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_kia_carens luxury_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00100', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1286000, 'KIA CARENS LUXURY 2024', 'Phường 03, Quận Gò Vấp', '{"source": "MIOTO", "name": "KIA CARENS LUXURY 2024", "brand": "KIA", "model": "CARENS LUXURY", "year": "2024", "original_price": "12860001166000", "location": "Phường 03, Quận Gò Vấp", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_carens_luxury_2024/p/g/2025/06/06/11/oQeBLBSMQLqYugn5SFVPNg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12860001166000, "local_image_url": "/images/cars/MIOTO_kia_carens luxury_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'FORTUNER 2009' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'FORTUNER 2009', 'CAR', 'ECONOMY', 8590007, 8590007, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00101')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 8590007,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_fortuner 2009_2009_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00101'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA FORTUNER 2009', 'TOYOTA', 'FORTUNER 2009', 2023, 'ECONOMY', 8590007, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_fortuner 2009_2009_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00101', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 8590007, 'TOYOTA FORTUNER 2009', 'Phường Thảo Điền, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA FORTUNER 2009", "brand": "TOYOTA", "model": "FORTUNER 2009", "year": "2009", "original_price": "859000739000", "location": "Phường Thảo Điền, Quận Thủ Đức", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_fortuner_2009/p/g/2026/00/05/14/Sjx2IJqJWapPXpIe1E95DQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 859000739000, "local_image_url": "/images/cars/MIOTO_toyota_fortuner 2009_2009_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HYUNDAI')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HYUNDAI', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'PALISADE PRESTIGE' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HYUNDAI'), 'PALISADE PRESTIGE', 'CAR', 'ECONOMY', 2009000, 2009000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00102')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 2009000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_hyundai_palisade prestige_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00102'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HYUNDAI PALISADE PRESTIGE 2024', 'HYUNDAI', 'PALISADE PRESTIGE', 2023, 'ECONOMY', 2009000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_hyundai_palisade prestige_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00102', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 2009000, 'HYUNDAI PALISADE PRESTIGE 2024', 'Phường 02, Quận Tân Bình', '{"source": "MIOTO", "name": "HYUNDAI PALISADE PRESTIGE 2024", "brand": "HYUNDAI", "model": "PALISADE PRESTIGE", "year": "2024", "original_price": "20090001889000", "location": "Phường 02, Quận Tân Bình", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_palisade_prestige_2024/p/g/2025/01/02/18/MN3iPHaPpOPhAB3hu0zfBg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 20090001889000, "local_image_url": "/images/cars/MIOTO_hyundai_palisade prestige_2024_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'FORTUNER 2019' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'FORTUNER 2019', 'CAR', 'ECONOMY', 1389000, 1389000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00103')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1389000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_fortuner 2019_2019_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00103'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA FORTUNER 2019', 'TOYOTA', 'FORTUNER 2019', 2023, 'ECONOMY', 1389000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_fortuner 2019_2019_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00103', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1389000, 'TOYOTA FORTUNER 2019', 'Phường 02, Quận Tân Bình', '{"source": "MIOTO", "name": "TOYOTA FORTUNER 2019", "brand": "TOYOTA", "model": "FORTUNER 2019", "year": "2019", "original_price": "13890001269000", "location": "Phường 02, Quận Tân Bình", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_fortuner_2019/p/g/2024/04/29/19/k8eS8kS6Pa6SwWGNM3TFYw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 13890001269000, "local_image_url": "/images/cars/MIOTO_toyota_fortuner 2019_2019_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'TOYOTA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'TOYOTA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'INNOVA 2016' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'TOYOTA'), 'INNOVA 2016', 'CAR', 'ECONOMY', 7460006, 7460006, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00104')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 7460006,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_toyota_innova 2016_2016_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00104'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'TOYOTA INNOVA 2016', 'TOYOTA', 'INNOVA 2016', 2023, 'ECONOMY', 7460006, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_toyota_innova 2016_2016_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00104', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 7460006, 'TOYOTA INNOVA 2016', 'Phường 09, Quận Phú Nhuận', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2016", "brand": "TOYOTA", "model": "INNOVA 2016", "year": "2016", "original_price": "746000626000", "location": "Phường 09, Quận Phú Nhuận", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_innova_2016/p/g/2023/02/15/10/gktsOWLIlAybJUv2Q5Bjbw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 746000626000, "local_image_url": "/images/cars/MIOTO_toyota_innova 2016_2016_mioto.jpg"}');


IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = 'HONDA')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), 'HONDA', N'Japan', 'CAR', 1, GETDATE())
END;


IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = 'BRV-G 2024' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = 'HONDA'), 'BRV-G 2024', 'CAR', 'ECONOMY', 1102000, 1102000, 1)
END;


IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'SCR-00105')
BEGIN
    UPDATE vehicles SET 
        price_per_day = 1102000,
        seats = 5,
        transmission = 'AUTOMATIC',
        fuel_type = 'GASOLINE',
        thumbnail_url = '/images/cars/MIOTO_honda_brv-g 2024_2024_mioto.jpg',
        updated_at = GETDATE()
    WHERE license_plate = 'SCR-00105'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), 'A1B2C3D4-E5F6-7890-ABCD-123456789012', 'HONDA BRV-G 2024', 'HONDA', 'BRV-G 2024', 2023, 'ECONOMY', 1102000, 0, N'Hà Nội', 'AUTOMATIC', 'GASOLINE', '/images/cars/MIOTO_honda_brv-g 2024_2024_mioto.jpg', 5, 'AVAILABLE', GETDATE(), 'SCR-00105', 'CAR')
END;


INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1102000, 'HONDA BRV-G 2024', 'Phường 25, Quận Bình Thạnh', '{"source": "MIOTO", "name": "HONDA BRV-G 2024", "brand": "HONDA", "model": "BRV-G 2024", "year": "2024", "original_price": "1102000982000", "location": "Phường 25, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_brv-g_2024/p/g/2024/10/25/15/k4JaPXVImOJvxQH-V3Va-w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1102000982000, "local_image_url": "/images/cars/MIOTO_honda_brv-g 2024_2024_mioto.jpg"}');
