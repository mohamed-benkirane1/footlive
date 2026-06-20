/* ============================================================
   scores.js – Récupération et affichage des scores ESPN
============================================================ */

const Scores = (() => {

  /* Endpoints ESPN (aucune clé requise) */
  const ESPN_ENDPOINTS = {
    PL:  'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
    UCL: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard',
  };

  /* Données mockées utilisées si l'API échoue */
  const MOCK_DATA = {
    PL: [
      { home: 'Arsenal',   away: 'Chelsea',   scoreH: 2, scoreA: 1, status: 'LIVE', clock: '67\'' },
      { home: 'Liverpool', away: 'Man City',  scoreH: 1, scoreA: 1, status: 'LIVE', clock: '34\'' },
      { home: 'Man Utd',   away: 'Tottenham', scoreH: 0, scoreA: 2, status: 'FT',   clock: '' },
      { home: 'Everton',   away: 'Brentford', scoreH: 1, scoreA: 0, status: '15:00', clock: '' },
    ],
    UCL: [
      { home: 'Real Madrid', away: 'Bayern', scoreH: 3, scoreA: 2, status: 'LIVE', clock: '88\'' },
      { home: 'PSG',         away: 'Inter',  scoreH: 1, scoreA: 1, status: 'FT',   clock: '' },
      { home: 'Barcelona',   away: 'Dortmund', scoreH: 0, scoreA: 0, status: '21:00', clock: '' },
    ],
  };

  /* ── Récupère et parse les données ESPN ── */
  async function fetchLeague(key) {
    try {
      const res = await fetch(ESPN_ENDPOINTS[key]);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return parseESPN(data);
    } catch (err) {
      console.warn('[Scores] API indisponible (' + key + '), utilisation des données mock :', err.message);
      return MOCK_DATA[key];
    }
  }

  /* ── Convertit la réponse ESPN en format interne ── */
  function parseESPN(data) {
    if (!data.events || !data.events.length) return [];

    return data.events.map(event => {
      const comp   = event.competitions[0];
      const teams  = comp.competitors;

      const home = teams.find(t => t.homeAway === 'home') || teams[0];
      const away = teams.find(t => t.homeAway === 'away') || teams[1];

      const stateType = comp.status?.type?.name || '';
      let status = '';
      let clock  = '';

      if (stateType === 'STATUS_IN_PROGRESS') {
        status = 'LIVE';
        clock  = (comp.status.displayClock || '') + '\'';
      } else if (stateType === 'STATUS_FINAL') {
        status = 'FT';
      } else {
        const d = new Date(event.date);
        status = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      }

      return {
        home:   home.team.shortDisplayName || home.team.displayName,
        away:   away.team.shortDisplayName || away.team.displayName,
        scoreH: parseInt(home.score || 0, 10),
        scoreA: parseInt(away.score || 0, 10),
        status,
        clock,
      };
    });
  }

  /* ── Génère le HTML d'un item score ── */
  function renderItem(match) {
    const statusClass =
      match.status === 'LIVE' ? 'status-live' :
      match.status === 'FT'   ? 'status-ft'   : 'status-ns';

    const scoreDisplay = (match.status === 'FT' || match.status === 'LIVE')
      ? `${match.scoreH} - ${match.scoreA}`
      : '-';

    const clockHtml = match.clock
      ? `<span class="score-item__clock" style="font-size:0.68rem;color:var(--text-secondary)">${match.clock}</span>`
      : '';

    return `
      <li class="score-item">
        <div class="score-item__teams">
          <div class="score-item__home">${escHtml(match.home)}</div>
          <div class="score-item__away" style="opacity:0.75">${escHtml(match.away)}</div>
        </div>
        <span class="score-item__score">${scoreDisplay}</span>
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
          <span class="score-item__status ${statusClass}">${escHtml(match.status)}</span>
          ${clockHtml}
        </div>
      </li>`;
  }

  /* ── Met à jour une liste dans le DOM ── */
  function updateList(listId, matches) {
    const el = document.getElementById(listId);
    if (!el) return;

    if (!matches || !matches.length) {
      el.innerHTML = '<li class="score-list__loading">Aucun match en ce moment</li>';
      return;
    }

    el.innerHTML = matches.map(renderItem).join('');
  }

  /* ── Rafraîchit tous les scores ── */
  async function refresh() {
    const btnRefresh = document.getElementById('btnRefreshScores');
    if (btnRefresh) {
      btnRefresh.classList.add('spinning');
      setTimeout(() => btnRefresh.classList.remove('spinning'), 600);
    }

    const [pl, ucl] = await Promise.all([fetchLeague('PL'), fetchLeague('UCL')]);
    updateList('scoreListPL',  pl);
    updateList('scoreListUCL', ucl);
  }

  /* ── Initialise avec chargement immédiat + intervalle ── */
  function init() {
    refresh();
    setInterval(refresh, 60_000);   // actualisation toutes les 60 s
  }

  /* ── Utilitaire : échappement HTML ── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { init, refresh };
})();
