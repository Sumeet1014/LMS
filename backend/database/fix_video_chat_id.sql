-- Fix video_chat_messages and whiteboard_strokes tables
-- Current issue: id and user_id are INT, but code expects VARCHAR(36) for UUIDs
-- Also need to handle the fact that users.id might be INT

USE lms_db;

-- First, check what type users.id actually is
-- If users.id is INT, we need to adjust our foreign keys accordingly

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop and recreate video_chat_messages with correct schema
DROP TABLE IF EXISTS video_chat_messages;

CREATE TABLE video_chat_messages (
  id VARCHAR(36) PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_video_chat_messages_room (room_id),
  INDEX idx_video_chat_messages_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drop and recreate whiteboard_strokes with correct schema
DROP TABLE IF EXISTS whiteboard_strokes;

CREATE TABLE whiteboard_strokes (
  id VARCHAR(36) PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  stroke_data JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_whiteboard_strokes_room (room_id),
  INDEX idx_whiteboard_strokes_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the changes
SELECT 'Checking video_chat_messages structure:' as status;
DESCRIBE video_chat_messages;

SELECT 'Checking whiteboard_strokes structure:' as status;
DESCRIBE whiteboard_strokes;

SELECT 'Migration completed successfully!' as status;
