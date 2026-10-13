CREATE TABLE workshops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    capacity INT NOT NULL
);

CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workshop_id INT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    UNIQUE KEY unique_registration (workshop_id, email),
    FOREIGN KEY (workshop_id) REFERENCES workshops(id)
);

INSERT INTO workshops (title, capacity) VALUES 
('React State Management', 10), 
('Docker CI/CD Pipelines', 5);