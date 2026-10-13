// registrations-api/schema.js
const crypto = require('crypto');
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // no I, L, O, U

function makeRef() {
  const b = crypto.randomBytes(6);
  let s = '';
  for (const x of b) s += ALPHABET[x % 32];
  return `WS-${s.slice(0, 3)}-${s.slice(3)}`;   // e.g. WS-7K2-9QD
}

async function ensureSchema(pool) {
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations'`);
  const have = new Set(cols.map(c => c.COLUMN_NAME));

  if (!have.has('created_at')) {
    await pool.query(`ALTER TABLE registrations
      ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
  }
  if (!have.has('ref_id')) {
    await pool.query(`ALTER TABLE registrations ADD COLUMN ref_id VARCHAR(16) NULL`);
    const [rows] = await pool.query(`SELECT id FROM registrations WHERE ref_id IS NULL`);
    for (const r of rows) {
      await pool.query(`UPDATE registrations SET ref_id = ? WHERE id = ?`, [makeRef(), r.id]);
    }
    await pool.query(`ALTER TABLE registrations
      MODIFY ref_id VARCHAR(16) NOT NULL, ADD UNIQUE KEY uq_ref_id (ref_id)`);
  }
}

module.exports = { makeRef, ensureSchema };