import mysql from 'mysql2/promise';
import crypto from 'crypto';

// Config DB
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
};

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'srm_salt_2026').digest('hex');
}

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    const token = auth.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [userId, role] = decoded.split(':');
    return { userId, role };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url, method } = req;
  const path = url.split('?')[0];

  let db;
  try {
    db = await mysql.createConnection(dbConfig);

    // POST /api/login
    if (path === '/api/login' && method === 'POST') {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'Identifiants manquants' });
      const hashed = hashPassword(password);
      const [rows] = await db.execute(
        'SELECT id, username, role, nom FROM users WHERE username = ? AND password_hash = ?',
        [username, hashed]
      );
      if (rows.length === 0) return res.status(401).json({ error: 'Identifiants incorrects' });
      const user = rows[0];
      const token = Buffer.from(`${user.id}:${user.role}:${Date.now()}`).toString('base64');
      return res.json({ token, role: user.role, nom: user.nom, username: user.username });
    }

    // POST /api/submit
    if (path === '/api/submit' && method === 'POST') {
      const { nom, telephone, email, dateService, categorie, typeService,
        satisfaction, qualite, professionnalisme, delais, rapport, commentaire, suggestion } = req.body;
      await db.execute(
        `INSERT INTO satisfaction (nom, telephone, email, date_service, categorie, type_service, satisfaction, qualite, professionnalisme, delais, rapport, commentaire, suggestion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nom, telephone, email, dateService, categorie, typeService, satisfaction, qualite, professionnalisme, delais, rapport, commentaire, suggestion]
      );
      return res.status(200).json({ message: 'Évaluation enregistrée avec succès' });
    }

    // GET /api/admin/responses
    if (path === '/api/admin/responses' && method === 'GET') {
      const user = verifyToken(req);
      if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
      const [rows] = await db.execute('SELECT * FROM satisfaction ORDER BY created_at DESC');
      return res.json(rows);
    }

    // GET /api/admin/stats
    if (path === '/api/admin/stats' && method === 'GET') {
      const user = verifyToken(req);
      if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
      const [rows] = await db.execute(`
        SELECT COUNT(*) as total,
          ROUND(AVG(satisfaction), 2) as avg_satisfaction,
          ROUND(AVG(qualite), 2) as avg_qualite,
          ROUND(AVG(professionnalisme), 2) as avg_professionnalisme,
          ROUND(AVG(delais), 2) as avg_delais,
          ROUND(AVG(rapport), 2) as avg_rapport,
          ROUND((AVG(satisfaction) + AVG(qualite) + AVG(professionnalisme) + AVG(delais) + AVG(rapport)) / 5, 2) as avg_global
        FROM satisfaction
      `);
      return res.json(rows[0]);
    }

    return res.status(404).json({ error: 'Route non trouvée' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur', details: err.message });
  } finally {
    if (db) await db.end();
  }
}