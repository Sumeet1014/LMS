-- MySQL Schema for Peer Learning Platform
-- Converted from PostgreSQL to MySQL compatible syntax

-- Create database
CREATE DATABASE IF NOT EXISTS peer_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE peer_learning;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('student', 'mentor') DEFAULT 'student',
  google_refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  requester_id VARCHAR(36),
  mentor_id VARCHAR(36),
  subject VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  chosen_slot_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (chosen_slot_id) REFERENCES session_slots(id) ON DELETE SET NULL,
  INDEX idx_sessions_requester (requester_id),
  INDEX idx_sessions_mentor (mentor_id),
  INDEX idx_sessions_status (status),
  INDEX idx_sessions_subject (subject)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session slots table
CREATE TABLE IF NOT EXISTS session_slots (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id VARCHAR(36) NOT NULL,
  proposer_id VARCHAR(36),
  start_ts TIMESTAMP NOT NULL,
  end_ts TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (proposer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_session_slots_session (session_id),
  INDEX idx_session_slots_proposer (proposer_id),
  INDEX idx_session_slots_start (start_ts),
  INDEX idx_session_slots_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session events table
CREATE TABLE IF NOT EXISTS session_events (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id VARCHAR(36) NOT NULL,
  google_event_id VARCHAR(255),
  hangout_link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  INDEX idx_session_events_session (session_id),
  INDEX idx_session_events_google (google_event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session messages table
CREATE TABLE IF NOT EXISTS session_messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_session_messages_session (session_id),
  INDEX idx_session_messages_user (user_id),
  INDEX idx_session_messages_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Additional tables for extended functionality based on the backend schema

-- User profiles table (extended user information)
CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL UNIQUE,
  username VARCHAR(100),
  bio TEXT,
  college_email VARCHAR(255),
  contribution_score INT DEFAULT 0,
  credits INT DEFAULT 0,
  google_connected_at TIMESTAMP NULL,
  google_refresh_token TEXT,
  is_mentor TINYINT(1) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  subject_ids JSON,
  subjects JSON,
  total_sessions_attended INT DEFAULT 0,
  total_sessions_taught INT DEFAULT 0,
  availability JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_profiles_user (user_id),
  INDEX idx_user_profiles_mentor (is_mentor),
  INDEX idx_user_profiles_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subjects_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI chat history table
CREATE TABLE IF NOT EXISTS ai_chats (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id VARCHAR(36),
  user_id VARCHAR(36) NOT NULL,
  user_message TEXT NOT NULL,
  assistant_reply TEXT NOT NULL,
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ai_chats_user (user_id),
  INDEX idx_ai_chats_session (session_id),
  INDEX idx_ai_chats_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Learning challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  target_metric VARCHAR(100),
  target_value INT,
  points_reward INT,
  start_date TIMESTAMP NULL,
  end_date TIMESTAMP NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_challenges_subject (subject),
  INDEX idx_challenges_active (is_active),
  INDEX idx_challenges_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User challenge progress table
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  challenge_id VARCHAR(36),
  current_value INT DEFAULT 0,
  completed TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_challenge (user_id, challenge_id),
  INDEX idx_user_challenge_progress_user (user_id),
  INDEX idx_user_challenge_progress_challenge (challenge_id),
  INDEX idx_user_challenge_progress_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  challenge_id VARCHAR(36),
  question_text TEXT NOT NULL,
  marks INT NOT NULL DEFAULT 1,
  question_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  INDEX idx_quiz_questions_challenge (challenge_id),
  INDEX idx_quiz_questions_order (question_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz options table
CREATE TABLE IF NOT EXISTS quiz_options (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  question_id VARCHAR(36),
  option_text VARCHAR(500) NOT NULL,
  is_correct TINYINT(1) DEFAULT 0,
  option_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
  INDEX idx_quiz_options_question (question_id),
  INDEX idx_quiz_options_correct (is_correct)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  challenge_id VARCHAR(36),
  answers JSON,
  score INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  passed TINYINT(1) DEFAULT 0,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  INDEX idx_quiz_attempts_user (user_id),
  INDEX idx_quiz_attempts_challenge (challenge_id),
  INDEX idx_quiz_attempts_passed (passed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Learning resources table
CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  ai_summary TEXT,
  subject_id VARCHAR(36),
  uploaded_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_resources_subject (subject_id),
  INDEX idx_resources_uploader (uploaded_by),
  INDEX idx_resources_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shared resources table
CREATE TABLE IF NOT EXISTS shared_resources (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_url VARCHAR(500) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  mime_type VARCHAR(100),
  file_size INT,
  metadata JSON,
  session_id VARCHAR(36),
  shared_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_shared_resources_session (session_id),
  INDEX idx_shared_resources_shared_by (shared_by),
  INDEX idx_shared_resources_type (resource_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  badge_id VARCHAR(36),
  challenge_id VARCHAR(36),
  score INT,
  pdf_url VARCHAR(500),
  share_token VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES challenges(id) ON DELETE SET NULL,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE SET NULL,
  INDEX idx_certificates_user (user_id),
  INDEX idx_certificates_share_token (share_token),
  INDEX idx_certificates_challenge (challenge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session feedback table
CREATE TABLE IF NOT EXISTS session_feedback (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id VARCHAR(36) NOT NULL,
  mentor_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  rating INT NOT NULL,
  feedback_text TEXT,
  toxicity_score DECIMAL(5,4),
  toxicity_categories JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_session_feedback (session_id, student_id),
  INDEX idx_session_feedback_mentor (mentor_id),
  INDEX idx_session_feedback_session (session_id),
  INDEX idx_session_feedback_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Video chat messages table (real-time chat)
CREATE TABLE IF NOT EXISTS video_chat_messages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_video_chat_messages_room (room_id),
  INDEX idx_video_chat_messages_user (user_id),
  INDEX idx_video_chat_messages_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Whiteboard strokes table (real-time collaboration)
CREATE TABLE IF NOT EXISTS whiteboard_strokes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  stroke_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_whiteboard_strokes_room (room_id),
  INDEX idx_whiteboard_strokes_user (user_id),
  INDEX idx_whiteboard_strokes_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default subjects
INSERT IGNORE INTO subjects (id, name, description) VALUES
(UUID(), 'Mathematics', 'Math and algebra topics'),
(UUID(), 'Science', 'Physics, chemistry, and biology'),
(UUID(), 'Programming', 'Computer science and coding'),
(UUID(), 'Languages', 'Foreign languages and literature'),
(UUID(), 'History', 'Historical topics and events'),
(UUID(), 'Business', 'Business and economics'),
(UUID(), 'Arts', 'Visual and performing arts'),
(UUID(), 'Other', 'Miscellaneous subjects');

-- Create views for common queries

-- View for sessions with participant details
CREATE OR REPLACE VIEW session_details AS
SELECT 
  s.*,
  u1.name as requester_name,
  u1.email as requester_email,
  u2.name as mentor_name,
  u2.email as mentor_email,
  sub.name as subject_name
FROM sessions s
LEFT JOIN users u1 ON s.requester_id = u1.id
LEFT JOIN users u2 ON s.mentor_id = u2.id
LEFT JOIN subjects sub ON s.subject = sub.name;

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  up.is_mentor,
  up.rating,
  up.total_sessions_attended,
  up.total_sessions_taught,
  up.contribution_score,
  COUNT(DISTINCT sr.id) as total_sessions,
  COUNT(DISTINCT CASE WHEN sr.status = 'completed' THEN sr.id END) as completed_sessions
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN sessions sr ON (u.id = sr.requester_id OR u.id = sr.mentor_id)
GROUP BY u.id, u.name, u.email, u.role, up.is_mentor, up.rating, up.total_sessions_attended, up.total_sessions_taught, up.contribution_score;

-- Stored procedures for common operations

DELIMITER //

-- Procedure to update user session counts
CREATE PROCEDURE UpdateSessionCounts(IN user_id VARCHAR(36), IN is_mentor BOOLEAN)
BEGIN
  IF is_mentor THEN
    UPDATE user_profiles 
    SET total_sessions_taught = total_sessions_taught + 1 
    WHERE user_id = user_id;
  ELSE
    UPDATE user_profiles 
    SET total_sessions_attended = total_sessions_attended + 1 
    WHERE user_id = user_id;
  END IF;
END//

-- Procedure to calculate average rating for mentor
CREATE PROCEDURE UpdateMentorRating(IN mentor_id VARCHAR(36))
BEGIN
  DECLARE avg_rating DECIMAL(3,2) DEFAULT 0.00;
  
  SELECT AVG(rating) INTO avg_rating
  FROM session_feedback 
  WHERE mentor_id = mentor_id;
  
  UPDATE user_profiles 
  SET rating = IFNULL(avg_rating, 0.00) 
  WHERE user_id = mentor_id;
END//

DELIMITER ;

-- Triggers for automatic updates

DELIMITER //

-- Trigger to update timestamps
CREATE TRIGGER update_users_timestamp 
BEFORE UPDATE ON users 
FOR EACH ROW 
SET NEW.updated_at = CURRENT_TIMESTAMP//

CREATE TRIGGER update_sessions_timestamp 
BEFORE UPDATE ON sessions 
FOR EACH ROW 
SET NEW.updated_at = CURRENT_TIMESTAMP//

CREATE TRIGGER update_session_slots_timestamp 
BEFORE UPDATE ON session_slots 
FOR EACH ROW 
SET NEW.updated_at = CURRENT_TIMESTAMP//

CREATE TRIGGER update_session_events_timestamp 
BEFORE UPDATE ON session_events 
FOR EACH ROW 
SET NEW.updated_at = CURRENT_TIMESTAMP//

CREATE TRIGGER update_session_messages_timestamp 
BEFORE UPDATE ON session_messages 
FOR EACH ROW 
SET NEW.updated_at = CURRENT_TIMESTAMP//

DELIMITER ;

-- Final verification
SELECT 'Database schema created successfully!' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'peer_learning';
SELECT 'Peer Learning Platform - MySQL Schema Ready!' as message;
