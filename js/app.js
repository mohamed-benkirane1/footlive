/* ============================================================
   app.js – Logique principale de FootLive
   Dépend de : firebase.config.js, player.js, scores.js
============================================================ */

/* ────────────────────────────────────────────────────────────
   1. INITIALISATION FIREBASE
──────────────────────────────────────────────────────────── */
let db = null;

function initFirebase() {
  try {
    if (typeof FIREBASE_CONFIG === 'undefined' || !FIREBASE_CONFIG.databaseURL) {
      console.warn('[Firebase] Configuration manquante – les chaînes ne seront pas chargées.');
      loadMockChannels();
      return;
    }
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    listenChannels();
  } catch (err) {
    console.error('[Firebase] Erreur init :', err);
    loadMockChannels();
  }
}

/* ────────────────────────────────────────────────────────────
   2. CHAÎNES – DONNÉES MOCK (si Firebase absent)
──────────────────────────────────────────────────────────── */
const MOCK_CHANNELS = {
  'ch1': { name: 'beIN Sports 1',  logo: '', url: 'embed=https://www.youtube.com/embed/live_stream?channel=UCXHxDIv9khNoMbhYHorDpEA', category: 'sports' },
  'ch2': { name: 'beIN Sports 2',  logo: '', url: 'embed=https://www.youtube.com/embed/live_stream?channel=UCXHxDIv9khNoMbhYHorDpEA', category: 'sports' },
  'ch3': { name: 'Canal+ Sport',   logo: '', url: 'mora=https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hd_7.m3u8', category: 'premium' },
  'ch4': { name: 'BT Sport 1',     logo: '', url: 'mora=https://test-streams.mux.dev/x36xhzz/url_2/193039199_mp4_h264_aac_hd_7.m3u8', category: 'football' },
  'ch5': { name: 'Sky Sports',     logo: '', url: 'mora=https://test-streams.mux.dev/x36xhzz/url_4/193039199_mp4_h264_aac_hd_7.m3u8', category: 'general' },
};

function loadMockChannels() {
  renderChannels(MOCK_CHANNELS);
  renderAdminChannels(MOCK_CHANNELS);
}

/* ────────────────────────────────────────────────────────────
   3. CHAÎNES – FIREBASE (écoute temps-réel)
──────────────────────────────────────────────────────────── */
function listenChannels() {
  db.ref('livetv/channels').on('value', snapshot => {
    const data = snapshot.val();
    if (data) {
      renderChannels(data);
      renderAdminChannels(data);
    } else {
      loadMockChannels();
    }
  }, err => {
    console.error('[Firebase] Lecture échouée :', err);
    loadMockChannels();
  });
}

/* ── Rendu de la liste des chaînes (sidebar) ── */
let allChannels     = {};     // cache des chaînes
let activeChannelId = null;   // chaîne actuellement sélectionnée

