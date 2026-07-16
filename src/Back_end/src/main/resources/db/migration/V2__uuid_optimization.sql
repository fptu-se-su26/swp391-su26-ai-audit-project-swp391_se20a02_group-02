-- ============================================================
-- V2: UUID OPTIMIZATION (NVARCHAR(36) -> UNIQUEIDENTIFIER)
-- Core Tables: users, vehicles, bookings, and all referencing tables
-- ============================================================

-- 1. Drop Foreign Keys pointing to users, vehicles, bookings, owners dynamically
DECLARE @drop_fks NVARCHAR(MAX) = N'';
SELECT @drop_fks = @drop_fks + N'ALTER TABLE [' + OBJECT_SCHEMA_NAME(parent_object_id) + N'].[' + OBJECT_NAME(parent_object_id) + N'] DROP CONSTRAINT [' + name + N'];' + CHAR(13) + CHAR(10)
FROM sys.foreign_keys
WHERE referenced_object_id IN (OBJECT_ID('users'), OBJECT_ID('vehicles'), OBJECT_ID('bookings'), OBJECT_ID('owners'), OBJECT_ID('reviews'));
IF @drop_fks <> N'' EXEC sp_executesql @drop_fks;

-- 2. Drop Indexes on the target columns dynamically
DECLARE @drop_indexes NVARCHAR(MAX) = N'';
SELECT @drop_indexes = @drop_indexes + N'DROP INDEX [' + idx.name + N'] ON [' + t.name + N'];' + CHAR(13) + CHAR(10)
FROM sys.indexes idx
JOIN sys.tables t ON idx.object_id = t.object_id
JOIN sys.index_columns ic ON idx.object_id = ic.object_id AND idx.index_id = ic.index_id
JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE idx.is_primary_key = 0 AND idx.is_unique_constraint = 0
  AND c.name IN ('id', 'owner_id', 'vehicle_id', 'booking_id', 'renter_id', 'user_id', 'viewer_id', 'cancelled_by', 'reviewer_id', 'review_id', 'sender_id', 'receiver_id', 'reporter_id', 'uploaded_by', 'admin_id', 'referrer_id', 'referee_id', 'claimant_id');
IF @drop_indexes <> N'' EXEC sp_executesql @drop_indexes;

-- 3. Drop Primary Keys and Unique constraints dynamically
DECLARE @drop_constraints NVARCHAR(MAX) = N'';
SELECT @drop_constraints = @drop_constraints + N'ALTER TABLE [' + t.name + N'] DROP CONSTRAINT [' + kc.name + N'];' + CHAR(13) + CHAR(10)
FROM sys.key_constraints kc
JOIN sys.tables t ON kc.parent_object_id = t.object_id
WHERE kc.type IN ('PK', 'UQ') AND t.name IN ('users', 'vehicles', 'bookings', 'booking_addons', 'conversation_participants', 'wishlists', 'external_integrations', 'vehicle_availability', 'favorite_vehicles', 'owners', 'owner_verifications', 'owner_ratings', 'owner_analytics', 'reviews', 'booking_cancellations', 'booking_delivery', 'employee_vehicle_assignments', 'invoices', 'vehicle_locations', 'vehicle_specifications');
IF @drop_constraints <> N'' EXEC sp_executesql @drop_constraints;


-- 3.5. Clean invalid characters from UUID columns (e.g. non-hex characters like G-Z in mock UUIDs)
IF OBJECT_ID('dbo.CleanUUID', 'FN') IS NOT NULL
    DROP FUNCTION dbo.CleanUUID;
GO

