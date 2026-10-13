CREATE TABLE workshops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    capacity INT NOT NULL
);

CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workshop_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    ref_id VARCHAR(16) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_registration (workshop_id, email),
    UNIQUE KEY uq_ref_id (ref_id),
    FOREIGN KEY (workshop_id) REFERENCES workshops(id)
);

INSERT INTO workshops (title, capacity) VALUES 
('React State Management', 10), 
('Docker CI/CD Pipelines', 5);