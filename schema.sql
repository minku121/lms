-- Drop tables if they exist to ensure clean setup
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS admins;

-- Admins table
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Books table
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  stock INT DEFAULT 0,
  available INT DEFAULT 0,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  reg_no VARCHAR(50) UNIQUE NOT NULL,
  roll_no VARCHAR(50) UNIQUE NOT NULL,
  branch VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Issues table (track books issued to students)
CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  student_id INT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status ENUM('issued', 'returned') DEFAULT 'issued',
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);


INSERT INTO admins (email, password_hash) VALUES
('minku@mail.in', '$2a$12$IB44dFDc5Foq/CF1AhiFcuPwX.bTLSNRboPPw54Rnetp6WUwg15sy');

