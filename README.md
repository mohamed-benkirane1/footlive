# FootLive ⚽

Site de streaming football en direct — HTML/CSS/JS vanilla, Firebase Realtime Database, hls.js, ESPN API.

## Démarrage rapide

### 1. Cloner le repo

```bash
git clone https://github.com/TON-USER/footlive.git
cd footlive
```

### 2. Configurer Firebase

```bash
# Copiez le template
cp config/firebase.example.json js/firebase.config.js
```

Éditez `js/firebase.config.js` et remplacez les valeurs :

```js
const FIREBASE_CONFIG = {
  databaseURL: "https://MON-PROJET-default-rtdb.firebaseio.com/",
  // apiKey, authDomain, projectId si nécessaire
};

const ADMIN_PIN = "8033";  // changez votre PIN ici
```

> **Important :** `js/firebase.config.js` est dans `.gitignore` et ne sera jamais poussé.

### 3. Ouvrir le site

Ouvrez simplement `index.html` dans un navigateur, ou avec l'extension **Live Server** de VS Code.

Aucun build, aucune dépendance NPM nécessaire.

---

## Structure Firebase

Dans votre Firebase Realtime Database, les chaînes sont stockées sous le path `livetv/channels` :

```json
{
  "livetv": {
    "channels": {
      "-NxABC123": {
        "name": "beIN Sports 1",
        "logo": "https://example.com/logo.png",
        "category": "sports",
        "url": "mora=https://stream.example.com/live.m3u8"
      }
    }
  }
}
```

### Préfixes d'URL

| Préfixe | Type | Exemple |
|---------|------|---------|
| `mora=` | Flux HLS (.m3u8) | `mora=https://…/stream.m3u8` |
| `embed=` | Iframe embarquée | `embed=https://player.twitch.tv/…` |

---

## Fonctionnalités

- **Lecteur vidéo** – Streams HLS via hls.js + iframes embarquées
- **Chaînes live** – Chargement temps-réel depuis Firebase
- **Scores live** – Premier League & Champions League via l'API ESPN (sans clé)
- **Panel Admin** – Protégé par PIN, gestion CRUD des chaînes
- **Responsive** – Mobile-first, fonctionne sur tous les écrans

## Règles de sécurité Firebase (recommandé)

```json
{
  "rules": {
    "livetv": {
      "channels": {
        ".read": true,
        ".write": false
      }
    }
  }
}
```

Pour les écritures depuis le panel admin, utilisez Firebase Authentication ou un backend sécurisé.
