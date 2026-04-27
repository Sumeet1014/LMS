-- Quick Fix for Study Bot Issues
-- Run these commands if you don't want to re-run the full schema

USE lms_db;

-- 1. Create session_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS session_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES session_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_messages (session_id),
    INDEX idx_user_messages (user_id),
    INDEX idx_created_at (created_at)
);

-- 2. Check current ai_chats structure
-- DESCRIBE ai_chats;

-- 3. If ai_chats.id is INT, you need to recreate the table
-- First, backup existing data
CREATE TABLE ai_chats_backup AS SELECT * FROM ai_chats;

-- Drop the old table
DROP TABLE ai_chats;

-- Create new table with correct schema
CREATE TABLE ai_chats (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    session_id INT,
    user_message TEXT NOT NULL,
    assistant_reply TEXT NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES session_requests(id) ON DELETE SET NULL,
    INDEX idx_user_chat (user_id),
    INDEX idx_session_chat (session_id)
);

-- Restore data (if you had any)
-- INSERT INTO ai_chats (user_id, session_id, user_message, assistant_reply, source, created_at)
-- SELECT user_id, session_id, user_message, assistant_reply, source, created_at FROM ai_chats_backup;

-- Clean up backup
DROP TABLE ai_chats_backup;

-- Verify tables exist
SHOW TABLES LIKE 'session_messages';
SHOW TABLES LIKE 'ai_chats';

-- Verify ai_chats structure
DESCRIBE ai_chats;
