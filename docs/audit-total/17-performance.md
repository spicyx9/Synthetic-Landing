# Flux 17 : performance et Core Web Vitals
Périmètre : les 26 pages du site vitrine (production https://www.syntheticswarm.ai, commit 864833f) : scores Lighthouse mobile et desktop (performance, accessibilité, bonnes pratiques, SEO), LCP, CLS, TBT (INP en laboratoire), TTI, TTFB, FCP, Speed Index ; waterfall de la home FR et EN (ressources bloquantes, ordre, polices, images, couverture CSS/JS, tiers) ; en-têtes de cache et compression par type ; poids transféré et décodé des 26 pages ; connexion 3G rapide simulée sur la home FR, /tarifs et /notre-solution ; images de plus de 150 Ko et images surdimensionnées (fichiers.csv), avec conversions mesurées. Lignes d'inventaire couvertes : pages.csv (26), fichiers.csv (images, CSS, JS), tiers.csv (polices Google, 78 lignes).
Outils : Lighthouse 12.8.2 (API Node, Chromium 141 HeadlessChrome via chrome-launcher 1.2.1, `--proxy-server=http://127.0.0.1:41841`, throttling `simulate` par défaut : mobile 1,6 Mb/s, 150 ms, CPU x4, 412x823 @1,75 ; desktop 10 Mb/s, 40 ms, CPU x1, 1350x940), Playwright 1.56.1 Chromium (CDP Network, coverage, Page.startScreencast, Network.emulateNetworkConditions), curl 8, openssl, ImageMagick 6.9.12 (libwebp 1.3.2), Node 22, Python 3.11. Scripts : `scratchpad/tools/lh17-run.mjs`, `lh17-summary.mjs`, `lh17-report.mjs`, `wf17-waterfall.mjs`, `wf17-render.mjs`, `g3-17.mjs`, `g3-17-filmstrip.mjs`, `g3-17-annex.mjs`, `lh17-assemble.py`. Données brutes : `scratchpad/flux17/` (156 JSON Lighthouse dans `lh/`, waterfall, g3, headers, images).
Début : 2026-09-19T19:36:53Z  Fin : 2026-09-19T20:46:39Z
Statut : COMPLET

Synthèse : les 26 pages obtiennent un score Performance mobile médian de 82 (desktop 92) avec une accessibilité à 100, des bonnes pratiques à 93 ou 96 et un SEO à 100, parce que chaque page transfère 2,0 à 2,7 Mo dont 95 % d'images affichées à 44 px au plus (axel-ceo.png 1,72 Mo sur les 26 pages), que 5 à 9 feuilles CSS bloquantes (styles.css utilisé à 11 %) et le CSS Google Fonts précèdent tout rendu, et que Vercel sert tout en `max-age=0, must-revalidate` (aucun cache navigateur). Les corrections sont mécaniques et chiffrées (annexes D et E : conversion WebP mesurée, en-têtes vercel.json, feuilles différées, polices auto-hébergées, suppression du fondu du héros qui retarde le LCP) et ramèneraient la home à environ 258 Ko. Limite de mesure : les 156 passes ont tourné pendant que 22 flux saturaient les 4 CPU partagés (benchmarkIndex 145 à 2 381 contre 2 453 à vide), donc les scores Performance, TBT et TTI sont pessimistes et instables ; les constats structurels ne dépendent pas de la charge.

| Verdict | Sévérité | Page(s) | Élément | Attendu | Constaté | Preuve | Correction exacte |
|---|---|---|---|---|---|---|---|
| NON TESTABLE | n/a | les 26 pages | Scores de performance Lighthouse en conditions de laboratoire stables (raison : 22 flux en parallèle sur 4 CPU partagés) | Machine calme, benchmarkIndex stable ≥ 1 500, TTFB observé < 200 ms | Charge machine passée de 1,0 (test de fumée) à 48 pendant les passes ; benchmarkIndex de 145 à 2 381 (2 453 à vide) ; TTFB observé par Lighthouse de 52 ms à faible charge jusqu'à 2 744 ms sous charge ; les scores Performance, TBT et TTI sont pessimistes et instables (home FR mobile : perf par passe 67/40, LCP par passe 1678/3927 ms). 8 passes sur 156 ont en outre reçu un 502 du proxy sur une ressource et sont exclues des médianes (annexe A). Les constats structurels (poids, cache, CSS bloquant, élément LCP, images) ne dépendent pas de la charge. | `screens/17/lighthouse-passes.csv` colonnes `benchmark_index`, `loadavg_avant`, `ttfb_ms` ; `lh-smoke/index-fr-mobile-p1.json` (bench 2 453, perf 68) | Rejouer `cd scratchpad/tools && node lh17-run.mjs` (156 passes, JSON dans `scratchpad/flux17/lh/`) sur une machine dédiée avant toute cible chiffrée. |
| DÉGRADÉ | MAJEUR | les 26 pages | Score Performance Lighthouse mobile (médiane de 3 passes, throttling simulé 1,6 Mb/s, 150 ms, CPU x4) | ≥ 90 sur chaque page | Médiane des 26 pages : 82 (min 46, max 99) ; home FR 54, home EN 46 ; 2 page(s) sur 26 à 90 ou plus. Causes communes : 2,0 à 2,7 Mo d'images par page, 5 à 9 feuilles CSS bloquantes, CSS Google Fonts dans la chaîne critique, cache navigateur nul. | Annexe A (tableau complet), `screens/17/lighthouse-medianes.csv`, `screens/17/index-fr-mobile-lighthouse.html` | E1 à E6 (annexe E). |
| DÉGRADÉ | MAJEUR | les 26 pages | Score Performance Lighthouse desktop (médiane de 3 passes) | ≥ 90 | Médiane des 26 pages : 92 (min 55, max 99) ; home FR 55 ; 16 page(s) à 90 ou plus. | Annexe A | E1 à E6. |
| DÉGRADÉ | MAJEUR | / et /index-fr | LCP mobile simulé et élément LCP | ≤ 2,5 s ; élément LCP peint dès le premier rendu | Home FR : LCP médian 2,8 s (passes 1678/3927 ms), home EN 15,3 s ; la valeur est bimodale d'une passe à l'autre : 1,7 à 3,9 s quand le fondu du héros se termine avant la fin du téléchargement des images, 15,3 à 16,2 s quand la machine est plus lente et que le sous-titre n'est peint qu'après les 2,53 Mo d'images, que Lighthouse place alors dans le chemin critique du LCP. Élément LCP = `p.demo-hero__subtitle` (mobile) et `span.hl.hero-word-highlight` (desktop), texte, phases (test de fumée) TTFB 628 ms, délai de rendu 14 644 ms : `home-motion.js` (lignes 7 à 9) met le titre et le sous-titre à `opacity: 0` (WAAPI, `fill: both`) au DOMContentLoaded puis les fond en 560 ms après 220 à 360 ms ; le premier rendu observé (2 400 ms) intervient après DCL (976 ms) donc le héros apparaît vide, et le LCP observé (3 727 ms) tombe après la fin du téléchargement des 2,53 Mo d'images, que Lighthouse place alors dans le chemin critique du LCP. Passe rejouée à charge réduite (benchmarkIndex 1 543) : LCP 4 460 ms (TTFB 637 ms + délai de rendu 3 823 ms), perf 60, contre 1 141 ms et perf 97 en desktop sur la même machine. Chronologie réelle mesurée par échantillonnage de l'opacité du sous-titre (connexion rapide, `waterfall-calm/index-fr-mobile.json`) : texte visible à 630 ms, mis à opacity 0 à 935 ms par la séquence d'entrée, revenu à 1 à 2 123 ms : le prospect voit le titre, le voit disparaître, puis le voit réapparaître en fondu. Même séquence en 3G sur /tarifs (h1 visible 692 ms, masqué 1 260 ms, revenu 1 700 ms) et /notre-solution (1 218, 1 603, 2 091 ms) ; non capturée dans la passe 3G de la home (opacité 1 à 800 ms, aucun passage à 0 enregistré). | `lh-smoke/index-fr-mobile-p1.json` audit `largest-contentful-paint-element` et `metrics` (observedFirstContentfulPaint 2 400, observedLargestContentfulPaint 3 727, observedDomContentLoaded 976) ; `lh-calm/index-fr-mobile-p1.json` ; `waterfall-calm/index-fr-mobile.json` et `g3-calm/*.json` (champ `opacity`) ; `home-motion.js` lignes 7 à 9 ; `page-motion.js` lignes 11 et 15 à 20 pour les autres pages | E3 puis E2. |
| DÉGRADÉ | MAJEUR | les 24 autres pages | LCP mobile simulé | ≤ 2,5 s | 23 pages sur 26 au-dessus de 2,5 s en mobile (1 en desktop) ; élément LCP = `h1` ou premier paragraphe (texte) ; phases dominées par le TTFB observé sous charge et le délai de rendu des 5 à 7 CSS bloquants (gain estimé `render-blocking-resources` : 565 à 2 085 ms sur /tarifs). | Annexe A colonnes LCP et diagnostics ; `lh/tarifs-mobile-p1.json` audit `render-blocking-resources` | E4 et E5. |
| DÉGRADÉ | MINEUR | les 26 pages | FCP et Speed Index mobile | FCP ≤ 1,8 s, SI ≤ 3,4 s | FCP médian 2,8 s (min 1,6, max 3,3) ; Speed Index médian 4,5 s. | Annexe A | E4, E5. |
| OK | n/a | les 26 pages | CLS (mobile et desktop) | ≤ 0,1 | CLS médian mobile 0,000, maximum 0,021 (/notre-solution et /our-solution : 0,021, cause « Web font loaded » sur `section.sp-hero::before`) ; waterfall home : 0,0015. | Annexe A ; `lh/notre-solution-mobile-p1.json` audit `layout-shifts` | Aucune (E5 supprime aussi le décalage de police). |
| DÉGRADÉ | MINEUR | les 26 pages | TBT (INP en laboratoire) et TTI mobile | TBT ≤ 200 ms, TTI ≤ 3,8 s | TBT médian mobile 0 ms (de 0 à 6025 ms selon la charge) ; TTI médian 3,7 s. À vide (fumée) : TBT 8 ms, 4 tâches longues (floating-demo.js 401 ms, document 120 ms), main thread 2,2 s dont Style & Layout 991 ms ; sous charge (index-fr mobile passe 1, benchmarkIndex 1 225) : TBT 6 115 ms avec 20 tâches longues attribuées au document lui-même (Style & Layout 5 241 ms, « Other » 5 863 ms), signature d'une famine CPU et non du JavaScript du site. | Annexe A ; `lh-smoke/index-fr-mobile-p1.json` audits `long-tasks`, `mainthread-work-breakdown` | E4 (moins de CSS à évaluer), E6 ; à remesurer sur machine calme. |
| DÉGRADÉ | MAJEUR | les 26 pages | Poids total transféré par page | ≤ 1 Mo par page (Lighthouse `total-byte-weight` : 0,5 à partir de 1,6 Mo) | Home : 2 795 720 o (2,67 Mo) transférés, 2 924 250 o décodés, dont images 2 654 818 o (95 %). Les 25 autres pages : 1,97 Mo (2 068 685 o) à 2,22 Mo (2 323 600 o) transférés, dont 1 957 296 o pour trois fichiers présents sur chaque page (axel-ceo.png 1 721 963 o, logo-black-narrow.png 124 746 o, ilan-cto.jpg 110 587 o) affichés à 44 px au plus. | Annexe A « Poids par page » ; annexe B ; `screens/17/index-fr-mobile-waterfall.png` | E2 (annexe D) : la home passe à environ 258 Ko, les autres pages à environ 120 Ko. |
| DÉGRADÉ | MAJEUR | les 26 pages | `assets/team/axel-ceo.png` | Avatar ≤ 5 Ko adapté à 44 px (96 px physiques) | 1 721 963 o, 1254x1254 px, présent 3 fois par page (popover d'en-tête, menu mobile, widget flottant), téléchargé au chargement de chaque page en priorité Low, affiché 32x32 (mobile) à 44x44 px, et 160x160 px en portrait sur /about et /a-propos ; fichier le plus lourd du site. | Annexe B tableau des images ; `fichiers.csv` (26 pages référençantes) ; conversion mesurée annexe D (906 o à 96 px) | E2 : `convert assets/team/axel-ceo.png -resize 96x96 -quality 80 assets/team/axel-ceo-96.webp` (906 o) et `-resize 320x320` pour le portrait (4 206 o), puis `sed` de E2. |
| DÉGRADÉ | MAJEUR | les 26 pages | `assets/logo-black-narrow.png` et `assets/team/ilan-cto.jpg` | ≤ 5 Ko chacun | 124 746 o (1024x1024 pour 18x18, 42x50 et 23x28 px ; audit `image-aspect-ratio` en échec sur les 26 pages : ratio 0,82 imposé à une image carrée) et 110 587 o (1254 px pour 44 px). | `lh/*-p1.json` audit `image-aspect-ratio` ; annexe D (1 734 o et 1 564 o après conversion) | E2. |
| DÉGRADÉ | MAJEUR | / et /index-fr | `decor-2.png`, `decor-3.png`, `trust/generali.jpg`, `trust/allianz.png`, `trust/axa.webp`, `trust/france-assurance.png` | Formats et dimensions adaptés à l'affichage | 615 145 o pour 6 images affichées entre 36 et 150 px ; `decor-3.png` (255 682 o) est `display: none` en mobile (home.css lignes 323 et 529) mais téléchargée quand même ; `allianz.png` fait 5000x3125 px pour 128x80. Audit `image-delivery-insight` : 2 261 Ko à gagner, 10 550 ms de LCP estimés. | `lh-smoke/index-fr-mobile-p1.json` audits `image-delivery-insight`, `offscreen-images`, `uses-responsive-images` ; annexe D | E2 (avec `loading="lazy"` sur decor-3). |
| DÉGRADÉ | MINEUR | / et /index-fr | Les 6 logos de confiance sans `width`/`height` (`unsized-images`) | Attributs de dimension sur chaque image | Absents (index-fr.html lignes 96 à 101) ; CLS mesuré nul grâce au conteneur dimensionné, risque de décalage à chaque changement de CSS. | `lh-smoke/index-fr-mobile-p1.json` audit `unsized-images` (6 éléments) | E2 (attributs ajoutés par la commande sed). |
| DÉGRADÉ | MAJEUR | les 26 pages et tous les fichiers CSS, JS, images | En-têtes de cache navigateur | `Cache-Control: public, max-age=31536000, immutable` sur les fichiers versionnés `?v=`, durée longue sur les images | `cache-control: public, max-age=0, must-revalidate` sur HTML, CSS, JS, PNG, JPEG, WebP, SVG et favicon ; requête conditionnelle → `HTTP/2 304` : chaque visite renvoie ~30 requêtes de revalidation avant réutilisation ; le versionnage `?v=` (20 des 29 références CSS/JS) ne sert à rien ; `vercel.json` n'a aucune section `headers` ; Lighthouse ne le signale pas (`uses-long-cache-ttl` exclut `must-revalidate`). | Annexe C ; `scratchpad/flux17/headers/curl-types-1.txt`, `curl-304.txt` ; `vercel.json` | E1. |
| OK | n/a | les 26 pages, CSS, JS, SVG | Compression HTTP | br ou gzip sur le texte | `content-encoding: br` sur HTML (35 604 → 8 605 o), CSS (styles.css 92 495 → 20 283 o), JS et SVG ; gzip en repli (8 298 o) ; identity servi sur demande ; images non recompressées (attendu). | Annexe C | Aucune. |
| OK | n/a | les 26 pages | Cache CDN et temps de réponse serveur | `x-vercel-cache: HIT`, TTFB < 200 ms | HIT sur les 26 pages ; TTFB serveur mesuré par Lighthouse à faible charge : 52 ms (/), 55 ms (/index-fr), 113 ms (fumée) ; phase 0 : 0,17 à 0,52 s de temps total par page. Les 1,2 à 7,2 s de `headers/ttfb-26-pages.csv` mesurés à 20:06 UTC reflètent la saturation du proxy local, pas le site. | `headers/ttfb-26-pages.csv` (colonne x_vercel_cache), `lighthouse-passes.csv` colonne `ttfb_ms`, `inventaire/pages.csv` | Aucune. |
| NON TESTABLE | n/a | les 26 pages | HTTP/2 ou HTTP/3 (raison : proxy TLS d'inspection obligatoire dans l'environnement) | Toutes les ressources en h2 ou h3 | Chromium voit `http/1.1` sur les 29 requêtes (audit `uses-http2` et `modern-http-insight` en échec, sans effet sur le score) ; `openssl s_client -proxy … -alpn h2,http/1.1` obtient `ALPN protocol: h2` et curl `http_version 2` avec le proxy ; le protocole entre le proxy et Vercel n'est pas observable ; aucun `alt-svc` reçu. | Annexe C ; `lh-smoke/index-fr-mobile-p1.json` audit `uses-http2` | Vérifier hors proxy : `curl -sI --http2 https://www.syntheticswarm.ai/ \| head -1` (attendu `HTTP/2 200`). |
| DÉGRADÉ | MAJEUR | / et /index-fr (9 feuilles), les 24 autres pages (5 à 7 feuilles : 4 à 6 locales + Google Fonts) | Feuilles de style bloquantes et CSS inutilisé | ≤ 2 feuilles critiques, le reste non bloquant ; CSS utilisé > 50 % | Home : 9 feuilles `renderBlockingStatus: blocking` (8 locales + CSS Google Fonts), 47 646 o transférés, 181 003 o décodés, 30 % utilisé en mobile (25 % desktop) ; `styles.css` 92 495 o utilisé à 11 % (sections d'un ancien site, lignes 670 à 2 658) et chargé bloquant par les 26 pages ; Lighthouse `render-blocking-resources` : 1 053 ms (fumée) à 1 210 ms de gain estimé sur la home. | Annexe B (tableau de couverture, waterfall) ; `lh-smoke/index-fr-mobile-p1.json` audits `render-blocking-resources` (9 éléments), `unused-css-rules` (18 107 o) | E4. |
| DÉGRADÉ | MINEUR | les 26 pages (tiers.csv : fonts.googleapis.com et fonts.gstatic.com, 78 lignes) | Polices web | Polices auto-hébergées ou préchargées, `font-display: swap`, une seule étape réseau | CSS Google Fonts en `<link rel="stylesheet">` bloquant (gain estimé 781 ms sur la home, 2 085 ms sur /tarifs), chaîne HTML → fonts.googleapis.com → fonts.gstatic.com (les woff2 ne partent qu'après le CSS : 951 ms contre 526 ms en fumée) ; 37 `@font-face` déclarés pour 2 fichiers réellement utilisés (Inter variable 48 432 o, DM Serif Display italique 17 660 o) ; `display=swap` présent ; `preconnect` présent sur les deux domaines ; aucun `preload` ; CLS 0,021 « Web font loaded » sur les pages solution. | Annexe B (polices) ; `headers/google-fonts-css-chrome.css` ; `lh/tarifs-mobile-p1.json` audit `render-blocking-resources` | E5. |
| DÉGRADÉ | MINEUR | / et /index-fr (pricing.js, mobile-menu.js, floating-demo.js) ; les 26 pages (mobile-menu.js) | Scripts en fin de body sans `defer` | `defer` sur tout script externe | 3 scripts parser-blocking sur la home (lignes 315, 316, 319), 1 sur chaque autre page ; les scripts de l'en-tête sont bien `defer`. | Annexe B (liste des scripts) ; `scripts/site_layout.py` ligne 133 | E6. |
| DÉGRADÉ | MINEUR | /, /index-fr, /pricing, /tarifs | Erreur JavaScript à chaque chargement (score Bonnes pratiques 93 au lieu de 96) | Aucune erreur console | `TypeError: Cannot set properties of null (setting 'hidden') at updatePricing (pricing.js:48:69)` : le bloc `[data-pricing-custom-booking]` (index-fr.html lignes 268 à 270, tarifs.html ligne 104) n'a pas de `[data-disclosure-panel]` ; l'exception se répète à chaque mouvement du curseur de volume ; l'affichage du prix se met à jour avant l'exception (ligne 48 est après les mises à jour de texte). | `lh/tarifs-mobile-p1.json`, `lh/pricing-mobile-p1.json`, `lh-smoke/index-fr-mobile-p1.json` audit `errors-in-console` | E7. |
| DÉGRADÉ | MINEUR | / et /index-fr (96), /our-solution et /notre-solution (97), /pricing et /tarifs (95), les 26 pages en desktop | Score Accessibilité Lighthouse | 100 | Médiane mobile 100, desktop 100. Home : `span.hero-eyebrow-badge` blanc sur #e74c3c 3,82:1 (9 px gras) ; solution : `span.story-number` #81817d sur fonds clairs 3,57 à 3,77:1 et `div.story-product-bar > span` #787872 4,44:1 ; pricing/tarifs : `p.pricing-config-kicker` et 5 boutons `[data-pricing-step]` #777777 4,47:1, `span.pricing-config-period` #888888 3,54:1, `h3` sans h2 (`heading-order`) ; desktop (26 pages) : bouton langue `aria-label="Choisir la langue"` sans le texte visible « FR » (`label-content-name-mismatch`). | Annexe A « Diagnostics » ; `lh/*-p1.json` audits `color-contrast`, `heading-order`, `label-content-name-mismatch` | E8, E9, E10 (ratios recalculés). |
| OK | n/a | les 26 pages | Score SEO Lighthouse | 100 | 100 sur chaque page quand `robots.txt` est lu ; les valeurs 92 de certaines passes viennent de l'audit `robots-txt` « Lighthouse was unable to download a robots.txt file » (échec réseau sous charge ; `/robots.txt` répond 200, 91 o, `text/plain`). | Annexe A colonne SEO par passe ; `lh/about-mobile-p1.json` audit `robots-txt` ; `curl -o /dev/null -w '%{http_code}' https://www.syntheticswarm.ai/robots.txt` = 200 | Aucune. |
| OK | n/a | les 22 pages sans configurateur de prix | Score Bonnes pratiques Lighthouse | ≥ 96 | 96 sur ces pages : seul `image-aspect-ratio` (logo carré affiché 23x28) échoue ; 93 sur les 4 pages avec l'erreur console ci-dessus. | Annexe A | E2 (attribut `height="28"`) et E7. |
| DÉGRADÉ | MINEUR | fichiers.csv (images, CSS, JS) | Fichiers déployés mais jamais demandés | Rien d'inutile en production | 26 images orphelines (9,68 Mo (10 153 067 o)) servies en 200 mais demandées par aucune des 26 pages ; `leadgen.css` (6 005 o, 0 référence) ; `demo.js` (988 o, 0 référence : `fichiers.csv` le compte à tort par la sous-chaîne de `floating-demo.js`). | Annexe D (liste issue des requêtes réseau des 52 passes de la passe 1) ; `grep -c 'demo.js' index-fr.html` ne trouve que floating-demo.js | `git rm` de l'annexe D (ou `.vercelignore`). |
| OK | n/a | les 26 pages | Domaines tiers et traqueurs | Aucun tiers hors polices | Seuls fonts.googleapis.com et fonts.gstatic.com sont contactés (69 288 o, 0 ms de blocage main thread) ; aucun script tiers, aucune mesure d'audience. | `inventaire/tiers.csv` (78 lignes, 2 domaines) ; audit `third-party-summary` | Aucune (E5 les supprime). |
| DÉGRADÉ | MAJEUR | /index-fr, /tarifs, /notre-solution | Connexion 3G rapide simulée (CDP : 1,6 Mb/s descendant, 750 kb/s montant, 150 ms de latence, CPU x4, mobile 390x844 @3x) : délai avant contenu lisible et interactivité | FCP ≤ 1,8 s, LCP ≤ 2,5 s, TTI ≤ 3,8 s | sous charge (19:53 UTC) : /index-fr : FCP 22,8 s, LCP 22,8 s (P.demo-hero__subtitle), TTI 28,1 s, TBT 287 ms, load 43,6 s, 2,61 Mo ; /tarifs : FCP 7,0 s, LCP 7,0 s (H1.reveal), TTI 9,9 s, TBT 475 ms, load 20,7 s, 1,98 Mo ; /notre-solution : FCP 6,6 s, LCP 6,6 s (P), TTI 10,1 s, TBT 894 ms, load 19,5 s, 1,98 Mo. charge réduite : /index-fr : FCP 1,2 s, LCP 1,2 s (P.demo-hero__subtitle), TTI 5,4 s, TBT 1084 ms, load 15,3 s, 2,61 Mo ; /tarifs : FCP 1,1 s, LCP 1,1 s (H1.reveal), TTI 3,2 s, TBT 774 ms, load 11,2 s, 1,98 Mo ; /notre-solution : FCP 1,6 s, LCP 1,6 s (P), TTI 3,0 s, TBT 642 ms, load 11,6 s, 1,98 Mo. Séquence visuelle à charge réduite (filmstrips) : home FR, page blanche jusqu'à 1,2 s puis héros complet avec polices à 1,9 s, logo d'en-tête (125 Ko) à 3,8 s, widget flottant avec avatars (1,83 Mo) à 5,7 s, puis plus aucun changement visible jusqu'au load à 15,3 s ; /tarifs, contenu complet à 2,3 s puis aucun changement visible jusqu'au load à 11,2 s : les 1,96 Mo restants sont les avatars masqués et le logo. Sous 1,6 Mb/s, les images occupent à elles seules 10 à 13 s de téléchargement et maintiennent le TTI entre 3 et 5,4 s. | Annexe F ; `screens/17/index-fr-mobile-3g-filmstrip.png`, `tarifs-mobile-3g-filmstrip.png`, `notre-solution-mobile-3g-filmstrip.png` ; `scratchpad/flux17/g3/*.json` | E2 à E5. |
| OK | n/a | les 26 pages | Taille du DOM et tâches longues tierces | ≤ 1 500 nœuds ; 0 ms tiers | 615 nœuds sur la home (audit `dom-size` score 1) ; DOM médian 206 nœuds sur 26 pages ; aucun blocage main thread d'origine tierce. | Annexe A diagnostics ; `lh-smoke/index-fr-mobile-p1.json` audit `dom-size` | Aucune. |
| OK | n/a | / et /index-fr | Chargement différé des images hors écran | `loading="lazy"` sous la ligne de flottaison | Présent sur les 9 images de la home (6 logos, 3 portraits) et respecté (elles partent après le premier rendu, priorité Low) ; les 24 autres pages n'ont que des images d'en-tête et de pied (logo, avatars). | Annexe B (waterfall, colonne chargement) ; `grep -c 'loading="lazy"' *.html` | Aucune (sauf decor-3, ligne dédiée). |


## Annexe A : Lighthouse 12.8.2, 156 passes (26 pages x mobile/desktop x 3 passes)

Méthode : `lh17-run.mjs` lance, pour chaque passe, un Chromium neuf (`chrome-launcher`, `--headless=new --no-sandbox --proxy-server=http://127.0.0.1:41841 --disable-gpu --disable-dev-shm-usage`, magasin NSS `/root/.pki/nssdb` avec la CA du proxy), puis `lighthouse(url, {port, onlyCategories: [performance, accessibility, best-practices, seo], maxWaitForLoad: 60000}, config)` avec la configuration par défaut (mobile) ou `desktop-config.js`. Ordre en tourniquet : passe 1 sur les 52 couples page x facteur de forme, puis passe 2, puis passe 3 ; un second worker a traité la passe 3 en parallèle à partir de 20:00 UTC pour tenir le délai. Chaque JSON complet est dans `scratchpad/flux17/lh/<page>-<ff>-p<n>.json` ; le CSV de toutes les passes est copié dans `docs/audit-total/screens/17/lighthouse-passes.csv` (colonnes : scores, métriques, `benchmark_index`, `loadavg_avant`, avertissements, erreur) et les médianes dans `lighthouse-medianes.csv`. Le rapport HTML Lighthouse de la passe mobile médiane de la home FR (sans captures plein écran) est dans `screens/17/index-fr-mobile-lighthouse.html`, avec une capture des scores `index-fr-mobile-lighthouse.png`.

Limite de mesure (à lire avant les chiffres) : les 4 CPU sont partagés par 22 flux ; la charge système est passée de 1,0 (test de fumée à 19:40 UTC : perf 68, LCP 15,3 s, TBT 8 ms, benchmarkIndex 2 453) à 48 pendant les passes ; le `benchmarkIndex` (vitesse CPU vue par Lighthouse) est descendu jusqu'à 145, et le TTFB observé par Lighthouse (qui alimente la simulation) est monté de 52 ms à 2 744 ms sous charge. Le throttling simulé (`simulate`, réseau et CPU modélisés) limite l'effet de la charge sur le LCP et le poids, mais TBT, TTI et la part « délai de rendu » du LCP restent pessimistes et varient d'une passe à l'autre (colonnes « par passe »). La médiane de 3 passes est donnée pour chaque page, avec le nombre de passes retenues (n). 8 passes sur 156 ont reçu une réponse 502 du proxy local (ou un « Refused to apply style / execute script » consécutif) sur une ressource CSS, JS ou image : recrutement desktop p1, clients desktop p1, conditions mobile p1, home-en desktop p2, index-fr mobile p2, contact-fr desktop p3, media desktop p3, mentions-legales mobile p3 ; elles restent dans `lighthouse-passes.csv` (colonne `perturbe`) mais sont exclues des médianes et du choix de la passe de référence, ce qui laisse 2 passes valides sur 8 couples page x facteur de forme.

Effet mesuré de la charge sur les 156 passes : parmi les passes mobiles, celles où le `benchmarkIndex` était d'au moins 1 000 (51 passes) ont un score Performance médian de 83, un TBT médian de 0 ms et un TTFB observé médian de 61 ms ; celles où il était sous 600 (16 passes) ont respectivement 62, 314 ms et 282 ms. En desktop : 93 (49 passes) contre 78 (16 passes). Les médianes par page ci-dessous mélangent ces conditions.

Passe de contrôle à charge réduite (20:39 UTC, charge 14, `scratchpad/flux17/lh-calm/`) sur la home FR : mobile perf 60 (FCP 2,8 s, LCP 4,5 s, TBT 785 ms, Speed Index 3,4 s, TTFB 131 ms, benchmarkIndex 1 543), desktop perf 97 (LCP 1,1 s, TBT 35 ms). L'écart mobile/desktop est structurel : sous 1,6 Mb/s simulés, les 2,53 Mo d'images et les 9 feuilles bloquantes dominent, alors qu'à 10 Mb/s la page tient en 1,1 s.

### Lighthouse mobile : médianes de 3 passes (26 pages) ; n = passes valides retenues (les passes perturbées par un 502 du proxy sont exclues et listées)

| Page | n | Perf | A11y | BP | SEO | FCP s | LCP s | CLS | TBT ms | TTI s | SI s | TTFB ms | bench | Perf par passe | LCP par passe (ms) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| / (home EN) | 3 | 46 | 96 | 93 | 100 | 3,3 | 15,3 | 0 | 880 | 15,4 | 5,5 | 53 | 1205 | 68/44/46 | 15336/16192/3386 |
| /index-fr | 2 (exclue : p2) | 54 | 96 | 93 | 96 | 2,8 | 2,8 | 0,002 | 6025 | 10,1 | 14,4 | 178 | 883 | 67/40 | 1678/3927 |
| /our-solution | 3 | 57 | 97 | 96 | 100 | 2,6 | 2,8 | 0,021 | 1274 | 4,9 | 8 | 554 | 944 | 51/90/57 | 3650/2151/2787 |
| /notre-solution | 3 | 67 | 97 | 96 | 100 | 3 | 8,2 | 0,02 | 0 | 8,2 | 4,7 | 214 | 1268 | 56/87/67 | 8211/1722/12276 |
| /pricing | 3 | 81 | 95 | 93 | 100 | 3,1 | 3,5 | 0 | 0 | 3,5 | 5 | 80 | 1399 | 78/81/86 | 3515/3659/3167 |
| /tarifs | 3 | 81 | 95 | 93 | 100 | 2,9 | 2,9 | 0 | 217 | 3,5 | 4,6 | 61 | 1519 | 77/81/83 | 2950/3771/2469 |
| /faq | 3 | 79 | 100 | 96 | 100 | 2,5 | 2,6 | 0 | 668 | 3,7 | 4,5 | 53 | 1386 | 57/79/83 | 2473/2606/3679 |
| /faq-fr | 3 | 82 | 100 | 96 | 100 | 2,9 | 3,7 | 0 | 0 | 3,7 | 4,6 | 80 | 784 | 57/82/86 | 6623/3699/3135 |
| /about | 3 | 71 | 100 | 96 | 100 | 2,8 | 3,9 | 0,018 | 564 | 4 | 4,6 | 102 | 1065 | 45/81/71 | 5867/3868/1874 |
| /a-propos | 3 | 53 | 100 | 96 | 100 | 2,9 | 3,8 | 0 | 1050 | 6,4 | 5,1 | 90 | 565 | 53/49/58 | 2719/12193/3812 |
| /careers | 3 | 75 | 100 | 96 | 100 | 2,8 | 4,7 | 0 | 0 | 4,9 | 4,6 | 85 | 1615 | 52/75/75 | 2708/4780/4747 |
| /recrutement | 3 | 68 | 100 | 96 | 100 | 3 | 3,6 | 0,003 | 670 | 4,4 | 4,9 | 143 | 734 | 68/74/52 | 3557/3368/4974 |
| /contact | 3 | 63 | 100 | 96 | 100 | 1,9 | 2,5 | 0 | 2886 | 5,6 | 3,8 | 94 | 1454 | 58/63/91 | 2484/2964/1595 |
| /contact-fr | 3 | 68 | 100 | 96 | 100 | 2,9 | 12,1 | 0 | 0 | 12,1 | 4,5 | 45 | 1275 | 71/66/68 | 1859/12311/12137 |
| /customers | 3 | 86 | 100 | 96 | 100 | 2,8 | 3,2 | 0 | 0 | 3,3 | 4,4 | 59 | 712 | 82/88/86 | 3668/2705/3242 |
| /clients | 3 | 86 | 100 | 96 | 100 | 2,8 | 3,3 | 0 | 0 | 3,3 | 4,5 | 92 | 1019 | 82/86/91 | 3664/3252/2604 |
| /media | 3 | 99 | 100 | 96 | 100 | 1,6 | 1,7 | 0 | 0 | 1,9 | 2,2 | 78 | 1875 | 83/99/99 | 3658/1676/1605 |
| /medias | 3 | 83 | 100 | 96 | 100 | 2,9 | 3,6 | 0 | 0 | 3,7 | 4,6 | 59 | 2197 | 87/83/82 | 3073/3631/3705 |
| /legal-notice | 3 | 86 | 100 | 96 | 100 | 2,8 | 3,1 | 0 | 0 | 3,2 | 4,6 | 78 | 1532 | 95/86/81 | 1945/3147/3825 |
| /mentions-legales | 2 (exclue : p3) | 85 | 100 | 96 | 100 | 3 | 3,4 | 0,003 | 0 | 3,5 | 3,9 | 111 | 775 | 82/87 | 3631/3248 |
| /privacy | 3 | 89 | 100 | 96 | 100 | 3 | 3 | 0 | 0 | 3 | 3 | 93 | 631 | 68/89/89 | 4716/2997/2107 |
| /confidentialite | 3 | 89 | 100 | 96 | 100 | 1,7 | 1,8 | 0,013 | 411 | 2,3 | 1,9 | 68 | 1533 | 99/89/87 | 1687/1752/1990 |
| /terms | 3 | 83 | 100 | 96 | 100 | 2,8 | 3,7 | 0,001 | 0 | 3,7 | 4,4 | 48 | 1044 | 81/95/83 | 3698/1626/3675 |
| /conditions | 2 (exclue : p1) | 91 | 100 | 96 | 100 | 2,2 | 2,6 | 0,009 | 38 | 2,7 | 3 | 63 | 954 | 99/83 | 1609/3561 |
| /opt-out | 3 | 82 | 100 | 96 | 100 | 2,6 | 3,7 | 0 | 0 | 3,7 | 4,5 | 60 | 1530 | 81/82/83 | 2059/3748/3662 |
| /opposition | 3 | 83 | 100 | 96 | 100 | 2,9 | 3,4 | 0 | 0 | 3,5 | 4,4 | 57 | 1022 | 83/88/82 | 3430/3204/3724 |
| **médiane des 26 pages** | | **82** | **100** | **96** | **100** | 2,8 | 3,4 | 0 | 0 | 3,7 | 4,5 | 79 | 1135 | | |

### Lighthouse desktop : médianes de 3 passes (26 pages) ; n = passes valides retenues (les passes perturbées par un 502 du proxy sont exclues et listées)

| Page | n | Perf | A11y | BP | SEO | FCP s | LCP s | CLS | TBT ms | TTI s | SI s | TTFB ms | bench | Perf par passe | LCP par passe (ms) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| / (home EN) | 2 (exclue : p2) | 78 | 100 | 93 | 96 | 1,8 | 1,8 | 0,002 | 57 | 2,1 | 5,7 | 887 | 1018 | 72/84 | 2459/1187 |
| /index-fr | 3 | 55 | 100 | 93 | 92 | 1,3 | 1,4 | 0 | 333 | 4,2 | 4,2 | 257 | 899 | 55/78/53 | 1280/1405/6754 |
| /our-solution | 3 | 63 | 97 | 96 | 100 | 1,1 | 2,6 | 0,002 | 38 | 3,2 | 2,4 | 166 | 822 | 63/82/61 | 3205/2593/1050 |
| /notre-solution | 3 | 93 | 97 | 96 | 100 | 1,1 | 1,1 | 0,002 | 22 | 1,3 | 1,3 | 52 | 371 | 61/99/93 | 3659/674/1120 |
| /pricing | 3 | 71 | 95 | 93 | 100 | 1,1 | 1,1 | 0 | 584 | 1,8 | 1,3 | 93 | 1246 | 66/71/95 | 1224/555/1104 |
| /tarifs | 3 | 67 | 95 | 93 | 100 | 0,6 | 0,7 | 0,001 | 1315 | 2,7 | 1,7 | 60 | 1117 | 51/67/76 | 1532/714/553 |
| /faq | 3 | 98 | 100 | 96 | 100 | 0,9 | 0,9 | 0 | 0 | 1 | 1,2 | 106 | 539 | 56/98/99 | 6464/926/859 |
| /faq-fr | 3 | 96 | 100 | 96 | 92 | 0,9 | 1 | 0,001 | 0 | 1 | 1,4 | 136 | 1582 | 63/99/96 | 3162/628/1000 |
| /about | 3 | 66 | 100 | 96 | 100 | 0,6 | 2,1 | 0,002 | 836 | 2,6 | 2 | 88 | 1086 | 34/87/66 | 3430/2068/694 |
| /a-propos | 3 | 64 | 100 | 96 | 92 | 1,3 | 2 | 0,027 | 1015 | 2,5 | 1,6 | 144 | 1283 | 45/64/81 | 2009/1143/2452 |
| /careers | 3 | 68 | 100 | 96 | 100 | 1,8 | 1,8 | 0 | 1 | 2,5 | 1,9 | 180 | 1150 | 68/55/98 | 2481/1835/863 |
| /recrutement | 2 (exclue : p1) | 92 | 100 | 96 | 100 | 1,2 | 1,3 | 0,001 | 10 | 1,3 | 1,4 | 52 | 1151 | 86/97 | 1598/968 |
| /contact | 3 | 74 | 100 | 96 | 100 | 1,1 | 1,1 | 0 | 183 | 2,4 | 1,7 | 84 | 599 | 74/66/91 | 2220/962/1076 |
| /contact-fr | 2 (exclue : p3) | 92 | 100 | 96 | 100 | 1 | 1,6 | 0 | 0 | 1,6 | 1,1 | 46 | 1828 | 87/97 | 2220/1036 |
| /customers | 3 | 96 | 100 | 96 | 100 | 0,9 | 0,9 | 0 | 111 | 1,1 | 1 | 166 | 1239 | 99/81/96 | 785/905/957 |
| /clients | 2 (exclue : p1) | 98 | 100 | 96 | 100 | 0,7 | 0,8 | 0,001 | 53 | 0,8 | 1,1 | 162 | 1721 | 97/98 | 929/646 |
| /media | 2 (exclue : p3) | 98 | 100 | 96 | 100 | 0,9 | 0,9 | 0 | 0 | 0,9 | 1 | 53 | 1578 | 98/97 | 861/976 |
| /medias | 3 | 97 | 100 | 96 | 100 | 0,9 | 1 | 0 | 0 | 1 | 1,1 | 62 | 920 | 97/88/98 | 975/1006/883 |
| /legal-notice | 3 | 94 | 100 | 96 | 100 | 1,1 | 1,1 | 0 | 184 | 1,1 | 1,1 | 50 | 1082 | 85/94/96 | 1051/747/1061 |
| /mentions-legales | 3 | 93 | 100 | 96 | 100 | 1,3 | 1,3 | 0,001 | 0 | 1,3 | 1,3 | 53 | 1542 | 99/93/93 | 730/1276/1255 |
| /privacy | 3 | 97 | 100 | 96 | 100 | 0,8 | 0,8 | 0 | 58 | 1 | 1,2 | 118 | 1238 | 97/93/99 | 952/837/608 |
| /confidentialite | 3 | 97 | 100 | 96 | 100 | 0,9 | 0,9 | 0,003 | 0 | 0,9 | 1,1 | 84 | 1970 | 97/99/97 | 897/626/990 |
| /terms | 3 | 92 | 100 | 96 | 100 | 0,9 | 0,9 | 0,008 | 221 | 1 | 1,1 | 106 | 1009 | 96/89/92 | 1043/900/683 |
| /conditions | 3 | 99 | 100 | 96 | 100 | 0,8 | 0,8 | 0,001 | 0 | 0,8 | 0,9 | 48 | 1407 | 94/99/100 | 1138/772/471 |
| /opt-out | 3 | 85 | 100 | 96 | 100 | 1 | 1 | 0 | 283 | 1,4 | 1,5 | 80 | 1243 | 71/85/94 | 685/1008/1113 |
| /opposition | 3 | 90 | 100 | 96 | 100 | 1,1 | 1,1 | 0 | 167 | 1,5 | 1,2 | 62 | 1295 | 90/80/92 | 1452/942/1083 |
| **médiane des 26 pages** | | **92** | **100** | **96** | **100** | 1 | 1,1 | 0 | 55 | 1,3 | 1,3 | 86 | 1195 | | |

### Poids par page (passe mobile médiane ; desktop identique à ±1 Ko sauf mention)

| Page | Requêtes | Transfert | Décodé | Images (n, transfert) | CSS (n, transfert) | JS (n, transfert) | Polices (n, transfert) | HTML transfert | Tiers | Fichier JSON |
|---|---|---|---|---|---|---|---|---|---|---|
| / (home EN) | 32 | 2,61 Mo | 2,79 Mo | 11, 2,47 Mo | 9, 47 Ko | 8, 16 Ko | 2, 66 Ko | 8 Ko | 3 | home-en-mobile-p3.json |
| /index-fr | 32 | 2,61 Mo | 2,79 Mo | 11, 2,47 Mo | 9, 47 Ko | 8, 16 Ko | 2, 66 Ko | 9 Ko | 3 | index-fr-mobile-p1.json |
| /our-solution | 19 | 1,98 Mo | 2,11 Mo | 3, 1,87 Mo | 6, 35 Ko | 6, 12 Ko | 2, 66 Ko | 5 Ko | 3 | our-solution-mobile-p3.json |
| /notre-solution | 19 | 1,99 Mo | 2,11 Mo | 3, 1,87 Mo | 6, 35 Ko | 6, 12 Ko | 2, 66 Ko | 6 Ko | 3 | notre-solution-mobile-p3.json |
| /pricing | 17 | 1,98 Mo | 2,09 Mo | 3, 1,87 Mo | 5, 31 Ko | 5, 10 Ko | 2, 66 Ko | 4 Ko | 3 | pricing-mobile-p2.json |
| /tarifs | 17 | 1,98 Mo | 2,09 Mo | 3, 1,87 Mo | 5, 31 Ko | 5, 10 Ko | 2, 66 Ko | 4 Ko | 3 | tarifs-mobile-p2.json |
| /faq | 15 | 1,97 Mo | 2,08 Mo | 3, 1,87 Mo | 4, 28 Ko | 4, 9 Ko | 2, 66 Ko | 4 Ko | 3 | faq-mobile-p2.json |
| /faq-fr | 15 | 1,97 Mo | 2,08 Mo | 3, 1,87 Mo | 4, 28 Ko | 4, 9 Ko | 2, 66 Ko | 5 Ko | 3 | faq-fr-mobile-p2.json |
| /about | 19 | 2,00 Mo | 2,11 Mo | 5, 1,90 Mo | 5, 30 Ko | 5, 10 Ko | 2, 66 Ko | 4 Ko | 3 | about-mobile-p3.json |
| /a-propos | 19 | 2,00 Mo | 2,12 Mo | 5, 1,90 Mo | 5, 30 Ko | 5, 10 Ko | 2, 66 Ko | 4 Ko | 3 | a-propos-mobile-p1.json |
| /careers | 20 | 2,22 Mo | 2,32 Mo | 5, 2,11 Mo | 5, 30 Ko | 6, 11 Ko | 2, 66 Ko | 4 Ko | 3 | careers-mobile-p3.json |
| /recrutement | 20 | 2,22 Mo | 2,32 Mo | 5, 2,11 Mo | 5, 30 Ko | 6, 11 Ko | 2, 66 Ko | 5 Ko | 3 | recrutement-mobile-p1.json |
| /contact | 17 | 1,98 Mo | 2,08 Mo | 3, 1,87 Mo | 5, 30 Ko | 5, 11 Ko | 2, 66 Ko | 4 Ko | 3 | contact-mobile-p3.json |
| /contact-fr | 17 | 1,98 Mo | 2,08 Mo | 3, 1,87 Mo | 5, 30 Ko | 5, 11 Ko | 2, 66 Ko | 4 Ko | 3 | contact-fr-mobile-p2.json |
| /customers | 18 | 1,98 Mo | 2,08 Mo | 3, 1,87 Mo | 5, 30 Ko | 5, 12 Ko | 2, 66 Ko | 3 Ko | 3 | customers-mobile-p2.json |
| /clients | 18 | 1,98 Mo | 2,08 Mo | 3, 1,87 Mo | 5, 30 Ko | 5, 12 Ko | 2, 66 Ko | 3 Ko | 3 | clients-mobile-p3.json |
| /media | 15 | 1,97 Mo | 2,07 Mo | 3, 1,87 Mo | 4, 28 Ko | 4, 9 Ko | 2, 66 Ko | 3 Ko | 3 | media-mobile-p3.json |
| /medias | 15 | 1,97 Mo | 2,07 Mo | 3, 1,87 Mo | 4, 28 Ko | 4, 9 Ko | 2, 66 Ko | 3 Ko | 3 | medias-mobile-p3.json |
| /legal-notice | 16 | 1,97 Mo | 2,07 Mo | 3, 1,87 Mo | 5, 29 Ko | 4, 9 Ko | 2, 66 Ko | 3 Ko | 3 | legal-notice-mobile-p3.json |
| /mentions-legales | 16 | 1,97 Mo | 2,07 Mo | 3, 1,87 Mo | 5, 29 Ko | 4, 9 Ko | 2, 66 Ko | 3 Ko | 3 | mentions-legales-mobile-p2.json |
| /privacy | 16 | 1,97 Mo | 2,07 Mo | 3, 1,87 Mo | 5, 29 Ko | 4, 9 Ko | 2, 66 Ko | 3 Ko | 3 | privacy-mobile-p3.json |
| /confidentialite | 16 | 1,97 Mo | 2,08 Mo | 3, 1,87 Mo | 5, 29 Ko | 4, 9 Ko | 2, 66 Ko | 3 Ko | 3 | confidentialite-mobile-p3.json |
| /terms | 16 | 1,98 Mo | 2,08 Mo | 3, 1,87 Mo | 5, 29 Ko | 4, 9 Ko | 2, 66 Ko | 5 Ko | 3 | terms-mobile-p2.json |
| /conditions | 16 | 1,98 Mo | 2,08 Mo | 3, 1,87 Mo | 5, 29 Ko | 4, 9 Ko | 2, 66 Ko | 5 Ko | 3 | conditions-mobile-p3.json |
| /opt-out | 16 | 1,97 Mo | 2,07 Mo | 3, 1,87 Mo | 5, 29 Ko | 4, 9 Ko | 2, 66 Ko | 3 Ko | 3 | opt-out-mobile-p3.json |
| /opposition | 16 | 1,97 Mo | 2,07 Mo | 3, 1,87 Mo | 5, 29 Ko | 4, 9 Ko | 2, 66 Ko | 3 Ko | 3 | opposition-mobile-p1.json |

### Diagnostics Lighthouse par page (passe mobile médiane)

| Page | Perf | Élément LCP | Phases LCP (ms) | Ressources bloquantes (gain ms) | CSS inutilisé (Ko) | Images : gain octets (Ko) / gain LCP (ms) | Erreurs console | Échecs a11y | Échecs BP | Échecs SEO | bench |
|---|---|---|---|---|---|---|---|---|---|---|---|
| /home-en | 46 | p.demo-hero__subtitle « Synthetic Swarm detects the changes that create in » | TTFB 4184, Load Delay 0, Load Time 0, Render Delay -798 | 9 (1096) | 18 | 2261 / 0 | TypeError: Cannot set properties of null (setting 'hidden') | color-contrast(1) | image-aspect-ratio(1), errors-in-console(1) | robots-txt | 1172 |
| /index-fr | 67 | p.demo-hero__subtitle « Synthetic Swarm détecte les changements qui créent » | TTFB 689, Load Delay 0, Load Time 0, Render Delay 989 | 9 (398) | 18 | 2261 / 0 | TypeError: Cannot set properties of null (setting 'hidden') | color-contrast(1) | image-aspect-ratio(1), errors-in-console(1) | aucun | 1225 |
| /our-solution | 57 | h1 « From a business change to your next conversation. » | TTFB 2217, Load Delay 0, Load Time 0, Render Delay 571 | 6 (570) | 18 | 122 / 0 | aucune | color-contrast(5) | image-aspect-ratio(2) | aucun | 944 |
| /notre-solution | 67 | p « Nous repérons les changements qui comptent pour vo » | TTFB 667, Load Delay 0, Load Time 0, Render Delay 11609 | 6 (1306) | 18 | 122 / 450 | aucune | color-contrast(5) | image-aspect-ratio(2) | aucun | 1268 |
| /pricing | 81 | h1.reveal « Choose the volume that fits you. » | TTFB 627, Load Delay 0, Load Time 0, Render Delay 3032 | 5 (1174) | 18 | 122 / 300 | TypeError: Cannot set properties of null (setting 'hidden') | color-contrast(7), heading-order(1) | image-aspect-ratio(1), errors-in-console(1) | aucun | 1399 |
| /tarifs | 81 | h1.reveal « Choisissez le volume qui vous convient. » | TTFB 642, Load Delay 0, Load Time 0, Render Delay 3129 | 5 (1221) | 18 | 122 / 300 | TypeError: Cannot set properties of null (setting 'hidden') | color-contrast(7), heading-order(1) | image-aspect-ratio(1), errors-in-console(1) | aucun | 1554 |
| /faq | 79 | h1 « Your questions, clear answers. » | TTFB 628, Load Delay 0, Load Time 0, Render Delay 1978 | 4 (586) | 18 | 122 / 700 | aucune | aucun | image-aspect-ratio(1) | aucun | 1386 |
| /faq-fr | 82 | h1 « Vos questions, des réponses claires. » | TTFB 649, Load Delay 0, Load Time 0, Render Delay 3049 | 4 (1380) | 18 | 122 / 400 | aucune | aucun | image-aspect-ratio(1) | aucun | 784 |
| /about | 71 | h1 « We built the tool we were looking for. » | TTFB 637, Load Delay 0, Load Time 0, Render Delay 1237 | 5 (602) | 18 | 1934 / 300 | aucune | aucun | image-aspect-ratio(1) | aucun | 1078 |
| /a-propos | 53 | p « Deux expériences différentes nous ont confrontés a » | TTFB 6246, Load Delay 0, Load Time 0, Render Delay -3527 | 5 (1564) | 18 | 1934 / 0 | aucune | aucun | image-aspect-ratio(1) | aucun | 565 |
| /careers | 75 | h1 « Build what comes next with us. » | TTFB 649, Load Delay 0, Load Time 0, Render Delay 4131 | 5 (892) | 18 | 360 / 900 | aucune | aucun | image-aspect-ratio(1) | aucun | 1615 |
| /recrutement | 68 | h1 « Construisez la suite avec nous. » | TTFB 1848, Load Delay 0, Load Time 0, Render Delay 1709 | 5 (1660) | 18 | 360 / 0 | aucune | aucun | image-aspect-ratio(1) | robots-txt | 437 |
| /contact | 63 | p « A question, partnership, or just want to get in to » | TTFB 627, Load Delay 0, Load Time 0, Render Delay 2337 | 5 (759) | 18 | 1911 / 350 | aucune | aucun | image-aspect-ratio(1) | aucun | 1454 |
| /contact-fr | 68 | p « Une question, un partenariat ou envie d’échanger a » | TTFB 668, Load Delay 0, Load Time 0, Render Delay 11468 | 5 (1338) | 18 | 1911 / 9250 | aucune | aucun | image-aspect-ratio(1) | aucun | 2070 |
| /customers | 86 | h1 « They say it better than we do. » | TTFB 641, Load Delay 0, Load Time 0, Render Delay 2601 | 5 (1232) | 18 | 122 / 0 | aucune | aucun | image-aspect-ratio(1) | aucun | 712 |
| /clients | 86 | p « Découvrez comment nos clients utilisent Synthetic  » | TTFB 637, Load Delay 0, Load Time 0, Render Delay 2615 | 5 (1280) | 18 | 122 / 0 | aucune | aucun | image-aspect-ratio(1) | aucun | 881 |
| /media | 99 | h1 « Synthetic Swarm in the media » | TTFB 688, Load Delay 0, Load Time 0, Render Delay 988 | 4 (654) | 18 | 122 / 0 | aucune | aucun | image-aspect-ratio(1) | aucun | 1535 |
| /medias | 83 | p « Cet espace rassemblera les articles, podcasts, int » | TTFB 653, Load Delay 0, Load Time 0, Render Delay 2978 | 4 (1347) | 18 | 122 / 200 | aucune | aucun | image-aspect-ratio(1) | aucun | 2197 |
| /legal-notice | 86 | h2 « Know who to call. At the right time. » | TTFB 608, Load Delay 0, Load Time 0, Render Delay 2539 | 5 (1248) | 18 | 122 / 0 | aucune | aucun | image-aspect-ratio(1) | aucun | 1297 |
| /mentions-legales | 87 | p « Synthetic Swarm détecte les changements qui compte » | TTFB 667, Load Delay 0, Load Time 0, Render Delay 2581 | 5 (2050) | 18 | 122 / 0 | aucune | aucun | image-aspect-ratio(1) | aucun | 959 |
| /privacy | 89 | p « We may process your first and last name, professio » | TTFB 658, Load Delay 0, Load Time 0, Render Delay 2339 | 5 (2024) | 18 | 122 / 0 | aucune | aucun | image-aspect-ratio(1) | aucun | 1469 |
| /confidentialite | 89 | p « Les données proviennent de sources publiques et pr » | TTFB 694, Load Delay 0, Load Time 0, Render Delay 1058 | 5 (805) | 18 | 122 / 0 | aucune | aucun | image-aspect-ratio(1) | aucun | 1533 |
| /terms | 83 | p « Synthetic Swarm provides professionals with prospe » | TTFB 637, Load Delay 0, Load Time 0, Render Delay 3037 | 5 (1310) | 18 | 122 / 400 | aucune | aucun | image-aspect-ratio(1) | aucun | 1044 |
| /conditions | 99 | p « Synthetic Swarm fournit aux professionnels des fic » | TTFB 631, Load Delay 0, Load Time 0, Render Delay 977 | 5 (718) | 18 | 122 / 0 | aucune | aucun | image-aspect-ratio(1) | aucun | 371 |
| /opt-out | 82 | p « To request the removal of your contact details, em » | TTFB 657, Load Delay 0, Load Time 0, Render Delay 3091 | 5 (1305) | 18 | 122 / 400 | aucune | aucun | image-aspect-ratio(1) | aucun | 1530 |
| /opposition | 83 | p « Synthetic Swarm détecte les changements qui compte » | TTFB 659, Load Delay 0, Load Time 0, Render Delay 2771 | 5 (1517) | 18 | 122 / 0 | aucune | aucun | image-aspect-ratio(1) | aucun | 1022 |

### Images du dépôt : chargées par au moins une page (d'après les requêtes réseau des 26 pages) ou orphelines

| Fichier | Octets | Chargée par (pages) | Statut |
|---|---|---|---|
| assets/team/axel-ceo.png | 1 721 963 | les 26 pages | chargée |
| assets/louis-content.png | 1 465 727 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/proof-post-3.png | 1 253 391 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/proof-post-2.png | 1 183 371 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/follower-growth.png | 820 692 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/decor-6.png | 600 811 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/40612c4abf743aacd69ec8b9755a5d2e.png | 598 335 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/decor-5.png | 591 781 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/decor-7.png | 550 733 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/licorne-explosion.png | 536 103 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/licorne-letter-2.png | 515 711 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/femme-pouce-rouge.png | 488 296 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/femme-letter-2.png | 450 942 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/homme-couper.png | 276 878 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/dory-pic.png | 270 382 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/decor-3.png | 255 682 | /home-en, /index-fr | chargée |
| assets/decor-1.png | 177 883 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/trust/generali.jpg | 145 294 | /home-en, /index-fr | chargée |
| assets/decor-2.png | 143 894 | /home-en, /index-fr | chargée |
| assets/memoji-reflecting.png | 139 410 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/logo-black-narrow.png | 124 746 | les 26 pages | chargée |
| assets/team/ilan-cto.jpg | 110 587 | les 26 pages | chargée |
| assets/memoji-wishing.png | 86 171 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/gift-emoji.png | 60 818 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/Louis-adam.jpeg | 45 633 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/trust/swiss-life.svg | 32 520 | /home-en, /index-fr | chargée |
| assets/trust/allianz.png | 31 069 | /home-en, /index-fr | chargée |
| assets/lutecienne-logo.png | 25 735 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/emlyon-logo.png | 24 916 | /about, /a-propos | chargée |
| assets/customers/illustrative-claire.jpg | 21 645 | /home-en, /index-fr | chargée |
| assets/customers/illustrative-sonia.jpg | 21 257 | /home-en, /index-fr | chargée |
| assets/trust/axa.webp | 20 218 | /home-en, /index-fr | chargée |
| assets/customers/illustrative-thomas.jpg | 19 417 | /home-en, /index-fr | chargée |
| assets/trust/france-assurance.png | 18 988 | /home-en, /index-fr | chargée |
| assets/trust/abeille-assurances.svg | 7 738 | /home-en, /index-fr | chargée |
| assets/ieseg-logo.svg | 7 586 | /about, /a-propos | chargée |
| assets/logo-2x.png | 3 460 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/logo-white-2x.png | 3 460 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/itec-logo.png | 2 544 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/logo-black-2x.png | 2 334 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/logo-white.png | 1 233 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/logo.png | 1 233 | aucune | orpheline (ni référencée par une page, ni demandée) |
| assets/logo-black.png | 1 023 | 2 page(s) dans le HTML | référencée dans le HTML, jamais demandée au chargement (lazy hors écran, masquée ou JSON-LD) |
| assets/favicon.png | 604 | les 26 pages | chargée |

Total des images orphelines : 26 fichiers, 10 153 067 octets (9,68 Mo).

## Annexe B : waterfall de la home (FR et EN), Chromium 141 via Playwright + CDP

Méthode : `tools/wf17-waterfall.mjs` (Playwright Chromium via `browsers.mjs`, `Network.enable`, `Network.setCacheDisabled`, `performance.getEntriesByType('resource')` avec `renderBlockingStatus`, `page.coverage` JS et CSS, observateurs LCP, paint, layout-shift et longtask). Quatre passes : FR et EN, mobile 390x844 @3x (UA Pixel 7) et desktop 1440x900. JSON complets : `scratchpad/flux17/waterfall/*.json`. Captures : `docs/audit-total/screens/17/index-fr-mobile-waterfall.png` et `home-en-mobile-waterfall.png`.

Deux séries : la première (19:47 UTC) a tourné pendant que 22 flux saturaient les 4 CPU (charge 40 à 46) et le proxy TLS local ; ses durées absolues (TTFB 3 143 ms, FCP 10 320 ms, DCL 22 339 ms sur la home FR mobile) ne représentent pas le site. La seconde, home FR seulement, a été rejouée à charge réduite après la fin des passes Lighthouse : charge 16.67/19.37/24.18, TTFB 219 ms, FCP 860 ms, LCP 860 ms (P.demo-hero__subtitle), DCL 1549 ms, load 1798 ms, 34 requêtes, 2 795 732 o transférés. L'ordre, les priorités, les tailles, le statut bloquant, les couvertures et les dimensions d'images sont identiques dans les deux séries ; le tableau détaillé ci-dessous est celui de la série à charge réduite quand elle existe.

| Passe | Requêtes | Transfert | Décodé | Feuilles CSS bloquantes | Images (n, transfert) | Polices (n, transfert) | CSS utilisé | JS utilisé | Élément LCP | CLS |
|---|---|---|---|---|---|---|---|---|---|---|
| index-fr mobile | 34 | 2,67 Mo (2 795 720 o) | 2,79 Mo (2 924 250 o) | 9 | 14 (2,53 Mo) | 2 (66 Ko) | 30 % (54 Ko / 177 Ko) | 55 % (17 Ko / 31 Ko) | p.demo-hero__subtitle | 0,0015 |
| / (EN) mobile | 34 | 2,67 Mo | 2,79 Mo | 9 | 14 (2,53 Mo) | 2 (66 Ko) | 30 % | 55 % | p.demo-hero__subtitle | 0,0016 |
| index-fr desktop | 34 | 2,67 Mo | 2,79 Mo | 9 | 14 (2,53 Mo) | 2 (73 Ko) | 25 % (44 Ko / 177 Ko) | 54 % | span.hl.hero-word-highlight (« Au bon moment. ») | 0,0015 |
| / (EN) desktop | 34 | 2,67 Mo | 2,79 Mo | 9 | 14 (2,53 Mo) | 2 (73 Ko) | 25 % | 54 % | span.hl.hero-word-highlight (« At the right time. ») | 0,0015 |

Ordre de chargement (home FR mobile, 34 requêtes, cache désactivé) :

| # | Ressource | Type | Priorité | Bloquant | Départ (ms) | Fin (ms) | Transfert | Décodé | Initiateur |
|---|---|---|---|---|---|---|---|---|---|
| 1 | /index-fr | Document | VeryHigh | non | 0 | 284 | 9 Ko | 35 Ko | navigation |
| 2 | /styles.css?v=global-atmosphere-1 | Stylesheet | VeryHigh | oui | 261 | 420 | 20 Ko | 90 Ko | /index-fr:14 |
| 3 | /demo.css | Stylesheet | VeryHigh | oui | 262 | 426 | 3 Ko | 9 Ko | /index-fr:15 |
| 4 | /floating-demo.css?v=main-audit-1 | Stylesheet | VeryHigh | oui | 262 | 429 | 1 Ko | 3 Ko | /index-fr:16 |
| 5 | /home.css?v=prospect-inbox-1 | Stylesheet | VeryHigh | oui | 262 | 542 | 9 Ko | 34 Ko | /index-fr:17 |
| 6 | /pricing-interactive.css?v=stable-geometry-1 | Stylesheet | VeryHigh | oui | 262 | 558 | 3 Ko | 9 Ko | /index-fr:18 |
| 7 | /site-pages.css?v=brand-close-1 | Stylesheet | VeryHigh | oui | 262 | 583 | 5 Ko | 15 Ko | /index-fr:19 |
| 8 | fonts.googleapis.com/css2 (DM Serif Display ital, Inter 400 à 800, display=swap) | Stylesheet | VeryHigh | oui | 262 | 589 | 2 Ko | 13 Ko | /index-fr:22 |
| 9 | /customers.css | Stylesheet | VeryHigh | oui | 262 | 607 | 2 Ko | 3 Ko | /index-fr:23 |
| 10 | /motion.css?v=3 | Stylesheet | VeryHigh | oui | 262 | 628 | 1 Ko | 2 Ko | /index-fr:24 |
| 11 | /motion.js?v=main-audit-1 | Script | Low | non | 262 | 806 | 3 Ko | 6 Ko | /index-fr:25 |
| 12 | /home-motion.js?v=why-now-preview-1 | Script | Low | non | 262 | 821 | 2 Ko | 4 Ko | /index-fr:26 |
| 13 | /page-motion.js?v=2 | Script | Low | non | 262 | 874 | 2 Ko | 3 Ko | /index-fr:27 |
| 14 | /assets/logo-black-narrow.png | Image | Low | non | 263 | 1154 | 122 Ko | 122 Ko | /index-fr:52 |
| 15 | /assets/team/axel-ceo.png | Image | Low | non | 264 | 1205 | 1,64 Mo | 1,64 Mo | /index-fr:75 |
| 16 | /assets/team/ilan-cto.jpg | Image | Low | non | 264 | 1187 | 109 Ko | 108 Ko | /index-fr:76 |
| 17 | /assets/decor-2.png | Image | Medium | non | 264 | 696 | 141 Ko | 141 Ko | /index-fr:84 |
| 18 | /assets/decor-3.png | Image | Medium | non | 264 | 741 | 250 Ko | 250 Ko | /index-fr:85 |
| 19 | /pricing.js | Script | Medium | non | 264 | 696 | 2 Ko | 3 Ko | /index-fr:315 |
| 20 | /mobile-menu.js?v=motion-1 | Script | Medium | non | 264 | 739 | 3 Ko | 7 Ko | /index-fr:316 |
| 21 | /customers.js?v=home-flow-20260918 | Script | Low | non | 264 | 1187 | 3 Ko | 5 Ko | /index-fr:317 |
| 22 | /floating-demo.js?v=home-restore-1 | Script | Medium | non | 264 | 747 | 1 Ko | 1013 o | /index-fr:319 |
| 23 | /newsletter.js | Script | Low | non | 264 | 1337 | 1 Ko | 2 Ko | /index-fr:320 |
| 24 | fonts.gstatic.com/s/inter/…woff2 | Font | VeryHigh | non | 655 | 794 | 48 Ko |  | CSS Google Fonts |
| 25 | fonts.gstatic.com/s/dmserifdisplay/…woff2 | Font | VeryHigh | non | 655 | 1082 | 18 Ko |  | CSS Google Fonts |
| 26 | /assets/trust/axa.webp | Image | Low | non | 763 | 1055 | 20 Ko | 20 Ko | /index-fr:315 |
| 27 | /assets/trust/allianz.png | Image | Low | non | 763 | 991 | 31 Ko | 30 Ko | /index-fr:315 |
| 28 | /assets/trust/generali.jpg | Image | Low | non | 763 | 1123 | 142 Ko | 142 Ko | /index-fr:315 |
| 29 | /assets/trust/swiss-life.svg | Image | Low | non | 763 | 982 | 11 Ko | 32 Ko | /index-fr:315 |
| 30 | /assets/trust/abeille-assurances.svg | Image | Low | non | 763 | 982 | 3 Ko | 8 Ko | /index-fr:315 |
| 31 | /assets/trust/france-assurance.png | Image | Low | non | 763 | 1187 | 19 Ko | 19 Ko | /index-fr:315 |
| 32 | /assets/customers/illustrative-claire.jpg | Image | Low | non | 763 | 1399 | 22 Ko | 21 Ko | /index-fr:315 |
| 33 | /assets/customers/illustrative-thomas.jpg | Image | Low | non | 763 | 1399 | 19 Ko | 19 Ko | /index-fr:315 |
| 34 | /assets/customers/illustrative-sonia.jpg | Image | Low | non | 763 | 1400 | 21 Ko | 21 Ko | /index-fr:315 |

Total : 2 795 732 o transférés (2,67 Mo), 2 924 250 o décodés (2,79 Mo) ; TTFB 219 ms, FCP 860 ms, LCP 860 ms (P.demo-hero__subtitle), DCL 1549 ms, load 1798 ms, charge machine au lancement 16.67/19.37/24.18.


Lecture (Lighthouse compte 32 requêtes sur la même page : les 3 portraits `loading="lazy"` ne sont pas demandés avant la fin de sa trace) : les 9 feuilles de style (8 locales + le CSS Google Fonts) sont toutes `renderBlockingStatus: blocking` et partent en parallèle dès le HTML ; les 3 scripts de l'en-tête sont `defer` (non bloquants) ; les 5 images du haut de page (logo 1024 px, deux avatars 1254 px, deux décors 626 et 736 px) partent avec les scripts et pèsent 2,36 Mo à elles seules ; les deux polices woff2 ne partent qu'après réception du CSS Google Fonts (chaîne HTML → fonts.googleapis.com → fonts.gstatic.com) ; les 9 images `loading="lazy"` (logos de confiance, portraits clients) partent après le premier rendu ; `pricing.js`, `mobile-menu.js` et `floating-demo.js` (fin de body) sont sans `defer` et bloquent le parseur en fin de document.

Images de la home FR : dimensions servies contre affichées (mobile 390 px @3x ; desktop 1440 px entre parenthèses) :

| Image | Servie (px) | Poids | Affichée (px CSS) | Attributs | Chargement | Visible au chargement |
|---|---|---|---|---|---|---|
| /assets/team/axel-ceo.png | 1254x1254 | 1 721 963 o | 32x32 widget flottant (30x30) ; 38x38 popover d'en-tête et menu mobile (masqués) | width/height 38 ou 44 | immédiat, priorité Low | widget flottant oui ; 3 copies dans le DOM |
| /assets/team/ilan-cto.jpg | 1254x1254 | 110 587 o | idem | idem | immédiat | idem |
| /assets/logo-black-narrow.png | 1024x1024 | 124 746 o | 18x18 en-tête (20x20), 42x50 cœur du comparatif (52x62), 23x28 pied de page | width/height 20, 40x48, 23x28 | immédiat, High | oui (3 copies) |
| /assets/decor-2.png | 736x736 | 143 894 o | 37x37 (143x143) | aucun width/height | immédiat, Medium | oui |
| /assets/decor-3.png | 626x626 | 255 682 o | display:none en mobile (home.css lignes 323 et 529) ; 150x150 desktop | aucun width/height | immédiat, Medium | non en mobile : 255 Ko téléchargés pour rien |
| /assets/trust/allianz.png | 5000x3125 | 31 069 o | 104x65 (128x80) | aucun | lazy | oui |
| /assets/trust/generali.jpg | 808x668 | 145 294 o | 51x42 | aucun | lazy | oui |
| /assets/trust/axa.webp | 1280x1280 | 20 218 o | 36x36 | aucun | lazy | oui |
| /assets/trust/france-assurance.png | 600x146 | 18 988 o | 105x25 (116x28) | aucun | lazy | oui |
| /assets/trust/swiss-life.svg | 500x354 | 32 520 o (10 265 br) | 59x42 | aucun | lazy | oui |
| /assets/trust/abeille-assurances.svg | 300x109 | 7 738 o (2 455 br) | 105x38 (112x41) | aucun | lazy | oui |
| /assets/customers/illustrative-{claire,thomas,sonia}.jpg | 256x256 | 21 645, 19 417, 21 257 o | 64x64 | width/height 64 | lazy | hors écran |

Polices (tiers.csv, 26 pages) : `<link rel="preconnect">` vers fonts.googleapis.com et fonts.gstatic.com présents (index-fr.html lignes 20 et 21) ; CSS Google Fonts demandé en `<link rel="stylesheet">` bloquant (ligne 22) ; le CSS servi à Chrome contient 37 déclarations `@font-face` (7 sous-ensembles Unicode x 5 graisses Inter + 2 DM Serif Display), toutes `font-display: swap` (`scratchpad/flux17/headers/google-fonts-css-chrome.css`) ; 2 fichiers woff2 réellement téléchargés (Inter variable latin 48 432 o, DM Serif Display italique 17 660 o en mobile, 25 351 o en desktop) ; aucun `<link rel="preload" as="font">` ; `document.fonts` : 37 FontFace dont 6 `loaded`. Le CSS Google est `cache-control: private, max-age=86400`, les woff2 `public, max-age=31536000`.

Couverture CSS et JS sur la home FR mobile (page.coverage, après chargement et 4 s d'attente, sans interaction) :

| Fichier | Octets décodés | Utilisés | Taux |
|---|---|---|---|
| /styles.css?v=global-atmosphere-1 | 92 059 | 10 508 | 11 % |
| /home.css?v=prospect-inbox-1 | 34 357 | 22 607 | 66 % |
| /site-pages.css?v=brand-close-1 | 15 862 | 9 969 | 63 % |
| fonts.googleapis.com/css2 | 13 445 | 0 | 0 % (déclarations @font-face non comptées) |
| /pricing-interactive.css?v=stable-geometry-1 | 8 997 | 5 077 | 56 % |
| /demo.css | 8 844 | 3 966 | 45 % |
| /customers.css | 2 986 | 276 | 9 % |
| /floating-demo.css?v=main-audit-1 | 2 637 | 2 095 | 79 % |
| /motion.css?v=3 | 1 816 | 632 | 35 % |
| Total CSS | 181 003 | 55 130 | 30 % |
| /mobile-menu.js?v=motion-1 | 7 137 | 3 661 | 51 % |
| /motion.js?v=main-audit-1 | 6 516 | 4 016 | 62 % |
| /customers.js?v=home-flow-20260918 | 5 207 | 477 | 9 % |
| /home-motion.js?v=why-now-preview-1 | 3 769 | 3 134 | 83 % |
| /page-motion.js?v=2 | 3 292 | 2 087 | 63 % |
| /pricing.js | 2 889 | 2 636 | 91 % |
| /newsletter.js | 1 882 | 582 | 31 % |
| /floating-demo.js?v=home-restore-1 | 1 013 | 905 | 89 % |
| Total JS | 31 705 | 17 498 | 55 % |

`styles.css` (92 495 o, 789 blocs, 27 media queries) contient les sections d'une ancienne version du site (commentaires « MEET LOVABLE SECTION », « LETTER SECTION », « COST OF SLOW SECTION », « PROOF GALLERY », « FEATURED CUSTOMER (Louis) », « Floating sticker badges », lignes 670 à 2658) qui correspondent aux images orphelines (`proof-post-*.png`, `louis-content.png`, `licorne-*.png`, `femme-*.png`, `memoji-*.png`) : 89 % de ce fichier est inutile sur la home et il est chargé, bloquant, par les 26 pages.


Fichiers CSS et JS du dépôt (fichiers.csv) : pages référençantes, versionnage, utilisation sur la home FR mobile :

| Fichier | Octets | Pages référençantes | Suffixe ?v= dans les pages | Utilisé sur la home FR mobile (coverage) |
|---|---|---|---|---|
| about.css | 5 234 | 2 | (sans) | non chargé |
| careers.css | 3 730 | 2 | ?v=editorial-20260918 | non chargé |
| careers.js | 359 | 2 | ?v=editorial-20260918 | non chargé |
| contact.css | 3 529 | 2 | ?v=columns-20260918 | non chargé |
| contact.js | 3 336 | 2 | ?v=copy-20260918 | non chargé |
| customers.css | 2 986 | 4 | (sans) | 9 % (276 / 2 986) |
| customers.js | 5 210 | 4 | (sans) ; ?v=home-flow-20260918 | 9 % (477 / 5 207) |
| demo.css | 9 288 | 2 | (sans) | 45 % (3 966 / 8 844) |
| demo.js | 988 | 0 | non référencé | non chargé |
| editorial-motion.js | 1 246 | 4 | ?v=2 | non chargé |
| floating-demo.css | 2 637 | 4 | ?v=main-audit-1 | 79 % (2 095 / 2 637) |
| floating-demo.js | 1 013 | 2 | ?v=home-restore-1 | 89 % (905 / 1 013) |
| home-motion.js | 3 769 | 2 | ?v=why-now-preview-1 | 83 % (3 134 / 3 769) |
| home.css | 34 379 | 2 | ?v=prospect-inbox-1 | 66 % (22 607 / 34 357) |
| leadgen.css | 6 005 | 0 | non référencé | non chargé |
| legal.css | 803 | 6 | (sans) ; ?v=legal-cleanup | non chargé |
| mobile-menu.js | 7 138 | 26 | ?v=motion-1 | 51 % (3 661 / 7 137) |
| motion.css | 1 816 | 26 | ?v=3 | 35 % (632 / 1 816) |
| motion.js | 6 516 | 26 | ?v=main-audit-1 | 62 % (4 016 / 6 516) |
| newsletter.js | 1 890 | 26 | (sans) | 31 % (582 / 1 882) |
| page-motion.js | 3 292 | 26 | ?v=2 | 63 % (2 087 / 3 292) |
| pricing-interactive.css | 8 999 | 2 | ?v=stable-geometry-1 | 56 % (5 077 / 8 997) |
| pricing.js | 2 847 | 2 | (sans) | 91 % (2 636 / 2 889) |
| privacy.css | 606 | 2 | (sans) | non chargé |
| site-pages.css | 15 864 | 26 | ?v=brand-close-1 | 63 % (9 969 / 15 862) |
| solution-motion.js | 1 509 | 2 | ?v=chapter-progress-1 | non chargé |
| solution-page.css | 19 418 | 2 | ?v=chapter-progress-1 | non chargé |
| solution-page.js | 4 609 | 2 | ?v=chapter-progress-1 | non chargé |
| styles.css | 92 495 | 26 | ?v=global-atmosphere-1 | 11 % (10 508 / 92 059) |

Note : fichiers.csv attribue 2 pages à `demo.js` par la sous-chaîne de `floating-demo.js` ; aucune page ne charge `demo.js`.

## Annexe C : en-têtes de cache et compression (curl, `scratchpad/flux17/headers/`)

| Type | URL testée | cache-control | ETag | content-encoding (Accept-Encoding: br, gzip) | Autres |
|---|---|---|---|---|---|
| HTML | /index-fr | `public, max-age=0, must-revalidate` | `W/"5e5e3bda…"` (faible) | `br` (35 604 → 8 605 o ; gzip seul : 8 298 o ; identity : 35 604 o) | `x-vercel-cache: HIT`, `age`, HSTS 2 ans |
| CSS versionné | /styles.css?v=global-atmosphere-1 | `public, max-age=0, must-revalidate` | `W/"1e3329fe…"` | `br` (92 495 → 20 283 o) | `x-vercel-cache: HIT` |
| JS versionné | /motion.js?v=main-audit-1 | `public, max-age=0, must-revalidate` | `W/"17eedf54…"` | `br` | idem |
| PNG | /assets/team/axel-ceo.png | `public, max-age=0, must-revalidate` | `"46e1ad91…"` (fort) | aucun (1 721 963 o) | `accept-ranges: bytes` |
| WebP | /assets/trust/axa.webp | `public, max-age=0, must-revalidate` | fort | aucun | |
| JPEG | /assets/trust/generali.jpg | `public, max-age=0, must-revalidate` | fort | aucun | |
| SVG | /assets/trust/swiss-life.svg | `public, max-age=0, must-revalidate` | faible | `br` (32 520 → 10 265 o) | |
| Favicon | /assets/favicon.png | `public, max-age=0, must-revalidate` | fort | aucun (604 o) | |
| CSS Google Fonts | fonts.googleapis.com/css2?… | `private, max-age=86400, stale-while-revalidate=604800` | aucun | `gzip` (13 445 → 1 638 o) | `timing-allow-origin: *` |
| woff2 Google | fonts.gstatic.com/s/inter/v20/… | `public, max-age=31536000` | aucun | aucun (48 432 o) | `access-control-allow-origin: *` |

Revalidation : `curl -H 'If-None-Match: W/"1e3329fef304be74db88fe84c22a3d55"' /styles.css?v=global-atmosphere-1` → `HTTP/2 304`, `cache-control: public, max-age=0, must-revalidate` (`headers/curl-304.txt`). Conséquence : à chaque retour sur le site, le navigateur renvoie une requête conditionnelle pour chacune des ~30 ressources (CSS, JS, images, favicon) avant de pouvoir les réutiliser ; le versionnage `?v=` (présent sur 20 des 29 fichiers CSS/JS référencés, absent sur demo.css, customers.css, privacy.css, about.css, pricing.js, newsletter.js) n'apporte rien tant que la durée de cache est nulle. Lighthouse ne le signale pas (`uses-long-cache-ttl` : « 0 resources found ») car il exclut par construction les réponses `must-revalidate`. `vercel.json` ne contient aucune section `headers`.

Protocole : Chromium voit `http/1.1` sur toutes les requêtes à travers le proxy TLS local (audit Lighthouse `uses-http2` : « 29 requests not served via HTTP/2 »), mais `openssl s_client -proxy 127.0.0.1:41841 -alpn h2,http/1.1` négocie `ALPN protocol: h2` et curl rapporte `http_version 2` ; le protocole réellement négocié entre le proxy et Vercel n'est pas observable d'ici (pas d'`alt-svc` HTTP/3 renvoyé).

## Annexe D : images de plus de 150 Ko et images surdimensionnées (conversions mesurées)

Outil : ImageMagick 6.9.12 Q16 avec libwebp 1.3.2 (`cwebp` absent de l'environnement ; `convert` lit et écrit le WebP, lit l'AVIF sans l'écrire). Conversions faites dans `scratchpad/flux17/images/` (aucun fichier du dépôt modifié), tailles mesurées avec `stat -c %s` (`scratchpad/flux17/images/conversions.csv`). Le facteur d'échelle retenu est le double de la plus grande taille CSS affichée (DPR 2, ou DPR 3 sur mobile pour les avatars de 32 px), soit une marge visuelle confortable.

Images réellement chargées par au moins une page :

| Fichier (chargé par) | Dimensions | Poids actuel | Affichage max (px CSS) | WebP même taille q80 | WebP redimensionné q80 | Commande exacte (depuis la racine du dépôt) | Gain |
|---|---|---|---|---|---|---|---|
| assets/team/axel-ceo.png (26 pages) | 1254x1254 | 1 721 963 o | 44x44 (32x32 mobile @3x) ; 160x160 en portrait sur /about et /a-propos | 28 230 o | 906 o à 96 px ; 4 206 o à 320 px | `convert assets/team/axel-ceo.png -resize 96x96 -quality 80 assets/team/axel-ceo-96.webp` et `convert assets/team/axel-ceo.png -resize 320x320 -quality 80 assets/team/axel-ceo-320.webp` | 1 721 057 o (99,9 %) par page vue, 1 717 757 o sur /about |
| assets/team/ilan-cto.jpg (26 pages) | 1254x1254 | 110 587 o | 44x44 ; 160x160 sur /about et /a-propos | 55 402 o | 1 564 o à 96 px ; 7 516 o à 320 px | `convert assets/team/ilan-cto.jpg -resize 96x96 -quality 80 assets/team/ilan-cto-96.webp` et `convert assets/team/ilan-cto.jpg -resize 320x320 -quality 80 assets/team/ilan-cto-320.webp` | 109 023 o (98,6 %) |
| assets/logo-black-narrow.png (26 pages, 3 copies par page) | 1024x1024 | 124 746 o | 52x62 | 26 132 o | 1 734 o à 128 px | `convert assets/logo-black-narrow.png -resize 128x128 -quality 80 assets/logo-black-narrow-128.webp` | 123 012 o (98,6 %) |
| assets/decor-3.png (index, index-fr) | 626x626 | 255 682 o | 150x150 desktop, masquée en mobile | 25 208 o | 9 558 o à 320 px | `convert assets/decor-3.png -resize 320x320 -quality 80 assets/decor-3-320.webp` | 246 124 o (96,3 %), et 100 % en mobile avec `loading="lazy"` |
| assets/trust/generali.jpg (index, index-fr) | 808x668 | 145 294 o | 51x42 | 30 078 o | 5 618 o à 160 px | `convert assets/trust/generali.jpg -resize 160x -quality 80 assets/trust/generali-160.webp` | 139 676 o (96,1 %) |
| assets/decor-2.png (index, index-fr) | 736x736 | 143 894 o | 143x143 | 19 688 o | 6 042 o à 300 px | `convert assets/decor-2.png -resize 300x300 -quality 80 assets/decor-2-300.webp` | 137 852 o (95,8 %) |
| assets/trust/allianz.png (index, index-fr) | 5000x3125 | 31 069 o | 128x80 | 71 230 o (pire : PNG à palette) | 4 054 o à 260 px | `convert assets/trust/allianz.png -resize 260x -quality 80 assets/trust/allianz-260.webp` | 27 015 o (87 %) |
| assets/trust/axa.webp (index, index-fr) | 1280x1280 | 20 218 o | 36x36 | 20 986 o | 1 684 o à 112 px | `convert assets/trust/axa.webp -resize 112x112 -quality 80 assets/trust/axa-112.webp` | 18 534 o (91,7 %) |
| assets/trust/france-assurance.png (index, index-fr) | 600x146 | 18 988 o | 116x28 | 12 284 o | 4 330 o à 240 px | `convert assets/trust/france-assurance.png -resize 240x -quality 80 assets/trust/france-assurance-240.webp` | 14 658 o (77,2 %) |
| assets/emlyon-logo.png (about, a-propos) | 566x565 | 24 916 o | hauteur 22 px | non mesuré | 4 542 o à 240 px | `convert assets/emlyon-logo.png -resize 240x -quality 80 assets/emlyon-logo-240.webp` | 20 374 o (81,8 %) |

Gain cumulé mesuré sur la home : les 9 images ci-dessus passent de 2 572 441 o à 35 490 o ; le transfert de la home passe de 2 795 720 o à environ 258 000 o (HTML 9 152, CSS 47 646, JS 16 467, polices 67 637, SVG et portraits inchangés 82 000, images converties 35 490) ; sur les 25 autres pages, les trois fichiers communs (axel-ceo.png, ilan-cto.jpg, logo-black-narrow.png : 1 957 296 o) tombent à 4 204 o.

Images orphelines (servies en 200, référencées par aucune page, jamais demandées au cours des 156 passes Lighthouse ni des waterfalls Playwright ; certaines sont citées par BRAND.md ou README.md, qui ne sont pas des pages) : la correction est la suppression du déploiement, pas la conversion ; les tailles WebP mesurées montrent seulement que les fichiers sont aussi mal compressés.

| Fichier | Octets | WebP même taille q80 (mesuré) |
|---|---|---|
| assets/louis-content.png | 1 465 727 | 37 984 o |
| assets/proof-post-3.png | 1 253 391 | 99 544 o |
| assets/proof-post-2.png | 1 183 371 | 52 608 o |
| assets/follower-growth.png | 820 692 | 20 638 o |
| assets/decor-6.png | 600 811 | 63 826 o |
| assets/40612c4abf743aacd69ec8b9755a5d2e.png | 598 335 | 36 308 o |
| assets/decor-5.png | 591 781 | 39 898 o |
| assets/decor-7.png | 550 733 | 31 628 o |
| assets/licorne-explosion.png | 536 103 | 46 508 o |
| assets/licorne-letter-2.png | 515 711 | 41 580 o |
| assets/femme-pouce-rouge.png | 488 296 | 25 082 o |
| assets/femme-letter-2.png | 450 942 | 32 950 o |
| assets/homme-couper.png | 276 878 | 18 890 o |
| assets/dory-pic.png | 270 382 | 26 290 o |
| assets/decor-1.png | 177 883 | 17 378 o |
| assets/memoji-reflecting.png | 139 410 | 12 578 o |
| assets/memoji-wishing.png | 86 171 | non converti (petit fichier ou SVG) |
| assets/gift-emoji.png | 60 818 | non converti (petit fichier ou SVG) |
| assets/Louis-adam.jpeg | 45 633 | non converti (petit fichier ou SVG) |
| assets/lutecienne-logo.png | 25 735 | non converti (petit fichier ou SVG) |
| assets/logo-2x.png | 3 460 | non converti (petit fichier ou SVG) |
| assets/logo-white-2x.png | 3 460 | non converti (petit fichier ou SVG) |
| assets/itec-logo.png | 2 544 | non converti (petit fichier ou SVG) |
| assets/logo-black-2x.png | 2 334 | non converti (petit fichier ou SVG) |
| assets/logo-white.png | 1 233 | non converti (petit fichier ou SVG) |
| assets/logo.png | 1 233 | non converti (petit fichier ou SVG) |

Total : 26 fichiers, 10 153 067 o (9,68 Mo).

Images chargées par au moins une page (requêtes réseau des 156 passes Lighthouse et des waterfalls Playwright) :

| Fichier | Octets | Chargée par |
|---|---|---|
| assets/team/axel-ceo.png | 1 721 963 | les 26 pages |
| assets/decor-3.png | 255 682 | /home-en, /index-fr |
| assets/trust/generali.jpg | 145 294 | /home-en, /index-fr |
| assets/decor-2.png | 143 894 | /home-en, /index-fr |
| assets/logo-black-narrow.png | 124 746 | les 26 pages |
| assets/team/ilan-cto.jpg | 110 587 | les 26 pages |
| assets/trust/swiss-life.svg | 32 520 | /home-en, /index-fr |
| assets/trust/allianz.png | 31 069 | /home-en, /index-fr |
| assets/emlyon-logo.png | 24 916 | /a-propos, /about |
| assets/customers/illustrative-claire.jpg | 21 645 | /home-en, /index-fr |
| assets/customers/illustrative-sonia.jpg | 21 257 | /home-en, /index-fr |
| assets/trust/axa.webp | 20 218 | /home-en, /index-fr |
| assets/customers/illustrative-thomas.jpg | 19 417 | /home-en, /index-fr |
| assets/trust/france-assurance.png | 18 988 | /home-en, /index-fr |
| assets/trust/abeille-assurances.svg | 7 738 | /home-en, /index-fr |
| assets/ieseg-logo.svg | 7 586 | /a-propos, /about |
| assets/favicon.png | 604 | les 26 pages |

Images référencées par le HTML mais jamais demandées par le navigateur : assets/logo-black.png (1 023 o, 2 pages) (logo du JSON-LD : à conserver).


Commande de retrait (les fichiers restent dans l'historique git) : `git rm assets/40612c4abf743aacd69ec8b9755a5d2e.png assets/decor-1.png assets/decor-5.png assets/decor-6.png assets/decor-7.png assets/dory-pic.png assets/femme-letter-2.png assets/femme-pouce-rouge.png assets/follower-growth.png assets/homme-couper.png assets/licorne-explosion.png assets/licorne-letter-2.png assets/louis-content.png assets/proof-post-2.png assets/proof-post-3.png assets/memoji-reflecting.png assets/memoji-wishing.png assets/gift-emoji.png assets/lutecienne-logo.png assets/Louis-adam.jpeg assets/itec-logo.png assets/logo-2x.png assets/logo-black-2x.png assets/logo-white-2x.png assets/logo-white.png assets/logo.png leadgen.css demo.js` (les 26 images orphelines du tableau ci-dessus plus les deux fichiers CSS/JS orphelins ; `assets/logo-black.png`, référencé par le JSON-LD, est conservé).

## Annexe E : corrections exactes (à coller)

E1. Cache navigateur (vercel.json, à la racine, après `"trailingSlash": false,`) :

```json
  "headers": [
    { "source": "/assets/(.*)", "headers": [ { "key": "Cache-Control", "value": "public, max-age=2592000, stale-while-revalidate=86400" } ] },
    { "source": "/(.*)\\.(css|js)", "headers": [ { "key": "Cache-Control", "value": "public, max-age=604800, stale-while-revalidate=86400" } ] }
  ],
```

Quand tous les CSS et JS porteront un `?v=` changé à chaque modification (manque sur demo.css, customers.css, privacy.css, about.css, legal.css sur 5 pages, pricing.js, newsletter.js, customers.js sur 3 pages), remplacer la seconde valeur par `public, max-age=31536000, immutable`.

E2. Images (après avoir créé les fichiers WebP de l'annexe D) :

```sh
sed -i 's#/assets/team/axel-ceo.png#/assets/team/axel-ceo-96.webp#g; s#/assets/team/ilan-cto.jpg#/assets/team/ilan-cto-96.webp#g; s#/assets/logo-black-narrow.png#/assets/logo-black-narrow-128.webp#g' *.html scripts/site_layout.py
sed -i 's#<img src="/assets/decor-2.png" alt="" class="hero-decor hero-decor--sparkles-lg" aria-hidden="true">#<img src="/assets/decor-2-300.webp" alt="" class="hero-decor hero-decor--sparkles-lg" aria-hidden="true" width="300" height="300">#; s#<img src="/assets/decor-3.png" alt="" class="hero-decor hero-decor--rocket" aria-hidden="true">#<img src="/assets/decor-3-320.webp" alt="" class="hero-decor hero-decor--rocket" aria-hidden="true" width="320" height="320" loading="lazy">#' index.html index-fr.html
sed -i 's#src="/assets/trust/axa.webp" alt="AXA" loading="lazy" decoding="async"#src="/assets/trust/axa-112.webp" alt="AXA" width="112" height="112" loading="lazy" decoding="async"#; s#src="/assets/trust/allianz.png" alt="Allianz" loading="lazy" decoding="async"#src="/assets/trust/allianz-260.webp" alt="Allianz" width="260" height="163" loading="lazy" decoding="async"#; s#src="/assets/trust/generali.jpg" alt="Generali" loading="lazy" decoding="async"#src="/assets/trust/generali-160.webp" alt="Generali" width="160" height="132" loading="lazy" decoding="async"#; s#src="/assets/trust/france-assurance.png" alt="France Assurance" loading="lazy" decoding="async"#src="/assets/trust/france-assurance-240.webp" alt="France Assurance" width="240" height="58" loading="lazy" decoding="async"#; s#src="/assets/trust/swiss-life.svg" alt="Swiss Life" loading="lazy"#src="/assets/trust/swiss-life.svg" alt="Swiss Life" width="500" height="354" loading="lazy"#; s#src="/assets/trust/abeille-assurances.svg" alt="Abeille Assurances" loading="lazy"#src="/assets/trust/abeille-assurances.svg" alt="Abeille Assurances" width="300" height="109" loading="lazy"#' index.html index-fr.html
sed -i 's#logo-black-narrow-128.webp" alt="" width="23" height="28"#logo-black-narrow-128.webp" alt="" width="28" height="28"#' *.html scripts/site_layout.py
sed -i 's#class="founder-portrait" src="/assets/team/axel-ceo-96.webp"#class="founder-portrait" src="/assets/team/axel-ceo-320.webp"#; s#class="founder-portrait" src="/assets/team/ilan-cto-96.webp"#class="founder-portrait" src="/assets/team/ilan-cto-320.webp"#; s#src="/assets/emlyon-logo.png?v=20260918"#src="/assets/emlyon-logo-240.webp"#' about.html a-propos.html
```

E3. Élément LCP fondu depuis opacity 0 (home-motion.js, lignes 7 à 9) : supprimer les trois lignes

```js
    M.step(q('.motion-headline-part'),220,'line'),
    M.step(q('.demo-hero__headline .hl'),300,'line'),
    M.step(q('.demo-hero__subtitle'),360),
```

(le titre et le sous-titre restent peints dès le premier rendu ; l'accroche, les boutons, l'aurore et les décors continuent d'apparaître en fondu).

E4. Feuilles de style bloquantes : sur index.html et index-fr.html, remplacer les lignes 16, 18, 23 et 24 par des chargements non bloquants :

```html
  <link rel="stylesheet" href="/floating-demo.css?v=main-audit-1" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="/pricing-interactive.css?v=stable-geometry-1" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="/customers.css" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="/motion.css?v=3" media="print" onload="this.media='all'">
```

puis purger styles.css (11 % utilisé sur la home, 92 495 o chargés par les 26 pages) : `npx purgecss@7 --css styles.css --content '*.html' '*.js' --safelist-patterns '^(is-|open|visible|reveal|hidden|motion-|mobile-menu|floating-demo)' --output purged/` et comparer visuellement avant de remplacer ; objectif mesurable : 9 feuilles bloquantes (47 646 o transférés, 181 003 o décodés) ramenées à 3 au plus.

E5. Polices : remplacer, sur les 26 pages (et scripts/site_layout.py lignes 123 à 125), les trois lignes preconnect + link Google Fonts par un auto-hébergement des deux fichiers réellement utilisés (licence SIL OFL pour Inter et DM Serif Display) :

```sh
mkdir -p assets/fonts
curl -sSo assets/fonts/inter-latin-var.woff2 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2'
curl -sSo assets/fonts/dm-serif-display-italic-latin.woff2 'https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFhOHM81r4j6k0gjAW3mujVU2B2G_VB0PD2xWr53A.woff2'
```

```html
  <link rel="preload" href="/assets/fonts/inter-latin-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/dm-serif-display-italic-latin.woff2" as="font" type="font/woff2" crossorigin>
  <style>
    @font-face{font-family:'Inter';font-style:normal;font-weight:400 800;font-display:swap;src:url(/assets/fonts/inter-latin-var.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
    @font-face{font-family:'DM Serif Display';font-style:italic;font-weight:400;font-display:swap;src:url(/assets/fonts/dm-serif-display-italic-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
  </style>
```

(le fichier Inter servi par Google est une police variable couvrant les graisses 400 à 800 : une seule déclaration suffit ; un CSS bloquant tiers et un aller-retour DNS/TLS vers fonts.googleapis.com disparaissent de la chaîne critique).

E6. Scripts sans defer en fin de body (index.html et index-fr.html lignes 315, 316 et 319 ; scripts/site_layout.py ligne 133 ; les 26 pages pour mobile-menu.js) :

```sh
sed -i 's#<script src="/pricing.js"></script>#<script src="/pricing.js" defer></script>#; s#<script src="/mobile-menu.js?v=motion-1"></script>#<script src="/mobile-menu.js?v=motion-1" defer></script>#; s#<script src="/floating-demo.js?v=home-restore-1"></script>#<script src="/floating-demo.js?v=home-restore-1" defer></script>#' *.html
```

E7. Erreur console pricing.js (ligne 48, sur les 4 pages qui incluent le configurateur : /, /index-fr, /pricing, /tarifs) : le bloc `[data-pricing-custom-booking]` (index-fr.html lignes 268 à 270) ne contient aucun `[data-disclosure-panel]`, donc `querySelector` renvoie null à chaque chargement et à chaque mouvement du curseur. Remplacer les lignes 48 et 49 par :

```js
      customBooking.querySelector('[data-disclosure-panel]')?.setAttribute('hidden', '');
      customBooking.querySelector('[data-book-demo]')?.setAttribute('aria-expanded', 'false');
```

E8. Contrastes relevés par Lighthouse (score accessibilité) : demo.css ligne 151 `background: #e74c3c;` → `background: #c0392b;` (blanc sur #c0392b : 5,44:1) ; solution-page.css ligne 50 `color:#81817d` → `color:#666666` (5,27:1 au pire sur les fonds #f7f5f0 à #ffffff) ; solution-page.css ligne 59 `color:#787872` → `color:#6b6b66` (5,36:1 sur blanc) ; pricing-interactive.css lignes 41, 145 et 259 `color: #777;` → `color: #6a6a6a;` (5,41:1) ; pricing-interactive.css ligne 63 `color: #888;` → `color: #707070;` (4,95:1).

E9. Ordre des titres sur /pricing et /tarifs (ligne 112 des deux fichiers) : `<h3>Questions before you start</h3>` et `<h3>Questions avant de commencer</h3>` → `<h2>…</h2>` (un h3 suit directement le h1).

E10. Bouton langue (26 pages, ligne 65 d'index-fr.html ; scripts/site_layout.py) : `aria-label="Choisir la langue"` masque le texte visible « FR » ; remplacer par `aria-label="FR, choisir la langue"` (et `aria-label="EN, choose language"` sur les pages EN) pour que le nom accessible contienne le texte visible.

## Annexe F : connexion 3G rapide simulée (Playwright + CDP)

Paramètres : `Network.emulateNetworkConditions` latence 150 ms, descendant 200 000 o/s (1,6 Mb/s), montant 93 750 o/s (750 kb/s) ; `Emulation.setCPUThrottlingRate` 4 ; contexte mobile 390x844 @3x (UA Pixel 7) ; cache désactivé ; observateurs paint, LCP, layout-shift, longtask ; TTI approché = fin de la dernière tâche longue avant une fenêtre calme de 5 s après le FCP (sans le critère réseau) ; filmstrip par `Page.startScreencast` (JPEG). Scripts : `tools/g3-17.mjs`, `tools/g3-17-filmstrip.mjs`. Données : `scratchpad/flux17/g3*/`.

| Conditions (charge machine au lancement) | Page | TTFB | FCP | LCP (élément) | DCL | load | TTI approché | TBT | CLS | Requêtes | Transfert | Frames |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sous charge (19:53 UTC) (charge 40,75) | /index-fr | 6,7 s | 22,8 s | 22,8 s (P.demo-hero__subtitle) | 34,6 s | 43,6 s | 28,1 s | 287 ms | 0,0019 | 31 | 2,61 Mo | 95 |
| sous charge (19:53 UTC) (charge 45,40) | /tarifs | 1,9 s | 7,0 s | 7,0 s (H1.reveal) | 13,5 s | 20,7 s | 9,9 s | 475 ms | 0 | 16 | 1,98 Mo | 516 |
| sous charge (19:53 UTC) (charge 45,06) | /notre-solution | 1,4 s | 6,6 s | 6,6 s (P) | 12,0 s | 19,5 s | 10,1 s | 894 ms | 0,0072 | 18 | 1,98 Mo | 400 |
| charge réduite (charge 16,44) | /index-fr | 0,1 s | 1,2 s | 1,2 s (P.demo-hero__subtitle) | 5,5 s | 15,3 s | 5,4 s | 1084 ms | 0,0015 | 31 | 2,61 Mo | 231 |
| charge réduite (charge 16,04) | /tarifs | 0,2 s | 1,1 s | 1,1 s (H1.reveal) | 1,2 s | 11,2 s | 3,2 s | 774 ms | 0,0031 | 16 | 1,98 Mo | 783 |
| charge réduite (charge 16,25) | /notre-solution | 0,4 s | 1,6 s | 1,6 s (P) | 1,6 s | 11,6 s | 3,0 s | 642 ms | 0,0076 | 18 | 1,98 Mo | 388 |

Filmstrips : `docs/audit-total/screens/17/index-fr-mobile-3g-filmstrip.png`, `tarifs-mobile-3g-filmstrip.png`, `notre-solution-mobile-3g-filmstrip.png` (9 vignettes de t=0 au load, plus les instants FCP, LCP, DCL s'ils tombent entre deux vignettes ; série la moins chargée si elle existe).

## Compte

Lignes du tableau principal : 29. Par verdict : DÉGRADÉ 19, OK 8, NON TESTABLE 2. Par sévérité : MAJEUR 11, n/a 10, MINEUR 8. Aucune ligne CASSÉ ni TROMPEUR ni BLOQUANT.

## Couverture

- pages.csv : les 26 pages (/, /index-fr, /our-solution, /notre-solution, /pricing, /tarifs, /faq, /faq-fr, /about, /a-propos, /careers, /recrutement, /contact, /contact-fr, /customers, /clients, /media, /medias, /legal-notice, /mentions-legales, /privacy, /confidentialite, /terms, /conditions, /opt-out, /opposition) : 6 passes Lighthouse chacune (annexe A), poids par page, diagnostics ; waterfall détaillé sur / et /index-fr ; 3G sur /index-fr, /tarifs, /notre-solution ; en-têtes de cache sur l'ensemble des types.
- fichiers.csv, images (44 fichiers image du dépôt) : chaque image est classée chargée (avec ses pages) ou orpheline dans l'annexe D ; les 9 images chargées de plus de 18 Ko ont une conversion mesurée et une commande exacte ; favicon.png, emlyon-logo.png, ieseg-logo.svg, les 3 portraits illustratifs et les SVG de confiance sont couverts par le tableau « chargées » (aucune anomalie de poids) ; logo-black.png (JSON-LD) est classé « référencée, jamais demandée ».
- fichiers.csv, CSS et JS (15 CSS, 14 JS) : tableau de l'annexe B (pages référençantes, versionnage, couverture sur la home) ; leadgen.css et demo.js signalés orphelins ; styles.css signalé à 11 % d'utilisation ; en-têtes de cache et compression vérifiés sur styles.css et motion.js (annexe C).
- tiers.csv (78 lignes : fonts.googleapis.com et fonts.gstatic.com sur les 26 pages) : ligne « Polices web » du tableau principal et annexe B (polices), annexe C (en-têtes Google Fonts), ligne « Domaines tiers ».
- Non couvert par ce flux (autres flux) : actions.csv, emails.csv, l'application app.syntheticswarm.ai.
