-- Java JFrame Practice IDE authentication database
CREATE DATABASE IF NOT EXISTS `student_system`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `student_system`;

CREATE TABLE IF NOT EXISTS `users` (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RegisterForm.java creates PBKDF2 password hashes.
-- Do not store plain-text passwords.
