# FootLive ⚽
Streaming football Coupe du Monde 2026 — style Koora Live

## Démarrage
Ouvrez `index.html` dans un navigateur ou avec **Live Server** (VS Code).
Aucun build, aucune dépendance, aucun serveur requis.

## UX Flow
1. **Page d'accueil** → matchs du jour (ESPN API Coupe du Monde)
2. **"▶ Regarder"** sur un match → panel de streams slide depuis la droite
3. **"▶ Regarder"** sur un stream → lecteur plein écran (iframe)
4. **"← Streams"** → retour à la liste des streams
5. **"✕ Fermer"** → retour aux matchs

## Ajouter des streams
Éditez `js/streams.js` et ajoutez vos URLs dans le tableau `STREAMS` :
```js
const STREAMS = [
  { name: "Mon Stream",  url: "https://exemple.com/stream.php" },
  { name: "Mon Stream 2", url: "https://exemple2.com/embed/1" },
];
```
Les streams apparaissent pour **tous les matchs**.

## Données matchs
- Source : ESPN API publique (aucune clé requise)
- Fallback : 6 matchs mock si l'API est indisponible
- Refresh automatique toutes les 60 secondes

## Structure
```
footlive/
├── index.html
├── css/style.css
└── js/
    ├── matches.js   ← ESPN API + mock + rendu cards
    ├── streams.js   ← liste des streams + panel
    └── player.js    ← lecteur iframe + câblage
```
