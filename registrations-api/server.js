const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { makeRef, ensureSchema } = require('./schema');
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

// Admin guard: fails closed if ADMIN_TOKEN isn't set
const adminOnly = (req, res, next) => {
    const expected = process.env.ADMIN_TOKEN;
    if (expected && req.get('x-admin-token') === expected) return next();
    res.status(401).json({ error: 'Unauthorized' });
};

// Healthcheck endpoint (required for Docker and Jenkins)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Dashboard numbers (admin) - must be registered before '/:ref'
app.get('/stats', adminOnly, async (req, res) => {
    try {
        const [[t]] = await pool.query('SELECT COUNT(*) AS total FROM registrations');
        const [[d]] = await pool.query(
            'SELECT COUNT(*) AS today FROM registrations WHERE created_at >= CURDATE()');
        const [per] = await pool.query(
            `SELECT w.id, w.title, w.capacity, COUNT(r.id) AS taken
             FROM workshops w LEFT JOIN registrations r ON r.workshop_id = w.id
             GROUP BY w.id, w.title, w.capacity`);
        res.json({ total: t.total, today: d.today, per_workshop: per });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List registrations with search, workshop filter, paging (admin)
app.get('/', adminOnly, async (req, res) => {
    try {
        const { q = '', workshop_id } = req.query;
        const limit = Math.min(parseInt(req.query.limit) || 25, 100);
        const offset = parseInt(req.query.offset) || 0;

        const where = [], params = [];
        if (q) {
            where.push('(r.name LIKE ? OR r.email LIKE ? OR r.ref_id LIKE ?)');
            params.push(`%${q}%`, `%${q}%`, `%${q}%`);
        }
        if (workshop_id) { where.push('r.workshop_id = ?'); params.push(workshop_id); }

        const from = `FROM registrations r JOIN workshops w ON w.id = r.workshop_id
                      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`;
        const [rows] = await pool.query(
            `SELECT r.ref_id, r.name, r.email, r.created_at, w.title AS workshop ${from}
             ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]);
        const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${from}`, params);
        res.json({ total, rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Public lookup by reference ID (email masked)
app.get('/:ref', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT r.ref_id, r.name, r.email, r.created_at, w.title AS workshop
             FROM registrations r JOIN workshops w ON w.id = r.workshop_id
             WHERE r.ref_id = ?`, [req.params.ref.toUpperCase()]);
        if (rows.length === 0) return res.status(404).json({ error: 'Registration not found' });
        const r = rows[0];
        r.email = r.email.replace(/^(.).*(@.*)$/, '$1***$2');
        res.json(r);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel a registration (admin) - frees the seat
app.delete('/:ref', adminOnly, async (req, res) => {
    try {
        const [r] = await pool.query('DELETE FROM registrations WHERE ref_id = ?',
            [req.params.ref.toUpperCase()]);
        if (r.affectedRows) return res.status(204).end();
        res.status(404).json({ error: 'Registration not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit a new registration
app.post('/', async (req, res) => {
    const { workshop_id, name, email } = req.body;

    // 1. Check for bad names or emails
    if (!name || name.trim() === '' || !email || !email.includes('@')) {
        return res.status(400).json({ error: 'Please provide a valid name and email.' });
    }

    try {
        // 2. Seat Capacity Check
        const [workshops] = await pool.query('SELECT capacity FROM workshops WHERE id = ?', [workshop_id]);
        if (workshops.length === 0) return res.status(404).json({ error: 'Workshop not found' });
        const capacity = workshops[0].capacity;

        const [regs] = await pool.query('SELECT COUNT(*) as count FROM registrations WHERE workshop_id = ?', [workshop_id]);
        if (regs[0].count >= capacity) {
            return res.status(400).json({ error: 'Sorry, this workshop is full.' });
        }

        // 3. Duplicate Email Check
        const [existing] = await pool.query('SELECT * FROM registrations WHERE email = ? AND workshop_id = ?', [email, workshop_id]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'You are already registered for this workshop.' });
        }

        // 4. Insert Registration with a unique reference ID (retry on the rare collision)
        for (let i = 0; i < 5; i++) {
            const ref = makeRef();
            try {
                await pool.query(
                    'INSERT INTO registrations (ref_id, workshop_id, name, email) VALUES (?, ?, ?, ?)',
                    [ref, workshop_id, name.trim(), email.trim()]);
                return res.status(201).json({ message: 'Seat saved successfully!', ref_id: ref });
            } catch (e) {
                if (e.code === 'ER_DUP_ENTRY') {
                    if (/uq_ref_id/.test(e.sqlMessage)) continue;   // ref collision, try again
                    return res.status(400).json({ error: 'You are already registered for this workshop.' });
                }
                throw e;
            }
        }
        res.status(500).json({ error: 'Could not allocate a reference ID, please try again.' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3002;

// Run the schema migration (retrying until MySQL is ready), then start listening
async function start() {
    for (let attempt = 1; attempt <= 20; attempt++) {
        try {
            await ensureSchema(pool);
            break;
        } catch (err) {
            console.log(`DB not ready (attempt ${attempt}/20): ${err.message}`);
            if (attempt === 20) { console.error('Giving up'); process.exit(1); }
            await new Promise(r => setTimeout(r, 3000));
        }
    }
    app.listen(PORT, () => {
        console.log(`Registrations API running on port ${PORT}`);
    });
}
start();