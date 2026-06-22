# كورة لايف ⚽
بث مباشر مباريات كأس العالم 2026

---

## 🚀 Déploiement automatique sur 8 sites Netlify

### Étape 1 – Créer les 8 sites Netlify

```bash
# Prérequis : Node.js 18+
node scripts/create-sites.js VOTRE_NETLIFY_TOKEN
```

Obtenez votre token sur :
👉 https://app.netlify.com/user/applications#personal-access-tokens

Le script va :
1. Créer les 8 sites (`koralive-1` → `koralive-8`)
2. Afficher les URLs et IDs
3. Afficher les commandes pour ajouter les secrets GitHub
4. Sauvegarder les résultats dans `netlify-sites.json` (ignoré par git)

---

### Étape 2 – Ajouter les secrets GitHub

```bash
# Installez GitHub CLI : https://cli.github.com
gh auth login

# Token Netlify (une seule fois)
gh secret set NETLIFY_TOKEN --body "VOTRE_TOKEN" --repo VOTRE_USER/VOTRE_REPO

# IDs des 8 sites (récupérés depuis le script)
gh secret set NETLIFY_SITE_1 --body "ID_SITE_1" --repo VOTRE_USER/VOTRE_REPO
gh secret set NETLIFY_SITE_2 --body "ID_SITE_2" --repo VOTRE_USER/VOTRE_REPO
# ... jusqu'à NETLIFY_SITE_8
```

Ou via l'interface GitHub :
👉 `Settings → Secrets and variables → Actions → New repository secret`

Secrets requis :

| Secret | Valeur |
|---|---|
| `NETLIFY_TOKEN` | Votre Personal Access Token Netlify |
| `NETLIFY_SITE_1` | ID du site koralive-1 |
| `NETLIFY_SITE_2` | ID du site koralive-2 |
| … | … |
| `NETLIFY_SITE_8` | ID du site koralive-8 |

---

### Étape 3 – Déployer

```bash
git add .
git commit -m "update"
git push origin main
```

GitHub Actions déploie **en parallèle** sur les 8 sites automatiquement.

Chaque site sera accessible sur :
- `https://koralive-1.netlify.app`
- `https://koralive-2.netlify.app`
- …
- `https://koralive-8.netlify.app`

---

## 📁 Structure du projet

```
footlive/
├── index.html                        ← page principale (arabe RTL)
├── css/style.css                     ← thème bordeaux/blanc
├── js/
│   ├── matches.js                    ← ESPN API + cartes matchs
│   └── streams.js                    ← ⚡ MATCH_STREAMS à modifier
├── scripts/
│   └── create-sites.js               ← crée les 8 sites Netlify
└── .github/
    └── workflows/
        └── deploy.yml                ← déploiement automatique
```

---

## ⚡ Ajouter un lien de stream avant un match

1. Repérez l'`ESPN ID` sous la carte du match
2. Ouvrez `js/streams.js`
3. Ajoutez dans `MATCH_STREAMS` **15 minutes avant** le coup d'envoi :

```js
const MATCH_STREAMS = {
  "401671862": "https://lien-du-stream-direct",
};
```

4. `git push` → les 8 sites sont mis à jour en moins de 2 minutes

---

## كيفية إضافة رابط بث

1. انظر تحت بطاقة المباراة → `ESPN ID: XXXXXXXXX`
2. افتح `js/streams.js` وأضف :
```js
"ESPN_ID": "https://رابط-البث",
```
3. `git push` → التحديث يصل لجميع المواقع الـ8 خلال دقيقتين
