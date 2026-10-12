const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'rootpassword',
    database: process.env.DB_NAME || 'workshop_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM workshops');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

app.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM workshops WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Workshop not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Workshops API running on port ${PORT}`);
});