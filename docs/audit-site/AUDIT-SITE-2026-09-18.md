# Audit du site Synthetic Swarm, 18 septembre 2026

Audit en lecture seule de https://www.syntheticswarm.ai (repo Synthetic-Landing, 26 pages en 13 paires FR/EN, Vercel avec cleanUrls). Aucun fichier du site n'a été modifié : chaque rapport de volet colle son `git status --short` en fin de document.

## Périmètre et méthode

| Élément | Valeur |
|---|---|
| Base auditée | `origin/main` (313a356) + branche SEO `claude/charming-euler-5m6jld` (17 commits : rename pricing-fr en tarifs, sitemap, robots, JSON-LD), mergés en f0034da. La production du 18/09 ne porte pas encore cette passe SEO (robots.txt et sitemap.xml y répondent 404, titres encore avec U+2014). |
| Serveur local | `scripts/dev-server.js` sur http://127.0.0.1:4173 : cleanUrls, pas de trailing slash, redirections de `vercel.json` (Vercel émet 308 pour `permanent: true` et 307 sinon, jamais 301), 404 sinon. Vérifié : /, /index-fr, /tarifs, /faq-fr en 200 ; /pricing-fr en 308 vers /tarifs ; 26/26 URL du sitemap en 200. |
| Outils | Playwright 1.56.1 + Chromium (captures, interactions, coverage, console), axe-core 4 (WCAG 2.1 AA), Lighthouse 13.5 (mobile), scripts Python et Node par volet, curl via le proxy sortant. |
| Liste de référence | `docs/audit-site/urls.txt` : les 26 `<loc>` de `sitemap.xml`. |
| Captures | `docs/audit-site/screens/` : 282 JPEG (26 pages x 5 largeurs x haut/pied, plus 22 captures ciblées `check-*`), 9,7 Mo. |
| Sévérités | BLOQUANT : empêche de vendre ou casse une page. MAJEUR : visible par un prospect. MINEUR : hygiène. |

Deux fausses pistes écartées par les volets eux-mêmes : le « 375 px dans un viewport de 390 » du test initial est la gouttière `scrollbar-gutter: stable` (styles.css:12) du Chromium desktop en headless, sans effet en émulation mobile (volet 1) ; les « 404 » locaux sur `action="/api/contact"` sont une limite du serveur statique, la production répond 405 (volet 2).

## 1. Bloquants, toutes sources confondues

| Sévérité | Volet | Page(s) | Constat |
|---|---|---|---|
| (aucun) | 1 à 9 | 26 pages | Aucun constat BLOQUANT sur les neuf volets. Ce qui aurait été bloquant a été testé et tient : 26 pages en 200, 1 005 références internes sans 3xx ni 404, 0 `href="#"`, 133 actions inventoriées qui mènent toutes quelque part (app.syntheticswarm.ai/ui/ en 200, deux agendas Google en 200), formulaire de contact fonctionnel en EN et FR (succès, erreur, coupure réseau, délai, double envoi), opt-out en mailto correctement encodé, aucun placeholder `[[...]]` sur les 26 pages, 0 erreur JavaScript bloquante. |

## 2. Les 10 corrections au meilleur ratio impact/effort

Les numéros de ligne sont ceux de l'audit sur f0034da ; repérer par contenu si le fichier a bougé.

### 1. Raccourcir les deux meta descriptions de la home (volet 7)
Fichiers : `index.html:8`, `index-fr.html:8`. Aujourd'hui 184 et 194 caractères : Google tronque vers 155 et l'argument « registres publics » disparaît du snippet.
```html
<!-- index.html:8 (158 caractères) -->
<meta name="description" content="Synthetic Swarm spots executives whose situation just changed and delivers their name, phone and the reason to call, every week. French public registers only.">
<!-- index-fr.html:8 (155 caractères) -->
<meta name="description" content="Synthetic Swarm repère les dirigeants dont la situation vient de changer et vous livre chaque semaine leur nom, leur téléphone et la raison de les appeler.">
```

