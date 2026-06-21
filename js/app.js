/* ============================================================
   app.js – Orchestrateur principal FootLive
   Charge après : firebase.config.js, player.js, channels.js, matches.js
============================================================ */

/* ─────────────────────────────────────────
   1. ÉTAT GLOBAL
───────────────────────────────────────── */
let db           = null;
let currentMatch = null;               /* match actuellement sélectionné */
let adminOpen    = false;
let adminPin     = (typeof ADMIN_PIN !== 'undefined') ? ADMIN_PIN : '8033';

/* Restaure un PIN changé en session */
const storedPin = sessionStorage.getItem('footlive_pin');
if (storedPin) adminPin = storedPin;

/* ─────────────────────────────────────────
   2. INITIALISATION FIREBASE
───────────────────────────────────────── */
(function initFirebase() {
  try {
    if (typeof FIREBASE_CONFIG === 'undefined' || !FIREBASE_CONFIG.databaseURL) {
      console.warn('[Firebase] Configuration manquante → mode hors-ligne (mock)');
      Channels.init(null);
      return;
    }
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    Channels.init(db);
  } catch (err) {
    console.error('[Firebase] Erreur init :', err);
    Channels.init(null);
  }
})();

/* ─────────────────────────────────────────
   3. CHARGEMENT DES MATCHS
───────────────────────────────────────── */
Matches.init((match) => openChannelPanel(match));

/* ─────────────────────────────────────────
   4. PANEL CHAÎNES
───────────────────────────────────────── */
function openChannelPanel(match) {
  currentMatch = match;

  document.getElementById('channelPanelTitle').textContent =
    `📺 Chaînes — ${match.homeName} vs ${match.awayName}`;

  Channels.renderPanel(match, (channel) => openPlayer(channel));

  document.getElementById('channelPanel').classList.add('open');
  document.getElementById('channelPanel').setAttribute('aria-hidden', 'false');
  document.getElementById('overlay').classList.add('active');
}

function closeChannelPanel() {
  document.getElementById('channelPanel').classList.remove('open');
  document.getElementById('channelPanel').setAttribute('aria-hidden', 'true');
  document.getElementById('overlay').classList.remove('active');
  currentMatch = null;
}

document.getElementById('btnCloseChannels').addEventListener('click', closeChannelPanel);

/* ─────────────────────────────────────────
   5. LECTEUR VIDÉO
───────────────────────────────────────── */
function openPlayer(channel) {
  document.getElementById('playerChannelName').textContent = channel.name;
  document.getElementById('playerMatchName').textContent   = currentMatch
    ? `${currentMatch.homeName} vs ${currentMatch.awayName}`
    : '';

  Player.load(channel);

  document.getElementById('playerOverlay').classList.add('open');
  document.getElementById('playerOverlay').setAttribute('aria-hidden', 'false');
}

function closePlayer() {
  Player.reset();
  document.getElementById('playerOverlay').classList.remove('open');
  document.getElementById('playerOverlay').setAttribute('aria-hidden', 'true');
}

/* "← Chaînes" : ferme le lecteur, le panel chaînes reste ouvert derrière */
document.getElementById('btnBackToChannels').addEventListener('click', closePlayer);

/* "✕ Quitter" : ferme tout */
document.getElementById('btnClosePlayer').addEventListener('click', () => {
  closePlayer();
  closeChannelPanel();
});

/* ─────────────────────────────────────────
   6. OVERLAY (clic extérieur)
───────────────────────────────────────── */
document.getElementById('overlay').addEventListener('click', () => {
  if (adminOpen) closeAdminPanel();
  else closeChannelPanel();
});

/* ─────────────────────────────────────────
   7. MODAL PIN
───────────────────────────────────────── */
document.getElementById('btnAdmin').addEventListener('click', openPinModal);
document.getElementById('btnCancelPin').addEventListener('click', closePinModal);

function openPinModal() {
  document.getElementById('pinError').textContent = '';
  document.querySelectorAll('.pin-digit').forEach(d => d.value = '');
  document.getElementById('pinModal').classList.add('open');
  document.getElementById('pinModal').setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.pin-digit')[0].focus();
}

function closePinModal() {
  document.getElementById('pinModal').classList.remove('open');
  document.getElementById('pinModal').setAttribute('aria-hidden', 'true');
}

/* Saisie PIN – avance automatiquement au digit suivant */
document.querySelectorAll('.pin-digit').forEach((input, idx, all) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '');
    if (input.value && idx < all.length - 1) all[idx + 1].focus();
    if (idx === all.length - 1 && input.value) validatePin();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !input.value && idx > 0) all[idx - 1].focus();
  });
});

