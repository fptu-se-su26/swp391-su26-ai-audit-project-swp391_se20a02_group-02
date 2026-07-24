IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IDX_vehicles_price' AND object_id = OBJECT_ID('vehicles'))
    DROP INDEX IDX_vehicles_price ON vehicles;

ALTER TABLE vehicles ALTER COLUMN price_per_day DECIMAL(18,2) NOT NULL;
ALTER TABLE vehicles ALTER COLUMN price_per_week DECIMAL(18,2) NULL;
ALTER TABLE vehicles ALTER COLUMN deposit DECIMAL(18,2) NOT NULL;

CREATE INDEX IDX_vehicles_price ON vehicles(price_per_day);