### 2. Supprimer « leads » des pages françaises (volet 3)
Fichiers : `index-fr.html:146, 157, 158, 162, 163, 165, 166`, `tarifs.html:8, 64, 75, 76, 80, 81, 83, 84`, `pricing.js:28`, `a-propos.html:83`. Le mot est interdit dans le corps FR (règle de marque) et apparaît 5 fois dans le bloc tarifaire visible, 2 fois dans les attributs lus par les lecteurs d'écran, 1 fois dans la meta de /tarifs et 1 fois dans la bio d'Ilan.
- index-fr.html:146 et tarifs.html:64 : `Un seul forfait. Vous ajustez simplement le nombre de fiches que vous recevez chaque semaine.`
- :157 / :75 : `<strong data-pricing-leads>50</strong> fiches qualifiées par semaine`
- :158 / :76 : `Besoin de plus de 200 fiches par semaine ?`
- :162 / :80 : `Fiches par semaine`
- :163 / :81 : `<span data-pricing-leads>50</span> fiches`
- :165 / :83 : `aria-valuetext="50 fiches par semaine" aria-label="Fiches par semaine"`
- :166 / :84 : `aria-label="Fiches par semaine"`
- pricing.js:28 : `(isFr ? ' fiches par semaine' : ' leads per week')`
- tarifs.html:8 : `<meta name="description" content="Tarifs Synthetic Swarm, choisissez le nombre de fiches qualifiées reçues chaque semaine.">`
- a-propos.html:83 : `J’y ai construit des outils, automatisé des process et travaillé sur la conversion des prospects.`
Les attributs techniques `data-pricing-leads` / `data-leads` ne sont pas visibles et restent.

### 3. CSS : trois contrastes sous le seuil AA et champs de saisie à 16 px (volets 4 et 1)
Fichiers : `pricing-interactive.css:39`, `:61`, `:143`, `demo.css:151`, `contact.css` (après la ligne 20), `solution-page.css` (après la ligne 196). Les gris #777 et #888 du bloc tarifaire (deux homes, /pricing, /tarifs) et le badge « BREAKING NEWS » sont sous 4.5:1 ; les 6 champs du contact sont en 15 px et les 5 `select` du bloc ciblage en 12 px, donc Safari iOS zoome la page au focus.
- pricing-interactive.css:39 et :143 : remplacer `color: #777;` par `color: #6b6b6b;` (5.33:1)
- pricing-interactive.css:61 : remplacer `color: #888;` par `color: #6b6b6b;`
- demo.css:151 : remplacer `background: #e74c3c;` par `background: #c0392b;` (5.44:1)
```css
/* contact.css, après la ligne 20 */
.contact-field input, .contact-field textarea { font-size: 16px; }
/* solution-page.css, après la ligne 196 */
@media (max-width: 980px) { .sp-setting select { font-size: 16px; min-height: 44px; } }
```

### 4. Masquer les deux sections inertes de la home (volets 3 et 6)
Fichiers : `index.html:137` et `:207`, `index-fr.html:137` et `:207`. La section témoignages affiche trois cartes vides annoncées « Customer testimonial placeholder » / « Emplacement de témoignage client » (customers.json est vide) ; la newsletter est un formulaire grisé dans un `<fieldset disabled>` sans action ni handler. Ajouter `hidden` sur les deux `<section>` ; customers.js:66 réaffiche la première dès trois témoignages vérifiés.
```html
<!-- index.html:137 et index-fr.html:137 -->
<section id="customer-proof" class="content-page home-customer-proof" data-customer-stories data-customer-preview aria-labelledby="customer-preview-title" hidden>
<!-- index.html:207 et index-fr.html:207 -->
<section id="newsletter" class="content-page home-newsletter" aria-labelledby="newsletter-title" hidden>
```