EXEC('
CREATE FUNCTION dbo.CleanUUID(@val NVARCHAR(255))
RETURNS NVARCHAR(255)
AS
BEGIN
    IF @val IS NULL RETURN NULL;
    SET @val = UPPER(LTRIM(RTRIM(@val)));
    
    -- Remove hyphens
    SET @val = REPLACE(@val, ''-'', '''');

    -- Replace invalid hex characters (mock data fixes)
    SET @val = REPLACE(@val, ''G'', ''A'');
    SET @val = REPLACE(@val, ''H'', ''B'');
    SET @val = REPLACE(@val, ''I'', ''C'');
    SET @val = REPLACE(@val, ''J'', ''D'');
    SET @val = REPLACE(@val, ''K'', ''E'');
    SET @val = REPLACE(@val, ''L'', ''F'');
    SET @val = REPLACE(@val, ''M'', ''0'');
    SET @val = REPLACE(@val, ''N'', ''1'');
    SET @val = REPLACE(@val, ''O'', ''2'');
    SET @val = REPLACE(@val, ''P'', ''3'');
    SET @val = REPLACE(@val, ''Q'', ''4'');
    SET @val = REPLACE(@val, ''R'', ''5'');
    SET @val = REPLACE(@val, ''S'', ''6'');
    SET @val = REPLACE(@val, ''T'', ''7'');
    SET @val = REPLACE(@val, ''U'', ''8'');
    SET @val = REPLACE(@val, ''V'', ''9'');
    SET @val = REPLACE(@val, ''W'', ''A'');
    SET @val = REPLACE(@val, ''X'', ''B'');
    SET @val = REPLACE(@val, ''Y'', ''C'');
    SET @val = REPLACE(@val, ''Z'', ''D'');

    -- Ensure exactly 32 characters before formatting
    IF LEN(@val) < 32
        SET @val = RIGHT(REPLICATE(''0'', 32) + @val, 32);
    ELSE IF LEN(@val) > 32
        SET @val = LEFT(@val, 32);

    -- Format with standard UUID hyphens: 8-4-4-4-12
    SET @val = SUBSTRING(@val, 1, 8) + ''-'' + 
               SUBSTRING(@val, 9, 4) + ''-'' + 
               SUBSTRING(@val, 13, 4) + ''-'' + 
               SUBSTRING(@val, 17, 4) + ''-'' + 
               SUBSTRING(@val, 21, 12);

    RETURN @val;
END
');
GO

-- Core Tables
UPDATE users SET id = dbo.CleanUUID(id);
UPDATE vehicles SET id = dbo.CleanUUID(id), owner_id = dbo.CleanUUID(owner_id);
UPDATE bookings SET id = dbo.CleanUUID(id), vehicle_id = dbo.CleanUUID(vehicle_id), renter_id = dbo.CleanUUID(renter_id), owner_id = dbo.CleanUUID(owner_id);

-- Referencing Tables (Part 1)
UPDATE user_documents SET user_id = dbo.CleanUUID(user_id);
UPDATE payment_methods SET user_id = dbo.CleanUUID(user_id);
UPDATE vehicle_images SET vehicle_id = dbo.CleanUUID(vehicle_id);
UPDATE vehicle_features SET vehicle_id = dbo.CleanUUID(vehicle_id);
UPDATE vehicle_addons SET vehicle_id = dbo.CleanUUID(vehicle_id);
UPDATE wishlists SET user_id = dbo.CleanUUID(user_id), vehicle_id = dbo.CleanUUID(vehicle_id);
UPDATE booking_addons SET booking_id = dbo.CleanUUID(booking_id);
UPDATE vehicle_availability SET vehicle_id = dbo.CleanUUID(vehicle_id), booking_id = dbo.CleanUUID(booking_id);
UPDATE payments SET booking_id = dbo.CleanUUID(booking_id), user_id = dbo.CleanUUID(user_id);
UPDATE reviews SET id = dbo.CleanUUID(id), vehicle_id = dbo.CleanUUID(vehicle_id), booking_id = dbo.CleanUUID(booking_id), reviewer_id = dbo.CleanUUID(reviewer_id), owner_id = dbo.CleanUUID(owner_id);
UPDATE review_images SET review_id = dbo.CleanUUID(review_id);
UPDATE conversations SET vehicle_id = dbo.CleanUUID(vehicle_id), booking_id = dbo.CleanUUID(booking_id);
UPDATE conversation_participants SET user_id = dbo.CleanUUID(user_id);
UPDATE messages SET sender_id = dbo.CleanUUID(sender_id), receiver_id = dbo.CleanUUID(receiver_id), booking_id = dbo.CleanUUID(booking_id);
UPDATE notifications SET user_id = dbo.CleanUUID(user_id);
UPDATE disputes SET booking_id = dbo.CleanUUID(booking_id), reporter_id = dbo.CleanUUID(reporter_id);
UPDATE dispute_evidence SET uploaded_by = dbo.CleanUUID(uploaded_by);
UPDATE admin_logs SET admin_id = dbo.CleanUUID(admin_id);
UPDATE audit_trails SET user_id = dbo.CleanUUID(user_id);
UPDATE referral_programs SET referrer_id = dbo.CleanUUID(referrer_id), referee_id = dbo.CleanUUID(referee_id);
UPDATE loyalty_points SET user_id = dbo.CleanUUID(user_id), booking_id = dbo.CleanUUID(booking_id);
UPDATE insurance_claims SET booking_id = dbo.CleanUUID(booking_id), claimant_id = dbo.CleanUUID(claimant_id);
UPDATE vehicle_maintenance SET vehicle_id = dbo.CleanUUID(vehicle_id);
UPDATE api_keys SET user_id = dbo.CleanUUID(user_id);
UPDATE webhooks SET user_id = dbo.CleanUUID(user_id);
UPDATE external_integrations SET user_id = dbo.CleanUUID(user_id);

-- Legacy/Deprecated Tables
UPDATE cars SET owner_id = dbo.CleanUUID(owner_id);
UPDATE motorbikes SET owner_id = dbo.CleanUUID(owner_id);
UPDATE car_bookings SET renter_id = dbo.CleanUUID(renter_id), owner_id = dbo.CleanUUID(owner_id);
UPDATE motorbike_bookings SET renter_id = dbo.CleanUUID(renter_id), owner_id = dbo.CleanUUID(owner_id);

-- Referencing Tables (Part 2 - Newly Identified)
-- UPDATE booking_cancellations SET booking_id = dbo.CleanUUID(booking_id), cancelled_by = dbo.CleanUUID(cancelled_by);
-- UPDATE booking_delivery SET booking_id = dbo.CleanUUID(booking_id);
-- UPDATE booking_status_history SET booking_id = dbo.CleanUUID(booking_id);
-- UPDATE employee_vehicle_assignments SET vehicle_id = dbo.CleanUUID(vehicle_id);
-- UPDATE employees SET owner_id = dbo.CleanUUID(owner_id);
-- UPDATE favorite_vehicles SET user_id = dbo.CleanUUID(user_id), vehicle_id = dbo.CleanUUID(vehicle_id);
-- UPDATE invoices SET booking_id = dbo.CleanUUID(booking_id), user_id = dbo.CleanUUID(user_id);
-- UPDATE owners SET owner_id = dbo.CleanUUID(owner_id);
-- UPDATE search_logs SET user_id = dbo.CleanUUID(user_id);
-- UPDATE support_tickets SET booking_id = dbo.CleanUUID(booking_id), user_id = dbo.CleanUUID(user_id);
-- UPDATE vehicle_locations SET vehicle_id = dbo.CleanUUID(vehicle_id);
-- UPDATE vehicle_pricing_rules SET vehicle_id = dbo.CleanUUID(vehicle_id);
-- UPDATE vehicle_specifications SET vehicle_id = dbo.CleanUUID(vehicle_id);
-- UPDATE vehicle_views SET vehicle_id = dbo.CleanUUID(vehicle_id), viewer_id = dbo.CleanUUID(viewer_id);

-- Owners Reference Tables (Part 3)
-- UPDATE owner_analytics SET owner_id = dbo.CleanUUID(owner_id);
-- UPDATE owner_ratings SET owner_id = dbo.CleanUUID(owner_id);
-- UPDATE owner_verifications SET owner_id = dbo.CleanUUID(owner_id);
GO


-- 4. Alter columns to UNIQUEIDENTIFIER
ALTER TABLE users ALTER COLUMN id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE vehicles ALTER COLUMN id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE bookings ALTER COLUMN id UNIQUEIDENTIFIER NOT NULL;

ALTER TABLE user_documents ALTER COLUMN user_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE payment_methods ALTER COLUMN user_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE vehicles ALTER COLUMN owner_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE vehicle_images ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE vehicle_features ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE vehicle_addons ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE wishlists ALTER COLUMN user_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE wishlists ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE bookings ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE bookings ALTER COLUMN renter_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE bookings ALTER COLUMN owner_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE booking_addons ALTER COLUMN booking_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE vehicle_availability ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE vehicle_availability ALTER COLUMN booking_id UNIQUEIDENTIFIER NULL;
ALTER TABLE payments ALTER COLUMN booking_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE payments ALTER COLUMN user_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE reviews ALTER COLUMN id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE reviews ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE reviews ALTER COLUMN booking_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE reviews ALTER COLUMN reviewer_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE reviews ALTER COLUMN owner_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE review_images ALTER COLUMN review_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE conversations ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NULL;
ALTER TABLE conversations ALTER COLUMN booking_id UNIQUEIDENTIFIER NULL;
ALTER TABLE conversation_participants ALTER COLUMN user_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE messages ALTER COLUMN sender_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE messages ALTER COLUMN receiver_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE messages ALTER COLUMN booking_id UNIQUEIDENTIFIER NULL;
ALTER TABLE notifications ALTER COLUMN user_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE disputes ALTER COLUMN booking_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE disputes ALTER COLUMN reporter_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE dispute_evidence ALTER COLUMN uploaded_by UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE admin_logs ALTER COLUMN admin_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE audit_trails ALTER COLUMN user_id UNIQUEIDENTIFIER NULL;
ALTER TABLE referral_programs ALTER COLUMN referrer_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE referral_programs ALTER COLUMN referee_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE loyalty_points ALTER COLUMN user_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE loyalty_points ALTER COLUMN booking_id UNIQUEIDENTIFIER NULL;
ALTER TABLE insurance_claims ALTER COLUMN booking_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE insurance_claims ALTER COLUMN claimant_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE vehicle_maintenance ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE api_keys ALTER COLUMN user_id UNIQUEIDENTIFIER NULL;
ALTER TABLE webhooks ALTER COLUMN user_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE external_integrations ALTER COLUMN user_id UNIQUEIDENTIFIER NOT NULL;

ALTER TABLE cars ALTER COLUMN owner_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE motorbikes ALTER COLUMN owner_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE car_bookings ALTER COLUMN renter_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE car_bookings ALTER COLUMN owner_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE motorbike_bookings ALTER COLUMN renter_id UNIQUEIDENTIFIER NOT NULL;
ALTER TABLE motorbike_bookings ALTER COLUMN owner_id UNIQUEIDENTIFIER NOT NULL;

-- Newly Identified Tables
-- ALTER TABLE booking_cancellations ALTER COLUMN booking_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE booking_cancellations ALTER COLUMN cancelled_by UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE booking_delivery ALTER COLUMN booking_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE booking_status_history ALTER COLUMN booking_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE employee_vehicle_assignments ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE employees ALTER COLUMN owner_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE favorite_vehicles ALTER COLUMN user_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE favorite_vehicles ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE invoices ALTER COLUMN booking_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE invoices ALTER COLUMN user_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE owners ALTER COLUMN owner_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE search_logs ALTER COLUMN user_id UNIQUEIDENTIFIER NULL;
-- ALTER TABLE support_tickets ALTER COLUMN booking_id UNIQUEIDENTIFIER NULL;
-- ALTER TABLE support_tickets ALTER COLUMN user_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE vehicle_locations ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE vehicle_pricing_rules ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE vehicle_specifications ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE vehicle_views ALTER COLUMN vehicle_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE vehicle_views ALTER COLUMN viewer_id UNIQUEIDENTIFIER NULL;

-- Owners Reference Tables (Part 3)
-- ALTER TABLE owner_analytics ALTER COLUMN owner_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE owner_ratings ALTER COLUMN owner_id UNIQUEIDENTIFIER NOT NULL;
-- ALTER TABLE owner_verifications ALTER COLUMN owner_id UNIQUEIDENTIFIER NOT NULL;


-- 5. Recreate Primary Key Constraints
ALTER TABLE users ADD CONSTRAINT PK_users PRIMARY KEY (id);
ALTER TABLE vehicles ADD CONSTRAINT PK_vehicles PRIMARY KEY (id);
ALTER TABLE bookings ADD CONSTRAINT PK_bookings PRIMARY KEY (id);
ALTER TABLE booking_addons ADD CONSTRAINT PK_booking_addons PRIMARY KEY (booking_id, addon_id);
ALTER TABLE conversation_participants ADD CONSTRAINT PK_conversation_participants PRIMARY KEY (conversation_id, user_id);
-- ALTER TABLE favorite_vehicles ADD CONSTRAINT PK_favorite_vehicles PRIMARY KEY (user_id, vehicle_id);
-- ALTER TABLE owners ADD CONSTRAINT PK_owners PRIMARY KEY (owner_id);
ALTER TABLE reviews ADD CONSTRAINT PK_reviews PRIMARY KEY (id);
-- ALTER TABLE booking_cancellations ADD CONSTRAINT PK_booking_cancellations PRIMARY KEY (booking_id);
-- ALTER TABLE booking_delivery ADD CONSTRAINT PK_booking_delivery PRIMARY KEY (booking_id);
-- ALTER TABLE employee_vehicle_assignments ADD CONSTRAINT PK_employee_vehicle_assignments PRIMARY KEY (employee_id, vehicle_id);
-- ALTER TABLE vehicle_locations ADD CONSTRAINT PK_vehicle_locations PRIMARY KEY (vehicle_id);
-- ALTER TABLE vehicle_specifications ADD CONSTRAINT PK_vehicle_specifications PRIMARY KEY (vehicle_id);


-- 6. Recreate Unique Constraints
ALTER TABLE wishlists ADD CONSTRAINT UQ_wishlist_user_vehicle UNIQUE (user_id, vehicle_id);
ALTER TABLE external_integrations ADD CONSTRAINT UQ_user_provider UNIQUE (user_id, provider);
ALTER TABLE vehicle_availability ADD CONSTRAINT UQ_vehicle_date UNIQUE (vehicle_id, date);
ALTER TABLE reviews ADD CONSTRAINT UQ_reviews_booking UNIQUE (booking_id);
-- ALTER TABLE invoices ADD CONSTRAINT UQ_invoices_booking UNIQUE (booking_id);


-- -- 7. Recreate Foreign Key Constraints
ALTER TABLE user_documents ADD CONSTRAINT FK_user_documents_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE payment_methods ADD CONSTRAINT FK_payment_methods_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE vehicles ADD CONSTRAINT FK_vehicles_owner 
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE vehicle_images ADD CONSTRAINT FK_vehicle_images_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

ALTER TABLE vehicle_features ADD CONSTRAINT FK_vehicle_features_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

ALTER TABLE vehicle_addons ADD CONSTRAINT FK_vehicle_addons_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

ALTER TABLE wishlists ADD CONSTRAINT FK_wishlists_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE wishlists ADD CONSTRAINT FK_wishlists_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE NO ACTION;

ALTER TABLE bookings ADD CONSTRAINT FK_bookings_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE NO ACTION;

ALTER TABLE bookings ADD CONSTRAINT FK_bookings_renter 
    FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE bookings ADD CONSTRAINT FK_bookings_owner 
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE booking_addons ADD CONSTRAINT FK_booking_addons_booking 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

ALTER TABLE vehicle_availability ADD CONSTRAINT FK_availability_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

ALTER TABLE vehicle_availability ADD CONSTRAINT FK_availability_booking 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

ALTER TABLE payments ADD CONSTRAINT FK_payments_booking 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

ALTER TABLE payments ADD CONSTRAINT FK_payments_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE reviews ADD CONSTRAINT FK_reviews_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE NO ACTION;

ALTER TABLE reviews ADD CONSTRAINT FK_reviews_booking 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE NO ACTION;

ALTER TABLE reviews ADD CONSTRAINT FK_reviews_reviewer 
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE reviews ADD CONSTRAINT FK_reviews_owner 
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE conversations ADD CONSTRAINT FK_conversations_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;

ALTER TABLE conversations ADD CONSTRAINT FK_conversations_booking 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

ALTER TABLE conversation_participants ADD CONSTRAINT FK_conv_part_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE messages ADD CONSTRAINT FK_messages_sender 
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE messages ADD CONSTRAINT FK_messages_receiver 
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE messages ADD CONSTRAINT FK_messages_booking 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

ALTER TABLE notifications ADD CONSTRAINT FK_notifications_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE disputes ADD CONSTRAINT FK_disputes_booking 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE NO ACTION;

ALTER TABLE disputes ADD CONSTRAINT FK_disputes_reporter 
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE dispute_evidence ADD CONSTRAINT FK_evidence_uploaded_by 
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE admin_logs ADD CONSTRAINT FK_admin_logs_admin 
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE audit_trails ADD CONSTRAINT FK_audit_trails_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE referral_programs ADD CONSTRAINT FK_referral_referrer 
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE referral_programs ADD CONSTRAINT FK_referral_referee 
    FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE loyalty_points ADD CONSTRAINT FK_loyalty_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE loyalty_points ADD CONSTRAINT FK_loyalty_booking 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

ALTER TABLE insurance_claims ADD CONSTRAINT FK_claims_booking 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE NO ACTION;

ALTER TABLE insurance_claims ADD CONSTRAINT FK_claims_claimant 
    FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE NO ACTION;

ALTER TABLE vehicle_maintenance ADD CONSTRAINT FK_maintenance_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

ALTER TABLE api_keys ADD CONSTRAINT FK_api_keys_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE webhooks ADD CONSTRAINT FK_webhooks_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE external_integrations ADD CONSTRAINT FK_ext_integrations_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE cars ADD CONSTRAINT FK_cars_owner 
    FOREIGN KEY (owner_id) REFERENCES users(id);

ALTER TABLE motorbikes ADD CONSTRAINT FK_motorbikes_owner 
    FOREIGN KEY (owner_id) REFERENCES users(id);

ALTER TABLE car_bookings ADD CONSTRAINT FK_car_bookings_renter 
    FOREIGN KEY (renter_id) REFERENCES users(id);

ALTER TABLE car_bookings ADD CONSTRAINT FK_car_bookings_owner 
    FOREIGN KEY (owner_id) REFERENCES users(id);

ALTER TABLE motorbike_bookings ADD CONSTRAINT FK_motorbike_bookings_renter 
    FOREIGN KEY (renter_id) REFERENCES users(id);

ALTER TABLE motorbike_bookings ADD CONSTRAINT FK_motorbike_bookings_owner 
    FOREIGN KEY (owner_id) REFERENCES users(id);

-- Newly Identified Foreign Keys
-- ALTER TABLE booking_cancellations ADD CONSTRAINT FK__booking_c__booki__029D4CB7 
--     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- ALTER TABLE booking_cancellations ADD CONSTRAINT FK__booking_c__cance__039170F0 
--     FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE NO ACTION;

-- ALTER TABLE booking_delivery ADD CONSTRAINT FK__booking_d__booki__7CE47361 
--     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- ALTER TABLE booking_status_history ADD CONSTRAINT FK__booking_s__booki__7913E27D 
--     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- ALTER TABLE employee_vehicle_assignments ADD CONSTRAINT FK1k4ioakod8xgmhd83m914lgkq 
--     FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE NO ACTION;

-- ALTER TABLE employees ADD CONSTRAINT FK7uq6eyfed4yj24ts2v1kbag11 
--     FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE NO ACTION;

-- ALTER TABLE favorite_vehicles ADD CONSTRAINT FK__favorite___user___0A3E6E7F 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ALTER TABLE favorite_vehicles ADD CONSTRAINT FK__favorite___vehic__0B3292B8 
--     FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE NO ACTION;

-- ALTER TABLE invoices ADD CONSTRAINT FKbwr4d4vyqf2bkoetxtt8j9dx7 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION;

-- ALTER TABLE invoices ADD CONSTRAINT FKb9bhb7xre5v64qvjeholh3qj0 
--     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE NO ACTION;

-- ALTER TABLE owners ADD CONSTRAINT FK__owners__owner_id__4F1DA8B1 
--     FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- ALTER TABLE search_logs ADD CONSTRAINT FK__search_lo__user___0F03239C 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ALTER TABLE support_tickets ADD CONSTRAINT FK__support_t__user___74AF2013 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION;

-- ALTER TABLE support_tickets ADD CONSTRAINT FK__support_t__booki__75A3444C 
--     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE NO ACTION;

-- ALTER TABLE vehicle_locations ADD CONSTRAINT FK__vehicle_l__vehic__6CAE0B98 
--     FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

-- ALTER TABLE vehicle_pricing_rules ADD CONSTRAINT FK__vehicle_p__vehic__7172C0B5 
--     FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

-- ALTER TABLE vehicle_specifications ADD CONSTRAINT FK__vehicle_s__vehic__67E9567B 
--     FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

-- ALTER TABLE vehicle_views ADD CONSTRAINT FK__vehicle_v__vehic__12D3B480 
--     FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

-- ALTER TABLE vehicle_views ADD CONSTRAINT FK__vehicle_v__viewe__13C7D8B9 
--     FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE NO ACTION;

-- Owners Reference Foreign Keys
-- ALTER TABLE owner_analytics ADD CONSTRAINT FK__owner_ana__owner__613C58EC 
--     FOREIGN KEY (owner_id) REFERENCES owners(owner_id) ON DELETE CASCADE;

-- ALTER TABLE owner_ratings ADD CONSTRAINT FK__owner_rat__owner__5B837F96 
--     FOREIGN KEY (owner_id) REFERENCES owners(owner_id) ON DELETE CASCADE;

-- ALTER TABLE owner_verifications ADD CONSTRAINT FK__owner_ver__owner__54D68207 
--     FOREIGN KEY (owner_id) REFERENCES owners(owner_id) ON DELETE CASCADE;


-- 8. Recreate Indexes
CREATE INDEX IDX_user_documents_user ON user_documents(user_id);
CREATE INDEX IDX_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IDX_vehicles_owner ON vehicles(owner_id);
CREATE INDEX IDX_wishlists_user ON wishlists(user_id);
CREATE INDEX IDX_wishlists_vehicle ON wishlists(vehicle_id);
CREATE INDEX IDX_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX IDX_bookings_renter ON bookings(renter_id);
CREATE INDEX IDX_bookings_owner ON bookings(owner_id);
CREATE INDEX IDX_availability_vehicle ON vehicle_availability(vehicle_id);
CREATE INDEX IDX_payments_booking ON payments(booking_id);
CREATE INDEX IDX_payments_user ON payments(user_id);
CREATE INDEX IDX_reviews_vehicle ON reviews(vehicle_id);
CREATE INDEX IDX_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IDX_notifications_user ON notifications(user_id);
CREATE INDEX IDX_disputes_booking ON disputes(booking_id);
CREATE INDEX INDEX_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IDX_audit_trails_user ON audit_trails(user_id);
CREATE INDEX IDX_referral_referrer ON referral_programs(referrer_id);
CREATE INDEX IDX_loyalty_user ON loyalty_points(user_id);
CREATE INDEX IDX_claims_booking ON insurance_claims(booking_id);
CREATE INDEX IDX_maintenance_vehicle ON vehicle_maintenance(vehicle_id);
CREATE INDEX IDX_api_keys_user ON api_keys(user_id);
CREATE INDEX IDX_webhooks_user ON webhooks(user_id);
CREATE INDEX IDX_ext_integrations_user ON external_integrations(user_id);

-- 9. Clean up temporary helper function
IF OBJECT_ID('dbo.CleanUUID', 'FN') IS NOT NULL
    DROP FUNCTION dbo.CleanUUID;
GO
