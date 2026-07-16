-- ============================================================
-- Add is_locked column to vehicles table
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('vehicles') AND name = 'is_locked'
)
BEGIN
    ALTER TABLE vehicles ADD is_locked BIT NOT NULL DEFAULT 1;
END
GO
