require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Erreur : DATABASE_URL doit être défini dans le fichier .env ou dans les variables d\'environnement.');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

app.use(cors());
app.use(express.json());

function isValidEmail(email) {
  const suspicious = /[<>"'`\(\)\{\}\[\];]/;
  if (!email || typeof email !== 'string') {
    return false;
  }
  if (suspicious.test(email)) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

app.post('/api/subscribe', async (req, res) => {
  const email = req.body?.email?.trim?.toLowerCase();

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Adresse e-mail invalide.' });
  }

  try {
    const query = 'INSERT INTO subscriptions (email) VALUES ($1) RETURNING id, email, created_at';
    const values = [email];
    const result = await pool.query(query, values);

    return res.status(200).json({ success: true, message: 'Inscription réussie.', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Cet e-mail est déjà inscrit.' });
    }

    console.error('Subscription error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur, veuillez réessayer plus tard.' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Impossible de joindre la base de données.' });
  }
});

app.listen(PORT, async () => {
  try {
    await ensureTable();
    console.log(`Iwaju backend démarré sur http://localhost:${PORT}`);
  } catch (error) {
    console.error('Impossible de préparer la base de données :', error);
    process.exit(1);
  }
});
