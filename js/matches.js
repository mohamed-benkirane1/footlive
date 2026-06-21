/* ============================================================
   matches.js – Matchs Coupe du Monde FIFA via ESPN API
============================================================ */

const Matches = (() => {

  const ENDPOINT = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

  /* Matchs mockés utilisés si l'API est indisponible */
  const MOCK = [
    {
      id: 'm1', name: 'France vs Brésil',
      homeName: 'France',    homeShort: 'FRA',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/fra.png',
      awayName: 'Brésil',   awayShort: 'BRA',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/bra.png',
      scoreH: 2, scoreA: 1, state: 'LIVE', clock: '68\'',
    },
    {
      id: 'm2', name: 'Argentine vs Allemagne',
      homeName: 'Argentine', homeShort: 'ARG',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/arg.png',
      awayName: 'Allemagne', awayShort: 'GER',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/ger.png',
      scoreH: 1, scoreA: 2, state: 'FT', clock: '',
    },
    {
      id: 'm3', name: 'Espagne vs Portugal',
      homeName: 'Espagne',  homeShort: 'ESP',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/esp.png',
      awayName: 'Portugal', awayShort: 'POR',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/por.png',
      scoreH: 0, scoreA: 0, state: 'NS', clock: '18:00',
    },
    {
      id: 'm4', name: 'Maroc vs Sénégal',
      homeName: 'Maroc',   homeShort: 'MAR',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/mar.png',
      awayName: 'Sénégal', awayShort: 'SEN',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/sen.png',
      scoreH: 0, scoreA: 0, state: 'NS', clock: '21:00',
    },
    {
      id: 'm5', name: 'USA vs Mexique',
      homeName: 'USA',     homeShort: 'USA',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/usa.png',
      awayName: 'Mexique', awayShort: 'MEX',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/mex.png',
      scoreH: 0, scoreA: 0, state: 'NS', clock: '00:00',
    },
    {
      id: 'm6', name: 'Brésil vs Cameroun',
      homeName: 'Brésil',   homeShort: 'BRA',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/bra.png',
      awayName: 'Cameroun', awayShort: 'CMR',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/cmr.png',
      scoreH: 3, scoreA: 1, state: 'FT', clock: '',
    },
  ];

  /* ── Appel ESPN API ── */
  async function fetchData() {
    try {
      const res = await fetch(ENDPOINT);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const parsed = parseESPN(data);
      return parsed.length ? parsed : MOCK;
    } catch (err) {
      console.warn('[Matches] ESPN API indisponible — données mock :', err.message);
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

      const type = comp.status?.type?.name || '';
      let state = 'NS', clock = '';

      if (type === 'STATUS_IN_PROGRESS') {
        state = 'LIVE';
        clock = (comp.status.displayClock || '') + '\'';
      } else if (type === 'STATUS_FINAL') {
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

  /* ── Construit une card ── */
  function buildCard(match, onSelect) {
    const isLive = match.state === 'LIVE';
    const isFT   = match.state === 'FT';

    /* Badge */
    let badge = '';
    if (isLive)      badge = `<span class="badge badge--live">⬤ LIVE ${h(match.clock)}</span>`;
    else if (isFT)   badge = `<span class="badge badge--ft">Terminé</span>`;
    else             badge = `<span class="badge badge--ns">${h(match.clock)}</span>`;

    /* Score ou heure centrale */
    const center = (isLive || isFT)
      ? `<div class="match-score">${match.scoreH}<span class="score-sep"> – </span>${match.scoreA}</div>`
      : `<div class="match-time">${h(match.clock)}</div>`;

    /* Logos avec fallback */
    const logoH = match.homeLogo
      ? `<img class="team-logo" src="${h(match.homeLogo)}" alt="${h(match.homeName)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const fbH = `<div class="team-logo-fb" ${match.homeLogo ? 'style="display:none"' : ''}>${h(match.homeShort || '?')}</div>`;

    const logoA = match.awayLogo
      ? `<img class="team-logo" src="${h(match.awayLogo)}" alt="${h(match.awayName)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const fbA = `<div class="team-logo-fb" ${match.awayLogo ? 'style="display:none"' : ''}>${h(match.awayShort || '?')}</div>`;

    const card = document.createElement('article');
    card.className = `match-card${isLive ? ' match-card--live' : ''}`;
    card.innerHTML = `
      ${badge}
      <div class="match-teams">
        <div class="team team--home">
          ${logoH}${fbH}
          <span class="team-name">${h(match.homeName)}</span>
        </div>
        ${center}
        <div class="team team--away">
          <span class="team-name">${h(match.awayName)}</span>
          ${logoA}${fbA}
        </div>
      </div>
      <button class="btn-watch">▶ Regarder</button>`;

    card.querySelector('.btn-watch').addEventListener('click', () => onSelect(match));
    return card;
  }

  /* ── Rend la grille de matchs ── */
  async function render(onSelect) {
    const grid = document.getElementById('matchesGrid');
    grid.innerHTML = '<p class="state-msg">Chargement des matchs…</p>';

    const matches = await fetchData();
    grid.innerHTML = '';

    if (!matches.length) {
      grid.innerHTML = '<p class="state-msg">Aucun match disponible pour le moment</p>';
      return;
    }

    /* Tri : LIVE en premier, puis NS, puis FT */
    const order = { LIVE: 0, NS: 1, FT: 2 };
    matches
      .sort((a, b) => (order[a.state] ?? 1) - (order[b.state] ?? 1))
      .forEach(m => grid.appendChild(buildCard(m, onSelect)));
  }

  /* ── Init : 1er chargement + auto-refresh 60 s ── */
  function init(onSelect) {
    render(onSelect);
    setInterval(() => render(onSelect), 60_000);

    /* Bouton refresh manuel */
    const btn = document.getElementById('btnRefresh');
    btn.addEventListener('click', () => {
      btn.classList.add('spinning');
      setTimeout(() => btn.classList.remove('spinning'), 460);
      render(onSelect);
    });
  }

  /* ── Échappement HTML ── */
  function h(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return { init };
})();
