-- ============================================================
-- LUXEWAY ENTERPRISE SCHEMA MIGRATIONS (PHASES 1-10)
-- Target Database: SQL Server
-- ============================================================

-- 1. ISOLATION TABLES (PHASE 1)
IF OBJECT_ID('car_reviews', 'U') IS NULL
BEGIN
    CREATE TABLE car_reviews (
        id NVARCHAR(36) PRIMARY KEY,
        car_id NVARCHAR(36) NOT NULL,
        booking_id NVARCHAR(36) NOT NULL,
        reviewer_id NVARCHAR(36) NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        cleanliness INT NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
        accuracy INT NOT NULL CHECK (accuracy BETWEEN 1 AND 5),
        communication INT NOT NULL CHECK (communication BETWEEN 1 AND 5),
        value_rating INT NOT NULL CHECK (value_rating BETWEEN 1 AND 5),
        comment NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE NO ACTION
    );
END

IF OBJECT_ID('motorbike_reviews', 'U') IS NULL
BEGIN
    CREATE TABLE motorbike_reviews (
        id NVARCHAR(36) PRIMARY KEY,
        motorbike_id NVARCHAR(36) NOT NULL,
        booking_id NVARCHAR(36) NOT NULL,
        reviewer_id NVARCHAR(36) NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        cleanliness INT NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
        accuracy INT NOT NULL CHECK (accuracy BETWEEN 1 AND 5),
        communication INT NOT NULL CHECK (communication BETWEEN 1 AND 5),
        value_rating INT NOT NULL CHECK (value_rating BETWEEN 1 AND 5),
        comment NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE NO ACTION
    );
END

IF OBJECT_ID('car_insurances', 'U') IS NULL
BEGIN
    CREATE TABLE car_insurances (
        id NVARCHAR(36) PRIMARY KEY,
        car_id NVARCHAR(36) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500) NULL,
        cost_per_day DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        coverage_limit DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        is_active BIT NOT NULL DEFAULT 1,
        FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('motorbike_deposits', 'U') IS NULL
BEGIN
    CREATE TABLE motorbike_deposits (
        id NVARCHAR(36) PRIMARY KEY,
        motorbike_id NVARCHAR(36) NOT NULL,
        amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        description NVARCHAR(500) NULL,
        is_active BIT NOT NULL DEFAULT 1,
        FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('car_addons', 'U') IS NULL
BEGIN
    CREATE TABLE car_addons (
        id NVARCHAR(36) PRIMARY KEY,
        car_id NVARCHAR(36) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500) NULL,
        price_per_day DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        is_active BIT NOT NULL DEFAULT 1,
        FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('motorbike_addons', 'U') IS NULL
BEGIN
    CREATE TABLE motorbike_addons (
        id NVARCHAR(36) PRIMARY KEY,
        motorbike_id NVARCHAR(36) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500) NULL,
        price_per_day DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        is_active BIT NOT NULL DEFAULT 1,
        FOREIGN KEY (motorbike_id) REFERENCES motorbikes(id) ON DELETE CASCADE
    );
END

