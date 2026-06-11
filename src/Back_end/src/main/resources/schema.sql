-- ============================================================
-- LuxeWay Vehicle Rental Platform
-- SQL Server (T-SQL) Schema - 35 Tables
-- Run in SSMS after creating database: car_rental_platform
-- ============================================================

-- ============================================================
-- 1. USERS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'users')
BEGIN
CREATE TABLE users (
    id                          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    email                       NVARCHAR(255)   NOT NULL UNIQUE,
    password_hash               NVARCHAR(255)   NOT NULL,
    first_name                  NVARCHAR(100)   NOT NULL,
    last_name                   NVARCHAR(100)   NOT NULL,
    display_name                NVARCHAR(200),
    avatar                      NVARCHAR(500),
    phone                       NVARCHAR(20),
    role                        NVARCHAR(20)    NOT NULL CONSTRAINT CHK_users_role CHECK (role IN ('CUSTOMER','OWNER','ADMIN')),
    verified                    BIT             NOT NULL DEFAULT 0,
    kyc_verified                BIT             NOT NULL DEFAULT 0,
    driving_license_verified    BIT             NOT NULL DEFAULT 0,
    rating                      DECIMAL(3,2)    NOT NULL DEFAULT 0.00,
    total_reviews               INT             NOT NULL DEFAULT 0,
    total_rentals               INT             NOT NULL DEFAULT 0,
    bio                         NVARCHAR(MAX),
    location                    NVARCHAR(200),
    account_type                NVARCHAR(20)    NOT NULL DEFAULT 'INDIVIDUAL' CONSTRAINT CHK_users_account_type CHECK (account_type IN ('INDIVIDUAL','BUSINESS')),
    company_name                NVARCHAR(200),
    stripe_customer_id          NVARCHAR(100),
    preferred_language          NVARCHAR(10)    NULL DEFAULT 'en',
    is_active                   BIT             NOT NULL DEFAULT 1,
    joined_at                   DATETIME2       NOT NULL DEFAULT GETDATE(),
    last_active                 DATETIME2       NOT NULL DEFAULT GETDATE(),
    created_at                  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at                  DATETIME2       NOT NULL DEFAULT GETDATE()
);
END
GO

-- ============================================================
-- 2. USER_DOCUMENTS (KYC)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'user_documents')
BEGIN
CREATE TABLE user_documents (
    id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
    user_id         NVARCHAR(36)    NOT NULL,
    document_type   NVARCHAR(30)    NOT NULL CONSTRAINT CHK_user_docs_type CHECK (document_type IN ('PASSPORT','NATIONAL_ID','DRIVING_LICENSE','INSURANCE')),
    status          NVARCHAR(20)    NOT NULL DEFAULT 'PENDING' CONSTRAINT CHK_user_docs_status CHECK (status IN ('PENDING','VERIFIED','REJECTED')),
    url             NVARCHAR(500)   NOT NULL,
    rejection_reason NVARCHAR(MAX),
    license_class   NVARCHAR(10),
    license_number  NVARCHAR(50),
    license_full_name NVARCHAR(200),
    license_date_of_birth NVARCHAR(50),
    license_residence NVARCHAR(500),
    license_nationality NVARCHAR(100),
    uploaded_at     DATETIME2       NOT NULL DEFAULT GETDATE(),
    verified_at     DATETIME2,
    CONSTRAINT FK_user_documents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IDX_user_documents_user   ON user_documents(user_id);
CREATE INDEX IDX_user_documents_status ON user_documents(status);
END
GO

-- ============================================================
-- 3. PAYMENT_METHODS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'payment_methods')
BEGIN
CREATE TABLE payment_methods (
    id                          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    user_id                     NVARCHAR(36)    NOT NULL,
    type                        NVARCHAR(20)    NOT NULL CONSTRAINT CHK_pm_type CHECK (type IN ('card','bank','wallet')),
    provider                    NVARCHAR(50),
    last4                       NVARCHAR(4),
    brand                       NVARCHAR(20),
    expiry_month                INT,
    expiry_year                 INT,
    is_default                  BIT             NOT NULL DEFAULT 0,
    is_active                   BIT             NOT NULL DEFAULT 1,
    stripe_payment_method_id    NVARCHAR(200),
    created_at                  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at                  DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_payment_methods_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IDX_payment_methods_user ON payment_methods(user_id);
END
GO

-- ============================================================
-- 4. VEHICLES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'vehicles')
BEGIN
CREATE TABLE vehicles (
    id                      NVARCHAR(36)    NOT NULL PRIMARY KEY,
    owner_id                NVARCHAR(36)    NOT NULL,
    name                    NVARCHAR(200)   NOT NULL,
    brand                   NVARCHAR(100)   NOT NULL,
    model                   NVARCHAR(100)   NOT NULL,
    year                    INT             NOT NULL,
    category                NVARCHAR(20)    NOT NULL CONSTRAINT CHK_vehicles_category CHECK (category IN ('ECONOMY','FAMILY','BUSINESS','ELECTRIC','MOTORBIKE','SUV','CITY_CAR','TOURISM')),
    description             NVARCHAR(MAX),
    thumbnail_url           NVARCHAR(500),
    price_per_day           DECIMAL(12,0)   NOT NULL,
    price_per_week          DECIMAL(12,0),
    deposit                 DECIMAL(12,0)   NOT NULL,
    city                    NVARCHAR(100)   NOT NULL,
    country                 NVARCHAR(100)   NOT NULL DEFAULT N'Vietnam',
    address                 NVARCHAR(MAX),
    latitude                DECIMAL(10,8),
    longitude               DECIMAL(11,8),
    horsepower              INT,
    top_speed               INT,
    acceleration            DECIMAL(4,2),
    seats                   INT             NOT NULL,
    doors                   INT,
    transmission            NVARCHAR(20)    NOT NULL CONSTRAINT CHK_vehicles_transmission CHECK (transmission IN ('AUTOMATIC','MANUAL')),
    fuel_type               NVARCHAR(20)    NOT NULL CONSTRAINT CHK_vehicles_fuel CHECK (fuel_type IN ('GASOLINE','DIESEL','ELECTRIC','HYBRID')),
    range_km                INT,
    engine_size             NVARCHAR(20),
    color                   NVARCHAR(50),
    license_plate           NVARCHAR(20)    UNIQUE,
    min_rental_days         INT             NOT NULL DEFAULT 1,
    max_rental_days         INT             NOT NULL DEFAULT 30,
    advance_booking_days    INT             NOT NULL DEFAULT 365,
    status                  NVARCHAR(20)    NOT NULL DEFAULT 'PENDING_APPROVAL' CONSTRAINT CHK_vehicles_status CHECK (status IN ('AVAILABLE','RENTED','MAINTENANCE','PENDING_APPROVAL','REJECTED','INACTIVE')),
    rating                  DECIMAL(3,2)    NOT NULL DEFAULT 0.00,
    total_reviews           INT             NOT NULL DEFAULT 0,
    total_bookings          INT             NOT NULL DEFAULT 0,
    is_verified             BIT             NOT NULL DEFAULT 0,
    is_featured             BIT             NOT NULL DEFAULT 0,
    instant_book            BIT             NOT NULL DEFAULT 0,
    delivery_available      BIT             NOT NULL DEFAULT 0,
    delivery_fee            DECIMAL(10,0)   NOT NULL DEFAULT 0,
    created_at              DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at              DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_vehicles_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IDX_vehicles_owner    ON vehicles(owner_id);
CREATE INDEX IDX_vehicles_category ON vehicles(category);
CREATE INDEX IDX_vehicles_city     ON vehicles(city);
CREATE INDEX IDX_vehicles_status   ON vehicles(status);
CREATE INDEX IDX_vehicles_price    ON vehicles(price_per_day);
CREATE INDEX IDX_vehicles_featured ON vehicles(is_featured);
END
GO

-- ============================================================
-- 5. VEHICLE_IMAGES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'vehicle_images')
BEGIN
CREATE TABLE vehicle_images (
    id          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    vehicle_id  NVARCHAR(36)    NOT NULL,
    url         NVARCHAR(500)   NOT NULL,
    is_primary  BIT             NOT NULL DEFAULT 0,
    sort_order  INT             NOT NULL DEFAULT 0,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_vehicle_images_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
CREATE INDEX IDX_vehicle_images_vehicle ON vehicle_images(vehicle_id);
END
GO

-- ============================================================
-- 6. VEHICLE_FEATURES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'vehicle_features')
BEGIN
CREATE TABLE vehicle_features (
    id          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    vehicle_id  NVARCHAR(36)    NOT NULL,
    feature     NVARCHAR(100)   NOT NULL,
    CONSTRAINT FK_vehicle_features_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
CREATE INDEX IDX_vehicle_features_vehicle ON vehicle_features(vehicle_id);
END
GO

-- ============================================================
-- 7. VEHICLE_ADDONS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'vehicle_addons')
BEGIN
CREATE TABLE vehicle_addons (
    id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
    vehicle_id      NVARCHAR(36)    NOT NULL,
    name            NVARCHAR(100)   NOT NULL,
    description     NVARCHAR(MAX),
    price_per_day   DECIMAL(10,0)   NOT NULL,
    icon            NVARCHAR(100),
    is_active       BIT             NOT NULL DEFAULT 1,
    CONSTRAINT FK_vehicle_addons_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
CREATE INDEX IDX_vehicle_addons_vehicle ON vehicle_addons(vehicle_id);
END
GO

-- ============================================================
-- 8. WISHLISTS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'wishlists')
BEGIN
CREATE TABLE wishlists (
    id          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    user_id     NVARCHAR(36)    NOT NULL,
    vehicle_id  NVARCHAR(36)    NOT NULL,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_wishlists_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE NO ACTION,
    CONSTRAINT FK_wishlists_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE NO ACTION,
    CONSTRAINT UQ_wishlist_user_vehicle UNIQUE (user_id, vehicle_id)
);
CREATE INDEX IDX_wishlists_user    ON wishlists(user_id);
CREATE INDEX IDX_wishlists_vehicle ON wishlists(vehicle_id);
END
GO

