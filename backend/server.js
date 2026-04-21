import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'srm',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Simple hash function (sans bcrypt pour éviter les dépendances natives)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'srm_salt_2026').digest('hex');
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Identifiants manquants' });
    }

    const hashed = hashPassword(password);
    db.query(
        'SELECT id, username, role, nom FROM users WHERE username = ? AND password_hash = ?',
        [username, hashed],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Erreur serveur' });
            if (results.length === 0) {
                return res.status(401).json({ error: 'Identifiants incorrects' });
            }
            const user = results[0];
            // Token simple : base64 de userId + role + timestamp
            const tokenData = `${user.id}:${user.role}:${Date.now()}`;
            const token = Buffer.from(tokenData).toString('base64');
            res.json({ token, role: user.role, nom: user.nom, username: user.username });
        }
    );
});

// Middleware vérification token simple
function verifyToken(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Non autorisé' });
    }
    try {
        const token = auth.split(' ')[1];
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const [userId, role] = decoded.split(':');
        req.userId = userId;
        req.role = role;
        next();
    } catch {
        return res.status(401).json({ error: 'Token invalide' });
    }
}

// ─── FORMULAIRE ──────────────────────────────────────────────────────────────

app.post('/submit', (req, res) => {
    const {
        nom, telephone, email, dateService, categorie, typeService,
        satisfaction, qualite, professionnalisme, delais, rapport,
        commentaire, suggestion
    } = req.body;

    const query = `INSERT INTO satisfaction 
        (nom, telephone, email, date_service, categorie, type_service, satisfaction, qualite, professionnalisme, delais, rapport, commentaire, suggestion) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [nom, telephone, email, dateService, categorie, typeService,
        satisfaction, qualite, professionnalisme, delais, rapport, commentaire, suggestion];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).json({ error: 'Erreur base de données', details: err.message });
        }
        res.status(200).json({ message: 'Évaluation enregistrée avec succès', id: result.insertId });
    });
});

// ─── DASHBOARD ADMIN ─────────────────────────────────────────────────────────

// Récupérer toutes les réponses (admin seulement)
app.get('/admin/responses', verifyToken, (req, res) => {
    if (req.role !== 'admin') {
        return res.status(403).json({ error: 'Accès refusé' });
    }
    db.query('SELECT * FROM satisfaction ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.json(results);
    });
});

// Statistiques globales (admin seulement)
app.get('/admin/stats', verifyToken, (req, res) => {
    if (req.role !== 'admin') {
        return res.status(403).json({ error: 'Accès refusé' });
    }
    const query = `
        SELECT 
            COUNT(*) as total,
            ROUND(AVG(satisfaction), 2) as avg_satisfaction,
            ROUND(AVG(qualite), 2) as avg_qualite,
            ROUND(AVG(professionnalisme), 2) as avg_professionnalisme,
            ROUND(AVG(delais), 2) as avg_delais,
            ROUND(AVG(rapport), 2) as avg_rapport,
            ROUND((AVG(satisfaction) + AVG(qualite) + AVG(professionnalisme) + AVG(delais) + AVG(rapport)) / 5, 2) as avg_global
        FROM satisfaction
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.json(results[0]);
    });
});

// Stats par catégorie
app.get('/admin/stats/categories', verifyToken, (req, res) => {
    if (req.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
    db.query(`
        SELECT categorie, COUNT(*) as count, ROUND(AVG(satisfaction),2) as avg_satisfaction
        FROM satisfaction GROUP BY categorie
    `, (err, results) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.json(results);
    });
});

// Stats par mois (derniers 6 mois)
app.get('/admin/stats/monthly', verifyToken, (req, res) => {
    if (req.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
    db.query(`
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as mois,
            COUNT(*) as count,
            ROUND(AVG(satisfaction),2) as avg_satisfaction
        FROM satisfaction
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY mois ASC
    `, (err, results) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
