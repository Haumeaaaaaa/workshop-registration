CREATE TABLE IF NOT EXISTS workshops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  capacity INT NOT NULL
);

CREATE TABLE IF NOT EXISTS registrations (
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
  ('Scam Shield: Phishing and E-Wallet Fraud Defense', 70), 
  ('Ethical Hacking 101: Capture the Flag', 50), 
  ('Data Privacy Act in Practice (RA 10173)', 60), 
  ('Building with AI Responsibly', 80), 
  ('Spot the Fake: Deepfakes and Disinformation', 70), 
  ('Future-Proof Your IT Career in Clark', 80), 
  ('DevOps and CI/CD for Beginners', 50), 
  ('Tech for Disaster Resilience', 60), 
  ('Green IT: Sustainable Computing', 50), 
  ('Digital Safety for Kids and Seniors', 40);