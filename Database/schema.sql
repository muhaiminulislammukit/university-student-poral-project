-- =====================================================================
-- CSC 114 STUDENT PORTAL - PRODUCTION MYSQL DATABASE SCHEMA
-- Batch Management & Academic Information System
-- Compatible with MySQL 8.0+ / MariaDB 10.4+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `csc114_portal` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `csc114_portal`;

-- ---------------------------------------------------------------------
-- 1. Table: users (Authentication & RBAC)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
  `name` VARCHAR(100) NOT NULL,
  `studentId` VARCHAR(50) DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `department` VARCHAR(100) DEFAULT 'CSE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Users
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `name`, `studentId`, `department`) VALUES
('USR-001', 'admin', 'admin@csc114.edu', '$2b$10$wN3t4eR9sT0SampleHashAdmin', 'admin', 'Prof. Dr. M. Rahman', NULL, 'Computer Science & Engineering'),
('USR-002', 'ahmed', 'ahmed@csc114.edu', '$2b$10$wN3t4eR9sT0SampleHashTeacher', 'teacher', 'Dr. Ahmed Hossain', NULL, 'CSE'),
('USR-003', 'CSC114-001', 'rahim@example.com', '$2b$10$wN3t4eR9sT0SampleHashStudent1', 'student', 'Rahim Ahmed', 'CSC114-001', 'CSE'),
('USR-004', 'CSC114-002', 'nusrat@example.com', '$2b$10$wN3t4eR9sT0SampleHashStudent2', 'student', 'Nusrat Jahan', 'CSC114-002', 'CSE');

-- ---------------------------------------------------------------------
-- 2. Table: students (Student Academic & Personal Profiles)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(30) DEFAULT NULL,
  `section` VARCHAR(10) NOT NULL DEFAULT 'A',
  `batch` VARCHAR(30) DEFAULT '56th Batch',
  `bloodGroup` VARCHAR(10) DEFAULT 'A+',
  `address` TEXT DEFAULT NULL,
  `guardianPhone` VARCHAR(30) DEFAULT NULL,
  `attendance` DECIMAL(5,2) DEFAULT 0.00,
  `cgpa` DECIMAL(4,2) DEFAULT 0.00,
  `status` ENUM('Active', 'Warning', 'Probation', 'Graduated') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Students
INSERT INTO `students` (`id`, `name`, `email`, `phone`, `section`, `batch`, `bloodGroup`, `address`, `guardianPhone`, `attendance`, `cgpa`, `status`) VALUES
('CSC114-001', 'Rahim Ahmed', 'rahim@example.com', '+880 1711-000001', 'A', '56th Batch', 'A+', 'Dhanmondi, Dhaka', '+880 1819-111111', 92.00, 3.78, 'Active'),
('CSC114-002', 'Nusrat Jahan', 'nusrat@example.com', '+880 1711-000002', 'A', '56th Batch', 'O+', 'Uttara, Dhaka', '+880 1819-222222', 88.00, 3.85, 'Active'),
('CSC114-003', 'Sakib Hasan', 'sakib@example.com', '+880 1711-000003', 'B', '56th Batch', 'B+', 'Mirpur-10, Dhaka', '+880 1819-333333', 81.00, 3.42, 'Active'),
('CSC114-004', 'Tanvir Islam', 'tanvir@example.com', '+880 1711-000004', 'B', '56th Batch', 'AB+', 'Mohammadpur, Dhaka', '+880 1819-444444', 74.00, 3.15, 'Warning'),
('CSC114-005', 'Farzana Akter', 'farzana@example.com', '+880 1711-000005', 'A', '56th Batch', 'O-', 'Bashundhara R/A, Dhaka', '+880 1819-555555', 95.00, 3.92, 'Active'),
('CSC114-006', 'Mahmudur Rahman', 'mahmud@example.com', '+880 1711-000006', 'B', '56th Batch', 'A-', 'Badda, Dhaka', '+880 1819-666666', 68.00, 2.89, 'Warning');

