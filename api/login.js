import mysql from 'mysql2/promise';
import crypto from 'crypto';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  ssl: { rejectUnauthorized: false }
};

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'srm_salt_2026').digest('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Identifiants manquants' });

  let db;
  try {
    db = await mysql.createConnection(dbConfig);
    const hashed = hashPassword(password);
    const [rows] = await db.execute(
      'SELECT id, username, role, nom FROM users WHERE username = ? AND password_hash = ?',
      [username, hashed]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Identifiants incorrects' });
    const user = rows[0];
    const token = Buffer.from(`${user.id}:${user.role}:${Date.now()}`).toString('base64');
    return res.json({ token, role: user.role, nom: user.nom, username: user.username });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur', details: err.message });
  } finally {
    if (db) await db.end();
  }
}