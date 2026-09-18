# Volet 7 : SEO et métadonnées

Méthode : les 26 pages de docs/audit-site/urls.txt ont été analysées par script (scratchpad tools/volet7/audit.py : parseur HTML, requêtes sans suivi de redirection sur http://127.0.0.1:4173, parse XML du sitemap, json.loads de chaque bloc JSON-LD, lecture des en-têtes PNG/JPEG des assets), puis les tableaux et blocs de correction ont été générés par tools/volet7/gen.py ; trois sondes de contrôle ont été faites sur la production (https://www.syntheticswarm.ai) pour /index, /index.html et l'exposition de fichiers internes. Lecture seule : aucun fichier du site modifié.

Note de contexte (hors compte) : au 2026-09-18 la production ne contient pas encore cette passe SEO : le titre servi sur / est "Insurance prospecting U+2014 Synthetic Swarm", il n'y a pas de hreflang x-default, et /robots.txt comme /sitemap.xml répondent 404 (mesuré par curl). Tout ce rapport porte sur la branche claude/audit-site telle qu'elle sera livrée.

## Constats

| Sévérité | Page(s) | Fichier:ligne | Constat | Correction exacte |
|---|---|---|---|---|
| MAJEUR | / | index.html:8 | meta description de 184 caractères (bornes 50 à 160) : Google tronque le snippet vers 155 à 160 caractères, la fin "French public registers only." (argument de conformité) disparaît de la page de résultats | `<meta name="description" content="Synthetic Swarm spots executives whose situation just changed and delivers their name, phone and the reason to call, every week. French public registers only.">` (158 caractères) |
| MAJEUR | /index-fr | index-fr.html:8 | meta description de 194 caractères : même troncature, "Registres publics français uniquement." disparaît | `<meta name="description" content="Synthetic Swarm repère les dirigeants dont la situation vient de changer et vous livre chaque semaine leur nom, leur téléphone et la raison de les appeler.">` (155 caractères) |
| MAJEUR | 26 pages | index.html:8 (ligne 8 de chaque page, ligne 8 puis 9 sur pricing.html et tarifs.html) | Aucune balise Open Graph ni Twitter Card sur 24 pages ; pricing.html:9 et tarifs.html:9 ne portent qu'un `og:title` orphelin (sans og:description, og:url, og:image, og:type, og:locale, twitter:card). Tout lien partagé sur LinkedIn, Slack, WhatsApp ou iMessage s'affiche sans image et avec un titre ou une description de repli choisis par la plateforme. Aucune image 1200x630 n'existe dans assets/ (mesuré : les seuls carrés de marque sont assets/logo-black-narrow.png 1024x1024 RGBA à fond transparent, et assets/favicon.png 32x32 ; assets/logo-black-2x.png fait 128x78) | Bloc A (annexe : 26 blocs, un par page, à insérer après la ligne 8 ; sur pricing.html et tarifs.html il remplace la ligne 9). Image provisoire : /assets/logo-black-narrow.png avec `twitter:card` = `summary` ; [asset à fournir : image 1200x630 opaque (logo + baseline sur fond #fcfbf8) pour passer en `summary_large_image`] |
| MINEUR | /careers, /recrutement, /contact, /contact-fr, /media, /medias, /legal-notice, /mentions-legales | careers.html:8 (35 car.), recrutement.html:8 (43), contact.html:8 (42), contact-fr.html:8 (46), media.html:8 (35), medias.html:8 (37), legal-notice.html:8 (45), mentions-legales.html:8 (41) | 8 descriptions sous 50 caractères : présentes, uniques dans leur langue, sans tiret, cohérentes avec le h1, mais trop courtes pour un snippet utile (Google complète alors avec du texte de la page) | Bloc D (8 balises exactes, 127 à 155 caractères) |
| MINEUR | /, /index-fr | index.html:35 ; index-fr.html:35 | JSON-LD Organization : `logo` = /assets/logo-black.png, fichier existant et servi 200 mais 64x39 px, sous le minimum de 112x112 px demandé par Google pour le logo d'organisation ; le nœud n'a ni `sameAs`, ni adresse, ni email alors que legal-notice.html:60-63 publie l'adresse postale et l'email de contact | Bloc B (remplace les lignes 31-36 du @graph dans index.html et index-fr.html) |
| MINEUR | /about, /a-propos | about.html:24-42 ; a-propos.html:24-42 | Second nœud Organization sans `logo` (celui de la home en a un) ; `founder` = prénoms seuls ("Axel", "Ilan"), ce qui est cohérent avec la page (about.html:82-83 n'affiche que les prénoms) : rien à corriger sur ce point | Insérer après la ligne 29 (`"url": "https://www.syntheticswarm.ai/",`) dans about.html et a-propos.html : `"logo": "https://www.syntheticswarm.ai/assets/logo-black-narrow.png",` ; noms complets : [donnée à fournir : noms complets des fondateurs, uniquement s'ils doivent être publiés] |
| MINEUR | 26 pages | index.html:13 (ligne 13 de chaque page, 14 sur pricing.html et tarifs.html) ; assets/favicon.png | Favicon présent sur les 26 pages, fichier présent et servi 200, PNG 32x32 RGBA (604 octets) : conforme, mais sous la taille recommandée par Google pour l'affichage dans les résultats (48x48 minimum recommandé, carré). Aucun `apple-touch-icon`, aucun `manifest`. Seul asset carré existant : assets/logo-black-narrow.png 1024x1024, fond transparent (iOS le rendrait sur fond noir) | Remplacer la ligne 13 par `<link rel="icon" href="/assets/favicon.png" type="image/png" sizes="32x32">` et ajouter dessous `<link rel="apple-touch-icon" href="/assets/logo-black-narrow.png">` (provisoire) ; [asset à fournir : favicon 96x96 et apple-touch-icon 180x180, opaques] ; manifest : rien à ajouter (site vitrine sans PWA) |
| MINEUR | sitemap.xml | sitemap.xml:4-9 (chaque bloc `<url>`) | XML valide, 26 `<loc>`, tous 200 sans redirection, identiques à urls.txt, les 26 .html du repo y sont ; aucun `<lastmod>` | Exemple à insérer après chaque `<loc>` : `<lastmod>2026-09-18</lastmod>` (date ISO 8601 de la dernière modification réelle de la page, à tenir à jour) |
| MINEUR | robots.txt, vercel.json | robots.txt:1-5 ; vercel.json (aucune clé `headers`) | robots.txt correct (Sitemap absolu, Disallow /api/, aucune ressource CSS/JS/asset bloquée) mais des fichiers internes sont servis et indexables : en production le 2026-09-18, /BRAND.md répond 200 text/markdown (23 148 octets), /scripts/site_layout.py 200, /tests/site.test.cjs 200 (README.md et vercel.json répondent 404, filtrés par Vercel) ; en local, docs/audit-site/urls.txt et assets/data/README.md répondent aussi 200, donc les rapports d'audit seront publiés avec la branche | Bloc E (robots.txt complet et clé `headers` à ajouter dans vercel.json) |
| MINEUR | /media, /medias, /customers, /clients | media.html:57, medias.html:57, customers.html:58, clients.html:58 ; sitemap.xml:88-111 (loc lignes 89, 95, 101, 107) ; index.html:224 (`nav-disabled`) | Quatre pages à état vide ("No publications yet.", "Customer stories are coming soon.") sont indexables et dans le sitemap alors qu'elles ne sont liées nulle part (header et footer les rendent en `<span class="nav-disabled">`) ; la description de customers.html:8 promet "See how our customers use Synthetic Swarm" sans contenu derrière | Décision produit. Si elles doivent rester hors index tant qu'elles sont vides : insérer après la ligne 8 des 4 fichiers `<meta name="robots" content="noindex, follow">` et retirer leurs 4 blocs `<url>` (sitemap.xml:88-111). Sinon : rien à changer |
| MINEUR | / (et /index) | scripts/dev-server.js:120 | L'émulateur local sert /index en 200 avec le contenu de / (doublon), alors que la production répond 308 vers / (mesuré : `/index` 308, `/index.html` 308). Pas de correction du site ; c'est l'émulateur qui diverge de Vercel | Insérer avant la ligne 120 de scripts/dev-server.js : `if (pathname === '/index') return redirect(res, 308, '/' + qs);` |
| MINEUR | 26 pages | tests/legal.test.cjs:35-40 | Les seules assertions SEO (title unique, description, canonical, hreflang) ne couvrent que les 4 paires légales ; rien ne vérifie `x-default`, la longueur des descriptions ni la cohérence page/sitemap sur les 13 paires | Bloc F (nouveau fichier tests/seo.test.cjs, exécuté par `node --test tests/*.test.cjs`) |

Points vérifiés sans écart (preuves dans le tableau des 26 pages) : un seul `<title>` par page, tous présents, longueur 21 à 47 caractères (aucun au-dessus de 60), uniques dans chaque langue ; canonical unique, absolu, sans .html, égal à l'URL servie, 200 sans redirection en local sur les 26 chemins ; hreflang en/fr/x-default absolus, réciproques et identiques au sitemap sur les 13 paires ; `<html lang>` = en ou fr cohérent avec l'URL ; aucune `<meta name="robots">` (26 pages indexables), aucun `X-Robots-Tag` (vercel.json n'a pas de clé `headers`) ; h1 unique et cohérent avec le title sur les 26 pages ; /index.html et /index-fr.html redirigent 308 vers / et /index-fr ; /pricing-fr, /lead-magnets, /lead-magnets-fr redirigent 308 vers /tarifs, /our-solution, /notre-solution ; aucun 404.html dans le repo (Vercel sert sa page 404 par défaut, hors périmètre SEO).

### Redirection de / vers /index-fr (vercel.json:5-31)

1. Googlebot explore surtout depuis des IP américaines sans cookie : il reçoit `/` en 200 EN (mesuré : `/` sans en-tête = 200, `/` avec `x-vercel-ip-country: FR` = 307 vers /index-fr, `/` avec cookie `ss-language=fr` = 307), indexe `/` comme page EN (canonical et x-default vers `/`) et découvre /index-fr par hreflang et sitemap : c'est le schéma "page adaptée à la localisation" que Google documente et accepte quand hreflang et x-default sont présents, ce qui est le cas.
2. Un utilisateur en France sans cookie arrive sur /index-fr (307, donc rien n'est mis en cache de façon permanente) ; son choix explicite est respecté ensuite (mesuré : FR + cookie `ss-language=en` = 200 EN ; US + cookie `ss-language=fr` = 307 FR) ; les URL explicites comme /index-fr ne sont jamais redirigées (aucune règle ne les cible), donc pas de boucle.
3. Recommandation : ne rien changer. Les explorations occasionnelles de Google depuis des IP françaises reçoivent un 307 temporaire vers une page reliée par hreflang réciproque, ce qui ne fusionne pas les URL et ne crée pas de doublon ; le seul doublon potentiel (/index en 200) n'existe qu'en local (voir MINEUR émulateur).

### Bloc B : JSON-LD Organization de la home (remplace les lignes 31-36 de index.html et de index-fr.html, dans le tableau @graph)

Données sourcées dans le repo : adresse et email de legal-notice.html:60-63 et mentions-legales.html:60-63 ; logo carré 1024x1024 = assets/logo-black-narrow.png (servi 200). Aucune URL LinkedIn entreprise n'existe dans le repo (grep `linkedin.com/company` : 0 résultat).

```json
    {
      "@type": "Organization",
      "name": "Synthetic Swarm",
      "url": "https://www.syntheticswarm.ai/",
      "logo": "https://www.syntheticswarm.ai/assets/logo-black-narrow.png",
      "email": "contact@syntheticswarm.ai",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "15 rue de la Gare",
        "postalCode": "62690",
        "addressLocality": "Izel-lès-Hameau",
        "addressCountry": "FR"
      },
      "sameAs": ["[donnée à fournir : URL de la page LinkedIn entreprise]"]
    },
```

### Bloc D : les 8 descriptions courtes (remplace la ligne 8 de chaque fichier)

```html
<!-- careers.html:8 (142 caractères) -->
<meta name="description" content="Join Synthetic Swarm: a small team between France and San Francisco building insurance prospecting. Open roles, direct work with the founders.">
<!-- recrutement.html:8 (155) -->
<meta name="description" content="Rejoignez Synthetic Swarm : une petite équipe entre la France et San Francisco. Postes ouverts, travail direct avec les fondateurs, vraies responsabilités.">
<!-- contact.html:8 (127) -->
<meta name="description" content="Contact Synthetic Swarm: a question, a partnership or a demo request. Reach Axel and Ilan by email or through the contact form.">
<!-- contact-fr.html:8 (146) -->
<meta name="description" content="Contactez Synthetic Swarm : une question, un partenariat ou une demande de démo. Écrivez à Axel et Ilan par email ou via le formulaire de contact.">
<!-- media.html:8 (131) -->
<meta name="description" content="Press and media coverage of Synthetic Swarm: articles, interviews, podcasts and publications, plus the contact for media inquiries.">
<!-- medias.html:8 (134) -->
<meta name="description" content="Synthetic Swarm dans la presse et les médias : articles, interviews, podcasts et publications, et le contact pour les demandes médias.">
<!-- legal-notice.html:8 (132) -->
<meta name="description" content="Legal notice of the Synthetic Swarm website: publisher details for Synthetic Swarm SAS, SIREN registration number and contact email.">
<!-- mentions-legales.html:8 (130) -->
<meta name="description" content="Mentions légales du site Synthetic Swarm : coordonnées de l'éditeur Synthetic Swarm SAS, numéro SIREN et adresse email de contact.">
```

### Bloc E : robots.txt et en-têtes vercel.json

robots.txt complet (remplace le fichier) :

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /scripts/
Disallow: /tests/
Disallow: /docs/
Disallow: /*.md$

Sitemap: https://www.syntheticswarm.ai/sitemap.xml
```

Clé `headers` à ajouter dans vercel.json (après `"trailingSlash": false,`), pour que les fichiers déjà découverts sortent de l'index :

```json
  "headers": [
    { "source": "/(scripts|tests|docs)/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] },
    { "source": "/(.*)\\.md", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] }
  ],
```

Complément (hygiène de déploiement, à la discrétion de l'équipe) : un fichier `.vercelignore` contenant `BRAND.md`, `CONTACT_SETUP.md`, `LEGAL_AUDIT.md`, `docs/`, `scripts/`, `tests/`, `assets/school-logo-sources.md`, `assets/data/README.md` retirerait ces fichiers du déploiement (site_layout.py et les tests ne servent qu'en développement).

### Bloc F : test de non-régression SEO (nouveau fichier tests/seo.test.cjs)

```js
const test = require('node:test'); const assert = require('node:assert');
const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..'); const base = 'https://www.syntheticswarm.ai';
const pairs = [['', 'index-fr'], ['our-solution', 'notre-solution'], ['pricing', 'tarifs'], ['faq', 'faq-fr'], ['about', 'a-propos'], ['careers', 'recrutement'], ['contact', 'contact-fr'], ['customers', 'clients'], ['media', 'medias'], ['legal-notice', 'mentions-legales'], ['privacy', 'confidentialite'], ['terms', 'conditions'], ['opt-out', 'opposition']];
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
for (const [en, fr] of pairs) for (const route of [en, fr]) test(`seo head: /${route}`, () => {
  const html = fs.readFileSync(path.join(ROOT, (route || 'index') + '.html'), 'utf8');
  const self = `${base}/${route}`;
  assert.equal((html.match(/<title>/g) || []).length, 1);
  const desc = html.match(/<meta name="description" content="([^"]*)"/)[1];
  assert.ok(desc.length >= 50 && desc.length <= 160, `description de ${desc.length} caracteres`);
  assert.doesNotMatch(desc, /[\u2013\u2014]/);
  assert.ok(html.includes(`<link rel="canonical" href="${self}">`));
  assert.ok(html.includes(`hreflang="en" href="${base}/${en}"`));
  assert.ok(html.includes(`hreflang="fr" href="${base}/${fr}"`));
  assert.ok(html.includes(`hreflang="x-default" href="${base}/${en}"`));
  assert.ok(sitemap.includes(`<loc>${self}</loc>`));
});
```

## Tableau des 26 pages

Colonnes : title (ligne 7 de chaque fichier) et longueur ; longueur de la meta description (ligne 8) et verdict 50 à 160 ; canonical (unique, absolu, égal à l'URL, 200 sans redirection) ; hreflang (en, fr, x-default, réciproques, identiques au sitemap) ; favicon (ligne 13, 14 sur pricing et tarifs) ; Open Graph ; types JSON-LD ; cohérence h1/title. Les titres partagés entre /faq et /faq-fr et entre /contact et /contact-fr sont voulus (paires hreflang), il n'y a aucun doublon dans une même langue.

| URL | Fichier | title (L7) | long. | description (L8) long. | canonical | hreflang | favicon | OG | JSON-LD | h1 coherent |
|---|---|---|---|---|---|---|---|---|---|---|
| / | index.html | Insurance prospecting \| Synthetic Swarm | 39 | 184 (trop longue) | OK | OK | OK | absent | Organization, WebSite | OK |
| /index-fr | index-fr.html | Prospection en assurance \| Synthetic Swarm | 42 | 194 (trop longue) | OK | OK | OK | absent | Organization, WebSite | OK |
| /our-solution | our-solution.html | Our solution \| Synthetic Swarm | 30 | 127 (OK) | OK | OK | OK | absent | aucun | OK |
| /notre-solution | notre-solution.html | Notre solution \| Synthetic Swarm | 32 | 129 (OK) | OK | OK | OK | absent | aucun | OK |
| /pricing | pricing.html | Pricing \| Synthetic Swarm | 25 | 77 (OK) | OK | OK | OK | og:title seul | aucun | OK |
| /tarifs | tarifs.html | Tarifs \| Synthetic Swarm | 24 | 85 (OK) | OK | OK | OK | og:title seul | aucun | OK |
| /faq | faq.html | FAQ \| Synthetic Swarm | 21 | 59 (OK) | OK | OK | OK | absent | FAQPage | OK |
| /faq-fr | faq-fr.html | FAQ \| Synthetic Swarm | 21 | 63 (OK) | OK | OK | OK | absent | FAQPage | OK |
| /about | about.html | About \| Synthetic Swarm | 23 | 126 (OK) | OK | OK | OK | absent | Organization | OK |
| /a-propos | a-propos.html | À propos \| Synthetic Swarm | 26 | 141 (OK) | OK | OK | OK | absent | Organization | OK |
| /careers | careers.html | Careers \| Synthetic Swarm | 25 | 35 (trop courte) | OK | OK | OK | absent | aucun | OK |
| /recrutement | recrutement.html | Recrutement \| Synthetic Swarm | 29 | 43 (trop courte) | OK | OK | OK | absent | aucun | OK |
| /contact | contact.html | Contact \| Synthetic Swarm | 25 | 42 (trop courte) | OK | OK | OK | absent | aucun | OK |
| /contact-fr | contact-fr.html | Contact \| Synthetic Swarm | 25 | 46 (trop courte) | OK | OK | OK | absent | aucun | OK |
| /customers | customers.html | Customers \| Synthetic Swarm | 27 | 92 (OK) | OK | OK | OK | absent | aucun | OK |
| /clients | clients.html | Nos clients \| Synthetic Swarm | 29 | 109 (OK) | OK | OK | OK | absent | aucun | OK |
| /media | media.html | Media \| Synthetic Swarm | 23 | 35 (trop courte) | OK | OK | OK | absent | aucun | OK |
| /medias | medias.html | Médias \| Synthetic Swarm | 24 | 37 (trop courte) | OK | OK | OK | absent | aucun | OK |
| /legal-notice | legal-notice.html | Legal Notice \| Synthetic Swarm | 30 | 45 (trop courte) | OK | OK | OK | absent | aucun | OK |
| /mentions-legales | mentions-legales.html | Mentions légales \| Synthetic Swarm | 34 | 41 (trop courte) | OK | OK | OK | absent | aucun | OK |
| /privacy | privacy.html | Privacy policy \| Synthetic Swarm | 32 | 69 (OK) | OK | OK | OK | absent | aucun | OK |
| /confidentialite | confidentialite.html | Politique de confidentialité \| Synthetic Swarm | 46 | 81 (OK) | OK | OK | OK | absent | aucun | OK |
| /terms | terms.html | Terms and Conditions of Sale \| Synthetic Swarm | 46 | 109 (OK) | OK | OK | OK | absent | aucun | OK |
| /conditions | conditions.html | Conditions générales de vente \| Synthetic Swarm | 47 | 113 (OK) | OK | OK | OK | absent | aucun | OK |
| /opt-out | opt-out.html | Opt out \| Synthetic Swarm | 25 | 94 (OK) | OK | OK | OK | absent | aucun | OK |
| /opposition | opposition.html | Droit d’opposition \| Synthetic Swarm | 36 | 83 (OK) | OK | OK | OK | absent | aucun | OK |

h1 relevés (ligne dans le fichier) : / L87 "Know who to call. At the right time." ; /index-fr L87 "Sachez qui appeler. Au bon moment." ; /our-solution L63 "From a business change to your next conversation." ; /notre-solution L63 "D'un changement de situation à votre prochain appel." ; /pricing L63 "Choose the volume that fits you." ; /tarifs L63 "Choisissez le volume qui vous convient." ; /faq L146 "Your questions, clear answers." ; /faq-fr L146 "Vos questions, des réponses claires." ; /about L80 "We built the tool we were looking for." ; /a-propos L80 "Nous avons créé l'outil que nous cherchions." ; /careers L60 "Build what comes next with us." ; /recrutement L60 "Construisez la suite avec nous." ; /contact L58 "Let's talk." ; /contact-fr L58 "Parlons." ; /customers L58 "They say it better than we do." ; /clients L58 "Ce sont eux qui en parlent le mieux." ; /media L57 "Synthetic Swarm in the media" ; /medias L57 "Synthetic Swarm dans les médias" ; /legal-notice L59 "Legal Notice" ; /mentions-legales L59 "Mentions légales" ; /privacy L59 "Privacy Policy" ; /confidentialite L59 "Politique de confidentialité" ; /terms L59 "Terms and Conditions of Sale" ; /conditions L60 "Conditions générales de vente" ; /opt-out L59 "Opt out" ; /opposition L59 "Droit d'opposition". Un seul h1 par page, même sujet que le title dans les 26 cas.

## Réciprocité hreflang (13 paires)

Chaque page porte trois balises (lignes 10 à 12, 11 à 13 sur pricing et tarifs), absolues en https, x-default vers la version EN ; les deux pages d'une paire portent exactement le même jeu de valeurs, et les `xhtml:link` du sitemap sont identiques aux balises.

| # | EN (loc) | FR (loc) | hreflang EN page | hreflang FR page | x-default | sitemap identique | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | / | /index-fr | en=/ fr=/index-fr | en=/ fr=/index-fr | / | oui | reciproque |
| 2 | /our-solution | /notre-solution | en=/our-solution fr=/notre-solution | en=/our-solution fr=/notre-solution | /our-solution | oui | reciproque |
| 3 | /pricing | /tarifs | en=/pricing fr=/tarifs | en=/pricing fr=/tarifs | /pricing | oui | reciproque |
| 4 | /faq | /faq-fr | en=/faq fr=/faq-fr | en=/faq fr=/faq-fr | /faq | oui | reciproque |
| 5 | /about | /a-propos | en=/about fr=/a-propos | en=/about fr=/a-propos | /about | oui | reciproque |
| 6 | /careers | /recrutement | en=/careers fr=/recrutement | en=/careers fr=/recrutement | /careers | oui | reciproque |
| 7 | /contact | /contact-fr | en=/contact fr=/contact-fr | en=/contact fr=/contact-fr | /contact | oui | reciproque |
| 8 | /customers | /clients | en=/customers fr=/clients | en=/customers fr=/clients | /customers | oui | reciproque |
| 9 | /media | /medias | en=/media fr=/medias | en=/media fr=/medias | /media | oui | reciproque |
| 10 | /legal-notice | /mentions-legales | en=/legal-notice fr=/mentions-legales | en=/legal-notice fr=/mentions-legales | /legal-notice | oui | reciproque |
| 11 | /privacy | /confidentialite | en=/privacy fr=/confidentialite | en=/privacy fr=/confidentialite | /privacy | oui | reciproque |
| 12 | /terms | /conditions | en=/terms fr=/conditions | en=/terms fr=/conditions | /terms | oui | reciproque |
| 13 | /opt-out | /opposition | en=/opt-out fr=/opposition | en=/opt-out fr=/opposition | /opt-out | oui | reciproque |

## JSON-LD (bloc par bloc)

| Page | Fichier:ligne | Type(s) | Parse | Vérification des champs |
|---|---|---|---|---|
| / | index.html:27 | @graph : Organization + WebSite | valide | Organization : name, url, logo absolu vers /assets/logo-black.png (fichier présent, 200, 64x39 px : sous 112x112, voir MINEUR). WebSite : name, url, inLanguage "en" |
| /index-fr | index-fr.html:27 | @graph : Organization + WebSite | valide | identique, inLanguage "fr" |
| /faq | faq.html:22 | FAQPage (inLanguage en) | valide | 10 Question / 10 Answer, contre 10 `<details class="site-faq">` (faq.html:147-156), même ordre. Les 10 réponses sont identiques mot pour mot au `<p>` de chaque `<details>`. Les 10 `name` sont identiques au texte de la question dans chaque `<summary>` ; le `<summary>` affiche en plus une étiquette de catégorie en `<strong>` ("Product", "Data", "Signals", ...) qui n'est pas reprise dans le JSON-LD, ce qui est le bon choix (l'étiquette n'est pas la question). Rappel : depuis août 2023 Google n'affiche les résultats enrichis FAQ que pour les sites gouvernementaux et de santé ; le bloc reste utile pour la compréhension du contenu, sans effet visible attendu |
| /faq-fr | faq-fr.html:19 | FAQPage (inLanguage fr) | valide | 10/10 questions et 10/10 réponses identiques au texte affiché (faq-fr.html:147-156), même ordre ; même remarque sur les étiquettes ("Produit", "Données", ...) |
| /about | about.html:24 | Organization | valide | name, url, founder : 2 Person (name "Axel", url https://www.linkedin.com/in/axel-carron/ ; name "Ilan", url https://www.linkedin.com/in/isainteagathe/), cohérents avec les cartes fondateurs about.html:82-83 ; pas de logo (voir MINEUR) |
| /a-propos | a-propos.html:24 | Organization | valide | identique à /about |
| 20 autres pages | aucun bloc | aucun | s.o. | our-solution, notre-solution, pricing, tarifs, contact, contact-fr : rien à ajouter. Aucun type ne produirait de résultat enrichi honnête : Product/Offer ne convient pas à un abonnement B2B à volume variable (pricing.js : 5 paliers et un état sur devis), BreadcrumbList n'apporte rien sur un site à un seul niveau, ContactPage n'a pas de résultat enrichi. Idem pour les 14 autres pages |

Aucune erreur de syntaxe JSON sur les 6 blocs (json.loads).

## sitemap.xml et robots.txt (détail)

sitemap.xml : XML valide (ElementTree), namespaces sitemap 0.9 et xhtml, 26 `<url>`, éléments utilisés : `loc` et `xhtml:link` uniquement (pas de lastmod, changefreq ni priority). Les 26 `<loc>` répondent 200 sans redirection sur le serveur local ; l'ensemble des loc est strictement identique à urls.txt ; les 26 fichiers .html du repo (`ls *.html` = 26) sont tous dans le sitemap, aucun fichier orphelin, aucun 404.html ; aucune page du sitemap ne porte de meta robots noindex. Les anciennes pages lead-magnets n'existent plus que comme redirections 308 dans vercel.json (voulu).

robots.txt (91 octets, servi 200) : `User-agent: *` / `Allow: /` / `Disallow: /api/` / `Sitemap: https://www.syntheticswarm.ai/sitemap.xml`. Aucune ressource nécessaire au rendu n'est bloquée (CSS, JS et assets sont à la racine ou sous /assets/, non listés). Voir MINEUR pour les fichiers internes non bloqués.

## Annexe, Bloc A : balises Open Graph et Twitter par page

Règles appliquées : og:title = `<title>` de la page ; og:description = meta description de la page (version corrigée pour les 10 pages du tableau des constats) ; og:url = canonical ; og:locale fr_FR ou en_US avec l'alternate de l'autre langue ; image provisoire = seul asset carré de marque existant (assets/logo-black-narrow.png, 1024x1024, fond transparent) avec `twitter:card` = `summary`. Dès qu'une image 1200x630 opaque existe [asset à fournir], remplacer les trois lignes og:image par cette image et passer `twitter:card` à `summary_large_image`. Vérification après pose : https://www.linkedin.com/post-inspector/ sur les URL de production.

```html
<!-- index.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Insurance prospecting | Synthetic Swarm">
<meta property="og:description" content="Synthetic Swarm spots executives whose situation just changed and delivers their name, phone and the reason to call, every week. French public registers only.">
<meta property="og:url" content="https://www.syntheticswarm.ai/">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- index-fr.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Prospection en assurance | Synthetic Swarm">
<meta property="og:description" content="Synthetic Swarm repère les dirigeants dont la situation vient de changer et vous livre chaque semaine leur nom, leur téléphone et la raison de les appeler.">
<meta property="og:url" content="https://www.syntheticswarm.ai/index-fr">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">

<!-- our-solution.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Our solution | Synthetic Swarm">
<meta property="og:description" content="Define your target. Synthetic Swarm connects business changes, qualifies the right people and prepares your next conversations.">
<meta property="og:url" content="https://www.syntheticswarm.ai/our-solution">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- notre-solution.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Notre solution | Synthetic Swarm">
<meta property="og:description" content="Définissez votre cible. Synthetic Swarm rapproche les changements, qualifie les bonnes personnes et prépare vos prochains appels.">
<meta property="og:url" content="https://www.syntheticswarm.ai/notre-solution">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">

<!-- pricing.html : a inserer apres la ligne 8 (meta description) ; remplace la ligne 9 og:title existante -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Pricing | Synthetic Swarm">
<meta property="og:description" content="Synthetic Swarm pricing, choose how many qualified leads you want every week.">
<meta property="og:url" content="https://www.syntheticswarm.ai/pricing">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- tarifs.html : a inserer apres la ligne 8 (meta description) ; remplace la ligne 9 og:title existante -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Tarifs | Synthetic Swarm">
<meta property="og:description" content="Tarifs Synthetic Swarm, choisissez le nombre de leads qualifiés reçus chaque semaine.">
<meta property="og:url" content="https://www.syntheticswarm.ai/tarifs">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">

<!-- faq.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="FAQ | Synthetic Swarm">
<meta property="og:description" content="Questions about insurance prospecting with Synthetic Swarm.">
<meta property="og:url" content="https://www.syntheticswarm.ai/faq">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- faq-fr.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="FAQ | Synthetic Swarm">
<meta property="og:description" content="Questions sur la prospection en assurance avec Synthetic Swarm.">
<meta property="og:url" content="https://www.syntheticswarm.ai/faq-fr">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">

<!-- about.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="About | Synthetic Swarm">
<meta property="og:description" content="Meet Axel and Ilan, discover how Synthetic Swarm began, its first insurance customers in France and the move to San Francisco.">
<meta property="og:url" content="https://www.syntheticswarm.ai/about">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- a-propos.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="À propos | Synthetic Swarm">
<meta property="og:description" content="Découvrez Axel et Ilan, les origines de Synthetic Swarm, ses premiers clients dans l’assurance en France et son installation à San Francisco.">
<meta property="og:url" content="https://www.syntheticswarm.ai/a-propos">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">

<!-- careers.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Careers | Synthetic Swarm">
<meta property="og:description" content="Join Synthetic Swarm: a small team between France and San Francisco building insurance prospecting. Open roles, direct work with the founders.">
<meta property="og:url" content="https://www.syntheticswarm.ai/careers">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- recrutement.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Recrutement | Synthetic Swarm">
<meta property="og:description" content="Rejoignez Synthetic Swarm : une petite équipe entre la France et San Francisco. Postes ouverts, travail direct avec les fondateurs, vraies responsabilités.">
<meta property="og:url" content="https://www.syntheticswarm.ai/recrutement">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">

<!-- contact.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Contact | Synthetic Swarm">
<meta property="og:description" content="Contact Synthetic Swarm: a question, a partnership or a demo request. Reach Axel and Ilan by email or through the contact form.">
<meta property="og:url" content="https://www.syntheticswarm.ai/contact">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- contact-fr.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Contact | Synthetic Swarm">
<meta property="og:description" content="Contactez Synthetic Swarm : une question, un partenariat ou une demande de démo. Écrivez à Axel et Ilan par email ou via le formulaire de contact.">
<meta property="og:url" content="https://www.syntheticswarm.ai/contact-fr">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">

<!-- customers.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Customers | Synthetic Swarm">
<meta property="og:description" content="See how our customers use Synthetic Swarm to identify the right companies at the right time.">
<meta property="og:url" content="https://www.syntheticswarm.ai/customers">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- clients.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Nos clients | Synthetic Swarm">
<meta property="og:description" content="Découvrez comment nos clients utilisent Synthetic Swarm pour identifier les bonnes entreprises au bon moment.">
<meta property="og:url" content="https://www.syntheticswarm.ai/clients">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">

<!-- media.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Media | Synthetic Swarm">
<meta property="og:description" content="Press and media coverage of Synthetic Swarm: articles, interviews, podcasts and publications, plus the contact for media inquiries.">
<meta property="og:url" content="https://www.syntheticswarm.ai/media">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- medias.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Médias | Synthetic Swarm">
<meta property="og:description" content="Synthetic Swarm dans la presse et les médias : articles, interviews, podcasts et publications, et le contact pour les demandes médias.">
<meta property="og:url" content="https://www.syntheticswarm.ai/medias">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">

<!-- legal-notice.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Legal Notice | Synthetic Swarm">
<meta property="og:description" content="Legal notice of the Synthetic Swarm website: publisher details for Synthetic Swarm SAS, SIREN registration number and contact email.">
<meta property="og:url" content="https://www.syntheticswarm.ai/legal-notice">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- mentions-legales.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Mentions légales | Synthetic Swarm">
<meta property="og:description" content="Mentions légales du site Synthetic Swarm : coordonnées de l&#x27;éditeur Synthetic Swarm SAS, numéro SIREN et adresse email de contact.">
<meta property="og:url" content="https://www.syntheticswarm.ai/mentions-legales">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">

<!-- privacy.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Privacy policy | Synthetic Swarm">
<meta property="og:description" content="Synthetic Swarm privacy policy: personal information and your rights.">
<meta property="og:url" content="https://www.syntheticswarm.ai/privacy">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- confidentialite.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Politique de confidentialité | Synthetic Swarm">
<meta property="og:description" content="Politique de confidentialité de Synthetic Swarm : données personnelles et droits.">
<meta property="og:url" content="https://www.syntheticswarm.ai/confidentialite">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">

<!-- terms.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Terms and Conditions of Sale | Synthetic Swarm">
<meta property="og:description" content="Synthetic Swarm B2B terms of sale: monthly subscriptions, payment, use of prospect profiles and cancellation.">
<meta property="og:url" content="https://www.syntheticswarm.ai/terms">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- conditions.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Conditions générales de vente | Synthetic Swarm">
<meta property="og:description" content="Conditions de vente B2B de Synthetic Swarm : abonnement mensuel, paiement, utilisation des fiches et résiliation.">
<meta property="og:url" content="https://www.syntheticswarm.ai/conditions">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">

<!-- opt-out.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Opt out | Synthetic Swarm">
<meta property="og:description" content="Request removal of your professional contact details from Synthetic Swarm prospecting records.">
<meta property="og:url" content="https://www.syntheticswarm.ai/opt-out">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta name="twitter:card" content="summary">

<!-- opposition.html : a inserer apres la ligne 8 (meta description) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Synthetic Swarm">
<meta property="og:title" content="Droit d’opposition | Synthetic Swarm">
<meta property="og:description" content="Demander le retrait de vos coordonnées professionnelles des fiches Synthetic Swarm.">
<meta property="og:url" content="https://www.syntheticswarm.ai/opposition">
<meta property="og:image" content="https://www.syntheticswarm.ai/assets/logo-black-narrow.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Synthetic Swarm">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary">
```

## Compte : 0 bloquant, 3 majeurs, 9 mineurs

## Non couvert

- Validation externe des données structurées (Rich Results Test, Schema Markup Validator) et de l'aperçu de partage (Post Inspector LinkedIn) : impossible sans URL publique de la branche, la production n'ayant pas encore cette passe.
- Comportement réel de Vercel au-delà de l'émulateur : seules trois sondes ont été faites en production (/index, /index.html, fichiers internes) ; la règle cleanUrls pour les autres chemins est supposée identique.
- Données Search Console (couverture, erreurs hreflang signalées par Google, favicon effectivement affiché) : non accessibles.
- Performance, Core Web Vitals, rendu JavaScript par Googlebot, accessibilité et attributs alt des images : hors périmètre de ce volet.
- Les 25 assets non référencés dans assets/ (par exemple 40612c4abf743aacd69ec8b9755a5d2e.png 1080x1080, memoji-*.png, proof-post-*.png) sont signalés pour information : ils ne concernent pas le SEO mais pèsent 10,2 Mo dans le déploiement.

## git status

Sortie de `git status --short` juste avant la remise. Seul docs/audit-site/audit-site-07-seo.md est de ce volet ; docs/audit-site/audit-site-04-accessibilite.md et docs/audit-site/screens/ (captures jpg, horodatées 19:58 à 20:02) ont été créés par d'autres volets qui travaillent en parallèle dans le même dépôt. Aucun fichier du site n'a été modifié (aucune ligne ` M`), aucune commande git autre que status, branch --show-current et log n'a été exécutée.

```
?? docs/audit-site/audit-site-04-accessibilite.md
?? docs/audit-site/audit-site-07-seo.md
?? docs/audit-site/screens/
```
