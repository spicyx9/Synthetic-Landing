# Volet 9 : hygiène du repo et JavaScript

Méthode : 26 pages ouvertes en headless Chromium (Playwright 1.56.1) sur le serveur local à sémantique Vercel (127.0.0.1:4173), 4 passes (1280 px et 390 px, sans puis avec `reducedMotion: reduce`), scroll complet et interactions (menu mobile, disclosures header, premier accordéon `details`, curseur de volume `[data-pricing-range]` sur 4 valeurs plus un pas, combinaisons et volume de la page Solution, soumission vide du formulaire de contact) avec capture de `console` (error, warning), `pageerror`, `requestfailed` et réponses 4xx/5xx ; analyse statique des 118 fichiers suivis (`git ls-files`) par script Node (références src, href, srcset, url(), fetch) ; lecture de chaque JS racine et vérification page par page de ses sélecteurs d'entrée ; lecture des 10 fichiers de documentation contre le site ; `node --test` ; régénération par `scripts/site_layout.py` dans une copie `git archive` comparée fichier à fichier au repo ; `git ls-files` avec tailles, branches, config. Scripts et sorties : `tools/volet9/` dans le scratchpad (console-audit.js, console-results.json, orphans.js, verify-fonts.js, tests-glob.log, layout-diff.txt).