-- ============================================================
-- 9. BOOKINGS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'bookings')
BEGIN
CREATE TABLE bookings (
    id                  NVARCHAR(36)    NOT NULL PRIMARY KEY,
    vehicle_id          NVARCHAR(36)    NOT NULL,
    renter_id           NVARCHAR(36)    NOT NULL,
    owner_id            NVARCHAR(36)    NOT NULL,
    status              NVARCHAR(20)    NOT NULL DEFAULT 'PENDING' CONSTRAINT CHK_bookings_status CHECK (status IN ('PENDING','CONFIRMED','ACTIVE','COMPLETED','CANCELLED','DISPUTED')),
    start_date          DATE            NOT NULL,
    end_date            DATE            NOT NULL,
    total_days          INT             NOT NULL,
    base_price          DECIMAL(12,0)   NOT NULL,
    price_per_day       DECIMAL(12,0)   NOT NULL,
    addons_total        DECIMAL(12,0)   NOT NULL DEFAULT 0,
    insurance_fee       DECIMAL(12,0)   NOT NULL DEFAULT 0,
    delivery_fee        DECIMAL(12,0)   NOT NULL DEFAULT 0,
    service_fee         DECIMAL(12,0)   NOT NULL,
    taxes               DECIMAL(12,0)   NOT NULL,
    discount            DECIMAL(12,0)   NOT NULL DEFAULT 0,
    total               DECIMAL(12,0)   NOT NULL,
    deposit             DECIMAL(12,0)   NOT NULL,
    deposit_refunded    BIT             NOT NULL DEFAULT 0,
    include_insurance   BIT             NOT NULL DEFAULT 0,
    include_delivery    BIT             NOT NULL DEFAULT 0,
    delivery_address    NVARCHAR(MAX),
    pickup_location     NVARCHAR(500),
    notes               NVARCHAR(MAX),
    owner_notes         NVARCHAR(MAX),
    coupon_code         NVARCHAR(50),
    check_in_odometer   INT,
    check_out_odometer  INT,
    damage_report       NVARCHAR(MAX),
    cancelled_at        DATETIME2,
    cancellation_reason NVARCHAR(MAX),
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_bookings_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE NO ACTION,
    CONSTRAINT FK_bookings_renter  FOREIGN KEY (renter_id)  REFERENCES users(id)    ON DELETE NO ACTION,
    CONSTRAINT FK_bookings_owner   FOREIGN KEY (owner_id)   REFERENCES users(id)    ON DELETE NO ACTION
);
CREATE INDEX IDX_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX IDX_bookings_renter  ON bookings(renter_id);
CREATE INDEX IDX_bookings_owner   ON bookings(owner_id);
CREATE INDEX IDX_bookings_status  ON bookings(status);
CREATE INDEX IDX_bookings_dates   ON bookings(start_date, end_date);
END
GO

-- ============================================================
-- 10. BOOKING_ADDONS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'booking_addons')
BEGIN
CREATE TABLE booking_addons (
    booking_id      NVARCHAR(36)    NOT NULL,
    addon_id        NVARCHAR(36)    NOT NULL,
    quantity        INT             NOT NULL DEFAULT 1,
    price_per_day   DECIMAL(10,0)   NOT NULL,
    PRIMARY KEY (booking_id, addon_id),
    CONSTRAINT FK_booking_addons_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)       ON DELETE CASCADE,
    CONSTRAINT FK_booking_addons_addon   FOREIGN KEY (addon_id)   REFERENCES vehicle_addons(id)  ON DELETE NO ACTION
);
END
GO

-- ============================================================
-- 11. VEHICLE_AVAILABILITY
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'vehicle_availability')
BEGIN
CREATE TABLE vehicle_availability (
    id          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    vehicle_id  NVARCHAR(36)    NOT NULL,
    date        DATE            NOT NULL,
    is_available BIT            NOT NULL DEFAULT 0,
    reason      NVARCHAR(20)    NOT NULL DEFAULT 'BOOKED' CONSTRAINT CHK_avail_reason CHECK (reason IN ('BOOKED','MAINTENANCE','OWNER_BLOCKED','HOLIDAY')),
    booking_id  NVARCHAR(36),
    notes       NVARCHAR(MAX),
    CONSTRAINT FK_availability_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)  ON DELETE CASCADE,
    CONSTRAINT FK_availability_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)  ON DELETE SET NULL,
    CONSTRAINT UQ_vehicle_date UNIQUE (vehicle_id, date)
);
CREATE INDEX IDX_availability_vehicle ON vehicle_availability(vehicle_id);
CREATE INDEX IDX_availability_date    ON vehicle_availability(date);
END
GO

