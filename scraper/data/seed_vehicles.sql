-- ===========================================================\n-- LUXEWAY VEHICLE SEED SCRIPT (GENERATED VIA SCRAPER PIPELINE)\n-- Generated at: 2026-06-14 23:16:28\n-- Database: SQL Server\n-- ===========================================================\n\n
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='raw_vehicle_data' and xtype='U')
CREATE TABLE raw_vehicle_data (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    source VARCHAR(50),
    scrape_date DATETIME DEFAULT GETDATE(),
    original_price DECIMAL(18,2),
    vehicle_name NVARCHAR(255),
    location NVARCHAR(255),
    raw_json NVARCHAR(MAX)
);
GO
\n
MERGE INTO brands AS target
USING (SELECT 'Kia' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_Kia UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'Kia');
MERGE INTO models AS target
USING (SELECT 'Morning MT' AS model_name, @brandId_Kia AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_MorningMT UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'Morning MT' AND b.name = 'Kia');
MERGE INTO vehicles AS target
USING (SELECT 'Kia Morning MT' AS v_name, @modelId_MorningMT AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 500000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 500000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 500000, 'Kia Morning MT', 'Đà Nẵng', '{"source": "MIOTO", "name": "Kia Morning MT", "brand": "Kia", "model": "Morning MT", "year": "2023", "original_price": "500000₫", "location": "Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689218176455_kia morning.jpeg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 500000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'Kia' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_Kia UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'Kia');
MERGE INTO models AS target
USING (SELECT 'Forte 1.6' AS model_name, @brandId_Kia AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_Forte1.6 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'Forte 1.6' AND b.name = 'Kia');
MERGE INTO vehicles AS target
USING (SELECT 'Kia Forte 1.6 MT' AS v_name, @modelId_Forte1.6 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 700000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 700000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Kia Forte 1.6 MT', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Kia Forte 1.6 MT", "brand": "Kia", "model": "Forte 1.6", "year": "2023", "original_price": "700000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/default-image.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'Honda' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_Honda UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'Honda');
MERGE INTO models AS target
USING (SELECT 'Civic MT' AS model_name, @brandId_Honda AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CivicMT UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'Civic MT' AND b.name = 'Honda');
MERGE INTO vehicles AS target
USING (SELECT 'Honda Civic MT' AS v_name, @modelId_CivicMT AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 700000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 700000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Honda Civic MT', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Honda Civic MT", "brand": "Honda", "model": "Civic MT", "year": "2023", "original_price": "700000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689309307704_honda civic.jpeg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'Hyundai' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_Hyundai UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'Hyundai');
MERGE INTO models AS target
USING (SELECT 'Grand i10' AS model_name, @brandId_Hyundai AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_Grandi10 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'Grand i10' AND b.name = 'Hyundai');
MERGE INTO vehicles AS target
USING (SELECT 'Hyundai Grand i10 Hatchback 1.0 AT' AS v_name, @modelId_Grandi10 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 700000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 700000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Hyundai Grand i10 Hatchback 1.0 AT', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Hyundai Grand i10 Hatchback 1.0 AT", "brand": "Hyundai", "model": "Grand i10", "year": "2023", "original_price": "700000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689143255811_hyundai i10.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'Nissan' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_Nissan UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'Nissan');
MERGE INTO models AS target
USING (SELECT 'Sunny XL' AS model_name, @brandId_Nissan AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_SunnyXL UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'Sunny XL' AND b.name = 'Nissan');
MERGE INTO vehicles AS target
USING (SELECT 'Nissan Sunny XL' AS v_name, @modelId_SunnyXL AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 700000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 700000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Nissan Sunny XL', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Nissan Sunny XL", "brand": "Nissan", "model": "Sunny XL", "year": "2023", "original_price": "700000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689318398716_nissan sunny.png", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'Toyota' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_Toyota UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'Toyota');
MERGE INTO models AS target
USING (SELECT 'Vios MT' AS model_name, @brandId_Toyota AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ViosMT UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'Vios MT' AND b.name = 'Toyota');
MERGE INTO vehicles AS target
USING (SELECT 'Toyota Vios MT' AS v_name, @modelId_ViosMT AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 700000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 700000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Toyota Vios MT', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Toyota Vios MT", "brand": "Toyota", "model": "Vios MT", "year": "2023", "original_price": "700000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689132278841_Vios MT.png", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'Hyundai' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_Hyundai UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'Hyundai');
MERGE INTO models AS target
USING (SELECT 'Avante AT' AS model_name, @brandId_Hyundai AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_AvanteAT UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'Avante AT' AND b.name = 'Hyundai');
MERGE INTO vehicles AS target
USING (SELECT 'Hyundai Avante AT' AS v_name, @modelId_AvanteAT AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 700000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 700000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'Hyundai Avante AT', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Hyundai Avante AT", "brand": "Hyundai", "model": "Avante AT", "year": "2023", "original_price": "700000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689134881883_hyundai avante.jpeg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'Geely' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_Geely UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'Geely');
MERGE INTO models AS target
USING (SELECT 'Coolray Coolray' AS model_name, @brandId_Geely AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CoolrayCoolray UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'Coolray Coolray' AND b.name = 'Geely');
MERGE INTO vehicles AS target
USING (SELECT 'Geely Coolray Coolray Flagship' AS v_name, @modelId_CoolrayCoolray AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 730000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 730000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 730000, 'Geely Coolray Coolray Flagship', 'Đà Nẵng', '{"source": "MIOTO", "name": "Geely Coolray Coolray Flagship", "brand": "Geely", "model": "Coolray Coolray", "year": "2023", "original_price": "730000₫", "location": "Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1762309920454_geely-coolray-250303-c05.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 730000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'Toyota' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_Toyota UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'Toyota');
MERGE INTO models AS target
USING (SELECT 'Vios AT' AS model_name, @brandId_Toyota AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ViosAT UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'Vios AT' AND b.name = 'Toyota');
MERGE INTO vehicles AS target
USING (SELECT 'Toyota Vios AT' AS v_name, @modelId_ViosAT AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 800000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 800000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 800000, 'Toyota Vios AT', 'Tp. Đà Nẵng', '{"source": "MIOTO", "name": "Toyota Vios AT", "brand": "Toyota", "model": "Vios AT", "year": "2023", "original_price": "800000₫", "location": "Tp. Đà Nẵng", "image_url": "./Cho thuê ô tô_files/1689132331746_Vios MT.png", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 800000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'KIA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_KIA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'KIA');
MERGE INTO models AS target
USING (SELECT 'K3 PREMIUM' AS model_name, @brandId_KIA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_K3PREMIUM UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'K3 PREMIUM' AND b.name = 'KIA');
MERGE INTO vehicles AS target
USING (SELECT 'KIA K3 PREMIUM 2023' AS v_name, @modelId_K3PREMIUM AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 949000859000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 949000859000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 949000859000, 'KIA K3 PREMIUM 2023', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "KIA K3 PREMIUM 2023", "brand": "KIA", "model": "K3 PREMIUM", "year": "2023", "original_price": "949000859000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/das4MKBaEGMCjL6cnouY3g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 949000859000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'OMODA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_OMODA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'OMODA');
MERGE INTO models AS target
USING (SELECT 'C5 LUXURY' AS model_name, @brandId_OMODA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_C5LUXURY UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'C5 LUXURY' AND b.name = 'OMODA');
MERGE INTO vehicles AS target
USING (SELECT 'OMODA C5 LUXURY 2026' AS v_name, @modelId_C5LUXURY AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 12190001119000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 12190001119000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 12190001119000, 'OMODA C5 LUXURY 2026', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "OMODA C5 LUXURY 2026", "brand": "OMODA", "model": "C5 LUXURY", "year": "2026", "original_price": "12190001119000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/ucQSoB0Ww60ZYgeUwSkMyQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12190001119000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MAZDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MAZDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MAZDA');
MERGE INTO models AS target
USING (SELECT 'CX5 Deluxe' AS model_name, @brandId_MAZDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CX5Deluxe UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CX5 Deluxe' AND b.name = 'MAZDA');
MERGE INTO vehicles AS target
USING (SELECT 'MAZDA CX5 Deluxe 2025' AS v_name, @modelId_CX5Deluxe AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 11990001099000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 11990001099000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 11990001099000, 'MAZDA CX5 Deluxe 2025', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA CX5 Deluxe 2025", "brand": "MAZDA", "model": "CX5 Deluxe", "year": "2025", "original_price": "11990001099000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/0goBQTU8EE5_FakPxCO8PA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11990001099000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'KIA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_KIA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'KIA');
MERGE INTO models AS target
USING (SELECT 'CARENS 2026' AS model_name, @brandId_KIA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CARENS2026 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CARENS 2026' AND b.name = 'KIA');
MERGE INTO vehicles AS target
USING (SELECT 'KIA CARENS 2026' AS v_name, @modelId_CARENS2026 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1034000944000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1034000944000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1034000944000, 'KIA CARENS 2026', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "KIA CARENS 2026", "brand": "KIA", "model": "CARENS 2026", "year": "2026", "original_price": "1034000944000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/0ccVszv4qC7QUIw8-PlD9Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1034000944000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HONDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HONDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HONDA');
MERGE INTO models AS target
USING (SELECT 'CIVIC E' AS model_name, @brandId_HONDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CIVICE UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CIVIC E' AND b.name = 'HONDA');
MERGE INTO vehicles AS target
USING (SELECT 'HONDA CIVIC E 2018' AS v_name, @modelId_CIVICE AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 850000760000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 850000760000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 850000760000, 'HONDA CIVIC E 2018', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "HONDA CIVIC E 2018", "brand": "HONDA", "model": "CIVIC E", "year": "2018", "original_price": "850000760000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/yIDn4mcdySWdX9Ijwa1w7Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 850000760000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'PEUGEOT' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_PEUGEOT UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'PEUGEOT');
MERGE INTO models AS target
USING (SELECT '3008 2022' AS model_name, @brandId_PEUGEOT AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_30082022 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = '3008 2022' AND b.name = 'PEUGEOT');
MERGE INTO vehicles AS target
USING (SELECT 'PEUGEOT 3008 2022' AS v_name, @modelId_30082022 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1079000979000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1079000979000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1079000979000, 'PEUGEOT 3008 2022', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "PEUGEOT 3008 2022", "brand": "PEUGEOT", "model": "3008 2022", "year": "2022", "original_price": "1079000979000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/_ou6ATSxq_ZJy3ckwDQ1Xw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1079000979000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'GEELY' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_GEELY UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'GEELY');
MERGE INTO models AS target
USING (SELECT 'COOLRAY FLAGSHIP' AS model_name, @brandId_GEELY AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_COOLRAYFLAGSHIP UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'COOLRAY FLAGSHIP' AND b.name = 'GEELY');
MERGE INTO vehicles AS target
USING (SELECT 'GEELY COOLRAY FLAGSHIP 2025' AS v_name, @modelId_COOLRAYFLAGSHIP AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 930000820000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 930000820000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 930000820000, 'GEELY COOLRAY FLAGSHIP 2025', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "GEELY COOLRAY FLAGSHIP 2025", "brand": "GEELY", "model": "COOLRAY FLAGSHIP", "year": "2025", "original_price": "930000820000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/owFqC2MONI4SZBHwty-kxQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 930000820000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'SUZUKI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_SUZUKI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'SUZUKI');
MERGE INTO models AS target
USING (SELECT 'XL7 HYBRID' AS model_name, @brandId_SUZUKI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_XL7HYBRID UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'XL7 HYBRID' AND b.name = 'SUZUKI');
MERGE INTO vehicles AS target
USING (SELECT 'SUZUKI XL7 HYBRID 2024' AS v_name, @modelId_XL7HYBRID AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 879000789000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 879000789000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 879000789000, 'SUZUKI XL7 HYBRID 2024', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "SUZUKI XL7 HYBRID 2024", "brand": "SUZUKI", "model": "XL7 HYBRID", "year": "2024", "original_price": "879000789000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/yvmbLyuAU5KV5LXAYGhosA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 879000789000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MAZDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MAZDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MAZDA');
MERGE INTO models AS target
USING (SELECT '3 Deluxe' AS model_name, @brandId_MAZDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_3Deluxe UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = '3 Deluxe' AND b.name = 'MAZDA');
MERGE INTO vehicles AS target
USING (SELECT 'MAZDA 3 Deluxe 2022' AS v_name, @modelId_3Deluxe AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 850000760000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 850000760000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 850000760000, 'MAZDA 3 Deluxe 2022', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA 3 Deluxe 2022", "brand": "MAZDA", "model": "3 Deluxe", "year": "2022", "original_price": "850000760000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/LdoWI_bq5a9axEZUB6QNHQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 850000760000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MG' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MG UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MG');
MERGE INTO models AS target
USING (SELECT 'ZS STANDARD' AS model_name, @brandId_MG AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ZSSTANDARD UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'ZS STANDARD' AND b.name = 'MG');
MERGE INTO vehicles AS target
USING (SELECT 'MG ZS STANDARD 2024' AS v_name, @modelId_ZSSTANDARD AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 799000699000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 799000699000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 799000699000, 'MG ZS STANDARD 2024', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "MG ZS STANDARD 2024", "brand": "MG", "model": "ZS STANDARD", "year": "2024", "original_price": "799000699000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/UuIGRRc5lDaOunD2J2AlqA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 799000699000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'ACCENT 2024' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ACCENT2024 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'ACCENT 2024' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI ACCENT 2024' AS v_name, @modelId_ACCENT2024 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 779000679000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 779000679000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 779000679000, 'HYUNDAI ACCENT 2024', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "HYUNDAI ACCENT 2024", "brand": "HYUNDAI", "model": "ACCENT 2024", "year": "2024", "original_price": "779000679000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/es2bXjM54i3H5YIGBpOHAw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 779000679000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'FORD' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_FORD UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'FORD');
MERGE INTO models AS target
USING (SELECT 'FOCUS 2019' AS model_name, @brandId_FORD AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_FOCUS2019 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'FOCUS 2019' AND b.name = 'FORD');
MERGE INTO vehicles AS target
USING (SELECT 'FORD FOCUS 2019' AS v_name, @modelId_FOCUS2019 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 703000613000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 703000613000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 703000613000, 'FORD FOCUS 2019', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "FORD FOCUS 2019", "brand": "FORD", "model": "FOCUS 2019", "year": "2019", "original_price": "703000613000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/AdGppWFkiNJCTSsbmf-87g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 703000613000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MAZDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MAZDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MAZDA');
MERGE INTO models AS target
USING (SELECT '2 2024' AS model_name, @brandId_MAZDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_22024 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = '2 2024' AND b.name = 'MAZDA');
MERGE INTO vehicles AS target
USING (SELECT 'MAZDA 2 2024' AS v_name, @modelId_22024 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 739000649000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 739000649000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 739000649000, 'MAZDA 2 2024', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA 2 2024", "brand": "MAZDA", "model": "2 2024", "year": "2024", "original_price": "739000649000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/__azAr-XmshurxKWQV69ig.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 739000649000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'VINFAST' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_VINFAST UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'VINFAST');
MERGE INTO models AS target
USING (SELECT 'FADIL 2020' AS model_name, @brandId_VINFAST AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_FADIL2020 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'FADIL 2020' AND b.name = 'VINFAST');
MERGE INTO vehicles AS target
USING (SELECT 'VINFAST FADIL 2020' AS v_name, @modelId_FADIL2020 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 556000466000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 556000466000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 556000466000, 'VINFAST FADIL 2020', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "VINFAST FADIL 2020", "brand": "VINFAST", "model": "FADIL 2020", "year": "2020", "original_price": "556000466000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/2GpRxLfjaSM358FSQhpsxg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 556000466000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MAZDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MAZDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MAZDA');
MERGE INTO models AS target
USING (SELECT '3 Deluxe' AS model_name, @brandId_MAZDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_3Deluxe UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = '3 Deluxe' AND b.name = 'MAZDA');
MERGE INTO vehicles AS target
USING (SELECT 'MAZDA 3 Deluxe 2019' AS v_name, @modelId_3Deluxe AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 750000660000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 750000660000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 750000660000, 'MAZDA 3 Deluxe 2019', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA 3 Deluxe 2019", "brand": "MAZDA", "model": "3 Deluxe", "year": "2019", "original_price": "750000660000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/VgJMtU_ZbosQyfnFvD3GXQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 750000660000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MAZDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MAZDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MAZDA');
MERGE INTO models AS target
USING (SELECT '2 LUXURY' AS model_name, @brandId_MAZDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_2LUXURY UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = '2 LUXURY' AND b.name = 'MAZDA');
MERGE INTO vehicles AS target
USING (SELECT 'MAZDA 2 LUXURY 2023' AS v_name, @modelId_2LUXURY AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 739000639000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 739000639000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 739000639000, 'MAZDA 2 LUXURY 2023', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA 2 LUXURY 2023", "brand": "MAZDA", "model": "2 LUXURY", "year": "2023", "original_price": "739000639000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/RSeh0hRKAlU0My_t61Gedg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 739000639000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'CAMRY 2.0E' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CAMRY2.0E UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CAMRY 2.0E' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA CAMRY 2.0E 2016' AS v_name, @modelId_CAMRY2.0E AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 976000856000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 976000856000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 976000856000, 'TOYOTA CAMRY 2.0E 2016', 'Phường An Phú, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA CAMRY 2.0E 2016", "brand": "TOYOTA", "model": "CAMRY 2.0E", "year": "2016", "original_price": "976000856000", "location": "Phường An Phú, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/I9vm8VW82f6mTlE_WLZ_SA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 976000856000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'I10 2021' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_I102021 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'I10 2021' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI I10 2021' AS v_name, @modelId_I102021 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 585000495000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 585000495000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 585000495000, 'HYUNDAI I10 2021', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI I10 2021", "brand": "HYUNDAI", "model": "I10 2021", "year": "2021", "original_price": "585000495000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/yfFXu3Q0w0UYjMp_GDLRLg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 585000495000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'STARGAZER PREMIUM' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_STARGAZERPREMIUM UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'STARGAZER PREMIUM' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI STARGAZER PREMIUM 2022' AS v_name, @modelId_STARGAZERPREMIUM AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 735000645000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 735000645000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 735000645000, 'HYUNDAI STARGAZER PREMIUM 2022', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI STARGAZER PREMIUM 2022", "brand": "HYUNDAI", "model": "STARGAZER PREMIUM", "year": "2022", "original_price": "735000645000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/-Nf0AUbGTm2vIFURaHy6lw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 735000645000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'VIOS 2023' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VIOS2023 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VIOS 2023' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA VIOS 2023' AS v_name, @modelId_VIOS2023 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 769000669000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 769000669000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 769000669000, 'TOYOTA VIOS 2023', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "TOYOTA VIOS 2023", "brand": "TOYOTA", "model": "VIOS 2023", "year": "2023", "original_price": "769000669000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/dI1xc2t2tQWL9GWGu4jGyg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 769000669000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MG5' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MG5 UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MG5');
MERGE INTO models AS target
USING (SELECT 'STANDARD 2023' AS model_name, @brandId_MG5 AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_STANDARD2023 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'STANDARD 2023' AND b.name = 'MG5');
MERGE INTO vehicles AS target
USING (SELECT 'MG5 STANDARD 2023' AS v_name, @modelId_STANDARD2023 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 750000660000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 750000660000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 750000660000, 'MG5 STANDARD 2023', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "MG5 STANDARD 2023", "brand": "MG5", "model": "STANDARD 2023", "year": "2023", "original_price": "750000660000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/pYVjsj2kE90K5ekre-gC3A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 750000660000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'KIA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_KIA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'KIA');
MERGE INTO models AS target
USING (SELECT 'RONDO 2022' AS model_name, @brandId_KIA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_RONDO2022 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'RONDO 2022' AND b.name = 'KIA');
MERGE INTO vehicles AS target
USING (SELECT 'KIA RONDO 2022' AS v_name, @modelId_RONDO2022 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 779000689000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 779000689000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 779000689000, 'KIA RONDO 2022', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "KIA RONDO 2022", "brand": "KIA", "model": "RONDO 2022", "year": "2022", "original_price": "779000689000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/EmVIg4SCb_rBHROP8oPa5g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 779000689000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MG5' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MG5 UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MG5');
MERGE INTO models AS target
USING (SELECT 'STANDARD 2024' AS model_name, @brandId_MG5 AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_STANDARD2024 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'STANDARD 2024' AND b.name = 'MG5');
MERGE INTO vehicles AS target
USING (SELECT 'MG5 STANDARD 2024' AS v_name, @modelId_STANDARD2024 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 779000689000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 779000689000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 779000689000, 'MG5 STANDARD 2024', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "MG5 STANDARD 2024", "brand": "MG5", "model": "STANDARD 2024", "year": "2024", "original_price": "779000689000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/2-vmNsnVe5o0t04LZUJn7Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 779000689000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'ACCENT 2022' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ACCENT2022 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'ACCENT 2022' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI ACCENT 2022' AS v_name, @modelId_ACCENT2022 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 709000609000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 709000609000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 709000609000, 'HYUNDAI ACCENT 2022', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI ACCENT 2022", "brand": "HYUNDAI", "model": "ACCENT 2022", "year": "2022", "original_price": "709000609000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/C2oZGCcqgD7P8fQSedCsxQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 709000609000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'KIA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_KIA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'KIA');
MERGE INTO models AS target
USING (SELECT 'SELTOS LUXURY' AS model_name, @brandId_KIA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_SELTOSLUXURY UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'SELTOS LUXURY' AND b.name = 'KIA');
MERGE INTO vehicles AS target
USING (SELECT 'KIA SELTOS LUXURY 2021' AS v_name, @modelId_SELTOSLUXURY AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 869000769000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 869000769000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 869000769000, 'KIA SELTOS LUXURY 2021', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "KIA SELTOS LUXURY 2021", "brand": "KIA", "model": "SELTOS LUXURY", "year": "2021", "original_price": "869000769000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/_Q19cePvgHTyGYkX4HyalQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 869000769000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'SUZUKI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_SUZUKI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'SUZUKI');
MERGE INTO models AS target
USING (SELECT 'XL7 2021' AS model_name, @brandId_SUZUKI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_XL72021 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'XL7 2021' AND b.name = 'SUZUKI');
MERGE INTO vehicles AS target
USING (SELECT 'SUZUKI XL7 2021' AS v_name, @modelId_XL72021 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 744000654000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 744000654000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 744000654000, 'SUZUKI XL7 2021', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "SUZUKI XL7 2021", "brand": "SUZUKI", "model": "XL7 2021", "year": "2021", "original_price": "744000654000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/PCt_MjmNZSuIZu1yOXEebQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 744000654000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'ACCENT 2023' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ACCENT2023 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'ACCENT 2023' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI ACCENT 2023' AS v_name, @modelId_ACCENT2023 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 750000650000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 750000650000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 750000650000, 'HYUNDAI ACCENT 2023', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI ACCENT 2023", "brand": "HYUNDAI", "model": "ACCENT 2023", "year": "2023", "original_price": "750000650000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/me3xV9fgKSkrRN6nPrTNsQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 750000650000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'ELANTRA 2019' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ELANTRA2019 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'ELANTRA 2019' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI ELANTRA 2019' AS v_name, @modelId_ELANTRA2019 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 779000689000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 779000689000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 779000689000, 'HYUNDAI ELANTRA 2019', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI ELANTRA 2019", "brand": "HYUNDAI", "model": "ELANTRA 2019", "year": "2019", "original_price": "779000689000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/MTFqD7oTPl3i1VncH-vq0A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 779000689000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'VINFAST' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_VINFAST UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'VINFAST');
MERGE INTO models AS target
USING (SELECT 'FADIL 2021' AS model_name, @brandId_VINFAST AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_FADIL2021 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'FADIL 2021' AND b.name = 'VINFAST');
MERGE INTO vehicles AS target
USING (SELECT 'VINFAST FADIL 2021' AS v_name, @modelId_FADIL2021 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 585000495000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 585000495000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 585000495000, 'VINFAST FADIL 2021', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "VINFAST FADIL 2021", "brand": "VINFAST", "model": "FADIL 2021", "year": "2021", "original_price": "585000495000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/7nOFGgypecdV1G5h2MB8Lg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 585000495000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'KONA 2019' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_KONA2019 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'KONA 2019' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI KONA 2019' AS v_name, @modelId_KONA2019 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 719000619000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 719000619000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 719000619000, 'HYUNDAI KONA 2019', 'Phường 8, Quận Gò Vấp', '{"source": "MIOTO", "name": "HYUNDAI KONA 2019", "brand": "HYUNDAI", "model": "KONA 2019", "year": "2019", "original_price": "719000619000", "location": "Phường 8, Quận Gò Vấp", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/w5LYbid1SN9szB2XUP3GFw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 719000619000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'VINFAST' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_VINFAST UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'VINFAST');
MERGE INTO models AS target
USING (SELECT 'LUX A' AS model_name, @brandId_VINFAST AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_LUXA UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'LUX A' AND b.name = 'VINFAST');
MERGE INTO vehicles AS target
USING (SELECT 'VINFAST LUX A 2022' AS v_name, @modelId_LUXA AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 986000866000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 986000866000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 986000866000, 'VINFAST LUX A 2022', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "VINFAST LUX A 2022", "brand": "VINFAST", "model": "LUX A", "year": "2022", "original_price": "986000866000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/3FKBD4vubdp1vnPB9eBiWQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 986000866000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'RAIZE 2023' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_RAIZE2023 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'RAIZE 2023' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA RAIZE 2023' AS v_name, @modelId_RAIZE2023 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 809000709000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 809000709000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 809000709000, 'TOYOTA RAIZE 2023', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "TOYOTA RAIZE 2023", "brand": "TOYOTA", "model": "RAIZE 2023", "year": "2023", "original_price": "809000709000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/We-rt15AbeQGayrg4IRctg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 809000709000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MG5' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MG5 UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MG5');
MERGE INTO models AS target
USING (SELECT 'LUXURY 2022' AS model_name, @brandId_MG5 AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_LUXURY2022 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'LUXURY 2022' AND b.name = 'MG5');
MERGE INTO vehicles AS target
USING (SELECT 'MG5 LUXURY 2022' AS v_name, @modelId_LUXURY2022 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 759000669000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 759000669000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 759000669000, 'MG5 LUXURY 2022', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "MG5 LUXURY 2022", "brand": "MG5", "model": "LUXURY 2022", "year": "2022", "original_price": "759000669000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/NjGtIPwGCdpVOjmCRIWeqA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 759000669000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'SUZUKI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_SUZUKI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'SUZUKI');
MERGE INTO models AS target
USING (SELECT 'ERTIGA 2022' AS model_name, @brandId_SUZUKI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ERTIGA2022 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'ERTIGA 2022' AND b.name = 'SUZUKI');
MERGE INTO vehicles AS target
USING (SELECT 'SUZUKI ERTIGA 2022' AS v_name, @modelId_ERTIGA2022 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 744000654000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 744000654000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 744000654000, 'SUZUKI ERTIGA 2022', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "SUZUKI ERTIGA 2022", "brand": "SUZUKI", "model": "ERTIGA 2022", "year": "2022", "original_price": "744000654000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/6AnqqbNQkCv5SWhk9aI4xA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 744000654000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'COROLLA ALTIS' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_COROLLAALTIS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'COROLLA ALTIS' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA COROLLA ALTIS 2021' AS v_name, @modelId_COROLLAALTIS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 929000809000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 929000809000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 929000809000, 'TOYOTA COROLLA ALTIS 2021', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "TOYOTA COROLLA ALTIS 2021", "brand": "TOYOTA", "model": "COROLLA ALTIS", "year": "2021", "original_price": "929000809000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/XLlQgr86ZVsP3C9288jTUw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 929000809000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'FORD' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_FORD UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'FORD');
MERGE INTO models AS target
USING (SELECT 'TERRITORY TREND' AS model_name, @brandId_FORD AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_TERRITORYTREND UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'TERRITORY TREND' AND b.name = 'FORD');
MERGE INTO vehicles AS target
USING (SELECT 'FORD TERRITORY TREND 2025' AS v_name, @modelId_TERRITORYTREND AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 11990001099000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 11990001099000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 11990001099000, 'FORD TERRITORY TREND 2025', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "FORD TERRITORY TREND 2025", "brand": "FORD", "model": "TERRITORY TREND", "year": "2025", "original_price": "11990001099000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/P7zIoBiq53pLsxMbf0qO2A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11990001099000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MG5' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MG5 UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MG5');
MERGE INTO models AS target
USING (SELECT '2024' AS model_name, @brandId_MG5 AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_2024 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = '2024' AND b.name = 'MG5');
MERGE INTO vehicles AS target
USING (SELECT 'MG5 2024' AS v_name, @modelId_2024 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 669000579000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 669000579000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 669000579000, 'MG5 2024', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "MG5 2024", "brand": "MG5", "model": "2024", "year": "2024", "original_price": "669000579000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/dM94O62gMIbZm4w1phSqtw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 669000579000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HONDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HONDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HONDA');
MERGE INTO models AS target
USING (SELECT 'CITY RS' AS model_name, @brandId_HONDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CITYRS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CITY RS' AND b.name = 'HONDA');
MERGE INTO vehicles AS target
USING (SELECT 'HONDA CITY RS 2024' AS v_name, @modelId_CITYRS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 829000729000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 829000729000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 829000729000, 'HONDA CITY RS 2024', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "HONDA CITY RS 2024", "brand": "HONDA", "model": "CITY RS", "year": "2024", "original_price": "829000729000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/yjzrslLr0MUbn0DQGvsIPw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 829000729000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MAZDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MAZDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MAZDA');
MERGE INTO models AS target
USING (SELECT '2 2025' AS model_name, @brandId_MAZDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_22025 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = '2 2025' AND b.name = 'MAZDA');
MERGE INTO vehicles AS target
USING (SELECT 'MAZDA 2 2025' AS v_name, @modelId_22025 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 779000679000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 779000679000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 779000679000, 'MAZDA 2 2025', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "MAZDA 2 2025", "brand": "MAZDA", "model": "2 2025", "year": "2025", "original_price": "779000679000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/zJwC-mXbHKrQaFPcgz7K0Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 779000679000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'COROLLA ALTIS' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_COROLLAALTIS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'COROLLA ALTIS' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA COROLLA ALTIS 2022' AS v_name, @modelId_COROLLAALTIS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 947000827000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 947000827000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 947000827000, 'TOYOTA COROLLA ALTIS 2022', 'Phường 15, Quận Tân Bình', '{"source": "MIOTO", "name": "TOYOTA COROLLA ALTIS 2022", "brand": "TOYOTA", "model": "COROLLA ALTIS", "year": "2022", "original_price": "947000827000", "location": "Phường 15, Quận Tân Bình", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/BNEO9aGylGh1Lan_NGqGUw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 947000827000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'ELANTRA 2024' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ELANTRA2024 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'ELANTRA 2024' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI ELANTRA 2024' AS v_name, @modelId_ELANTRA2024 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 845000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 845000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 845000, 'HYUNDAI ELANTRA 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "HYUNDAI ELANTRA 2024", "brand": "HYUNDAI", "model": "ELANTRA 2024", "year": "2024", "original_price": "845000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/olDlVEnaNVkW0rtF7MsY8w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 845000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'WIGO 2024' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_WIGO2024 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'WIGO 2024' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA WIGO 2024' AS v_name, @modelId_WIGO2024 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 606000516000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 606000516000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 606000516000, 'TOYOTA WIGO 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA WIGO 2024", "brand": "TOYOTA", "model": "WIGO 2024", "year": "2024", "original_price": "606000516000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/Vj755R1vKtgf6iS94Sn1xQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 606000516000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MG' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MG UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MG');
MERGE INTO models AS target
USING (SELECT 'ZS LUXURY' AS model_name, @brandId_MG AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ZSLUXURY UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'ZS LUXURY' AND b.name = 'MG');
MERGE INTO vehicles AS target
USING (SELECT 'MG ZS LUXURY 2021' AS v_name, @modelId_ZSLUXURY AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 739000639000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 739000639000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 739000639000, 'MG ZS LUXURY 2021', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "MG ZS LUXURY 2021", "brand": "MG", "model": "ZS LUXURY", "year": "2021", "original_price": "739000639000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/575uuVIeKs2nPEnH2DWgLQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 739000639000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HONDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HONDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HONDA');
MERGE INTO models AS target
USING (SELECT 'CITY RS' AS model_name, @brandId_HONDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CITYRS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CITY RS' AND b.name = 'HONDA');
MERGE INTO vehicles AS target
USING (SELECT 'HONDA CITY RS 2026' AS v_name, @modelId_CITYRS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 889000789000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 889000789000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 889000789000, 'HONDA CITY RS 2026', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "HONDA CITY RS 2026", "brand": "HONDA", "model": "CITY RS", "year": "2026", "original_price": "889000789000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/oJ1a13dZl7mZOJ1Yx69Ffg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 889000789000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'KIA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_KIA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'KIA');
MERGE INTO models AS target
USING (SELECT 'K5 PREMIUM' AS model_name, @brandId_KIA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_K5PREMIUM UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'K5 PREMIUM' AND b.name = 'KIA');
MERGE INTO vehicles AS target
USING (SELECT 'KIA K5 PREMIUM 2023' AS v_name, @modelId_K5PREMIUM AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 11900001070000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 11900001070000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 11900001070000, 'KIA K5 PREMIUM 2023', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "KIA K5 PREMIUM 2023", "brand": "KIA", "model": "K5 PREMIUM", "year": "2023", "original_price": "11900001070000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/eWxU3Lamz1GMgDq0uIIZkQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11900001070000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MG5' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MG5 UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MG5');
MERGE INTO models AS target
USING (SELECT '2025' AS model_name, @brandId_MG5 AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_2025 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = '2025' AND b.name = 'MG5');
MERGE INTO vehicles AS target
USING (SELECT 'MG5 2025' AS v_name, @modelId_2025 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 699000609000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 699000609000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 699000609000, 'MG5 2025', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "MG5 2025", "brand": "MG5", "model": "2025", "year": "2025", "original_price": "699000609000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/I_B1M8uQ00NFj5mEGpSd6w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 699000609000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'FORD' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_FORD UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'FORD');
MERGE INTO models AS target
USING (SELECT 'ECOSPORT 2015' AS model_name, @brandId_FORD AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ECOSPORT2015 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'ECOSPORT 2015' AND b.name = 'FORD');
MERGE INTO vehicles AS target
USING (SELECT 'FORD ECOSPORT 2015' AS v_name, @modelId_ECOSPORT2015 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 639000539000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 639000539000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 639000539000, 'FORD ECOSPORT 2015', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "FORD ECOSPORT 2015", "brand": "FORD", "model": "ECOSPORT 2015", "year": "2015", "original_price": "639000539000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/AkVa3pi-Rf25_MDnmA5Hgg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 639000539000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'VENUE 2024' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VENUE2024 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VENUE 2024' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI VENUE 2024' AS v_name, @modelId_VENUE2024 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 781000681000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 781000681000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 781000681000, 'HYUNDAI VENUE 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "HYUNDAI VENUE 2024", "brand": "HYUNDAI", "model": "VENUE 2024", "year": "2024", "original_price": "781000681000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/GQPnc87soLHTcmSJ-hVjeQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 781000681000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'FORD' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_FORD UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'FORD');
MERGE INTO models AS target
USING (SELECT 'FIESTA 2017' AS model_name, @brandId_FORD AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_FIESTA2017 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'FIESTA 2017' AND b.name = 'FORD');
MERGE INTO vehicles AS target
USING (SELECT 'FORD FIESTA 2017' AS v_name, @modelId_FIESTA2017 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 559000459000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 559000459000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 559000459000, 'FORD FIESTA 2017', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "FORD FIESTA 2017", "brand": "FORD", "model": "FIESTA 2017", "year": "2017", "original_price": "559000459000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/aY4xc1yQzmappR7QFD2yRA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 559000459000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MG5' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MG5 UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MG5');
MERGE INTO models AS target
USING (SELECT 'STANDARD 2022' AS model_name, @brandId_MG5 AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_STANDARD2022 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'STANDARD 2022' AND b.name = 'MG5');
MERGE INTO vehicles AS target
USING (SELECT 'MG5 STANDARD 2022' AS v_name, @modelId_STANDARD2022 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 709000619000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 709000619000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 709000619000, 'MG5 STANDARD 2022', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "MG5 STANDARD 2022", "brand": "MG5", "model": "STANDARD 2022", "year": "2022", "original_price": "709000619000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/kMP1gcqkL4bO_BGHMpq8lA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 709000619000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'FORD' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_FORD UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'FORD');
MERGE INTO models AS target
USING (SELECT 'ECOSPORT 2018' AS model_name, @brandId_FORD AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ECOSPORT2018 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'ECOSPORT 2018' AND b.name = 'FORD');
MERGE INTO vehicles AS target
USING (SELECT 'FORD ECOSPORT 2018' AS v_name, @modelId_ECOSPORT2018 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 659000559000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 659000559000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 659000559000, 'FORD ECOSPORT 2018', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "FORD ECOSPORT 2018", "brand": "FORD", "model": "ECOSPORT 2018", "year": "2018", "original_price": "659000559000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/5_s0eFOsHbothybuYQfkWQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 659000559000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'VINFAST' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_VINFAST UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'VINFAST');
MERGE INTO models AS target
USING (SELECT 'VF3 2024' AS model_name, @brandId_VINFAST AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VF32024 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VF3 2024' AND b.name = 'VINFAST');
MERGE INTO vehicles AS target
USING (SELECT 'VINFAST VF3 2024' AS v_name, @modelId_VF32024 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 505000425000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 505000425000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 505000425000, 'VINFAST VF3 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "VINFAST VF3 2024", "brand": "VINFAST", "model": "VF3 2024", "year": "2024", "original_price": "505000425000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/CX2S9Nx1gUc1uiiFcESYtw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 505000425000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MAZDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MAZDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MAZDA');
MERGE INTO models AS target
USING (SELECT '3 Deluxe' AS model_name, @brandId_MAZDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_3Deluxe UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = '3 Deluxe' AND b.name = 'MAZDA');
MERGE INTO vehicles AS target
USING (SELECT 'MAZDA 3 Deluxe 2016' AS v_name, @modelId_3Deluxe AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 689000589000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 689000589000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 689000589000, 'MAZDA 3 Deluxe 2016', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "MAZDA 3 Deluxe 2016", "brand": "MAZDA", "model": "3 Deluxe", "year": "2016", "original_price": "689000589000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/aY1fLMepoic-HXVAknU8ZA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 689000589000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'VIOS 2022' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VIOS2022 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VIOS 2022' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA VIOS 2022' AS v_name, @modelId_VIOS2022 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 680000580000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 680000580000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 680000580000, 'TOYOTA VIOS 2022', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA VIOS 2022", "brand": "TOYOTA", "model": "VIOS 2022", "year": "2022", "original_price": "680000580000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/JqaE5_AexA9lAG-AuHvC1Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 680000580000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'I10 2022' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_I102022 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'I10 2022' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI I10 2022' AS v_name, @modelId_I102022 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 606000516000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 606000516000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 606000516000, 'HYUNDAI I10 2022', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "HYUNDAI I10 2022", "brand": "HYUNDAI", "model": "I10 2022", "year": "2022", "original_price": "606000516000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/MrFaHb1w9RgOxtlLthPS9Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 606000516000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'STARGAZER PREMIUM' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_STARGAZERPREMIUM UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'STARGAZER PREMIUM' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI STARGAZER PREMIUM 2025' AS v_name, @modelId_STARGAZERPREMIUM AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 744000654000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 744000654000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 744000654000, 'HYUNDAI STARGAZER PREMIUM 2025', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "HYUNDAI STARGAZER PREMIUM 2025", "brand": "HYUNDAI", "model": "STARGAZER PREMIUM", "year": "2025", "original_price": "744000654000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/lLaKVFwANCZtgN6e26JujQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 744000654000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'SUZUKI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_SUZUKI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'SUZUKI');
MERGE INTO models AS target
USING (SELECT 'ERTIGA 2021' AS model_name, @brandId_SUZUKI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ERTIGA2021 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'ERTIGA 2021' AND b.name = 'SUZUKI');
MERGE INTO vehicles AS target
USING (SELECT 'SUZUKI ERTIGA 2021' AS v_name, @modelId_ERTIGA2021 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 653000563000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 653000563000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 653000563000, 'SUZUKI ERTIGA 2021', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "SUZUKI ERTIGA 2021", "brand": "SUZUKI", "model": "ERTIGA 2021", "year": "2021", "original_price": "653000563000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/lfAlzmbfAhTNNMp5Slop0A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 653000563000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'STARGAZER 2022' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_STARGAZER2022 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'STARGAZER 2022' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI STARGAZER 2022' AS v_name, @modelId_STARGAZER2022 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 707000617000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 707000617000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 707000617000, 'HYUNDAI STARGAZER 2022', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "HYUNDAI STARGAZER 2022", "brand": "HYUNDAI", "model": "STARGAZER 2022", "year": "2022", "original_price": "707000617000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/tlqMlg6QKkcrdJHJji8nkw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 707000617000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'VIOS 2024' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VIOS2024 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VIOS 2024' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA VIOS 2024' AS v_name, @modelId_VIOS2024 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 799000699000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 799000699000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 799000699000, 'TOYOTA VIOS 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA VIOS 2024", "brand": "TOYOTA", "model": "VIOS 2024", "year": "2024", "original_price": "799000699000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/rI1WiNN_JvX_fo-8wur0CA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 799000699000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'FORD' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_FORD UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'FORD');
MERGE INTO models AS target
USING (SELECT 'RANGER XLS' AS model_name, @brandId_FORD AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_RANGERXLS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'RANGER XLS' AND b.name = 'FORD');
MERGE INTO vehicles AS target
USING (SELECT 'FORD RANGER XLS 4x2 2023' AS v_name, @modelId_RANGERXLS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1025000905000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1025000905000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1025000905000, 'FORD RANGER XLS 4x2 2023', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "FORD RANGER XLS 4x2 2023", "brand": "FORD", "model": "RANGER XLS", "year": "2023", "original_price": "1025000905000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/gAIz-OQ-NYih_0Sc-1LnQQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1025000905000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'CHEVROLET' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_CHEVROLET UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'CHEVROLET');
MERGE INTO models AS target
USING (SELECT 'CRUZE 2017' AS model_name, @brandId_CHEVROLET AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CRUZE2017 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CRUZE 2017' AND b.name = 'CHEVROLET');
MERGE INTO vehicles AS target
USING (SELECT 'CHEVROLET CRUZE 2017' AS v_name, @modelId_CRUZE2017 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 659000569000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 659000569000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 659000569000, 'CHEVROLET CRUZE 2017', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "CHEVROLET CRUZE 2017", "brand": "CHEVROLET", "model": "CRUZE 2017", "year": "2017", "original_price": "659000569000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/Ryuxyx2sgdHFkd-lLG1heg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 659000569000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'COROLLA ALTIS' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_COROLLAALTIS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'COROLLA ALTIS' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA COROLLA ALTIS 2015' AS v_name, @modelId_COROLLAALTIS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 809000689000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 809000689000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 809000689000, 'TOYOTA COROLLA ALTIS 2015', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA COROLLA ALTIS 2015", "brand": "TOYOTA", "model": "COROLLA ALTIS", "year": "2015", "original_price": "809000689000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/EKGFrV1Hlme3SXfYzbWy_Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 809000689000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MG5' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MG5 UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MG5');
MERGE INTO models AS target
USING (SELECT 'LUXURY 2024' AS model_name, @brandId_MG5 AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_LUXURY2024 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'LUXURY 2024' AND b.name = 'MG5');
MERGE INTO vehicles AS target
USING (SELECT 'MG5 LUXURY 2024' AS v_name, @modelId_LUXURY2024 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 819000729000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 819000729000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 819000729000, 'MG5 LUXURY 2024', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "MG5 LUXURY 2024", "brand": "MG5", "model": "LUXURY 2024", "year": "2024", "original_price": "819000729000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/gMjNfCxSUY347OVsuxmyYg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 819000729000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'FORTUNER 2011' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_FORTUNER2011 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'FORTUNER 2011' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA FORTUNER 2011' AS v_name, @modelId_FORTUNER2011 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 753000633000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 753000633000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 753000633000, 'TOYOTA FORTUNER 2011', 'Phường Linh Đông, Quận Thủ Đức', '{"source": "MIOTO", "name": "TOYOTA FORTUNER 2011", "brand": "TOYOTA", "model": "FORTUNER 2011", "year": "2011", "original_price": "753000633000", "location": "Phường Linh Đông, Quận Thủ Đức", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/efJLAopLjOLponIMDag1Sg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 753000633000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'VINFAST' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_VINFAST UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'VINFAST');
MERGE INTO models AS target
USING (SELECT 'VF3 2025' AS model_name, @brandId_VINFAST AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VF32025 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VF3 2025' AND b.name = 'VINFAST');
MERGE INTO vehicles AS target
USING (SELECT 'VINFAST VF3 2025' AS v_name, @modelId_VF32025 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 574000524000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 574000524000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 574000524000, 'VINFAST VF3 2025', 'Phường 19, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF3 2025", "brand": "VINFAST", "model": "VF3 2025", "year": "2025", "original_price": "574000524000", "location": "Phường 19, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/7I4fvjUbs9lYoLbKFkfFxQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 574000524000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'SUZUKI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_SUZUKI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'SUZUKI');
MERGE INTO models AS target
USING (SELECT 'XL7 2020' AS model_name, @brandId_SUZUKI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_XL72020 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'XL7 2020' AND b.name = 'SUZUKI');
MERGE INTO vehicles AS target
USING (SELECT 'SUZUKI XL7 2020' AS v_name, @modelId_XL72020 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 964000844000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 964000844000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 964000844000, 'SUZUKI XL7 2020', 'Phường 07, Quận Phú Nhuận', '{"source": "MIOTO", "name": "SUZUKI XL7 2020", "brand": "SUZUKI", "model": "XL7 2020", "year": "2020", "original_price": "964000844000", "location": "Phường 07, Quận Phú Nhuận", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/ODY7O7WolNKmCd5-8gZgFA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 964000844000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MITSUBISHI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MITSUBISHI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MITSUBISHI');
MERGE INTO models AS target
USING (SELECT 'XPANDER 2021' AS model_name, @brandId_MITSUBISHI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_XPANDER2021 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'XPANDER 2021' AND b.name = 'MITSUBISHI');
MERGE INTO vehicles AS target
USING (SELECT 'MITSUBISHI XPANDER 2021' AS v_name, @modelId_XPANDER2021 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 970000850000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 970000850000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 970000850000, 'MITSUBISHI XPANDER 2021', 'Phường 15, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2021", "brand": "MITSUBISHI", "model": "XPANDER 2021", "year": "2021", "original_price": "970000850000", "location": "Phường 15, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/1YnuDhXWF1OyH4RxO7CMzg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 970000850000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MITSUBISHI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MITSUBISHI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MITSUBISHI');
MERGE INTO models AS target
USING (SELECT 'XPANDER 2026' AS model_name, @brandId_MITSUBISHI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_XPANDER2026 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'XPANDER 2026' AND b.name = 'MITSUBISHI');
MERGE INTO vehicles AS target
USING (SELECT 'MITSUBISHI XPANDER 2026' AS v_name, @modelId_XPANDER2026 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1032000912000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1032000912000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1032000912000, 'MITSUBISHI XPANDER 2026', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2026", "brand": "MITSUBISHI", "model": "XPANDER 2026", "year": "2026", "original_price": "1032000912000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/Iwdr-3JTOOiA9MojrprwfA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1032000912000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'VINFAST' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_VINFAST UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'VINFAST');
MERGE INTO models AS target
USING (SELECT 'VF6 PLUS' AS model_name, @brandId_VINFAST AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VF6PLUS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VF6 PLUS' AND b.name = 'VINFAST');
MERGE INTO vehicles AS target
USING (SELECT 'VINFAST VF6 PLUS 2025' AS v_name, @modelId_VF6PLUS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1032000952000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1032000952000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1032000952000, 'VINFAST VF6 PLUS 2025', 'Phường Tân Định, Quận 1', '{"source": "MIOTO", "name": "VINFAST VF6 PLUS 2025", "brand": "VINFAST", "model": "VF6 PLUS", "year": "2025", "original_price": "1032000952000", "location": "Phường Tân Định, Quận 1", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/uek-z1NXY8xBx-Jxha41Hw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1032000952000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'FORD' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_FORD UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'FORD');
MERGE INTO models AS target
USING (SELECT 'EVEREST TITANIUM' AS model_name, @brandId_FORD AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_EVERESTTITANIUM UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'EVEREST TITANIUM' AND b.name = 'FORD');
MERGE INTO vehicles AS target
USING (SELECT 'FORD EVEREST TITANIUM 2018' AS v_name, @modelId_EVERESTTITANIUM AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 14120001292000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 14120001292000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 14120001292000, 'FORD EVEREST TITANIUM 2018', 'Phường 02, Quận Bình Thạnh', '{"source": "MIOTO", "name": "FORD EVEREST TITANIUM 2018", "brand": "FORD", "model": "EVEREST TITANIUM", "year": "2018", "original_price": "14120001292000", "location": "Phường 02, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/9X5TNrvNtAX-ZU8B3VbOAA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 14120001292000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'VINFAST' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_VINFAST UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'VINFAST');
MERGE INTO models AS target
USING (SELECT 'VF8 PLUS' AS model_name, @brandId_VINFAST AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VF8PLUS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VF8 PLUS' AND b.name = 'VINFAST');
MERGE INTO vehicles AS target
USING (SELECT 'VINFAST VF8 PLUS 2025' AS v_name, @modelId_VF8PLUS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 14910001411000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 14910001411000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 14910001411000, 'VINFAST VF8 PLUS 2025', 'Phường 25, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF8 PLUS 2025", "brand": "VINFAST", "model": "VF8 PLUS", "year": "2025", "original_price": "14910001411000", "location": "Phường 25, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/JfpIYaWlNB-N9N2mZG4OBg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 14910001411000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'STARGAZER PREMIUM' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_STARGAZERPREMIUM UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'STARGAZER PREMIUM' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI STARGAZER PREMIUM 2023' AS v_name, @modelId_STARGAZERPREMIUM AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1033000913000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1033000913000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000913000, 'HYUNDAI STARGAZER PREMIUM 2023', 'Phường Đa Kao, Quận 1', '{"source": "MIOTO", "name": "HYUNDAI STARGAZER PREMIUM 2023", "brand": "HYUNDAI", "model": "STARGAZER PREMIUM", "year": "2023", "original_price": "1033000913000", "location": "Phường Đa Kao, Quận 1", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/L4QmnhrmAiqGYQVxrPOPcQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000913000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'KIA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_KIA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'KIA');
MERGE INTO models AS target
USING (SELECT 'SEDONA LUXURY' AS model_name, @brandId_KIA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_SEDONALUXURY UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'SEDONA LUXURY' AND b.name = 'KIA');
MERGE INTO vehicles AS target
USING (SELECT 'KIA SEDONA LUXURY 2021' AS v_name, @modelId_SEDONALUXURY AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 15500001430000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 15500001430000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 15500001430000, 'KIA SEDONA LUXURY 2021', 'Phường Đa Kao, Quận 1', '{"source": "MIOTO", "name": "KIA SEDONA LUXURY 2021", "brand": "KIA", "model": "SEDONA LUXURY", "year": "2021", "original_price": "15500001430000", "location": "Phường Đa Kao, Quận 1", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/Sypl2bnH2qLUvY7Og_c4mA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 15500001430000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'VINFAST' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_VINFAST UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'VINFAST');
MERGE INTO models AS target
USING (SELECT 'VF6 PLUS' AS model_name, @brandId_VINFAST AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VF6PLUS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VF6 PLUS' AND b.name = 'VINFAST');
MERGE INTO vehicles AS target
USING (SELECT 'VINFAST VF6 PLUS 2026' AS v_name, @modelId_VF6PLUS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 10890001009000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 10890001009000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 10890001009000, 'VINFAST VF6 PLUS 2026', 'Phường 24, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF6 PLUS 2026", "brand": "VINFAST", "model": "VF6 PLUS", "year": "2026", "original_price": "10890001009000", "location": "Phường 24, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/bqT-hCNnhoexoZQvJpDC0g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 10890001009000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'VINFAST' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_VINFAST UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'VINFAST');
MERGE INTO models AS target
USING (SELECT 'VF5 2025' AS model_name, @brandId_VINFAST AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VF52025 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VF5 2025' AND b.name = 'VINFAST');
MERGE INTO vehicles AS target
USING (SELECT 'VINFAST VF5 2025' AS v_name, @modelId_VF52025 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 860000785000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 860000785000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 860000785000, 'VINFAST VF5 2025', 'Phường 25, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF5 2025", "brand": "VINFAST", "model": "VF5 2025", "year": "2025", "original_price": "860000785000", "location": "Phường 25, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/nlbOOkj7qsh8RExgMv9xYQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 860000785000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'INNOVA 2019' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_INNOVA2019 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'INNOVA 2019' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA INNOVA 2019' AS v_name, @modelId_INNOVA2019 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 962000842000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 962000842000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 962000842000, 'TOYOTA INNOVA 2019', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2019", "brand": "TOYOTA", "model": "INNOVA 2019", "year": "2019", "original_price": "962000842000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/S2iZd1bwTm-xz4ZLQuIxTQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 962000842000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'VINFAST' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_VINFAST UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'VINFAST');
MERGE INTO models AS target
USING (SELECT 'VF6 ECO' AS model_name, @brandId_VINFAST AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VF6ECO UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VF6 ECO' AND b.name = 'VINFAST');
MERGE INTO vehicles AS target
USING (SELECT 'VINFAST VF6 ECO 2024' AS v_name, @modelId_VF6ECO AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 917000837000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 917000837000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 917000837000, 'VINFAST VF6 ECO 2024', 'Phường 05, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF6 ECO 2024", "brand": "VINFAST", "model": "VF6 ECO", "year": "2024", "original_price": "917000837000", "location": "Phường 05, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/HgkN0X0Fw-wTI16V5I63Bw.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 917000837000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'VINFAST' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_VINFAST UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'VINFAST');
MERGE INTO models AS target
USING (SELECT 'VF3 2026' AS model_name, @brandId_VINFAST AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VF32026 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VF3 2026' AND b.name = 'VINFAST');
MERGE INTO vehicles AS target
USING (SELECT 'VINFAST VF3 2026' AS v_name, @modelId_VF32026 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 631000576000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 631000576000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 631000576000, 'VINFAST VF3 2026', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST VF3 2026", "brand": "VINFAST", "model": "VF3 2026", "year": "2026", "original_price": "631000576000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/mE43x9VoCMwPXjmSoHIFZg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 631000576000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MITSUBISHI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MITSUBISHI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MITSUBISHI');
MERGE INTO models AS target
USING (SELECT 'XPANDER CROSS' AS model_name, @brandId_MITSUBISHI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_XPANDERCROSS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'XPANDER CROSS' AND b.name = 'MITSUBISHI');
MERGE INTO vehicles AS target
USING (SELECT 'MITSUBISHI XPANDER CROSS 2023' AS v_name, @modelId_XPANDERCROSS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 11480001028000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 11480001028000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 11480001028000, 'MITSUBISHI XPANDER CROSS 2023', 'Phường Đa Kao, Quận 1', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER CROSS 2023", "brand": "MITSUBISHI", "model": "XPANDER CROSS", "year": "2023", "original_price": "11480001028000", "location": "Phường Đa Kao, Quận 1", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/0diL2az9yFx7Rt694chPJQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11480001028000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MITSUBISHI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MITSUBISHI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MITSUBISHI');
MERGE INTO models AS target
USING (SELECT 'XPANDER 2019' AS model_name, @brandId_MITSUBISHI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_XPANDER2019 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'XPANDER 2019' AND b.name = 'MITSUBISHI');
MERGE INTO vehicles AS target
USING (SELECT 'MITSUBISHI XPANDER 2019' AS v_name, @modelId_XPANDER2019 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 918000798000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 918000798000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 918000798000, 'MITSUBISHI XPANDER 2019', 'Phường 11, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2019", "brand": "MITSUBISHI", "model": "XPANDER 2019", "year": "2019", "original_price": "918000798000", "location": "Phường 11, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/ML8NqEGz975K1yWa9Di8rg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 918000798000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'CUSTIN LUXURY' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CUSTINLUXURY UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CUSTIN LUXURY' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI CUSTIN LUXURY 2024' AS v_name, @modelId_CUSTINLUXURY AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 13510001231000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 13510001231000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 13510001231000, 'HYUNDAI CUSTIN LUXURY 2024', 'Phường 24, Quận Bình Thạnh', '{"source": "MIOTO", "name": "HYUNDAI CUSTIN LUXURY 2024", "brand": "HYUNDAI", "model": "CUSTIN LUXURY", "year": "2024", "original_price": "13510001231000", "location": "Phường 24, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/Nin7XkDV1D_VQE5FOVlM4w.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 13510001231000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'INNOVA 2015' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_INNOVA2015 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'INNOVA 2015' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA INNOVA 2015' AS v_name, @modelId_INNOVA2015 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 838000718000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 838000718000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 838000718000, 'TOYOTA INNOVA 2015', 'Phường 11, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2015", "brand": "TOYOTA", "model": "INNOVA 2015", "year": "2015", "original_price": "838000718000", "location": "Phường 11, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/1Dz7-UR4netnSFV22bJp-g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 838000718000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MITSUBISHI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MITSUBISHI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MITSUBISHI');
MERGE INTO models AS target
USING (SELECT 'XPANDER 2022' AS model_name, @brandId_MITSUBISHI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_XPANDER2022 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'XPANDER 2022' AND b.name = 'MITSUBISHI');
MERGE INTO vehicles AS target
USING (SELECT 'MITSUBISHI XPANDER 2022' AS v_name, @modelId_XPANDER2022 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 976000856000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 976000856000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 976000856000, 'MITSUBISHI XPANDER 2022', 'Phường 22, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2022", "brand": "MITSUBISHI", "model": "XPANDER 2022", "year": "2022", "original_price": "976000856000", "location": "Phường 22, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/abMXSvZ9SunczZ2poox15g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 976000856000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HONDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HONDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HONDA');
MERGE INTO models AS target
USING (SELECT 'CRV G' AS model_name, @brandId_HONDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CRVG UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CRV G' AND b.name = 'HONDA');
MERGE INTO vehicles AS target
USING (SELECT 'HONDA CRV G 2018' AS v_name, @modelId_CRVG AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 11820001062000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 11820001062000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 11820001062000, 'HONDA CRV G 2018', 'Phường Bến Nghé, Quận 1', '{"source": "MIOTO", "name": "HONDA CRV G 2018", "brand": "HONDA", "model": "CRV G", "year": "2018", "original_price": "11820001062000", "location": "Phường Bến Nghé, Quận 1", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/hOCJ44honJTABQRbEp57mA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 11820001062000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'INNOVA 2021' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_INNOVA2021 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'INNOVA 2021' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA INNOVA 2021' AS v_name, @modelId_INNOVA2021 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1033000913000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1033000913000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000913000, 'TOYOTA INNOVA 2021', 'Phường 22, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA INNOVA 2021", "brand": "TOYOTA", "model": "INNOVA 2021", "year": "2021", "original_price": "1033000913000", "location": "Phường 22, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/o0VDALKvyQcnrOFJ9LwzPA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000913000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'ISUZU' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_ISUZU UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'ISUZU');
MERGE INTO models AS target
USING (SELECT 'MUX 4X2' AS model_name, @brandId_ISUZU AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_MUX4X2 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'MUX 4X2' AND b.name = 'ISUZU');
MERGE INTO vehicles AS target
USING (SELECT 'ISUZU MUX 4X2 2016' AS v_name, @modelId_MUX4X2 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1068000948000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1068000948000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1068000948000, 'ISUZU MUX 4X2 2016', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "ISUZU MUX 4X2 2016", "brand": "ISUZU", "model": "MUX 4X2", "year": "2016", "original_price": "1068000948000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/R-JTuuyK6Sajt0wORYFJ8g.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1068000948000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MITSUBISHI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MITSUBISHI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MITSUBISHI');
MERGE INTO models AS target
USING (SELECT 'XPANDER CROSS' AS model_name, @brandId_MITSUBISHI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_XPANDERCROSS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'XPANDER CROSS' AND b.name = 'MITSUBISHI');
MERGE INTO vehicles AS target
USING (SELECT 'MITSUBISHI XPANDER CROSS 2021' AS v_name, @modelId_XPANDERCROSS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 804000684000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 804000684000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 804000684000, 'MITSUBISHI XPANDER CROSS 2021', 'Phường 25, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER CROSS 2021", "brand": "MITSUBISHI", "model": "XPANDER CROSS", "year": "2021", "original_price": "804000684000", "location": "Phường 25, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/gONn_griqXuNh8jKXXrLpA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 804000684000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'VINFAST' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_VINFAST UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'VINFAST');
MERGE INTO models AS target
USING (SELECT 'LIMO GREEN' AS model_name, @brandId_VINFAST AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_LIMOGREEN UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'LIMO GREEN' AND b.name = 'VINFAST');
MERGE INTO vehicles AS target
USING (SELECT 'VINFAST LIMO GREEN 2025' AS v_name, @modelId_LIMOGREEN AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 13640001284000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 13640001284000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 13640001284000, 'VINFAST LIMO GREEN 2025', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "VINFAST LIMO GREEN 2025", "brand": "VINFAST", "model": "LIMO GREEN", "year": "2025", "original_price": "13640001284000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/DTaeGWvUARRukkQp_yTr3Q.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 13640001284000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'CHEVROLET' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_CHEVROLET UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'CHEVROLET');
MERGE INTO models AS target
USING (SELECT 'SPARK 2016' AS model_name, @brandId_CHEVROLET AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_SPARK2016 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'SPARK 2016' AND b.name = 'CHEVROLET');
MERGE INTO vehicles AS target
USING (SELECT 'CHEVROLET SPARK 2016' AS v_name, @modelId_SPARK2016 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 530000450000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 530000450000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 530000450000, 'CHEVROLET SPARK 2016', 'Phường 22, Quận Bình Thạnh', '{"source": "MIOTO", "name": "CHEVROLET SPARK 2016", "brand": "CHEVROLET", "model": "SPARK 2016", "year": "2016", "original_price": "530000450000", "location": "Phường 22, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/zNeIGSg73oZ45JdK0NY6aQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 530000450000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MITSUBISHI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MITSUBISHI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MITSUBISHI');
MERGE INTO models AS target
USING (SELECT 'XPANDER 2023' AS model_name, @brandId_MITSUBISHI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_XPANDER2023 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'XPANDER 2023' AND b.name = 'MITSUBISHI');
MERGE INTO vehicles AS target
USING (SELECT 'MITSUBISHI XPANDER 2023' AS v_name, @modelId_XPANDER2023 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1033000913000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1033000913000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1033000913000, 'MITSUBISHI XPANDER 2023', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2023", "brand": "MITSUBISHI", "model": "XPANDER 2023", "year": "2023", "original_price": "1033000913000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/6IGkTyBnRzvedOZvycZrkQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1033000913000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'KIA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_KIA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'KIA');
MERGE INTO models AS target
USING (SELECT 'CARNIVAL PREMIUM' AS model_name, @brandId_KIA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CARNIVALPREMIUM UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CARNIVAL PREMIUM' AND b.name = 'KIA');
MERGE INTO vehicles AS target
USING (SELECT 'KIA CARNIVAL PREMIUM 2022' AS v_name, @modelId_CARNIVALPREMIUM AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 20490001929000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 20490001929000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 20490001929000, 'KIA CARNIVAL PREMIUM 2022', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "KIA CARNIVAL PREMIUM 2022", "brand": "KIA", "model": "CARNIVAL PREMIUM", "year": "2022", "original_price": "20490001929000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/c4WqnlJycm9Y8Q9ts6Dpxg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 20490001929000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MG' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MG UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MG');
MERGE INTO models AS target
USING (SELECT 'G50 LUXURY' AS model_name, @brandId_MG AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_G50LUXURY UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'G50 LUXURY' AND b.name = 'MG');
MERGE INTO vehicles AS target
USING (SELECT 'MG G50 LUXURY 2026' AS v_name, @modelId_G50LUXURY AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 14520001332000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 14520001332000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 14520001332000, 'MG G50 LUXURY 2026', 'Phường 05, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MG G50 LUXURY 2026", "brand": "MG", "model": "G50 LUXURY", "year": "2026", "original_price": "14520001332000", "location": "Phường 05, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/LaJRKx7NnRhNbXRwKdvNtA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 14520001332000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'KIA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_KIA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'KIA');
MERGE INTO models AS target
USING (SELECT 'SORENTO DELUXE' AS model_name, @brandId_KIA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_SORENTODELUXE UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'SORENTO DELUXE' AND b.name = 'KIA');
MERGE INTO vehicles AS target
USING (SELECT 'KIA SORENTO DELUXE 2018' AS v_name, @modelId_SORENTODELUXE AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 12380001118000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 12380001118000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 12380001118000, 'KIA SORENTO DELUXE 2018', 'Phường 07, Quận Bình Thạnh', '{"source": "MIOTO", "name": "KIA SORENTO DELUXE 2018", "brand": "KIA", "model": "SORENTO DELUXE", "year": "2018", "original_price": "12380001118000", "location": "Phường 07, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/WukVX0x4vCmIcqtFN5ikxQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12380001118000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MITSUBISHI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MITSUBISHI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MITSUBISHI');
MERGE INTO models AS target
USING (SELECT 'XPANDER 2024' AS model_name, @brandId_MITSUBISHI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_XPANDER2024 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'XPANDER 2024' AND b.name = 'MITSUBISHI');
MERGE INTO vehicles AS target
USING (SELECT 'MITSUBISHI XPANDER 2024' AS v_name, @modelId_XPANDER2024 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1010000890000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1010000890000, 5, 'Auto', 'Gasoline', '', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1010000890000, 'MITSUBISHI XPANDER 2024', 'Phường 17, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2024", "brand": "MITSUBISHI", "model": "XPANDER 2024", "year": "2024", "original_price": "1010000890000", "location": "Phường 17, Quận Bình Thạnh", "image_url": "./Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ_files/YgMLzSw6cRUgQVYYOlKShA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1010000890000, "local_image_url": ""}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MITSUBISHI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MITSUBISHI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MITSUBISHI');
MERGE INTO models AS target
USING (SELECT 'XPANDER 2020' AS model_name, @brandId_MITSUBISHI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_XPANDER2020 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'XPANDER 2020' AND b.name = 'MITSUBISHI');
MERGE INTO vehicles AS target
USING (SELECT 'MITSUBISHI XPANDER 2020' AS v_name, @modelId_XPANDER2020 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 861000741000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_mitsubishi_xpander 2020_2020_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 861000741000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_mitsubishi_xpander 2020_2020_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 861000741000, 'MITSUBISHI XPANDER 2020', 'Phường 14, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MITSUBISHI XPANDER 2020", "brand": "MITSUBISHI", "model": "XPANDER 2020", "year": "2020", "original_price": "861000741000", "location": "Phường 14, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_2020/p/g/2024/02/07/10/KhvOqyr-oT7GO_TCW7YsEA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 861000741000, "local_image_url": "/images/cars/MIOTO_mitsubishi_xpander 2020_2020_mioto.jpg"}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'VELOZ CROSS' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VELOZCROSS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VELOZ CROSS' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA VELOZ CROSS 2025' AS v_name, @modelId_VELOZCROSS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 12750001155000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_toyota_veloz cross_2025_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 12750001155000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_toyota_veloz cross_2025_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 12750001155000, 'TOYOTA VELOZ CROSS 2025', 'Phường 22, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA VELOZ CROSS 2025", "brand": "TOYOTA", "model": "VELOZ CROSS", "year": "2025", "original_price": "12750001155000", "location": "Phường 22, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_veloz_cross_2025/p/g/2025/06/17/22/QWMSgQvdQGKVGA8UUQ505A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 12750001155000, "local_image_url": "/images/cars/MIOTO_toyota_veloz cross_2025_mioto.jpg"}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MG5' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MG5 UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MG5');
MERGE INTO models AS target
USING (SELECT 'LUXURY 2023' AS model_name, @brandId_MG5 AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_LUXURY2023 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'LUXURY 2023' AND b.name = 'MG5');
MERGE INTO vehicles AS target
USING (SELECT 'MG5 LUXURY 2023' AS v_name, @modelId_LUXURY2023 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 998000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_mg5_luxury 2023_2023_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 998000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_mg5_luxury 2023_2023_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 998000, 'MG5 LUXURY 2023', 'Phường 01, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MG5 LUXURY 2023", "brand": "MG5", "model": "LUXURY 2023", "year": "2023", "original_price": "998000", "location": "Phường 01, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mg5_luxury_2023/p/g/2024/07/12/20/o09l4JvWAhET8gGFtTnb_A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 998000, "local_image_url": "/images/cars/MIOTO_mg5_luxury 2023_2023_mioto.jpg"}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HYUNDAI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HYUNDAI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HYUNDAI');
MERGE INTO models AS target
USING (SELECT 'CRETA LUXURY' AS model_name, @brandId_HYUNDAI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CRETALUXURY UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CRETA LUXURY' AND b.name = 'HYUNDAI');
MERGE INTO vehicles AS target
USING (SELECT 'HYUNDAI CRETA LUXURY 2025' AS v_name, @modelId_CRETALUXURY AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1147000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_hyundai_creta luxury_2025_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1147000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_hyundai_creta luxury_2025_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1147000, 'HYUNDAI CRETA LUXURY 2025', 'Phường 25, Quận Bình Thạnh', '{"source": "MIOTO", "name": "HYUNDAI CRETA LUXURY 2025", "brand": "HYUNDAI", "model": "CRETA LUXURY", "year": "2025", "original_price": "1147000", "location": "Phường 25, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_creta_luxury_2025/p/g/2026/01/19/22/YeqKSNj6QQ7ggO8hj6DeDQ.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1147000, "local_image_url": "/images/cars/MIOTO_hyundai_creta luxury_2025_mioto.jpg"}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'VIOS 2017' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_VIOS2017 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'VIOS 2017' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA VIOS 2017' AS v_name, @modelId_VIOS2017 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 574000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_toyota_vios 2017_2017_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 574000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_toyota_vios 2017_2017_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 574000, 'TOYOTA VIOS 2017', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA VIOS 2017", "brand": "TOYOTA", "model": "VIOS 2017", "year": "2017", "original_price": "574000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_vios_2017/p/g/2025/05/11/09/V-nonpJ_dIpWyw1ztNi-HA.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 574000, "local_image_url": "/images/cars/MIOTO_toyota_vios 2017_2017_mioto.jpg"}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'FORD' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_FORD UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'FORD');
MERGE INTO models AS target
USING (SELECT 'ECOSPORT 2017' AS model_name, @brandId_FORD AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_ECOSPORT2017 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'ECOSPORT 2017' AND b.name = 'FORD');
MERGE INTO vehicles AS target
USING (SELECT 'FORD ECOSPORT 2017' AS v_name, @modelId_ECOSPORT2017 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 850000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_ford_ecosport 2017_2017_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 850000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_ford_ecosport 2017_2017_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 850000, 'FORD ECOSPORT 2017', 'Phường 08, Quận 3', '{"source": "MIOTO", "name": "FORD ECOSPORT 2017", "brand": "FORD", "model": "ECOSPORT 2017", "year": "2017", "original_price": "850000", "location": "Phường 08, Quận 3", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/ford_ecosport_2017/p/g/2025/07/08/19/Zn8KZ1mOVwJHT_06hGd6ug.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 850000, "local_image_url": "/images/cars/MIOTO_ford_ecosport 2017_2017_mioto.jpg"}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'HONDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_HONDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'HONDA');
MERGE INTO models AS target
USING (SELECT 'CIVIC RS' AS model_name, @brandId_HONDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CIVICRS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CIVIC RS' AND b.name = 'HONDA');
MERGE INTO vehicles AS target
USING (SELECT 'HONDA CIVIC RS 2020' AS v_name, @modelId_CIVICRS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1288000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_honda_civic rs_2020_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1288000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_honda_civic rs_2020_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1288000, 'HONDA CIVIC RS 2020', 'Phường Bến Nghé, Quận 1', '{"source": "MIOTO", "name": "HONDA CIVIC RS 2020", "brand": "HONDA", "model": "CIVIC RS", "year": "2020", "original_price": "1288000", "location": "Phường Bến Nghé, Quận 1", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_civic_rs_2020/p/g/2024/07/11/21/_7ctTWixrbhCqu9nLUjrBg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1288000, "local_image_url": "/images/cars/MIOTO_honda_civic rs_2020_mioto.jpg"}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'SUZUKI' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_SUZUKI UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'SUZUKI');
MERGE INTO models AS target
USING (SELECT 'CIAZ 2021' AS model_name, @brandId_SUZUKI AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CIAZ2021 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CIAZ 2021' AND b.name = 'SUZUKI');
MERGE INTO vehicles AS target
USING (SELECT 'SUZUKI CIAZ 2021' AS v_name, @modelId_CIAZ2021 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 734000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_suzuki_ciaz 2021_2021_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 734000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_suzuki_ciaz 2021_2021_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 734000, 'SUZUKI CIAZ 2021', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "SUZUKI CIAZ 2021", "brand": "SUZUKI", "model": "CIAZ 2021", "year": "2021", "original_price": "734000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/suzuki_ciaz_2021/p/g/2024/04/02/15/kwaHxl_pXMY1lbgYCkOCBg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 734000, "local_image_url": "/images/cars/MIOTO_suzuki_ciaz 2021_2021_mioto.jpg"}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'MAZDA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_MAZDA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'MAZDA');
MERGE INTO models AS target
USING (SELECT '6 PREMIUM' AS model_name, @brandId_MAZDA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_6PREMIUM UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = '6 PREMIUM' AND b.name = 'MAZDA');
MERGE INTO vehicles AS target
USING (SELECT 'MAZDA 6 PREMIUM 2018' AS v_name, @modelId_6PREMIUM AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1091000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_mazda_6 premium_2018_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1091000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_mazda_6 premium_2018_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1091000, 'MAZDA 6 PREMIUM 2018', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "MAZDA 6 PREMIUM 2018", "brand": "MAZDA", "model": "6 PREMIUM", "year": "2018", "original_price": "1091000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mazda_6_premium_2018/p/g/2026/02/05/19/_Qg0wHqTIg6bWYEAR0xDKg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1091000, "local_image_url": "/images/cars/MIOTO_mazda_6 premium_2018_mioto.jpg"}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'SUBARU' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_SUBARU UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'SUBARU');
MERGE INTO models AS target
USING (SELECT 'FORESTER 2.0i-S' AS model_name, @brandId_SUBARU AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_FORESTER2.0i-S UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'FORESTER 2.0i-S' AND b.name = 'SUBARU');
MERGE INTO vehicles AS target
USING (SELECT 'SUBARU FORESTER 2.0i-S Eyesight 2024' AS v_name, @modelId_FORESTER2.0i-S AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1597000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_subaru_forester 2.0i-s_2024_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1597000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_subaru_forester 2.0i-s_2024_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1597000, 'SUBARU FORESTER 2.0i-S Eyesight 2024', 'Phường 11, Quận Bình Thạnh', '{"source": "MIOTO", "name": "SUBARU FORESTER 2.0i-S Eyesight 2024", "brand": "SUBARU", "model": "FORESTER 2.0i-S", "year": "2024", "original_price": "1597000", "location": "Phường 11, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/subaru_forester_2.0i-s_eyesight_2024/p/g/2026/05/09/15/xoPN3eQof3zsSzWjfiLDjg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1597000, "local_image_url": "/images/cars/MIOTO_subaru_forester 2.0i-s_2024_mioto.jpg"}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'CHEVROLET' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_CHEVROLET UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'CHEVROLET');
MERGE INTO models AS target
USING (SELECT 'CRUZE 2018' AS model_name, @brandId_CHEVROLET AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_CRUZE2018 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'CRUZE 2018' AND b.name = 'CHEVROLET');
MERGE INTO vehicles AS target
USING (SELECT 'CHEVROLET CRUZE 2018' AS v_name, @modelId_CRUZE2018 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 700000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_chevrolet_cruze 2018_2018_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 700000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_chevrolet_cruze 2018_2018_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 700000, 'CHEVROLET CRUZE 2018', 'Phường 26, Quận Bình Thạnh', '{"source": "MIOTO", "name": "CHEVROLET CRUZE 2018", "brand": "CHEVROLET", "model": "CRUZE 2018", "year": "2018", "original_price": "700000", "location": "Phường 26, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/chevrolet_cruze_2018/p/g/2023/07/29/13/G4SYK5MaIlUYzgW335Vf8A.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 700000, "local_image_url": "/images/cars/MIOTO_chevrolet_cruze 2018_2018_mioto.jpg"}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'TOYOTA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_TOYOTA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'TOYOTA');
MERGE INTO models AS target
USING (SELECT 'COROLLA CROSS' AS model_name, @brandId_TOYOTA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_COROLLACROSS UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'COROLLA CROSS' AND b.name = 'TOYOTA');
MERGE INTO vehicles AS target
USING (SELECT 'TOYOTA COROLLA CROSS G 2020' AS v_name, @modelId_COROLLACROSS AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 1112000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_toyota_corolla cross_2020_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 1112000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_toyota_corolla cross_2020_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 1112000, 'TOYOTA COROLLA CROSS G 2020', 'Phường 05, Quận Bình Thạnh', '{"source": "MIOTO", "name": "TOYOTA COROLLA CROSS G 2020", "brand": "TOYOTA", "model": "COROLLA CROSS", "year": "2020", "original_price": "1112000", "location": "Phường 05, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_corolla_cross_g_2020/p/g/2024/02/22/11/JpG4c0R-Vu6Z73SBZzJ7xg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 1112000, "local_image_url": "/images/cars/MIOTO_toyota_corolla cross_2020_mioto.jpg"}');
\nGO\n\n
MERGE INTO brands AS target
USING (SELECT 'KIA' AS brand_name) AS source
ON target.name = source.brand_name
WHEN NOT MATCHED THEN
    INSERT (id, name, description, created_at, updated_at)
    VALUES (NEWID(), source.brand_name, 'Scraped brand', GETDATE(), GETDATE());
\n
DECLARE @brandId_KIA UNIQUEIDENTIFIER = (SELECT id FROM brands WHERE name = 'KIA');
MERGE INTO models AS target
USING (SELECT 'RONDO 2019' AS model_name, @brandId_KIA AS b_id) AS source
ON target.name = source.model_name AND target.brand_id = source.b_id
WHEN NOT MATCHED THEN
    INSERT (id, name, brand_id, created_at, updated_at)
    VALUES (NEWID(), source.model_name, source.b_id, GETDATE(), GETDATE());
\n
DECLARE @modelId_RONDO2019 UNIQUEIDENTIFIER = (SELECT m.id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.name = 'RONDO 2019' AND b.name = 'KIA');
MERGE INTO vehicles AS target
USING (SELECT 'KIA RONDO 2019' AS v_name, @modelId_RONDO2019 AS m_id) AS source
ON target.name = source.v_name AND target.model_id = source.m_id
WHEN MATCHED THEN
    UPDATE SET 
        base_price = 746000,
        seats = 5,
        transmission = 'Auto',
        fuel_type = 'Gasoline',
        image_url = '/images/cars/MIOTO_kia_rondo 2019_2019_mioto.jpg',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (id, name, model_id, base_price, seats, transmission, fuel_type, image_url, status, created_at, updated_at)
    VALUES (NEWID(), source.v_name, source.m_id, 746000, 5, 'Auto', 'Gasoline', '/images/cars/MIOTO_kia_rondo 2019_2019_mioto.jpg', 'AVAILABLE', GETDATE(), GETDATE());
\n
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('MIOTO', 746000, 'KIA RONDO 2019', 'Phường 12, Quận Bình Thạnh', '{"source": "MIOTO", "name": "KIA RONDO 2019", "brand": "KIA", "model": "RONDO 2019", "year": "2019", "original_price": "746000", "location": "Phường 12, Quận Bình Thạnh", "image_url": "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_rondo_2019/p/g/2022/11/12/08/OkjqEmF_xe7KMUay5tuFJg.jpg", "seats": 5, "transmission": "Auto", "fuel": "Gasoline", "base_price": 746000, "local_image_url": "/images/cars/MIOTO_kia_rondo 2019_2019_mioto.jpg"}');
\nGO\n