-- Flyway Migration V7: Normalize Vehicle Rental Pricing
-- Corrects concatenated/distorted pricing anomalies from initial scraping while preserving the intentional 5,000 VND demo vehicle.

-- Fix 8,150,007 VND Toyota Vios to realistic 800,000 VND/day
UPDATE vehicles 
SET price_per_day = 800000 
WHERE price_per_day > 5000000 AND (name LIKE '%VIOS%' OR model LIKE '%VIOS%');

-- Fix 6,650,005 VND Mitsubishi Attrage to 650,000 VND/day
UPDATE vehicles 
SET price_per_day = 650000 
WHERE price_per_day > 5000000 AND (name LIKE '%ATTRAGE%' OR model LIKE '%ATTRAGE%');

-- Fix 5,450,004 VND Hyundai Veloster to 750,000 VND/day
UPDATE vehicles 
SET price_per_day = 750000 
WHERE price_per_day > 5000000 AND (name LIKE '%VELOSER%' OR name LIKE '%VELOSTER%');

-- Fix 7,450,006 VND Kia Soluto to 700,000 VND/day
UPDATE vehicles 
SET price_per_day = 700000 
WHERE price_per_day > 5000000 AND (name LIKE '%SOLUTO%' OR model LIKE '%SOLUTO%');

-- Fix 9,850,008 VND Mercedes C200 to 1,200,000 VND/day
UPDATE vehicles 
SET price_per_day = 1200000 
WHERE price_per_day > 5000000 AND (name LIKE '%MERCEDES%' OR name LIKE '%C200%');

-- Ensure any remaining distorted prices > 4,000,000 VND for non-luxury standard cars are normalized to 950,000 VND/day
UPDATE vehicles 
SET price_per_day = 950000 
WHERE price_per_day > 4000000 
  AND vehicle_type = 'CAR' 
  AND category NOT IN ('SUPERCAR', 'LUXURY', 'CLASSIC');

-- Explicit safety check: Ensure the intentional 5,000 VND demo vehicle is preserved
UPDATE vehicles
SET price_per_day = 5000
WHERE name LIKE '%Kia Morning MT%' AND (price_per_day = 5000 OR price_per_day = 500000);
