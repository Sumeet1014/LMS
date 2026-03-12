 

-- Users table (basic authentication and user info)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- Added for JWT authentication
  role ENUM('student', 'mentor', 'admin') DEFAULT 'student',
  google_refresh_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User profiles (extended user information)
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  username VARCHAR(100),
  bio TEXT,
  college_email VARCHAR(255),
  contribution_score INT DEFAULT 0,
  credits INT DEFAULT 0,
  google_connected_at DATETIME,
  google_refresh_token TEXT,
  is_mentor BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  subject_ids JSON,
  subjects JSON,
  total_sessions_attended INT DEFAULT 0,
  total_sessions_taught INT DEFAULT 0,
  availability JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_id (user_id)
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Session requests (main session scheduling)
CREATE TABLE IF NOT EXISTS session_requests (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  mentor_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id VARCHAR(36),
  requested_time DATETIME NOT NULL,
  duration INT, -- in minutes
  status ENUM('pending', 'approved', 'rejected', 'completed', 'ongoing') DEFAULT 'pending',
  rejection_reason TEXT,
  responded_at DATETIME,
  approval_email_sent BOOLEAN DEFAULT FALSE,
  reminder_5min_sent BOOLEAN DEFAULT FALSE,
  video_room_id VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_id) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Session messages (chat within sessions)
CREATE TABLE IF NOT EXISTS session_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES session_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI chat history
CREATE TABLE IF NOT EXISTS ai_chats (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id VARCHAR(36),
  user_id VARCHAR(36) NOT NULL,
  user_message TEXT NOT NULL,
  assistant_reply TEXT NOT NULL,
  source VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES session_requests(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Learning challenges
CREATE TABLE IF NOT EXISTS challenges (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  target_metric VARCHAR(100),
  target_value INT,
  points_reward INT,
  start_date DATETIME,
  end_date DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User challenge progress
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  challenge_id VARCHAR(36),
  current_value INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_challenge (user_id, challenge_id)
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  challenge_id VARCHAR(36),
  question_text TEXT NOT NULL,
  marks INT NOT NULL DEFAULT 1,
  question_order INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- Quiz options
CREATE TABLE IF NOT EXISTS quiz_options (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  question_id VARCHAR(36),
  option_text VARCHAR(500) NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  option_order INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  challenge_id VARCHAR(36),
  answers JSON,
  score INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- Learning resources
CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  ai_summary TEXT,
  subject_id VARCHAR(36),
  uploaded_by VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Shared resources in sessions
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES session_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES users(id)
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  badge_id VARCHAR(36),
  challenge_id VARCHAR(36),
  score INT,
  pdf_url VARCHAR(500),
  share_token VARCHAR(100) UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES challenges(id) ON DELETE SET NULL,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE SET NULL
);

-- Session feedback
CREATE TABLE IF NOT EXISTS session_feedback (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id VARCHAR(36) NOT NULL,
  mentor_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  rating INT NOT NULL,
  feedback_text TEXT,
  toxicity_score DECIMAL(5, 4),
  toxicity_categories JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES session_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_session_feedback (session_id, student_id)
);

-- Video chat messages (real-time chat)
CREATE TABLE IF NOT EXISTS video_chat_messages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Whiteboard strokes (real-time collaboration)
CREATE TABLE IF NOT EXISTS whiteboard_strokes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  stroke_data JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_session_requests_mentor ON session_requests(mentor_id);
CREATE INDEX idx_session_requests_student ON session_requests(student_id);
CREATE INDEX idx_session_requests_status ON session_requests(status);
CREATE INDEX idx_session_messages_session ON session_messages(session_id);
CREATE INDEX idx_ai_chats_user ON ai_chats(user_id);
CREATE INDEX idx_ai_chats_session ON ai_chats(session_id);
CREATE INDEX idx_user_challenge_progress_user ON user_challenge_progress(user_id);
CREATE INDEX idx_quiz_questions_challenge ON quiz_questions(challenge_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_shared_resources_session ON shared_resources(session_id);
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_share_token ON certificates(share_token);
CREATE INDEX idx_session_feedback_mentor ON session_feedback(mentor_id);
CREATE INDEX idx_session_feedback_session ON session_feedback(session_id);
CREATE INDEX idx_video_chat_messages_room ON video_chat_messages(room_id);
CREATE INDEX idx_whiteboard_strokes_room ON whiteboard_strokes(room_id);

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
