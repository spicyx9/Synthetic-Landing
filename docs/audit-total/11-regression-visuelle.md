# Flux 11 : régression visuelle et cohérence de rendu
Périmètre : production https://www.syntheticswarm.ai, Chromium, 26 pages de inventaire/pages.csv, viewports 390x844 et 1440x900, captures pleine page avec animations désactivées (reducedMotion reduce, document.fonts.ready + 1 s) ; comparaison géométrique des 13 paires FR/EN ; en-tête et pied de page comparés au pixel près sur les 26 pages ; cohérence par page (espaces, recouvrements, images, débordements) ; versions des CSS/JS par page.
Outils : Playwright 1.56.1 + Chromium 1194 (module partagé browsers.mjs, proxy TLS), pixelmatch 7.2.0, pngjs 7.0.0, ImageMagick convert, Node 22, Python 3.11 (beautifulsoup4, lxml), curl, grep.
Début : 2026-09-19T19:36:11Z  Fin : 2026-09-19T20:26:33Z
Statut : COMPLET

Synthèse : les 26 pages se chargent et se rendent de façon cohérente sur les deux viewports (52 vues, HTTP 200, 0 requête échouée, 0 erreur console) : en-tête et pied de page identiques en structure, texte et géométrie sur toutes les pages, paires FR/EN alignées bloc à bloc (même ordre, même nombre de blocs, écarts de hauteur tous expliqués par la longueur du texte), aucun recouvrement, aucun espace anormal, aucune image cassée. Deux défauts visibles par un prospect : la bande "Detected changes" de la page d'accueil est coupée pour les visiteurs ayant activé la réduction des animations (jusqu'à 8 signaux sur 10 invisibles à 390 px, 1 à 2 sur 10 à 1440 px) et le logo du pied de page est étiré verticalement de 22 % sur les 26 pages. À corriger aussi, sans effet visible aujourd'hui : legal.css inclus deux fois sur /conditions, et des références d'actifs non harmonisées (chemins relatifs sur /pricing et /tarifs, versions de cache différentes pour legal.css et customers.js).

## Tableau des constats

