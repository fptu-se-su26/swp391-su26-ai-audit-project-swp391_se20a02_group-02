SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
USE car_rental_platform;

-- Insert conversation if it does not exist
IF NOT EXISTS (SELECT 1 FROM conversations WHERE id = 'conv-cust-owner-001')
BEGIN
    INSERT INTO conversations (id, created_at, last_activity, vehicle_id)
    VALUES ('conv-cust-owner-001', '2026-07-12 10:00:00', '2026-07-13 00:05:00', '034641b6-ba72-45d2-aea1-92e6b265344a');
END;

-- Insert conversation participants
IF NOT EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = 'conv-cust-owner-001' AND user_id = 'customer-user-id-002')
BEGIN
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES ('conv-cust-owner-001', 'customer-user-id-002');
END;

IF NOT EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = 'conv-cust-owner-001' AND user_id = 'owner-user-id-003')
BEGIN
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES ('conv-cust-owner-001', 'owner-user-id-003');
END;

-- Insert messages
IF NOT EXISTS (SELECT 1 FROM messages WHERE id = 'msg-chat-001')
BEGIN
    INSERT INTO messages (id, content, conversation_id, created_at, is_read, receiver_id, sender_id, type)
    VALUES ('msg-chat-001', N'Xin chào anh, tôi muốn thuê xe Toyota Vios vào ngày mai.', 'conv-cust-owner-001', '2026-07-12 10:02:00', 1, 'owner-user-id-003', 'customer-user-id-002', 'text');
END;

IF NOT EXISTS (SELECT 1 FROM messages WHERE id = 'msg-chat-002')
BEGIN
    INSERT INTO messages (id, content, conversation_id, created_at, is_read, receiver_id, sender_id, type)
    VALUES ('msg-chat-002', N'Chào bạn, xe vẫn sẵn sàng nhé. Bạn cứ đặt trên hệ thống đi.', 'conv-cust-owner-001', '2026-07-12 10:05:00', 1, 'customer-user-id-002', 'owner-user-id-003', 'text');
END;

IF NOT EXISTS (SELECT 1 FROM messages WHERE id = 'msg-chat-003')
BEGIN
    INSERT INTO messages (id, content, conversation_id, created_at, is_read, receiver_id, sender_id, type)
    VALUES ('msg-chat-003', N'Vâng tôi đã làm thủ tục đặt rồi ạ. Anh duyệt giúp tôi nhé.', 'conv-cust-owner-001', '2026-07-13 00:05:00', 0, 'owner-user-id-003', 'customer-user-id-002', 'text');
END;
