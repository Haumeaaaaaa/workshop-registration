const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'rootpassword',
    database: process.env.DB_NAME || 'workshop_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Healthcheck endpoint (required for Docker and Jenkins)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Get all registrations
app.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM registrations');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit a new registration
app.post('/', async (req, res) => {
    const { workshop_id, name, email } = req.body;
    
    try {
        // 1. Seat Capacity Check
        const [workshops] = await pool.query('SELECT capacity FROM workshops WHERE id = ?', [workshop_id]);
        if (workshops.length === 0) return res.status(404).json({ error: 'Workshop not found' });
        const capacity = workshops[0].capacity;

        const [regs] = await pool.query('SELECT COUNT(*) as count FROM registrations WHERE workshop_id = ?', [workshop_id]);
        if (regs[0].count >= capacity) {
            return res.status(400).json({ error: 'Workshop is at full capacity' });
        }

        // 2. Duplicate Email Check
        const [existing] = await pool.query('SELECT * FROM registrations WHERE email = ? AND workshop_id = ?', [email, workshop_id]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already registered for this workshop' });
        }

        // 3. Insert Registration
        await pool.query('INSERT INTO registrations (workshop_id, name, email) VALUES (?, ?, ?)', [workshop_id, name, email]);
        res.status(201).json({ message: 'Registration successful' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Registrations API running on port ${PORT}`);
});