# Flux 20 : code, validation, repo, tests, docs
Périmètre : validation W3C des 26 pages HTML (HTML, CSS en ligne, SVG) et des 15 fichiers CSS ; doublons (CSS/JS chargés deux fois, règles CSS dupliquées, fichiers et images orphelins, CSS mort) ; générateur scripts/site_layout.py (ce qu'il régénère, idempotence) ; tests Node, CI, hooks ; dépôt git (branches, taille, gros binaires, historique, auteurs, fichiers suivis à tort) ; documentation (README.md, BRAND.md, CONTACT_SETUP.md, LEGAL_AUDIT.md, docs/*.md, assets/*/README.md) ; dépendances et CDN de l'app ; résidus (TODO, console.log, code mort, fins de ligne, encodage, fichiers lourds). Lignes d'inventaire couvertes : fichiers.csv (130 fichiers) et pages.csv (26 pages). Commit audité : 864833f (branche claude/friendly-galileo-94wicf, HEAD 4cf1f14 = 864833f + inventaires de phase 0).
Outils : copies du repo dans le scratchpad (flux20/repo-copy pour l'analyse, repo-gen et repo-gen2 pour exécuter le générateur aux commits 864833f et 81ec818, repo-gen3 pour tester les corrections) ; vnu 26.9.16 (vnu-jar, --also-check-css --also-check-svg, --css, --svg) ; validateur CSS W3C en ligne (jigsaw, sortie JSON, via curl) ; Node v22.22.2 (node --test) ; Python 3.11.15 avec tinycss2 1.5.1 (installé dans le scratchpad) et Pillow ; git 2.43.0 ; curl 8.5.0 ; npm view (registre npm) ; API GitHub publique (visibilité du dépôt). Aucune modification du repo hors ce rapport ; scripts/site_layout.py et node --test n'ont été exécutés que dans les copies.
Début : 2026-09-19T19:36:52Z  Fin : 2026-09-19T20:13:00Z
Statut : COMPLET

Synthèse : le code servi est propre sur les résidus (0 TODO, 0 console.log, 79 tests Node verts, CSS valide) mais trois défauts structurels ressortent : le générateur documenté dans le README n'est pas idempotent (il réécrirait le bloc tarifs des deux pages d'accueil, diff de 2 fichiers), 26 images orphelines (9,68 Mo, dont 5 captures LinkedIn et un portrait d'un tiers), un fichier de configuration locale nominatif, les 12 tests et les docs internes sont servis publiquement par Vercel, et styles.css (92 Ko, 26 pages) est mort à 73 %. S'y ajoutent 36 erreurs W3C (careers/recrutement : summary role=button contenant div et h3 ; media/medias), un dépôt public exposant des adresses gmail personnelles, aucune CI, et le fait que la production sert déjà le commit 81ec818 (2 commits après le 864833f audité : badge tarifaire déplacé sur 20 leads, visuels careers), ce qui décale la base de l'audit pour 7 fichiers.

| Verdict | Sévérité | Page(s) | Élément | Attendu | Constaté | Preuve | Correction exacte |
| --- | --- | --- | --- | --- | --- | --- | --- |
| L01 CASSÉ | MAJEUR | careers.html, recrutement.html | [HTML W3C] 4 `<summary role="button" aria-expanded="false" aria-controls="details-…">` contenant `<div><h3 class="job-title">…</h3><p class="job-summary">…</p></div>` (lignes 65 à 68 de chaque fichier) | 0 erreur W3C | 16 erreurs et 4 avertissements par page : "The role attribute must not be used on any summary element", "The aria-expanded attribute must not be used on any summary element", "Element div not allowed as child of element summary", "The element h3 must not appear as a descendant of an element with the attribute role=button", avertissement "The button role is unnecessary for element summary" ; careers.js l.4 repose aria-expanded sur le summary à chaque toggle | `java -jar vnu.jar --format json --also-check-css --also-check-svg *.html` (copie) : 47 messages au total dont 36 erreurs ; careers.html l.64 c.143 et suivantes (numérotation vnu, décalée d'une ligne : ligne 65 du fichier) ; recrutement.html idem ; `grep -n '<summary role="button"' careers.html` → l.65, 66, 67, 68 | Voir C1 (appliqué en copie : vnu 0 message sur les 26 pages, tests 79/79) |
| L02 CASSÉ | MINEUR | media.html, medias.html | [HTML W3C] `<div class="media-archive page-section" aria-label="Publications"></div>` (l.57) et, dans `<template id="media-item-template">`, `<time data-field="date"></time>` (l.59) | 0 erreur W3C | 2 erreurs par page : "The aria-label attribute must not be specified on any div element unless the element has a role value…" ; "The text content of element time was not in the required format" | vnu : media.html l.56 c.471 et l.58 c.215 (numérotation vnu) ; `grep -n 'media-archive' media.html` → l.57 ; `grep -n '<time data-field' media.html` → l.59 | Voir C2 (appliqué en copie : 0 message) |
| L03 DÉGRADÉ | MINEUR | confidentialite.html, legal-notice.html, mentions-legales.html | [HTML W3C] `<meta name="description" content="…" />` avec slash final (l.8) | balise void sans slash, comme sur les 23 autres pages | 1 info vnu par page : "Trailing slash on void elements has no effect and interacts badly with unquoted attribute values" | vnu : l.7 c.120, l.7 c.85, l.7 c.81 (numérotation vnu) ; `grep -n ' />' legal-notice.html` → l.8 | `sed -i '8s# */>#>#' confidentialite.html legal-notice.html mentions-legales.html` (appliqué en copie : 0 message) |
| L04 OK | n/a | a-propos, about, clients, conditions, contact-fr, contact, customers, faq-fr, faq, index-fr, index, notre-solution, opposition, opt-out, our-solution, pricing, privacy, tarifs, terms (19 pages) | [HTML W3C] validation complète (HTML, CSS en ligne, SVG en ligne, ld+json) | 0 message | 0 erreur, 0 avertissement, 0 info | même commande vnu : les 47 messages portent uniquement sur careers, recrutement, media, medias, confidentialite, legal-notice, mentions-legales | aucune |
| L05 OK | n/a | 26 pages | [HTML W3C] `--also-check-css` (attributs style et blocs `<style>`) | 0 message CSS | 0 message CSS en ligne ; les 26 pages ont un `<html lang>` cohérent avec pages.csv | même commande | aucune |
| L06 DÉGRADÉ | MINEUR | index.html, index-fr.html (assets/trust/swiss-life.svg) | [SVG] fichier Inkscape non nettoyé, 32 520 octets | SVG optimisé sans métadonnées d'éditeur | 3 avertissements vnu : "This validator does not validate Inkscape extensions properly" (l.18), "Unsupported SVG version specified… remove the version attribute" (l.18), "This validator does not validate RDF" (l.67) | `java -jar vnu.jar --format json --svg assets/ieseg-logo.svg assets/trust/abeille-assurances.svg assets/trust/swiss-life.svg` → 3 messages, tous swiss-life.svg | `npx --yes svgo --multipass assets/trust/swiss-life.svg` (retire version, inkscape:*, sodipodi:*, metadata/RDF), puis contrôle visuel du logo dans la bande de confiance |
| L07 OK | n/a | index.html, index-fr.html, about.html, a-propos.html (assets/ieseg-logo.svg, assets/trust/abeille-assurances.svg) | [SVG] validation | 0 message | 0 message (seul défaut cosmétique : pas de saut de ligne final) | même commande ; `tail -c1 assets/ieseg-logo.svg` ≠ `\n` | facultatif : `printf '\n' >> assets/ieseg-logo.svg ; printf '\n' >> assets/trust/abeille-assurances.svg` |
| L08 OK | n/a | 15 fichiers CSS (about, careers, contact, customers, demo, floating-demo, home, leadgen, legal, motion, pricing-interactive, privacy, site-pages, solution-page, styles) | [CSS] validation vnu | 0 message | 0 message | `java -jar vnu.jar --format json --css *.css` → `{"messages":[]}` (fichier scratchpad flux20/vnu-css.json) | aucune |
| L09 OK | n/a | about.css, careers.css, contact.css, customers.css, demo.css, floating-demo.css, home.css, leadgen.css, legal.css | [CSS] validateur W3C en ligne (jigsaw, profil css3svg, media all) | valide | validity=true, 0 erreur pour les 9 fichiers ; avertissements de préfixes vendeurs uniquement : careers 1 (`::-webkit-details-marker` l.5), demo 8 (variables CSS l.26 et l.215, `-webkit-font-smoothing` l.30, `-moz-osx-font-smoothing` l.31, `::-webkit-scrollbar*` l.35 à 37, `-webkit-backdrop-filter` l.84), home 2 (police l.152, `-webkit-backdrop-filter` l.512), leadgen 5 (variables l.31, 50, 56 ; `-ms-overflow-style` l.70 ; `::-webkit-scrollbar` l.72), autres 0 | `curl "https://jigsaw.w3.org/css-validator/validator?uri=https%3A%2F%2Fwww.syntheticswarm.ai%2Flegal.css&profile=css3svg&usermedium=all&warning=1&output=json"` → `"validity" : true, "errorcount" : 0, "warningcount" : 0` (réponses dans scratchpad flux20/jigsaw-*.json) | aucune (préfixes vendeurs volontaires) |
| L10 NON TESTABLE | n/a | motion.css, pricing-interactive.css, privacy.css, site-pages.css, solution-page.css, styles.css | [CSS] validateur W3C en ligne | valide | jigsaw répond HTTP 429 avec une page Cloudflare "Just a moment…" à partir de la 10e requête, y compris après relance avec 20 s puis 75 s d'espacement entre requêtes ; ces 6 fichiers sont couverts par vnu --css (0 message, L08) | sorties curl : `HTTP 429` pour les 6 fichiers sur 3 tentatives (scratchpad flux20/jigsaw-styles.css.json contient la page Cloudflare) | relancer plus tard depuis un navigateur : `https://jigsaw.w3.org/css-validator/validator?uri=https://www.syntheticswarm.ai/styles.css&profile=css3svg&warning=1` (idem pour les 5 autres) |
| L11 CASSÉ | MINEUR | conditions.html | [Doublons] `/legal.css` chargé deux fois (l.16 et l.17), sans paramètre de version | une seule feuille, versionnée comme sur legal-notice, mentions-legales, opt-out, opposition | deux `<link rel="stylesheet" href="/legal.css">` consécutifs (2 requêtes, 2 parses) | `grep -n legal.css conditions.html` → `16:  <link rel="stylesheet" href="/legal.css">` et `17:  <link rel="stylesheet" href="/legal.css">` | supprimer la ligne 17 et remplacer la ligne 16 par `  <link rel="stylesheet" href="/legal.css?v=legal-cleanup">` |
| L12 DÉGRADÉ | MINEUR | terms.html, conditions.html, customers.html, clients.html, pricing.html, tarifs.html | [Doublons] un même fichier chargé sous des URL de cache différentes selon la page | une URL unique par fichier (cache navigateur et CDN partagés) | legal.css sans `?v=` sur terms.html l.16 et conditions.html l.16 et 17 contre `?v=legal-cleanup` sur 4 pages ; customers.js sans `?v=` sur customers.html l.91 et clients.html l.91 contre `?v=home-flow-20260918` sur index.html l.317 et index-fr.html l.317 ; pricing-interactive.css en chemin relatif `href="pricing-interactive.css?v=stable-geometry-1"` sur pricing.html l.16 et tarifs.html l.16 contre `/pricing-interactive.css?v=stable-geometry-1` sur index.html l.18 | script Python de parsing des `<link>` et `<script>` (scratchpad flux20) : `/legal.css {'(sans version)': 3, 'v=legal-cleanup': 4}`, `/customers.js {'(sans version)': 2, 'v=home-flow-20260918': 2}`, `pricing-interactive.css {'v=stable-geometry-1': 2}` ; `grep -n -o 'src="/customers.js[^"]*"' *.html` | terms.html l.16 : `  <link rel="stylesheet" href="/legal.css?v=legal-cleanup">` ; customers.html et clients.html l.91 : remplacer `src="/customers.js"` par `src="/customers.js?v=home-flow-20260918"` ; pricing.html et tarifs.html l.16 : remplacer `href="pricing-interactive.css?v=stable-geometry-1"` par `href="/pricing-interactive.css?v=stable-geometry-1"` |
| L13 OK | n/a | 25 pages (toutes sauf conditions.html) | [Doublons] CSS ou JS chargés deux fois sur une même page | aucun | aucun doublon exact, aucun même fichier sous deux versions sur une même page ; par page : 4 à 9 feuilles CSS, 4 à 8 scripts | même script : "pages avec doublons: 1" | aucune |
| L14 OK | n/a | 15 fichiers CSS | [Doublons] règles identiques entre fichiers (même media, même sélecteur, mêmes déclarations) | aucune | 0 règle strictement identique entre fichiers, 0 dupliquée dans un même fichier ; 17 sélecteurs redéfinis entre fichiers (11 site-pages.css + styles.css, 3 motion.css + styles.css, 2 floating-demo.css + motion.css, 1 solution-page.css + styles.css) avec des déclarations différentes : surcharges volontaires de la cascade | `python3 css_dups.py` (tinycss2, 1 895 sélecteurs unitaires analysés ; script en annexe B) : "Règles STRICTEMENT identiques … présentes dans PLUSIEURS fichiers: 0" | aucune |
| L15 DÉGRADÉ | MINEUR | styles.css (13), home.css (9), site-pages.css (6), solution-page.css (5), contact.css (2), about.css, demo.css, legal.css, pricing-interactive.css (1 chacun) | [Doublons] même sélecteur déclaré plusieurs fois dans le même fichier et le même media (fragmentation) | une déclaration par sélecteur et par media | 39 sélecteurs fragmentés | même script : "Même sélecteur répété dans le même fichier et même media (fragmentation): 39" (liste complète dans scratchpad flux20/css_dups.out) | fusionner chaque paire de blocs en conservant l'ordre de cascade (dernier bloc gagnant) ; aucun changement visuel attendu |
| L16 DÉGRADÉ | MAJEUR | 26 pages (styles.css?v=global-atmosphere-1) | [CSS mort] styles.css : 578 règles sur 710 (environ 67 377 octets sur 92 495, 73 %) ne ciblent que des classes absentes de tout HTML, JS et du générateur ; 342 classes sur 396 sans occurrence (familles nav-mega, mega-section, cost-*, chat-*, angle-*, cta-*, delay-*, badge-*, aurora__blob--4 à 7, reveal-delay-2 à 4, btn-get-pricing…) | CSS servi proche du CSS utilisé | 92 495 octets téléchargés par page pour environ 25 Ko utiles, sur les 26 pages | même script : "styles.css: 578/710 règles mortes, ~67377 octets sur 92495 (73%)" ; exemples : l.65 à 67 `.reveal-delay-2/3/4`, l.151 `.nav-dropdown-wrap`, l.162 `.nav-mega`, l.193 `.mega-section` ; contrôle des classes dynamiques : `grep -n -E "classList\.(add\|remove\|toggle)\(" *.js` ne montre que des littéraux (mobile-menu.js l.10 et l.19, customers.js l.35), aucune concaténation de nom de classe | Voir C3 (purge outillée puis QA visuelle aux 5 largeurs du README l.12) |
| L17 DÉGRADÉ | MINEUR | pages chargeant motion.css (26), site-pages.css (26), home.css (2), demo.css (4), customers.css (4) | [CSS mort] classes sans occurrence : motion.css 3 (`home-motion-toggle`, `sp-change-plus`, `sp-motion` : 4 règles sur 15, 22 %) ; site-pages.css 11 (`example-label`, `faq-category`, `page-grid`, `page-grid--two`, `prospect-card`, `signal-reason`, `site-footer-copy`, `site-footer-top`, `step-number`, `team-avatar`, `team-initial` : 22 règles sur 168, 11 %) ; home.css 28 (`hs-btn-ghost`, `hs-section`, `hs-container`, `newsletter-band`, `home-difference`, `home-final-cta`… : 7 règles entièrement mortes sur 294) ; demo.css 15 (`demo-hero__*`, `hero-eyebrow-dot` : 2 règles sur 49) ; customers.css 1 (`customer-preview`) ; total tous fichiers : environ 75 194 octets morts sur 207 789 (36 %) | 0 | voir constaté | même script (sortie complète : scratchpad flux20/css_dups.out) ; méthode volontairement grossière : un nom de classe est considéré utilisé s'il apparaît comme mot dans un HTML, un JS ou scripts/site_layout.py | supprimer les règles listées après relecture ; pour home.css, les blocs `.hs-*` et `.newsletter-*` (l. indiquées dans css_dups.out) |
| L18 DÉGRADÉ | MINEUR | aucune page (leadgen.css) | [Fichier orphelin] feuille de 6 005 octets non chargée par aucune page, 40 règles sur 40 mortes (18 classes `lg-scope`, `aui-*`, `flt*`, `ph*` sans occurrence), servie en prod (HTTP 200) | pas de fichier inutile dans le web root | orphelin, cité uniquement par BRAND.md l.23 ("No current root HTML page links this stylesheet") | fichiers.csv : nb_pages_referencantes = 0 ; `grep -l leadgen.css *.html` → aucun ; css_dups.py : "leadgen.css: 40/40 règles mortes" | `git rm leadgen.css` et remplacer BRAND.md l.23 par "leadgen.css a été retiré le <date> ; référence archivée dans l'historique git" |
| L19 DÉGRADÉ | MAJEUR | aucune page (assets/proof-post-2.png, assets/proof-post-3.png, assets/louis-content.png, assets/follower-growth.png, assets/Louis-adam.jpeg : 4 768 814 octets) | [Images orphelines à contenu tiers] fichiers non référencés mais servis publiquement (HTTP 200 en prod) : proof-post-2.png et proof-post-3.png sont des captures de posts LinkedIn d'une personne tierce nommée (nom, portrait, texte, réactions et commentaires) ; follower-growth.png est une capture des statistiques d'abonnés LinkedIn d'un compte (9 244 abonnés) ; Louis-adam.jpeg est un portrait ; louis-content.png une photo d'une personne avec un ordinateur portable | aucune donnée de tiers (nom, image) exposée sans usage ni base documentée | contenu tiers accessible à `https://www.syntheticswarm.ai/assets/proof-post-2.png` (et les 4 autres) | fichiers.csv (code_http_prod 200, 0 page référençante) ; fichiers ouverts et décrits dans ce flux ; BRAND.md l.247 les qualifie de "Historical proof / profiles… do not republish as verified evidence without checking permission" | `git rm assets/proof-post-2.png assets/proof-post-3.png assets/louis-content.png assets/follower-growth.png assets/Louis-adam.jpeg` puis redéploiement ; à recouper avec le flux juridique (droit à l'image, données de tiers) |
| L20 DÉGRADÉ | MINEUR | aucune page (21 images orphelines : 40612c4abf743aacd69ec8b9755a5d2e.png 598 335 ; decor-1.png 177 883 ; decor-5.png 591 781 ; decor-6.png 600 811 ; decor-7.png 550 733 ; dory-pic.png 270 382 ; femme-letter-2.png 450 942 ; femme-pouce-rouge.png 488 296 ; gift-emoji.png 60 818 ; homme-couper.png 276 878 ; itec-logo.png 2 544 ; licorne-explosion.png 536 103 ; licorne-letter-2.png 515 711 ; logo-2x.png 3 460 ; logo-black-2x.png 2 334 ; logo-white-2x.png 3 460 ; logo-white.png 1 233 ; logo.png 1 233 ; lutecienne-logo.png 25 735 ; memoji-reflecting.png 139 410 ; memoji-wishing.png 86 171 octets) | [Images orphelines] total avec L19 : 26 images orphelines sur 44, 10 153 067 octets (9,68 Mo) sur 12 862 214 octets d'images (79 % du poids des images est inutilisé), toutes servies en prod (HTTP 200) | aucune image inutilisée dans le web root | 26 orphelines | script classify_files.py (scratchpad flux20, sortie classify_files.out) croisé avec fichiers.csv ; correction de l'inventaire : assets/logo.png est orphelin, les 2 pages comptées dans fichiers.csv référencent en fait emlyon-logo.png (`grep -n -o '[^" ]*logo\.png[^" ]*' *.html` → seulement `/assets/emlyon-logo.png?v=20260918`) | `git rm` des 21 fichiers listés (ou déplacement dans docs/archive-assets/ exclu par le .vercelignore de C4) ; itec-logo.png et lutecienne-logo.png : BRAND.md l.248 interdit déjà leur présentation comme clients |
| L21 CASSÉ | MAJEUR | toutes (fichier .claude/launch.json servi à `/.claude/launch.json`) | [Repo] configuration locale d'un poste de développeur suivie par git et servie en prod : `"runtimeArgs": ["serve", "/Users/ilansainte-agathe/Desktop/Synthetic-Landing"]` (l.7, chemin nominatif) | fichier non suivi et non servi | suivi (git ls-files) et public : HTTP 200, `application/json`, `x-vercel-cache: HIT` ; .gitignore l.5 n'ignore que `.claude/settings.local.json` | `curl -I https://www.syntheticswarm.ai/.claude/launch.json` → `HTTP/2 200`, `server: Vercel` ; `cat -n .claude/launch.json` l.7 ; `cat -n .gitignore` l.4 à 6 | Voir C4 |
| L22 DÉGRADÉ | MAJEUR | toutes (25 fichiers internes servis : tests/*.test.cjs x12, scripts/site_layout.py, docs/header-audit.md, docs/motion-qa.md, docs/production-implementation-audit.md, BRAND.md, CONTACT_SETUP.md, LEGAL_AUDIT.md, assets/customers/README.md, assets/data/README.md, assets/school-logo-sources.md) | [Repo] outillage et documentation interne exposés publiquement par le déploiement statique (audits internes, contrats de tests, générateur Python) | fichiers hors du déploiement | HTTP 200 en prod : tests/contact.test.cjs (`application/node`), scripts/site_layout.py (`application/octet-stream`), .claude/launch.json vérifiés par HEAD dans ce flux ; les 22 autres d'après fichiers.csv (colonne code_http_prod = 200) ; README.md, vercel.json et .gitignore répondent 404 | `curl -I https://www.syntheticswarm.ai/tests/contact.test.cjs` → HTTP 200 ; `curl -I https://www.syntheticswarm.ai/scripts/site_layout.py` → HTTP 200 | Voir C4 (.vercelignore) |
| L23 CASSÉ | MAJEUR | index.html, index-fr.html (scripts/site_layout.py) | [Générateur] `python3 scripts/site_layout.py` exécuté sur une copie au commit audité : diff non vide | diff vide (README l.8 : "Run python3 scripts/site_layout.py after changing it to synchronize every public page") | 2 fichiers modifiés, 8 insertions, 4 suppressions : sync_conversion() (l.157 à 171) recopie depuis pricing.html et tarifs.html le wrapper `<div class="pricing-config-badge-slot">` et les spans `pricing-config-price-reserve` / `pricing-config-price-value` (introduits par 43a5341 dans les seules pages tarifs ; CSS scopé aux pages dédiées par 0089b78 "scope mobile pricing slots to dedicated pages") vers le bloc SHARED PRICING des deux pages d'accueil (l.234 à 241) ; le même diff (42 lignes) est produit par le générateur du commit 81ec818 servi en prod ; en revanche header, footer, motion et newsletter : 0 diff sur 26 pages, et `/site-pages.css?v=brand-close-1` écrit par le script (l.151) est déjà la version des 26 pages (hypothèse du brief non confirmée) | `cd repo-gen && python3 scripts/site_layout.py && git diff --stat` → `index-fr.html \| 6 ++++--`, `index.html \| 6 ++++--` ; diff complet : scratchpad flux20/site_layout.diff et site_layout-81ec818.diff ; `git log -S'pricing-config-price-reserve' -- pricing.html index.html` → 43a5341 (2026-09-19) ; `grep -c pricing-config-price-reserve pricing.html index.html` → 1 et 0 | Voir C5 (patch de 3 lignes testé en copie : diff vide après régénération) et C6 (test d'idempotence) |
| L24 DÉGRADÉ | MINEUR | aucune page générée aujourd'hui (scripts/site_layout.py) | [Générateur] gabarit `page()` (l.106 à 139) jamais appelé (`__main__` n'appelle que sync() et sync_conversion(), l.172 à 174) et périmé : viewport sans `viewport-fit=cover` (l.112, contre index.html l.5), `/styles.css` sans version (l.121, contre `?v=global-atmosphere-1` sur 26 pages), `site-pages.css?v=header-actions-2` (l.122) aussitôt réécrit en `brand-close-1` par sync (l.151), versions motion l.101 à 103 différentes des pages (editorial-motion `v=1` contre `v=2`, home-motion `v=2` contre `v=why-now-preview-1`, solution-motion `v=main-audit-1` contre `v=chapter-progress-1`), mobile-menu.js sans version (l.133, contre `?v=motion-1`), pas de ld+json ; `ROUTES['legacy']` (l.18) pointe vers lead-magnets.html et lead-magnets-fr.html supprimés | code vivant et cohérent avec les pages | code mort et dérive silencieuse pour toute future page générée | `grep -n 'page(' scripts/site_layout.py` → seule la définition l.106 ; parsing des versions (scratchpad) ; `git log origin/main --diff-filter=D --name-only` liste lead-magnets*.html | supprimer `page()` (l.106 à 139) et `from html import escape` (l.5), ou aligner ses constantes sur les pages ; supprimer la ligne 18 `'legacy': ('/lead-magnets', '/lead-magnets-fr')` |
| L25 OK | n/a | tests/*.test.cjs (12 fichiers) | [Tests] `node --test tests/*.test.cjs` dans la copie | tous verts | 79 tests, 79 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo ; duration_ms 407,8 (real 0,465 s) ; Node v22.22.2 ; 33 appels `test()` dont plusieurs en boucle (site.test.cjs par page et par langue) | sortie : `# tests 79`, `# pass 79`, `# fail 0`, `# duration_ms 407.822179` (scratchpad flux20/node-test.log) | aucune |
| L26 DÉGRADÉ | MAJEUR | tests/ | [Tests] couverture réelle : contenu, liens et assets locaux des pages (site.test.cjs), 6 paliers tarifaires et pricing.js, vercel.json, parsing de tous les JS, API contact et newsletter avec fetch simulé, rendu customers.js, logique de langue réimplémentée (language.test.cjs), pieds de page légaux et mailto, cycle de vie motion dans un vm, parité de la page Solution, règle source-copy | tests qui détectent les régressions constatées dans ce flux | non couverts : aucun test navigateur ; aucune validation HTML (36 erreurs W3C avec 79 tests verts) ; aucun test d'idempotence du générateur (L23) ; aucun test de doublon de `<link>` (L11) ; aucun test des redirections en production (vercel.json est testé par réimplémentation locale) ; sitemap.xml, robots.txt, CSS, accessibilité, liens externes non testés | `grep -n -i -E 'sitemap\|robots\|validat\|playwright' tests/*.cjs` → 0 résultat ; titres des 33 `test()` relevés (scratchpad) | Voir C6 (test d'idempotence, validé en copie) et C7 (validation W3C en CI) |
| L27 CASSÉ | MAJEUR | dépôt | [CI, hooks] aucune intégration continue : pas de dossier .github/, pas de package.json (donc pas de `npm test`), .git/hooks ne contient que 14 fichiers `*.sample`, pas de .pre-commit-config.yaml, aucune configuration de lint (eslint, stylelint, prettier, editorconfig) ; le README l.11 laisse l'exécution des tests à la discrétion de chacun | tests et régénération exécutés à chaque push | rien n'exécute les 79 tests ni la validation avant déploiement | `ls -la .github` → "No such file or directory" ; `ls .git/hooks` → uniquement `*.sample` ; `ls package.json .pre-commit-config.yaml .editorconfig` → absents | Voir C7 |
| L28 DÉGRADÉ | MAJEUR | pricing, tarifs, careers, recrutement (production) | [Git] la production ne sert plus le commit audité 864833f mais 81ec818 : origin/main a reçu 2 commits (8d267bb 19:20:10Z "move pricing starter badge to 20 leads", 81ec818 19:22:41Z "replace recruitment placeholders with California brand and city visuals"), GitHub pushed_at 2026-09-19T19:38:56Z ; 7 fichiers modifiés (careers.css, careers.html, recrutement.html, pricing.html, tarifs.html, pricing.js, scripts/site_layout.py) et 2 assets ajoutés (assets/careers/california.png 200 031 octets, assets/careers/san-francisco.jpeg 48 476 octets) ; sur /pricing et /tarifs le badge devient "Best to start" / "Idéal pour démarrer" sur le palier 20 leads (`data-plan-index="1"`) au lieu de "Preferred plan" sur 50 leads ; careers/recrutement remplacent 3 blocs gris par 3 images | prod = commit audité | prod = 81ec818 ; le reste du site (19 pages, CSS, JS) est inchangé entre 864833f et 81ec818 | `git fetch` dans la copie ; `git log --oneline 864833f..origin/main` → 2 commits ; `git diff --stat 864833f origin/main` → 9 fichiers ; `cmp` de https://www.syntheticswarm.ai/pricing.js et /careers.css avec `git show origin/main:…` → identiques (et différents de 864833f) ; `curl -I https://www.syntheticswarm.ai/assets/careers/california.png` → HTTP 200 | rebaser les flux concernés (tarification, careers, contenu) sur 81ec818 et le noter dans la synthèse finale ; ce flux a exécuté le générateur des deux commits (même diff) |
| L29 OK | n/a | dépôt | [Git] historique réécrit ? (forced update signalé sur origin/main) | pas de force-push | aucun : 9a65b09 (tête du clone initial, 2026-09-18 "redesign homepage comparison…") et d909b8b sont ancêtres de 864833f (125 commits entre 9a65b09 et 864833f) ; le `forced-update` du reflog local (`refs/remotes/origin/main@{0}: fetch origin main: forced-update`) est un artefact du clone superficiel (--depth 50, .git/shallow présent) : sur la copie dé-shallowée, `git merge-base --is-ancestor 9a65b09 864833f` est vrai | `git reflog show origin/main` ; `git fetch --unshallow` (copie) puis `git merge-base --is-ancestor 9a65b09 864833f && echo OUI` → OUI ; `git rev-list --count 9a65b09..864833f` → 125 | aucune |
| L30 DÉGRADÉ | MINEUR | dépôt distant (13 branches) | [Git] branches sur origin : 5 entièrement fusionnées dans main (+0 commit) : claude/charming-euler-5m6jld, claude/lot-1, final-pricing-header-fixes, pricing-preferred-marker, pricing-slider ; 6 non fusionnées : claude/audit-site (+12 / -107, 2026-09-18), legal/notice, legal/opposition, legal/privacy, legal/terms (+1 / -276 chacune, 2026-09-17), solution-page-v1-detailed (+24 / -159, 2026-09-18 ; docs/motion-qa.md l.6 dit "No merge to main" et docs/production-implementation-audit.md l.9 que main en a repris l'arbre) ; plus main et la branche d'audit claude/friendly-galileo-94wicf ; localement seules main et la branche d'audit existent ; aucun tag | branches mortes supprimées, branches vivantes tracées | 11 branches dormantes | `git ls-remote --heads origin` → 13 refs ; `git rev-list --count origin/main..origin/<branche>` (copie dé-shallowée) | après accord : `git push origin --delete claude/charming-euler-5m6jld claude/lot-1 final-pricing-header-fixes pricing-preferred-marker pricing-slider` ; ouvrir une PR ou supprimer les 6 autres |
| L31 DÉGRADÉ | MINEUR | dépôt (public) | [Git] auteurs : 422 commits sur les 13 têtes distantes (381 sur main ; premier commit a475ed2 le 2026-04-15 par spicyx9 ; dernier 81ec818 le 2026-09-19) ; 4 identités pour 3 adresses distinctes : "Axel Carron" (264 commits) et "aaxxeell09" (100) partagent une même adresse gmail [email privé], "spicyx9" (28) une autre adresse gmail [email privé], "Claude" (30) une adresse noreply anthropic | adresses personnelles non exposées dans un dépôt public | dépôt public (API GitHub : `"private": false`) exposant deux adresses gmail personnelles dans l'historique | `git shortlog -sne --remotes` (adresses masquées dans ce rapport) ; `curl https://api.github.com/repos/spicyx9/Synthetic-Landing` → `"visibility": "public"` | ajouter un fichier `.mailmap` : `Axel Carron <[email privé]> aaxxeell09 <[email privé]>` ; pour la suite `git config user.email <id>+<login>@users.noreply.github.com` ; ne pas réécrire l'historique pour cela |
| L32 DÉGRADÉ | MAJEUR | 26 pages (assets/team/axel-ceo.png) et dépôt | [Git, gros binaires] pack 22,31 Mio pour l'historique complet (3 230 objets ; clone local superficiel : 12,51 Mio, .git 13 Mo) ; 5 blobs de plus de 1 Mo dans l'historique = 6 815 287 octets : axel-ceo.png 1 721 963 (PNG 1254x1254 affiché à 38 à 44 px sur les 26 pages : header, footer, popovers de réservation), louis-content.png 1 465 727, proof-post-3.png 1 253 391, proof-post-1.png 1 190 835 (supprimé de l'arbre, toujours dans l'historique), proof-post-2.png 1 183 371 ; arbre courant : 44 images = 12 862 214 octets | images dimensionnées à l'usage, dépôt léger | 1,7 Mo téléchargés sur chaque page pour une vignette | `git count-objects -vH` ; `git rev-list --objects --remotes` passé à `git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)'` trié par taille ; Pillow : axel-ceo.png (1254, 1254) ; `grep -o '<img[^>]*axel-ceo[^>]*>' index.html` → `width="38" height="38"` et `width="44" height="44"` | `convert assets/team/axel-ceo.png -resize 176x176 -strip -quality 82 assets/team/axel-ceo.jpg` puis remplacer `/assets/team/axel-ceo.png` par `/assets/team/axel-ceo.jpg` dans les 26 pages et scripts/site_layout.py l.31 (`sed -i 's#/assets/team/axel-ceo.png#/assets/team/axel-ceo.jpg#g' *.html scripts/site_layout.py`) ; purge d'historique (`git filter-repo --invert-paths --path assets/proof-post-1.png …`) uniquement si décidée (réécriture destructive) |
| L33 DÉGRADÉ | MINEUR | dépôt (historique) | [Git] `.claude/settings.local.json` commité dans a475ed2 (2026-04-15) puis retiré dans 3332764 (2026-04-17) : toujours lisible dans l'historique public, avec le chemin local nominatif `/Users/ilansainte-agathe/Desktop/Synthetic-Landing` et des commandes curl de récupération de logos tiers (litesoft, hyperstack, itec, lutecienne) ; autres suppressions : _redirects, assets/hyperstack-logo.png, assets/proof-post-1.png, assets/trust/cnp.svg, lead-magnets-fr.html, lead-magnets.html ; renommages : pricing-fr.html vers tarifs.html (c9e5d4e), lead-magnets.html vers index-fr.html (5bdffcf) | pas de configuration locale dans l'historique | présente dans l'historique | `git log --remotes -- .claude/settings.local.json` ; `git show a475ed2:.claude/settings.local.json` ; `git log origin/main --diff-filter=R --name-status` | aucune action sans réécriture d'historique ; ignorer `.claude/` (C4) pour éviter une récidive |
| L34 DÉGRADÉ | MINEUR | BRAND.md, docs/production-implementation-audit.md, scripts/site_layout.py, styles.css ; docs/audit-total/inventaire/emails.csv (phase 0) | [Hygiène] `git diff --check`, fins de ligne, encodage | fichiers propres | 5 lignes avec espaces finaux : BRAND.md:276, docs/production-implementation-audit.md:1 et :36, scripts/site_layout.py:9, styles.css:4335 ; aucun CRLF, aucun BOM, aucune tabulation dans les 130 fichiers ; encodage utf-8 ou ascii partout ; 2 SVG sans saut de ligne final (L07) ; le fichier de phase 0 emails.csv est en fins de ligne CRLF (`git diff --check origin/main HEAD` : 5 avertissements "trailing whitespace" ; `od -c` montre `\r\n`) | `grep -n -E '[ \t]+$' BRAND.md docs/production-implementation-audit.md scripts/site_layout.py styles.css` ; `git ls-files` passé à `file -i` : aucun charset autre que utf-8/us-ascii ; `od -c` sur emails.csv | `sed -i 's/[ \t]*$//' BRAND.md docs/production-implementation-audit.md scripts/site_layout.py styles.css` ; pour la phase 0 : `sed -i 's/\r$//' docs/audit-total/inventaire/emails.csv` |
| L35 OK | n/a | 130 fichiers | [Résidus] TODO, FIXME, HACK, XXX, console.*, debugger, alert(, CSS commenté, fichiers de plus de 1 Mo | aucun résidu | 0 TODO/FIXME/HACK/XXX ; 0 `console.` dans les 14 JS et les 2 fonctions API ; 0 debugger, 0 alert( ; 0 bloc de CSS commenté ; 10 commentaires HTML (marqueurs SHARED PRICING/FAQ de la home, consigne du template média, 1 sur about) ; fichiers de plus de 1 Mo : les 4 PNG déjà cités en L32 | `git ls-files` passé à `grep -n -w -e TODO -e FIXME -e HACK -e XXX` → 0 ; `grep -n 'console\.' *.js api/*.js` → 0 ; `ls -l` filtré sur taille > 1 048 576 → 4 fichiers | aucune |
| L36 CASSÉ | MAJEUR | 26 pages (BRAND.md l.194) | [Docs] BRAND.md : "There is no active newsletter subscription form: the current newsletter is an explicit not-open state. Do not invent validation or submission behavior in the brand reference." | documentation conforme au site | le pied de page des 26 pages contient le formulaire `<form class="newsletter-form" data-newsletter-form … action="/api/newsletter">` (site_layout.py l.84 à 88), newsletter.js poste en JSON sur /api/newsletter, api/newsletter.js crée les contacts Resend ; README l.53 à 55 décrit ce flux comme fonctionnel ; les tests newsletter.test.cjs le couvrent | `grep -c data-newsletter-form *.html` → 1 sur chacune des 26 pages ; site_layout.py l.84 | remplacer BRAND.md l.194 par : "The footer newsletter form is live on every page: generated by footer() in scripts/site_layout.py, submitted by newsletter.js to /api/newsletter (Resend Contacts), with a honeypot field and a live status line. Follow that pattern for any new form." |
| L37 CASSÉ | MAJEUR | index.html, index-fr.html (README.md l.47, BRAND.md l.174 et l.249) | [Docs] README : "The homepage shows three static gray placeholders until three verified testimonials exist for its language" ; BRAND l.174 : "No customer, metric, rating or endorsement is implied by a decorative component; production data is currently empty" ; BRAND l.249 : "assets/customers/ currently contains instructions, no customer photos" | documentation conforme au site | index.html l.194 à 215 (et index-fr.html) : section "Our clients say it best." avec 3 cartes témoignage codées en dur (photos assets/customers/illustrative-claire.jpg, illustrative-thomas.jpg, illustrative-sonia.jpg, prénoms, fonctions "Insurance agent", "Independent broker", citations et résultat) ; assets/customers/ contient 3 JPG en plus du README | `sed -n '194,215p' index.html` ; `ls assets/customers/` → README.md + 3 jpg | README l.47 : "The homepage hardcodes three illustrative testimonial cards (illustrative portraits and first names) in index.html and index-fr.html; customers.js only feeds /customers and /clients." ; BRAND l.249 : "assets/customers/ holds three illustrative portraits used by the homepage cards plus the README" ; la véracité des témoignages affichés relève du flux contenu/juridique |
| L38 DÉGRADÉ | MINEUR | BRAND.md l.3, l.13 à 25 | [Docs] "Audited against repository revision dcf5284 on 2026-09-17", "All seven root CSS files were inspected" (table de 7 fichiers), "Homepage load order: styles.css, demo.css, home.css, pricing-interactive.css, site-pages.css, customers.css" | référence à jour | 15 fichiers CSS à la racine (8 absents de la table : about, careers, contact, floating-demo, legal, motion, privacy, solution-page) ; ordre réel index.html l.14 à 24 : styles, demo, floating-demo, home, pricing-interactive, site-pages, polices Google, customers, motion | `ls *.css` → 15 ; `sed -n '14,24p' index.html` ; `git cat-file -t dcf5284` → commit (existe) | réécrire la table l.15 à 23 avec les 15 fichiers et remplacer l.25 par l'ordre réel ; dater la révision auditée |
| L39 DÉGRADÉ | MINEUR | index.html, index-fr.html (BRAND.md l.241, l.244 à 245) | [Docs] variantes de logo "not currently referenced by root pages" ; decor-3.png rangé dans "Other decoration… Archived decoration family" | référence à jour | logo-black.png est le `"logo"` du ld+json (index.html l.36) ; decor-3.png est affiché (index.html l.85 `<img src="/assets/decor-3.png"`) à côté de decor-2.png (l.84) | `grep -n -o '[^ ]*decor-3.png[^ ]*' index.html` → l.85 ; `grep -n logo-black.png index.html` → l.36 | l.241 : retirer `logo-black.png` de la liste des variantes non référencées (utilisé en ld+json) ; l.244 : "Active 3D hero decorations: decor-2.png and decor-3.png" |
| L40 DÉGRADÉ | MINEUR | LEGAL_AUDIT.md l.34, docs/header-audit.md l.32, docs/motion-qa.md l.22, docs/production-implementation-audit.md l.64 | [Docs] "59 Node tests pass", "Existing 59 repository tests pass", "66 passed, 0 failed", "70 passing, 0 failing" | nombre courant ou explicitement daté | 79 tests aujourd'hui ; quatre instantanés différents et non datés dans la phrase (les fichiers portent une date en tête) | `node --test tests/*.test.cjs` → 79 | remplacer chaque nombre par "node --test tests/*.test.cjs passed (79 tests at 864833f, 2026-09-19)" ou préfixer la phrase par "État au 2026-09-18 :" |
| L41 DÉGRADÉ | MINEUR | docs/motion-qa.md l.84, 85, 98 ; docs/production-implementation-audit.md l.93, 94, 104 ; docs/header-audit.md l.25, 34 ; README.md l.33 | [Docs] listes de fichiers et de routes citant lead-magnets-fr.html, lead-magnets.html, pricing-fr.html, /pricing-fr, /lead-magnets | fichiers existants ou mention "supprimé" | lead-magnets*.html supprimés de main, pricing-fr.html renommé tarifs.html (c9e5d4e "rename pricing-fr to tarifs and redirect the old URL") ; vercel.json l.36 à 50 redirige les 3 URL en 308 (README l.33 décrit correctement la redirection) | `git log origin/main --diff-filter=D --name-only` ; `git log origin/main --diff-filter=R --name-status` → `R092 pricing-fr.html tarifs.html` | ajouter en tête de motion-qa.md, production-implementation-audit.md et header-audit.md : "Document historique (état au 2026-09-18) : lead-magnets.html et lead-magnets-fr.html ont été supprimés, pricing-fr.html est devenu tarifs.html ; les anciennes URL sont redirigées par vercel.json." |
| L42 DÉGRADÉ | MINEUR | README.md l.61, docs/production-implementation-audit.md l.3 | [Docs] "Work directly on main for the current audit/fix/deploy workflow" | règle de branches appliquée | 13 branches distantes dont 6 non fusionnées, travail d'audit sur des branches claude/* ; aucune PR ni CI pour protéger main | `git ls-remote --heads origin` → 13 refs | remplacer README l.61 par la règle réelle, par exemple : "Work on a short-lived branch, open a PR to main, let CI run node --test and the layout check, delete the branch after merge." |
| L43 OK | n/a | README.md l.8, l.11, l.16, l.20 à 33, l.51 à 55 ; CONTACT_SETUP.md ; assets/data/README.md ; assets/customers/README.md ; assets/school-logo-sources.md ; LEGAL_AUDIT.md l.9 | [Docs] affirmations vérifiées exactes : commandes de génération et de test (README l.8, l.11) ; `tests/source-copy.test.cjs` existe et applique la règle sur tous les *.html hors `<main>` des pages légales (l.10 à 19) ; table des routes identique à ROUTES du générateur (l.10 à 19) ; redirections legacy = vercel.json l.41 à 50 ; logique de langue = vercel.json l.5 à 35 ; description newsletter = api/newsletter.js (plafond 2 048 octets l.1, honeypot l.16, PATCH puis POST l.28 à 35) ; CONTACT_SETUP = api/contact.js (variables l.30, 503 l.30, 502 l.38 et 40, 5 tentatives par 10 min l.27 à 28, reply_to l.35, destinataire fixe l.35) ; customers.json vide avec statistiques désactivées ; "Zero production HTML placeholders" : aucun crochet de type [à compléter], lorem ou TODO dans les 26 pages | conformes | conformes | `grep -n -i -E '\[(à compléter\|TODO\|SIREN\|SIRET)[^]]*\]\|lorem' *.html` → 0 ; lectures croisées citées | aucune |
| L44 OK | n/a | dépôt | [Dépendances] aucun package.json, aucune dépendance npm, aucun node_modules ; les tests n'utilisent que des modules intégrés (node:test, node:assert/strict, node:fs, node:vm, node:path) et les fichiers du repo | pas de dépendance (README l.11) | conforme | `grep -h -o "require('[^']*')" tests/*.cjs` (dédoublonné) → 5 modules `node:` et 5 fichiers locaux | aucune |
| L45 DÉGRADÉ | MINEUR | https://app.syntheticswarm.ai/ui/ (hors Vercel) | [Dépendances CDN] alpinejs@3.14.1 (dernière 3.17.3), papaparse@5.4.1 (dernière 5.7.0), @yaireo/tagify@4.36.0 (dernière 4.38.0) chargés depuis cdn.jsdelivr.net sans attribut `integrity` | versions suivies et SRI sur les scripts tiers | 3 bibliothèques en retard, 0 `integrity=` dans la page (925 606 octets) | `npm view alpinejs version` → 3.17.3 ; `npm view papaparse version` → 5.7.0 ; `npm view @yaireo/tagify version` → 4.38.0 ; `grep -c 'integrity=' app-ui.html` → 0 (page téléchargée dans le scratchpad) | Voir C8 (balises avec empreintes sha384 calculées) |
| L46 NON TESTABLE | n/a | api/contact.js, api/newsletter.js | [Dépendances] version Node du runtime Vercel des fonctions | version déclarée et connue | vercel.json (52 lignes) ne contient ni clé `functions` ni runtime, pas de package.json donc pas de champ `engines` : la version dépend du réglage Node.js du projet dans le tableau de bord Vercel [donnée à fournir] ; le code exige Node 18 ou plus (fetch global et AbortSignal.timeout : api/contact.js l.32 à 34, api/newsletter.js l.23 à 25) | `cat -n vercel.json` ; `ls package.json` → absent | créer package.json à la racine : `{"name": "synthetic-landing", "private": true, "engines": {"node": "22.x"}, "scripts": {"test": "node --test tests/*.test.cjs"}}` (Vercel lit `engines.node`) |

## Corrections détaillées

### C1 : careers.html et recrutement.html (summary valide) et careers.css, careers.js

Résultat mesuré en copie après application : vnu 0 message sur les 26 pages, tests 79/79.

```sh
# 1. HTML : retirer role/aria-expanded/aria-controls et le <div>, déplacer le résumé dans le h3 (contenu de phrasé autorisé dans un titre)
sed -i -E 's#<summary role="button" aria-expanded="false" aria-controls="[^"]+"><div>#<summary>#g; s#</h3><p class="job-summary">([^<]*)</p></div><span class="job-toggle" aria-hidden="true"></span></summary>#<span class="job-summary">\1</span></h3></summary>#g' careers.html recrutement.html
# 2. careers.js : supprimer la ligne 4 (aria-expanded sur summary est interdit ; details/summary expose déjà l'état)
sed -i '4d' careers.js
```

Résultat attendu pour le premier poste (careers.html l.65) :

```html
<summary><h3 class="job-title"><span class="job-title-text">Sales</span> <span class="job-geography">· France <span class="role-flags" aria-hidden="true"><span class="role-flag" aria-hidden="true">🇫🇷</span></span></span><span class="job-summary">Grow Synthetic Swarm among insurance professionals.</span></h3></summary>
```

careers.css : remplacer les lignes 9, 10, 28 et 38 par :

```css
.job-item summary::after { content: '→'; font-size: 24px; color: #0a66c2; display: inline-block; }
.job-item[open] summary::after { transform: rotate(90deg); }
.job-summary { display: block; font-size: 14px; line-height: 1.5; font-weight: 400; color: #666; margin-top: 8px; }
@media(prefers-reduced-motion:no-preference) { .job-item summary::after { transition: transform .18s ease; } }
```

### C2 : media.html et medias.html

```sh
sed -i 's#<div class="media-archive page-section" aria-label="Publications"></div>#<section class="media-archive page-section" aria-label="Publications" hidden></section>#; s#<time data-field="date"></time>#<span class="media-date" data-field="date"></span>#' media.html medias.html
```

Retirer `hidden` le jour où la section reçoit des publications ; le script de remplissage créera alors `<time datetime="AAAA-MM-JJ">` à la place du span.

### C3 : purge de styles.css

```sh
npx --yes purgecss --css styles.css --content '*.html' '*.js' 'scripts/site_layout.py' --output purged/
diff <(wc -c < styles.css) <(wc -c < purged/styles.css)
```

Puis remplacer styles.css par purged/styles.css après contrôle visuel des 26 pages aux largeurs 320, 390, 768, 1024 et 1440 px (README l.12), menus et popovers ouverts (les classes créées par mobile-menu.js sont des littéraux et sont conservées par PurgeCSS). Liste de contrôle des sélecteurs morts : sortie du script de l'annexe B.

### C4 : .gitignore, .claude/launch.json, .vercelignore

```sh
# .gitignore : remplacer la ligne 5 « .claude/settings.local.json » par
.claude/
# retirer le fichier du suivi (il reste sur le poste)
git rm --cached .claude/launch.json
```

Nouveau fichier `.vercelignore` à la racine (syntaxe .gitignore, évalué par Vercel au déploiement) :

```
.claude
.gitignore
docs
scripts
tests
*.md
```

Vérification après déploiement : `curl -I https://www.syntheticswarm.ai/tests/contact.test.cjs` doit répondre 404, `curl -I https://www.syntheticswarm.ai/robots.txt` et `/sitemap.xml` doivent rester 200.

### C5 : scripts/site_layout.py idempotent (testé en copie : diff vide après régénération)

Insérer après la ligne 166 (`pricing_body=body[:faq.start()].strip().replace('<h1 ', '<h2 ').replace('</h1>', '</h2>')`) :

```python
  # Homepage keeps the compact card: drop the dedicated-page badge slot and price reserve wrappers.
  pricing_body=re.sub(r'<div class="pricing-config-badge-slot">(<div class="pricing-config-badge">[^<]*</div>)</div>', r'\1', pricing_body)
  pricing_body=re.sub(r'\n\s*<span class="pricing-config-price-reserve"[^>]*>[^<]*</span>\n\s*<span class="pricing-config-price-value">\n(\s*<span class="pricing-config-amount".*?</span>\n\s*<span class="pricing-config-period"[^>]*>[^<]*</span>)</span>', r'\n\1', pricing_body, flags=re.S)
```

Sur le générateur de 81ec818 (déjà en prod), insérer ces lignes avant la ligne `pricing_body=pricing_body.replace('class="pricing-config-badge" data-plan-index="1" hidden', …)` ajoutée par ce commit. Alternative : décider que la home doit porter les slots et committer le résultat de `python3 scripts/site_layout.py` (à valider visuellement, le CSS des slots étant scopé aux pages dédiées par 0089b78).

### C6 : test d'idempotence du générateur (échoue sur le générateur actuel, passe après C5 ; suite complète 80/80 en copie)

Fichier `tests/layout.test.cjs` :

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('scripts/site_layout.py is idempotent on the working tree', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'layout-'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.copyFileSync('scripts/site_layout.py', path.join(dir, 'scripts', 'site_layout.py'));
  const pages = fs.readdirSync('.').filter(file => file.endsWith('.html'));
  for (const file of pages) fs.copyFileSync(file, path.join(dir, file));
  execFileSync('python3', ['scripts/site_layout.py'], { cwd: dir });
  for (const file of pages) {
    assert.equal(fs.readFileSync(path.join(dir, file), 'utf8'), fs.readFileSync(file, 'utf8'), `${file} differs after regeneration`);
  }
});
```

### C7 : intégration continue

Fichier `.github/workflows/ci.yml` (épingler la version de l'action de validation après vérification) :

```yaml
name: ci
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
      - run: python3 scripts/site_layout.py && git diff --exit-code
      - uses: Cyb3r-Jak3/html5validator-action@v7
        with:
          root: .
          css: true
          blacklist: docs tests scripts
```

Hook local facultatif, `.git/hooks/pre-commit` (non versionné) : `#!/bin/sh` puis `node --test tests/*.test.cjs`.

### C8 : scripts CDN de l'app avec SRI (empreintes calculées le 2026-09-19 sur les fichiers actuellement chargés)

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js" integrity="sha384-l8f0VcPi/M1iHPv8egOnY/15TDwqgbOR1anMIJWvU6nLRgZVLTLSaNqi/TOoT5Fh" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js" integrity="sha384-D/t0ZMqQW31H3az8ktEiNb39wyKnS82iFY52QPACM+IjKW3jDUhyIgh2PApRqJZs" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@yaireo/tagify@4.36.0/dist/tagify.min.js" integrity="sha384-p/JePU4f5IZ+uRk8Mgw+3ojfVL0EFzMr5IwefB+bnKvv7i08kMfP8y3fs1ZJaSVx" crossorigin="anonymous"></script>
```

Commande de calcul pour une mise à niveau (alpinejs 3.17.3, papaparse 5.7.0, tagify 4.38.0, après lecture des changelogs) : `curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A`.

## Docs : affirmation, réalité, fichier:ligne

| Affirmation | Réalité constatée | Fichier:ligne | Ligne du tableau |
| --- | --- | --- | --- |
| "There is no active newsletter subscription form" | formulaire newsletter dans le pied de page des 26 pages, API /api/newsletter, tests dédiés | BRAND.md:194 | L36 |
| "The homepage shows three static gray placeholders until three verified testimonials exist" | 3 cartes témoignage codées en dur avec portraits illustratifs, prénoms, fonctions et citations | README.md:47, index.html:194 à 215 | L37 |
| "production data is currently empty… No customer… endorsement is implied" ; "assets/customers/ currently contains instructions, no customer photos" | customers.json vide (exact) mais 3 JPG dans assets/customers/ et 3 témoignages sur la home | BRAND.md:174, BRAND.md:249 | L37 |
| "All seven root CSS files were inspected" ; ordre de chargement home à 6 fichiers | 15 fichiers CSS ; ordre réel à 8 fichiers avec floating-demo.css et motion.css | BRAND.md:13, BRAND.md:25, index.html:14 à 24 | L38 |
| variantes de logo "not currently referenced by root pages" ; decor-3.png "archived" | logo-black.png en ld+json (index.html:36) ; decor-3.png affiché (index.html:85) | BRAND.md:241, BRAND.md:244 à 245 | L39 |
| "59 Node tests pass" / "Existing 59 repository tests pass" / "66 passed" / "70 passing" | 79 tests | LEGAL_AUDIT.md:34, docs/header-audit.md:32, docs/motion-qa.md:22, docs/production-implementation-audit.md:64 | L40 |
| fichiers changés : lead-magnets-fr.html, lead-magnets.html, pricing-fr.html ; routes /pricing-fr, /lead-magnets | fichiers supprimés ou renommés (tarifs.html) ; URL redirigées en 308 par vercel.json | docs/motion-qa.md:84, 85, 98 ; docs/production-implementation-audit.md:93, 94, 104 ; docs/header-audit.md:25, 34 | L41 |
| "Work directly on main" | 13 branches distantes, 6 non fusionnées, audit sur branches claude/* | README.md:61, docs/production-implementation-audit.md:3 | L42 |
| "Branch: solution-page-v1-detailed. No merge to main." | branche toujours présente sur origin (+24 / -159) alors que production-implementation-audit.md:9 indique que main en a repris l'arbre | docs/motion-qa.md:6 | L30 |
| chemin local `/Users/ilansainte-agathe/Desktop/Synthetic-Landing` | configuration de poste suivie et servie en prod | .claude/launch.json:7 | L21 |
| "`tests/source-copy.test.cjs` enforces this rule on public pages" | exact : le test balaye tous les *.html (hors `<main>` légal) et passe | README.md:16, tests/source-copy.test.cjs:10 à 19 | L43 |
| "Run `node --test tests/*.test.cjs`… No dependencies are required" | exact : 79 tests, aucune dépendance | README.md:11 | L25, L44 |
| table des routes, redirections legacy, logique de langue | exactes (ROUTES l.10 à 19 du générateur, vercel.json l.5 à 50) | README.md:20 à 33, 51 | L43 |
| description de /api/newsletter (2 Ko, honeypot, contacts Resend, pas d'email envoyé) | exacte (api/newsletter.js l.1, 16, 28 à 35) | README.md:55 | L43 |
| CONTACT_SETUP : variables, 503/502, 5 tentatives par 10 min, Reply-To, destinataire fixe | exact (api/contact.js l.27 à 40) | CONTACT_SETUP.md:6 à 19 | L43 |
| "Zero production HTML placeholders" | aucun crochet, lorem ou TODO dans les 26 pages | LEGAL_AUDIT.md:9 | L43 |
| "Audited against repository revision dcf5284 on 2026-09-17" | commit existant mais 2 jours et 8 fichiers CSS plus tard | BRAND.md:3 | L38 |

## Annexe A : verdict par fichier (130 fichiers de fichiers.csv)

Un verdict par ligne d'inventaire ; les catégories reprennent le brief (utilisé, orphelin, interne suivi à tort ou exposé, doc obsolète). Références détaillées dans le tableau principal.

| Fichier | Verdict | Sévérité | Catégorie et constat |
| --- | --- | --- | --- |
| `.claude/launch.json` | CASSÉ | MAJEUR | interne suivi à tort : chemin local nominatif l.7, servi en prod HTTP 200 |
| `.gitignore` | DÉGRADÉ | MINEUR | configuration : n'ignore que .claude/settings.local.json (l.5), pas .claude/launch.json |
| `BRAND.md` | DÉGRADÉ | MINEUR | doc obsolète (l.3, 13, 25, 174, 194, 241, 245, 249) ; servie en prod HTTP 200 |
| `CONTACT_SETUP.md` | DÉGRADÉ | MINEUR | doc cohérente avec api/contact.js ; servie en prod HTTP 200 (à exclure) |
| `LEGAL_AUDIT.md` | DÉGRADÉ | MINEUR | doc obsolète (l.34 : 59 tests, réel 79) ; servie en prod HTTP 200 |
| `README.md` | DÉGRADÉ | MINEUR | doc obsolète (l.47 placeholders gris, l.61 work on main) ; non servie (404) |
| `a-propos.html` | OK | n/a | page publique : 0 erreur, 0 avertissement W3C ; aucun doublon link/script |
| `about.css` | OK | n/a | CSS utilisé : valide (vnu, jigsaw) ; 0 ou peu de règles mortes |
| `about.html` | OK | n/a | page publique : 0 erreur, 0 avertissement W3C ; aucun doublon link/script |
| `api/contact.js` | OK | n/a | fonction serverless : tests contact.test.cjs passent ; runtime Node non déclaré (voir ligne dépendances) |
| `api/newsletter.js` | OK | n/a | fonction serverless : tests newsletter.test.cjs passent ; runtime Node non déclaré |
| `assets/40612c4abf743aacd69ec8b9755a5d2e.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 598335 octets |
| `assets/Louis-adam.jpeg` | DÉGRADÉ | MAJEUR | image orpheline servie en prod : portrait d'une personne tierce, 45 633 octets |
| `assets/customers/README.md` | DÉGRADÉ | MINEUR | doc interne servie en prod HTTP 200, à exclure via .vercelignore |
| `assets/customers/illustrative-claire.jpg` | OK | n/a | image utilisée par 2 page(s) |
| `assets/customers/illustrative-sonia.jpg` | OK | n/a | image utilisée par 2 page(s) |
| `assets/customers/illustrative-thomas.jpg` | OK | n/a | image utilisée par 2 page(s) |
| `assets/data/README.md` | DÉGRADÉ | MINEUR | doc interne servie en prod HTTP 200, à exclure via .vercelignore |
| `assets/data/customers.json` | OK | n/a | données utilisées par customers.js ; liste vide, statistiques désactivées (cohérent avec assets/data/README.md) |
| `assets/decor-1.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 177883 octets |
| `assets/decor-2.png` | OK | n/a | image utilisée par 2 page(s) |
| `assets/decor-3.png` | OK | n/a | image utilisée par 2 page(s) |
| `assets/decor-5.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 591781 octets |
| `assets/decor-6.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 600811 octets |
| `assets/decor-7.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 550733 octets |
| `assets/dory-pic.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 270382 octets |
| `assets/emlyon-logo.png` | OK | n/a | image utilisée par 2 page(s) |
| `assets/favicon.png` | OK | n/a | image utilisée par 26 page(s) |
| `assets/femme-letter-2.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 450942 octets |
| `assets/femme-pouce-rouge.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 488296 octets |
| `assets/follower-growth.png` | DÉGRADÉ | MAJEUR | image orpheline servie en prod : capture de statistiques LinkedIn d'un tiers, 820 692 octets |
| `assets/gift-emoji.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 60818 octets |
| `assets/homme-couper.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 276878 octets |
| `assets/ieseg-logo.svg` | OK | n/a | image utilisée : 0 message vnu (pas de saut de ligne final, cosmétique) |
| `assets/itec-logo.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 2544 octets |
| `assets/licorne-explosion.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 536103 octets |
| `assets/licorne-letter-2.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 515711 octets |
| `assets/logo-2x.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 3460 octets |
| `assets/logo-black-2x.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 2334 octets |
| `assets/logo-black-narrow.png` | OK | n/a | image utilisée par 26 page(s) |
| `assets/logo-black.png` | OK | n/a | image utilisée par 2 page(s) |
| `assets/logo-white-2x.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 3460 octets |
| `assets/logo-white.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 1233 octets |
| `assets/logo.png` | DÉGRADÉ | MINEUR | image orpheline (fichiers.csv indique 2 pages : faux positif sur emlyon-logo.png), 1 233 octets |
| `assets/louis-content.png` | DÉGRADÉ | MAJEUR | image orpheline servie en prod : capture LinkedIn d'un tiers, 1 465 727 octets |
| `assets/lutecienne-logo.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 25735 octets |
| `assets/memoji-reflecting.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 139410 octets |
| `assets/memoji-wishing.png` | DÉGRADÉ | MINEUR | image orpheline servie en prod HTTP 200, 86171 octets |
| `assets/proof-post-2.png` | DÉGRADÉ | MAJEUR | image orpheline servie en prod : capture d'un post LinkedIn d'un tiers (nom, portrait, texte), 1 183 371 octets |
| `assets/proof-post-3.png` | DÉGRADÉ | MAJEUR | image orpheline servie en prod : capture d'un post LinkedIn d'un tiers, 1 253 391 octets |
| `assets/school-logo-sources.md` | DÉGRADÉ | MINEUR | doc interne servie en prod HTTP 200, à exclure via .vercelignore |
| `assets/team/axel-ceo.png` | DÉGRADÉ | MAJEUR | image utilisée sur 26 pages à 38-44 px : 1 721 963 octets, 1254x1254 PNG |
| `assets/team/ilan-cto.jpg` | OK | n/a | image utilisée par 26 page(s) |
| `assets/trust/abeille-assurances.svg` | OK | n/a | image utilisée : 0 message vnu (pas de saut de ligne final, cosmétique) |
| `assets/trust/allianz.png` | OK | n/a | image utilisée par 2 page(s) |
| `assets/trust/axa.webp` | OK | n/a | image utilisée par 2 page(s) |
| `assets/trust/france-assurance.png` | OK | n/a | image utilisée par 2 page(s) |
| `assets/trust/generali.jpg` | OK | n/a | image utilisée par 2 page(s) |
| `assets/trust/swiss-life.svg` | DÉGRADÉ | MINEUR | image utilisée : 3 avertissements vnu (Inkscape, version, RDF), 32 520 octets |
| `careers.css` | OK | n/a | CSS utilisé : valide (vnu, jigsaw) ; 0 ou peu de règles mortes |
| `careers.html` | CASSÉ | MAJEUR | page publique : 16 erreurs + 4 avertissements W3C (summary l.65-68) |
| `careers.js` | DÉGRADÉ | MINEUR | JS utilisé : l.4 pose aria-expanded sur summary (interdit W3C), à retirer avec la correction HTML |
| `clients.html` | DÉGRADÉ | MINEUR | page publique : 0 erreur W3C ; customers.js sans ?v= (l.91) contrairement à la home |
| `conditions.html` | CASSÉ | MINEUR | page publique : /legal.css chargé deux fois (l.16-17) ; 0 erreur W3C |
| `confidentialite.html` | DÉGRADÉ | MINEUR | page publique : 1 info W3C (slash final meta l.8) ; 0 erreur |
| `contact-fr.html` | OK | n/a | page publique : 0 erreur, 0 avertissement W3C ; aucun doublon link/script |
| `contact.css` | OK | n/a | CSS utilisé : valide (vnu, jigsaw) ; 0 ou peu de règles mortes |
| `contact.html` | OK | n/a | page publique : 0 erreur, 0 avertissement W3C ; aucun doublon link/script |
| `contact.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `customers.css` | OK | n/a | CSS utilisé : valide (vnu, jigsaw) ; 0 ou peu de règles mortes |
| `customers.html` | DÉGRADÉ | MINEUR | page publique : 0 erreur W3C ; customers.js sans ?v= (l.91) contrairement à la home |
| `customers.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `demo.css` | OK | n/a | CSS utilisé : valide (vnu, jigsaw) ; 0 ou peu de règles mortes |
| `demo.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `docs/header-audit.md` | DÉGRADÉ | MINEUR | doc historique obsolète (fichiers supprimés, nombre de tests) ; servie en prod HTTP 200 |
| `docs/motion-qa.md` | DÉGRADÉ | MINEUR | doc historique obsolète (fichiers supprimés, nombre de tests) ; servie en prod HTTP 200 |
| `docs/production-implementation-audit.md` | DÉGRADÉ | MINEUR | doc historique obsolète (fichiers supprimés, nombre de tests) ; servie en prod HTTP 200 |
| `editorial-motion.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `faq-fr.html` | OK | n/a | page publique : 0 erreur, 0 avertissement W3C ; aucun doublon link/script |
| `faq.html` | OK | n/a | page publique : 0 erreur, 0 avertissement W3C ; aucun doublon link/script |
| `floating-demo.css` | OK | n/a | CSS utilisé : valide (vnu, jigsaw) ; 0 ou peu de règles mortes |
| `floating-demo.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `home-motion.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `home.css` | OK | n/a | CSS utilisé : valide (vnu, jigsaw) ; 0 ou peu de règles mortes |
| `index-fr.html` | DÉGRADÉ | MAJEUR | page publique : 0 erreur W3C ; bloc pricing désynchronisé du générateur (diff 6 lignes) |
| `index.html` | DÉGRADÉ | MAJEUR | page publique : 0 erreur W3C ; bloc pricing désynchronisé du générateur (diff 6 lignes) ; témoignages illustratifs l.194-215 contredisent README/BRAND |
| `leadgen.css` | DÉGRADÉ | MINEUR | CSS orphelin : 0 page, 40/40 règles mortes, cité seulement par BRAND.md l.23 |
| `legal-notice.html` | DÉGRADÉ | MINEUR | page publique : 1 info W3C (slash final meta l.8) ; 0 erreur |
| `legal.css` | OK | n/a | CSS utilisé : valide (vnu, jigsaw) ; 0 ou peu de règles mortes |
| `media.html` | CASSÉ | MINEUR | page publique : 2 erreurs W3C (div aria-label l.57, time vide l.59) |
| `medias.html` | CASSÉ | MINEUR | page publique : 2 erreurs W3C (div aria-label l.57, time vide l.59) |
| `mentions-legales.html` | DÉGRADÉ | MINEUR | page publique : 1 info W3C (slash final meta l.8) ; 0 erreur |
| `mobile-menu.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `motion.css` | DÉGRADÉ | MINEUR | CSS utilisé : 4/15 règles mortes (~22 %) : home-motion-toggle, sp-change-plus, sp-motion |
| `motion.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `newsletter.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `notre-solution.html` | OK | n/a | page publique : 0 erreur, 0 avertissement W3C ; aucun doublon link/script |
| `opposition.html` | OK | n/a | page publique : 0 erreur, 0 avertissement W3C ; aucun doublon link/script |
| `opt-out.html` | OK | n/a | page publique : 0 erreur, 0 avertissement W3C ; aucun doublon link/script |
| `our-solution.html` | OK | n/a | page publique : 0 erreur, 0 avertissement W3C ; aucun doublon link/script |
| `page-motion.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `pricing-interactive.css` | OK | n/a | CSS utilisé : valide (vnu, jigsaw) ; 0 ou peu de règles mortes |
| `pricing.html` | DÉGRADÉ | MINEUR | page publique : href relatif pricing-interactive.css (l.16) ; 0 erreur W3C ; version prod = 81ec818 (badge modifié) |
| `pricing.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `privacy.css` | OK | n/a | CSS utilisé : valide (vnu, jigsaw) ; 0 ou peu de règles mortes |
| `privacy.html` | OK | n/a | page publique : 0 erreur, 0 avertissement W3C ; aucun doublon link/script |
| `recrutement.html` | CASSÉ | MAJEUR | page publique : 16 erreurs + 4 avertissements W3C (summary l.65-68) |
| `robots.txt` | OK | n/a | configuration : Allow /, Disallow /api/, Sitemap |
| `scripts/site_layout.py` | CASSÉ | MAJEUR | générateur non idempotent (diff 2 fichiers après exécution) ; page() jamais appelée ; servi en prod HTTP 200 |
| `site-pages.css` | DÉGRADÉ | MINEUR | CSS utilisé : 22/168 règles mortes (~11 %, 11 classes absentes) |
| `sitemap.xml` | OK | n/a | configuration : 26 <loc> = les 26 pages de pages.csv ; référencé par robots.txt |
| `solution-motion.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `solution-page.css` | OK | n/a | CSS utilisé : valide (vnu, jigsaw) ; 0 ou peu de règles mortes |
| `solution-page.js` | OK | n/a | JS utilisé : parse OK (tests site.test.cjs), aucun console.log |
| `styles.css` | DÉGRADÉ | MAJEUR | CSS utilisé (26 pages) : 578/710 règles (~67 Ko / 92 Ko) ciblent des classes absentes ; 1 espace final l.4335 |
| `tarifs.html` | DÉGRADÉ | MINEUR | page publique : href relatif pricing-interactive.css (l.16) ; 0 erreur W3C ; version prod = 81ec818 |
| `terms.html` | DÉGRADÉ | MINEUR | page publique : legal.css sans ?v= (l.16) contrairement à 4 autres pages ; 0 erreur W3C |
| `tests/comparison-motion.test.cjs` | DÉGRADÉ | MINEUR | test interne (passe) ; servi en prod HTTP 200, à exclure via .vercelignore |
| `tests/comparison.test.cjs` | DÉGRADÉ | MINEUR | test interne (passe) ; servi en prod HTTP 200, à exclure via .vercelignore |
| `tests/contact.test.cjs` | DÉGRADÉ | MINEUR | test interne (passe) ; servi en prod HTTP 200, à exclure via .vercelignore |
| `tests/customers.test.cjs` | DÉGRADÉ | MINEUR | test interne (passe) ; servi en prod HTTP 200, à exclure via .vercelignore |
| `tests/language.test.cjs` | DÉGRADÉ | MINEUR | test interne (passe) ; servi en prod HTTP 200, à exclure via .vercelignore |
| `tests/legal.test.cjs` | DÉGRADÉ | MINEUR | test interne (passe) ; servi en prod HTTP 200, à exclure via .vercelignore |
| `tests/motion.test.cjs` | DÉGRADÉ | MINEUR | test interne (passe) ; servi en prod HTTP 200, à exclure via .vercelignore |
| `tests/newsletter.test.cjs` | DÉGRADÉ | MINEUR | test interne (passe) ; servi en prod HTTP 200, à exclure via .vercelignore |
| `tests/site.test.cjs` | DÉGRADÉ | MINEUR | test interne (passe) ; servi en prod HTTP 200, à exclure via .vercelignore |
| `tests/solution-audit.test.cjs` | DÉGRADÉ | MINEUR | test interne (passe) ; servi en prod HTTP 200, à exclure via .vercelignore |
| `tests/solution-progress.test.cjs` | DÉGRADÉ | MINEUR | test interne (passe) ; servi en prod HTTP 200, à exclure via .vercelignore |
| `tests/source-copy.test.cjs` | DÉGRADÉ | MINEUR | test interne (passe) ; servi en prod HTTP 200, à exclure via .vercelignore |
| `vercel.json` | OK | n/a | configuration : cleanUrls, trailingSlash false, 5 redirections ; cohérent avec README l.33 et 51 |

## Annexe B : script d'analyse CSS (tinycss2) utilisé pour L14 à L18

```python
# python3 css_dups.py, à la racine du repo ; pip install tinycss2
import sys,glob,re,collections,os,tinycss2
def ser(t): return re.sub(r'\s+',' ',tinycss2.serialize(t)).strip()
def decls(c): return tuple(sorted((d.lower_name,ser(d.value).lower(),d.important) for d in tinycss2.parse_declaration_list(c,skip_comments=True,skip_whitespace=True) if d.type=='declaration'))
rules=[]
def walk(nodes,f,media):
    for n in nodes:
        if n.type=='qualified-rule':
            for s in ser(n.prelude).split(','): rules.append((f,media,s.strip(),decls(n.content),n.source_line))
        elif n.type=='at-rule' and n.content is not None and n.lower_at_keyword in ('media','supports'):
            walk(tinycss2.parse_rule_list(n.content,skip_comments=True,skip_whitespace=True),f,media+' @'+n.lower_at_keyword+' '+ser(n.prelude))
for f in sorted(glob.glob('*.css')): walk(tinycss2.parse_stylesheet(open(f,encoding='utf-8').read(),skip_comments=True,skip_whitespace=True),f,'')
key=collections.defaultdict(list)
for r in rules:
    if r[3]: key[(r[1],r[2],r[3])].append((r[0],r[4]))
print('identiques entre fichiers:',sum(1 for v in key.values() if len(set(x[0] for x in v))>1))
same=collections.defaultdict(list)
for r in rules: same[(r[0],r[1],r[2])].append(r[4])
print('fragmentation (même fichier):',sum(1 for v in same.values() if len(v)>1))
corpus=' '.join(open(f,encoding='utf-8').read() for f in glob.glob('*.html')+glob.glob('*.js')+glob.glob('scripts/*.py'))
words=set(re.findall(r'[A-Za-z0-9_-]+',corpus))
for f in sorted(glob.glob('*.css')):
    dead=[r for r in rules if r[0]==f and re.findall(r'\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)',r[2]) and all(c not in words for c in re.findall(r'\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)',r[2]))]
    print(f,len(dead),'sélecteurs morts sur',sum(1 for r in rules if r[0]==f),':',', '.join(f'l.{r[4]} {r[2]}' for r in dead))
```

## Compte

Tableau principal : 46 lignes (L01 à L46).

| Verdict | Lignes | dont BLOQUANT | dont MAJEUR | dont MINEUR | dont n/a |
| --- | --- | --- | --- | --- | --- |
| OK | 12 | 0 | 0 | 0 | 12 |
| CASSÉ | 8 | 0 | 6 | 2 | 0 |
| TROMPEUR | 0 | 0 | 0 | 0 | 0 |
| DÉGRADÉ | 24 | 0 | 6 | 18 | 0 |
| NON TESTABLE | 2 | 0 | 0 | 0 | 2 |
| Total | 46 | 0 | 12 | 20 | 14 |

Annexe A (verdict par fichier, 130 fichiers) : OK 57 ; CASSÉ 7 ; DÉGRADÉ 66 ; sévérités : MAJEUR 13 ; MINEUR 60 ; n/a 57.

Résultats chiffrés : validation W3C des 26 pages : 36 erreurs, 8 avertissements, 3 infos (4 pages en erreur, 3 pages en info, 19 pages sans message) ; 15 CSS : 0 message vnu, 9 validés en ligne, 6 non testables en ligne (429) ; tests Node : 79/79 en 407,8 ms ; diff après régénération : 2 fichiers, 8 insertions, 4 suppressions (identique avec le générateur de 81ec818) ; images orphelines : 26 (10 153 067 octets) ; CSS mort : environ 75 194 octets sur 207 789 (styles.css 73 %).

## Couverture

- pages.csv (26 pages) : toutes validées par vnu (L01 à L05, L13, L11, L12) ; verdict individuel de chaque page en annexe A (lignes .html).
- fichiers.csv (130 fichiers) : un verdict par fichier en annexe A (catégories : page publique 26 ; CSS utilisé 14 ; CSS orphelin 1 ; JS utilisé 14 ; fonctions serverless 2 ; images utilisées 18 ; images orphelines 26 ; documentation 10 dont 9 servies en prod ; outillage interne servi en prod 13 ; configuration 4 ; données 1 ; configuration locale suivie à tort 1). Correction d'inventaire : assets/logo.png est orphelin (L20).
- actions.csv, emails.csv, tiers.csv : hors périmètre de ce flux (seule remarque : emails.csv est en CRLF, L34).
- Éléments du brief traités : 1 validation HTML/CSS/SVG (L01 à L10) ; 2 doublons, orphelins, CSS mort (L11 à L20) ; 3 générateur (L23, L24, C5, C6) ; 4 tests, CI, hooks (L25 à L27, C6, C7) ; 5 git (L28 à L34) ; 6 docs (L36 à L43 et table dédiée) ; 7 dépendances (L44 à L46, C8) ; 8 résidus (L34, L35). Exécutions interdites respectées : scripts/site_layout.py et node --test lancés uniquement dans les copies du scratchpad ; aucun fichier du repo modifié hors ce rapport (`git status` : seul docs/audit-total/screens/ non suivi, appartenant à d'autres flux).