| Verdict | Sévérité | Page(s) | Élément | Attendu | Constaté | Preuve | Correction exacte |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OK | n/a | les 26 pages (/, /index-fr, /our-solution, /notre-solution, /pricing, /tarifs, /faq, /faq-fr, /about, /a-propos, /careers, /recrutement, /contact, /contact-fr, /customers, /clients, /media, /medias, /legal-notice, /mentions-legales, /privacy, /confidentialite, /terms, /conditions, /opt-out, /opposition), 390x844 et 1440x900 | Chargement et capture pleine page | HTTP 200, URL finale égale à l'URL demandée, `lang` conforme, page rendue en entier | 52 vues : HTTP 200, URL finale identique (aucune redirection de langue), `lang` en sur les 13 pages EN et fr sur les 13 pages FR, 0 requête échouée, 0 erreur console, hauteurs de 1251 px (/opt-out, /opposition à 1440) à 6762 px (/index-fr à 390) | docs/audit-total/screens/11/<page>-<viewport>-fullpage.jpg (52 fichiers, JPEG q50) ; scratchpad/flux11/capture.log (52 lignes "OK ... 200") ; Annexe A (hauteurs) | aucune |
| OK | n/a | 13 paires FR/EN, 2 viewports | Ordre et nombre des blocs de niveau 1 (enfants directs de `main`) | identiques entre FR et EN | identiques sur les 26 comparaisons : 8/8 (index), 3/3 (solution), 1/1 (pricing), 3/3 (faq), 3/3 (about), 4/4 (careers), 2/2 (contact), 3/3 (customers), 4/4 (media), 5/5 (legal-notice), 7/7 (privacy), 23/23 (terms), 4/4 (opt-out) ; ordre identique partout | Annexe A ; scratchpad/flux11/analysis.json (`sameOrder: true` sur les 26 entrées) | aucune |
| OK | n/a | 13 paires FR/EN, 2 viewports | Hauteur des blocs de niveau 1 et 2 (seuil 40 px) | écarts expliqués par le contenu | 30 blocs avec un écart de plus de 40 px, tous avec un texte FR plus long (ex. /a-propos `section.about-founders` 774 caractères contre 641, +99 px à 390 et +50 px à 1440 ; /recrutement `section.careers-reasons` 356 contre 282, +108 px à 390 ; /conditions sections 13 et 15, +54 px à 390) ou un `h1` FR passant sur deux lignes à 1440 (/faq-fr "Vos questions, des réponses claires." 36 caractères, 58 px contre 116 px ; /clients idem) ; hauteurs de page FR plus grandes de 0 à 412 px (/conditions à 390) ; footer FR plus haut de 86 px à 390 (1400,6 px contre 1314,9 px : phrase de marque plus longue) et identique à 1440 (823,25 px) | Annexe A ; docs/audit-total/screens/11/pair-<en>-vs-<fr>-<viewport>.png (26 diffs d'illustration, 1,63 % à 10,25 % de pixels différents) | aucune (différences de contenu) |
| OK | n/a | /legal-notice, /mentions-legales | Balisage de l'adresse postale (seule différence de structure trouvée entre FR et EN) | même structure | legal-notice.html ligne 61 : `<p>15 rue de la Gare<br>62690 Izel-lès-Hameau<br>France</p>` (3 lignes) ; mentions-legales.html ligne 61 : `<p>15 rue de la Gare<br>62690 Izel-lès-Hameau</p>` (2 lignes, sans le pays) : le bloc EN mesure 20 px de plus | Annexe A (ligne "L2[2.1] br") ; `sed -n 61p legal-notice.html mentions-legales.html` | si le pays est voulu en FR (flux contenu) : mentions-legales.html ligne 61, remplacer `62690 Izel-lès-Hameau</p>` par `62690 Izel-lès-Hameau<br>France</p>` |
| OK | n/a | les 26 pages, 390x844 | En-tête (`header.header`, 375x61) | identique au pixel près à celui de / (EN) ou /index-fr (FR) | 24 comparaisons sur 24 : 0 pixel différent (menu hamburger, logo 18x18, bouton Demo) ; texte et 6 boîtes internes identiques | Annexe B (lignes header m390) ; scratchpad/flux11/analysis.json | aucune |
| OK | n/a | 22 pages (toutes sauf /our-solution, /notre-solution, /pricing, /tarifs), 1440x900 | En-tête (1425x61) | identique au pixel près à / ou /index-fr | 20 comparaisons sur 24 : 0 pixel différent ; texte et 18 boîtes internes identiques | Annexe B (lignes header d1440) | aucune |
| OK | n/a | /our-solution, /notre-solution, /pricing, /tarifs, 1440x900 | En-tête : lien de navigation courant | mise en évidence du lien de la page courante | 787 à 917 pixels différents (0,91 % à 1,05 %), tous dans la zone de navigation ; cause : `aria-current="page"` sur le lien (our-solution.html ligne 32) et la règle `.nav-links a[aria-current="page"] { color: #1a1a1a; font-weight: 700; }` (site-pages.css ligne 3) ; le lien "Our solution" passe de 77 à 80 px, "Pricing" de 44 à 48 px, la `nav.nav-links` de 220 à 224 px, voisins décalés de 1 à 4 px ; rien d'autre ne change (texte et 18 boîtes identiques hors nav) | docs/audit-total/screens/11/header-our-solution-vs-index-d1440.png, header-notre-solution-vs-index-fr-d1440.png, header-pricing-vs-index-d1440.png, header-tarifs-vs-index-fr-d1440.png ; Annexe B | aucune (comportement voulu) |
| OK | n/a | les 26 pages, 2 viewports | Pied de page (`footer.footer.site-footer.brand-close`) : structure, texte, géométrie | identiques entre les pages d'une même langue | texte identique et 62 boîtes internes identiques (écart maximal 0,1 px) sur les 52 vues ; hauteur 1314,9 px (EN) et 1400,6 px (FR) à 390, 823,25 px à 1440 ; le HTML du footer est identique sur les 26 pages (généré par scripts/site_layout.py) | scratchpad/flux11/hfdetail.json ; `python3 - <<EOF` diff du `footer.prettify()` index.html contre about.html : vide | aucune |
| OK | n/a | les 26 pages, 2 viewports | Pied de page : pixels | 0 pixel différent | 45 comparaisons sur 48 avec 186 à 13 239 pixels différents (0,02 % à 1,96 %), 3 identiques (/notre-solution, /recrutement, /contact-fr à 390) ; hauteur de capture différente de 1 px sur 15 comparaisons (823 contre 824, 1315 contre 1316 : position verticale fractionnaire). Causes mesurées : (a) la position verticale du footer dans le document est fractionnaire et varie selon la page (5193,09 px sur /, 4572,64 px sur /our-solution, 1529,45 px sur /pricing) : le texte est rasterisé à un sous-pixel différent, tout le texte du footer ressort dans le diff sans qu'aucune boîte ne bouge ; expérience : le footer aligné sur un pixel entier dans le navigateur de test donne 0 pixel différent à 390 sur les 6 pages testées (dont /legal-notice et /opt-out) et 186 pixels (0,02 %) à 1440, résidu localisé dans le texte du bouton "Book a demo" (zone x 824 à 908, y 137 à 146) dont les styles calculés sont identiques (police, graisse 500, couleur, fond, taille 130x45, position 800,5) ; (b) sur les 8 pages légales, le fond de page fixe est volontairement plus léger (`--site-atmosphere-intensity` .15 au lieu de .25, .12 au lieu de .20 à 390 : styles.css lignes 4493 et 4503) ; (c) le fond de page `body::before` est `position: fixed` : sa portion visible derrière le footer dépend de la hauteur de page dans une capture pleine page. Aucune différence de CSS de footer entre pages : site-pages.css?v=brand-close-1 est la seule feuille qui le stylise et elle est identique sur les 26 pages | Annexe B ; docs/audit-total/screens/11/footer-<page>-vs-<référence>-<viewport>.png (45 diffs) ; Annexe B2 (sortie de footer-aligned.mjs) ; scratchpad/flux11/btncheck.mjs (différences de styles calculés : aucune) | aucune |
| DÉGRADÉ | MAJEUR | /, /index-fr | Bande "Detected changes" / "Changements détectés" (`section.home-signals`) pour un visiteur ayant activé la réduction des animations (réglage système "Réduire les animations", macOS, iOS, Windows, Android) | liste des 10 signaux visible, repliée sur plusieurs lignes, comme le prévoit la règle `@media(prefers-reduced-motion:reduce)` de home.css lignes 497 à 501 | la liste reste sur une seule ligne et est coupée au bord de la fenêtre sans possibilité de défilement (`html { overflow-x: clip }`, styles.css ligne 22) : à 390 px, 7 signaux sur 10 invisibles en EN (liste de 1215 px de large, bord droit à 1237 px) et 8 sur 10 en FR (1569 px) ; à 1440 px, 1 sur 10 en EN (1272 px, bord droit à 1456,5 px) et 2 sur 10 en FR (1636 px, bord droit à 1820,5 px). Cause : `.home-signals-track ul { ... flex:none; width:max-content; ... }` (home.css ligne 481) : `flex: none` fige l'élément flex à sa largeur max-content, donc `width:auto; flex-wrap:wrap` (ligne 499) ne replie rien. Sans réduction des animations, la bande défile en continu (animation `detected-feed`, home.css ligne 480) et tous les signaux passent à l'écran | docs/audit-total/screens/11/index-m390-signaux-mouvement-reduit.png, index-fr-m390-signaux-mouvement-reduit.png, index-d1440-signaux-mouvement-reduit.png (bord droit coupé) ; index-m390-signaux-animation.png (sans réduction) ; correctif vérifié en injectant la règle dans le navigateur de test : index-m390-signaux-mouvement-reduit-corrige.png (10 signaux sur 10 visibles, liste repliée sur 4 lignes, 331x124 px ; à 1440 : 1056x56 px sur 2 lignes) ; scratchpad/flux11/signals-check.json | home.css ligne 499, remplacer `.home-signals-track ul { width:auto; flex-wrap:wrap; justify-content:center; gap:12px 24px; padding:0; }` par `.home-signals-track ul { flex:1 1 auto; min-width:0; width:auto; flex-wrap:wrap; justify-content:center; gap:12px 24px; padding:0; }` puis incrémenter la version `home.css?v=` dans index.html et index-fr.html (ligne 17) |
| DÉGRADÉ | MAJEUR | les 26 pages, 2 viewports | Logo du pied de page `<img src="/assets/logo-black-narrow.png" alt="" width="23" height="28">` (bloc `.brand-close-identity`) | proportions de l'image conservées (fichier carré 1024x1024) | image rendue dans une boîte 23x28 px avec `object-fit: fill` (valeur par défaut, aucune règle CSS ne dimensionne cette image) : étirée verticalement de 21,7 % (ratio rendu 0,821 au lieu de 1) sur les 52 vues ; le même fichier est correct dans l'en-tête (`width="20" height="20"`, `.logo-icon` 20x20) | docs/audit-total/screens/11/index-d1440-footer-logo-zoom.png (zoom x4 du footer capturé) ; docs/audit-total/screens/11/logo-naturel-vs-etire-footer.png (fichier source rendu carré puis au ratio 23:28) ; scratchpad/flux11/geo/*.json (`ratioDev: 0.179` sur les 52 vues) ; index.html ligne 309 ; scripts/site_layout.py ligne 93 ; `identify assets/logo-black-narrow.png` = 1024x1024 | site-pages.css, après la ligne 160, ajouter `.brand-close-identity .logo img { width:24px; height:24px; object-fit:contain; }` et, dans scripts/site_layout.py ligne 93 (puis les 26 pages régénérées), remplacer `width="23" height="28"` par `width="24" height="24"` ; incrémenter `site-pages.css?v=` sur les 26 pages |
| DÉGRADÉ | MINEUR | /conditions | Feuille legal.css incluse deux fois | une seule balise `<link rel="stylesheet" href="/legal.css">` comme sur /terms (ligne 16) | conditions.html lignes 16 et 17 : deux balises `<link rel="stylesheet" href="/legal.css">` identiques (une requête HTTP inutile, seule page du site avec un doublon) | `grep -n 'legal.css' conditions.html` : lignes 16 et 17 ; `for f in *.html; do grep -oE '(href\|src)="[^"]*\.(css\|js)[^"]*"' $f \| sort \| uniq -d; done` : seul doublon du site | supprimer la ligne 17 de conditions.html |
| OK | n/a | /pricing, /tarifs | Références `href="pricing-interactive.css?v=stable-geometry-1"` (ligne 16) et `src="pricing.js"` (ligne 157) en chemin relatif | chemins absolus comme sur les 24 autres pages (index.html lignes 18 et 315 : `/pricing-interactive.css?v=stable-geometry-1`, `/pricing.js`) | les deux fichiers se chargent (HTTP 200, page rendue identique à la maquette attendue) parce que les pages sont servies à la racine ; la référence casserait si la page était déplacée sous un préfixe | `curl -o /dev/null -w '%{http_code}' https://www.syntheticswarm.ai/pricing-interactive.css?v=stable-geometry-1` = 200 ; docs/audit-total/screens/11/pricing-m390-fullpage.jpg (configurateur rendu) ; Annexe C | harmonisation : pricing.html et tarifs.html ligne 16 `href="/pricing-interactive.css?v=stable-geometry-1"`, ligne 157 `src="/pricing.js"` |
| OK | n/a | /terms, /conditions (legal.css) ; /customers, /clients (customers.js) | Version de cache des actifs partagés | même référence sur toutes les pages qui partagent un fichier | `/legal.css?v=legal-cleanup` sur /legal-notice, /mentions-legales, /opt-out, /opposition mais `/legal.css` sur /terms et /conditions ; `/customers.js?v=home-flow-20260918` sur / et /index-fr mais `/customers.js` sur /customers et /clients ; sans effet mesurable : contenu identique (md5 legal.css 618c0f7ecb6bfb15f53753842928c468 avec et sans `?v=`) et Vercel sert les actifs avec `cache-control: public, max-age=0, must-revalidate` (revalidation à chaque chargement) | Annexe C ; `curl -sI https://www.syntheticswarm.ai/legal.css` ; `curl -s https://www.syntheticswarm.ai/legal.css?v=legal-cleanup \| md5sum` | harmonisation : terms.html et conditions.html ligne 16 `href="/legal.css?v=legal-cleanup"` ; customers.html et clients.html ligne 91 `src="/customers.js?v=home-flow-20260918"` |
| OK | n/a | les 26 pages | Feuilles et scripts communs | même version sur les 26 pages | `/styles.css?v=global-atmosphere-1`, `/site-pages.css?v=brand-close-1`, `/motion.css?v=3`, `/motion.js?v=main-audit-1`, `/mobile-menu.js?v=motion-1`, `/page-motion.js?v=2`, `/newsletter.js` : référence identique sur les 26 pages ; les feuilles spécifiques (about.css, careers.css, contact.css, customers.css, legal.css, privacy.css, home.css, solution-page.css, pricing-interactive.css, demo.css, floating-demo.css) ont une version unique par fichier ; aucune de ces feuilles ne contient de règle `.header`, `.footer`, `.site-footer` ou `.brand-close` | Annexe C ; `grep -n -E "\.(header\|footer\|site-footer\|brand-close)" about.css careers.css contact.css customers.css legal.css privacy.css home.css solution-page.css pricing-interactive.css demo.css` : aucune règle (seules `.home .newsletter-*` dans home.css, bloc absent du footer actuel) | aucune |
| OK | n/a | les 26 pages, 2 viewports | Espaces verticaux entre blocs consécutifs (header, enfants directs de `main`, footer) | espace visuel entre 16 et 160 px | aucun espace visuel supérieur à 160 px sur les 52 vues ; 30 écarts de boîtes inférieurs à 16 px, tous expliqués : sections de la page d'accueil jointives par construction, l'espacement étant porté par les paddings internes (home.css ligne 8 : "Gaps are shared by adjacent sections, never added twice" ; ex. `--home-trust-top: 12px`) ; paragraphes des pages légales espacés de 12 px (`.legal-page p + p { margin-top: 12px }`, legal.css ligne 7) ; hero directement sous l'en-tête fixe (`body { padding-top: var(--site-header-offset) }`, styles.css ligne 25, 61 px) ; dernier bloc jointif au footer dont l'espace interne est de 112 px (`.brand-close-statement { padding:112px 0 }`, site-pages.css ligne 145) | Annexe D ; scratchpad/flux11/visualgap.mjs | aucune |
| OK | n/a | les 26 pages, 2 viewports | Recouvrements de boîtes (niveau 1 entre eux, niveau 2 au sein d'un même parent, dernier bloc contre footer) | aucun | 0 recouvrement sur les 52 vues ; /contact et /contact-fr à 1440 : `div.contact-details` (x 184,5 à 581,3, y 137 à 670) et `form.contact-form` (x 645,3 à 1240,5, y 137 à 688) sont côte à côte en grille (`.contact-page { display: grid; grid-template-columns: minmax(0,.8fr) minmax(0,1.2fr) }`, contact.css ligne 1), sans intersection ; écarts de -0,1 px entre sections (/, /our-solution) = arrondi sous-pixel | Annexe E (vide) ; scratchpad/flux11/geo/contact-d1440.json | aucune |
| OK | n/a | les 26 pages, 2 viewports | Images (hors logo du footer) | aucune image cassée, ratio conservé, aucune bordure parasite | 0 image cassée (naturalWidth > 0 pour les 20 images de la home, 10 de /about, 6 à 9 ailleurs) ; toutes les images visibles conservent leur ratio (écart maximal 0,4 %, `object-fit: contain` ou `cover`) sauf le logo du footer (ligne ci-dessus) ; seules bordures : les deux avatars de la pastille démo (2 px, floating-demo.css ligne 22, voulu) ; logos partenaires en niveaux de gris (`filter: grayscale(1); opacity: .63`, home.css ligne 457, voulu) | Annexe F ; scratchpad/flux11/geo/*.json (champ `imgs`) | aucune |
| OK | n/a | les 26 pages, 2 viewports | Débordement horizontal | aucun défilement horizontal, aucune boîte visible coupée | `scrollWidth` égal à la largeur utile (375 et 1425) sur les 52 vues ; boîtes dépassant la fenêtre : le panneau du menu mobile `.mobile-menu-panel` (fermé : `visibility: hidden`, `translateX(322,5 px)` hors écran, overlay `aria-hidden="true"` et `opacity: 0`), les blobs `.aurora__blob` de la home (dans `div.aurora` en `overflow: hidden`), la liste de `.home-signals` (défaut traité plus haut) ; Chromium rend pourtant une capture pleine page plus large que la fenêtre (1237 px sur / à 390) à cause de `html { overflow-x: clip }` : d'où le `clip` à la largeur utile dans la méthode | Annexe G ; scratchpad/flux11/menucheck.mjs (sortie : `visibility: 'hidden'`, `transform: 'matrix(1, 0, 0, 1, 322.5, 0)'`, overlay `opacity: '0'`, `aria-hidden: 'true'`) | aucune |
| OK | n/a | les 26 pages | Règles `prefers-reduced-motion` du site (état capturé) | la réduction des animations ne change que les animations et transitions | 10 blocs `@media (prefers-reduced-motion...)` dans les CSS : motion.css lignes 22 à 25 et 31, site-pages.css lignes 87 et 131, styles.css lignes 4505 à 4507, floating-demo.css lignes 44 à 47, home.css lignes 470 et 497 à 501, solution-page.css lignes 241 à 243, careers.css ligne 38 ; seuls deux changent la mise en page : motion.css ligne 31 (`.home-motion-toggle, .sp-motion { display:none }`, boutons de lecture des animations, voulu) et home.css lignes 497 à 501 (bande des signaux, défaut traité plus haut) ; captures et mesures du présent flux faites dans cet état | `grep -n -A3 "prefers-reduced-motion" *.css` | aucune |
| OK | n/a | /, /index-fr, /our-solution, /notre-solution | Pastille flottante "Book a demo" (`.floating-demo`, `position: fixed`, `bottom: 24px`) | visible en bas de la fenêtre, sans masquer durablement un contenu | affichée dès le chargement (225x44 px, centrée, y = 832 à 1440x900 ; 790 à 390x844), masquée quand l'utilisateur remonte (floating-demo.js lignes 14 à 21) ; dans les captures pleine page elle apparaît une fois à la position de la première fenêtre (sur les logos partenaires à 390), ce qui n'est pas une superposition réelle : à l'écran elle reste au bas de la fenêtre | docs/audit-total/screens/11/index-m390-fullpage.jpg ; scratchpad/flux11/geo/index-d1440.json (`floating: { visible: true, box: { x: 600, y: 832, w: 225, h: 44 } }`) ; floating-demo.css lignes 1 à 7 | aucune |

## Méthode

- Production uniquement (https://www.syntheticswarm.ai), Chromium 1194 via Playwright 1.56.1 (module partagé browsers.mjs, proxy TLS respecté), 26 pages de l'inventaire pages.csv, viewports 390x844 (m390) et 1440x900 (d1440), `deviceScaleFactor: 1`, `reducedMotion: 'reduce'`, navigation `waitUntil: 'load'` puis `networkidle` (8 s max), `document.fonts.ready`, puis 1 s d'attente ; captures avec `animations: 'disabled'`.
- Capture pleine page : `page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width: clientWidth, height: scrollHeight } })`. Sans `clip`, Chromium rend une image plus large que la fenêtre (1237 px sur `/` à 390 px) parce que des boîtes débordent horizontalement et que `html { overflow-x: clip }` (styles.css ligne 22) les masque sans créer de défilement : voir Annexe G. Les captures pleine page comportent à droite une gouttière de 15 px (`scrollbar-gutter: stable`, barre de défilement classique du Chromium headless), identique sur toutes les pages.
- Le header est `position: fixed` (styles.css ligne 71) : il apparaît une fois en haut des captures pleine page. La pastille "Book a demo" (`.floating-demo`, `position: fixed`, visible dès le chargement) apparaît dans les captures pleine page de `/`, `/index-fr`, `/our-solution` et `/notre-solution` à la position qu'elle occupe dans la première fenêtre (bas de l'écran initial) : ce n'est pas une superposition réelle avec le contenu.
- Capture header : `locator('header').screenshot()` en haut de page. Capture footer : clip pleine page aux coordonnées entières de la boîte du footer (évite le rééchantillonnage sous-pixel), avec `.floating-demo` et `header` passés en `visibility: hidden` dans le navigateur de test pendant la capture (tous deux `position: fixed`, ils se superposaient au footer dans la capture mobile, le footer de 1315 px étant plus haut que la fenêtre de 844 px). Aucune modification du site : ces styles sont injectés dans la page chargée par le navigateur de test.
- Géométrie : boîtes (`getBoundingClientRect` + défilement) de `header`, `footer`, `main`, des enfants directs de `main` (niveau 1 : `main > section`, `main > div`, `main > h1`...) et de leurs enfants (niveau 2), avec longueur de texte et nombre d'enfants ; images (`naturalWidth/Height`, boîte, `object-fit`, bordure) ; feuilles et scripts référencés ; boîtes dépassant la fenêtre.
- Comparaisons : pixelmatch 7.2 (seuil 0,1, anticrénelage ignoré, fond atténué à 15 %) ; images de tailles différentes complétées en blanc à droite et en bas avant comparaison. FR/EN : géométrie de niveau 1 et 2 alignée par position, écart de hauteur signalé au-delà de 40 px ou en cas d'ordre ou de nombre différent. Header et footer : chaque page contre `/` (EN) ou `/index-fr` (FR) de même viewport.
- Effet du mouvement réduit sur le rendu : motion.css lignes 22 à 24 coupent toutes les animations et transitions ; `.home-motion-toggle` et `.sp-motion` sont masqués (motion.css ligne 31) ; le fond animé `body::before` (styles.css lignes 4480 à 4491) est figé. Le rendu capturé est donc celui d'un visiteur ayant activé "réduire les animations" ; la seule différence de mise en page trouvée entre les deux modes est traitée dans le tableau (bande "Detected changes").
- Scripts : scratchpad/flux11/capture.mjs (captures et géométrie), analyze.mjs (comparaisons), render.mjs (annexes), signals-check.mjs (vérification ciblée avec et sans mouvement réduit, correctif CSS injecté localement), compress.sh (JPEG q50 pour les pleines pages, PNG réduit à 50 % pour les diffs, toutes sous 400 Ko).

## Annexes

### Annexe A : géométrie FR/EN par paire (blocs de niveau 1 = enfants directs de main ; niveau 2 = leurs enfants)

Seuls les blocs dont la hauteur diffère de plus de 40 px, ou absents d'un côté, sont listés. dh = hauteur FR moins hauteur EN (px) ; texte = nombre de caractères visibles.

| Paire | Viewport | Ordre identique | Blocs N1 EN/FR | Hauteur page EN/FR | Pixels différents (image) | Bloc | h EN | h FR | dh | texte EN | texte FR | enfants EN/FR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| index / index-fr | m390 | oui | 8/8 | 6508/6762 | 240991 (9.14 %) | main | 5132.1 | 5300.6 | 169 |  |  | / |
|  |  |  |  |  |  | footer | 1314.9 | 1400.6 | 86 |  |  | / |
|  |  |  |  |  |  | L1[0] div.demo-wrapper | 541.5 | 584.5 | 43 | 314 | 318 | 1/1 |
|  |  |  |  |  |  | L2[0.0] section.hero.home-focused-hero | 541.5 | 584.5 | 43 | 314 | 318 | 4/4 |
|  |  |  |  |  |  | L1[5] section#customer-proof.content-page.home-customer-proof | 1107.6 | 1161.9 | 54 | 629 | 778 | 2/2 |
|  |  |  |  |  |  | L1[7] section#faq.pricing-objections.home-purchase-faq | 301.5 | 354 | 53 | 118 | 145 | 4/4 |
| index / index-fr | d1440 | oui | 8/8 | 4739/4765 | 247126 (3.6 %) | aucun bloc au-delà de 40 px | | | | | | |
| our-solution / notre-solution | m390 | oui | 3/3 | 5888/6156 | 189888 (7.91 %) | main | 4511.6 | 4694.7 | 183 |  |  | / |
|  |  |  |  |  |  | footer | 1314.9 | 1400.6 | 86 |  |  | / |
|  |  |  |  |  |  | L1[0] section.sp-hero.sp-wrap | 698.1 | 741.9 | 44 | 398 | 443 | 5/5 |
|  |  |  |  |  |  | L1[1] div.product-story | 3444.9 | 3548.3 | 103 | 1758 | 1906 | 2/2 |
|  |  |  |  |  |  | L2[1.1] div.story-stack | 3444.9 | 3548.3 | 103 | 1758 | 1906 | 4/4 |
| our-solution / notre-solution | d1440 | oui | 3/3 | 4539/4539 | 123785 (1.89 %) | aucun bloc au-delà de 40 px | | | | | | |
| pricing / tarifs | m390 | oui | 1/1 | 2844/2923 | 81226 (7.13 %) | footer | 1314.9 | 1400.6 | 86 |  |  | / |
| pricing / tarifs | d1440 | oui | 1/1 | 2164/2164 | 50794 (1.63 %) | aucun bloc au-delà de 40 px | | | | | | |
| faq / faq-fr | m390 | oui | 3/3 | 3025/3135 | 84426 (6.91 %) | footer | 1314.9 | 1400.6 | 86 |  |  | / |
| faq / faq-fr | d1440 | oui | 3/3 | 2485/2543 | 131940 (3.6 %) | main | 1600.3 | 1658.5 | 58 |  |  | / |
|  |  |  |  |  |  | L1[0] section.page-intro | 143.9 | 202.2 | 58 | 99 | 101 | 3/3 |
|  |  |  |  |  |  | L2[0.1] h1 | 58.2 | 116.5 | 58 | 30 | 36 | 0/0 |
| about / a-propos | m390 | oui | 3/3 | 3771/4034 | 161282 (10.25 %) | main | 2395.5 | 2572 | 177 |  |  | / |
|  |  |  |  |  |  | footer | 1314.9 | 1400.6 | 86 |  |  | / |
|  |  |  |  |  |  | L1[1] section.about-founders | 972.5 | 1071.5 | 99 | 641 | 774 | 2/2 |
|  |  |  |  |  |  | L2[1.1] article.content-card.founder-card | 501.3 | 575.5 | 74 | 359 | 428 | 2/2 |
|  |  |  |  |  |  | L1[2] div.about-journey | 1055.8 | 1106.9 | 51 | 400 | 478 | 2/2 |
| about / a-propos | d1440 | oui | 3/3 | 2402/2452 | 169441 (4.8 %) | main | 1518.2 | 1567.7 | 50 |  |  | / |
|  |  |  |  |  |  | L1[1] section.about-founders | 423.8 | 473.3 | 50 | 641 | 774 | 2/2 |
|  |  |  |  |  |  | L2[1.0] article.content-card.founder-card | 423.8 | 473.3 | 50 | 281 | 345 | 2/2 |
|  |  |  |  |  |  | L2[1.1] article.content-card.founder-card | 423.8 | 473.3 | 50 | 359 | 428 | 2/2 |
| careers / recrutement | m390 | oui | 4/4 | 3132/3378 | 87141 (6.61 %) | main | 1756.5 | 1916.7 | 160 |  |  | / |
|  |  |  |  |  |  | footer | 1314.9 | 1400.6 | 86 |  |  | / |
|  |  |  |  |  |  | L1[1] section.careers-reasons | 299 | 407 | 108 | 282 | 356 | 3/3 |
|  |  |  |  |  |  | L2[1.0] article | 81 | 125.3 | 44 | 108 | 130 | 3/3 |
|  |  |  |  |  |  | L2[1.1] article | 81 | 125.3 | 44 | 70 | 111 | 3/3 |
| careers / recrutement | d1440 | oui | 4/4 | 2237/2282 | 117960 (3.59 %) | main | 1353.2 | 1397.4 | 44 |  |  | / |
|  |  |  |  |  |  | L1[1] section.careers-reasons | 81 | 125.3 | 44 | 282 | 356 | 3/3 |
|  |  |  |  |  |  | L2[1.0] article | 81 | 125.3 | 44 | 108 | 130 | 3/3 |
|  |  |  |  |  |  | L2[1.1] article | 81 | 125.3 | 44 | 70 | 111 | 3/3 |
|  |  |  |  |  |  | L2[1.2] article | 81 | 125.3 | 44 | 102 | 113 | 3/3 |
| contact / contact-fr | m390 | oui | 2/2 | 2671/2756 | 51294 (4.77 %) | footer | 1314.9 | 1400.6 | 86 |  |  | / |
| contact / contact-fr | d1440 | oui | 2/2 | 1599/1599 | 38007 (1.65 %) | aucun bloc au-delà de 40 px | | | | | | |
| customers / clients | m390 | oui | 3/3 | 2057/2206 | 71073 (8.26 %) | main | 681 | 744.3 | 63 |  |  | / |
|  |  |  |  |  |  | footer | 1314.9 | 1400.6 | 86 |  |  | / |
| customers / clients | d1440 | oui | 3/3 | 1621/1679 | 105183 (4.35 %) | main | 736.7 | 794.9 | 58 |  |  | / |
|  |  |  |  |  |  | L1[0] section.page-intro | 173.6 | 231.8 | 58 | 133 | 158 | 3/3 |
|  |  |  |  |  |  | L2[0.1] h1 | 58.2 | 116.5 | 58 | 30 | 36 | 0/0 |
| media / medias | m390 | oui | 4/4 | 2059/2181 | 69293 (8.15 %) | footer | 1314.9 | 1400.6 | 86 |  |  | / |
| media / medias | d1440 | oui | 4/4 | 1604/1604 | 45582 (1.97 %) | aucun bloc au-delà de 40 px | | | | | | |
| legal-notice / mentions-legales | m390 | oui | 5/5 | 1734/1792 | 51765 (7.41 %) | footer | 1314.9 | 1400.6 | 86 |  |  | / |
|  |  |  |  |  |  | L2[2.1] br | 20 | absent | -20 | 0 |  | 0/ |
| legal-notice / mentions-legales | d1440 | oui | 5/5 | 1312/1284 | 68528 (3.63 %) | L2[2.1] br | 20 | absent | -20 | 0 |  | 0/ |
| privacy / confidentialite | m390 | oui | 7/7 | 2572/2747 | 83205 (7.77 %) | main | 1196.1 | 1285 | 89 |  |  | / |
|  |  |  |  |  |  | footer | 1314.9 | 1400.6 | 86 |  |  | / |
| privacy / confidentialite | d1440 | oui | 7/7 | 1772/1853 | 104322 (3.91 %) | main | 887.3 | 968.9 | 82 |  |  | / |
| terms / conditions | m390 | oui | 23/23 | 5789/6201 | 192411 (7.96 %) | main | 4413.2 | 4739.5 | 326 |  |  | / |
|  |  |  |  |  |  | footer | 1314.9 | 1400.6 | 86 |  |  | / |
|  |  |  |  |  |  | L1[14] section | 171.1 | 225.5 | 54 | 226 | 276 | 2/2 |
|  |  |  |  |  |  | L2[14.1] p | 135.9 | 190.3 | 54 | 198 | 249 | 0/0 |
|  |  |  |  |  |  | L1[16] section | 143.9 | 198.3 | 54 | 167 | 196 | 2/2 |
|  |  |  |  |  |  | L2[16.1] p | 108.8 | 163.1 | 54 | 150 | 180 | 0/0 |
| terms / conditions | d1440 | oui | 23/23 | 3839/3975 | 216788 (3.79 %) | main | 2955.2 | 3091.2 | 136 |  |  | / |
| opt-out / opposition | m390 | oui | 4/4 | 1700/1785 | 50721 (7.29 %) | footer | 1314.9 | 1400.6 | 86 |  |  | / |
| opt-out / opposition | d1440 | oui | 4/4 | 1251/1251 | 37730 (2.09 %) | aucun bloc au-delà de 40 px | | | | | | |

### Annexe B : en-tête et pied de page comparés à index (EN) ou index-fr (FR), par viewport

| Viewport | Élément | Page | Référence | Dimensions réf. | Dimensions page | Pixels différents | % | Zone (x1,y1,x2,y2) | Diff |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| m390 | header | our-solution | index | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | notre-solution | index-fr | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | pricing | index | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | tarifs | index-fr | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | faq | index | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | faq-fr | index-fr | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | about | index | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | a-propos | index-fr | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | careers | index | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | recrutement | index-fr | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | contact | index | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | contact-fr | index-fr | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | customers | index | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | clients | index-fr | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | media | index | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | medias | index-fr | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | legal-notice | index | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | mentions-legales | index-fr | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | privacy | index | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | confidentialite | index-fr | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | terms | index | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | conditions | index-fr | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | opt-out | index | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | header | opposition | index-fr | 375x61 | 375x61 | 0 | 0 |  | identique |
| m390 | footer | our-solution | index | 390x1315 | 390x1316 | 9365 | 1.82 | 22,71,350,1285 | screens/11/footer-our-solution-vs-index-m390.png |
| m390 | footer | notre-solution | index-fr | 390x1401 | 390x1401 | 0 | 0 |  | identique |
| m390 | footer | pricing | index | 390x1315 | 390x1315 | 6509 | 1.27 | 23,114,350,619 | screens/11/footer-pricing-vs-index-m390.png |
| m390 | footer | tarifs | index-fr | 390x1401 | 390x1401 | 6744 | 1.23 | 22,70,350,1149 | screens/11/footer-tarifs-vs-index-fr-m390.png |
| m390 | footer | faq | index | 390x1315 | 390x1315 | 1453 | 0.28 | 25,175,350,441 | screens/11/footer-faq-vs-index-m390.png |
| m390 | footer | faq-fr | index-fr | 390x1401 | 390x1401 | 6130 | 1.12 | 22,70,350,1149 | screens/11/footer-faq-fr-vs-index-fr-m390.png |
| m390 | footer | about | index | 390x1315 | 390x1315 | 6926 | 1.35 | 23,71,350,619 | screens/11/footer-about-vs-index-m390.png |
| m390 | footer | a-propos | index-fr | 390x1401 | 390x1401 | 6749 | 1.24 | 22,70,350,1149 | screens/11/footer-a-propos-vs-index-fr-m390.png |
| m390 | footer | careers | index | 390x1315 | 390x1315 | 6588 | 1.28 | 23,114,350,619 | screens/11/footer-careers-vs-index-m390.png |
| m390 | footer | recrutement | index-fr | 390x1401 | 390x1401 | 0 | 0 |  | identique |
| m390 | footer | contact | index | 390x1315 | 390x1316 | 9271 | 1.81 | 22,71,350,1285 | screens/11/footer-contact-vs-index-m390.png |
| m390 | footer | contact-fr | index-fr | 390x1401 | 390x1401 | 0 | 0 |  | identique |
| m390 | footer | customers | index | 390x1315 | 390x1315 | 1568 | 0.31 | 22,650,91,1063 | screens/11/footer-customers-vs-index-m390.png |
| m390 | footer | clients | index-fr | 390x1401 | 390x1401 | 4853 | 0.89 | 22,70,349,1149 | screens/11/footer-clients-vs-index-fr-m390.png |
| m390 | footer | media | index | 390x1315 | 390x1315 | 1569 | 0.31 | 22,650,91,1063 | screens/11/footer-media-vs-index-m390.png |
| m390 | footer | medias | index-fr | 390x1401 | 390x1401 | 6763 | 1.24 | 22,69,350,1149 | screens/11/footer-medias-vs-index-fr-m390.png |
| m390 | footer | legal-notice | index | 390x1315 | 390x1316 | 9265 | 1.81 | 22,71,350,1285 | screens/11/footer-legal-notice-vs-index-m390.png |
| m390 | footer | mentions-legales | index-fr | 390x1401 | 390x1401 | 1192 | 0.22 | 89,70,336,527 | screens/11/footer-mentions-legales-vs-index-fr-m390.png |
| m390 | footer | privacy | index | 390x1315 | 390x1315 | 1203 | 0.23 | 25,175,350,189 | screens/11/footer-privacy-vs-index-m390.png |
| m390 | footer | confidentialite | index-fr | 390x1401 | 390x1401 | 6704 | 1.23 | 22,70,350,1149 | screens/11/footer-confidentialite-vs-index-fr-m390.png |
| m390 | footer | terms | index | 390x1315 | 390x1315 | 1466 | 0.29 | 25,175,350,441 | screens/11/footer-terms-vs-index-m390.png |
| m390 | footer | conditions | index-fr | 390x1401 | 390x1401 | 1201 | 0.22 | 89,70,336,527 | screens/11/footer-conditions-vs-index-fr-m390.png |
| m390 | footer | opt-out | index | 390x1315 | 390x1316 | 10066 | 1.96 | 22,71,350,1285 | screens/11/footer-opt-out-vs-index-m390.png |
| m390 | footer | opposition | index-fr | 390x1401 | 390x1401 | 2038 | 0.37 | 23,500,348,705 | screens/11/footer-opposition-vs-index-fr-m390.png |
| d1440 | header | our-solution | index | 1425x61 | 1425x61 | 813 | 0.94 | 547,25,765,37 | screens/11/header-our-solution-vs-index-d1440.png |
| d1440 | header | notre-solution | index-fr | 1425x61 | 1425x61 | 917 | 1.05 | 537,23,778,36 | screens/11/header-notre-solution-vs-index-fr-d1440.png |
| d1440 | header | pricing | index | 1425x61 | 1425x61 | 853 | 0.98 | 546,25,765,36 | screens/11/header-pricing-vs-index-d1440.png |
| d1440 | header | tarifs | index-fr | 1425x61 | 1425x61 | 787 | 0.91 | 537,23,778,36 | screens/11/header-tarifs-vs-index-fr-d1440.png |
| d1440 | header | faq | index | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | faq-fr | index-fr | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | about | index | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | a-propos | index-fr | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | careers | index | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | recrutement | index-fr | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | contact | index | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | contact-fr | index-fr | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | customers | index | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | clients | index-fr | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | media | index | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | medias | index-fr | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | legal-notice | index | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | mentions-legales | index-fr | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | privacy | index | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | confidentialite | index-fr | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | terms | index | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | conditions | index-fr | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | opt-out | index | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | header | opposition | index-fr | 1425x61 | 1425x61 | 0 | 0 |  | identique |
| d1440 | footer | our-solution | index | 1440x823 | 1440x824 | 13239 | 1.12 | 144,119,1276,791 | screens/11/footer-our-solution-vs-index-d1440.png |
| d1440 | footer | notre-solution | index-fr | 1440x824 | 1440x824 | 5394 | 0.45 | 144,119,1122,566 | screens/11/footer-notre-solution-vs-index-fr-d1440.png |
| d1440 | footer | pricing | index | 1440x823 | 1440x824 | 9020 | 0.76 | 144,122,1276,791 | screens/11/footer-pricing-vs-index-d1440.png |
| d1440 | footer | tarifs | index-fr | 1440x824 | 1440x824 | 1114 | 0.09 | 144,137,950,234 | screens/11/footer-tarifs-vs-index-fr-d1440.png |
| d1440 | footer | faq | index | 1440x823 | 1440x824 | 6213 | 0.52 | 146,135,1264,791 | screens/11/footer-faq-vs-index-d1440.png |
| d1440 | footer | faq-fr | index-fr | 1440x824 | 1440x824 | 300 | 0.03 | 824,137,950,146 | screens/11/footer-faq-fr-vs-index-fr-d1440.png |
| d1440 | footer | about | index | 1440x823 | 1440x823 | 186 | 0.02 | 824,137,908,146 | screens/11/footer-about-vs-index-d1440.png |
| d1440 | footer | a-propos | index-fr | 1440x824 | 1440x824 | 1114 | 0.09 | 144,137,950,234 | screens/11/footer-a-propos-vs-index-fr-d1440.png |
| d1440 | footer | careers | index | 1440x823 | 1440x823 | 186 | 0.02 | 824,137,908,146 | screens/11/footer-careers-vs-index-d1440.png |
| d1440 | footer | recrutement | index-fr | 1440x824 | 1440x824 | 2522 | 0.21 | 147,119,1276,304 | screens/11/footer-recrutement-vs-index-fr-d1440.png |
| d1440 | footer | contact | index | 1440x823 | 1440x823 | 186 | 0.02 | 824,137,908,146 | screens/11/footer-contact-vs-index-d1440.png |
| d1440 | footer | contact-fr | index-fr | 1440x824 | 1440x823 | 10358 | 0.87 | 146,119,1276,791 | screens/11/footer-contact-fr-vs-index-fr-d1440.png |
| d1440 | footer | customers | index | 1440x823 | 1440x824 | 9069 | 0.76 | 144,122,1276,791 | screens/11/footer-customers-vs-index-d1440.png |
| d1440 | footer | clients | index-fr | 1440x824 | 1440x824 | 5407 | 0.46 | 144,119,1122,566 | screens/11/footer-clients-vs-index-fr-d1440.png |
| d1440 | footer | media | index | 1440x823 | 1440x824 | 9069 | 0.76 | 144,122,1276,791 | screens/11/footer-media-vs-index-d1440.png |
| d1440 | footer | medias | index-fr | 1440x824 | 1440x824 | 1114 | 0.09 | 144,137,950,234 | screens/11/footer-medias-vs-index-fr-d1440.png |
| d1440 | footer | legal-notice | index | 1440x823 | 1440x824 | 6309 | 0.53 | 146,135,1264,791 | screens/11/footer-legal-notice-vs-index-d1440.png |
| d1440 | footer | mentions-legales | index-fr | 1440x824 | 1440x823 | 10093 | 0.85 | 145,119,1276,791 | screens/11/footer-mentions-legales-vs-index-fr-d1440.png |
| d1440 | footer | privacy | index | 1440x823 | 1440x824 | 6213 | 0.52 | 146,135,1264,791 | screens/11/footer-privacy-vs-index-d1440.png |
| d1440 | footer | confidentialite | index-fr | 1440x824 | 1440x824 | 5407 | 0.46 | 144,119,1122,566 | screens/11/footer-confidentialite-vs-index-fr-d1440.png |
| d1440 | footer | terms | index | 1440x823 | 1440x823 | 186 | 0.02 | 824,137,908,146 | screens/11/footer-terms-vs-index-d1440.png |
| d1440 | footer | conditions | index-fr | 1440x824 | 1440x823 | 10338 | 0.87 | 146,119,1276,791 | screens/11/footer-conditions-vs-index-fr-d1440.png |
| d1440 | footer | opt-out | index | 1440x823 | 1440x824 | 6320 | 0.53 | 146,135,1264,791 | screens/11/footer-opt-out-vs-index-d1440.png |
| d1440 | footer | opposition | index-fr | 1440x824 | 1440x824 | 2466 | 0.21 | 147,119,1276,304 | screens/11/footer-opposition-vs-index-fr-d1440.png |


### Annexe B2 : expérience d'attribution des pixels différents du footer (footer aligné sur un pixel entier par une marge injectée dans le navigateur de test ; variante "bg" avec le fond de page fixe, "nobg" avec `body::before` masqué)

Commande : `node scratchpad/flux11/footer-aligned.mjs` (8 pages, 2 viewports). Sortie :

```
captured index m390 y0 5193.094 shift 0.906 y 5194.000 h 1314.938
captured our-solution m390 y0 4572.641 shift 0.359 y 4573.000 h 1314.938
captured pricing m390 y0 1529.453 shift 0.547 y 1530.000 h 1314.938
captured contact m390 y0 1355.609 shift 0.391 y 1355.984 h 1314.938
captured legal-notice m390 y0 418.625 shift 0.375 y 419.000 h 1314.938
captured opt-out m390 y0 384.859 shift 0.141 y 384.984 h 1314.938
captured index-fr m390 y0 5361.578 shift 0.422 y 5362.000 h 1400.609
captured conditions m390 y0 4800.484 shift 0.516 y 4800.984 h 1400.609
captured index d1440 y0 3916.016 shift 0.984 y 3917.000 h 823.250
captured our-solution d1440 y0 3715.859 shift 0.141 y 3715.984 h 823.250
captured pricing d1440 y0 1340.672 shift 0.328 y 1340.984 h 823.250
captured contact d1440 y0 776.000 shift 0.000 y 776.000 h 823.250
captured legal-notice d1440 y0 488.422 shift 0.578 y 488.984 h 823.250
captured opt-out d1440 y0 427.469 shift 0.531 y 428.000 h 823.250
captured index-fr d1440 y0 3941.516 shift 0.484 y 3942.000 h 823.250
captured conditions d1440 y0 3152.156 shift 0.844 y 3153.000 h 823.250
aligned m390 bg our-solution vs index diff px 0 0% dims 390x1315 390x1315
aligned m390 nobg our-solution vs index diff px 0 0% dims 390x1315 390x1315
aligned m390 bg pricing vs index diff px 0 0% dims 390x1315 390x1315
aligned m390 nobg pricing vs index diff px 0 0% dims 390x1315 390x1315
aligned m390 bg contact vs index diff px 0 0% dims 390x1315 390x1315
aligned m390 nobg contact vs index diff px 0 0% dims 390x1315 390x1315
aligned m390 bg legal-notice vs index diff px 0 0% dims 390x1315 390x1315
aligned m390 nobg legal-notice vs index diff px 0 0% dims 390x1315 390x1315
aligned m390 bg opt-out vs index diff px 0 0% dims 390x1315 390x1315
aligned m390 nobg opt-out vs index diff px 0 0% dims 390x1315 390x1315
aligned m390 bg index-fr vs index diff px 46085 8.43% dims 390x1315 390x1401
aligned m390 nobg index-fr vs index diff px 50212 9.19% dims 390x1315 390x1401
aligned m390 bg conditions vs index-fr diff px 0 0% dims 390x1401 390x1401
aligned m390 nobg conditions vs index-fr diff px 0 0% dims 390x1401 390x1401
aligned d1440 bg our-solution vs index diff px 186 0.02% dims 1440x823 1440x823
aligned d1440 nobg our-solution vs index diff px 5228 0.44% dims 1440x823 1440x823
aligned d1440 bg pricing vs index diff px 186 0.02% dims 1440x823 1440x823
aligned d1440 nobg pricing vs index diff px 5162 0.44% dims 1440x823 1440x823
aligned d1440 bg contact vs index diff px 186 0.02% dims 1440x823 1440x823
aligned d1440 nobg contact vs index diff px 5228 0.44% dims 1440x823 1440x823
aligned d1440 bg legal-notice vs index diff px 186 0.02% dims 1440x823 1440x823
aligned d1440 nobg legal-notice vs index diff px 5181 0.44% dims 1440x823 1440x823
aligned d1440 bg opt-out vs index diff px 186 0.02% dims 1440x823 1440x823
aligned d1440 nobg opt-out vs index diff px 5229 0.44% dims 1440x823 1440x823
aligned d1440 bg index-fr vs index diff px 30171 2.55% dims 1440x823 1440x823
aligned d1440 nobg index-fr vs index diff px 30207 2.55% dims 1440x823 1440x823
aligned d1440 bg conditions vs index-fr diff px 300 0.03% dims 1440x823 1440x823
aligned d1440 nobg conditions vs index-fr diff px 5904 0.5% dims 1440x823 1440x823
```

Lecture : à 390 px, une fois le footer aligné, toutes les pages EN testées sont identiques au pixel près à / (0 pixel), /conditions est identique à /index-fr ; à 1440 px il reste 186 pixels (0,02 %) dans le texte du bouton "Book a demo" (zone x 824 à 908, y 137 à 146, `node bbox.mjs`) et 300 pixels (0,03 %) pour /conditions contre /index-fr dans le bouton "Réserver une démo". La variante sans fond de page fixe montre que le fond n'explique pas ces résidus (résultats plus élevés sans fond, 0,44 %, anticrénelage recomposé) : les différences des captures brutes de l'Annexe B viennent de la position verticale fractionnaire du footer, pas du CSS.

### Annexe C : feuilles de style et scripts référencés par page (extraits du HTML du commit 864833f, identique à la production)

| Fichier | Référence telle qu'écrite dans le HTML | Pages |
| --- | --- | --- |
| about.css | `/about.css` | 2 : about, a-propos |
| careers.css | `/careers.css?v=editorial-20260918` | 2 : careers, recrutement |
| careers.js | `/careers.js?v=editorial-20260918` | 2 : careers, recrutement |
| contact.css | `/contact.css?v=columns-20260918` | 2 : contact, contact-fr |
| contact.js | `/contact.js?v=copy-20260918` | 2 : contact, contact-fr |
| customers.css | `/customers.css` | 4 : index, index-fr, customers, clients |
| customers.js | `/customers.js?v=home-flow-20260918` | 2 : index, index-fr |
| customers.js | `/customers.js` | 2 : customers, clients |
| demo.css | `/demo.css` | 2 : index, index-fr |
| editorial-motion.js | `/editorial-motion.js?v=2` | 4 : about, a-propos, careers, recrutement |
| floating-demo.css | `/floating-demo.css?v=main-audit-1` | 4 : index, index-fr, our-solution, notre-solution |
| floating-demo.js | `/floating-demo.js?v=home-restore-1` | 2 : index, index-fr |
| home-motion.js | `/home-motion.js?v=why-now-preview-1` | 2 : index, index-fr |
| home.css | `/home.css?v=prospect-inbox-1` | 2 : index, index-fr |
| legal.css | `/legal.css?v=legal-cleanup` | 4 : legal-notice, mentions-legales, opt-out, opposition |
| legal.css | `/legal.css` | 2 : terms, conditions |
| mobile-menu.js | `/mobile-menu.js?v=motion-1` | les 26 pages |
| motion.css | `/motion.css?v=3` | les 26 pages |
| motion.js | `/motion.js?v=main-audit-1` | les 26 pages |
| newsletter.js | `/newsletter.js` | les 26 pages |
| page-motion.js | `/page-motion.js?v=2` | les 26 pages |
| pricing-interactive.css | `/pricing-interactive.css?v=stable-geometry-1` | 2 : index, index-fr |
| pricing-interactive.css | `pricing-interactive.css?v=stable-geometry-1` | 2 : pricing, tarifs |
| pricing.js | `/pricing.js` | 2 : index, index-fr |
| pricing.js | `pricing.js` | 2 : pricing, tarifs |
| privacy.css | `/privacy.css` | 2 : privacy, confidentialite |
| site-pages.css | `/site-pages.css?v=brand-close-1` | les 26 pages |
| solution-motion.js | `/solution-motion.js?v=chapter-progress-1` | 2 : our-solution, notre-solution |
| solution-page.css | `/solution-page.css?v=chapter-progress-1` | 2 : our-solution, notre-solution |
| solution-page.js | `/solution-page.js?v=chapter-progress-1` | 2 : our-solution, notre-solution |
| styles.css | `/styles.css?v=global-atmosphere-1` | les 26 pages |

### Annexe D : espaces verticaux entre blocs consécutifs de niveau 1 hors de la plage 16 à 160 px (écart de boîtes puis espace visuel = écart + padding-bottom du précédent + padding-top du suivant)

| Page | Viewport | De | À | Écart de boîtes | padding-bottom | padding-top | Espace visuel |
| --- | --- | --- | --- | --- | --- | --- | --- |
| index | m390 | header (fixed, 61 px) | div.demo-wrapper | 0 | 0 | 0 | 0 |
| index | d1440 | div.demo-wrapper | section.home-trust | 0 | 0 | 12 | 12 |
| index | d1440 | section#faq.pricing-objections.home-purchase-faq | footer | 0 | 0 | (footer: padding interne .brand-close-statement 112 px) | 0 |
| index | d1440 | header (fixed, 61 px) | div.demo-wrapper | 0 | 0 | 0 | 0 |
| index-fr | m390 | header (fixed, 61 px) | div.demo-wrapper | 0 | 0 | 0 | 0 |
| index-fr | d1440 | div.demo-wrapper | section.home-trust | 0 | 0 | 12 | 12 |
| index-fr | d1440 | section#faq.pricing-objections.home-purchase-faq | footer | 0 | 0 | (footer: padding interne .brand-close-statement 112 px) | 0 |
| index-fr | d1440 | header (fixed, 61 px) | div.demo-wrapper | 0 | 0 | 0 | 0 |
| contact | d1440 | div.contact-details | form.contact-form | -533.1 | 0 | 8 | -525.1 |
| contact-fr | d1440 | div.contact-details | form.contact-form | -533.1 | 0 | 8 | -525.1 |
| legal-notice | m390 | p | p | 12 | 0 | 0 | 12 |
| legal-notice | m390 | p | p | 12 | 0 | 0 | 12 |
| legal-notice | m390 | p | p | 11.9 | 0 | 0 | 11.9 |
| legal-notice | d1440 | p | p | 12 | 0 | 0 | 12 |
| legal-notice | d1440 | p | p | 11.9 | 0 | 0 | 11.9 |
| legal-notice | d1440 | p | p | 12 | 0 | 0 | 12 |
| mentions-legales | m390 | p | p | 12 | 0 | 0 | 12 |
| mentions-legales | m390 | p | p | 12 | 0 | 0 | 12 |
| mentions-legales | m390 | p | p | 12 | 0 | 0 | 12 |
| mentions-legales | d1440 | p | p | 12 | 0 | 0 | 12 |
| mentions-legales | d1440 | p | p | 12 | 0 | 0 | 12 |
| mentions-legales | d1440 | p | p | 11.9 | 0 | 0 | 11.9 |
| opt-out | m390 | p | p | 12 | 0 | 0 | 12 |
| opt-out | m390 | p | p | 12 | 0 | 0 | 12 |
| opt-out | d1440 | p | p | 12 | 0 | 0 | 12 |
| opt-out | d1440 | p | p | 12 | 0 | 0 | 12 |
| opposition | m390 | p | p | 12 | 0 | 0 | 12 |
| opposition | m390 | p | p | 12 | 0 | 0 | 12 |
| opposition | d1440 | p | p | 12 | 0 | 0 | 12 |
| opposition | d1440 | p | p | 12 | 0 | 0 | 12 |

Aucun espace visuel supérieur à 160 px. Les espaces de 0 à 12 px sont expliqués dans le tableau des constats (sections jointives à padding interne, paragraphes légaux, hero sous l'en-tête fixe, footer à padding interne de 112 px, colonnes côte à côte sur /contact).

### Annexe E : recouvrements de boîtes (niveau 1 entre eux, niveau 2 au sein d'un même parent)

| Page | Viewport | Parent | Boîte A | Boîte B | Recouvrement (l x h) |
| --- | --- | --- | --- | --- | --- |

### Annexe F : images visibles (cassées, ratio déformé, bordure)

| Page | Viewport | Image | Rendu (l x h) | Naturel (l x h) | Écart de ratio | object-fit | Bordure | Problème |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| index | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| index | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| index-fr | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| index-fr | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| our-solution | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| our-solution | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| notre-solution | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| notre-solution | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| pricing | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| pricing | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| tarifs | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| tarifs | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| faq | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| faq | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| faq-fr | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| faq-fr | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| about | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| about | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| a-propos | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| a-propos | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| careers | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| careers | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| recrutement | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| recrutement | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| contact | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| contact | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| contact-fr | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| contact-fr | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| customers | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| customers | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| clients | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| clients | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| media | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| media | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| medias | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| medias | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| legal-notice | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| legal-notice | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| mentions-legales | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| mentions-legales | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| privacy | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| privacy | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| confidentialite | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| confidentialite | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| terms | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| terms | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| conditions | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| conditions | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| opt-out | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| opt-out | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| opposition | m390 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |
| opposition | d1440 | /assets/logo-black-narrow.png | 23 x 28 | 1024 x 1024 | 0.179 | fill | 0px none rgb(26, 26, 26) | ratio déformé |

### Annexe G : boîtes dépassant la largeur de la fenêtre (débordement horizontal, clippé par html { overflow-x: clip })

| Page | Viewport | Élément | Gauche | Droite | Clippé par | Section |
| --- | --- | --- | --- | --- | --- | --- |
| index | m390 | ul | 22 | 1237 | (aucun conteneur : clippé par html) | section.home-signals |
| index | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| index | d1440 | ul | 184.5 | 1456.5 | (aucun conteneur : clippé par html) | section.home-signals |
| index | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| index-fr | m390 | ul | 22 | 1591 | (aucun conteneur : clippé par html) | section.home-signals |
| index-fr | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| index-fr | d1440 | ul | 184.5 | 1820.5 | (aucun conteneur : clippé par html) | section.home-signals |
| index-fr | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| our-solution | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| our-solution | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| notre-solution | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| notre-solution | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| pricing | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| pricing | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| tarifs | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| tarifs | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| faq | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| faq | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| faq-fr | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| faq-fr | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| about | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| about | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| a-propos | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| a-propos | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| careers | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| careers | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| recrutement | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| recrutement | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| contact | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| contact | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| contact-fr | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| contact-fr | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| customers | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| customers | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| clients | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| clients | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| media | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| media | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| medias | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| medias | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| legal-notice | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| legal-notice | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| mentions-legales | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| mentions-legales | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| privacy | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| privacy | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| confidentialite | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| confidentialite | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| terms | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| terms | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| conditions | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| conditions | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| opt-out | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| opt-out | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |
| opposition | m390 | div.mobile-menu-panel | 375 | 697.5 | (aucun conteneur : clippé par html) |  |
| opposition | d1440 | div.mobile-menu-panel | 1425 | 1785 | (aucun conteneur : clippé par html) |  |


## Compte

Lignes de constats : 21.

| Verdict | Sévérité | Nombre |
| --- | --- | --- |
| DÉGRADÉ | MAJEUR | 2 |
| DÉGRADÉ | MINEUR | 1 |
| OK | n/a | 18 |

Par verdict : DÉGRADÉ 3, OK 18 ; CASSÉ 0, TROMPEUR 0, NON TESTABLE 0.

## Couverture

- Pages (26, inventaire/pages.csv), chacune à 390x844 et 1440x900 (52 vues) : /, /index-fr, /our-solution, /notre-solution, /pricing, /tarifs, /faq, /faq-fr, /about, /a-propos, /careers, /recrutement, /contact, /contact-fr, /customers, /clients, /media, /medias, /legal-notice, /mentions-legales, /privacy, /confidentialite, /terms, /conditions, /opt-out, /opposition : capture pleine page, géométrie, images, débordements, espaces, recouvrements (lignes 1, 3 et 16 à 21 du tableau), diff FR/EN (13 paires, lignes 2 à 4).
- En-tête : capturé et comparé sur les 26 pages aux 2 viewports (48 comparaisons, lignes 5 à 7).
- Pied de page : capturé et comparé sur les 26 pages aux 2 viewports (48 comparaisons, lignes 8 et 9), plus l'expérience d'attribution (Annexe B2).
- Versions des CSS et JS par page : 26 pages (Annexe C, lignes 12 à 15).
- Hors périmètre du flux (non testé ici) : Firefox et WebKit, états interactifs (menus ouverts, accordéons), pages hors sitemap.

## Fichiers produits

- docs/audit-total/screens/11/ : 52 captures pleine page (JPEG q50, `<page>-<viewport>-fullpage.jpg`), 26 diffs FR/EN (`pair-<en>-vs-<fr>-<viewport>.png`, réduits à 50 %), 4 diffs d'en-tête et 45 diffs de pied de page (`header-`/`footer-<page>-vs-<référence>-<viewport>.png`, réduits à 50 % au besoin), 5 captures de la bande des signaux, 2 preuves du logo du footer ; toutes sous 400 Ko.
- Scratchpad flux11 (non versionné) : capture.mjs, analyze.mjs, render.mjs, hfdetail.mjs, visualgap.mjs, signals-check.mjs, footer-neutral.mjs, footer-aligned.mjs, btncheck.mjs, menucheck.mjs, compress.sh, analysis.json, geo/*.json, raw/*.png, diff/*.png.
