import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  ssl: { rejectUnauthorized: false }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { nom, telephone, email, dateService, categorie, typeService,
    satisfaction, qualite, professionnalisme, delais, rapport, commentaire, suggestion } = req.body;

  let db;
  try {
    db = await mysql.createConnection(dbConfig);
    await db.execute(
      `INSERT INTO satisfaction (nom, telephone, email, date_service, categorie, type_service, satisfaction, qualite, professionnalisme, delais, rapport, commentaire, suggestion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, telephone, email, dateService, categorie, typeService, satisfaction, qualite, professionnalisme, delais, rapport, commentaire, suggestion]
    );
    return res.status(200).json({ message: 'Évaluation enregistrée avec succès' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur', details: err.message });
  } finally {
    if (db) await db.end();
  }
}