-- ============================================================
-- 12. PAYMENTS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'payments')
BEGIN
CREATE TABLE payments (
    id                          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    booking_id                  NVARCHAR(36)    NOT NULL,
    user_id                     NVARCHAR(36)    NOT NULL,
    amount                      DECIMAL(12,0)   NOT NULL,
    currency                    NVARCHAR(3)     NOT NULL DEFAULT 'VND',
    status                      NVARCHAR(20)    NOT NULL CONSTRAINT CHK_payments_status CHECK (status IN ('PENDING','PROCESSING','SUCCEEDED','FAILED','REFUNDED')),
    method                      NVARCHAR(20)    NOT NULL CONSTRAINT CHK_payments_method CHECK (method IN ('STRIPE','VNPAY','WALLET','BANK_TRANSFER')),
    stripe_payment_intent_id    NVARCHAR(200),
    transaction_id              NVARCHAR(200)   UNIQUE,
    description                 NVARCHAR(MAX),
    metadata                    NVARCHAR(MAX),
    refund_amount               DECIMAL(12,0)   NOT NULL DEFAULT 0,
    created_at                  DATETIME2       NOT NULL DEFAULT GETDATE(),
    processed_at                DATETIME2,
    refunded_at                 DATETIME2,
    CONSTRAINT FK_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT FK_payments_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE NO ACTION
);
CREATE INDEX IDX_payments_booking        ON payments(booking_id);
CREATE INDEX IDX_payments_user           ON payments(user_id);
CREATE INDEX IDX_payments_status         ON payments(status);
CREATE INDEX IDX_payments_transaction_id ON payments(transaction_id);
END
GO

-- ============================================================
-- 13. REVIEWS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'reviews')
BEGIN
CREATE TABLE reviews (
    id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
    vehicle_id      NVARCHAR(36)    NOT NULL,
    booking_id      NVARCHAR(36)    NOT NULL UNIQUE,
    reviewer_id     NVARCHAR(36)    NOT NULL,
    owner_id        NVARCHAR(36)    NOT NULL,
    rating          INT             NOT NULL CONSTRAINT CHK_reviews_rating        CHECK (rating        BETWEEN 1 AND 5),
    cleanliness     INT             NOT NULL CONSTRAINT CHK_reviews_cleanliness   CHECK (cleanliness   BETWEEN 1 AND 5),
    accuracy        INT             NOT NULL CONSTRAINT CHK_reviews_accuracy      CHECK (accuracy      BETWEEN 1 AND 5),
    communication   INT             NOT NULL CONSTRAINT CHK_reviews_communication CHECK (communication BETWEEN 1 AND 5),
    value_rating    INT             NOT NULL CONSTRAINT CHK_reviews_value         CHECK (value_rating  BETWEEN 1 AND 5),
    comment         NVARCHAR(MAX),
    owner_response  NVARCHAR(MAX),
    helpful         INT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_reviews_vehicle  FOREIGN KEY (vehicle_id)  REFERENCES vehicles(id) ON DELETE NO ACTION,
    CONSTRAINT FK_reviews_booking  FOREIGN KEY (booking_id)  REFERENCES bookings(id) ON DELETE NO ACTION,
    CONSTRAINT FK_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id)    ON DELETE NO ACTION,
    CONSTRAINT FK_reviews_owner    FOREIGN KEY (owner_id)    REFERENCES users(id)    ON DELETE NO ACTION
);
CREATE INDEX IDX_reviews_vehicle  ON reviews(vehicle_id);
CREATE INDEX IDX_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IDX_reviews_rating   ON reviews(rating);
END
GO

-- ============================================================
-- 14. CONVERSATIONS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'conversations')
BEGIN
CREATE TABLE conversations (
    id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
    vehicle_id      NVARCHAR(36),
    booking_id      NVARCHAR(36),
    last_activity   DATETIME2       NOT NULL DEFAULT GETDATE(),
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_conversations_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    CONSTRAINT FK_conversations_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);
CREATE INDEX IDX_conversations_last_activity ON conversations(last_activity);
END
GO

-- ============================================================
-- 15. CONVERSATION_PARTICIPANTS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'conversation_participants')
BEGIN
CREATE TABLE conversation_participants (
    conversation_id NVARCHAR(36)    NOT NULL,
    user_id         NVARCHAR(36)    NOT NULL,
    unread_count    INT             NOT NULL DEFAULT 0,
    joined_at       DATETIME2       NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY (conversation_id, user_id),
    CONSTRAINT FK_conv_part_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT FK_conv_part_user         FOREIGN KEY (user_id)         REFERENCES users(id)         ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 16. MESSAGES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'messages')
BEGIN
CREATE TABLE messages (
    id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
    conversation_id NVARCHAR(36)    NOT NULL,
    sender_id       NVARCHAR(36)    NOT NULL,
    receiver_id     NVARCHAR(36)    NOT NULL,
    type            NVARCHAR(20)    NOT NULL DEFAULT 'text' CONSTRAINT CHK_messages_type CHECK (type IN ('text','image','booking_request','system')),
    content         NVARCHAR(MAX)   NOT NULL,
    media_url       NVARCHAR(500),
    booking_id      NVARCHAR(36),
    read_at         DATETIME2,
    edited          BIT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT FK_messages_sender       FOREIGN KEY (sender_id)       REFERENCES users(id)         ON DELETE NO ACTION,
    CONSTRAINT FK_messages_receiver     FOREIGN KEY (receiver_id)     REFERENCES users(id)         ON DELETE NO ACTION,
    CONSTRAINT FK_messages_booking      FOREIGN KEY (booking_id)      REFERENCES bookings(id)      ON DELETE SET NULL
);
CREATE INDEX IDX_messages_conversation ON messages(conversation_id);
CREATE INDEX IDX_messages_created_at   ON messages(created_at);
END
GO

