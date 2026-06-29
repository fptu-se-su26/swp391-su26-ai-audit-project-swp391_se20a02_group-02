-- ============================================================
-- Add VIN column to vehicles table
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('vehicles') AND name = 'vin'
)
BEGIN
    ALTER TABLE vehicles ADD vin NVARCHAR(50) NULL;
END
GO
