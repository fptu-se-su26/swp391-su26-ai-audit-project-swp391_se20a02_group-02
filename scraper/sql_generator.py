"""
sql_generator.py — Generate SQL Server MERGE statements

Pipeline step 3:
1. Reads cleaned_vehicles.json
2. Generates SQL Server compatible MERGE INTO statements for Brand, Model, Vehicle
3. Generates INSERT for RawVehicleData (AI dataset)
4. Writes to seed_vehicles.sql
"""

import json
import logging
from datetime import datetime
import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("sql_gen")

def escape_sql(val: str) -> str:
    """Escapes single quotes for SQL Server."""
    if not isinstance(val, str):
        return str(val)
    return val.replace("'", "''")

def generate_sql():
    if not config.CLEANED_JSON_PATH.exists():
        logger.error(f"Cleaned data file not found: {config.CLEANED_JSON_PATH}")
        return

    with open(config.CLEANED_JSON_PATH, "r", encoding="utf-8") as f:
        vehicles = json.load(f)

    logger.info(f"Loaded {len(vehicles)} cleaned records.")
    
    sql_lines = [
        "-- ===========================================================",
        "-- LUXEWAY VEHICLE SEED SCRIPT (GENERATED VIA SCRAPER PIPELINE)",
        f"-- Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "-- Database: SQL Server",
        "-- ===========================================================\n"
    ]

    # Create RawVehicleData table if not exists
    sql_lines.append("""
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
""")

    for idx, v in enumerate(vehicles):
        brand = escape_sql(v.get('brand'))
        model = escape_sql(v.get('model'))
        name = escape_sql(v.get('name'))
        price = int(v.get('base_price', 0))
        # Cap price to 99,999,999 to prevent Arithmetic overflow in DECIMAL(10,2) columns
        # Often scraper bugs cause duplicated strings to form 14-digit numbers like 12190001119000
        if price > 99999999:
            # If it's absurdly large, try to extract just the first 7 digits (e.g. 1219000)
            price_str = str(price)
            price = int(price_str[:7])
        img = escape_sql(v.get('local_image_url', v.get('image_url')))
        seats = v.get('seats', 5)
        
        # Normalize transmission to match CHECK constraint (AUTOMATIC / MANUAL)
        trans_raw = str(v.get('transmission', 'Auto')).upper()
        if 'SÀN' in trans_raw or 'MANUAL' in trans_raw or 'MT' in trans_raw:
            trans = 'MANUAL'
        else:
            trans = 'AUTOMATIC'
            
        # Normalize fuel to match CHECK constraint (GASOLINE / DIESEL / ELECTRIC / HYBRID)
        fuel_raw = str(v.get('fuel', 'Gasoline')).upper()
        if 'DẦU' in fuel_raw or 'DIESEL' in fuel_raw:
            fuel = 'DIESEL'
        elif 'ĐIỆN' in fuel_raw or 'ELECTRIC' in fuel_raw:
            fuel = 'ELECTRIC'
        elif 'HYBRID' in fuel_raw:
            fuel = 'HYBRID'
        else:
            fuel = 'GASOLINE'
        location = escape_sql(v.get('location', ''))
        source = escape_sql(v.get('source', 'UNKNOWN'))
        
        # 1. Upsert Brand
        sql_lines.append(f"""
IF NOT EXISTS (SELECT 1 FROM vehicle_brands WHERE name = '{brand}')
BEGIN
    INSERT INTO vehicle_brands (id, name, country, vehicle_type, is_active, created_at)
    VALUES (NEWID(), '{brand}', N'Japan', 'CAR', 1, GETDATE())
END;
""")

        # 2. Upsert Model
        sql_lines.append(f"""
IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE model_name = '{model}' AND brand_id = (SELECT TOP 1 id FROM vehicle_brands WHERE name = '{brand}'))
BEGIN
    INSERT INTO vehicle_models (id, brand_id, model_name, vehicle_type, category, base_price_min, base_price_max, is_active)
    VALUES (NEWID(), (SELECT TOP 1 id FROM vehicle_brands WHERE name = '{brand}'), '{model}', 'CAR', 'ECONOMY', {price}, {price}, 1)
END;
""")

        # 3. Upsert Vehicle
        # Truncate string fields to schema limits
        name_trunc = name[:200]
        brand_trunc = brand[:100]
        model_trunc = model[:100]

        # Generate a safe license plate that fits within 20 characters
        # Format: SCR-{index:05d} e.g. SCR-00001
        safe_license_plate = f"SCR-{idx+1:05d}"
        
        # We use a specific owner_id from seed data verified via SQL Server query (Admin UUID)
        owner_id = 'A1B2C3D4-E5F6-7890-ABCD-123456789012'
        sql_lines.append(f"""
IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '{safe_license_plate}')
BEGIN
    UPDATE vehicles SET 
        price_per_day = {price},
        seats = {seats},
        transmission = '{trans}',
        fuel_type = '{fuel}',
        thumbnail_url = '{img}',
        updated_at = GETDATE()
    WHERE license_plate = '{safe_license_plate}'
END
ELSE
BEGIN
    INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, price_per_day, deposit, city, transmission, fuel_type, thumbnail_url, seats, status, created_at, license_plate, vehicle_type)
    VALUES (NEWID(), '{owner_id}', '{name_trunc}', '{brand_trunc}', '{model_trunc}', 2023, 'ECONOMY', {price}, 0, N'Hà Nội', '{trans}', '{fuel}', '{img}', {seats}, 'AVAILABLE', GETDATE(), '{safe_license_plate}', 'CAR')
END;
""")

        # 4. INSERT into RawVehicleData (AI dataset)
        raw_json_escaped = escape_sql(json.dumps(v, ensure_ascii=False))
        sql_lines.append(f"""
INSERT INTO raw_vehicle_data (source, original_price, vehicle_name, location, raw_json)
VALUES ('{source}', {price}, '{name}', '{location}', '{raw_json_escaped}');
""")

    with open(config.SQL_SEED_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))

    logger.info(f"SQL Generation complete. Script saved to {config.SQL_SEED_PATH}")

if __name__ == "__main__":
    generate_sql()