-- ============================================================
-- 17. NOTIFICATIONS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'notifications')
BEGIN
CREATE TABLE notifications (
    id          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    user_id     NVARCHAR(36)    NOT NULL,
    type        NVARCHAR(20)    NOT NULL CONSTRAINT CHK_notif_type CHECK (type IN ('booking','payment','message','review','system','promotion')),
    title       NVARCHAR(200)   NOT NULL,
    body        NVARCHAR(MAX)   NOT NULL,
    icon        NVARCHAR(100),
    link        NVARCHAR(500),
    is_read     BIT             NOT NULL DEFAULT 0,
    metadata    NVARCHAR(MAX),
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IDX_notifications_user    ON notifications(user_id);
CREATE INDEX IDX_notifications_is_read ON notifications(is_read);
CREATE INDEX IDX_notifications_created ON notifications(created_at);
END
GO

-- ============================================================
-- 18. DISPUTES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'disputes')
BEGIN
CREATE TABLE disputes (
    id              BIGINT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    booking_id      NVARCHAR(36)    NOT NULL,
    reporter_id     NVARCHAR(36)    NOT NULL,
    reason          NVARCHAR(100)   NOT NULL,
    description     NVARCHAR(MAX)   NOT NULL,
    evidence_url    NVARCHAR(500),
    status          NVARCHAR(50)    NOT NULL DEFAULT 'OPEN' CONSTRAINT CHK_disputes_status CHECK (status IN ('OPEN','INVESTIGATING','RESOLVED','REJECTED')),
    admin_decision  NVARCHAR(MAX),
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_disputes_booking      FOREIGN KEY (booking_id)   REFERENCES bookings(id) ON DELETE NO ACTION,
    CONSTRAINT FK_disputes_reporter     FOREIGN KEY (reporter_id)  REFERENCES users(id)    ON DELETE NO ACTION
);
CREATE INDEX IDX_disputes_booking ON disputes(booking_id);
CREATE INDEX IDX_disputes_status  ON disputes(status);
END
GO

-- ============================================================
-- 19. DISPUTE_EVIDENCE
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'dispute_evidence')
BEGIN
CREATE TABLE dispute_evidence (
    id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
    dispute_id      BIGINT          NOT NULL,
    uploaded_by     NVARCHAR(36)    NOT NULL,
    type            NVARCHAR(20)    NOT NULL CONSTRAINT CHK_evidence_type CHECK (type IN ('image','document','video')),
    url             NVARCHAR(500)   NOT NULL,
    description     NVARCHAR(MAX),
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_evidence_dispute     FOREIGN KEY (dispute_id)  REFERENCES disputes(id) ON DELETE CASCADE,
    CONSTRAINT FK_evidence_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id)    ON DELETE NO ACTION
);
CREATE INDEX IDX_evidence_dispute ON dispute_evidence(dispute_id);
END
GO

-- ============================================================
-- 20. COUPONS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'coupons')
BEGIN
CREATE TABLE coupons (
    id                  BIGINT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    code                NVARCHAR(50)    NOT NULL UNIQUE,
    discount_percentage INT             NOT NULL,
    max_discount_amount DECIMAL(10,2),
    valid_from          DATETIME2,
    valid_until         DATETIME2,
    is_active           BIT             NOT NULL DEFAULT 1,
    max_uses            INT             NOT NULL DEFAULT 100,
    current_uses        INT             NOT NULL DEFAULT 0,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE()
);
CREATE INDEX IDX_coupons_code       ON coupons(code);
CREATE INDEX IDX_coupons_expires_at ON coupons(valid_until);
END
GO

-- ============================================================
-- 21. ANALYTICS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'analytics')
BEGIN
CREATE TABLE analytics (
    id          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    entity_type NVARCHAR(20)    NOT NULL CONSTRAINT CHK_analytics_entity CHECK (entity_type IN ('vehicle','user','booking','platform')),
    entity_id   NVARCHAR(36),
    metric_type NVARCHAR(50)    NOT NULL,
    period      NVARCHAR(10)    NOT NULL CONSTRAINT CHK_analytics_period CHECK (period IN ('day','week','month','year')),
    date        DATE            NOT NULL,
    value       DECIMAL(15,2)   NOT NULL,
    metadata    NVARCHAR(MAX),
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE()
);
CREATE INDEX IDX_analytics_entity ON analytics(entity_type, entity_id);
CREATE INDEX IDX_analytics_metric ON analytics(metric_type);
CREATE INDEX IDX_analytics_date   ON analytics(date);
END
GO

-- ============================================================
-- 22. ADMIN_LOGS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'admin_logs')
BEGIN
CREATE TABLE admin_logs (
    id          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    admin_id    NVARCHAR(36)    NOT NULL,
    action      NVARCHAR(100)   NOT NULL,
    target_type NVARCHAR(50)    NOT NULL,
    target_id   NVARCHAR(36)    NOT NULL,
    old_values  NVARCHAR(MAX),
    new_values  NVARCHAR(MAX),
    reason      NVARCHAR(MAX),
    ip_address  NVARCHAR(45),
    user_agent  NVARCHAR(MAX),
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_admin_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE NO ACTION
);
CREATE INDEX IDX_admin_logs_admin      ON admin_logs(admin_id);
CREATE INDEX IDX_admin_logs_action     ON admin_logs(action);
CREATE INDEX IDX_admin_logs_created_at ON admin_logs(created_at);
END
GO

-- ============================================================
-- 23. SYSTEM_SETTINGS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'system_settings')
BEGIN
CREATE TABLE system_settings (
    id          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    key_name    NVARCHAR(100)   NOT NULL UNIQUE,
    value       NVARCHAR(MAX)   NOT NULL,
    data_type   NVARCHAR(20)    NOT NULL DEFAULT 'string' CONSTRAINT CHK_settings_data_type CHECK (data_type IN ('string','number','boolean','json')),
    description NVARCHAR(MAX),
    is_public   BIT             NOT NULL DEFAULT 0,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NOT NULL DEFAULT GETDATE()
);
CREATE INDEX IDX_system_settings_key       ON system_settings(key_name);
CREATE INDEX IDX_system_settings_is_public ON system_settings(is_public);
END
GO

-- ============================================================
-- 24. EMAIL_TEMPLATES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'email_templates')
BEGIN
CREATE TABLE email_templates (
    id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
    name            NVARCHAR(100)   NOT NULL UNIQUE,
    subject         NVARCHAR(200)   NOT NULL,
    html_content    NVARCHAR(MAX)   NOT NULL,
    text_content    NVARCHAR(MAX),
    variables       NVARCHAR(MAX),
    is_active       BIT             NOT NULL DEFAULT 1,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE()
);
END
GO

-- ============================================================
-- 25. AUDIT_TRAILS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'audit_trails')
BEGIN
CREATE TABLE audit_trails (
    id          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    table_name  NVARCHAR(50)    NOT NULL,
    record_id   NVARCHAR(36)    NOT NULL,
    action      NVARCHAR(10)    NOT NULL CONSTRAINT CHK_audit_action CHECK (action IN ('INSERT','UPDATE','DELETE')),
    old_values  NVARCHAR(MAX),
    new_values  NVARCHAR(MAX),
    user_id     NVARCHAR(36),
    ip_address  NVARCHAR(45),
    user_agent  NVARCHAR(MAX),
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_audit_trails_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IDX_audit_trails_table    ON audit_trails(table_name, record_id);
CREATE INDEX IDX_audit_trails_user     ON audit_trails(user_id);
CREATE INDEX IDX_audit_trails_created  ON audit_trails(created_at);
END
GO

-- ============================================================
-- 26. REFERRAL_PROGRAMS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'referral_programs')
BEGIN
CREATE TABLE referral_programs (
    id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
    referrer_id     NVARCHAR(36)    NOT NULL,
    referee_id      NVARCHAR(36)    NOT NULL,
    referral_code   NVARCHAR(20)    NOT NULL UNIQUE,
    status          NVARCHAR(20)    NOT NULL DEFAULT 'pending' CONSTRAINT CHK_referral_status CHECK (status IN ('pending','completed','expired')),
    reward_amount   DECIMAL(12,0)   NOT NULL,
    reward_given    BIT             NOT NULL DEFAULT 0,
    expires_at      DATETIME2       NOT NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    completed_at    DATETIME2,
    CONSTRAINT FK_referral_referrer FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE NO ACTION,
    CONSTRAINT FK_referral_referee  FOREIGN KEY (referee_id)  REFERENCES users(id) ON DELETE NO ACTION
);
CREATE INDEX IDX_referral_referrer ON referral_programs(referrer_id);
CREATE INDEX IDX_referral_code     ON referral_programs(referral_code);
CREATE INDEX IDX_referral_status   ON referral_programs(status);
END
GO

