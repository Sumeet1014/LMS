-- Learning Management System - MySQL Schema
-- Converted from PostgreSQL/Supabase

-- Create database
CREATE DATABASE IF NOT EXISTS lms_db;
USE lms_db;

-- Drop tables if they exist (for clean setup)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS ai_chats;
DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS quiz_options;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS user_challenge_progress;
DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS session_feedback;
DROP TABLE IF EXISTS video_chat_messages;
DROP TABLE IF EXISTS whiteboard_strokes;
DROP TABLE IF EXISTS shared_resources;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS session_requests;
DROP TABLE IF EXISTS challenges;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Users table (replaces Supabase auth.users)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    username VARCHAR(255),
    role ENUM('student', 'mentor', 'admin') DEFAULT 'student',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Subjects table
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table (extended user information)
CREATE TABLE profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    username VARCHAR(255),
    bio TEXT,
    college_email VARCHAR(255),
    is_mentor BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    credits INT DEFAULT 0,
    contribution_score INT DEFAULT 0,
    total_sessions_attended INT DEFAULT 0,
    total_sessions_taught INT DEFAULT 0,
    subjects JSON,
    subject_ids JSON,
    availability JSON,
    google_refresh_token VARCHAR(255),
    google_connected_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_mentor (is_mentor),
    INDEX idx_user_id (user_id)
);

-- Session requests table
CREATE TABLE session_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    mentor_id INT NOT NULL,
    subject_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requested_time TIMESTAMP NOT NULL,
    duration INT DEFAULT 60,
    status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
    rejection_reason TEXT,
    responded_at TIMESTAMP NULL,
    video_room_id VARCHAR(255),
    approval_email_sent BOOLEAN DEFAULT FALSE,
    reminder_5min_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    INDEX idx_student (student_id),
    INDEX idx_mentor (mentor_id),
    INDEX idx_status (status),
    INDEX idx_requested_time (requested_time)
);

-- Session feedback table
CREATE TABLE session_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    mentor_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    toxicity_score DECIMAL(5,4),
    toxicity_categories JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES session_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_mentor_feedback (mentor_id)
);

-- Video chat messages table
CREATE TABLE video_chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_room (room_id),
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
);

-- Whiteboard strokes table
CREATE TABLE whiteboard_strokes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    stroke_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_room (room_id)
);

-- Challenges/Quizzes table
CREATE TABLE challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    points_reward INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    target_metric VARCHAR(255),
    target_value INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz questions table
CREATE TABLE quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    question_text TEXT NOT NULL,
    marks INT DEFAULT 10,
    question_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    INDEX idx_challenge (challenge_id),
    INDEX idx_order (question_order)
);

-- Quiz options table
CREATE TABLE quiz_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    option_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
    INDEX idx_question (question_id)
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    score INT DEFAULT 0,
    total INT DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    answers JSON,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_challenge_attempt (challenge_id),
    INDEX idx_passed (passed)
);

-- User challenge progress table
CREATE TABLE user_challenge_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    current_value INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_challenge (user_id, challenge_id),
    INDEX idx_user_progress (user_id),
    INDEX idx_challenge_progress (challenge_id)
);

-- Certificates table
CREATE TABLE certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT,
    badge_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    score INT,
    pdf_url VARCHAR(500),
    share_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE SET NULL,
    INDEX idx_user_cert (user_id),
    INDEX idx_share_token (share_token)
);

-- Resources table
CREATE TABLE resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    ai_summary TEXT,
    subject_id INT,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subject (subject_id),
    INDEX idx_uploaded_by (uploaded_by)
);

-- Shared resources table (for session sharing)
CREATE TABLE shared_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    title VARCHAR(255) NOT NULL,
    resource_url VARCHAR(500) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    description TEXT,
    mime_type VARCHAR(100),
    file_size INT,
    metadata JSON,
    shared_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES session_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_resource (session_id)
);

-- AI Chats table
CREATE TABLE ai_chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
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

-- Insert seed data for subjects
INSERT INTO subjects (name, description) VALUES
('Data Structures & Algorithms', 'Core computer science concepts including arrays, linked lists, trees, graphs, and algorithms'),
('Operating Systems', 'Process management, memory management, file systems, and concurrency'),
('Database Management', 'SQL, database design, normalization, and transaction management'),
('Computer Networks', 'Network protocols, OSI model, TCP/IP, and network security'),
('System Design', 'Scalable architecture, distributed systems, and design patterns');

