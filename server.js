require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// connexion DB
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// API pour enregistrer formulaire
app.post("/api/satisfaction", (req, res) => {
  const data = req.body;

  const sql = `
    INSERT INTO satisfaction 
    (nom, telephone, email, date_service, categorie, type_service,
     satisfaction, qualite, professionnalisme, delais, rapport, commentaire, suggestion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.nom,
    data.telephone,
    data.email,
    data.date_service,
    data.categorie,
    data.type_service,
    data.satisfaction,
    data.qualite,
    data.professionnalisme,
    data.delais,
    data.rapport,
    data.commentaire,
    data.suggestion
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Erreur serveur");
    }
    res.send("Données enregistrées !");
  });
});

app.listen(3001, () => {
  console.log("Serveur lancé sur http://localhost:3001");
});