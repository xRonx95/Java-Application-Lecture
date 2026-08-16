CREATE DATABASE IF NOT EXISTS school_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE school_db;

CREATE TABLE IF NOT EXISTS students (
    student_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    course VARCHAR(80) NOT NULL,
    year_level TINYINT UNSIGNED NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_students_year_level CHECK (year_level BETWEEN 1 AND 5)
);

INSERT INTO students (full_name, course, year_level, email)
VALUES
    ('Ana Reyes', 'BS Information Technology', 2, 'ana.reyes@example.edu'),
    ('Marco Santos', 'BS Computer Science', 3, 'marco.santos@example.edu')
ON DUPLICATE KEY UPDATE email = VALUES(email);

SELECT student_id, full_name, course, year_level, email
FROM students
ORDER BY student_id;
