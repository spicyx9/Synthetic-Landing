# CLAUDE.md

Site vitrine statique de Synthetic Swarm (https://www.syntheticswarm.ai). HTML, CSS et JS servis tels quels par Vercel depuis la racine du repo, avec `cleanUrls` : `/tarifs` sert `tarifs.html`. Pas de framework, pas de build, pas de dépendances. Détails fonctionnels et tableau des routes : `README.md`.

## Arborescence

| Dossier | Rôle |
| --- | --- |
| `/` (racine) | Pages HTML publiques, une par URL, plus les fichiers de plateforme : `vercel.json`, `robots.txt`, `sitemap.xml`, `favicon.ico`, `apple-touch-icon.png`, `.gitignore`, `.vercelignore`, `README.md`, `CLAUDE.md` |
| `css/` | Feuilles partagées par plusieurs pages : `styles.css`, `site-pages.css`, `motion.css`, `floating-demo.css` |
| `css/pages/` | Feuilles propres à une page, préfixées par la page (`home-*`, `solution-*`, `pricing-*`, `contact`, `careers`, `customers`, `about`, `legal`, `privacy`) |
| `js/` | Scripts partagés : `motion.js`, `page-motion.js`, `mobile-menu.js`, `newsletter.js`, `editorial-motion.js` |
| `js/pages/` | Scripts propres à une page, préfixés par la page (`home-*`, `solution-*`, `pricing`, `contact`, `careers`, `customers`) |
| `assets/img/` | Logos, favicon, images décoratives |
| `assets/team/`, `assets/careers/`, `assets/radar/`, `assets/trust/`, `assets/customers/`, `assets/data/`, `assets/vendor/` | Sous-dossiers dédiés : portraits, photos recrutement, cartes du radar, logos assureurs, photos clients, `customers.json`, MapLibre vendorisé |
| `assets/og-image.png`, `assets/logo-black.png` | Restent à cette place : leurs URL absolues sont utilisées par og:image, twitter:image et le JSON-LD |
| `api/` | Fonctions Vercel : `contact.js`, `newsletter.js` |
| `scripts/` | `site_layout.py`, générateur du header, du footer, des tarifs et de la FAQ d'achat partagés |
| `tests/` | Suites `node:test` (`*.test.cjs`) |

## Règles du repo

- Pages HTML à la racine uniquement. Ne jamais renommer ni déplacer un `.html` : son nom est l'URL publique. Ne jamais changer une URL publique ; si une page doit disparaître, ajouter une redirection permanente dans `vercel.json`.
- CSS dans `css/` (ou `css/pages/` s'il est propre à une page), JS dans `js/` (ou `js/pages/`). À la racine de `css/` et `js/`, uniquement le partagé.
- Images dans `assets/img/` ou dans le sous-dossier dédié d'`assets/`.
- Noms de fichiers en kebab-case minuscule dans `css/`, `js/` et `assets/`. Pas de majuscules, pas d'underscores, pas de noms hachés. Seules exceptions : `README.md` et `LICENSE.txt`.
- Aucun fichier en vrac à la racine en dehors des pages HTML et des fichiers de plateforme listés plus haut.
- Aucune documentation interne dans ce repo (voir « Repo public ») ; seule exception : `assets/customers/README.md`.
- Chaque nouveau chemin se référence en absolu depuis la racine (`/css/...`, `/js/...`, `/assets/...`). Après tout déplacement : mettre à jour les HTML, `scripts/site_layout.py`, les tests et `vercel.json`, puis vérifier que chaque `src` et chaque `href` locaux répondent 200.
- Pas de branche laissée ouverte après un merge : une branche fusionnée est supprimée.
- Ne jamais committer de secret ni de fichier `.env`. Les clés vivent dans les variables d'environnement Vercel.

## Règle de contenu public

Ne jamais exposer l'infrastructure de données dans le marketing ou les aperçus produit : aucun nom de source, registre ou base de données, aucune formulation générique sur les sources, aucun lien de divulgation de source, aucune méthode de collecte, aucune infrastructure de scraping ou de surveillance. Aucun nom de fournisseur ou de prestataire. Aucune référence au repo de l'application, à son code ou à ses routes internes, y compris dans les commentaires des CSS et JS servis. Décrire ce que Synthetic Swarm détecte, pourquoi c'est utile et ce que l'utilisateur reçoit. La règle vaut pour le HTML, le SEO, le générateur partagé, le JavaScript, les légendes, les blocs dépliables et les deux langues. Les mentions juridiques et de confidentialité restent séparées du marketing. `tests/source-copy.test.cjs` applique cette règle aux pages publiques.

## Commandes

```
python3 scripts/site_layout.py   # resynchronise header, footer, tarifs et FAQ d'achat
node --test tests/*.test.cjs     # tous les tests, 0 échec exigé
npx serve .                      # aperçu local avec clean URLs
```

## Execution Rules

- Sous-agents en parallèle dès que deux tâches sont indépendantes.
- Séquentiel uniquement si la tâche B dépend du résultat de A ou touche les mêmes fichiers.
- Commits atomiques et fréquents : un commit par changement logique, message court en anglais.
- `python3 scripts/site_layout.py` puis `node --test tests/*.test.cjs` avant chaque push. Aucun push avec un test rouge.
- Jamais de tiret cadratin ni de demi-cadratin, ni dans le code, ni dans les textes, ni dans les messages, ni dans les rapports.
