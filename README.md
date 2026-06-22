# KoraLive ⚽
Streaming football Coupe du Monde 2026 — style kooray.live

## Démarrage
Ouvrez `index.html` dans un navigateur ou avec **Live Server** (VS Code).
Aucun build, aucune dépendance, aucun serveur requis.

## UX Flow
1. **Page d'accueil** → matchs du jour (ESPN API fifa.world)
2. **"▶ Regarder"** sur un match → panel de streams slide depuis la droite
3. **"▶ Regarder"** sur un stream → lien s'ouvre dans un nouvel onglet

## Onglets Hier / Aujourd'hui / Demain
- **Aujourd'hui** : appel ESPN API + 6 matchs mock si API indisponible
- **Hier / Demain** : "Aucun match disponible" (pas d'appel API)

## Ajouter des streams
Éditez le tableau `STREAMS` dans `js/streams.js` :
```js
const STREAMS = [
  { name: "Mon Stream",  url: "https://exemple.com/stream.php" },
];
```

## Structure
```
footlive/
├── index.html         ← header + matchs + news + footer
├── css/style.css      ← thème bordeaux/dark
└── js/
    ├── matches.js     ← ESPN API + mock + cards + onglets
    └── streams.js     ← liste streams + panel + câblage
```
