/* ============================================================
   player.js – Câblage principal des modules
   Les streams s'ouvrent dans un nouvel onglet (window.open).
============================================================ */

/* Matchs → ouvre le panel streams */
Matches.init((match) => Streams.openPanel(match));

/* Fermeture du panel streams (bouton ✕) */
document.getElementById('btnCloseStreams').addEventListener('click', () => {
  Streams.closePanel();
});

/* Clic sur l'overlay → ferme le panel streams */
document.getElementById('overlay').addEventListener('click', () => {
  Streams.closePanel();
});