-- Insert seed data for challenges/quizzes
INSERT INTO challenges (id, title, subject, description, points_reward, is_active, start_date, end_date, target_value, target_metric) VALUES
(1, 'Data Structures & Algorithms', 'DSA', 'Test your knowledge of data structures and algorithms fundamentals', 50, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 365 DAY), 50, 'quiz_score'),
(2, 'Operating Systems', 'Operating Systems', 'Test your knowledge of operating system concepts', 50, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 365 DAY), 50, 'quiz_score'),
(3, 'Database Management', 'Databases', 'Test your knowledge of database concepts and SQL', 50, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 365 DAY), 50, 'quiz_score'),
(4, 'Computer Networks', 'Networks', 'Test your knowledge of networking fundamentals', 50, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 365 DAY), 50, 'quiz_score'),
(5, 'System Design', 'System Design', 'Test your knowledge of system design principles', 50, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 365 DAY), 50, 'quiz_score');

-- DSA Questions
INSERT INTO quiz_questions (id, challenge_id, question_text, marks, question_order) VALUES
(1, 1, 'Which data structure gives O(1) average time for insert, delete and search?', 10, 1),
(2, 1, 'Which traversal of a binary tree prints nodes in non-decreasing order if the tree is a BST?', 10, 2),
(3, 1, 'What is the time complexity of Merge Sort?', 10, 3),
(4, 1, 'What data structure is used to implement recursion?', 10, 4),
(5, 1, 'Which algorithm finds shortest path in a weighted graph with non-negative weights?', 10, 5);

-- DSA Options
INSERT INTO quiz_options (question_id, option_text, is_correct, option_order) VALUES
(1, 'Binary Search Tree', FALSE, 1),
(1, 'Hash Table', TRUE, 2),
(1, 'Linked List', FALSE, 3),
(1, 'Heap', FALSE, 4),
(2, 'Preorder', FALSE, 1),
(2, 'Inorder', TRUE, 2),
(2, 'Postorder', FALSE, 3),
(2, 'Level order', FALSE, 4),
(3, 'O(n)', FALSE, 1),
(3, 'O(n log n)', TRUE, 2),
(3, 'O(n^2)', FALSE, 3),
(3, 'O(log n)', FALSE, 4),
(4, 'Queue', FALSE, 1),
(4, 'Stack', TRUE, 2),
(4, 'Heap', FALSE, 3),
(4, 'Hash Table', FALSE, 4),
(5, 'Bellman-Ford', FALSE, 1),
(5, 'Dijkstra Algorithm', TRUE, 2),
(5, 'Floyd-Warshall', FALSE, 3),
(5, 'Prim Algorithm', FALSE, 4);

-- Operating Systems Questions
INSERT INTO quiz_questions (id, challenge_id, question_text, marks, question_order) VALUES
(6, 2, 'Which scheduling algorithm can cause starvation?', 10, 1),
(7, 2, 'Which mechanism provides mutual exclusion for threads?', 10, 2),
(8, 2, 'Which of these is a page replacement algorithm?', 10, 3),
(9, 2, 'What does TLB stand for in virtual memory?', 10, 4),
(10, 2, 'What is copy-on-write used for?', 10, 5);

-- Operating Systems Options
INSERT INTO quiz_options (question_id, option_text, is_correct, option_order) VALUES
(6, 'FCFS', FALSE, 1),
(6, 'Round Robin', FALSE, 2),
(6, 'Priority Scheduling', TRUE, 3),
(6, 'Shortest Job First', FALSE, 4),
(7, 'Semaphores', TRUE, 1),
(7, 'Virtual Memory', FALSE, 2),
(7, 'Page Tables', FALSE, 3),
(7, 'File Descriptors', FALSE, 4),
(8, 'LRU (Least Recently Used)', TRUE, 1),
(8, 'FIFO only for queues', FALSE, 2),
(8, 'Hashing', FALSE, 3),
(8, 'Dijkstra', FALSE, 4),
(9, 'Temporary Lookup Buffer', FALSE, 1),
(9, 'Translation Lookaside Buffer', TRUE, 2),
(9, 'Transfer Load Buffer', FALSE, 3),
(9, 'Table Look Buffer', FALSE, 4),
(10, 'Faster I/O', FALSE, 1),
(10, 'Saving memory when forking processes', TRUE, 2),
(10, 'Encrypting memory', FALSE, 3),
(10, 'Load balancing', FALSE, 4);

-- Database Questions
INSERT INTO quiz_questions (id, challenge_id, question_text, marks, question_order) VALUES
(11, 3, 'Which normal form eliminates transitive dependencies?', 10, 1),
(12, 3, 'Which SQL keyword removes duplicate rows from a result set?', 10, 2),
(13, 3, 'What does ACID stand for in DB transactions?', 10, 3),
(14, 3, 'Which index is best for range queries?', 10, 4),
(15, 3, 'Which is a document-oriented NoSQL database?', 10, 5);

