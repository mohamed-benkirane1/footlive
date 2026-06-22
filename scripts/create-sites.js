#!/usr/bin/env node
/* ============================================================
   create-sites.js – Crée 8 sites KoraLive sur Netlify
   Usage : node scripts/create-sites.js VOTRE_NETLIFY_TOKEN
============================================================ */

const NETLIFY_TOKEN = process.argv[2];

if (!NETLIFY_TOKEN) {
  console.error('❌  Token manquant.');
  console.error('    Usage : node scripts/create-sites.js VOTRE_NETLIFY_TOKEN');
  console.error('    Obtenez votre token sur : https://app.netlify.com/user/applications#personal-access-tokens');
  process.exit(1);
}

const SITE_NAMES = [
  'koralive-1', 'koralive-2', 'koralive-3', 'koralive-4',
  'koralive-5', 'koralive-6', 'koralive-7', 'koralive-8',
];

const NETLIFY_API = 'https://api.netlify.com/api/v1/sites';

/* ── Crée un site via l'API Netlify ── */
async function createSite(name) {
  const res = await fetch(NETLIFY_API, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status} – ${err}`);
  }

  return res.json();
}

/* ── Main ── */
async function main() {
  console.log('🚀  Création de 8 sites Netlify…\n');

  const results = [];
  const errors  = [];

  /* Création séquentielle pour éviter le rate-limiting */
  for (let i = 0; i < SITE_NAMES.length; i++) {
    const name = SITE_NAMES[i];
    process.stdout.write(`  [${i + 1}/8] ${name} … `);

    try {
      const site = await createSite(name);
      results.push({ index: i + 1, name, id: site.id, url: site.ssl_url || site.url });
      console.log(`✅  ${site.ssl_url || site.url}`);
    } catch (err) {
      errors.push({ index: i + 1, name, error: err.message });
      console.log(`❌  ${err.message}`);
    }

    /* Pause 500 ms entre chaque création */
    if (i < SITE_NAMES.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  /* ── Récapitulatif ── */
  console.log('\n' + '═'.repeat(60));
  console.log('📋  RÉCAPITULATIF\n');

  if (results.length) {
    console.log('✅  Sites créés :\n');
    results.forEach(s => {
      console.log(`  Site ${s.index} : ${s.url}`);
      console.log(`  ID      : ${s.id}\n`);
    });

    /* ── Commandes GitHub Secrets ── */
    console.log('═'.repeat(60));
    console.log('🔑  SECRETS GITHUB À AJOUTER\n');
    console.log('  Copiez-collez ces commandes dans votre terminal');
    console.log('  (installez gh CLI : https://cli.github.com)\n');

    const repo = 'VOTRE_USER/VOTRE_REPO'; /* remplacez */
    console.log(`  gh secret set NETLIFY_TOKEN --body "${NETLIFY_TOKEN}" --repo ${repo}\n`);
    results.forEach(s => {
      console.log(`  gh secret set NETLIFY_SITE_${s.index} --body "${s.id}" --repo ${repo}`);
    });

    /* ── Export JSON ── */
    const fs = await import('fs');
    const output = {
      token_hint: NETLIFY_TOKEN.slice(0, 8) + '…',
      sites: results.map(s => ({ index: s.index, name: s.name, id: s.id, url: s.url })),
    };
    const outPath = new URL('../netlify-sites.json', import.meta.url).pathname;
    fs.writeFileSync(outPath.replace(/^\/([A-Z]:)/, '$1'), JSON.stringify(output, null, 2));
    console.log('\n📄  Résultats sauvegardés dans netlify-sites.json');
    console.log('    ⚠️  Ce fichier est dans .gitignore — il ne sera pas commité.');
  }

  if (errors.length) {
    console.log('\n❌  Erreurs :');
    errors.forEach(e => console.log(`  Site ${e.index} (${e.name}) : ${e.error}`));
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅  Terminé ! Ajoutez les secrets GitHub puis faites un git push.');
}

main().catch(err => {
  console.error('\n❌  Erreur fatale :', err.message);
  process.exit(1);
});
