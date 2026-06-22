/* ============================================================
   streams.js – نظام روابط البث المباشر
   ⚡ عدّل MATCH_STREAMS قبل 15 دقيقة من كل مباراة
============================================================ */

const Streams = (() => {

  /* ══════════════════════════════════════════════════
     ⚡ MODIFIER ICI 15 MIN AVANT CHAQUE MATCH
     Format : "ESPN_ID" : "URL_STREAM_DIRECT"

     للحصول على ESPN_ID : انظر تحت كل بطاقة مباراة
     مثال : ESPN ID: 401671862
  ══════════════════════════════════════════════════ */
  const MATCH_STREAMS = {
    "4627863": "https://siiiiiiir.tv/hard/2908c7d4425d87350.html?match=4627863",
    // أضف المزيد هنا قبل كل مباراة :
    // "ESPN_ID": "https://رابط-البث-المباشر",
  };

  /* ── معالجة النقر على زر المشاهدة ── */
  function handleWatch(match) {
    const url = MATCH_STREAMS[String(match.id)];
    if (url) {
      window.open(url, '_blank');
    } else {
      showModal();
    }
  }

  /* ── عرض مودال "البث قريباً" ── */
  function showModal() {
    document.getElementById('modalOverlay').classList.add('open');
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
  }

  /* ── أحداث إغلاق المودال ── */
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalX').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  return { handleWatch };
})();

/* ============================================================
   CÂBLAGE – streams.js est chargé en dernier
============================================================ */
Matches.init((match) => Streams.handleWatch(match));
