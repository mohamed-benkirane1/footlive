/* ============================================================
   player.js – Lecteur iframe plein écran + câblage des modules
============================================================ */

const Player = (() => {

  const iframe    = document.getElementById('streamIframe');
  const overlay   = document.getElementById('playerOverlay');
  const matchEl   = document.getElementById('playerMatch');
  const streamEl  = document.getElementById('playerStream');

  /* ── Ouvre le lecteur avec un stream ── */
  function open(stream, match) {
    matchEl.textContent  = match ? match.name : '';
    streamEl.textContent = stream.name;

    /* Injecte l'URL dans l'iframe */
    iframe.src = stream.url;

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
  }

  /* ── Ferme le lecteur et arrête le stream ── */
  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    /* Vide le src pour couper le son / la vidéo */
    setTimeout(() => { iframe.src = ''; }, 310);
  }

  return { open, close };
})();

/* ============================================================
   CÂBLAGE PRINCIPAL
   player.js est le dernier script chargé →
   Matches et Streams sont déjà définis.
============================================================ */

/* Matchs → ouvre le panel streams */
Matches.init((match) => Streams.openPanel(match));

/* Streams → ouvre le lecteur */
Streams.init((stream, match) => Player.open(stream, match));

/* "← Streams" : ferme le lecteur, le panel reste ouvert derrière */
document.getElementById('btnBack').addEventListener('click', () => {
  Player.close();
});

/* "✕ Fermer" : ferme le lecteur ET le panel */
document.getElementById('btnClosePlayer').addEventListener('click', () => {
  Player.close();
  Streams.closePanel();
});

/* Fermeture du panel streams */
document.getElementById('btnCloseStreams').addEventListener('click', () => {
  Streams.closePanel();
});

/* Clic sur l'overlay → ferme le panel streams */
document.getElementById('overlay').addEventListener('click', () => {
  Streams.closePanel();
});