-- ---------------------------------------------------------------------
-- 3. Table: courses (Course Curriculum)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `code` VARCHAR(30) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `teacher` VARCHAR(100) NOT NULL,
  `credit` INT NOT NULL DEFAULT 3,
  `department` VARCHAR(50) DEFAULT 'CSE',
  `room` VARCHAR(50) DEFAULT NULL,
  `semester` VARCHAR(50) DEFAULT '3rd Semester',
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Courses
INSERT INTO `courses` (`code`, `name`, `teacher`, `credit`, `department`, `room`, `semester`, `description`) VALUES
('CSC 114', 'Data Structures & Algorithms', 'Dr. Ahmed Hossain', 3, 'CSE', 'Room 301 / Lab 3', '3rd Semester', 'Arrays, Linked Lists, Stacks, Queues, Binary Trees, Graphs, Sorting algorithms.'),
('CSC 115', 'Database Management Systems', 'Prof. Karim Ullah', 3, 'CSE', 'Lab 2 (Server Room)', '3rd Semester', 'Relational Algebra, SQL, Normalization (1NF-BCNF), ACID Transactions, Indexing.'),
('MAT 111', 'Discrete Mathematics', 'Dr. Rahman Khan', 3, 'Mathematics', 'Room 204', '3rd Semester', 'Propositional Logic, Set Theory, Combinatorics, Graph Theory, and Recurrence Relations.'),
('ENG 101', 'Technical Communication', 'Ms. Sadia Jahan', 2, 'English', 'Room 105', '3rd Semester', 'Technical writing, research report drafting, academic presentations.'),
('EEE 103', 'Electrical Circuits & Electronics', 'Engr. Mostafa Kamal', 3, 'EEE', 'Hardware Lab 1', '3rd Semester', 'Ohm\'s Law, Kirchhoff\'s Laws, Thevenin Theorem, Diodes, Transistors, Op-Amps.');

-- ---------------------------------------------------------------------
-- 4. Table: attendance (Class-wise attendance logs)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `date` DATE NOT NULL,
  `course` VARCHAR(30) NOT NULL,
  `section` VARCHAR(10) NOT NULL,
  `takenBy` VARCHAR(100) DEFAULT NULL,
  `records_json` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course`) REFERENCES `courses`(`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 5. Table: results (Examinations & Marks)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `results`;
CREATE TABLE `results` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `studentId` VARCHAR(50) NOT NULL,
  `course` VARCHAR(30) NOT NULL,
  `mid` DECIMAL(5,2) DEFAULT 0.00,
  `final` DECIMAL(5,2) DEFAULT 0.00,
  `quiz` DECIMAL(5,2) DEFAULT 0.00,
  `total` DECIMAL(5,2) DEFAULT 0.00,
  `grade` VARCHAR(5) NOT NULL,
  `gpa` DECIMAL(3,2) NOT NULL,
  `semester` VARCHAR(50) DEFAULT 'Fall 2026',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course`) REFERENCES `courses`(`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Results
INSERT INTO `results` (`id`, `studentId`, `course`, `mid`, `final`, `quiz`, `total`, `grade`, `gpa`, `semester`) VALUES
('RES-001', 'CSC114-001', 'CSC 114', 28.00, 48.00, 18.00, 94.00, 'A+', 4.00, 'Fall 2026'),
('RES-002', 'CSC114-001', 'CSC 115', 26.00, 44.00, 17.00, 87.00, 'A', 3.75, 'Fall 2026'),
('RES-003', 'CSC114-001', 'MAT 111', 24.00, 43.00, 16.00, 83.00, 'A-', 3.50, 'Fall 2026'),
('RES-004', 'CSC114-002', 'CSC 114', 29.00, 49.00, 19.00, 97.00, 'A+', 4.00, 'Fall 2026'),
('RES-005', 'CSC114-002', 'CSC 115', 27.00, 46.00, 18.00, 91.00, 'A+', 4.00, 'Fall 2026');

-- ---------------------------------------------------------------------
-- 6. Table: assignments (Assignments & Submissions)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `course` VARCHAR(30) NOT NULL,
  `deadline` DATE NOT NULL,
  `totalMarks` INT DEFAULT 20,
  `status` ENUM('Active', 'Closed') DEFAULT 'Active',
  `description` TEXT DEFAULT NULL,
  `submissions_json` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course`) REFERENCES `courses`(`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Assignments