| Sévérité | Page(s) | Fichier:ligne | Constat | Correction exacte |
| --- | --- | --- | --- | --- |
| MAJEUR | 26 pages | assets/team/axel-ceo.png (1 721 963 o, PNG 1254x1254) ; index.html:74, 91, 187, 228 ; about.html:72, 82, 110 | Le portrait plein format est affiché en 38x38 dans les 4 popovers de réservation (cachés) de chaque page, et en 56 px sur about. Il est téléchargé sur chaque page : la home en 390 px pèse 4 348 Ko dont 2 x 1 682 Ko pour ce seul fichier (mesure `verify-fonts.js`, réponses réseau ; le double chargement vient du clone du menu mobile plus `Cache-Control: no-store` du serveur local, en production 1 x 1 682 Ko). Même problème à moindre échelle : assets/team/ilan-cto.jpg 110 587 o (1254x1254, affiché 38 px) et assets/logo-black-narrow.png 124 746 o (1024x1024, affiché 20x20, 28 pages). | Redimensionner à 4 fois la taille d'affichage maximale (56 px) puis mettre à jour README.md:39 ("stored unchanged") : bloc A |
| MAJEUR | production | BRAND.md, CONTACT_SETUP.md, LEGAL_AUDIT.md, docs/*.md, tests/*.cjs, scripts/site_layout.py, assets/data/README.md, assets/customers/README.md, assets/school-logo-sources.md, demo.js, floating-demo.js, leadgen.css ; robots.txt:2 | Ces fichiers internes sont servis publiquement et indexables : `curl -o /dev/null -w "%{http_code}" https://www.syntheticswarm.ai/BRAND.md` = 200, de même /CONTACT_SETUP.md, /tests/site.test.cjs, /scripts/site_layout.py, /docs/header-audit.md, /assets/data/README.md, /demo.js, /leadgen.css (README.md et vercel.json : 404, exclus par Vercel). CONTACT_SETUP.md:17-19 et api/contact.js:13 exposent le champ pot de miel `website` et le seuil anti-spam (5 envois par 10 min) ; robots.txt n'exclut que /api/. | Créer `.vercelignore` à la racine : bloc B |
| MAJEUR | /customers, /clients, /media, /medias | sitemap.xml:88-111 ; index.html:59 et 224 ; scripts/site_layout.py:33 | Les 4 pages sont des états vides ("Customer stories are coming soon.", customers.html ; "Articles, interviews and publications about us will appear here.", media.html) listées dans le sitemap mais sans aucun lien entrant : header et footer les rendent en `<span class="nav-disabled" role="link" aria-disabled="true">` (index.html:59, 224 et toutes les pages), seul le sélecteur de langue de la jumelle pointe dessus (customers.html:44, clients.html:44, media.html:43, medias.html:43). Un moteur peut envoyer un prospect sur une page vide, et ces URL restent orphelines pour le maillage. | Tant que les pages sont vides : supprimer les lignes 88 à 111 de sitemap.xml (les quatre blocs `<url>` customers, clients, media, medias) et ajouter dans le `<head>` des 4 pages `  <meta name="robots" content="noindex,follow">`. Dès qu'un contenu réel existe : supprimer la ligne 33 de scripts/site_layout.py (`if key in ['media','customers']: return f'<span class="nav-disabled" ...`) et lancer `python3 scripts/site_layout.py` pour rétablir les liens partout. |
| MINEUR | /conditions | conditions.html:16-17 | `/legal.css` chargé deux fois dans la même page (lignes 16 et 17), sans paramètre de version. | Supprimer la ligne 17 et remplacer la ligne 16 par `  <link rel="stylesheet" href="/legal.css?v=legal-cleanup">` |
| MINEUR | /terms, /conditions vs /legal-notice, /mentions-legales, /opt-out, /opposition | terms.html:16, conditions.html:16 vs legal-notice.html:16, mentions-legales.html:16, opposition.html:16, opt-out.html:16 | Même fichier legal.css servi sans version sur 2 pages et avec `?v=legal-cleanup` sur 4 : un correctif CSS ne serait pas invalidé de la même façon partout. | terms.html:16 : `  <link rel="stylesheet" href="/legal.css?v=legal-cleanup">` |
| MINEUR | /customers, /clients vs /, /index-fr | clients.html:82, customers.html:82 vs index.html:237, index-fr.html:237 | customers.js chargé sans version sur les pages clients et avec `?v=home-flow-20260918` sur les homepages. | clients.html:82 et customers.html:82 : `  <script src="/customers.js?v=home-flow-20260918"></script>` |
| MINEUR | /pricing, /tarifs | pricing.html:16, 19, 146 ; tarifs.html:16, 19, 146 | Seules pages à utiliser des chemins relatifs (`pricing-interactive.css?v=stable-geometry-1`, `pricing.js`) au lieu des chemins absolus de toutes les autres (index.html:17, 235) ; fonctionne grâce à cleanUrls à la racine mais casserait sous un sous-chemin ou un alias. Le lien Google Fonts (ligne 19) contient `&display=swap` non échappé alors que les 24 autres pages écrivent `&amp;display=swap`. | pricing.html:16 et tarifs.html:16 : `  <link rel="stylesheet" href="/pricing-interactive.css?v=stable-geometry-1">` ; ligne 146 : `  <script src="/pricing.js"></script>` ; ligne 19 : remplacer `&display=swap` par `&amp;display=swap` |
| MINEUR | aucune | demo.js (988 o), floating-demo.js (1 013 o), leadgen.css (6 005 o) | Aucun `<script>` ni `<link>` ne les charge (analyse des 26 pages et des CSS). solution-page.js:48-73 réimplémente la logique de floating-demo.js ; index.html:81 porte `.demo-wrapper` mais aucun `[data-animate]`, donc demo.js n'aurait aucun effet. BRAND.md:23 confirme que leadgen.css est "reference material". | `git rm demo.js floating-demo.js leadgen.css` puis retirer la ligne 23 de BRAND.md et remplacer "floating-demo.css/js" par "floating-demo.css" dans docs/production-implementation-audit.md:38 |
| MINEUR | aucune | 26 images sous assets/ (voir Orphelins), 10 153 067 o | Aucune référence dans HTML, CSS, JS ou JSON du site, ni dans tests/, scripts/, api/. 11 fichiers dépassent 500 Ko. BRAND.md:241-248 les décrit déjà comme non référencés. | bloc C (`git rm` exact) |
| MINEUR | tests | tests/comparison.test.cjs:20 vs index-fr.html:86 | Le test attend `/Synthetic Swarm déménage à San Francisco\./` alors que la page dit "Synthetic Swarm emménage à San Francisco." depuis le commit 7e78dd0 (2026-09-18 12:19, "update breaking news wording"), postérieur au dernier changement du test (ab4c861, 10:13). Résultat : 69 pass, 1 fail. | tests/comparison.test.cjs:20 : ` assert.match(hero,file==='index-fr.html' ? /Synthetic Swarm emménage à San Francisco\./ : /Synthetic Swarm moves to San Francisco\./);` |
| MINEUR | tests | racine du repo (pas de package.json, pas de .github/, pas de hook dans .git/hooks) | Rien n'exécute les tests : aucun workflow CI, aucun package.json, aucun hook. `node --test tests/` échoue sous Node 22.22.2 (`Cannot find module '/home/user/Synthetic-Landing/tests'`, 0 test exécuté) ; seule la forme documentée README.md:11 `node --test tests/*.test.cjs` fonctionne. | Créer `.github/workflows/test.yml` : bloc D |
| MINEUR | générateur | scripts/site_layout.py:16, 78, 88, 97, 98, 109 | Le gabarit `page()` des nouvelles pages a divergé des 26 pages : route `'legacy': ('/lead-magnets', '/lead-magnets-fr')` (pages supprimées, seules les redirections vercel.json restent) ; viewport sans `viewport-fit=cover` (pages : ligne 5) ; `/styles.css` sans version (pages : `?v=motion-1`) ; `site-pages.css?v=header-actions-2` (pages : `?v=persistent-header-20260918`) ; `mobile-menu.js` sans version (pages : `?v=motion-1`) ; `home-motion.js?v=2` (pages : `?v=comparison-polish-2`) et `editorial-motion.js?v=1` (pages : `?v=2`). Header et footer, eux, sont à jour (régénération sans diff, voir section dédiée). | Supprimer la ligne 16 ; ligne 88 : `  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">` ; ligne 97 : `  <link rel="stylesheet" href="/styles.css?v=motion-1">` ; lignes 98 et 123 : `/site-pages.css?v=persistent-header-20260918` ; ligne 109 : `  <script src="/mobile-menu.js?v=motion-1"></script>` ; ligne 78 : `"main-audit-1" if module == "solution-motion" else "comparison-polish-2" if module == "home-motion" else "2"` |
| MINEUR | repo | .claude/launch.json:7 | Fichier de configuration local suivi par git, avec un chemin absolu propre à un poste (`/Users/ilansainte-agathe/Desktop/Synthetic-Landing`) et un port de prévisualisation ; .gitignore:5-6 n'ignore que settings.local.json et worktrees/. | `git rm --cached .claude/launch.json` puis ajouter à .gitignore la ligne `.claude/` |
| MINEUR | repo | branches locales | 4 branches locales déjà fusionnées dans HEAD (`git branch --merged HEAD`) : claude/charming-euler-5m6jld, task/head-seo, task/indexing, task/structured-data. Aucun .DS_Store, __pycache__ ou .pyc suivi (vérifié `git ls-files`). | `git branch -d claude/charming-euler-5m6jld task/head-seo task/indexing task/structured-data` |
| MINEUR | docs | README.md:16-27, 39 ; BRAND.md:13, 17, 80, 178, 208 ; LEGAL_AUDIT.md:34 ; docs/header-audit.md:24, 25, 32, 34 ; docs/motion-qa.md ; docs/production-implementation-audit.md:64, 93-94, 104 | Affirmations périmées détaillées dans la section Docs périmées (routes manquantes, header décrit "sticky" alors qu'il est `position: fixed` styles.css:66, couleurs de pied de page, comptes de tests, routes /pricing-fr et pages lead-magnets disparues). | Voir section Docs périmées ; `git rm docs/motion-qa.md` |

Bloc A (portraits et logo, à lancer à la racine du repo, ImageMagick 7 ; garder les noms pour ne pas toucher aux 72 références HTML et JSON-LD) :

```bash
magick assets/team/axel-ceo.png -resize 224x224 -strip -define png:compression-level=9 assets/team/axel-ceo.png
magick assets/team/ilan-cto.jpg -resize 224x224 -strip -quality 82 assets/team/ilan-cto.jpg
magick assets/logo-black-narrow.png -resize 80x80 -strip assets/logo-black-narrow.png
```

README.md:39 devient : `The supplied Ilan portrait is stored at \`assets/team/ilan-cto.jpg\`, resized to 224x224 for the 38px and 56px circular crops; CSS controls the crop. The supplied Axel portrait is stored at \`assets/team/axel-ceo.png\` at the same size.`

Bloc B (`.vercelignore`, nouveau fichier à la racine ; Vercel exclut ces chemins du déploiement, le code du site n'en dépend pas : aucune page ne référence ces fichiers, voir Orphelins) :

```
docs/
tests/
scripts/
BRAND.md
CONTACT_SETUP.md
LEGAL_AUDIT.md
assets/school-logo-sources.md
assets/customers/README.md
assets/data/README.md
demo.js
floating-demo.js
leadgen.css
```

Bloc C (orphelins, une seule commande) :

```bash
git rm assets/40612c4abf743aacd69ec8b9755a5d2e.png assets/Louis-adam.jpeg assets/decor-1.png assets/decor-5.png assets/decor-6.png assets/decor-7.png assets/dory-pic.png assets/femme-letter-2.png assets/femme-pouce-rouge.png assets/follower-growth.png assets/gift-emoji.png assets/homme-couper.png assets/itec-logo.png assets/licorne-explosion.png assets/licorne-letter-2.png assets/logo-2x.png assets/logo-black-2x.png assets/logo-white-2x.png assets/logo-white.png assets/logo.png assets/louis-content.png assets/lutecienne-logo.png assets/memoji-reflecting.png assets/memoji-wishing.png assets/proof-post-2.png assets/proof-post-3.png demo.js floating-demo.js leadgen.css
```

Puis mettre à jour BRAND.md:241, 245-248 (inventaire des assets) pour ne garder que les fichiers restants.

Bloc D (`.github/workflows/test.yml`, nouveau fichier ; la commande est celle du README car `node --test tests/` échoue sous Node 22, voir Tests et CI) :

```yaml
name: tests
on:
  push:
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: node --test tests/*.test.cjs
```

## Console par page (26 lignes)

104 chargements (26 pages x 4 passes). Colonnes : erreurs console hors polices, warnings, `pageerror`, requêtes locales échouées, réponses 4xx/5xx, puis la ligne polices. Sur chaque chargement, la seule entrée capturée est `Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID` sur `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap` (console error + requestfailed) : c'est le proxy TLS du conteneur, non reconnu par le Chromium headless. Preuve : `curl` vers la même URL répond 200, et la même page rechargée avec `ignoreHTTPSErrors: true` donne 0 erreur, 0 requête échouée et `document.fonts.check('16px Inter') === true` (verify-fonts.js, / en 390 px et /tarifs en 1280 px). L'"erreur console sur / en 390 px" relevée par le test rapide est donc cet artefact réseau, pas le site. Aucune différence entre passes avec et sans reducedMotion.

| Page | Statut | Erreurs | Warnings | pageerror | Requêtes locales échouées | 4xx/5xx | Polices (artefact conteneur) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| / | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /index-fr | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /our-solution | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /notre-solution | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /pricing | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /tarifs | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /faq | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /faq-fr | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /about | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /a-propos | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /careers | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /recrutement | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /contact | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /contact-fr | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /customers | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /clients | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /media | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /medias | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /legal-notice | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /mentions-legales | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /privacy | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /confidentialite | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /terms | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /conditions | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /opt-out | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |
| /opposition | 200 | 0 | 0 | 0 | 0 | 0 | 1 par passe (4/4) |

Scripts et hooks (lecture des 13 JS racine, vérification des sélecteurs d'entrée page par page) : chaque script chargé trouve ses hooks. mobile-menu.js (`.header-inner`, 26/26), motion.js et page-motion.js (`main`, 26/26), customers.js (`[data-customer-stories]` sur clients, customers, index, index-fr ; `fetch('/assets/data/customers.json')` customers.js:55 donc chargé sur ces 4 pages, réponse 200), pricing.js (`[data-pricing-range]`, `.pricing-config-badge`, `[data-pricing-custom-booking]`, `[data-pricing-checkout]` présents sur pricing, tarifs, index, index-fr : pricing.js:39 et :48 planteraient sinon), contact.js (`[data-contact-form]` sur contact, contact-fr), careers.js (`.job-item` x4 sur careers, recrutement ; pas de garde mais chargé uniquement là), editorial-motion.js (`.about-page` ou `.careers-page` sur about, a-propos, careers, recrutement), home-motion.js (`.home-focused-hero`, `.home-comparison`, `.solution-system` sur les homepages), solution-motion.js et solution-page.js (`.solution-page`, `#target-volume`, `[data-combination]`, `[data-floating-demo]` sur our-solution, notre-solution). Aucun doublon de `<script>` ; un seul doublon de `<link rel="stylesheet">` (conditions.html:16-17).

Versions `?v=` divergentes pour un même fichier :

| Fichier | Versions rencontrées | Pages |
| --- | --- | --- |
| legal.css | aucune ; `?v=legal-cleanup` | conditions.html:16 et 17, terms.html:16 ; legal-notice.html:16, mentions-legales.html:16, opposition.html:16, opt-out.html:16 |
| customers.js | aucune ; `?v=home-flow-20260918` | clients.html:82, customers.html:82 ; index.html:237, index-fr.html:237 |
| pricing.js | `pricing.js` (relatif) ; `/pricing.js` | pricing.html:146, tarifs.html:146 ; index.html:235, index-fr.html:235 |
| pricing-interactive.css | `pricing-interactive.css?v=stable-geometry-1` (relatif) ; `/pricing-interactive.css?v=stable-geometry-1` | pricing.html:16, tarifs.html:16 ; index.html:17, index-fr.html:17 |
| styles.css, site-pages.css, motion.css, motion.js, page-motion.js, mobile-menu.js | une seule version chacun (`motion-1`, `persistent-header-20260918`, `3`, `main-audit-1`, `2`, `motion-1`) | 26/26 cohérentes |
| about.css, customers.css, demo.css, privacy.css, careers.css, contact.css, home.css, floating-demo.css, solution-page.css | cohérentes (sans version pour les quatre premiers, versionnées pour les autres) | pages concernées |

## Orphelins (tableau)

Méthode : chaque fichier suivi hors exclusions (docs/, tests/, scripts/, api/, .claude/, .md racine, vercel.json, .gitignore, sitemap.xml, robots.txt) cherché par nom de fichier délimité dans les 26 HTML, 15 CSS, 13 JS et le JSON. Les 26 pages HTML sont toutes liées depuis au moins une autre page (customers, clients, media, medias uniquement via le sélecteur de langue, voir MAJEUR ci-dessus). Aucune ressource référencée par une page n'est absente du repo (0 404 locale ; `/api/contact` est une fonction Vercel présente dans api/contact.js). assets/data/customers.json est chargé (customers.js:55) ; assets/favicon.png, logo-black-narrow.png, logo-black.png, decor-2.png, decor-3.png, emlyon-logo.png, ieseg-logo.svg, team/axel-ceo.png, team/ilan-cto.jpg sont utilisés.

| Fichier | Poids (o) | Références | Correction |
| --- | --- | --- | --- |
| assets/louis-content.png | 1 465 727 | 0 | bloc C |
| assets/proof-post-3.png | 1 253 391 | 0 | bloc C |
| assets/proof-post-2.png | 1 183 371 | 0 | bloc C |
| assets/follower-growth.png | 820 692 | 0 | bloc C |
| assets/decor-6.png | 600 811 | 0 | bloc C |
| assets/40612c4abf743aacd69ec8b9755a5d2e.png | 598 335 | 0 | bloc C |
| assets/decor-5.png | 591 781 | 0 | bloc C |
| assets/decor-7.png | 550 733 | 0 | bloc C |
| assets/licorne-explosion.png | 536 103 | 0 | bloc C |
| assets/licorne-letter-2.png | 515 711 | 0 | bloc C |
| assets/femme-pouce-rouge.png | 488 296 | 0 | bloc C |
| assets/femme-letter-2.png | 450 942 | 0 | bloc C |
| assets/homme-couper.png | 276 878 | 0 | bloc C |
| assets/dory-pic.png | 270 382 | 0 | bloc C |
| assets/decor-1.png | 177 883 | 0 | bloc C |
| assets/memoji-reflecting.png | 139 410 | 0 | bloc C |
| assets/memoji-wishing.png | 86 171 | 0 | bloc C |
| assets/gift-emoji.png | 60 818 | 0 | bloc C |
| assets/Louis-adam.jpeg | 45 633 | 0 | bloc C |
| assets/lutecienne-logo.png | 25 735 | 0 | bloc C |
| assets/logo-2x.png | 3 460 | 0 | bloc C |
| assets/logo-white-2x.png | 3 460 | 0 | bloc C |
| assets/itec-logo.png | 2 544 | 0 | bloc C |
| assets/logo-black-2x.png | 2 334 | 0 | bloc C |
| assets/logo-white.png | 1 233 | 0 | bloc C |
| assets/logo.png | 1 233 | 0 | bloc C |
| leadgen.css | 6 005 | 0 (BRAND.md:23 le dit "reference material") | bloc C |
| floating-demo.js | 1 013 | 0 (logique reprise dans solution-page.js:48-73) | bloc C |
| demo.js | 988 | 0 (aucun `[data-animate]` dans index.html) | bloc C |
| assets/school-logo-sources.md | 294 | documentation des logos emlyon et IÉSEG, non servie utilement | conserver ou déplacer dans docs/ ; exclure du déploiement (bloc B) |
| assets/customers/README.md, assets/data/README.md | 284, 1 614 | documentation interne | conserver ; exclure du déploiement (bloc B) |

Total supprimable par le bloc C : 29 fichiers, 10 161 073 o (9 922 Ko), soit 44 % du poids total des fichiers suivis (22 967 679 o). Cas particuliers demandés : customers.html et clients.html existent, sont dans le sitemap et lisent customers.json, mais ne sont liés nulle part (spans `aria-disabled`) ; media.html et medias.html idem, avec un `<template id="media-item-template">` inerte (media.html, medias.html : 1 occurrence chacun, conforme à README.md:33) ; assets/customers/ ne contient que README.md.

## Docs périmées (tableau)

| Fichier:ligne | Affirmation | Réalité vérifiée | Phrase corrigée |
| --- | --- | --- | --- |
| README.md:16-27 | Table des routes à 10 lignes (Home à Terms) | 13 paires existent : il manque Legal Notice, Opt out et Customers (sitemap.xml, urls.txt) | Ajouter après la ligne 27 : `\| Legal Notice \| \`/legal-notice\` \| \`/mentions-legales\` \|`, `\| Opt out \| \`/opt-out\` \| \`/opposition\` \|`, `\| Customers \| \`/customers\` \| \`/clients\` \|` |
| README.md:39 | Portraits "stored unchanged" | À modifier si le bloc A est appliqué (1254x1254 aujourd'hui) | Voir bloc A |
| BRAND.md:13 | "All seven root CSS files were inspected" | 15 fichiers CSS à la racine (`ls *.css`) | `All fifteen root CSS files were inspected (about, careers, contact, customers, demo, floating-demo, home, leadgen, legal, motion, pricing-interactive, privacy, site-pages, solution-page, styles):` |
| BRAND.md:17 et 178 | "sticky header", "Sticky 60px bar" | styles.css:66 `.header { position: fixed;` avec `padding-top: env(safe-area-inset-top)` ; docs/header-audit.md:11-12 documente le passage à fixed et l'offset 61 px | ligne 17 : `Global reset, Inter body, fixed header, ...` ; ligne 178 : `Fixed 61px bar (60px inner area plus border, plus safe-area inset), max-width 1280px.` |
| BRAND.md:178 | "FAQ and Customers remain accessible elsewhere" | Customers n'est accessible nulle part : span `aria-disabled` dans le footer (index.html:224) comme Media | `FAQ remains accessible in the footer. Customers and Media are visible but disabled until real content exists.` |
| BRAND.md:80 et 208 | Metadata `#777777` "Footer, dates, labels" ; footer "metadata 13px `#777`" | site-pages.css:15 `.site-footer-top p, .site-footer-copy { color: #666; font-size: 13px; }` (changement documenté LEGAL_AUDIT.md:12) | ligne 80 : `\| Metadata \| \`#666666\` \| Footer copy, legal update dates (was #777, changed for contrast) \|` ; ligne 208 : `metadata 13px \`#666\`` |
| BRAND.md:23 et 241-248 | leadgen.css et assets historiques "not currently referenced" | Exact aujourd'hui ; à réécrire après le bloc C | Supprimer les lignes 23 et 245-248 après suppression des fichiers |
| CONTACT_SETUP.md | Resend, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, 503 sans config, 502 fournisseur, 5 envois par 10 min, pot de miel, Reply-To | Conforme à api/contact.js:13, 27-28, 30, 32-40 | Aucun écart |
| LEGAL_AUDIT.md:34 | "59 Node tests pass" | 70 tests, 69 pass, 1 fail (tests-glob.log) | Document daté (2026-09-18) : ajouter en tête `Snapshot: 59 tests at audit time; see tests/ for the current count.` ou supprimer : `git rm LEGAL_AUDIT.md` |
| docs/header-audit.md:24 et 34 | "24 main routes tested", liste des routes avec `/pricing-fr` | 26 routes ; `/pricing-fr` est une redirection 308 vers `/tarifs` (vercel.json) | ligne 34 : remplacer `/pricing-fr` par `/tarifs` et ajouter `/media, /medias` ; ligne 24 : `26 main routes` |
| docs/header-audit.md:25 | "/lead-magnets and /lead-magnets-fr checked on desktop" | Pages supprimées, seules les redirections vercel.json subsistent | `/lead-magnets and /lead-magnets-fr now only exist as vercel.json redirects to the solution pages.` |
| docs/header-audit.md:32 | "Existing 59 repository tests pass" | 70 tests, 1 échec | `Existing 70 repository tests: 69 pass, comparison.test.cjs:20 is stale (see audit-site-09).` |
| docs/motion-qa.md:3, 22, 44, 84-85, 98 | "Historical branch-only review", 66 tests, route pricing-fr, fichiers lead-magnets-fr.html, lead-magnets.html, pricing-fr.html | Le fichier se déclare lui-même historique ; 3 fichiers cités n'existent plus | `git rm docs/motion-qa.md` (et retirer le lien "current production audit" devenu orphelin dans production-implementation-audit.md si besoin) |
| docs/production-implementation-audit.md:64 | "70 passing, 0 failing" | 69 passing, 1 failing depuis 7e78dd0 | `\`node --test tests/*.test.cjs\`: 70 tests; comparison.test.cjs:20 must follow the homepage news wording.` |
| docs/production-implementation-audit.md:93-94, 104 | Fichiers modifiés `lead-magnets-fr.html`, `lead-magnets.html`, `pricing-fr.html` | Supprimé, supprimé, renommé tarifs.html | Ajouter sous la liste : `lead-magnets*.html were removed and pricing-fr.html renamed tarifs.html after this audit.` ou `git rm docs/production-implementation-audit.md` (journal daté) |
| assets/school-logo-sources.md | emlyon et IÉSEG utilisés "unmodified" | assets/emlyon-logo.png et assets/ieseg-logo.svg référencés a-propos.html:82-83, about.html:82-83 | Aucun écart |
| assets/customers/README.md, assets/data/README.md | Champs customers.json, dossier photos vide, aperçu home à 3 témoignages | Conforme à customers.js:17-48, 60-66 ; assets/customers/ ne contient que le README | Aucun écart |

## Tests et CI

| Fichier | Couverture (1 ligne) |
| --- | --- |
| tests/comparison-motion.test.cjs | home-motion.js : la comparaison démarre à la première intersection, finit en moins d'une seconde, reste visible en reduced motion |
| tests/comparison.test.cjs | index.html et index-fr.html : structure de la home (8 `<li>` de comparaison, ordre des sections, 3 placeholders clients, un seul CTA démo dans le hero, texte du bandeau d'actualité) |
| tests/contact.test.cjs | api/contact.js : validation, absence de configuration (503), échec fournisseur (502), limitation d'envois |
| tests/customers.test.cjs | customers.js : rendu vide, initiales, aperçu à 3 témoignages vérifiés, échappement et filtrage des URL, statistiques |
| tests/language.test.cjs | vercel.json : redirections par pays et cookie, sélecteur de langue et routes équivalentes |
| tests/legal.test.cjs | 8 pages légales : traductions, navigation footer, opt-out par mailto, canonical et hreflang |
| tests/motion.test.cjs | motion.js : observer unique, pauses, reduced motion, focus, échecs partiels, décalages de story |
| tests/site.test.cjs | 26 pages : contenu source, header partagé, assets locaux, tarifs par palier, actualité fixe, configuration statique, parsing de tous les JS |
| tests/solution-audit.test.cjs | Pages Solution : contrat détaillé et titre approuvé ; chaque page charge un seul runtime motion |

Exécution : `node --test tests/` (commande demandée) échoue immédiatement sous Node 22.22.2 sans exécuter aucun test : `Error: Cannot find module '/home/user/Synthetic-Landing/tests'` (`# tests 1`, `# fail 1`, tests.log). `node --test tests/*.test.cjs` (README.md:11) : 70 tests, 69 pass, 1 fail, 331 ms (tests-glob.log). Échec unique, connu et pré-existant : `index-fr.html: compact conversion flow and honest integration states`, tests/comparison.test.cjs:20, `assert.match(hero, /Synthetic Swarm déménage à San Francisco\./)` alors que index-fr.html:86 contient `<span class="hero-eyebrow-news">Synthetic Swarm emménage à San Francisco.</span>`. Le texte de la page a été changé de "déménage" en "emménage" par le commit 7e78dd0 (2026-09-18 12:19:08, "update breaking news wording") sans mettre à jour le test dont la dernière modification est ab4c861 (10:13:32) : c'est le test qui est périmé, correction dans le tableau des constats. Le pendant EN (index.html, "Synthetic Swarm moves to San Francisco.") passe. `git status` après exécution : aucun fichier modifié par les tests.

Non couvert par les tests : liens internes et externes cassés (seuls les assets locaux et hreflang légaux sont vérifiés), responsive et débordements, accessibilité (contrastes, focus réel, axe), SEO (titres, descriptions, JSON-LD, sitemap vs pages), formulaire de contact côté navigateur (contact.js n'est pas testé, seule l'API l'est), exécution JavaScript réelle dans un navigateur (les tests motion tournent dans `vm` avec des mocks), performance et poids des pages.

CI : aucun `.github/workflows/`, aucun `package.json` (donc aucun script `test`), aucun hook dans `.git/hooks` (uniquement les `.sample`), aucun `.husky`. Rien n'exécute les tests automatiquement. Proposition : bloc D.

## site_layout.py

Ce que fait le script (scripts/site_layout.py, 143 lignes) : `ROUTES` (l. 8-17) et `LABELS` (l. 18-21) définissent les 13 paires FR/EN plus une route `legacy` lead-magnets ; `sync()` (l. 115-125) ouvre chaque page existante et remplace par regex le bloc `<header class="header">...</header>` et le bloc `<footer class="footer...">...</footer>` par le rendu de `header()` (l. 37-62 : logo, liens Solution et Tarifs, menu À propos avec Media désactivé, sélecteur de langue, Connexion, popover Démo) et `footer()` (l. 63-74 : 4 colonnes dont Customers et Media désactivés), puis ajoute site-pages.css et les scripts motion s'ils manquent ; `sync_conversion()` (l. 126-140) copie la section tarifs et la FAQ d'achat de pricing.html et tarifs.html dans index.html et index-fr.html entre les marqueurs `SHARED PRICING` et `SHARED FAQ` ; `page()` (l. 82-114) est le gabarit complet d'une nouvelle page (head, body, header, footer) et n'est appelé par rien dans le repo. Le menu mobile n'est pas généré : il est construit au chargement par mobile-menu.js (clone de `.nav-links` et `.nav-actions`).

Exécution dans la copie (`git archive HEAD | tar -x -C tools/volet9/copie`, `python3 scripts/site_layout.py`, code de sortie 0) puis comparaison `cmp` des 118 fichiers suivis avec le repo : 0 fichier différent, 0 ligne de diff (layout-diff.txt vide). Le script est donc la source de vérité pour header, footer et blocs tarifs/FAQ de la home : la régénération est idempotente sur l'état actuel.

Points vérifiés : il connaît tarifs.html (l. 10 `'pricing': ('/pricing', '/tarifs')` et l. 129) ; `page()` produit bien `<title>{escape(title)} | Synthetic Swarm</title>` (l. 90) et le `hreflang="x-default"` vers la version EN (l. 95). En revanche le gabarit `page()` est périmé sur le reste du head (voir constat MINEUR : viewport sans `viewport-fit=cover`, versions `?v=` obsolètes de styles.css, site-pages.css, mobile-menu.js, home-motion.js, editorial-motion.js) et la route `legacy` (l. 16) pointe vers des pages supprimées. Ces écarts ne touchent pas les 26 pages existantes tant que `sync()` ne les réinjecte pas (il n'ajoute site-pages.css et motion que s'ils manquent), mais toute page créée via `page()` naîtrait avec ces versions.

## Compte : 0 bloquant(s), 3 majeur(s), 12 mineur(s)

## Non couvert

- Poids réel des pages en production (cache Vercel, compression) : mesuré uniquement sur le serveur local (`Cache-Control: no-store`), la production ne télécharge le portrait qu'une fois par page mais reste à 1 682 Ko.
- Erreurs console sous Firefox et WebKit : Chromium headless uniquement.
- Contenu des fichiers .git (objets, branches distantes supprimées) : seules les branches locales ont été examinées.
- Exécution réelle de `/api/contact` : le formulaire a été soumis vide (validation locale), aucun envoi vers l'API.
- Docs de docs/audit-site/ (autres volets) : hors périmètre par consigne.
- Google Fonts : le blocage observé est propre au conteneur (certificat du proxy) ; la disponibilité réelle depuis le navigateur d'un prospect n'a pas pu être mesurée ici.

## git status

Sortie de `git status --short` dans le repo après rédaction (seul le rapport apparaît ; le dossier non suivi `docs/audit-site/screens/` d'un autre volet, présent en début de session, n'y figure plus et n'a pas été touché par ce volet). Aucun fichier du site n'a été modifié par ce volet.

```
?? docs/audit-site/audit-site-09-hygiene.md
```
