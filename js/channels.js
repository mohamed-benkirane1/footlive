/* ============================================================
   channels.js – Chaînes depuis Firebase Realtime Database
============================================================ */

const Channels = (() => {

  /* Données de démonstration utilisées si Firebase est absent */
  const MOCK = {
    demo1: {
      name:     'Démo – HLS Public',
      logo:     '',
      url:      'mora=https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8',
      category: 'sports',
      matches:  [],
    },
    demo2: {
      name:     'Démo – Vidéo embarquée',
      logo:     '',
      url:      'embed=https://www.youtube.com/embed/dQw4w9WgXcQ',
      category: 'general',
      matches:  [],
    },
  };

  let allChannels = {};   /* cache de toutes les chaînes */

  /* ── Initialise l'écoute Firebase (ou bascule sur les mock) ── */
  function init(db) {
    if (!db) {
      allChannels = MOCK;
      return;
    }

    db.ref('livetv/channels').on('value', snap => {
      const val = snap.val();
      allChannels = val && Object.keys(val).length ? val : MOCK;
      /* Notifie app.js si le panel admin est ouvert */
      document.dispatchEvent(new CustomEvent('channels:updated'));
    }, err => {
      console.error('[Channels] Erreur Firebase :', err);
      allChannels = MOCK;
    });
  }

  /* ── Normalise le champ matches (tableau Firebase, objet, ou chaîne CSV) ── */
  function getKeywords(ch) {
    const m = ch.matches;
    if (!m) return [];
    if (Array.isArray(m))        return m.map(s => String(s).toLowerCase().trim()).filter(Boolean);
    if (typeof m === 'object')   return Object.values(m).map(s => String(s).toLowerCase().trim()).filter(Boolean);
    if (typeof m === 'string')   return m.split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
    return [];
  }

  /* ── Retourne les chaînes pour un match donné.
        Si aucune ne correspond → retourne toutes. ── */
  function forMatch(match) {
    const homeLC = (match.homeName || '').toLowerCase();
    const awayLC = (match.awayName || '').toLowerCase();

    const matched = Object.entries(allChannels).filter(([, ch]) => {
      const kws = getKeywords(ch);
      if (!kws.length) return false;
      return kws.some(kw => homeLC.includes(kw) || awayLC.includes(kw)
                         || kw.includes(homeLC)  || kw.includes(awayLC));
    });

    return matched.length ? matched : Object.entries(allChannels);
  }

  /* ── Rend le panel de sélection de chaînes ── */
  function renderPanel(match, onSelect) {
    const list     = document.getElementById('channelList');
    const channels = forMatch(match);

    if (!channels.length) {
      list.innerHTML = '<li class="state-msg">Aucune chaîne disponible</li>';
      return;
    }

    list.innerHTML = channels.map(([id, ch]) => {
      const logoHtml = ch.logo
        ? `<img class="ch-logo" src="${esc(ch.logo)}" alt="${esc(ch.name)}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : '';
      const fbHtml = `<span class="ch-logo-fb" ${ch.logo ? 'style="display:none"' : ''}>📺</span>`;

      return `<li class="channel-item" data-id="${esc(id)}">
        ${logoHtml}${fbHtml}
        <span class="ch-name">${esc(ch.name)}</span>
        <button class="btn-watch-ch">▶ Regarder</button>
      </li>`;
    }).join('');

    list.querySelectorAll('.channel-item').forEach(item => {
      item.querySelector('.btn-watch-ch').addEventListener('click', () => {
        onSelect(allChannels[item.dataset.id]);
      });
    });
  }

  /* ── Rend la liste d'administration ── */
  function renderAdmin(onDelete) {
    const list    = document.getElementById('adminChannelList');
    const entries = Object.entries(allChannels);

    if (!entries.length) {
      list.innerHTML = '<li class="state-msg">Aucune chaîne enregistrée</li>';
      return;
    }

    list.innerHTML = entries.map(([id, ch]) => `
      <li class="admin-ch-item">
        <div class="admin-ch-info">
          <span class="admin-ch-name">${esc(ch.name)}</span>
          <span class="admin-ch-cat">${esc(ch.category || '')}</span>
        </div>
        <button class="btn-delete" data-id="${esc(id)}">Supprimer</button>
      </li>`).join('');

    list.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => onDelete(btn.dataset.id));
    });
  }

  function getAll() { return allChannels; }

  /* ── Échappement HTML ── */
  function esc(s) {
    return String(s)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }

  return { init, renderPanel, renderAdmin, getAll };
})();