-- ============================================================
-- 27. LOYALTY_POINTS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'loyalty_points')
BEGIN
CREATE TABLE loyalty_points (
    id          NVARCHAR(36)    NOT NULL PRIMARY KEY,
    user_id     NVARCHAR(36)    NOT NULL,
    points      INT             NOT NULL,
    type        NVARCHAR(20)    NOT NULL CONSTRAINT CHK_loyalty_type   CHECK (type   IN ('earned','redeemed','expired')),
    source      NVARCHAR(20)    NOT NULL CONSTRAINT CHK_loyalty_source CHECK (source IN ('booking','referral','review','promotion','redemption')),
    booking_id  NVARCHAR(36),
    description NVARCHAR(MAX),
    expires_at  DATETIME2,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_loyalty_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT FK_loyalty_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);
CREATE INDEX IDX_loyalty_user       ON loyalty_points(user_id);
CREATE INDEX IDX_loyalty_expires_at ON loyalty_points(expires_at);
END
GO

-- ============================================================
-- 28. INSURANCE_CLAIMS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'insurance_claims')
BEGIN
CREATE TABLE insurance_claims (
    id                      NVARCHAR(36)    NOT NULL PRIMARY KEY,
    booking_id              NVARCHAR(36)    NOT NULL,
    claimant_id             NVARCHAR(36)    NOT NULL,
    claim_type              NVARCHAR(20)    NOT NULL CONSTRAINT CHK_claim_type   CHECK (claim_type IN ('damage','theft','accident','other')),
    status                  NVARCHAR(20)    NOT NULL DEFAULT 'submitted' CONSTRAINT CHK_claim_status CHECK (status IN ('submitted','investigating','approved','rejected','paid')),
    claim_amount            DECIMAL(12,0)   NOT NULL,
    approved_amount         DECIMAL(12,0)   NOT NULL DEFAULT 0,
    description             NVARCHAR(MAX)   NOT NULL,
    police_report_number    NVARCHAR(100),
    insurance_company       NVARCHAR(100),
    created_at              DATETIME2       NOT NULL DEFAULT GETDATE(),
    resolved_at             DATETIME2,
    CONSTRAINT FK_claims_booking   FOREIGN KEY (booking_id)   REFERENCES bookings(id) ON DELETE NO ACTION,
    CONSTRAINT FK_claims_claimant  FOREIGN KEY (claimant_id)  REFERENCES users(id)    ON DELETE NO ACTION
);
CREATE INDEX IDX_claims_booking ON insurance_claims(booking_id);
CREATE INDEX IDX_claims_status  ON insurance_claims(status);
END
GO

-- ============================================================
-- 29. VEHICLE_MAINTENANCE
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'vehicle_maintenance')
BEGIN
CREATE TABLE vehicle_maintenance (
    id                  NVARCHAR(36)    NOT NULL PRIMARY KEY,
    vehicle_id          NVARCHAR(36)    NOT NULL,
    type                NVARCHAR(20)    NOT NULL CONSTRAINT CHK_maint_type   CHECK (type   IN ('scheduled','repair','inspection','cleaning')),
    status              NVARCHAR(20)    NOT NULL DEFAULT 'scheduled' CONSTRAINT CHK_maint_status CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
    title               NVARCHAR(200)   NOT NULL,
    description         NVARCHAR(MAX),
    cost                DECIMAL(12,0)   NOT NULL DEFAULT 0,
    service_provider    NVARCHAR(200),
    scheduled_date      DATE            NOT NULL,
    completed_date      DATE,
    next_service_date   DATE,
    odometer_reading    INT,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_maintenance_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
CREATE INDEX IDX_maintenance_vehicle ON vehicle_maintenance(vehicle_id);
CREATE INDEX IDX_maintenance_status  ON vehicle_maintenance(status);
END
GO

-- ============================================================
-- 30. PROMOTIONAL_CAMPAIGNS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'promotional_campaigns')
BEGIN
CREATE TABLE promotional_campaigns (
    id                  NVARCHAR(36)    NOT NULL PRIMARY KEY,
    name                NVARCHAR(200)   NOT NULL,
    description         NVARCHAR(MAX),
    type                NVARCHAR(20)    NOT NULL CONSTRAINT CHK_promo_type            CHECK (type            IN ('discount','cashback','free_addon','loyalty_bonus')),
    target_audience     NVARCHAR(20)    NOT NULL DEFAULT 'all' CONSTRAINT CHK_promo_audience  CHECK (target_audience IN ('all','new_users','returning_users','vip_users')),
    discount_type       NVARCHAR(20)    NOT NULL CONSTRAINT CHK_promo_discount_type   CHECK (discount_type   IN ('percentage','fixed','free_days')),
    discount_value      DECIMAL(10,2)   NOT NULL,
    min_booking_amount  DECIMAL(12,0)   NOT NULL DEFAULT 0,
    max_discount        DECIMAL(12,0),
    usage_limit         INT,
    usage_count         INT             NOT NULL DEFAULT 0,
    start_date          DATETIME2       NOT NULL,
    end_date            DATETIME2       NOT NULL,
    is_active           BIT             NOT NULL DEFAULT 1,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE()
);
CREATE INDEX IDX_promo_type      ON promotional_campaigns(type);
CREATE INDEX IDX_promo_dates     ON promotional_campaigns(start_date, end_date);
CREATE INDEX IDX_promo_is_active ON promotional_campaigns(is_active);
END
GO

