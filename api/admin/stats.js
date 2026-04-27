import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  ssl: { rejectUnauthorized: false }
};

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });

  let db;
  try {
    db = await mysql.createConnection(dbConfig);
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur', details: err.message });
  } finally {
    if (db) await db.end();
  }
}