-- Database Options
INSERT INTO quiz_options (question_id, option_text, is_correct, option_order) VALUES
(11, '1NF', FALSE, 1),
(11, '2NF', FALSE, 2),
(11, '3NF', TRUE, 3),
(11, 'BCNF', FALSE, 4),
(12, 'UNIQUE', FALSE, 1),
(12, 'DISTINCT', TRUE, 2),
(12, 'GROUP BY', FALSE, 3),
(12, 'HAVING', FALSE, 4),
(13, 'Atomicity, Consistency, Isolation, Durability', TRUE, 1),
(13, 'Atomic, Consistent, Indexed, Durable', FALSE, 2),
(13, 'Access, Consistency, Isolation, Data', FALSE, 3),
(13, 'Accurate, Consistent, Indexed, Durable', FALSE, 4),
(14, 'Hash Index', FALSE, 1),
(14, 'B-Tree Index', TRUE, 2),
(14, 'Full-Text Index', FALSE, 3),
(14, 'Bloom Filter', FALSE, 4),
(15, 'Redis', FALSE, 1),
(15, 'MongoDB', TRUE, 2),
(15, 'Cassandra', FALSE, 3),
(15, 'Neo4j', FALSE, 4);

-- Networks Questions
INSERT INTO quiz_questions (id, challenge_id, question_text, marks, question_order) VALUES
(16, 4, 'Which layer of OSI handles routing?', 10, 1),
(17, 4, 'TCP is ______ and UDP is ______', 10, 2),
(18, 4, 'What is the standard port for HTTPS?', 10, 3),
(19, 4, 'Which protocol resolves IP to MAC addresses?', 10, 4),
(20, 4, 'Which device forwards packets between networks based on IP addresses?', 10, 5);

-- Networks Options
INSERT INTO quiz_options (question_id, option_text, is_correct, option_order) VALUES
(16, 'Data Link', FALSE, 1),
(16, 'Network', TRUE, 2),
(16, 'Transport', FALSE, 3),
(16, 'Application', FALSE, 4),
(17, 'connectionless, connection-oriented', FALSE, 1),
(17, 'connection-oriented, connectionless', TRUE, 2),
(17, 'unreliable, reliable', FALSE, 3),
(17, 'faster, slower', FALSE, 4),
(18, '80', FALSE, 1),
(18, '21', FALSE, 2),
(18, '443', TRUE, 3),
(18, '25', FALSE, 4),
(19, 'DNS', FALSE, 1),
(19, 'ARP', TRUE, 2),
(19, 'ICMP', FALSE, 3),
(19, 'DHCP', FALSE, 4),
(20, 'Switch', FALSE, 1),
(20, 'Hub', FALSE, 2),
(20, 'Router', TRUE, 3),
(20, 'Repeater', FALSE, 4);

-- System Design Questions
INSERT INTO quiz_questions (id, challenge_id, question_text, marks, question_order) VALUES
(21, 5, 'To handle very high read traffic, which technique helps most?', 10, 1),
(22, 5, 'What is load balancing used for?', 10, 2),
(23, 5, 'Which DB type suits highly connected graph queries?', 10, 3),
(24, 5, 'What is CAP theorem? You can have at most two of:', 10, 4),
(25, 5, 'Which approach helps with scaling writes?', 10, 5);

-- System Design Options
INSERT INTO quiz_options (question_id, option_text, is_correct, option_order) VALUES
(21, 'Vertical scaling', FALSE, 1),
(21, 'Caching (e.g., Redis)', TRUE, 2),
(21, 'Removing indexes', FALSE, 3),
(21, 'Using large VARCHAR', FALSE, 4),
(22, 'Encrypting traffic', FALSE, 1),
(22, 'Distributing incoming traffic across servers', TRUE, 2),
(22, 'Speeding up database writes only', FALSE, 3),
(22, 'Deleting stale sessions', FALSE, 4),
(23, 'Relational DB', FALSE, 1),
(23, 'Columnar DB', FALSE, 2),
(23, 'Graph DB (e.g., Neo4j)', TRUE, 3),
(23, 'Key-Value store', FALSE, 4),
(24, 'Consistency, Availability, Partition tolerance', TRUE, 1),
(24, 'Caching, Availability, Performance', FALSE, 2),
(24, 'Centralization, Availability, Partitioning', FALSE, 3),
(24, 'Cost, Availability, Performance', FALSE, 4),
(25, 'Read replicas', FALSE, 1),
(25, 'Sharding', TRUE, 2),
(25, 'Client side caching', FALSE, 3),
(25, 'CDN only', FALSE, 4);
