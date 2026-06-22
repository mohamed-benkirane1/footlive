/* ============================================================
   streams.js – Panel streams + câblage principal
============================================================ */

const Streams = (() => {

  /* ── Génère les streams à partir de l'ID ESPN du match ── */
  function getStreams(espnMatchId) {
    return [
      {
        name: '🔴 AR 1 – Stream Direct',
        url:  `https://siiiiiiir.tv/?match=${espnMatchId}`,
      },
      {
        name: '🔴 AR 2 – Stream Direct',
        url:  `https://siiiiiiir.tv/?match=${espnMatchId}`,
      },
      {
        name: '🔴 Stream HD',
        url:  'https://streamtp2.com/bein1.php',
      },
    ];
  }

  let currentMatch = null;

  /* ── Ouvre le panel pour un match ── */
  function openPanel(match) {
    currentMatch = match;

    document.getElementById('spMatch').textContent =
      `${match.homeName} vs ${match.awayName}`;

    /* Génère les streams avec l'ID ESPN du match */
    const streams = getStreams(match.id);

    /* Construit la liste */
    const list = document.getElementById('streamList');
    list.innerHTML = streams.map((s, i) => `
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
        window.open(streams[idx].url, '_blank');
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