function renderChannels(channels) {
  allChannels = channels;
  const list     = document.getElementById('channelList');
  const query    = document.getElementById('channelSearch').value.toLowerCase();
  const filtered = Object.entries(channels)
    .filter(([, ch]) => ch.name.toLowerCase().includes(query));

  if (!filtered.length) {
    list.innerHTML = '<li class="channel-list__empty">Aucune chaîne trouvée</li>';
    return;
  }

  list.innerHTML = filtered.map(([id, ch]) => {
    const isActive = id === activeChannelId;
    const logoHtml = ch.logo
      ? `<img class="channel-item__logo" src="${escAttr(ch.logo)}" alt="${escAttr(ch.name)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const fallback = `<div class="channel-item__logo-fallback" ${ch.logo ? 'style="display:none"' : ''}>📺</div>`;

    return `
      <li class="channel-item ${isActive ? 'active' : ''}" data-id="${escAttr(id)}">
        ${logoHtml}${fallback}
        <div class="channel-item__info">
          <div class="channel-item__name">${escHtml(ch.name)}</div>
          <div class="channel-item__cat">${escHtml(ch.category || 'général')}</div>
        </div>
        <span class="badge-live">LIVE</span>
      </li>`;
  }).join('');

  /* Écoute les clics sur les items */
  list.querySelectorAll('.channel-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      selectChannel(id, channels[id]);
    });
  });
}

/* ── Sélection d'une chaîne ── */
function selectChannel(id, channel) {
  activeChannelId = id;

  /* Lecteur */
  Player.load(channel);

  /* Infos chaîne active */
  document.getElementById('activeChannelName').textContent = channel.name;
  document.getElementById('activeBadge').style.display = 'inline-flex';

  /* Simuler un score animé pour la bannière match */
  startMatchAnimation(channel.name);

  /* Mettre à jour la surbrillance dans la liste */
  document.querySelectorAll('.channel-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === id);
  });
}

/* ────────────────────────────────────────────────────────────
   4. ANIMATION DU SCORE FICTIF
──────────────────────────────────────────────────────────── */
const TEAMS = [
  ['Arsenal','Chelsea'], ['Liverpool','Man City'], ['Real Madrid','Barcelona'],
  ['PSG','Bayern'],      ['Man Utd','Juventus'],   ['Inter','AC Milan'],
  ['Dortmund','Porto'],  ['Ajax','Benfica'],
];

let scoreInterval = null;

function startMatchAnimation(channelName) {
  clearInterval(scoreInterval);

  const pair   = TEAMS[Math.floor(Math.random() * TEAMS.length)];
  let scoreH   = Math.floor(Math.random() * 3);
  let scoreA   = Math.floor(Math.random() * 3);

  document.getElementById('teamHome').textContent  = pair[0];
  document.getElementById('teamAway').textContent  = pair[1];
  document.getElementById('scoreHome').textContent = scoreH;
  document.getElementById('scoreAway').textContent = scoreA;

  /* Toutes les 90 s, chance d'incrémenter un score */
  scoreInterval = setInterval(() => {
    if (Math.random() < 0.3) {
      if (Math.random() < 0.5) scoreH++;
      else scoreA++;
      document.getElementById('scoreHome').textContent = scoreH;
      document.getElementById('scoreAway').textContent = scoreA;
    }
  }, 90_000);
}

/* ────────────────────────────────────────────────────────────
   5. PANEL ADMIN
──────────────────────────────────────────────────────────── */
let adminPin  = (typeof ADMIN_PIN !== 'undefined') ? ADMIN_PIN : '8033';
let adminOpen = false;

/* ── Ouverture : affiche le modal PIN ── */
document.getElementById('btnManage').addEventListener('click', () => {
  openPinModal();
});

function openPinModal() {
  document.getElementById('overlay').classList.add('active');
  document.getElementById('pinModal').classList.add('active');
  document.getElementById('pinError').textContent = '';
  document.querySelectorAll('.pin-digit').forEach(d => d.value = '');
  document.querySelector('.pin-digit').focus();
}

function closePinModal() {
  document.getElementById('overlay').classList.remove('active');
  document.getElementById('pinModal').classList.remove('active');
}

/* Saisie PIN – passe automatiquement au digit suivant */
document.querySelectorAll('.pin-digit').forEach((input, idx, all) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '');
    if (input.value && idx < all.length - 1) {
      all[idx + 1].focus();
    }
    if (idx === all.length - 1 && input.value) {
      validatePin();
    }
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !input.value && idx > 0) {
      all[idx - 1].focus();
    }
  });
});

function validatePin() {
  const entered = [...document.querySelectorAll('.pin-digit')]
    .map(d => d.value).join('');

  if (entered === adminPin) {
    closePinModal();
    openAdminPanel();
  } else {
    document.getElementById('pinError').textContent = 'Code PIN incorrect';
    document.querySelectorAll('.pin-digit').forEach(d => d.value = '');
    document.querySelector('.pin-digit').focus();
  }
}

document.getElementById('btnCancelPin').addEventListener('click', () => {
  closePinModal();
  document.getElementById('overlay').classList.remove('active');
});

/* ── Ouverture / fermeture du panel admin ── */
function openAdminPanel() {
  document.getElementById('overlay').classList.add('active');
  document.getElementById('adminPanel').classList.add('active');
  adminOpen = true;
}

document.getElementById('btnCloseAdmin').addEventListener('click', closeAdminPanel);

document.getElementById('overlay').addEventListener('click', () => {
  if (adminOpen) closeAdminPanel();
  else closePinModal();
});

function closeAdminPanel() {
  document.getElementById('overlay').classList.remove('active');
  document.getElementById('adminPanel').classList.remove('active');
  adminOpen = false;
}

/* ── Onglets admin ── */
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.adminTab;
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('admin-tab-' + tab).classList.add('active');
  });
});

/* ── Rendu liste admin ── */
function renderAdminChannels(channels) {
  const list = document.getElementById('adminChannelList');
  const entries = Object.entries(channels);

  if (!entries.length) {
    list.innerHTML = '<li>Aucune chaîne enregistrée</li>';
    return;
  }

  list.innerHTML = entries.map(([id, ch]) => `
    <li class="admin-channel-item">
      <span class="admin-channel-item__name">${escHtml(ch.name)}</span>
      <span class="admin-channel-item__cat">${escHtml(ch.category || '')}</span>
      <button class="btn-delete" data-id="${escAttr(id)}">Supprimer</button>
    </li>
  `).join('');

  list.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteChannel(btn.dataset.id));
  });
}

/* ── Supprimer une chaîne ── */
function deleteChannel(id) {
  if (!confirm('Supprimer cette chaîne ?')) return;

  if (db) {
    db.ref('livetv/channels/' + id).remove()
      .catch(err => alert('Erreur : ' + err.message));
  } else {
    delete allChannels[id];
    renderChannels(allChannels);
    renderAdminChannels(allChannels);
  }

  if (activeChannelId === id) {
    Player.reset();
    document.getElementById('activeChannelName').textContent = 'Aucune chaîne sélectionnée';
    document.getElementById('activeBadge').style.display = 'none';
    activeChannelId = null;
    clearInterval(scoreInterval);
  }
}

/* ── Formulaire Ajouter une chaîne ── */
document.getElementById('addChannelForm').addEventListener('submit', async e => {
  e.preventDefault();

  const channel = {
    name:     document.getElementById('newName').value.trim(),
    logo:     document.getElementById('newLogo').value.trim(),
    category: document.getElementById('newCategory').value,
    url:      document.getElementById('newUrl').value.trim(),
  };

  const msg = document.getElementById('addFormMsg');

  try {
    if (db) {
      await db.ref('livetv/channels').push(channel);
    } else {
      const id = 'local_' + Date.now();
      allChannels[id] = channel;
      renderChannels(allChannels);
      renderAdminChannels(allChannels);
    }
    msg.textContent = '✓ Chaîne ajoutée avec succès';
    msg.className   = 'form-msg success';
    e.target.reset();
  } catch (err) {
    msg.textContent = '✗ Erreur : ' + err.message;
    msg.className   = 'form-msg error';
  }

  setTimeout(() => { msg.textContent = ''; }, 3000);
});

/* ── Formulaire Changer le PIN ── */
document.getElementById('changePinForm').addEventListener('submit', e => {
  e.preventDefault();

  const current  = document.getElementById('currentPin').value;
  const newP     = document.getElementById('newPin').value;
  const confirm  = document.getElementById('confirmPin').value;
  const msg      = document.getElementById('pinFormMsg');

  if (current !== adminPin) {
    msg.textContent = '✗ PIN actuel incorrect';
    msg.className   = 'form-msg error';
    return;
  }
  if (!/^\d{4}$/.test(newP)) {
    msg.textContent = '✗ Le nouveau PIN doit contenir exactement 4 chiffres';
    msg.className   = 'form-msg error';
    return;
  }
  if (newP !== confirm) {
    msg.textContent = '✗ Les PINs ne correspondent pas';
    msg.className   = 'form-msg error';
    return;
  }

  adminPin = newP;
  /* Persiste dans sessionStorage pour la session en cours */
  sessionStorage.setItem('footlive_pin', newP);

  msg.textContent = '✓ PIN modifié avec succès';
  msg.className   = 'form-msg success';
  e.target.reset();
  setTimeout(() => { msg.textContent = ''; }, 3000);
});

/* ────────────────────────────────────────────────────────────
   6. ONGLETS SIDEBAR
──────────────────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
  });
});

/* ────────────────────────────────────────────────────────────
   7. NAVIGATION HEADER
──────────────────────────────────────────────────────────── */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const section = link.dataset.section;

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    /* Raccourcis : Scores et Chaînes activent le bon onglet sidebar */
    if (section === 'scores') {
      document.querySelector('[data-tab="scores"]').click();
    } else if (section === 'channels') {
      document.querySelector('[data-tab="channels"]').click();
    }
  });
});

/* ────────────────────────────────────────────────────────────
   8. RECHERCHE DE CHAÎNES
──────────────────────────────────────────────────────────── */
document.getElementById('channelSearch').addEventListener('input', () => {
  renderChannels(allChannels);
});

/* ────────────────────────────────────────────────────────────
   9. BOUTON RAFRAICHIR SCORES
──────────────────────────────────────────────────────────── */
document.getElementById('btnRefreshScores').addEventListener('click', () => {
  Scores.refresh();
});

/* ────────────────────────────────────────────────────────────
   10. PIN DEPUIS sessionStorage (persistance session)
──────────────────────────────────────────────────────────── */
const storedPin = sessionStorage.getItem('footlive_pin');
if (storedPin) adminPin = storedPin;

/* ────────────────────────────────────────────────────────────
   11. DÉMARRAGE
──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  Scores.init();
});

/* ────────────────────────────────────────────────────────────
   UTILITAIRES
──────────────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