-- ============================================================
-- 31. API_KEYS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'api_keys')
BEGIN
CREATE TABLE api_keys (
    id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
    user_id         NVARCHAR(36),
    key_name        NVARCHAR(100)   NOT NULL,
    api_key         NVARCHAR(255)   NOT NULL UNIQUE,
    permissions     NVARCHAR(MAX),
    rate_limit      INT             NOT NULL DEFAULT 1000,
    is_active       BIT             NOT NULL DEFAULT 1,
    last_used_at    DATETIME2,
    expires_at      DATETIME2,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_api_keys_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IDX_api_keys_key       ON api_keys(api_key);
CREATE INDEX IDX_api_keys_user      ON api_keys(user_id);
CREATE INDEX IDX_api_keys_is_active ON api_keys(is_active);
END
GO

-- ============================================================
-- 32. WEBHOOKS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'webhooks')
BEGIN
CREATE TABLE webhooks (
    id                  NVARCHAR(36)    NOT NULL PRIMARY KEY,
    user_id             NVARCHAR(36)    NOT NULL,
    url                 NVARCHAR(500)   NOT NULL,
    events              NVARCHAR(MAX)   NOT NULL,
    secret              NVARCHAR(255)   NOT NULL,
    is_active           BIT             NOT NULL DEFAULT 1,
    last_triggered_at   DATETIME2,
    failure_count       INT             NOT NULL DEFAULT 0,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_webhooks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IDX_webhooks_user      ON webhooks(user_id);
CREATE INDEX IDX_webhooks_is_active ON webhooks(is_active);
END
GO

-- ============================================================
-- 33. WEBHOOK_DELIVERIES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'webhook_deliveries')
BEGIN
CREATE TABLE webhook_deliveries (
    id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
    webhook_id      NVARCHAR(36)    NOT NULL,
    event_type      NVARCHAR(100)   NOT NULL,
    payload         NVARCHAR(MAX)   NOT NULL,
    response_status INT,
    response_body   NVARCHAR(MAX),
    delivered_at    DATETIME2,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_webhook_deliveries_webhook FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
);
CREATE INDEX IDX_wh_deliveries_webhook    ON webhook_deliveries(webhook_id);
CREATE INDEX IDX_wh_deliveries_event_type ON webhook_deliveries(event_type);
END
GO

-- ============================================================
-- 34. EXTERNAL_INTEGRATIONS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'external_integrations')
BEGIN
CREATE TABLE external_integrations (
    id                  NVARCHAR(36)    NOT NULL PRIMARY KEY,
    user_id             NVARCHAR(36)    NOT NULL,
    provider            NVARCHAR(50)    NOT NULL,
    provider_user_id    NVARCHAR(200),
    access_token        NVARCHAR(MAX),
    refresh_token       NVARCHAR(MAX),
    token_expires_at    DATETIME2,
    settings            NVARCHAR(MAX),
    is_active           BIT             NOT NULL DEFAULT 1,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ext_integrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT UQ_user_provider UNIQUE (user_id, provider)
);
CREATE INDEX IDX_ext_integrations_user     ON external_integrations(user_id);
CREATE INDEX IDX_ext_integrations_provider ON external_integrations(provider);
END
GO

-- ============================================================
-- 35. FEATURE_FLAGS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'feature_flags')
BEGIN
CREATE TABLE feature_flags (
    id                  NVARCHAR(36)    NOT NULL PRIMARY KEY,
    name                NVARCHAR(100)   NOT NULL UNIQUE,
    description         NVARCHAR(MAX),
    is_enabled          BIT             NOT NULL DEFAULT 0,
    rollout_percentage  INT             NOT NULL DEFAULT 0 CONSTRAINT CHK_rollout CHECK (rollout_percentage BETWEEN 0 AND 100),
    target_users        NVARCHAR(MAX),
    conditions          NVARCHAR(MAX),
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE()
);
CREATE INDEX IDX_feature_flags_name       ON feature_flags(name);
CREATE INDEX IDX_feature_flags_is_enabled ON feature_flags(is_enabled);
END
GO

PRINT 'LuxeWay - All 35 tables created successfully on SQL Server.';
GO

-- ============================================================
-- MIGRATION: Vietnam Market — Vehicle Type & Specs Columns
-- Added: vehicle_type, engine_cc, motorbike accessories, car services
-- Safe to re-run: all statements use IF COL_LENGTH guard
-- ============================================================

-- Add vehicle_type discriminator column (CAR | MOTORBIKE)
IF COL_LENGTH('vehicles', 'vehicle_type') IS NULL
BEGIN
    ALTER TABLE vehicles ADD vehicle_type NVARCHAR(20) NOT NULL DEFAULT 'CAR'
        CONSTRAINT CHK_vehicles_vehicle_type CHECK (vehicle_type IN ('CAR', 'MOTORBIKE'));
    PRINT 'Added vehicle_type column to vehicles';
END
GO

-- Add engine_cc for motorbikes (e.g., 110, 125, 150, 300, 400)
IF COL_LENGTH('vehicles', 'engine_cc') IS NULL
BEGIN
    ALTER TABLE vehicles ADD engine_cc INT NULL;
    PRINT 'Added engine_cc column to vehicles';
END
GO

-- Motorbike-specific accessory columns
IF COL_LENGTH('vehicles', 'has_helmet') IS NULL
BEGIN
    ALTER TABLE vehicles ADD has_helmet BIT NOT NULL DEFAULT 0;
    PRINT 'Added has_helmet column to vehicles';
END
GO

IF COL_LENGTH('vehicles', 'has_phone_holder') IS NULL
BEGIN
    ALTER TABLE vehicles ADD has_phone_holder BIT NOT NULL DEFAULT 0;
    PRINT 'Added has_phone_holder column to vehicles';
END
GO

IF COL_LENGTH('vehicles', 'has_raincoat') IS NULL
BEGIN
    ALTER TABLE vehicles ADD has_raincoat BIT NOT NULL DEFAULT 0;
    PRINT 'Added has_raincoat column to vehicles';
END
GO

IF COL_LENGTH('vehicles', 'has_touring_package') IS NULL
BEGIN
    ALTER TABLE vehicles ADD has_touring_package BIT NOT NULL DEFAULT 0;
    PRINT 'Added has_touring_package column to vehicles';
END
GO

-- Car-specific service columns
IF COL_LENGTH('vehicles', 'has_chauffeur') IS NULL
BEGIN
    ALTER TABLE vehicles ADD has_chauffeur BIT NOT NULL DEFAULT 0;
    PRINT 'Added has_chauffeur column to vehicles';
END
GO

IF COL_LENGTH('vehicles', 'airport_delivery') IS NULL
BEGIN
    ALTER TABLE vehicles ADD airport_delivery BIT NOT NULL DEFAULT 0;
    PRINT 'Added airport_delivery column to vehicles';
END
GO

IF COL_LENGTH('vehicles', 'wedding_rental') IS NULL
BEGIN
    ALTER TABLE vehicles ADD wedding_rental BIT NOT NULL DEFAULT 0;
    PRINT 'Added wedding_rental column to vehicles';
END
GO

IF COL_LENGTH('vehicles', 'business_rental') IS NULL
BEGIN
    ALTER TABLE vehicles ADD business_rental BIT NOT NULL DEFAULT 0;
    PRINT 'Added business_rental column to vehicles';
END
GO

-- Update existing MOTORBIKE category vehicles to have vehicle_type = MOTORBIKE
UPDATE vehicles SET vehicle_type = 'MOTORBIKE'
WHERE category IN ('MOTORBIKE', 'SCOOTER', 'AUTOMATIC_SCOOTER', 'MANUAL_MOTORCYCLE',
                   'SPORT_BIKE', 'TOURING_BIKE', 'ADVENTURE_BIKE', 'CLASSIC_BIKE', 'ELECTRIC_BIKE');
GO

-- Index on vehicle_type for fast marketplace filtering
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IDX_vehicles_vehicle_type')
BEGIN
    CREATE INDEX IDX_vehicles_vehicle_type ON vehicles(vehicle_type);
    PRINT 'Created IDX_vehicles_vehicle_type index';
END
GO

