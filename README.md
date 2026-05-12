# Iwaju Backend

Backend minimal Node.js/Express pour la landing page Iwaju.

## Installation

```bash
cd backend
npm install
```

## Exécution

```bash
npm start
```

Le serveur écoute sur le port `3000` par défaut.

## Configuration PostgreSQL

Crée un fichier `backend/.env` avec :

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE
PORT=3000
```

Si tu utilises un service comme Heroku, Railway ou Render, configure `DATABASE_URL` dans les variables d'environnement.

Le backend crée automatiquement la table `subscriptions` si elle n'existe pas.

## Endpoints

- `POST /api/subscribe`
  - corps JSON : `{ "email": "prenom@domaine.com" }`
  - réponses :
    - `200` : inscription réussie
    - `400` : email invalide
    - `409` : email déjà inscrit
    - `500` : erreur serveur

- `GET /api/health`
  - vérifie que le service est actif

## Déploiement

- Mettre le dossier `backend` sur un hébergement Node.js (Vercel, Render, Railway, Heroku, etc.)
- Configurer le port via la variable d\'environnement `PORT`
- Si le front-end est servi depuis un autre domaine, activer CORS est déjà fait
