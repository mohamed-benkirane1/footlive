/* ============================================================
   player.js – Lecteur vidéo HLS + iframe
============================================================ */

const Player = (() => {

  const videoEl      = document.getElementById('videoPlayer');
  const iframeEl     = document.getElementById('iframePlayer');
  const placeholder  = document.getElementById('playerPlaceholder');
  const msgEl        = document.getElementById('playerMsg');

  let hls = null;

  /* ── Affiche un seul élément, masque les autres ── */
  function showOnly(el) {
    placeholder.style.display = 'none';
    videoEl.style.display     = 'none';
    iframeEl.style.display    = 'none';
    if (el) el.style.display  = 'block';
  }

  /* ── Détruit l'instance HLS en cours ── */
  function destroyHls() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  }

  /* ── Lecture HLS via hls.js ── */
  function playHls(url) {
    destroyHls();
    showOnly(videoEl);

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker:   true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });
      hls.loadSource(url);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoEl.play().catch(() => {
          /* L'autoplay est parfois bloqué par le navigateur */
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('[Player] Erreur HLS fatale :', data.type, data.details);
          showError('Erreur de stream. Vérifiez l\'URL ou réessayez.');
        }
      });

    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      /* Safari – support HLS natif */
      videoEl.src = url;
      videoEl.play().catch(() => {});
    } else {
      showError('Votre navigateur ne supporte pas la lecture HLS.');
    }
  }

  /* ── Lecture via iframe (embed=) ── */
  function playIframe(url) {
    destroyHls();
    showOnly(iframeEl);
    iframeEl.src = url;
  }

  /* ── Charge une chaîne (détecte le type selon le préfixe) ── */
  function load(channel) {
    const url = channel.url || '';

    if (url.startsWith('mora='))  playHls(url.slice(5));
    else if (url.startsWith('embed=')) playIframe(url.slice(6));
    else if (url.includes('.m3u8'))    playHls(url);
    else if (url.startsWith('http'))   playIframe(url);
    else showError('Format d\'URL non reconnu.');
  }

  /* ── Affiche un message d'erreur dans le placeholder ── */
  function showError(msg) {
    showOnly(null);
    placeholder.style.display = 'flex';
    if (msgEl) msgEl.textContent = msg;
  }

  /* ── Réinitialise le lecteur ── */
  function reset() {
    destroyHls();
    videoEl.src  = '';
    iframeEl.src = '';
    placeholder.style.display = 'flex';
    videoEl.style.display     = 'none';
    iframeEl.style.display    = 'none';
    if (msgEl) msgEl.textContent = 'Chargement du stream…';
  }

  return { load, reset };
})();
