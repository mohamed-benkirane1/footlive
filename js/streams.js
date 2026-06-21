/* ============================================================
   streams.js – Liste des streams embed (affichés pour tous les matchs)
============================================================ */

const Streams = (() => {

  /* ── Streams embed publics ── */
  const STREAMS = [
    { name: 'Stream 1 – beIN Sports 1',  url: 'https://embedme.top/embed/bein-sports-1/1' },
    { name: 'Stream 2 – beIN Sports 2',  url: 'https://embedme.top/embed/bein-sports-2/1' },
    { name: 'Stream 3 – Multi Embed',    url: 'https://multiembed.mov/?video_id=sport1' },
    { name: 'Stream 4 – StreamTP 1',     url: 'https://streamtp.live/bein1.php' },
    { name: 'Stream 5 – StreamTP 2',     url: 'https://streamtp.live/bein2.php' },
  ];

  let _onSelect    = null;    /* callback appelé quand un stream est choisi */
  let _currentMatch = null;   /* match actuellement affiché dans le panel */

  /* ── Reçoit le callback de sélection de stream ── */
  function init(onSelect) {
    _onSelect = onSelect;
  }

  /* ── Ouvre le panel pour un match donné ── */
  function openPanel(match) {
    _currentMatch = match;

    /* Met à jour le nom du match */
    document.getElementById('panelMatchName').textContent =
      `${match.homeName} vs ${match.awayName}`;

    /* Rend la liste des streams */
    const list = document.getElementById('streamList');
    list.innerHTML = STREAMS.map((s, i) => `
      <li class="stream-item" data-idx="${i}">
        <span class="stream-num">${i + 1}</span>
        <div class="stream-info">
          <span class="stream-name">${h(s.name)}</span>
        </div>
        <span class="stream-live-dot"></span>
        <button class="btn-watch-stream">▶ Regarder</button>
      </li>`).join('');

    /* Écoute les clics */
    list.querySelectorAll('.stream-item').forEach(item => {
      item.querySelector('.btn-watch-stream').addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        if (_onSelect) _onSelect(STREAMS[idx], _currentMatch);
      });
    });

    /* Affiche le panel */
    document.getElementById('streamPanel').classList.add('open');
    document.getElementById('streamPanel').setAttribute('aria-hidden', 'false');
    document.getElementById('overlay').classList.add('active');
  }

  /* ── Ferme le panel ── */
  function closePanel() {
    document.getElementById('streamPanel').classList.remove('open');
    document.getElementById('streamPanel').setAttribute('aria-hidden', 'true');
    document.getElementById('overlay').classList.remove('active');
    _currentMatch = null;
  }

  /* ── Échappement HTML ── */
  function h(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return { init, openPanel, closePanel };
})();
