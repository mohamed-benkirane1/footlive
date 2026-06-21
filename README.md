# FootLive ⚽
Site de streaming football – Coupe du Monde 2026

## Setup

### 1. Cloner le repo
```bash
git clone https://github.com/TON-USER/footlive.git
cd footlive
```

### 2. Configurer Firebase
```bash
cp config/firebase.example.json js/firebase.config.js
```

Éditez `js/firebase.config.js` :
```js
const FIREBASE_CONFIG = {
  apiKey:            "...",
  authDomain:        "...",
  databaseURL:       "https://MON-PROJET-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "...",
  storageBucket:     "...",
  messagingSenderId: "...",
  appId:             "..."
};
const ADMIN_PIN = "8033";
```

> ⚠️ `js/firebase.config.js` est dans `.gitignore` – ne jamais commiter.

### 3. Lancer le site
Ouvrez `index.html` directement dans un navigateur, ou avec **Live Server** (VS Code).
Aucun build, aucune dépendance NPM.

---

## UX Flow
1. **Page d'accueil** → matchs du jour Coupe du Monde (ESPN API)
2. **Clic sur "▶ Regarder"** → panel de chaînes disponibles pour ce match
3. **Clic sur une chaîne** → lecteur plein écran
4. **← Chaînes** → retour à la liste des chaînes
5. **✕ Quitter** → retour aux matchs

## Ajouter des chaînes
1. Cliquez sur **⚙ Admin** → entrez le PIN (défaut : `8033`)
2. Onglet **➕ Ajouter** → remplissez le formulaire

### Préfixes d'URL stream
| Préfixe   | Type    | Exemple |
|-----------|---------|---------|
| `mora=`   | HLS (.m3u8) | `mora=https://…/stream.m3u8` |
| `embed=`  | Iframe  | `embed=https://player.twitch.tv/…` |

### Mots-clés matchs
Le champ **Mots-clés matchs** permet d'associer une chaîne à des matchs spécifiques.
Exemple : `France, Brésil` → la chaîne n'apparaît que pour France vs Brésil.
Laissez vide pour afficher la chaîne sur tous les matchs.

## Structure Firebase
```
livetv/
  channels/
    -NxABC123/
      name:     "beIN Sports 1"
      logo:     "https://…/logo.png"
      url:      "mora=https://…/stream.m3u8"
      category: "sports"
      matches:  ["France", "Brésil"]
```

## Règles de sécurité Firebase recommandées
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
