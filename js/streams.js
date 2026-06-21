/* ============================================================
   streams.js – Liste des streams embed (affichés pour tous les matchs)
============================================================ */

const Streams = (() => {

  /* ── Streams embed publics ── */


const STREAMS = [
  { name: "beIN Sports 1", url: "https://dlhd.so/embed/stream-1.php" },
  { name: "beIN Sports 2", url: "https://dlhd.so/embed/stream-2.php" },
  { name: "beIN Sports 3", url: "https://dlhd.so/embed/stream-3.php" },
  { name: "beIN Sports 4", url: "https://dlhd.so/embed/stream-4.php" },
  { name: "beIN Sports Max 1", url: "https://dlhd.so/embed/stream-6.php" },
  { name: "SSC 1", url: "https://dlhd.so/embed/stream-48.php" },
  { name: "SSC 2", url: "https://dlhd.so/embed/stream-49.php" },
  { name: "Arryadia", url: "https://dlhd.so/embed/stream-60.php" },
  { name: "Canal+ Sport", url: "https://dlhd.so/embed/stream-20.php" },
  { name: "Sky Sports", url: "https://dlhd.so/embed/stream-11.php" }
];

  let _currentMatch = null;   /* match actuellement affiché dans le panel */

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
        window.open(STREAMS[idx].url, '_blank');
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

  return { openPanel, closePanel };
})();