-- ============================================================
-- 36. VEHICLE_BRANDS (Master Brand Catalog)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'vehicle_brands')
BEGIN
CREATE TABLE vehicle_brands (
    id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
    name            NVARCHAR(100)   NOT NULL UNIQUE,
    country         NVARCHAR(100)   NOT NULL DEFAULT N'Japan',
    vehicle_type    NVARCHAR(20)    NOT NULL CONSTRAINT CHK_brand_type CHECK (vehicle_type IN ('CAR', 'MOTORBIKE', 'BOTH')),
    logo_url        NVARCHAR(500),
    is_active       BIT             NOT NULL DEFAULT 1,
    sort_order      INT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE()
);
CREATE INDEX IDX_vehicle_brands_type ON vehicle_brands(vehicle_type);
END
GO

-- ============================================================
-- 37. VEHICLE_MODELS (Master Model Catalog with VND pricing)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'vehicle_models')
BEGIN
CREATE TABLE vehicle_models (
    id              NVARCHAR(36)    NOT NULL PRIMARY KEY,
    brand_id        NVARCHAR(36)    NOT NULL,
    model_name      NVARCHAR(200)   NOT NULL,
    vehicle_type    NVARCHAR(20)    NOT NULL CONSTRAINT CHK_model_type CHECK (vehicle_type IN ('CAR', 'MOTORBIKE')),
    category        NVARCHAR(50)    NOT NULL,
    engine_cc       INT             NULL,       -- For motorbikes
    seats           INT             NULL,       -- For cars
    base_price_min  DECIMAL(12,0)   NOT NULL,   -- VND/day minimum
    base_price_max  DECIMAL(12,0)   NOT NULL,   -- VND/day maximum
    is_active       BIT             NOT NULL DEFAULT 1,
    sort_order      INT             NOT NULL DEFAULT 0,
    CONSTRAINT FK_vehicle_models_brand FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id) ON DELETE NO ACTION
);
CREATE INDEX IDX_vehicle_models_brand ON vehicle_models(brand_id);
CREATE INDEX IDX_vehicle_models_type  ON vehicle_models(vehicle_type);
END
GO


PRINT 'LuxeWay - Vietnam market migration completed successfully.';
GO

-- ============================================================
-- 38. CAR_BRANDS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'car_brands')
BEGIN
CREATE TABLE car_brands (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    country NVARCHAR(100) NOT NULL,
    logo_url NVARCHAR(500),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
END
GO

-- ============================================================
-- 39. CAR_MODELS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'car_models')
BEGIN
CREATE TABLE car_models (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    brand_id NVARCHAR(36) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    category NVARCHAR(50) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_car_models_brand FOREIGN KEY (brand_id) REFERENCES car_brands(id)
);
END
GO

-- ============================================================
-- 40. CARS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'cars')
BEGIN
CREATE TABLE cars (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    model_id NVARCHAR(36) NOT NULL,
    owner_id NVARCHAR(36) NOT NULL,
    name NVARCHAR(200) NOT NULL,
    license_plate NVARCHAR(20) NOT NULL UNIQUE,
    price_per_day DECIMAL(12,0) NOT NULL,
    deposit DECIMAL(12,0) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    total_reviews INT NOT NULL DEFAULT 0,
    total_bookings INT NOT NULL DEFAULT 0,
    is_verified BIT NOT NULL DEFAULT 0,
    is_featured BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_cars_model FOREIGN KEY (model_id) REFERENCES car_models(id),
    CONSTRAINT FK_cars_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);
END
GO

-- ============================================================
-- 41. CAR_SPECIFICATIONS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'car_specifications')
BEGIN
CREATE TABLE car_specifications (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    car_id NVARCHAR(36) NOT NULL UNIQUE,
    seats INT NOT NULL,
    doors INT NOT NULL,
    transmission NVARCHAR(20) NOT NULL,
    fuel_type NVARCHAR(20) NOT NULL,
    has_chauffeur BIT NOT NULL DEFAULT 0,
    airport_delivery BIT NOT NULL DEFAULT 0,
    electric BIT NOT NULL DEFAULT 0,
    hybrid BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_car_specs_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 42. CAR_IMAGES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'car_images')
BEGIN
CREATE TABLE car_images (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    car_id NVARCHAR(36) NOT NULL,
    url NVARCHAR(500) NOT NULL,
    is_primary BIT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_car_images_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 43. CAR_LOCATIONS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'car_locations')
BEGIN
CREATE TABLE car_locations (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    car_id NVARCHAR(36) NOT NULL UNIQUE,
    city NVARCHAR(100) NOT NULL,
    address NVARCHAR(MAX) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    CONSTRAINT FK_car_locations_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 44. CAR_PRICING
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'car_pricing')
BEGIN
CREATE TABLE car_pricing (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    car_id NVARCHAR(36) NOT NULL,
    weekend_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    holiday_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    CONSTRAINT FK_car_pricing_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 45. CAR_AVAILABILITY
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'car_availability')
BEGIN
CREATE TABLE car_availability (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    car_id NVARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    is_available BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_car_avail_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 46. CAR_BOOKINGS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'car_bookings')
BEGIN
CREATE TABLE car_bookings (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    car_id NVARCHAR(36) NOT NULL,
    renter_id NVARCHAR(36) NOT NULL,
    owner_id NVARCHAR(36) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    price_per_day DECIMAL(12,0) NOT NULL,
    base_price DECIMAL(12,0) NOT NULL,
    service_fee DECIMAL(12,0) NOT NULL,
    taxes DECIMAL(12,0) NOT NULL,
    total DECIMAL(12,0) NOT NULL,
    deposit DECIMAL(12,0) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_car_bookings_car FOREIGN KEY (car_id) REFERENCES cars(id),
    CONSTRAINT FK_car_bookings_renter FOREIGN KEY (renter_id) REFERENCES users(id),
    CONSTRAINT FK_car_bookings_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);
END
GO