### 5. Faire arriver le prospect sur l'app avec son forfait (volet 6)
Fichiers : `pricing.js:41-50`, `pricing.html:101`, `tarifs.html:101`, `index.html:183`, `index-fr.html:183`. « Choisir ce forfait » garde `https://app.syntheticswarm.ai/ui/` quel que soit le volume : le prospect atterrit sur l'écran de connexion sans rappel du volume ni du prix.
```js
// pricing.js, dans updatePricing(), remplacer le bloc if (custom) { … } else { … } (lignes 41 à 50) par :
const base = 'https://app.syntheticswarm.ai/ui/';
if (custom) {
  delete checkout.dataset.leads;
  delete checkout.dataset.price;
  checkout.href = base;
} else {
  checkout.dataset.leads = String(plan.leads);
  checkout.dataset.price = String(plan.price);
  checkout.href = base + '?leads=' + plan.leads + '&price=' + plan.price + '&lang=' + (isFr ? 'fr' : 'en');
  // Closing the custom selector also prevents stale focusable calendar links.
  customBooking.querySelector('[data-disclosure-panel]').hidden = true;
  customBooking.querySelector('[data-book-demo]').setAttribute('aria-expanded', 'false');
}
```
```html
<!-- pricing.html:101 et index.html:183 (état sans JavaScript = 50 leads) -->
<a href="https://app.syntheticswarm.ai/ui/?leads=50&amp;price=399&amp;lang=en" class="pricing-config-btn" data-pricing-checkout data-leads="50" data-price="399">Choose this plan</a>
<!-- tarifs.html:101 et index-fr.html:183 -->
<a href="https://app.syntheticswarm.ai/ui/?leads=50&amp;price=399&amp;lang=fr" class="pricing-config-btn" data-pricing-checkout data-leads="50" data-price="399">Choisir ce forfait</a>
```
Côté app : lire `leads` et `price` dans `new URLSearchParams(window.location.search)` et présélectionner le forfait (l'app ignore aujourd'hui les paramètres inconnus, l'ajout est sans risque ; non vérifiable ici).

### 6. Créer une page 404 aux couleurs du site (volet 2)
Fichier : `404.html` (nouveau, racine). Sans lui, Vercel sert sa 404 générique : anglais, `<title>404: NOT_FOUND</title>`, sans header ni lien de retour, un seul lien vers vercel.com. Contenu exact : bloc A du rapport `audit-site-02-liens.md` (header FR de `index-fr.html:49-80` réutilisé, classes `content-page`, `page-intro`, `page-kicker`, `page-actions`, `page-button`, `page-button--secondary`). Contrainte : `tests/site.test.cjs` teste tous les `.html` de la racine, le 404 doit donc embarquer le header complet (bouton connexion vers app.syntheticswarm.ai/ui/, bouton démo `data-book-demo`, popover avec les deux agendas et les portraits) ; copier le `<header>` et le `<footer>` complets de `index-fr.html`, pas seulement la nav.

### 7. Ne plus servir ni indexer ce qui n'est pas destiné au public (volets 2, 7 et 9)
Fichiers : `sitemap.xml` (blocs `<url>` lignes 88-93, 94-99, 100-105, 106-111), `customers.html`, `clients.html`, `media.html`, `medias.html`. Ces pages affichent « Customer stories are coming soon. » / « No publications yet. », sont indexables, dans le sitemap, et liées par aucun `<a>` (78 `<span role="link" aria-disabled="true">` sur les 26 pages). Tant qu'elles sont vides : supprimer les 4 blocs `<url>` du sitemap et ajouter dans le `<head>` des 4 pages :
```html
<meta name="robots" content="noindex, follow">
```
Quand elles auront du contenu : dans `scripts/site_layout.py`, fonction `company_link`, supprimer la ligne `if key in ['media','customers']: return f'<span class="nav-disabled" role="link" aria-disabled="true">{label}</span>'`, régénérer, puis retirer `clients | customers` du motif de `tests/site.test.cjs:36` et supprimer `tests/site.test.cjs:39`.

Second volet de la même correction : les fichiers internes sont servis en production (`curl https://www.syntheticswarm.ai/BRAND.md` = 200, de même /CONTACT_SETUP.md, /tests/site.test.cjs, /scripts/site_layout.py, /docs/header-audit.md, /demo.js, /leadgen.css). CONTACT_SETUP.md:17-19 y expose le nom du champ pot de miel et le seuil anti-spam. Créer `.vercelignore` à la racine (aucune page ne référence ces fichiers) :
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
À valider sur un déploiement de preview : /BRAND.md doit répondre 404.

### 8. Redimensionner les portraits téléchargés par toutes les pages (volet 9, confirmé par le volet 5)
Fichiers : `assets/team/axel-ceo.png` (1 721 963 octets, 1254x1254), `assets/team/ilan-cto.jpg` (110 587 octets, 1254x1254), `assets/logo-black-narrow.png` (124 746 octets, 1024x1024), `README.md:39`. Le portrait d'Axel est affiché en 38 px dans le popover démo de chaque page et en 56 px sur /about : il est téléchargé sur les 26 pages et représente à lui seul 1,7 Mo sur les 4,3 Mo de la home mobile. Garder les noms de fichiers (72 références HTML et JSON-LD) :
```bash
magick assets/team/axel-ceo.png -resize 224x224 -strip -define png:compression-level=9 assets/team/axel-ceo.png
magick assets/team/ilan-cto.jpg -resize 224x224 -strip -quality 82 assets/team/ilan-cto.jpg
magick assets/logo-black-narrow.png -resize 80x80 -strip assets/logo-black-narrow.png
```
Variante du volet 5 si ImageMagick n'est pas installé (résultat testé : 3,7 Ko en WebP 256x256) : `npm i -D sharp && node -e "const s=require('sharp');s('assets/team/axel-ceo.png').resize(256,256).webp({quality:80}).toFile('assets/team/axel-ceo.webp');s('assets/team/ilan-cto.jpg').resize(256,256).webp({quality:80}).toFile('assets/team/ilan-cto.webp')"` ; elle impose de remplacer les `src` sur les 26 pages, donc à réserver au LOT 2 (flux P) pour ne pas entrer en conflit avec la correction 10. README.md:39 devient : `The supplied Ilan portrait is stored at \`assets/team/ilan-cto.jpg\`, resized to 224x224 for the 38px and 56px circular crops; CSS controls the crop. The supplied Axel portrait is stored at \`assets/team/axel-ceo.png\` at the same size.`

### 9. Donner à la politique de confidentialité une section « Vos droits » complète (volet 8)
Fichiers : `confidentialite.html:65`, `privacy.html:65`. La section renvoie au seul email : pas de lien vers /opposition, pas de délai, pas de droit de réclamation auprès de la CNIL. Remplacer la section (même nombre de sections, `tests/legal.test.cjs` inchangé) :
```html
<!-- confidentialite.html:65 -->
<section><h2>Vos droits</h2><p>Vous pouvez demander l'accès, la rectification, l'effacement ou la limitation de vos données, ou vous opposer à tout moment à leur utilisation à des fins de prospection. Pour demander le retrait de vos coordonnées, utilisez la page <a href="/opposition">Droit d'opposition</a> ou écrivez à <a href="mailto:contact@syntheticswarm.ai">contact@syntheticswarm.ai</a>. Nous répondons dans un délai maximal d'un mois. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).</p></section>
<!-- privacy.html:65 -->
<section><h2>Your rights</h2><p>You may request access, correction, deletion or restriction of your data, or object at any time to its use for prospecting. To request the removal of your contact details, use the <a href="/opt-out">Opt out</a> page or email <a href="mailto:contact@syntheticswarm.ai">contact@syntheticswarm.ai</a>. We reply within one month at most. You may also lodge a complaint with the CNIL, the French data protection authority (www.cnil.fr).</p></section>
```

### 10. Ajouter Open Graph et Twitter Card sur les 26 pages (volet 7)
Fichiers : ligne 8 de chaque page (ligne 9 sur `pricing.html` et `tarifs.html`, où le `og:title` orphelin est remplacé). Aujourd'hui aucun lien partagé sur LinkedIn, Slack, WhatsApp ou iMessage n'a d'aperçu. Les 26 blocs exacts (og:title = title de la page, og:description = meta description, og:url = canonical, og:type, og:locale, og:locale:alternate, twitter:card `summary`, image provisoire `/assets/logo-black-narrow.png` 1024x1024) sont dans l'annexe « Bloc A » de `audit-site-07-seo.md`. [asset à fournir : image 1200x630 opaque, logo + baseline sur fond #fcfbf8, pour passer en `summary_large_image`.]

## 3. Compte par volet

| Volet | Bloquants | Majeurs | Mineurs | Rapport |
|---|---|---|---|---|
| 1. Responsive | 0 | 3 | 9 | [audit-site-01-responsive.md](audit-site-01-responsive.md) |
| 2. Liens et navigation | 0 | 2 | 2 | [audit-site-02-liens.md](audit-site-02-liens.md) |
| 3. Cohérence FR/EN | 0 | 5 | 11 | [audit-site-03-contenu.md](audit-site-03-contenu.md) |
| 4. Accessibilité | 0 | 3 | 11 | [audit-site-04-accessibilite.md](audit-site-04-accessibilite.md) |
| 5. Performance | 0 | 5 | 9 | [audit-site-05-performance.md](audit-site-05-performance.md) |
| 6. Formulaires et actions | 0 | 2 | 6 | [audit-site-06-formulaires.md](audit-site-06-formulaires.md) |
| 7. SEO et métadonnées | 0 | 3 | 9 | [audit-site-07-seo.md](audit-site-07-seo.md) |
| 8. Pages légales | 0 | 10 | 8 | [audit-site-08-legal.md](audit-site-08-legal.md) |
| 9. Hygiène du repo et JS | 0 | 3 | 12 | [audit-site-09-hygiene.md](audit-site-09-hygiene.md) |
| Total | 0 | 36 | 77 | 113 constats ; six d'entre eux sont relevés par deux ou trois volets (pages vides, portraits, orphelins, legal.css en double, versions ?v=, spans désactivés) et ne sont comptés qu'une fois dans les lots. |

Décisions à prendre par les fondateurs avant le LOT 2 (aucune donnée n'a été inventée par l'audit, ces points reviennent dans plusieurs volets) :

| # | Décision | Volets | Effet |
|---|---|---|---|
| D1 | Les données viennent-elles uniquement des registres publics (INSEE/Sirene, BODACC, RNE, ORIAS) ou aussi de sources web (sites d'entreprise, presse, profils publics) ? | 3, 8 | Soit retirer 8 nœuds du schéma « sources » de la page solution, soit reformuler la promesse « registres publics uniquement » des deux homes et nommer les sources dans la politique de confidentialité. |
| D2 | Le profil LinkedIn fait-il partie des données livrées ? | 3, 8 | 10 pages le promettent, les meta descriptions ne le disent pas ; la politique de confidentialité doit le lister ou les pages doivent le retirer. |
| D3 | L'exclusivité d'une fiche (jamais transmise à un autre client) est-elle réelle, et pour quelle durée ? | 8 | Clause à ajouter aux CGV ou question à retirer de la FAQ (et du JSON-LD). |
| D4 | Délai de signalement d'une fiche injoignable pour remplacement gratuit ? | 8 | Clause CGV §6 à écrire. |
| D5 | Mentions légales : capital social, ville du greffe RCS, numéro de TVA, directeur de la publication, hébergeur (dénomination, adresse, téléphone). | 8 | Sans ces données les mentions légales restent à 4 lignes. |
| D6 | Délai de traitement d'une demande d'opposition et sort des fiches déjà livrées aux clients. | 8 | Deux phrases sur /opposition et /opt-out. |
| D7 | Image de partage 1200x630 (logo + baseline sur fond #fcfbf8). | 7 | Sans elle, les aperçus LinkedIn restent en `summary` avec le logo carré. |

## 4. LOT 1 : prompt prêt à coller

```text
Contexte : repo spicyx9/Synthetic-Landing, site statique déployé sur Vercel (cleanUrls, aucune URL en .html), 26 pages en 13 paires FR/EN, domaine https://www.syntheticswarm.ai. L'audit du 18 septembre 2026 (docs/audit-site/AUDIT-SITE-2026-09-18.md) n'a trouvé aucun bloquant ; ce lot applique ses 10 corrections prioritaires. Le contenu exact de chaque correction est dans la section 2 de ce fichier (corrections 1 à 10) et, pour les blocs longs, dans le rapport de volet cité : lis-les avant d'écrire une ligne. Les numéros de ligne datent de l'audit : repère par contenu.

EXECUTION RULES
Branche claude/lot-1 depuis origin/main à jour. Si la branche SEO claude/charming-euler-5m6jld n'est pas encore mergée dans main, merge-la d'abord dans claude/lot-1 : l'audit est basé dessus (tarifs.html, sitemap.xml, JSON-LD).
Un commit par correction (10 commits minimum), jamais un seul commit final. Push à la fin de chaque étape.
Ne touche à rien d'autre que ce qui est listé. Aucun tiret cadratin ni demi-cadratin dans ce que tu écris. N'invente aucune donnée : ce qui est marqué [donnée à fournir] reste tel quel ou attend la réponse.
Étape 1 : trois flux en parallèle (3 subagents, fichiers disjoints).
  Flux A, pages tarifaires et home. Corrections 1 (meta descriptions), 2 (« leads » en FR), 4 (masquer les deux sections inertes), 5 (forfait transmis à l'app). Fichiers : index.html, index-fr.html, tarifs.html, pricing.html, pricing.js, a-propos.html. Après la correction 5, vérifie avec Playwright que le href du bouton change à chaque palier du sélecteur sur les 4 pages.
  Flux B, CSS. Correction 3 (trois contrastes et champs à 16 px). Fichiers : pricing-interactive.css, demo.css, contact.css, solution-page.css. Vérifie les ratios avec axe-core sur /tarifs et /contact-fr.
  Flux C, exposition et conformité. Corrections 6 (404.html), 7 (pages vides hors sitemap avec noindex, .vercelignore), 8 (portraits redimensionnés), 9 (section « Vos droits »). Fichiers : 404.html (nouveau), .vercelignore (nouveau), sitemap.xml, customers.html, clients.html, media.html, medias.html, confidentialite.html, privacy.html, assets/team/axel-ceo.png, assets/team/ilan-cto.jpg, assets/logo-black-narrow.png, README.md ligne « stored unchanged ». Pour le 404.html : copie le <header> et le <footer> complets de index-fr.html (bouton connexion, bouton démo, popover avec les deux agendas et les portraits), pas seulement la nav, sinon tests/site.test.cjs échoue. Pour les images : garde les noms de fichiers (72 références), vérifie le rendu à 38 px et 56 px dans une capture.
Étape 2, séquentielle après les trois flux : correction 10 (Open Graph et Twitter Card sur les 26 pages, blocs de l'annexe A de docs/audit-site/audit-site-07-seo.md ; sur pricing.html et tarifs.html le bloc remplace le og:title orphelin). Elle édite le <head> de toutes les pages, y compris celles des flux A et C, donc jamais en parallèle.
Étape 3, vérification : `for f in tests/*.test.cjs; do node --test "$f"; done` (pas `node --test tests/`, qui échoue sous Node 22). Seul échec toléré : comparison.test.cjs sur index-fr.html (test périmé, corrigé au LOT 2). Puis : grep prouvant l'absence de tiret cadratin et demi-cadratin dans les fichiers modifiés ; `node scripts/dev-server.js` et curl sur /nexistepas (404 avec le header du site), /customers (meta noindex présente), /BRAND.md (toujours servi en local, exclu en production par .vercelignore : à valider sur le déploiement de preview Vercel) ; parse de chaque bloc JSON-LD et de sitemap.xml (22 <loc>).
Rends : la liste des commits, le résultat des tests, la sortie des curl, et pour les 26 pages le title, la meta description avec sa longueur, et la présence des 7 balises og:/twitter:.
```

## 5. LOT 2 : prompt prêt à coller

```text
Contexte : repo spicyx9/Synthetic-Landing, site statique Vercel (cleanUrls), 26 pages en 13 paires FR/EN, https://www.syntheticswarm.ai. Le LOT 1 est appliqué. Ce lot traite tout le reste de l'audit du 18 septembre 2026 : les majeurs restants et les mineurs des 9 volets. Chaque correction est décrite avec son contenu exact dans le rapport de volet indiqué (docs/audit-site/audit-site-0X-*.md, colonne « Correction exacte », repère par numéro de ligne du rapport). Les décisions D1 à D7 de la synthèse doivent être tranchées avant de lancer les flux L et C ; sans réponse, laisse [donnée à fournir] et ne devine rien.

EXECUTION RULES
Branche claude/lot-2 depuis origin/main à jour (LOT 1 mergé). Un commit par correction ou par lot homogène de pages. Aucun tiret cadratin ni demi-cadratin dans ce que tu écris. Ne modifie jamais un test pour le faire passer, sauf les deux cas explicitement listés (comparison.test.cjs:20 périmé, compteurs de sections de legal.test.cjs si une section légale est ajoutée).
Étape 1 : six flux en parallèle (6 subagents, fichiers disjoints).
  Flux L, juridique. Fichiers : mentions-legales.html, legal-notice.html, confidentialite.html, privacy.html, conditions.html, terms.html, opposition.html, opt-out.html, tests/legal.test.cjs. Corrections : volet 8 lignes 7 (mentions légales complètes, D5), 8 (sources nommées, D1), 9 (base légale, durée de conservation, portable du dirigeant), 11 (formulaire de contact et Resend), 12 (cookie ss-language et localStorage), 13 (tiers : Google Fonts, Vercel, Stripe, Google Calendar, Resend), 14 (délai d'opposition, D6), 15 (exclusivité, D3), 16 (remplacement des fiches injoignables, D4), 17 à 24 (mineurs : « France » dans l'adresse FR, responsable de traitement avec adresse, dates, périmètre CGV, tribunal compétent, loi du 11 août 2026, San Francisco vs siège, candidatures et comptes clients) ; volet 9 lignes 10 et 11 (legal.css chargé deux fois dans conditions.html:16-17, version ?v=legal-cleanup harmonisée sur les 6 pages légales).
  Flux C, contenu et produit. Fichiers : index.html, index-fr.html, our-solution.html, notre-solution.html, faq.html, faq-fr.html, about.html, a-propos.html, careers.html, recrutement.html, pricing.html, tarifs.html, contact.html, contact-fr.html. Corrections : volet 3 lignes 12 (LinkedIn livré ou non, D2), 13 (registres vs sources web, D1), 14 (badge BREAKING NEWS : lang="en" ou traduction, date), 15 (U+2013 dans les options « 1-50 » et « 51-200 »), 16 (U+2014 encodé dans les 8 mailto de candidature), 17 (« en continu » / « continuously » sur 6 pages), 18 (deux versions de la même réponse FAQ EN), 19 (persona « Ateliers Exemple »), 20 (« Industry » vs « profession »), 21 (signature du pied de page FR/EN), 23 (curseur de la page solution hors grille tarifaire), 24 (chronologie « a few months ») ; volet 4 lignes 12 (h3 après h1 sur pricing.html:114 et tarifs.html:114 : passer en h2) et 14 (lang sur « BREAKING NEWS ») ; volet 7 lignes 14 (8 descriptions sous 50 caractères, balises fournies), 15 et 16 (logo Organization 112 px minimum et logo sur le second nœud Organization) ; volet 9 ligne 13 (chemins relatifs de pricing.html et tarifs.html en absolus).
  Flux S, CSS et accessibilité. Fichiers : styles.css, site-pages.css, contact.css, about.css, solution-page.css, solution-page.js, pricing-interactive.css, home.css, demo.css. Corrections : volet 1 lignes 10 à 18 (scrollbar-gutter, burger 38 px, logo 23 px, liens de pied 17 px, boutons 37 et 38 px, actions du contact 28 px, onglets et curseur de la page solution, lien LinkedIn des fondateurs, text-shadow de la date) ; volet 4 lignes 13 (signe +/- du summary sorti du nom accessible), 16 (pastille démo atteignable au clavier), 17 (outline: none sur les boutons du menu mobile), 18 à 20 (contrastes #777 restants : home.css:254, solution-page.css:586, styles.css:4464).
  Flux F, formulaire de contact. Fichiers : contact.js, api/contact.js, CONTACT_SETUP.md. Corrections : volet 6 lignes 9 (regex email alignée client/serveur), 10 (message dédié pour 429, 503, 502), 11 (libellé FR « Envoi… » pendant l'envoi), 12 (formulaire sans JavaScript : accepter application/x-www-form-urlencoded ou retirer action/method), 14 (documenter le pot de miel ailleurs que dans un fichier servi).
  Flux H, hygiène du repo. Fichiers : tests/comparison.test.cjs, .github/workflows/test.yml (nouveau), scripts/site_layout.py, scripts/dev-server.js, .gitignore, .claude/launch.json, README.md, BRAND.md, docs/header-audit.md, docs/motion-qa.md, docs/production-implementation-audit.md, assets/ (orphelins), demo.js, floating-demo.js, leadgen.css, clients.html, customers.html, sitemap.xml. Corrections : volet 9 lignes 12 (version de customers.js sur clients.html et customers.html), 14 (git rm demo.js, floating-demo.js, leadgen.css), 15 (git rm des 26 images orphelines, bloc C du rapport, puis BRAND.md:241-248), 16 (comparison.test.cjs:20 : « déménage » devient « emménage »), 17 (bloc D : workflow CI `node --test tests/*.test.cjs`), 18 (gabarit page() de site_layout.py : versions, viewport, route legacy, titre et x-default déjà corrigés), 19 (.claude/launch.json retiré du suivi et ignoré), 20 (branches locales fusionnées à supprimer), 21 (README routes, BRAND.md sticky et #777, header-audit pricing-fr, motion-qa à supprimer) ; volet 7 lignes 18 (lastmod dans sitemap.xml), 21 (dev-server : /index en 308 vers /), 22 (assertions SEO étendues aux 26 pages dans les tests) ; volet 2 ligne 10 (logo EN vers / : documenter la redirection FR, aucune modification recommandée).
  Flux P, performance. Fichiers : assets/ (nouveaux fichiers WebP uniquement, aucun HTML), vercel.json, home.css. Corrections : volet 5 lignes 7 et 8 (variante WebP des portraits et du logo : produire assets/team/axel-ceo.webp, assets/team/ilan-cto.webp, assets/logo-black-narrow.webp avec sharp ou cwebp, commandes exactes dans le rapport), 9 (assets/decor-3.webp 232x232), 12 (assets/decor-2.webp 260x260), 13 (assets/emlyon-logo.webp 44x44), 14 (bloc `headers` de vercel.json : cache long sur /assets, CSS et JS, avec `immutable` seulement si chaque modification change le `?v=`), 17 (copier la règle `.customer-grid` de customers.css dans home.css). Les balises `<img>` correspondantes (src .webp, width, height, loading="lazy") sont posées par le flux C, qui possède index.html, index-fr.html, about.html et a-propos.html : volet 5 lignes 7, 8, 9, 12, 13 pour les balises exactes, ligne 17 pour retirer `<link rel="stylesheet" href="/customers.css">` de index.html:22 et index-fr.html:22, ligne 18 pour `defer` sur pricing.js. Ne pas purger styles.css dans ce flux (voir étape 4).
Étape 2, séquentielle après les six flux, car elle touche le <head> ou le header des 26 pages : volet 4 ligne 15 (aria-label du bouton de langue incluant « FR » ou « EN »), volet 7 ligne 17 (apple-touch-icon 180x180 à partir d'un asset carré existant, sinon [asset à fournir]), volet 2 ligne 9 (FAQ et Contact dans la navigation principale : modifier scripts/site_layout.py puis régénérer les 26 pages, et adapter tests/site.test.cjs:36-37 qui verrouillent le menu actuel), volet 9 ligne 11 (paramètres ?v= harmonisés par fichier sur toutes les pages), volet 4 ligne 21 et volet 6 ligne 13 (spans « Nos clients » et « Médias » désactivés : les retirer du menu tant que les pages sont vides, ou les activer quand elles auront du contenu, via site_layout.py), volet 5 ligne 11 (feuille Google Fonts en preload asynchrone avec `wght@400..800` et repli `<noscript>`, balises exactes dans le rapport, sur les 26 pages), volet 5 ligne 18 (`defer` sur mobile-menu.js sur les 26 pages), volet 5 ligne 8 (logo d'en-tête en `/assets/logo-black-narrow.webp` avec width et height sur les 26 pages, si le flux P a produit le fichier).
Étape 3, vérification : `for f in tests/*.test.cjs; do node --test "$f"; done` doit être entièrement vert (le test périmé est corrigé dans ce lot).
Étape 4, optionnelle et séparée (commit à part, facile à annuler) : volet 5 ligne 10, purge et minification de styles.css (utilisé à 7 à 11 %), commandes exactes dans le rapport avec la safelist des classes ajoutées par JavaScript ; obligatoirement suivie des tests, d'axe-core sur 26 pages et d'une comparaison de captures avant/après aux 5 largeurs, car une classe purgée à tort casse un état d'animation ou de menu. Grep des tirets sur les fichiers modifiés. `node scripts/dev-server.js` puis axe-core sur les 26 pages (0 violation attendue) et une capture à 390 px des pages solution, tarifs et contact. Rends la liste des commits, le compte des tests, le compte axe par page, et la liste des [donnée à fournir] restants.
```

## Annexes : les 9 rapports de volet

1. [Volet 1 : responsive](audit-site-01-responsive.md) (captures dans [screens/](screens/))
2. [Volet 2 : liens et navigation](audit-site-02-liens.md)
3. [Volet 3 : cohérence de contenu FR/EN](audit-site-03-contenu.md)
4. [Volet 4 : accessibilité](audit-site-04-accessibilite.md)
5. [Volet 5 : performance](audit-site-05-performance.md)
6. [Volet 6 : formulaires et actions](audit-site-06-formulaires.md)
7. [Volet 7 : SEO et métadonnées](audit-site-07-seo.md)
8. [Volet 8 : pages légales et cohérence juridique](audit-site-08-legal.md)
9. [Volet 9 : hygiène du repo et JavaScript](audit-site-09-hygiene.md)

Environnement de test reproductible : `node scripts/dev-server.js 4173` puis `docs/audit-site/urls.txt` comme liste de référence.
