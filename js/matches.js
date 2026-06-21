/* ============================================================
   matches.js – Matchs Coupe du Monde FIFA via ESPN API
============================================================ */

const Matches = (() => {

  const ENDPOINT = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

  /* Matchs mock utilisés si l'API est indisponible */
  const MOCK = [
    {
      id: 'mock1', name: 'France vs Brésil',
      homeName: 'France',    homeShort: 'FRA',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/fra.png',
      awayName: 'Brésil',   awayShort: 'BRA',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/bra.png',
      scoreH: 2, scoreA: 1, state: 'LIVE', clock: '74\'',
    },
    {
      id: 'mock2', name: 'Argentine vs Allemagne',
      homeName: 'Argentine', homeShort: 'ARG',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/arg.png',
      awayName: 'Allemagne', awayShort: 'GER',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/ger.png',
      scoreH: 1, scoreA: 2, state: 'FT', clock: '',
    },
    {
      id: 'mock3', name: 'Espagne vs Portugal',
      homeName: 'Espagne',  homeShort: 'ESP',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/esp.png',
      awayName: 'Portugal', awayShort: 'POR',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/por.png',
      scoreH: 0, scoreA: 0, state: 'NS', clock: '18:00',
    },
    {
      id: 'mock4', name: 'Maroc vs Sénégal',
      homeName: 'Maroc',   homeShort: 'MAR',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/mar.png',
      awayName: 'Sénégal', awayShort: 'SEN',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/sen.png',
      scoreH: 0, scoreA: 0, state: 'NS', clock: '21:00',
    },
  ];

  /* ── Récupère les matchs depuis ESPN ── */
  async function fetchData() {
    try {
      const res = await fetch(ENDPOINT);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const parsed = parseESPN(data);
      return parsed.length ? parsed : MOCK;
    } catch (err) {
      console.warn('[Matches] API indisponible, utilisation des mock :', err.message);
      return MOCK;
    }
  }

  /* ── Parse la réponse ESPN ── */
  function parseESPN(data) {
    if (!data.events?.length) return [];

    return data.events.map(event => {
      const comp  = event.competitions[0];
      const teams = comp.competitors;
      const home  = teams.find(t => t.homeAway === 'home') || teams[0];
      const away  = teams.find(t => t.homeAway === 'away') || teams[1];

      const typeName = comp.status?.type?.name || '';
      let state = 'NS', clock = '';

      if (typeName === 'STATUS_IN_PROGRESS') {
        state = 'LIVE';
        clock = (comp.status.displayClock || '') + '\'';
      } else if (typeName === 'STATUS_FINAL') {
        state = 'FT';
      } else {
        const d = new Date(event.date);
        clock = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      }

      const homeName = home.team.displayName;
      const awayName = away.team.displayName;

      return {
        id:        event.id,
        name:      `${homeName} vs ${awayName}`,
        homeName,
        homeShort: home.team.abbreviation || home.team.shortDisplayName || '',
        homeLogo:  home.team.logo || '',
        awayName,
        awayShort: away.team.abbreviation || away.team.shortDisplayName || '',
        awayLogo:  away.team.logo || '',
        scoreH:    parseInt(home.score || 0, 10),
        scoreA:    parseInt(away.score || 0, 10),
        state,
        clock,
      };
    });
  }

  /* ── Construit une card de match ── */
  function buildCard(match, onWatch) {
    const isLive = match.state === 'LIVE';
    const isFT   = match.state === 'FT';

    /* Badge */
    let badge = '';
    if (isLive) badge = `<span class="badge badge--live">⬤ LIVE ${esc(match.clock)}</span>`;
    else if (isFT) badge = `<span class="badge badge--ft">Terminé</span>`;
    else badge = `<span class="badge badge--ns">${esc(match.clock)}</span>`;

    /* Score ou heure */
    const centerEl = (isLive || isFT)
      ? `<div class="match-score">${match.scoreH}<span class="score-sep"> – </span>${match.scoreA}</div>`
      : `<div class="match-time">${esc(match.clock)}</div>`;

    /* Logos */
    const logoH = match.homeLogo
      ? `<img class="team-logo" src="${esc(match.homeLogo)}" alt="${esc(match.homeName)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const fbH = `<div class="team-logo-fb" ${match.homeLogo ? 'style="display:none"' : ''}>${esc(match.homeShort || '?')}</div>`;

    const logoA = match.awayLogo
      ? `<img class="team-logo" src="${esc(match.awayLogo)}" alt="${esc(match.awayName)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const fbA = `<div class="team-logo-fb" ${match.awayLogo ? 'style="display:none"' : ''}>${esc(match.awayShort || '?')}</div>`;

    const card = document.createElement('article');
    card.className = `match-card${isLive ? ' match-card--live' : ''}`;
    card.innerHTML = `
      ${badge}
      <div class="match-teams">
        <div class="team team--home">
          ${logoH}${fbH}
          <span class="team-name">${esc(match.homeName)}</span>
        </div>
        ${centerEl}
        <div class="team team--away">
          <span class="team-name">${esc(match.awayName)}</span>
          ${logoA}${fbA}
        </div>
      </div>
      <button class="btn-watch">▶ Regarder</button>`;

    card.querySelector('.btn-watch').addEventListener('click', () => onWatch(match));
    return card;
  }

  /* ── Rend tous les matchs dans la grille ── */
  async function render(onWatch) {
    const grid = document.getElementById('matchesGrid');
    grid.innerHTML = '<p class="state-msg">Chargement des matchs…</p>';

    const matches = await fetchData();
    grid.innerHTML = '';

    if (!matches.length) {
      grid.innerHTML = '<p class="state-msg">Aucun match disponible pour le moment</p>';
      return;
    }

    /* Tri : LIVE en premier, puis NS par heure, puis FT */
    const order = { LIVE: 0, NS: 1, FT: 2 };
    matches
      .sort((a, b) => (order[a.state] ?? 1) - (order[b.state] ?? 1))
      .forEach(m => grid.appendChild(buildCard(m, onWatch)));
  }

  /* ── Initialise : premier chargement + intervalle 60 s ── */
  function init(onWatch) {
    render(onWatch);
    setInterval(() => render(onWatch), 60_000);

    document.getElementById('btnRefresh').addEventListener('click', () => {
      const btn = document.getElementById('btnRefresh');
      btn.style.transition = 'transform 0.45s ease';
      btn.style.transform  = 'rotate(360deg)';
      setTimeout(() => { btn.style.transform = ''; btn.style.transition = ''; }, 460);
      render(onWatch);
    });
  }

  /* ── Échappement HTML ── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { init };
})();
