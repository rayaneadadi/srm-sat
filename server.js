import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Autorise les requêtes provenant de React
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration de la connexion MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'srm'
});

// Connexion à la base de données
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à MySQL :', err.message);
        return;
    }
    console.log('Connecté à la base de données MySQL (srm)');
});

// Route pour recevoir les données du formulaire
app.post('/submit', (req, res) => {
    // On extrait les données envoyées par le frontend (SatisfactionForm.tsx)
    // Note : on utilise les noms exacts définis dans votre state React (CamelCase)
    const { 
        nom, 
        telephone, 
        email, 
        dateService, 
        categorie, 
        typeService, 
        satisfaction, 
        qualite, 
        professionnalisme, 
        delais, 
        rapport, 
        commentaire, 
        suggestion 
    } = req.body;

    // Requête SQL (mapping vers les colonnes de votre table phpMyAdmin)
    const query = `INSERT INTO satisfaction 
        (nom, telephone, email, date_service, categorie, type_service, satisfaction, qualite, professionnalisme, delais, rapport, commentaire, suggestion) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        nom, 
        telephone, 
        email, 
        dateService, 
        categorie, 
        typeService, 
        satisfaction, 
        qualite, 
        professionnalisme, 
        delais, 
        rapport, 
        commentaire, 
        suggestion
    ];

    // Exécution de la requête
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'insertion SQL :', err);
            return res.status(500).json({ 
                error: 'Erreur lors de l\'enregistrement en base de données',
                details: err.message 
            });
        }
        
        console.log('Données insérées avec succès ! ID:', result.insertId);
        res.status(200).json({ 
            message: 'Évaluation enregistrée avec succès', 
            id: result.insertId 
        });
    });
});

// Lancement du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});