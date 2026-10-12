CREATE DATABASE IF NOT EXISTS workshop_db;
USE workshop_db;

CREATE TABLE workshops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  capacity INT NOT NULL
);

CREATE TABLE registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workshop_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  FOREIGN KEY (workshop_id) REFERENCES workshops(id)
);

INSERT INTO workshops (title, description, capacity) VALUES 
('Docker 101', 'Learn the basics of containerization', 2),
('Jenkins Automation', 'Build your first CI/CD pipeline', 5),
('React Frontend', 'Build responsive web apps', 10);