function validatePin() {
  const entered = [...document.querySelectorAll('.pin-digit')].map(d => d.value).join('');
  if (entered === adminPin) {
    closePinModal();
    openAdminPanel();
  } else {
    document.getElementById('pinError').textContent = 'Code incorrect, réessayez';
    document.querySelectorAll('.pin-digit').forEach(d => d.value = '');
    document.querySelectorAll('.pin-digit')[0].focus();
  }
}

/* ─────────────────────────────────────────
   8. PANEL ADMIN
───────────────────────────────────────── */
document.getElementById('btnCloseAdmin').addEventListener('click', closeAdminPanel);

function openAdminPanel() {
  adminOpen = true;
  Channels.renderAdmin(deleteChannel);
  document.getElementById('adminPanel').classList.add('open');
  document.getElementById('adminPanel').setAttribute('aria-hidden', 'false');
  document.getElementById('overlay').classList.add('active');
}

function closeAdminPanel() {
  adminOpen = false;
  document.getElementById('adminPanel').classList.remove('open');
  document.getElementById('adminPanel').setAttribute('aria-hidden', 'true');
  document.getElementById('overlay').classList.remove('active');
}

/* Mise à jour admin quand Firebase notifie un changement */
document.addEventListener('channels:updated', () => {
  if (adminOpen) Channels.renderAdmin(deleteChannel);
});

/* ── Onglets admin ── */
document.querySelectorAll('.admin-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('admin-' + btn.dataset.tab).classList.add('active');
  });
});

/* ─────────────────────────────────────────
   9. ADMIN – SUPPRIMER UNE CHAÎNE
───────────────────────────────────────── */
function deleteChannel(id) {
  if (!confirm('Supprimer cette chaîne ?')) return;

  if (db) {
    db.ref('livetv/channels/' + id).remove()
      .catch(err => alert('Erreur Firebase : ' + err.message));
  } else {
    /* Mode hors-ligne : modifie le cache local */
    const all = Channels.getAll();
    delete all[id];
    Channels.renderAdmin(deleteChannel);
  }
}

/* ─────────────────────────────────────────
   10. ADMIN – AJOUTER UNE CHAÎNE
───────────────────────────────────────── */
document.getElementById('addChannelForm').addEventListener('submit', async e => {
  e.preventDefault();
  const fb = document.getElementById('addFeedback');

  const channel = {
    name:     document.getElementById('newName').value.trim(),
    logo:     document.getElementById('newLogo').value.trim(),
    url:      document.getElementById('newUrl').value.trim(),
    category: document.getElementById('newCategory').value,
    matches:  document.getElementById('newMatches').value
                .split(',').map(s => s.trim()).filter(Boolean),
  };

  if (!channel.name || !channel.url) {
    fb.textContent = '✗ Nom et URL sont obligatoires';
    fb.className   = 'form-feedback error';
    return;
  }

  try {
    if (db) {
      await db.ref('livetv/channels').push(channel);
    } else {
      Channels.getAll()['local_' + Date.now()] = channel;
      Channels.renderAdmin(deleteChannel);
    }
    fb.textContent = '✓ Chaîne ajoutée avec succès';
    fb.className   = 'form-feedback success';
    e.target.reset();
  } catch (err) {
    fb.textContent = '✗ Erreur : ' + err.message;
    fb.className   = 'form-feedback error';
  }
  setTimeout(() => { fb.textContent = ''; }, 3500);
});

/* ─────────────────────────────────────────
   11. ADMIN – CHANGER LE PIN
───────────────────────────────────────── */
document.getElementById('changePinForm').addEventListener('submit', e => {
  e.preventDefault();
  const fb      = document.getElementById('pinFeedback');
  const current = document.getElementById('currentPin').value;
  const newP    = document.getElementById('newPinSetting').value;
  const confirm = document.getElementById('confirmPinSetting').value;

  if (current !== adminPin) {
    fb.textContent = '✗ PIN actuel incorrect';
    fb.className   = 'form-feedback error';
    return;
  }
  if (!/^\d{4}$/.test(newP)) {
    fb.textContent = '✗ Le nouveau PIN doit comporter exactement 4 chiffres';
    fb.className   = 'form-feedback error';
    return;
  }
  if (newP !== confirm) {
    fb.textContent = '✗ Les deux PINs ne correspondent pas';
    fb.className   = 'form-feedback error';
    return;
  }

  adminPin = newP;
  sessionStorage.setItem('footlive_pin', newP);
  fb.textContent = '✓ PIN modifié avec succès';
  fb.className   = 'form-feedback success';
  e.target.reset();
  setTimeout(() => { fb.textContent = ''; }, 3500);
});
