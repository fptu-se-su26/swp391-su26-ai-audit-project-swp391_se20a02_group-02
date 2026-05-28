-- ============================================================
-- CREATE API_PROVIDERS TABLE
-- ============================================================
-- This table stores configuration for external API providers (KYC, Payment, SMS, etc.)

IF OBJECT_ID('api_providers', 'U') IS NULL
BEGIN
    CREATE TABLE api_providers (
        id VARCHAR(36) PRIMARY KEY NOT NULL,
        provider_name NVARCHAR(100) NOT NULL UNIQUE,
        provider_type NVARCHAR(50) NOT NULL,
        base_url NVARCHAR(500) NOT NULL,
        api_key NVARCHAR(500) NOT NULL,
        secret_key NVARCHAR(500),
        username NVARCHAR(500),
        password NVARCHAR(500),
        additional_config NVARCHAR(2000),
        is_active BIT NOT NULL DEFAULT 1,
        is_primary BIT NOT NULL DEFAULT 0,
        description NVARCHAR(500),
        webhook_url NVARCHAR(500),
        retry_attempts INT NOT NULL DEFAULT 3,
        timeout_seconds INT NOT NULL DEFAULT 30,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        last_error_message NVARCHAR(500),
        last_error_time DATETIME2
    );
    
    -- Create indexes for better query performance
    CREATE INDEX idx_api_providers_provider_name ON api_providers(provider_name);
    CREATE INDEX idx_api_providers_provider_type ON api_providers(provider_type);
    CREATE INDEX idx_api_providers_is_active ON api_providers(is_active);
    CREATE INDEX idx_api_providers_type_primary ON api_providers(provider_type, is_primary);
    
    PRINT '✅ Table api_providers created successfully!';
END
ELSE
BEGIN
    PRINT '⚠️ Table api_providers already exists!';
END
GO

-- ============================================================
-- INSERT SAMPLE KYC PROVIDERS
-- ============================================================

-- Check if data already exists
IF NOT EXISTS (SELECT 1 FROM api_providers WHERE provider_name = 'ViaSoft KYC')
BEGIN
    INSERT INTO api_providers (
        id, 
        provider_name, 
        provider_type, 
        base_url, 
        api_key, 
        secret_key, 
        is_active, 
        is_primary, 
        description,
        retry_attempts,
        timeout_seconds
    ) VALUES 
    (
        NEWID(),
        'ViaSoft KYC',
        'KYC',
        'https://api.viasoft.vn/kyc',
        'viasoft_api_key_here',
        'viasoft_secret_key_here',
        1,
        1,
        'ViaSoft KYC service for identity verification',
        3,
        30
    ),
    (
        NEWID(),
        'Face++ KYC',
        'KYC',
        'https://api.megvii.com/faceid/v3',
        'faceplus_api_key_here',
        'faceplus_secret_key_here',
        1,
        0,
        'Megvii Face++ for facial recognition',
        3,
        30
    );
    
    PRINT '✅ Sample KYC providers inserted successfully!';
END
ELSE
BEGIN
    PRINT '⚠️ Sample KYC providers already exist!';
END
GO

-- ============================================================
-- INSERT SAMPLE PAYMENT PROVIDERS
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM api_providers WHERE provider_name = 'Stripe')
BEGIN
    INSERT INTO api_providers (
        id, 
        provider_name, 
        provider_type, 
        base_url, 
        api_key, 
        secret_key, 
        is_active, 
        is_primary, 
        description,
        webhook_url,
        retry_attempts,
        timeout_seconds
    ) VALUES 
    (
        NEWID(),
        'Stripe',
        'PAYMENT',
        'https://api.stripe.com',
        'pk_test_stripe_key_here',
        'sk_test_stripe_secret_here',
        1,
        1,
        'Stripe payment gateway',
        'https://yourdomain.com/webhooks/stripe',
        3,
        30
    ),
    (
        NEWID(),
        'PayPal',
        'PAYMENT',
        'https://api.sandbox.paypal.com',
        'paypal_client_id_here',
        'paypal_client_secret_here',
        1,
        0,
        'PayPal payment gateway',
        'https://yourdomain.com/webhooks/paypal',
        3,
        30
    );
    
    PRINT '✅ Sample payment providers inserted successfully!';
END
ELSE
BEGIN
    PRINT '⚠️ Sample payment providers already exist!';
END
GO

-- ============================================================
-- INSERT SAMPLE EMAIL/SMS PROVIDERS
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM api_providers WHERE provider_name = 'SendGrid')
BEGIN
    INSERT INTO api_providers (
        id, 
        provider_name, 
        provider_type, 
        base_url, 
        api_key, 
        is_active, 
        is_primary, 
        description,
        retry_attempts,
        timeout_seconds
    ) VALUES 
    (
        NEWID(),
        'SendGrid',
        'EMAIL',
        'https://api.sendgrid.com',
        'sendgrid_api_key_here',
        NULL,
        1,
        1,
        'SendGrid email service',
        3,
        30
    ),
    (
        NEWID(),
        'Twilio',
        'SMS',
        'https://api.twilio.com',
        'twilio_account_sid_here',
        'twilio_auth_token_here',
        1,
        1,
        'Twilio SMS service',
        3,
        30
    );
    
    PRINT '✅ Sample email/SMS providers inserted successfully!';
END
ELSE
BEGIN
    PRINT '⚠️ Sample email/SMS providers already exist!';
END
GO

PRINT '';
PRINT '✅ API Providers setup completed!';
PRINT '';
PRINT 'Available Provider Types: KYC, PAYMENT, EMAIL, SMS, ANALYTICS, etc.';
GO
