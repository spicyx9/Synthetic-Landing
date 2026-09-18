# Volet 1 : responsive

Méthode : Playwright 1.56.1 / Chromium headless contre le serveur local à sémantique Vercel (http://127.0.0.1:4173), `page.emulateMedia({ reducedMotion: 'reduce' })` puis attente `networkidle` ; 26 pages x 5 largeurs (360x780, 390x844, 768x1024 en émulation mobile `isMobile: true, hasTouch: true` ; 1024x768 et 1440x900 en mode desktop), captures haut et pied de page en JPEG q60 ; mesures DOM (scrollWidth/innerWidth, bounding boxes, images, cibles tactiles, scrollWidth des éléments texte) par `volet1/capture.js`, agrégation `volet1/analyze.js`, interactions réelles en 390 px par `volet1/interact.js`, `volet1/floatpop.js` et `volet1/extra.js` (dossier tools/volet1 du scratchpad). Les polices Google (Inter) ne chargeaient pas dans Chromium (CA du proxy de test) : les captures finales ont été refaites avec une route Playwright qui récupère les polices côté Node (CA approuvé), 4 faces Inter chargées sur les 130 chargements.

| Sévérité | Page(s) | Fichier:ligne | Constat | Correction exacte |
|---|---|---|---|---|
| MAJEUR | /contact, /contact-fr | contact.css:20 | Champs du formulaire en `font-size: 15px` (mesuré 15px sur les 6 champs à 390 px, `interact.js`). Safari iOS zoome automatiquement la page au focus d'un champ dont la police est inférieure à 16 px : le prospect se retrouve zoomé et décalé en saisissant Nom / Email. Capture : docs/audit-site/screens/check-contact-form-contact-fr-390.jpg | `.contact-field input, .contact-field textarea { font-size: 16px; }` (à placer après la ligne 20 de contact.css) |
| MAJEUR | /our-solution, /notre-solution | solution-page.css:196 | Les 5 `select` du bloc ciblage (`#target-0` à `#target-decision`) sont rendus en 12 px (mesure `extra.js` à 390 px : 230x42, font-size 12px ; règle de base 13px ligne 196) : texte sous 16 px, zoom iOS au focus, et lisibilité faible pour un formulaire de qualification. Capture : docs/audit-site/screens/check-targeting-notre-solution-390.jpg | `@media (max-width: 980px) { .sp-setting select { font-size: 16px; min-height: 44px; } }` |
| MAJEUR | /pricing, /tarifs, /, /index-fr | pricing-interactive.css:100, :148-160, :287 | Sélecteur de volume : la zone tactile du `input.pricing-range` fait 264x8 px à 360 et 294x8 px à 390 (seul le pouce de 24 px dépasse), les 6 boutons de palier font 32x36 px avec un texte de 11 px (mesures `capture.js` et `interact.js`). Le fonctionnement est correct (tap sur 100 : 789 €, flèche droite : 1 499 €, tap au début de la piste : 89 €) mais les cibles sont sous 44 px. Captures : docs/audit-site/screens/tarifs-360-top.jpg, docs/audit-site/screens/check-pricing-selector-tarifs-390.jpg | Bloc A ci-dessous |
| MINEUR | toutes | styles.css:12 et styles.css:15 | Le "375 px pour 390 px" du test rapide est confirmé sur les 26 pages en mode desktop (`html` 375 px, `innerWidth` 390 ; sortie `analyze.js`, section Desktop mode 390) mais il vient de `scrollbar-gutter: stable` : Chromium réserve 15 px pour sa barre de défilement classique, que le mode headless ne peint pas (bande vide). En émulation mobile (barres en surimpression, comme sur iOS/Android) les 26 pages mesurent `scrollWidth` = `innerWidth` à 360, 390 et 768 px. Preuve : docs/audit-site/screens/check-desktop-scrollbar-home-390.jpg (même page, barre peinte dans la bande). Seul effet réel : sur desktop, les pages courtes sans défilement (ex. /legal-notice à 1440 : scrollY 0/0) gardent une gouttière vide de 15 px à droite, contenu décalé de 7,5 px | Aucune correction nécessaire sur mobile. Si la gouttière desktop gêne : remplacer la ligne 12 par `scrollbar-gutter: auto;` (au prix d'un léger décalage entre pages qui défilent et pages courtes) |
| MINEUR | toutes | styles.css:4134-4144 | Bouton burger `.mobile-menu-toggle` 38x38 px (padding 8px + svg 22px), sous 44 px (mesure `interact.js`, 6 pages). Capture : docs/audit-site/screens/check-menu-open-index-fr-390.jpg | `.mobile-menu-toggle { padding: 11px; min-width: 44px; min-height: 44px; }` |
| MINEUR | toutes | styles.css:88-97 | Lien logo `.logo` 147x23 px dans l'en-tête et 316x23 px dans le pied (52 mesures) : hauteur tactile 23 px | `.logo { min-height: 44px; }` (l'en-tête fait 61 px, aucune incidence de mise en page) |
| MINEUR | toutes | site-pages.css:18 | Liens des colonnes du pied de page 17 px de haut (ex. "FAQ" 28x17, "Mentions légales" 105x17, mesures à 360 et 390), sous le minimum WCAG 2.5.8 de 24 px et loin des 44 px. Capture : docs/audit-site/screens/index-fr-390-bottom.jpg | `.site-footer-columns li { margin: 0; }` puis `.site-footer-columns li a { display: inline-block; padding: 12px 0; }` |
| MINEUR | toutes (héros, pied, /customers, /clients, menu mobile) | styles.css:287-295 et site-pages.css:102-104 | Boutons `.btn-get-started` 37 px de haut (324x37 à 360, 123x37 sur /customers) et boutons "Connexion" / "Démo" du menu mobile 112x38 px (`height:38px`) | `.btn-get-started { padding: 11px 18px; min-height: 44px; }` et `.mobile-menu-footer .header-action { height: 44px; }` |
| MINEUR | /contact, /contact-fr | contact.css:33 et contact.css:14 | Actions "Copier" 35x28 px et "Envoyer un email" 106x28 px (police 12 px, `padding: 5px 0`), liens "LinkedIn" des fondateurs 72x17 px. Capture : docs/audit-site/screens/contact-fr-360-top.jpg | `.contact-email-actions a, .contact-email-actions button { padding: 12px 0; min-height: 44px; font-size: 13px; }` et `.contact-founder a { display: inline-block; padding: 12px 0; }` |
| MINEUR | /our-solution, /notre-solution | solution-page.css:293, :398, :191, :200 | Onglets de combinaison 61x33 à 83x33 px en 11 px, `summary` "Contrôle du téléphone" 258x18 px, curseur `#target-volume` 308x20 px (mesures `capture.js` et `extra.js` à 360/390). Capture : docs/audit-site/screens/check-targeting-notre-solution-390.jpg | Bloc B ci-dessous |
| MINEUR | /about, /a-propos | about.css:17 | `.founder-link` "LinkedIn ↗" 78x41 px | `.founder-link { min-height: 44px; }` |
| MINEUR | /, /index-fr | demo.css:123-125 | La date de l'eyebrow ("SEPTEMBER 17, 2026", 12,5 px en capitales) porte un `text-shadow: 0 1px 1px rgba(0,0,0,.25)` : rendu dédoublé/flou sur fond gris, visible à 768 px. Capture : docs/audit-site/screens/home-768-top.jpg | `.demo-wrapper .demo-hero__eyebrow .hero-eyebrow-date { text-shadow: none; }` |

Bloc A (pricing-interactive.css, remplace la hauteur 8 px de la ligne 100 et les minima des lignes 148-160 ; le trait visuel reste de 8 px) :

```css
.pricing-range {
  height: 24px;
  background: linear-gradient(to right, #1a1a1a 0%, #1a1a1a var(--progress), #e7e4df var(--progress), #e7e4df 100%) center / 100% 8px no-repeat;
}
.pricing-range-steps { height: 44px; }
.pricing-range-steps button { min-width: 44px; min-height: 44px; font-size: 12px; }
```

Bloc B (solution-page.css, à ajouter en fin de fichier) :

```css
.sp-combination-controls button, .sp-combination .sp-combination-controls button { min-height: 44px; padding: 12px 10px; font-size: 13px; }
.sp-company-details summary { display: inline-block; padding: 12px 0; }
.sp-volume input { height: 44px; }
```

Points vérifiés sans défaut (preuves dans `volet1/results.json` et `volet1/interact.json`) :
- Débordement horizontal : aucun sur les 26 pages à 360, 390 et 768 px (`document.documentElement.scrollWidth` = `innerWidth` sur les 78 mesures mobiles) ; à 1024 et 1440 en mode desktop, `scrollWidth` = `innerWidth` moins la gouttière de 15 px (voir ligne styles.css:12 ci-dessus). Le seul élément dont la boîte dépasse à droite est le décor `.aurora__blob--2` (+29 à +99 px), rogné par son conteneur `.aurora` (`overflow: hidden`), sans incidence.
- Images déformées : 0 sur 130 chargements (ratio naturel vs affiché, écart > 2 %, `object-fit: cover` exclu).
- Textes coupés ou chevauchants : aucun. Le seul `scrollWidth` > `clientWidth` (summary "Passage en société / SEL" / "Company structure / SEL", +7 px sur toutes les largeurs) correspond à l'icône "+" tournée de 45° de l'item ouvert par défaut (solution-page.css:165 `transform: rotate(45deg)`) : boîte englobante élargie, glyphe visuellement dans la carte (docs/audit-site/screens/check-sp-change-notre-solution-390.jpg).
- Menu mobile (390 px, 6 pages) : bouton burger visible, ouverture (`.mobile-menu-overlay.open`, `aria-expanded="true"`, panneau 335x844 px à x=55, bord droit 390), verrouillage du défilement (`body.style.position = fixed`) et restauration à la fermeture, focus déplacé sur le bouton de fermeture 44x44, sous-menu "À propos" ouvrable, fermeture par le bouton, liens 295x51 px, tap sur "Notre solution" navigue vers /notre-solution.
- Pastille "Réserver une démo" : présente uniquement sur /our-solution et /notre-solution (`data-floating-demo`, notre-solution.html:106). Elle n'apparaît qu'entre le héros et le CTA final (solution-page.js:58) : masquée en haut de page, visible à scrollY 900 (rect 75,784 à 316,828, bouton 239x44), masquée en pied de page, donc aucun chevauchement avec les CTA du pied (mesure `overlapsCTA` vide). Le popover s'ouvre vers le haut, entièrement dans le viewport (rect 75,622 à 316,772, deux liens 223x66), se ferme par tap à l'extérieur et par Échap. Pas de bouton de fermeture propre (seul le défilement la masque). Capture : docs/audit-site/screens/check-floating-popover-notre-solution-390.jpg
- FAQ : `details`/`summary` (10 sur /faq-fr, 3 sur /tarifs et les homes) : summary 342 à 346 px de large, 72 à 116 px de haut, ouverture et fermeture au tap vérifiées (docs/audit-site/screens/check-faq-open-faq-fr-390.jpg).
- Formulaire de contact : 6 champs 346x52 px (textarea 150 px) avec `label for`, focus au tap sur `#contact-lastName`, saisie "Dupont" restituée, Tab passe au champ suivant, bouton "Envoyer" 95x45 px, pas de débordement horizontal pendant la saisie.
- Aucune erreur JS ni ressource en échec sur les 130 chargements de la campagne finale (la seule erreur de la première campagne, `net::ERR_CERT_AUTHORITY_INVALID` sur fonts.googleapis.com, venait du proxy de l'environnement de test).

## Tableau récapitulatif pages x largeurs

Lecture : `sw` = `document.documentElement.scrollWidth` / `innerWidth` ; "cibles<44" = cibles tactiles non inline sous 44 px / total des cibles visibles (dont sous 24 px) ; aucune image déformée ni erreur JS n'ont été relevées ; la mention "1 texte(s) débordant(s)" sur /our-solution et /notre-solution est le faux positif de l'icône "+" tournée décrit plus haut. À 1024 et 1440 (mode desktop) l'écart de 15 px est la gouttière de barre de défilement.

| Page | 360 | 390 | 768 | 1024 | 1440 |
|---|---|---|---|---|---|
| / | sw 360/360 ; cibles<44: 23/31 (dont <24: 14) | sw 390/390 ; cibles<44: 23/31 (dont <24: 14) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /index-fr | sw 360/360 ; cibles<44: 23/31 (dont <24: 14) | sw 390/390 ; cibles<44: 23/31 (dont <24: 14) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /our-solution | sw 360/360 ; 1 texte(s) débordant(s) ; cibles<44: 25/36 (dont <24: 15) | sw 390/390 ; 1 texte(s) débordant(s) ; cibles<44: 25/36 (dont <24: 15) | sw 768/768 ; 1 texte(s) débordant(s) | sw 1009/1024 ; 1 texte(s) débordant(s) | sw 1425/1440 ; 1 texte(s) débordant(s) |
| /notre-solution | sw 360/360 ; 1 texte(s) débordant(s) ; cibles<44: 25/36 (dont <24: 15) | sw 390/390 ; 1 texte(s) débordant(s) ; cibles<44: 25/36 (dont <24: 15) | sw 768/768 ; 1 texte(s) débordant(s) | sw 1009/1024 ; 1 texte(s) débordant(s) | sw 1425/1440 ; 1 texte(s) débordant(s) |
| /pricing | sw 360/360 ; cibles<44: 22/27 (dont <24: 14) | sw 390/390 ; cibles<44: 22/27 (dont <24: 14) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /tarifs | sw 360/360 ; cibles<44: 22/27 (dont <24: 14) | sw 390/390 ; cibles<44: 22/27 (dont <24: 14) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /faq | sw 360/360 ; cibles<44: 15/27 (dont <24: 13) | sw 390/390 ; cibles<44: 15/27 (dont <24: 13) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /faq-fr | sw 360/360 ; cibles<44: 15/27 (dont <24: 13) | sw 390/390 ; cibles<44: 15/27 (dont <24: 13) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /about | sw 360/360 ; cibles<44: 17/18 (dont <24: 13) | sw 390/390 ; cibles<44: 17/18 (dont <24: 13) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /a-propos | sw 360/360 ; cibles<44: 17/18 (dont <24: 13) | sw 390/390 ; cibles<44: 17/18 (dont <24: 13) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /careers | sw 360/360 ; cibles<44: 15/25 (dont <24: 13) | sw 390/390 ; cibles<44: 15/25 (dont <24: 13) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /recrutement | sw 360/360 ; cibles<44: 15/25 (dont <24: 13) | sw 390/390 ; cibles<44: 15/25 (dont <24: 13) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /contact | sw 360/360 ; cibles<44: 17/28 (dont <24: 16) | sw 390/390 ; cibles<44: 17/28 (dont <24: 16) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /contact-fr | sw 360/360 ; cibles<44: 17/28 (dont <24: 16) | sw 390/390 ; cibles<44: 17/28 (dont <24: 16) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /customers | sw 360/360 ; cibles<44: 16/17 (dont <24: 13) | sw 390/390 ; cibles<44: 16/17 (dont <24: 13) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /clients | sw 360/360 ; cibles<44: 16/17 (dont <24: 13) | sw 390/390 ; cibles<44: 16/17 (dont <24: 13) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /media | sw 360/360 ; cibles<44: 15/17 (dont <24: 13) | sw 390/390 ; cibles<44: 15/17 (dont <24: 13) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /medias | sw 360/360 ; cibles<44: 15/17 (dont <24: 13) | sw 390/390 ; cibles<44: 15/17 (dont <24: 13) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /legal-notice | sw 360/360 ; cibles<44: 15/17 (dont <24: 14) | sw 390/390 ; cibles<44: 15/17 (dont <24: 14) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /mentions-legales | sw 360/360 ; cibles<44: 15/17 (dont <24: 14) | sw 390/390 ; cibles<44: 15/17 (dont <24: 14) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /privacy | sw 360/360 ; cibles<44: 15/18 (dont <24: 15) | sw 390/390 ; cibles<44: 15/18 (dont <24: 15) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /confidentialite | sw 360/360 ; cibles<44: 15/18 (dont <24: 15) | sw 390/390 ; cibles<44: 15/18 (dont <24: 15) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /terms | sw 360/360 ; cibles<44: 16/20 (dont <24: 16) | sw 390/390 ; cibles<44: 16/20 (dont <24: 17) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /conditions | sw 360/360 ; cibles<44: 16/20 (dont <24: 17) | sw 390/390 ; cibles<44: 16/20 (dont <24: 17) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /opt-out | sw 360/360 ; cibles<44: 16/18 (dont <24: 14) | sw 390/390 ; cibles<44: 16/18 (dont <24: 14) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |
| /opposition | sw 360/360 ; cibles<44: 16/18 (dont <24: 14) | sw 390/390 ; cibles<44: 16/18 (dont <24: 14) | sw 768/768 | sw 1009/1024 | sw 1425/1440 |

## Les 10 captures les plus problématiques

1. docs/audit-site/screens/check-desktop-scrollbar-home-390.jpg : home à 390 px en mode desktop avec barre de défilement peinte : la bande de 15 px à droite est la gouttière `scrollbar-gutter: stable` (html 375 px), pas un conteneur contraint.
2. docs/audit-site/screens/tarifs-360-top.jpg : carte tarifaire à 360 px, piste du curseur de 8 px et paliers 10 / 20 / 50 / 100 / 200 / 200+ en 11 px (32x36 px).
3. docs/audit-site/screens/pricing-360-top.jpg : même sélecteur en anglais, mêmes dimensions.
4. docs/audit-site/screens/check-pricing-selector-tarifs-390.jpg : sélecteur après les interactions tactiles (tap palier 100, flèche droite, tap début de piste : montant 89 €) : fonctionnel, cibles petites.
5. docs/audit-site/screens/contact-fr-360-top.jpg : bloc "Écrivez-nous" avec actions "Envoyer un email" et "Copier" en 12 px (28 px de haut), liens LinkedIn 17 px, premiers champs du formulaire (police 15 px).
6. docs/audit-site/screens/check-contact-form-contact-fr-390.jpg : formulaire après saisie "Dupont" et "a@b.c" (focus et saisie corrects, police des champs 15 px, zoom iOS à prévoir).
7. docs/audit-site/screens/check-targeting-notre-solution-390.jpg : bloc ciblage de /notre-solution, 5 listes déroulantes en 12 px, curseur de volume 20 px de haut.
8. docs/audit-site/screens/index-fr-390-bottom.jpg : pied de page à 390 px, liens de 17 px de haut et bouton "Réserver une démo" de 37 px (même rendu sur les 26 pages, ex. docs/audit-site/screens/home-360-bottom.jpg).
9. docs/audit-site/screens/home-768-top.jpg : héros à 768 px, date de l'eyebrow dédoublée par le `text-shadow`, boutons "Book a demo" / "Discover our solution" de 37 px.
10. docs/audit-site/screens/check-menu-open-index-fr-390.jpg : menu mobile ouvert (fonctionnel) avec boutons "Connexion" / "Démo" de 38 px et burger de 38 px derrière l'overlay.

## Compte : 0 bloquant(s), 3 majeur(s), 9 mineur(s)

## Non couvert

- Aucun test sur appareil réel ni sur Safari iOS / Chrome Android : uniquement Chromium headless en émulation (viewport, touch, barres en surimpression). Le zoom iOS au focus des champs sous 16 px est un comportement documenté de Safari, non reproduit ici.
- Orientation paysage, largeur 320 px, zoom navigateur 200 %, mode sombre et états hover/focus des liens non mesurés.
- Le chevauchement d'éléments n'a été vérifié que pour la pastille flottante (boîtes englobantes contre les CTA) et via `scrollWidth` des éléments texte : pas de détection générique de superposition.
- Captures limitées au haut et au pied de chaque page (260 fichiers) plus 22 captures "check-*" ciblées ; les sections intermédiaires (comparatifs, listes de signaux) n'ont pas toutes été inspectées visuellement.
- Première campagne de captures réalisée sans la police Inter (échec de chargement dû au proxy) puis refaite avec Inter : seules les captures de la seconde campagne sont conservées ; les mesures des deux campagnes concordent (mêmes 73 cibles sous 44 px, même faux positif de summary).
- Poids des JPEG non optimisé au-delà de la qualité 60.

## git status

Sortie de `git status --short` au rendu (le fichier audit-site-08-legal.md appartient à un autre volet de l'audit, il n'a pas été produit ici ; aucun fichier du site n'a été modifié) :

```
?? docs/audit-site/audit-site-01-responsive.md
?? docs/audit-site/audit-site-08-legal.md
?? docs/audit-site/screens/
```
