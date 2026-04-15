 

USE lms_db;

-- ─────────────────────────────────────────
-- COURSES table
-- Relationships from ER:
--   USER (mentor) Creates COURSE  → created_by FK
--   USER (student) Enrolls In COURSE → course_enrollments table
--   COURSE Has ASSIGNMENT
--   USER Checks COURSE (same as enrolls/views)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT NOT NULL COMMENT 'Duration in hours',
    created_by INT NOT NULL COMMENT 'Mentor/Admin who created the course',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_courses_created_by (created_by),
    INDEX idx_courses_domain (domain),
    INDEX idx_courses_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- COURSE_ENROLLMENTS table
-- Represents "Enrolls In" relationship (USER m ↔ n COURSE)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    INDEX idx_enrollment_user (user_id),
    INDEX idx_enrollment_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- ASSIGNMENTS table
-- Relationships from ER:
--   COURSE Has ASSIGNMENT (1 → n)
--   USER Submits ASSIGNMENT (m → n) → assignment_submissions table
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    total_marks INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_assignment_course (course_id),
    INDEX idx_assignment_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- ASSIGNMENT_SUBMISSIONS table
-- Represents "Submits" relationship (USER m ↔ n ASSIGNMENT)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    user_id INT NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_url VARCHAR(500),
    pages INT COMMENT 'Number of pages submitted',
    marks_obtained INT DEFAULT NULL COMMENT 'Marks given by mentor after review',
    status ENUM('submitted', 'reviewed', 'late') DEFAULT 'submitted',
    feedback TEXT,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_submission (assignment_id, user_id),
    INDEX idx_submission_assignment (assignment_id),
    INDEX idx_submission_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- Seed sample data for demo
-- ─────────────────────────────────────────

-- Sample courses (created_by = 1 assumes a mentor user exists with id=1)
INSERT IGNORE INTO courses (id, title, domain, description, duration, created_by) VALUES
(1, 'Data Structures & Algorithms', 'Computer Science', 'Learn arrays, linked lists, trees, graphs and sorting algorithms', 40, 1),
(2, 'Operating Systems', 'Computer Science', 'Process management, memory management and file systems', 35, 1),
(3, 'Database Management System', 'Computer Science', 'SQL, normalization, transactions and database design', 30, 1),
(4, 'Computer Networks', 'Computer Science', 'OSI model, TCP/IP, routing and network security', 30, 1),
(5, 'System Design', 'Computer Science', 'Scalable architecture, distributed systems and design patterns', 25, 1);

-- Sample assignments linked to courses
INSERT IGNORE INTO assignments (id, course_id, title, description, due_date, total_marks) VALUES
(1, 1, 'Array & Linked List Problems', 'Solve 10 problems on arrays and linked lists', DATE_ADD(NOW(), INTERVAL 7 DAY), 100),
(2, 1, 'Tree Traversal Assignment', 'Implement inorder, preorder and postorder traversal', DATE_ADD(NOW(), INTERVAL 14 DAY), 100),
(3, 2, 'Process Scheduling Report', 'Write a report comparing FCFS, SJF and Round Robin', DATE_ADD(NOW(), INTERVAL 7 DAY), 100),
(4, 3, 'SQL Query Assignment', 'Write complex SQL queries for given schema', DATE_ADD(NOW(), INTERVAL 10 DAY), 100),
(5, 4, 'Network Topology Design', 'Design a network topology for a college campus', DATE_ADD(NOW(), INTERVAL 12 DAY), 100);

SELECT 'courses, course_enrollments, assignments, assignment_submissions tables created successfully!' AS status;
