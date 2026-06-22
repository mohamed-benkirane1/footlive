/* ============================================================
   streams.js – Panel streams + câblage principal
============================================================ */

const Streams = (() => {

  /* ── Tableau des streams embed ── */
  const STREAMS = [
    { name: 'beIN Sports 1 HD',  url: 'https://streamtp2.com/bein1.php' },
    { name: 'beIN Sports 2 HD',  url: 'https://streamtp2.com/bein2.php' },
    { name: 'beIN Sports 3 HD',  url: 'https://streamtp2.com/bein3.php' },
    { name: 'SSC 1',             url: 'https://streamtp2.com/ssc1.php' },
    { name: 'Arryadia HD',       url: 'https://streamtp2.com/arryadia.php' },
    { name: 'Stream HD 1',       url: 'https://sportsurge.club/embed/1' },
    { name: 'Stream HD 2',       url: 'https://sportsurge.club/embed/2' },
  ];

  let currentMatch = null;

  /* ── Ouvre le panel pour un match ── */
  function openPanel(match) {
    currentMatch = match;

    document.getElementById('spMatch').textContent =
      `${match.homeName} vs ${match.awayName}`;

    /* Construit la liste */
    const list = document.getElementById('streamList');
    list.innerHTML = STREAMS.map((s, i) => `
      <li class="sp-item" data-idx="${i}">
        <span class="sp-num">${i + 1}</span>
        <span class="sp-name">${esc(s.name)}</span>
        <span class="sp-dot"></span>
        <button class="btn-sp-watch">▶ Regarder</button>
      </li>`).join('');

    /* Clic → nouvel onglet */
    list.querySelectorAll('.sp-item').forEach(item => {
      item.querySelector('.btn-sp-watch').addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        window.open(STREAMS[idx].url, '_blank');
      });
    });

    /* Affiche le panel et l'overlay */
    document.getElementById('streamPanel').classList.add('open');
    document.getElementById('streamPanel').setAttribute('aria-hidden', 'false');
    document.getElementById('overlay').classList.add('active');
  }

  /* ── Ferme le panel ── */
  function closePanel() {
    document.getElementById('streamPanel').classList.remove('open');
    document.getElementById('streamPanel').setAttribute('aria-hidden', 'true');
    document.getElementById('overlay').classList.remove('active');
    currentMatch = null;
  }

  /* ── Échappement HTML ── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return { openPanel, closePanel };
})();

/* ============================================================
   CÂBLAGE (streams.js chargé en dernier → Matches déjà défini)
============================================================ */

/* Lance le chargement des matchs avec le callback "ouvrir le panel" */
Matches.init((match) => Streams.openPanel(match));

/* Fermeture du panel */
document.getElementById('btnClosePanel').addEventListener('click', () => Streams.closePanel());
document.getElementById('overlay').addEventListener('click', () => Streams.closePanel());
