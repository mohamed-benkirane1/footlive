/* ============================================================
   matches.js – مباريات كأس العالم عبر ESPN API
============================================================ */

const Matches = (() => {

  const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

  /* عناوين الأقسام حسب اليوم */
  const TITLES = {
    '-1': 'مباريات الأمس – كأس العالم 2026',
    '0':  'مباريات اليوم – كأس العالم 2026',
    '1':  'مباريات الغد – كأس العالم 2026',
  };

  /* ── بيانات احتياطية إذا فشلت الـ API ── */
  const MOCK = [
    {
      id: '401671862',
      name: 'France vs Brésil',
      homeName: 'France',    homeShort: 'FRA',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/fra.png',
      awayName: 'Brésil',   awayShort: 'BRA',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/bra.png',
      scoreH: 2, scoreA: 1, state: 'LIVE', clock: '71\'',
    },
    {
      id: '401671863',
      name: 'Argentine vs Allemagne',
      homeName: 'Argentine', homeShort: 'ARG',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/arg.png',
      awayName: 'Allemagne', awayShort: 'GER',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/ger.png',
      scoreH: 1, scoreA: 1, state: 'LIVE', clock: '44\'',
    },
    {
      id: '401671864',
      name: 'Espagne vs Portugal',
      homeName: 'Espagne',  homeShort: 'ESP',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/esp.png',
      awayName: 'Portugal', awayShort: 'POR',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/por.png',
      scoreH: 0, scoreA: 0, state: 'NS', clock: '18:00',
    },
    {
      id: '401671865',
      name: 'Maroc vs Sénégal',
      homeName: 'Maroc',   homeShort: 'MAR',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/mar.png',
      awayName: 'Sénégal', awayShort: 'SEN',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/sen.png',
      scoreH: 0, scoreA: 0, state: 'NS', clock: '21:00',
    },
    {
      id: '401671866',
      name: 'Brésil vs Cameroun',
      homeName: 'Brésil',   homeShort: 'BRA',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/bra.png',
      awayName: 'Cameroun', awayShort: 'CMR',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/cmr.png',
      scoreH: 3, scoreA: 1, state: 'FT', clock: '',
    },
    {
      id: '401671867',
      name: 'USA vs Mexique',
      homeName: 'USA',     homeShort: 'USA',
      homeLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/usa.png',
      awayName: 'Mexique', awayShort: 'MEX',
      awayLogo: 'https://a.espncdn.com/i/teamlogos/countries/500/mex.png',
      scoreH: 2, scoreA: 0, state: 'FT', clock: '',
    },
  ];

  /* ── حساب التاريخ بصيغة YYYYMMDD ── */
  function getDateStr(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const y  = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    return `${y}${mo}${dy}`;
  }

  /* ── استدعاء ESPN API ── */
  async function fetchData(dayOffset) {
    try {
      const dateStr = getDateStr(dayOffset);
      const url     = `${ESPN_BASE}?dates=${dateStr}`;
      const res     = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data    = await res.json();
      const parsed  = parseESPN(data);
      /* إذا لم تكن هناك مباريات من الـ API، استخدم Mock فقط ليوم اليوم */
      return parsed.length ? parsed : (dayOffset === 0 ? MOCK : []);
    } catch (err) {
      console.warn('[Matches] ESPN غير متاح → mock :', err.message);
      return dayOffset === 0 ? MOCK : [];
    }
  }

  /* ── تحليل بيانات ESPN ── */
  function parseESPN(data) {
    if (!data.events?.length) return [];

    return data.events.map(event => {
      const comp  = event.competitions[0];
      const teams = comp.competitors;
      const home  = teams.find(t => t.homeAway === 'home') || teams[0];
      const away  = teams.find(t => t.homeAway === 'away') || teams[1];

      /* تحديد الحالة */
      const typeName  = comp.status?.type?.name  || '';
      const typeState = comp.status?.type?.state || '';
      let state = 'NS', clock = '';

      if (typeName === 'STATUS_IN_PROGRESS' || typeState === 'in') {
        state = 'LIVE';
        clock = (comp.status.displayClock || '') + '\'';
      } else if (typeName === 'STATUS_FINAL' || typeState === 'post') {
        state = 'FT';
      } else {
        /* هـ مباراة مقررة : عرض الوقت المحلي */
        const d = new Date(event.date);
        clock = d.toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit', hour12: false });
      }

      const homeName = home.team.displayName;
      const awayName = away.team.displayName;

      return {
        id:        String(event.id),
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

  /* ── بناء card المباراة ── */
  function buildCard(match, onWatch) {
    const isLive = match.state === 'LIVE';
    const isFT   = match.state === 'FT';

    /* شارة الحالة */
    let badge = '';
    if (isLive)    badge = `<span class="badge badge--live">🔴 مباشر</span>`;
    else if (isFT) badge = `<span class="badge badge--ft">انتهت</span>`;
    else           badge = `<span class="badge badge--ns">${esc(match.clock)}</span>`;

    /* النتيجة أو الوقت */
    const center = (isLive || isFT)
      ? `<div class="match-score">${match.scoreH}<span class="score-sep"> – </span>${match.scoreA}</div>`
      : `<div class="match-time">${esc(match.clock)}</div>`;

    /* شعارات الفرق مع بديل الأحرف */
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
        <button class="btn-watch">▶ شاهد المباراة</button>
      </div>
      <p class="match-espn-id">ESPN ID: ${esc(match.id)}</p>`;

    card.querySelector('.btn-watch').addEventListener('click', () => onWatch(match));
    return card;
  }

  /* ── عرض قائمة المباريات ── */
  async function render(onWatch, dayOffset) {
    const grid = document.getElementById('matchesGrid');
    grid.innerHTML = '<p class="state-msg">جارٍ التحميل…</p>';

    const matches = await fetchData(dayOffset);
    grid.innerHTML = '';

    if (!matches.length) {
      grid.innerHTML = '<p class="state-msg">لا توجد مباريات متاحة</p>';
      return;
    }

    /* ترتيب : مباشر → مقرر (بالوقت) → انتهت */
    const order = { LIVE: 0, NS: 1, FT: 2 };
    matches
      .sort((a, b) => {
        const d = (order[a.state] ?? 1) - (order[b.state] ?? 1);
        if (d !== 0) return d;
        if (a.state === 'NS') return a.clock.localeCompare(b.clock);
        return 0;
      })
      .forEach(m => grid.appendChild(buildCard(m, onWatch)));
  }

  /* ── تهيئة الأزرار وبدء التحميل ── */
  function init(onWatch) {
    let currentOffset = 0;

    /* أول تحميل */
    render(onWatch, 0);

    /* تحديث تلقائي كل 30 ثانية (فقط ليوم اليوم) */
    setInterval(() => {
      if (currentOffset === 0) render(onWatch, 0);
    }, 30_000);

    /* أزرار الأيام */
    document.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentOffset = parseInt(btn.dataset.offset, 10);
        document.getElementById('matchesTitle').textContent =
          TITLES[String(currentOffset)] || 'مباريات كأس العالم 2026';

        render(onWatch, currentOffset);
      });
    });
  }

  /* ── ترميز HTML ── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return { init };
})();