-- ============================================================
-- 47. CAR_BOOKING_HISTORY
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'car_booking_history')
BEGIN
CREATE TABLE car_booking_history (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    booking_id NVARCHAR(36) NOT NULL,
    status NVARCHAR(20) NOT NULL,
    changed_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_car_history_booking FOREIGN KEY (booking_id) REFERENCES car_bookings(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 48. CAR_DELIVERY
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'car_delivery')
BEGIN
CREATE TABLE car_delivery (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    booking_id NVARCHAR(36) NOT NULL UNIQUE,
    delivery_address NVARCHAR(500) NOT NULL,
    fee DECIMAL(12,0) NOT NULL DEFAULT 0,
    CONSTRAINT FK_car_delivery_booking FOREIGN KEY (booking_id) REFERENCES car_bookings(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 49. CHAUFFEUR_SERVICES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'chauffeur_services')
BEGIN
CREATE TABLE chauffeur_services (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    booking_id NVARCHAR(36) NOT NULL UNIQUE,
    chauffeur_name NVARCHAR(100) NOT NULL,
    price_per_day DECIMAL(12,0) NOT NULL DEFAULT 0,
    CONSTRAINT FK_chauffeur_booking FOREIGN KEY (booking_id) REFERENCES car_bookings(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 50. AIRPORT_TRANSFER_SERVICES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'airport_transfer_services')
BEGIN
CREATE TABLE airport_transfer_services (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    booking_id NVARCHAR(36) NOT NULL UNIQUE,
    flight_number NVARCHAR(20) NOT NULL,
    fee DECIMAL(12,0) NOT NULL DEFAULT 0,
    CONSTRAINT FK_airport_booking FOREIGN KEY (booking_id) REFERENCES car_bookings(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 51. BUSINESS_PACKAGES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'business_packages')
BEGIN
CREATE TABLE business_packages (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    car_id NVARCHAR(36) NOT NULL,
    company_name NVARCHAR(200) NOT NULL,
    discount_percent INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_business_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 52. WEDDING_PACKAGES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'wedding_packages')
BEGIN
CREATE TABLE wedding_packages (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    car_id NVARCHAR(36) NOT NULL,
    decoration_style NVARCHAR(100) NOT NULL,
    price DECIMAL(12,0) NOT NULL DEFAULT 0,
    CONSTRAINT FK_wedding_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 53. CAR_ANALYTICS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'car_analytics')
BEGIN
CREATE TABLE car_analytics (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    revenue DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    bookings_count INT NOT NULL DEFAULT 0
);
END
GO

-- ============================================================
-- 54. MOTORBIKE_BRANDS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'motorbike_brands')
BEGIN
CREATE TABLE motorbike_brands (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    country NVARCHAR(100) NOT NULL,
    logo_url NVARCHAR(500),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
END
GO

-- ============================================================
-- 55. MOTORBIKE_MODELS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'motorbike_models')
BEGIN
CREATE TABLE motorbike_models (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    brand_id NVARCHAR(36) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    category NVARCHAR(50) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_motorbike_models_brand FOREIGN KEY (brand_id) REFERENCES motorbike_brands(id)
);
END
GO

-- ============================================================
-- 56. MOTORBIKES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'motorbikes')
BEGIN
CREATE TABLE motorbikes (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    model_id NVARCHAR(36) NOT NULL,
    owner_id NVARCHAR(36) NOT NULL,
    name NVARCHAR(200) NOT NULL,
    license_plate NVARCHAR(20) NOT NULL UNIQUE,
    price_per_day DECIMAL(12,0) NOT NULL,
    deposit DECIMAL(12,0) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    total_reviews INT NOT NULL DEFAULT 0,
    total_bookings INT NOT NULL DEFAULT 0,
    is_verified BIT NOT NULL DEFAULT 0,
    is_featured BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_motorbikes_model FOREIGN KEY (model_id) REFERENCES motorbike_models(id),
    CONSTRAINT FK_motorbikes_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);
END
GO

-- ============================================================
-- 57. MOTORBIKE_SPECIFICATIONS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'motorbike_specifications')
BEGIN
CREATE TABLE motorbike_specifications (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    motorbike_id NVARCHAR(36) NOT NULL UNIQUE,
    engine_cc INT NOT NULL,
    transmission NVARCHAR(20) NOT NULL,
    helmet_included BIT NOT NULL DEFAULT 1,
    raincoat_included BIT NOT NULL DEFAULT 1,
    phone_holder BIT NOT NULL DEFAULT 0,
    luggage_rack BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_motorbike_specs_motorbike FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 58. MOTORBIKE_IMAGES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'motorbike_images')
BEGIN
CREATE TABLE motorbike_images (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    motorbike_id NVARCHAR(36) NOT NULL,
    url NVARCHAR(500) NOT NULL,
    is_primary BIT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_motorbike_images_motorbike FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 59. MOTORBIKE_LOCATIONS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'motorbike_locations')
BEGIN
CREATE TABLE motorbike_locations (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    motorbike_id NVARCHAR(36) NOT NULL UNIQUE,
    city NVARCHAR(100) NOT NULL,
    address NVARCHAR(MAX) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    CONSTRAINT FK_motorbike_locations_motorbike FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 60. MOTORBIKE_PRICING
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'motorbike_pricing')
BEGIN
CREATE TABLE motorbike_pricing (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    motorbike_id NVARCHAR(36) NOT NULL,
    weekend_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    holiday_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    CONSTRAINT FK_motorbike_pricing_motorbike FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 61. MOTORBIKE_AVAILABILITY
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'motorbike_availability')
BEGIN
CREATE TABLE motorbike_availability (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    motorbike_id NVARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    is_available BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_motorbike_avail_motorbike FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 62. MOTORBIKE_BOOKINGS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'motorbike_bookings')
BEGIN
CREATE TABLE motorbike_bookings (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    motorbike_id NVARCHAR(36) NOT NULL,
    renter_id NVARCHAR(36) NOT NULL,
    owner_id NVARCHAR(36) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    price_per_day DECIMAL(12,0) NOT NULL,
    base_price DECIMAL(12,0) NOT NULL,
    service_fee DECIMAL(12,0) NOT NULL,
    taxes DECIMAL(12,0) NOT NULL,
    total DECIMAL(12,0) NOT NULL,
    deposit DECIMAL(12,0) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_motorbike_bookings_motorbike FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id),
    CONSTRAINT FK_motorbike_bookings_renter FOREIGN KEY (renter_id) REFERENCES users(id),
    CONSTRAINT FK_motorbike_bookings_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);
END
GO

-- ============================================================
-- 63. MOTORBIKE_BOOKING_HISTORY
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'motorbike_booking_history')
BEGIN
CREATE TABLE motorbike_booking_history (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    booking_id NVARCHAR(36) NOT NULL,
    status NVARCHAR(20) NOT NULL,
    changed_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_motorbike_history_booking FOREIGN KEY (booking_id) REFERENCES motorbike_bookings(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 64. TOUR_PACKAGES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'tour_packages')
BEGIN
CREATE TABLE tour_packages (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    motorbike_id NVARCHAR(36) NOT NULL,
    destination NVARCHAR(200) NOT NULL,
    price DECIMAL(12,0) NOT NULL DEFAULT 0,
    CONSTRAINT FK_tour_motorbike FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 65. ADVENTURE_PACKAGES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'adventure_packages')
BEGIN
CREATE TABLE adventure_packages (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    motorbike_id NVARCHAR(36) NOT NULL,
    level NVARCHAR(50) NOT NULL,
    price DECIMAL(12,0) NOT NULL DEFAULT 0,
    CONSTRAINT FK_adventure_motorbike FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 66. EQUIPMENT_RENTALS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'equipment_rentals')
BEGIN
CREATE TABLE equipment_rentals (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    booking_id NVARCHAR(36) NOT NULL,
    equipment_name NVARCHAR(100) NOT NULL,
    price DECIMAL(12,0) NOT NULL DEFAULT 0,
    CONSTRAINT FK_equipment_booking FOREIGN KEY (booking_id) REFERENCES motorbike_bookings(id) ON DELETE CASCADE
);
END
GO

-- ============================================================
-- 67. MOTORBIKE_ANALYTICS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'motorbike_analytics')
BEGIN
CREATE TABLE motorbike_analytics (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    revenue DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    bookings_count INT NOT NULL DEFAULT 0
);
END
GO

PRINT 'LuxeWay - Bounded contexts (Cars & Motorbikes) migration completed successfully.';
GO
