/* ============================================================
   matches.js – Matchs Coupe du Monde FIFA (ESPN API)
============================================================ */

const Matches = (() => {

  const ESPN = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

  /* ── Matchs mock (fallback si API indisponible) ── */
  const MOCK = [
    {
      id: 'm1', name: 'France vs Brésil',
      homeName: 'France',    homeShort: 'FRA',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/fra.png',
      awayName: 'Brésil',   awayShort: 'BRA',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/bra.png',
      scoreH: 2, scoreA: 1, state: 'LIVE', clock: '71\'',
    },
    {
      id: 'm2', name: 'Argentine vs Allemagne',
      homeName: 'Argentine', homeShort: 'ARG',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/arg.png',
      awayName: 'Allemagne', awayShort: 'GER',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/ger.png',
      scoreH: 1, scoreA: 1, state: 'LIVE', clock: '44\'',
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
      id: 'm5', name: 'Brésil vs Cameroun',
      homeName: 'Brésil',   homeShort: 'BRA',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/bra.png',
      awayName: 'Cameroun', awayShort: 'CMR',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/cmr.png',
      scoreH: 3, scoreA: 1, state: 'FT', clock: '',
    },
    {
      id: 'm6', name: 'USA vs Mexique',
      homeName: 'USA',     homeShort: 'USA',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/usa.png',
      awayName: 'Mexique', awayShort: 'MEX',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/mex.png',
      scoreH: 2, scoreA: 0, state: 'FT', clock: '',
    },
  ];

  /* ── Récupère les données ESPN ── */
  async function fetchData() {
    try {
      const res = await fetch(ESPN);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const parsed = parseESPN(data);
      return parsed.length ? parsed : MOCK;
    } catch (err) {
      console.warn('[Matches] ESPN indisponible → mock :', err.message);
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

      if (type === 'STATUS_IN_PROGRESS' || type === 'IN') {
        state = 'LIVE';
        clock = (comp.status.displayClock || '') + '\'';
      } else if (type === 'STATUS_FINAL') {
        state = 'FT';
      } else {
        /* Heure locale du match programmé */
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

  /* ── Construit une card DOM ── */
  function buildCard(match, onWatch) {
    const isLive = match.state === 'LIVE';
    const isFT   = match.state === 'FT';

    /* Badge statut */
    let badge = '';
    if (isLive)    badge = `<span class="badge badge--live">🔴 LIVE</span>`;
    else if (isFT) badge = `<span class="badge badge--ft">FT</span>`;
    else           badge = `<span class="badge badge--ns">${esc(match.clock)}</span>`;

    /* Score ou heure centrale */
    const center = (isLive || isFT)
      ? `<div class="match-score">${match.scoreH}<span class="score-sep"> – </span>${match.scoreA}</div>`
      : `<div class="match-time">${esc(match.clock)}</div>`;

    /* Logos avec fallback initiales */
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
      <div class="card-top">
        ${badge}
      </div>
      <div class="match-teams">
        <div class="team team--home">
          ${logoH}${fbH}
          <span class="team-name">${esc(match.homeName)}</span>
        </div>
        <div class="match-center">${center}</div>
        <div class="team team--away">
          <span class="team-name">${esc(match.awayName)}</span>
          ${logoA}${fbA}
        </div>
      </div>
      <div class="card-footer">
        <button class="btn-watch">▶ Regarder</button>
      </div>`;

    card.querySelector('.btn-watch').addEventListener('click', () => onWatch(match));
    return card;
  }

  /* ── Rend la liste de matchs ── */
  async function render(onWatch) {
    const grid = document.getElementById('matchesGrid');
    grid.innerHTML = '<p class="state-msg">Chargement des matchs…</p>';

    const matches = await fetchData();
    grid.innerHTML = '';

    if (!matches.length) {
      grid.innerHTML = '<p class="state-msg">Aucun match disponible pour le moment</p>';
      return;
    }

    /* Tri : LIVE → NS (par heure) → FT */
    const order = { LIVE: 0, NS: 1, FT: 2 };
    matches
      .sort((a, b) => {
        const diff = (order[a.state] ?? 1) - (order[b.state] ?? 1);
        if (diff !== 0) return diff;
        /* NS : trier par heure de début */
        if (a.state === 'NS' && b.state === 'NS') {
          return a.clock.localeCompare(b.clock);
        }
        return 0;
      })
      .forEach(m => grid.appendChild(buildCard(m, onWatch)));
  }

  /* ── Configure les onglets Hier / Aujourd'hui / Demain ── */
  function setupDayNav(onWatch) {
    const titleEl = document.getElementById('matchesTitle');

    document.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const day = btn.dataset.day;

        if (day === 'today') {
          titleEl.textContent = 'Matchs du Jour – Coupe du Monde 2026';
          render(onWatch);
        } else if (day === 'yesterday') {
          titleEl.textContent = 'Matchs d\'Hier – Coupe du Monde 2026';
          document.getElementById('matchesGrid').innerHTML =
            '<p class="state-msg">Aucun match disponible</p>';
        } else {
          titleEl.textContent = 'Matchs de Demain – Coupe du Monde 2026';
          document.getElementById('matchesGrid').innerHTML =
            '<p class="state-msg">Aucun match disponible</p>';
        }
      });
    });
  }

  /* ── Init : 1er rendu + refresh 30 s + onglets ── */
  function init(onWatch) {
    render(onWatch);
    setInterval(() => {
      /* Refresh uniquement si l'onglet "Aujourd'hui" est actif */
      const active = document.querySelector('.day-btn.active');
      if (active?.dataset.day === 'today') render(onWatch);
    }, 30_000);
    setupDayNav(onWatch);
  }

  /* ── Échappement HTML ── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return { init };
})();