-- 2. DYNAMIC PRICING ENGINE (PHASE 3)
IF OBJECT_ID('pricing_rules', 'U') IS NULL
BEGIN
    CREATE TABLE pricing_rules (
        id NVARCHAR(36) PRIMARY KEY,
        vehicle_id NVARCHAR(36) NOT NULL,
        rule_type NVARCHAR(50) NOT NULL, -- WEEKEND, HOLIDAY, SEASONAL, SURGE, LOYALTY
        multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
        start_date DATE NULL,
        end_date DATE NULL,
        name NVARCHAR(100) NOT NULL,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END

-- 3. REWARD LOYALTY PROGRAM (PHASE 6)
IF OBJECT_ID('user_loyalty', 'U') IS NULL
BEGIN
    CREATE TABLE user_loyalty (
        user_id NVARCHAR(36) PRIMARY KEY,
        points INT NOT NULL DEFAULT 0,
        tier NVARCHAR(20) NOT NULL DEFAULT 'SILVER', -- SILVER, GOLD, PLATINUM, DIAMOND
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('reward_transactions', 'U') IS NULL
BEGIN
    CREATE TABLE reward_transactions (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NOT NULL,
        points INT NOT NULL,
        transaction_type NVARCHAR(20) NOT NULL, -- EARNED, REDEEMED, EXPIRED
        description NVARCHAR(500) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END

-- 4. CORPORATE COMPANY ACCOUNTS (PHASE 7)
IF OBJECT_ID('companies', 'U') IS NULL
BEGIN
    CREATE TABLE companies (
        id NVARCHAR(36) PRIMARY KEY,
        name NVARCHAR(200) NOT NULL,
        domain NVARCHAR(100) NULL,
        billing_address NVARCHAR(500) NULL,
        registration_number NVARCHAR(100) NULL,
        budget_limit DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        budget_spent DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END

IF OBJECT_ID('departments', 'U') IS NULL
BEGIN
    CREATE TABLE departments (
        id NVARCHAR(36) PRIMARY KEY,
        company_id NVARCHAR(36) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        budget_limit DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        budget_spent DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('corporate_employees', 'U') IS NULL
BEGIN
    CREATE TABLE corporate_employees (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NOT NULL,
        department_id NVARCHAR(36) NOT NULL,
        corporate_role NVARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE', -- EMPLOYEE, MANAGER, ADMIN
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('company_bookings', 'U') IS NULL
BEGIN
    CREATE TABLE company_bookings (
        booking_id NVARCHAR(36) PRIMARY KEY,
        company_id NVARCHAR(36) NOT NULL,
        department_id NVARCHAR(36) NOT NULL,
        approved_by NVARCHAR(36) NULL,
        status NVARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED, REJECTED
        approved_at DATETIME2 NULL,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE NO ACTION,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE NO ACTION
    );
END

-- 5. ENTERPRISE NOTIFICATION TEMPLATES (PHASE 9)
IF OBJECT_ID('notification_templates', 'U') IS NULL
BEGIN
    CREATE TABLE notification_templates (
        id NVARCHAR(36) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        subject NVARCHAR(200) NOT NULL,
        body_template NVARCHAR(MAX) NOT NULL,
        channel NVARCHAR(20) NOT NULL, -- IN_APP, EMAIL, PUSH, SMS
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END

IF OBJECT_ID('notification_logs', 'U') IS NULL
BEGIN
    CREATE TABLE notification_logs (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NOT NULL,
        template_id NVARCHAR(36) NULL,
        title NVARCHAR(200) NOT NULL,
        body NVARCHAR(MAX) NOT NULL,
        channel NVARCHAR(20) NOT NULL, -- IN_APP, EMAIL, PUSH, SMS
        status NVARCHAR(20) NOT NULL DEFAULT 'SENT', -- SENT, FAILED
        sent_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        error_message NVARCHAR(MAX) NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (template_id) REFERENCES notification_templates(id) ON DELETE SET NULL
    );
END

-- 6. GLOBAL AUDIT TRAIL LEDGER (PHASE 10)
IF OBJECT_ID('audit_logs', 'U') IS NULL
BEGIN
    CREATE TABLE audit_logs (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NULL,
        action NVARCHAR(100) NOT NULL,
        target_type NVARCHAR(50) NOT NULL,
        target_id NVARCHAR(36) NULL,
        old_values NVARCHAR(MAX) NULL,
        new_values NVARCHAR(MAX) NULL,
        ip_address NVARCHAR(45) NULL,
        user_agent NVARCHAR(500) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END


-- 7. SUPPORT DEPARTMENTS & AGENTS
IF OBJECT_ID('support_agents', 'U') IS NULL
BEGIN
    CREATE TABLE support_agents (
        id NVARCHAR(36) PRIMARY KEY,
        department NVARCHAR(100) NOT NULL, -- BILLING, TECHNICAL, ESCALATIONS, GENERAL
        status NVARCHAR(20) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, BUSY, OFFLINE
        active_ticket_count INT NOT NULL DEFAULT 0,
        rating DECIMAL(3,2) NOT NULL DEFAULT 5.00,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    );
END

-- 8. TICKET CATEGORIES & PRIORITIES
IF OBJECT_ID('support_categories', 'U') IS NULL
BEGIN
    CREATE TABLE support_categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        display_name NVARCHAR(200) NOT NULL,
        description NVARCHAR(500) NULL,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END

IF OBJECT_ID('support_priorities', 'U') IS NULL
BEGIN
    CREATE TABLE support_priorities (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(20) NOT NULL UNIQUE, -- LOW, NORMAL, HIGH, URGENT, EMERGENCY
        priority_value INT NOT NULL DEFAULT 1,
        response_time_hours INT NOT NULL DEFAULT 24,
        resolution_time_hours INT NOT NULL DEFAULT 72,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END

-- 9. SUPPORT TICKETS
IF OBJECT_ID('support_tickets_v2', 'U') IS NULL
BEGIN
    CREATE TABLE support_tickets_v2 (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NOT NULL,
        booking_id NVARCHAR(36) NULL, -- Supports CarBooking or MotorbikeBooking
        vehicle_id NVARCHAR(36) NULL,
        subject NVARCHAR(300) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        category_id INT NOT NULL,
        priority_id INT NOT NULL,
        status NVARCHAR(30) NOT NULL DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, WAITING_CUSTOMER, ESCALATED, RESOLVED, CLOSED
        assigned_agent_id NVARCHAR(36) NULL,
        sla_deadline DATETIME2 NULL,
        resolved_at DATETIME2 NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_agent_id) REFERENCES support_agents(id) ON DELETE NO ACTION,
        FOREIGN KEY (category_id) REFERENCES support_categories(id) ON DELETE NO ACTION,
        FOREIGN KEY (priority_id) REFERENCES support_priorities(id) ON DELETE NO ACTION
    );
END

-- 10. SUPPORT MESSAGES & ATTACHMENTS
IF OBJECT_ID('support_messages_v2', 'U') IS NULL
BEGIN
    CREATE TABLE support_messages_v2 (
        id NVARCHAR(36) PRIMARY KEY,
        ticket_id NVARCHAR(36) NOT NULL,
        sender_id NVARCHAR(36) NOT NULL,
        sender_role NVARCHAR(20) NOT NULL, -- CUSTOMER, AGENT, SYSTEM, AI
        body NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (ticket_id) REFERENCES support_tickets_v2(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE NO ACTION
    );
END

IF OBJECT_ID('support_attachments', 'U') IS NULL
BEGIN
    CREATE TABLE support_attachments (
        id NVARCHAR(36) PRIMARY KEY,
        message_id NVARCHAR(36) NOT NULL,
        file_name NVARCHAR(255) NOT NULL,
        file_url NVARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        content_type NVARCHAR(100) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (message_id) REFERENCES support_messages_v2(id) ON DELETE CASCADE
    );
END

-- 11. INTERNAL AGENT NOTES & ESCALATIONS & HISTORY
IF OBJECT_ID('support_agent_notes', 'U') IS NULL
BEGIN
    CREATE TABLE support_agent_notes (
        id NVARCHAR(36) PRIMARY KEY,
        ticket_id NVARCHAR(36) NOT NULL,
        agent_id NVARCHAR(36) NOT NULL,
        note_text NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (ticket_id) REFERENCES support_tickets_v2(id) ON DELETE CASCADE,
        FOREIGN KEY (agent_id) REFERENCES support_agents(id) ON DELETE NO ACTION
    );
END

IF OBJECT_ID('ticket_escalations', 'U') IS NULL
BEGIN
    CREATE TABLE ticket_escalations (
        id NVARCHAR(36) PRIMARY KEY,
        ticket_id NVARCHAR(36) NOT NULL,
        escalated_by NVARCHAR(36) NOT NULL,
        escalated_to NVARCHAR(36) NOT NULL,
        reason NVARCHAR(MAX) NOT NULL,
        escalated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (ticket_id) REFERENCES support_tickets_v2(id) ON DELETE CASCADE,
        FOREIGN KEY (escalated_by) REFERENCES users(id) ON DELETE NO ACTION,
        FOREIGN KEY (escalated_to) REFERENCES support_agents(id) ON DELETE NO ACTION
    );
END

IF OBJECT_ID('support_status_history', 'U') IS NULL
BEGIN
    CREATE TABLE support_status_history (
        id NVARCHAR(36) PRIMARY KEY,
        ticket_id NVARCHAR(36) NOT NULL,
        old_status NVARCHAR(30) NULL,
        new_status NVARCHAR(30) NOT NULL,
        changed_by NVARCHAR(36) NOT NULL,
        reason NVARCHAR(500) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (ticket_id) REFERENCES support_tickets_v2(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE NO ACTION
    );
END

-- 12. ENTERPRISE KNOWLEDGE BASE & FAQS
IF OBJECT_ID('knowledge_categories', 'U') IS NULL
BEGIN
    CREATE TABLE knowledge_categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        parent_id INT NULL,
        slug NVARCHAR(100) NOT NULL UNIQUE,
        name NVARCHAR(100) NOT NULL,
        icon NVARCHAR(50) NOT NULL DEFAULT 'BookOpen',
        description NVARCHAR(500) NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (parent_id) REFERENCES knowledge_categories(id) ON DELETE NO ACTION
    );
END

IF OBJECT_ID('knowledge_articles', 'U') IS NULL
BEGIN
    CREATE TABLE knowledge_articles (
        id NVARCHAR(36) PRIMARY KEY,
        category_id INT NOT NULL,
        slug NVARCHAR(200) NOT NULL UNIQUE,
        title NVARCHAR(250) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        excerpt NVARCHAR(500) NULL,
        is_published BIT NOT NULL DEFAULT 1,
        view_count INT NOT NULL DEFAULT 0,
        is_featured BIT NOT NULL DEFAULT 0,
        is_popular BIT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (category_id) REFERENCES knowledge_categories(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('knowledge_article_views', 'U') IS NULL
BEGIN
    CREATE TABLE knowledge_article_views (
        id NVARCHAR(36) PRIMARY KEY,
        article_id NVARCHAR(36) NOT NULL,
        user_id NVARCHAR(36) NULL,
        ip_address NVARCHAR(45) NULL,
        viewed_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (article_id) REFERENCES knowledge_articles(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('faq_categories', 'U') IS NULL
BEGIN
    CREATE TABLE faq_categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        slug NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(500) NULL,
        display_order INT NOT NULL DEFAULT 0
    );
END

IF OBJECT_ID('faq_items', 'U') IS NULL
BEGIN
    CREATE TABLE faq_items (
        id NVARCHAR(36) PRIMARY KEY,
        category_id INT NOT NULL,
        question NVARCHAR(300) NOT NULL,
        answer NVARCHAR(MAX) NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        is_active BIT NOT NULL DEFAULT 1,
        FOREIGN KEY (category_id) REFERENCES faq_categories(id) ON DELETE CASCADE
    );
END

-- 13. AI CONCIERGE CHAT SESSIONS
IF OBJECT_ID('ai_chat_sessions', 'U') IS NULL
BEGIN
    CREATE TABLE ai_chat_sessions (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NULL,
        booking_id NVARCHAR(36) NULL,
        vehicle_id NVARCHAR(36) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
END

IF OBJECT_ID('ai_chat_messages', 'U') IS NULL
BEGIN
    CREATE TABLE ai_chat_messages (
        id NVARCHAR(36) PRIMARY KEY,
        session_id NVARCHAR(36) NOT NULL,
        role NVARCHAR(20) NOT NULL, -- USER, ASSISTANT
        content NVARCHAR(MAX) NOT NULL,
        raw_response NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE
    );
END

-- 14. REAL-TIME DELIVERY TRACKING
IF OBJECT_ID('delivery_tracking', 'U') IS NULL
BEGIN
    CREATE TABLE delivery_tracking (
        id NVARCHAR(36) PRIMARY KEY,
        booking_id NVARCHAR(36) NOT NULL,
        owner_id NVARCHAR(36) NOT NULL,
        renter_id NVARCHAR(36) NOT NULL,
        status NVARCHAR(30) NOT NULL DEFAULT 'WAITING_DEPARTURE', -- WAITING_DEPARTURE, EN_ROUTE, ARRIVED, COMPLETED
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        vehicle_latitude DECIMAL(10,8) NOT NULL,
        vehicle_longitude DECIMAL(11,8) NOT NULL,
        renter_latitude DECIMAL(10,8) NOT NULL,
        renter_longitude DECIMAL(11,8) NOT NULL,
        eta DATETIME2 NULL,
        distance_km DECIMAL(6,2) NOT NULL DEFAULT 0.00,
        speed_kmh DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE NO ACTION,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE NO ACTION
    );
END

IF OBJECT_ID('delivery_tracking_history', 'U') IS NULL
BEGIN
    CREATE TABLE delivery_tracking_history (
        id NVARCHAR(36) PRIMARY KEY,
        tracking_id NVARCHAR(36) NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        recorded_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (tracking_id) REFERENCES delivery_tracking(id) ON DELETE CASCADE
    );
END

-- 15. EMERGENCY SUPPORT
IF OBJECT_ID('emergency_reports', 'U') IS NULL
BEGIN
    CREATE TABLE emergency_reports (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NOT NULL,
        booking_id NVARCHAR(36) NULL,
        vehicle_id NVARCHAR(36) NULL,
        emergency_type NVARCHAR(50) NOT NULL, -- BREAKDOWN, ACCIDENT, LOST_KEY, UNSAFE, OWNER_NO_SHOW, CUSTOMER_NO_SHOW
        description NVARCHAR(MAX) NOT NULL,
        latitude DECIMAL(10,8) NULL,
        longitude DECIMAL(11,8) NULL,
        contact_phone NVARCHAR(30) NOT NULL,
        status NVARCHAR(30) NOT NULL DEFAULT 'REPORTED', -- REPORTED, DISPATCHED, RESOLVED, CANCELLED
        responder_notes NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END

-- 16. SYSTEM STATUS PAGE
IF OBJECT_ID('service_status', 'U') IS NULL
BEGIN
    CREATE TABLE service_status (
        id INT IDENTITY(1,1) PRIMARY KEY,
        service_name NVARCHAR(100) NOT NULL UNIQUE, -- BOOKING, PAYMENT, MAPS, NOTIFICATIONS, MESSAGING, EMAIL
        status NVARCHAR(30) NOT NULL DEFAULT 'OPERATIONAL', -- OPERATIONAL, DEGRADED, OUTAGE, MAINTENANCE
        description NVARCHAR(500) NULL,
        last_updated DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END

-- 17. FEEDBACK & RATINGS
IF OBJECT_ID('support_feedback', 'U') IS NULL
BEGIN
    CREATE TABLE support_feedback (
        id NVARCHAR(36) PRIMARY KEY,
        ticket_id NVARCHAR(36) NOT NULL UNIQUE,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comments NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (ticket_id) REFERENCES support_tickets_v2(id) ON DELETE CASCADE
    );
END

IF OBJECT_ID('support_ratings', 'U') IS NULL
BEGIN
    CREATE TABLE support_ratings (
        id NVARCHAR(36) PRIMARY KEY,
        agent_id NVARCHAR(36) NOT NULL,
        ticket_id NVARCHAR(36) NOT NULL UNIQUE,
        score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
        comments NVARCHAR(MAX) NULL,
        rated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (agent_id) REFERENCES support_agents(id) ON DELETE CASCADE,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets_v2(id) ON DELETE NO ACTION
    );
END

-- 18. OWNER SUPPORT REQUESTS
IF OBJECT_ID('owner_support_requests', 'U') IS NULL
BEGIN
    CREATE TABLE owner_support_requests (
        id NVARCHAR(36) PRIMARY KEY,
        owner_id NVARCHAR(36) NOT NULL,
        request_type NVARCHAR(50) NOT NULL, -- LISTING, PAYOUT, COMMISSION, DELIVERY, INSURANCE, TAX, REVENUE, PERFORMANCE
        subject NVARCHAR(300) NOT NULL,
        details NVARCHAR(MAX) NOT NULL,
        status NVARCHAR(30) NOT NULL DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );
END

-- 19. AI CONVERSATION CONTEXT
IF OBJECT_ID('ai_conversation_context', 'U') IS NULL
BEGIN
    CREATE TABLE ai_conversation_context (
        id NVARCHAR(36) PRIMARY KEY,
        session_id NVARCHAR(36) NOT NULL,
        current_page NVARCHAR(500) NULL,
        active_vehicle_id NVARCHAR(36) NULL,
        active_booking_id NVARCHAR(36) NULL,
        resolved_metadata NVARCHAR(MAX) NULL,
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE
    );
END

-- 20. AI USER PREFERENCES
IF OBJECT_ID('ai_user_preferences', 'U') IS NULL
BEGIN
    CREATE TABLE ai_user_preferences (
        user_id NVARCHAR(36) PRIMARY KEY,
        preferred_language NVARCHAR(10) NOT NULL DEFAULT 'en',
        voice_enabled BIT NOT NULL DEFAULT 0,
        preferred_vehicle_type NVARCHAR(20) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END

-- 21. AI SEARCH HISTORY
IF OBJECT_ID('ai_search_history', 'U') IS NULL
BEGIN
    CREATE TABLE ai_search_history (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NOT NULL,
        query NVARCHAR(500) NOT NULL,
        searched_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END

-- 22. AI RECOMMENDATIONS LOGS
IF OBJECT_ID('ai_recommendations', 'U') IS NULL
BEGIN
    CREATE TABLE ai_recommendations (
        id NVARCHAR(36) PRIMARY KEY,
        user_id NVARCHAR(36) NULL,
        vehicle_id NVARCHAR(36) NOT NULL,
        recommendation_score DECIMAL(3,2) NOT NULL DEFAULT 1.00,
        recommended_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
END

-- 23. AI CHAT FEEDBACK
IF OBJECT_ID('ai_feedback', 'U') IS NULL
BEGIN
    CREATE TABLE ai_feedback (
        id NVARCHAR(36) PRIMARY KEY,
        session_id NVARCHAR(36) NOT NULL,
        message_id NVARCHAR(36) NOT NULL,
        is_positive BIT NOT NULL,
        feedback_text NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE
    );
END