INSERT INTO `assignments` (`id`, `title`, `course`, `deadline`, `totalMarks`, `status`, `description`) VALUES
('ASN-001', 'Binary Search Tree & AVL Balancing Implementation', 'CSC 114', '2026-10-06', 20, 'Active', 'Implement AVL Tree rotation in C++ or Java with unit test benchmarks.'),
('ASN-002', 'Normalization to 3NF & BCNF Case Study', 'CSC 115', '2026-10-10', 15, 'Active', 'Analyze hospital management relational schema and perform BCNF decomposition.'),
('ASN-003', 'Recurrence Relation Solution by Master Theorem', 'MAT 111', '2026-10-14', 10, 'Active', 'Solve set of divide and conquer recurrences.');

-- ---------------------------------------------------------------------
-- 7. Table: routine (Class Routine / Timetable)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `routine`;
CREATE TABLE `routine` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `day` ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  `time` VARCHAR(50) NOT NULL,
  `course` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `teacher` VARCHAR(100) NOT NULL,
  `room` VARCHAR(50) NOT NULL,
  `type` ENUM('Lecture', 'Lab', 'Tutorial') DEFAULT 'Lecture',
  FOREIGN KEY (`course`) REFERENCES `courses`(`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Routine
INSERT INTO `routine` (`id`, `day`, `time`, `course`, `name`, `teacher`, `room`, `type`) VALUES
('RTN-001', 'Sunday', '09:00 AM - 10:30 AM', 'CSC 114', 'Data Structures & Algorithms', 'Dr. Ahmed Hossain', 'Room 301', 'Lecture'),
('RTN-002', 'Sunday', '10:45 AM - 12:15 PM', 'MAT 111', 'Discrete Mathematics', 'Dr. Rahman Khan', 'Room 204', 'Lecture'),
('RTN-003', 'Monday', '10:00 AM - 01:00 PM', 'CSC 114', 'Data Structures Lab', 'Dr. Ahmed Hossain', 'Software Lab 3', 'Lab'),
('RTN-004', 'Tuesday', '09:00 AM - 10:30 AM', 'CSC 115', 'Database Systems', 'Prof. Karim Ullah', 'Room 302', 'Lecture'),
('RTN-005', 'Tuesday', '11:00 AM - 12:30 PM', 'ENG 101', 'Technical Communication', 'Ms. Sadia Jahan', 'Room 105', 'Lecture'),
('RTN-006', 'Wednesday', '09:00 AM - 12:00 PM', 'CSC 115', 'Database Systems Lab', 'Prof. Karim Ullah', 'Lab 2 (Server Room)', 'Lab'),
('RTN-007', 'Thursday', '10:00 AM - 11:30 AM', 'EEE 103', 'Electrical Circuits', 'Engr. Mostafa Kamal', 'Hardware Lab 1', 'Lecture');

-- ---------------------------------------------------------------------
-- 8. Table: notices (Notice Board Announcements)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `notices`;
CREATE TABLE `notices` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` ENUM('Academic', 'Exam', 'Notice', 'Urgent', 'Event') DEFAULT 'Academic',
  `author` VARCHAR(100) NOT NULL,
  `date` VARCHAR(30) NOT NULL,
  `isPinned` TINYINT(1) DEFAULT 0,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Notices
INSERT INTO `notices` (`id`, `title`, `category`, `author`, `date`, `isPinned`, `message`) VALUES
('NTC-001', 'CSC 114 Midterm Examination Schedule & Syllabus', 'Exam', 'Dr. Ahmed Hossain', '30 Sep 2026', 1, 'The Midterm exam for CSC 114 will cover Chapters 1 through 5. Exam in Hall A.'),
('NTC-002', 'Lab 3 High-Performance Server Upgrade Complete', 'Academic', 'System Administrator', '29 Sep 2026', 0, 'Software Lab 3 is now equipped with upgraded 32GB RAM workstations.'),
('NTC-003', 'Inter-University Hackathon 2026 Batch Nominations', 'Event', 'CSE Club Advisor', '27 Sep 2026', 1, 'Students with CGPA >= 3.50 eligible to represent the batch.'),
('NTC-004', 'Notice regarding 75% Attendance Requirement', 'Urgent', 'Head of Dept', '25 Sep 2026', 0, 'Students having attendance below 75% will be strictly debarred from sitting for finals.');
