-- V6__owner_application.sql
CREATE TABLE owner_applications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    current_step INT NOT NULL DEFAULT 1,
    rejection_reason NVARCHAR(MAX),
    
    -- Step 1: Personal Info
    full_name NVARCHAR(200),
    dob DATE,
    phone VARCHAR(20),
    address NVARCHAR(500),
    city NVARCHAR(100),
    
    -- Step 3: Owner Profile
    display_name NVARCHAR(200),
    bio NVARCHAR(MAX),
    service_area NVARCHAR(200),
    
    -- Step 4: Payout
    bank_name NVARCHAR(200),
    account_holder_name NVARCHAR(200),
    masked_account_number VARCHAR(100),
    encrypted_account_number VARCHAR(500),
    
    -- Step 5: Terms
    terms_accepted BIT DEFAULT 0,
    terms_version VARCHAR(50),
    
    submitted_at DATETIME2,
    reviewed_at DATETIME2,
    reviewed_by VARCHAR(36),
    created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_owner_app_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_owner_app_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Unique index to ensure one active application per user
CREATE UNIQUE INDEX idx_owner_app_user_active 
ON owner_applications(user_id) 
WHERE status NOT IN ('REJECTED', 'CANCELLED');

CREATE TABLE owner_application_documents (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_reference VARCHAR(500) NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    rejection_reason NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_owner_app_doc_app FOREIGN KEY (application_id) REFERENCES owner_applications(id) ON DELETE CASCADE
);
