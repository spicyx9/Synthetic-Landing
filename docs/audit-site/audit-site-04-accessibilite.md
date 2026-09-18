# Volet 4 : accessibilité

Méthode : axe-core 4.13 (@axe-core/playwright, Chromium 1194, tags wcag2a, wcag2aa, wcag21aa, best-practice) sur les 26 URL en 1280 px et 390 px avec `prefers-reduced-motion: reduce` et attente `networkidle` ; vérifications structurelles par script Python sur les 26 fichiers HTML (lang, h1, hiérarchie, alt, labels, noms accessibles) ; contrastes calculés avec la formule WCAG 2.x à partir des couleurs littérales des CSS (styles.css n'expose aucune variable de couleur, seulement `--site-header-height` en styles.css:8) ; tests clavier Playwright (skip link sur 26 pages, parcours Tab complet sur /index-fr, /tarifs, /faq-fr, /contact-fr, FAQ, pastille démo sur /notre-solution, menu mobile sur /index-fr à 390 px) ; une passe sans reduced motion sur la home FR. Scripts et sorties brutes : `scratchpad/tools/volet4/` (axe-run.js, axe-results.json, struct.py, struct.json, kbd.js, kbd.json).

## Constats

| Sévérité | Page(s) | Fichier:ligne | Constat | Correction exacte |
|---|---|---|---|---|
| MAJEUR | /, /index-fr, /pricing, /tarifs | pricing-interactive.css:39 et pricing-interactive.css:143 | Texte gris #777 sur la carte blanche (#fff, pricing-interactive.css:13) : ratio 4.47:1, sous le seuil AA 4.5:1. Touche `.pricing-config-kicker` ("Synthetic Swarm", 13 px) et les 5 boutons de palier `.pricing-range-steps button` non actifs (10, 20, 100, 200, 200+, 12 px). axe `color-contrast` serious, 6 nœuds par page, desktop et mobile. | Dans pricing-interactive.css:39 remplacer `color: #777;` par `color: #6b6b6b;` (5.33:1) et dans pricing-interactive.css:143 remplacer `color: #777;` par `color: #6b6b6b;` |
| MAJEUR | /, /index-fr, /pricing, /tarifs | pricing-interactive.css:61 | `.pricing-config-period` ("/mois", "/month", 15 px) en #888 sur #fff : ratio 3.54:1. axe `color-contrast` serious, 1 nœud par page, desktop et mobile. | Dans pricing-interactive.css:61 remplacer `color: #888;` par `color: #6b6b6b;` (5.33:1) |
| MAJEUR | /, /index-fr | demo.css:151 | Badge "BREAKING NEWS" : texte #fff 11 px sur #e74c3c, ratio 3.82:1 (texte normal, seuil 4.5:1 ; le gras à 11 px ne compte pas comme grand texte). axe l'a classé `incomplete` (fond de l'eyebrow semi-transparent, demo.css:80-82), ratio calculé à partir des couleurs déclarées. | Dans demo.css:151 remplacer `background: #e74c3c;` par `background: #c0392b;` (5.44:1) |
| MINEUR | /pricing, /tarifs | pricing.html:114, tarifs.html:114, pricing-interactive.css:225 et 289 | Saut de niveau de titre : le seul h2 précédent (ligne 76) est dans `.pricing-custom-copy[hidden]`, donc la structure visible est h1 (ligne 63) puis h3 "Questions before you start" / "Questions avant de commencer". axe `heading-order` moderate, desktop et mobile. La home utilise un h2 pour le même bloc (index-fr.html:194). | pricing.html:114 : `<h2>Questions before you start</h2>` ; tarifs.html:114 : `<h2>Questions avant de commencer</h2>` ; pricing-interactive.css:225 et 289 : remplacer le sélecteur `.pricing-objections h3` par `.pricing-objections h2` |
| MINEUR | /faq, /faq-fr, /, /index-fr, /pricing, /tarifs | pricing-interactive.css:255-259 et 261 | Le signe "+" / "−" généré par `summary::after` entre dans le nom accessible du summary (arbre d'accessibilité Chromium relevé : "Comment ça marche concrètement ? −"). | pricing-interactive.css:256 : `content: '+' / '';` et pricing-interactive.css:261 : `.pricing-faq-item[open] summary::after { content: '−' / ''; }` (syntaxe de texte alternatif CSS, une chaîne vide masque le glyphe aux lecteurs d'écran) |
| MINEUR | /index-fr | index-fr.html:86 | Texte anglais "BREAKING NEWS" dans une page `lang="fr"` sans attribut de langue (WCAG 3.1.2). Les liens de bascule de langue portent bien `lang` (index-fr.html:66-67). | `<span class="hero-eyebrow-badge" lang="en">BREAKING NEWS</span>` |
| MINEUR | 26 pages | index-fr.html:64 (identique sur chaque page, par exemple index.html:64) | Bouton de langue : le libellé visible "FR" (ou "EN") n'apparaît pas dans le nom accessible `aria-label="Choisir la langue"` / `aria-label="Choose language"` (WCAG 2.5.3 Label in Name, commande vocale "cliquer FR" inopérante). | Pages FR : `aria-label="FR, choisir la langue"` ; pages EN : `aria-label="EN, choose language"` |
| MINEUR | /notre-solution, /our-solution | notre-solution.html:106, our-solution.html:106, solution-page.js:48-70 | Pastille démo flottante inatteignable au clavier : le bloc est placé après `</footer>` (dernier de l'ordre de tabulation) et solution-page.js la rend `inert` dès que le CTA final entre dans la fenêtre. Parcours Tab complet mesuré : 42 étapes desktop, 37 mobile, la pastille n'a jamais reçu le focus alors qu'elle a été visible pendant le parcours. Fonction équivalente disponible au clavier (bouton "Démo" de l'en-tête, atteint à l'étape 8 ; CTA final). | Déplacer le bloc `<div class="floating-demo demo-booking" data-floating-demo inert aria-hidden="true">…</div>` (notre-solution.html:106 et our-solution.html:106) juste après `</header>` et avant `<main id="main"`, pour qu'il suive le bouton "Démo" de l'en-tête dans l'ordre de tabulation |
| MINEUR | 26 pages | styles.css:4147-4149 et styles.css:4219-4221 | `.mobile-menu-toggle:focus-visible` et `.mobile-menu-close:focus-visible` déclarent `outline: none;`. Sans effet aujourd'hui car site-pages.css:123 (chargé après) rétablit `outline: 2px solid #0a66c2` (mesuré : outline solid 2px rgb(10, 102, 194) sur les deux boutons), mais le focus disparaîtrait si site-pages.css n'était plus chargé. | Supprimer la ligne `outline: none;` en styles.css:4149 et en styles.css:4221 |
| MINEUR | /, /index-fr | home.css:254 | `.comparison-conclusion` ("Du temps perdu avant même le premier appel.", 18 à 21 px, graisse 500 donc texte normal) en #777 : 4.33:1 sur le fond de page #fcfbf8 (styles.css:22). axe l'a classé `incomplete` (fond non déterminé). | Dans home.css:254 remplacer `color:#777;` par `color:#6b6b6b;` (5.15:1 sur #fcfbf8) |
| MINEUR | /notre-solution, /our-solution | solution-page.css:586 | Graduations "10" / "200" du curseur de volume : #777 sur #fff à 10 px, ratio 4.47:1. axe `color-contrast` serious (1 nœud desktop, 2 mobile). | Dans solution-page.css:586 remplacer `color:#777;` par `color:#6b6b6b;` et `font-size:10px` par `font-size:12px` |
| MINEUR | 26 pages (popover "Réserver une démo") | styles.css:4464 | Mentions "CEO" / "CTO" du popover de réservation : #777 sur #fff à 12 px, ratio 4.47:1. | Dans styles.css:4464 remplacer `color: #777;` par `color: #6b6b6b;` |
| MINEUR | 26 pages | index-fr.html:59 et 224 (même motif sur chaque page) | `<span class="nav-disabled" role="link" aria-disabled="true">Médias</span>` et "Nos clients" : annoncés "lien, indisponible" par les lecteurs d'écran, non focusables, sans destination. La page /medias existe pourtant dans urls.txt. | Soit `<a href="/medias">Médias</a>` (et `<a href="/clients">Nos clients</a>`), soit retirer `role="link"` : `<span class="nav-disabled" aria-disabled="true">Médias</span>` |
| MINEUR | (aucune page) | floating-demo.js:1-26 | Fichier mort : `floating-demo.js` n'est chargé par aucune des 26 pages (grep `floating-demo.js` sur *.html : 0 résultat) ; la logique de la pastille vit dans solution-page.js:48-70 et diffère (masquage sur défilement vers le haut dans l'un, fenêtre hero/CTA final dans l'autre). Risque de correction au mauvais endroit. | Supprimer floating-demo.js (ou le charger et retirer le bloc dupliqué de solution-page.js:48-70) |

Points vérifiés sans constat (preuves) :
- `lang` : `fr` sur les 13 pages FR, `en` sur les 13 pages EN (struct.json) ; les liens de bascule portent `lang="fr"` / `lang="en"` (index-fr.html:66-67).
- Exactement un h1 par page sur les 26 pages ; aucun saut de niveau hors le cas /pricing et /tarifs ci-dessus.
- 100 % des `<img>` ont un attribut `alt` ; les décoratives sont en `alt=""` (index-fr.html:51, 74-75, 83-84, 104, 111). Aucun alt égal au nom de fichier ; `alt="Axel"` / `alt="Ilan"` (contact-fr.html:58) et `alt="IESEG"` (a-propos.html:83) sont des noms propres pertinents.
- Champs de formulaire : contact-fr.html:58 et contact.html:58, chaque input/textarea a un `<label for>` ; le champ piège `contact-website` est dans un conteneur `aria-hidden="true"` avec `tabindex="-1"` ; newsletter (index-fr.html:214) `aria-label="Votre email"` ; curseurs `aria-label` (tarifs.html:83) ou `<label for>` (notre-solution.html:71). pricing.js:28 met à jour `aria-valuetext` et pricing.js:37 `aria-pressed`.
- Tous les `<button>` et `<a>` rendus ont un nom accessible ; le seul `<a>` sans href (media.html:59) est dans un `<template>` non rendu.
- Focus visible : règle globale `a:focus-visible, button:focus-visible, summary:focus-visible { outline: 2px solid #0a66c2; outline-offset: 4px; }` (site-pages.css:10) ; compléments contact.css:30, careers.css:30, home.css:344, motion.css:30, pricing-interactive.css:169-173, solution-page.css:64, 202, 582-583, floating-demo.css:31, styles.css:4465-4466, 4470, site-pages.css:123. Parcours Tab mesuré : 34 éléments sur /index-fr, 32 sur /tarifs, 32 sur /faq-fr, 33 sur /contact-fr, tous avec `outline: solid 2px rgb(10, 102, 194)` différent de l'état non focalisé ; aucun élément focalisé caché, inert ou sous `aria-hidden`. `outline: none` sur `.pricing-range` (pricing-interactive.css:106) est compensé par pricing-interactive.css:169-173 (mesuré sur /tarifs, étape 11). Les `outline: none` de styles.css:531, demo.css:214 et leadgen.css:62 visent des sélecteurs absents des 26 pages.
- Skip link : présent sur les 26 pages (`<a href="#main" class="skip-link">`), premier élément focalisable, cible `#main` existante, visible au focus (top 8 px, `transform: translateY(0)` via site-pages.css:12), Entrée déplace le focus sur `<main tabindex="-1">` (posé par mobile-menu.js:6) et le Tab suivant atterrit dans le contenu (kbd.json, section skip, 26/26).
- FAQ : `<details>/<summary>` natifs (faq-fr.html : 10 items, home : 3). Summary focalisable, Entrée ouvre, Espace ferme puis rouvre (mesuré). Aucun `aria-expanded` n'est nécessaire ni présent : l'état ouvert/fermé est exposé nativement par l'élément details ; ce n'est pas un constat.
- Pastille démo (solution-page.js) : rôle natif `button` avec `aria-expanded` et `aria-controls="floating-demo-options"` (cible existante), nom "Réserver une démo 15 min avec l'équipe", avatars en `aria-hidden`. Au focus : outline 2px #0a66c2 offset 3px (styles.css:4465-4466). Entrée ouvre le popover (aria-expanded true), Tab entre dans le popover, Échap ferme et rend le focus au bouton, Flèche bas ouvre et focalise le premier lien (mobile-menu.js:99-105). Quand la pastille se masque alors qu'elle a le focus, le focus est renvoyé au bouton "Démo" de l'en-tête (desktop) ou au bouton du menu mobile (390 px), solution-page.js:59-62. Seul défaut : l'ordre de tabulation (constat MINEUR ci-dessus).
- Menu mobile (390 px) : bouton `aria-label="Ouvrir le menu"`, `aria-expanded` false/true, `aria-controls="mobile-menu"` (mobile-menu.js:11-13) ; overlay `role="dialog" aria-modal="true" aria-label="Navigation"` (mobile-menu.js:22-24) ; à l'ouverture le focus va sur "Fermer le menu", l'arrière-plan (skip link, header, main, footer) passe `inert` ; piège du focus vérifié sur 30 Tab (7 éléments cyclés, tous dans l'overlay, tous avec outline 2px) et Shift+Tab depuis le premier renvoie au dernier ; Échap ferme, `aria-expanded` repasse à false, l'arrière-plan redevient actif et le focus revient sur le bouton d'ouverture ; fermeture par Entrée sur "Fermer" idem. Ordre de tabulation en-tête mobile : skip link, logo, bouton menu, puis contenu.
- Animations sans reduced motion (home FR, 1280 px) : aucun élément de `<main>` masqué dans la fenêtre au chargement ; pendant le défilement, seuls les éléments de la scénographie `.solution-system` passent transitoirement à opacité 0 (`data-motion-state="playing"`) ; après défilement complet et 3 s d'attente, 0 élément à opacité < 1 sur toute la page (kbd.json, noReducedMotion). motion.css:13 garantit `.reveal { opacity: 1 }` sans JS.

## Compte axe par page

Nombre de nœuds en violation par impact (critical / serious / moderate / minor). "Incomplet" = nœuds `color-contrast` que axe n'a pu trancher (fonds dégradés ou semi-transparents), à vérifier à la main.

| URL | Desktop 1280 | Mobile 390 | Incomplet (desktop / mobile) |
|---|---|---|---|
| / | 0 / 7 / 0 / 0 | 0 / 7 / 0 / 0 | 40 / 37 |
| /index-fr | 0 / 7 / 0 / 0 | 0 / 7 / 0 / 0 | 40 / 37 |
| /our-solution | 0 / 1 / 0 / 0 | 0 / 2 / 0 / 0 | 19 / 14 |
| /notre-solution | 0 / 1 / 0 / 0 | 0 / 2 / 0 / 0 | 19 / 14 |
| /pricing | 0 / 7 / 1 / 0 | 0 / 7 / 1 / 0 | 4 / 4 |
| /tarifs | 0 / 7 / 1 / 0 | 0 / 7 / 1 / 0 | 4 / 4 |
| /faq | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /faq-fr | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /about | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /a-propos | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /careers | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /recrutement | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /contact | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /contact-fr | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /customers | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /clients | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /media | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /medias | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /legal-notice | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /mentions-legales | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /privacy | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /confidentialite | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /terms | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /conditions | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /opt-out | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |
| /opposition | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 |

Règles violées (2 au total) :
- `color-contrast` (serious) : `/`, `/index-fr`, `/pricing`, `/tarifs` (`.pricing-config-kicker`, `.pricing-config-period`, `button[data-pricing-step]` 1, 2, 4, 5, 6) et `/our-solution`, `/notre-solution` (`.sp-volume-ticks > span`). Corrections : voir les lignes MAJEUR et MINEUR ci-dessus.
- `heading-order` (moderate) : `/pricing`, `/tarifs`, sélecteur `h3` ("Questions before you start" / "Questions avant de commencer"). Correction : ligne MINEUR ci-dessus.

## Contrastes mesurés

Ratios calculés (formule WCAG 2.x, luminance relative sRGB) à partir des couleurs déclarées ; AA texte normal = 4.5:1, AA grand texte (24 px, ou 18.66 px gras) = 3:1.

| Couple (fichier:ligne) | Taille | Ratio | AA texte normal (4.5) | AA grand texte (3) |
|---|---|---|---|---|
| Texte du corps #1a1a1a sur fond page #fcfbf8 (styles.css:21-22) | 16 px | 16.82:1 | OK | OK |
| Gris secondaire #666 sur #fcfbf8 : footer 13 px (site-pages.css:15), `.page-intro p` 18 px (site-pages.css:26), `.solution-intro` 15 px (home.css:312), `.pricing-subtitle` 16 px (styles.css:3787), `.pricing-config-summary` 15 px (pricing-interactive.css:68) | 13 à 18 px | 5.55:1 | OK | OK |
| Gris #555 sur #fcfbf8 : `.nav-links a` 13.5 px (styles.css:119-122), `.site-footer-columns li` 14 px (site-pages.css:18), `.about-menu > button` (site-pages.css:5) | 13.5 à 14 px | 7.20:1 | OK | OK |
| Gris #5f5f5f sur #fcfbf8 : `.pricing-faq-item p` 14 px (pricing-interactive.css:265) | 14 px | 6.17:1 | OK | OK |
| Gris rgb(100,100,105) sur #fcfbf8 : `.demo-hero__subtitle` (demo.css:180-182) | 16 à 20 px | 5.69:1 | OK | OK |
| Gris #777 sur carte #fff : `.pricing-config-kicker` 13 px (pricing-interactive.css:39), `.pricing-range-steps` 12 px (pricing-interactive.css:143), `.demo-booking-person-copy > span` 12 px (styles.css:4464), `.sp-volume-ticks` 10 px (solution-page.css:586) | 10 à 13 px | 4.47:1 | ECHEC | OK |
| Gris #777 sur #fcfbf8 : `.comparison-conclusion` 18 à 21 px graisse 500 (home.css:254) | 18 à 21 px | 4.33:1 | ECHEC | OK |
| Gris #777 sur #fcfbf8 : `.nav-disabled` (site-pages.css:79) | 13.5 à 14 px | 4.33:1 | exempté (composant inactif, WCAG 1.4.3) | OK |
| Gris #777 : glyphe "+" / "−" de `summary::after` 21 px (pricing-interactive.css:255-259), indicateur d'état non textuel (1.4.11, seuil 3:1) | 21 px | 4.33:1 | n/a | OK |
| Gris #888 sur #fff : `.pricing-config-period` 15 px (pricing-interactive.css:61) | 15 px | 3.54:1 | ECHEC | OK |
| Bouton primaire : #fff sur #1a1a1a (`.btn-get-started` styles.css:290-291, `.page-button` site-pages.css:38, `.pricing-config-btn`) | 14 px | 17.40:1 | OK | OK |
| Bouton secondaire : #1a1a1a sur #fff (`.page-button--secondary` site-pages.css:39) ; `.btn-login` #1a1a1a sur #fcfbf8 (styles.css:274-275) | 14 px | 17.40:1 | OK | OK |
| Bordure du bouton secondaire #dfdbd6 sur #fcfbf8 (site-pages.css:39, styles.css:276) : non textuel, le texte suffit à identifier le bouton, 1.4.11 non exigé | n/a | 1.33:1 | n/a | ECHEC (information) |
| Liens : `a { color: inherit }` (styles.css:31-34), donc #1a1a1a ou #555 selon le conteneur (voir lignes ci-dessus) ; `.page-kicker` #0a66c2 sur #fcfbf8 12 px gras (site-pages.css:24) | 12 px | 5.50:1 | OK | OK |
| Pastille démo : `strong` #fff sur #111 (floating-demo.css:11, 23) | 13 px | 18.88:1 | OK | OK |
| Pastille démo : sous-titre #9a9a9a sur #111 (floating-demo.css:24) | 11 px | 6.71:1 | OK | OK |
| Pastille démo : flèche #fff sur #2e2e2e (floating-demo.css:28) | 16 px | 13.58:1 | OK | OK |
| Badge "BREAKING NEWS" : #fff sur #e74c3c (demo.css:150-153) | 11 px gras | 3.82:1 | ECHEC | OK |
| Badge "Forfait préféré" : #fff sur #1a1a1a (pricing-interactive.css:25-26) | 11 px gras | 17.40:1 | OK | OK |
| Date et texte de l'eyebrow #fff (demo.css:161-162, home.css:54) sur fond rgba(22,22,24,0.4) + backdrop-filter au-dessus de l'aurora (demo.css:80-84) | 12 à 13 px | non calculable statiquement | à vérifier à l'écran (axe : incomplete) | idem |
| Indicateur de focus #0a66c2 sur #fcfbf8 (site-pages.css:10), non textuel, seuil 3:1 | n/a | 5.50:1 | n/a | OK |
| Indicateur de focus #0a66c2 sur #fff (cartes, popovers) | n/a | 5.69:1 | n/a | OK |

## Compte : 0 bloquant(s), 3 majeur(s), 11 mineur(s)

## Non couvert

- axe n'a été exécuté que sur l'état initial des pages : menu mobile ouvert, popovers "Réserver une démo" ouverts, FAQ dépliées et paliers "200+" (bloc `pricing-custom-copy`) n'ont pas été scannés.
- Pas de test avec un vrai lecteur d'écran (NVDA, VoiceOver, TalkBack) : seuls l'arbre d'accessibilité Chromium (ariaSnapshot) et les attributs ARIA ont été relevés.
- Zoom 200 %, reflow à 320 px, orientation et taille des cibles tactiles (2.5.8) non mesurés.
- Le parcours Tab complet a été fait sur les 4 pages demandées en desktop, plus /notre-solution en desktop et mobile ; les autres pages n'ont eu que le test du skip link.
- Contraste des textes sur fonds dégradés ou semi-transparents (eyebrow du hero, 40 nœuds `incomplete` sur la home) : non mesuré à l'écran.
- La détection des fragments en langue étrangère est heuristique (quelques chaînes anglaises recherchées dans les pages FR) ; aucune vérification exhaustive.
- Le fichier leadgen.css et les sélecteurs `.chat-input-top`, `.demo-hero__input`, `.aui-composer` (outline: none) ne sont utilisés par aucune des 26 pages : non testés.

## git status

Sortie de `git status --short` dans /home/user/Synthetic-Landing avant remise (les autres entrées, audit-site-07-seo.md et screens/, appartiennent aux autres volets exécutés en parallèle dans le même arbre de travail ; ce volet n'a créé que audit-site-04-accessibilite.md, aucun fichier du site n'a été modifié) :

```
?? docs/audit-site/audit-site-04-accessibilite.md
?? docs/audit-site/audit-site-07-seo.md
?? docs/audit-site/screens/
```
