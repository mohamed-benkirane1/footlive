/* ============================================================
   player.js – Gestion du lecteur vidéo (HLS + iframe)
============================================================ */

const Player = (() => {

  const videoEl    = document.getElementById('videoPlayer');
  const iframeEl   = document.getElementById('iframePlayer');
  const placeholder = document.getElementById('playerPlaceholder');

  let hlsInstance = null;   // instance hls.js active

  /* ── Affiche uniquement l'élément demandé ── */
  function showOnly(element) {
    placeholder.style.display = 'none';
    videoEl.style.display     = 'none';
    iframeEl.style.display    = 'none';
    if (element) element.style.display = 'block';
  }

  /* ── Détruit l'instance HLS en cours ── */
  function destroyHls() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  }

  /* ── Lance un flux HLS (.m3u8) ── */
  function playHls(url) {
    destroyHls();
    showOnly(videoEl);

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker:      true,
        lowLatencyMode:    true,
        backBufferLength:  30,
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(videoEl);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        videoEl.play().catch(() => {
          // L'autoplay peut être bloqué – l'utilisateur peut appuyer sur play manuellement
        });
      });

      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('[HLS] Erreur fatale :', data.type, data.details);
          showError('Erreur de stream. Vérifiez l\'URL ou réessayez.');
        }
      });

    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari : support natif HLS
      videoEl.src = url;
      videoEl.play().catch(() => {});
    } else {
      showError('Votre navigateur ne supporte pas HLS.');
    }
  }

  /* ── Lance un lecteur iframe (embed=) ── */
  function playIframe(url) {
    destroyHls();
    showOnly(iframeEl);
    iframeEl.src = url;
  }

  /* ── Charge une chaîne selon le préfixe de son URL ── */
  function load(channel) {
    const url = channel.url || '';

    if (url.startsWith('mora=')) {
      playHls(url.slice(5));
    } else if (url.startsWith('embed=')) {
      playIframe(url.slice(6));
    } else if (url.includes('.m3u8')) {
      playHls(url);
    } else if (url.startsWith('http')) {
      playIframe(url);
    } else {
      showError('Format d\'URL non reconnu.');
    }
  }

  /* ── Affiche un message d'erreur dans le lecteur ── */
  function showError(msg) {
    showOnly(null);
    placeholder.style.display = 'flex';
    placeholder.querySelector('p').textContent = msg;
  }

  /* ── Réinitialise le lecteur ── */
  function reset() {
    destroyHls();
    videoEl.src    = '';
    iframeEl.src   = '';
    placeholder.style.display = 'flex';
    videoEl.style.display     = 'none';
    iframeEl.style.display    = 'none';
  }

  return { load, reset };
})();
