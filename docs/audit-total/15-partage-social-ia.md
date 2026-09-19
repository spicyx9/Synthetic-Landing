# Flux 15 : partage social et lecture par les IA
Périmètre : balises Open Graph et Twitter Card des 26 pages ; aperçus construits par LinkedIn, Slack, WhatsApp, iMessage et Facebook ; /llms.txt et /llms-full.txt ; ce qu'un assistant IA lit dans la home FR et la home EN (HTML brut contre rendu JavaScript, chiffres, description déductible) ; robots.txt et robots IA ; données structurées JSON-LD ; favicon des aperçus. Lignes d'inventaire couvertes : les 26 pages, robots.txt, assets/favicon.png, assets/logo-black.png.
Outils : curl (user-agents LinkedInBot/1.0, Slackbot-LinkExpanding 1.0, WhatsApp/2.23, facebookexternalhit/1.1, GPTBot, ClaudeBot, PerplexityBot), Playwright 1.56.1 Chromium (JS activé puis désactivé, rendu des aperçus), Python 3.11 bs4/lxml, ImageMagick identify/convert, md5sum, git, API GitHub (lecture des commits de main), serveur local équivalent Vercel http://127.0.0.1:8787.
Début : 2026-09-19T19:36:50Z  Fin : 2026-09-19T20:08:12Z
Statut : COMPLET

Synthèse : aucune des 26 pages ne porte de balises de partage complètes (2 balises `og:title` isolées sur /pricing et /tarifs, 0 `og:image`, 0 `twitter:`), donc tout partage sur LinkedIn, Slack, WhatsApp, iMessage ou Facebook affiche le titre et la description de repli sans aucune image, et un partage de l'URL racine produit un aperçu en anglais. Le HTML brut est bien lisible sans JavaScript (le script n'ajoute que le clone du menu mobile et le bouton flottant de démo), mais un assistant IA n'y trouve qu'un seul prix (399 € pour 50 leads), aucune indication que l'entreprise est française et vend en France, des témoignages illustratifs présentés comme des clients et six logos d'assureurs présentés comme références. /llms.txt et /llms-full.txt sont absents (404) et robots.txt n'exprime aucune politique envers les robots IA (tout est autorisé par défaut).

| Verdict | Sévérité | Page(s) | Élément | Attendu | Constaté | Preuve | Correction exacte |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CASSÉ | MAJEUR | 24 pages : /, /index-fr, /our-solution, /notre-solution, /faq, /faq-fr, /about, /a-propos, /careers, /recrutement, /contact, /contact-fr, /customers, /clients, /media, /medias, /legal-notice, /mentions-legales, /privacy, /confidentialite, /terms, /conditions, /opt-out, /opposition | Balises Open Graph et Twitter Card | Sur chaque page : og:title, og:description, og:image, og:url, og:type, og:locale, og:site_name et twitter:card, twitter:title, twitter:description, twitter:image | 0 balise `og:` et 0 balise `twitter:` sur ces 24 pages, en production comme dans le repo ; les crawlers se rabattent sur `<title>` et `meta description`, sans image ni nom de site | `grep -oi 'property="og:[a-z_:]*"' *.html \| wc -l` = 2 (uniquement pricing.html:9 et tarifs.html:9) ; `grep -oi 'name="twitter:[a-z_:]*"' *.html \| wc -l` = 0 ; relevé des 26 URL en production (Annexe E, tableau prod26) : og total = 2, twitter total = 0 | Annexe A : bloc de 18 balises par page, à coller juste après la ligne `<meta name="description" ...>` de chaque fichier ; pour le gabarit Python, Annexe B |
| DÉGRADÉ | MINEUR | /pricing, /tarifs | Balise `og:title` isolée | Bloc Open Graph complet | Seule `og:title` est présente (ligne 9 des deux fichiers), ajoutée par le commit 0bb5cd5 « route demo booking to Axel calendar » ; sans og:image, og:url, og:description ni twitter:*, LinkedIn et Facebook affichent le titre sans image et sans description Open Graph | pricing.html:9 `<meta property="og:title" content="Pricing \| Synthetic Swarm">` ; tarifs.html:9 `<meta property="og:title" content="Tarifs \| Synthetic Swarm">` ; `git log --oneline -S 'og:title' -- pricing.html tarifs.html` = 0bb5cd5 | Remplacer la ligne 9 de chaque fichier par le bloc correspondant de l'Annexe A, en utilisant comme og:description et twitter:description : tarifs.html « De 89 € à 1 499 € par mois selon le volume : 10 à 200 fiches qualifiées par semaine, avec dirigeant, téléphone, email, LinkedIn et signal daté. » ; pricing.html « From 89 € to 1,499 € per month depending on volume: 10 to 200 qualified leads per week, with executive, phone, email, LinkedIn and dated signal. » |
| CASSÉ | MAJEUR | Les 26 pages | Image de partage (og:image, twitter:image) | Un fichier 1200x630 px par langue, PNG ou JPEG, inférieur à 300 Ko, servi en 200 | Aucun visuel de partage n'existe dans assets/ ; les seuls visuels de marque sont favicon.png (32x32), logo-black.png (64x39) et logo-black-narrow.png (1024x1024), aucun au format 1200x630 ; chaque partage produit donc une vignette vide | `ls assets \| grep -iE 'og\|social\|share'` = vide ; `identify assets/favicon.png assets/logo-black.png assets/logo-black-narrow.png` = 32x32, 64x39, 1024x1024 | Créer /assets/og-image-fr.png et /assets/og-image-en.png : 1200x630 px, PNG 8 bits (ou JPEG qualité 85 si le PNG dépasse 300 Ko), fond #fcfbf8, marque logo-black-narrow.png en haut à gauche, titre « Sachez qui appeler. » en #1a1a1a et « Au bon moment. » en #0a66c2 italique (EN : « Know who to call. » et « At the right time. »), sous-titre « Prospection en assurance : dirigeant, téléphone, email, signal daté. » (EN : « Insurance prospecting: executive, phone, email, dated signal. »), URL www.syntheticswarm.ai, marges de sécurité de 96 px. Visuel définitif [donnée à fournir : composition du designer avec les polices Inter et DM Serif Display]. Version provisoire générée et vérifiée avec la commande de l'Annexe C (capture docs/audit-total/screens/15/og-image-fr-provisoire-1200x630.png) |
| DÉGRADÉ | MAJEUR | / (URL racine partagée par un prospect français) | Langue de l'aperçu de la racine | Un courtier français qui partage https://www.syntheticswarm.ai/ obtient un aperçu en français | Les crawlers de LinkedIn, Slack, WhatsApp et Facebook ne sont pas en France et n'ont pas le cookie ss-language : ils reçoivent index.html en anglais (titre « Insurance prospecting \| Synthetic Swarm ») ; la redirection vers /index-fr n'existe que pour l'en-tête x-vercel-ip-country: FR ou le cookie (vercel.json, redirections 1 et 2) | `curl -A "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)" https://www.syntheticswarm.ai/` = 200, md5 fd674d25 = index.html, `<title>Insurance prospecting \| Synthetic Swarm</title>` (scratchpad flux15/ua/root-linkedin.html) | Dans toute communication française (posts LinkedIn, emails, signatures), partager https://www.syntheticswarm.ai/index-fr et jamais la racine ; poser `og:url` = canonical sur chaque page et `og:locale:alternate` (inclus dans l'Annexe A). Décision fondateurs : si le marché reste la France, inverser la logique (racine française, redirection vers / EN pour les pays non francophones) dans vercel.json |
| OK | n/a | /index-fr, /tarifs, / | Accès des crawlers de partage | HTTP 200, même HTML que pour un navigateur, aucun X-Robots-Tag | 200 pour les 4 user-agents (LinkedInBot/1.0, Slackbot-LinkExpanding 1.0, WhatsApp/2.23, facebookexternalhit/1.1) sur /index-fr (35604 octets, md5 5e5e3bda identique au repo) et /tarifs (12260 octets, md5 ac0fe4e0 identique entre les 4 UA) ; 200 sur / ; aucun en-tête x-robots-tag ; cache Vercel HIT | En-têtes reproduits en Annexe E (scratchpad flux15/ua/*.hdr) | Aucune |
| DÉGRADÉ | MAJEUR | /index-fr | Aperçu reconstitué LinkedIn, Slack, WhatsApp, iMessage, Facebook | Carte avec image 1200x630, titre, description et nom du site | Titre de repli « Prospection en assurance \| Synthetic Swarm », description de repli de 155 caractères, aucune image : LinkedIn et Facebook affichent un bloc vide ou une carte réduite, WhatsApp n'a pas de vignette, iMessage n'affiche que l'icône 32x32 et le domaine, Slack affiche l'icône, le domaine, le titre et la description | docs/audit-total/screens/15/index-fr-900-apercu-partage.png (reconstitution à partir du HTML reçu par LinkedInBot) | Annexe A (index-fr.html) et image de l'Annexe C |
| DÉGRADÉ | MAJEUR | /tarifs | Aperçu reconstitué LinkedIn, Slack, WhatsApp, iMessage, Facebook | Carte avec image, titre, description contenant le prix | Titre « Tarifs \| Synthetic Swarm », description de repli « Tarifs Synthetic Swarm, choisissez le nombre de leads qualifiés reçus chaque semaine. » (aucun prix), aucune image | docs/audit-total/screens/15/tarifs-900-apercu-partage.png | Annexe A (tarifs.html) avec la og:description de la ligne « Balise og:title isolée » ci-dessus |
| DÉGRADÉ | MINEUR | /llms.txt, /llms-full.txt | Fichiers de lecture pour les assistants IA | 200, text/plain, contenu structuré (llmstxt.org) | 404 en production (Vercel NOT_FOUND, 79 octets) et 404 sur le serveur local ; aucun fichier llms*.txt dans le repo | `curl -sD - https://www.syntheticswarm.ai/llms.txt` : `HTTP/2 404`, `x-vercel-error: NOT_FOUND` ; idem /llms-full.txt ; `curl -o /dev/null -w '%{http_code}' http://127.0.0.1:8787/llms.txt` = 404 ; `ls /home/user/Synthetic-Landing/llms*.txt` = aucun fichier | Créer à la racine du repo llms.txt (Annexe F) et llms-full.txt (Annexe G) ; Vercel les servira en text/plain comme robots.txt, sans configuration |
| OK | n/a | /index-fr, / | Texte lisible sans JavaScript | Le contenu commercial est entièrement dans le HTML brut | 309 chaînes de texte dans le HTML brut de chaque home ; 327 après exécution du JavaScript ; les 18 chaînes ajoutées sont le clone du menu mobile (Notre solution, Tarifs, Qui sommes-nous, Recrutement, Médias, EN, Connexion, Démo, Axel, CEO, Ilan, CTO, Menu, ×, FR x2, ↗ x2 ; équivalents EN sur /) ; aucune chaîne retirée ; dans le texte visible, seules « Réserver une démo » et « 15 min avec l'équipe » (bouton flottant, floating-demo.js) apparaissent avec JS ; les chiffres « 247 résultats », « 10 fiches cette semaine », « 399 € », « 50 leads » sont statiques dans le HTML | Script scratchpad flux15/render-text.mjs (Chromium 1440x900, JS activé puis `javaScriptEnabled: false`) et comparaison bs4 des chaînes ; sortie reproduite en Annexe E | Aucune |
| DÉGRADÉ | MAJEUR | /index-fr, /, /tarifs, /pricing | Grille tarifaire lisible par une IA ou un moteur | Les 5 paliers présents dans le HTML | Le HTML brut ne contient que « 399 € », « /mois », « 50 leads qualifiés par semaine » et « plus de 200 leads par semaine ... sur mesure » ; les paliers 89, 169, 789 et 1 499 € n'existent que dans pricing.js (lignes 6 à 10) et ne sont produits que par le curseur ; une IA déduit un prix unique de 399 € par mois | `grep -noE '(89\|169\|399\|789\|1 499)\s?€' tarifs.html` = `74:399 €` uniquement ; pricing.js:5-11 `const plans = [ { leads: 10, price: 89 }, { leads: 20, price: 169 }, { leads: 50, price: 399 }, { leads: 100, price: 789 }, { leads: 200, price: 1499 }, { leads: '200+', price: null } ]` | Dans tarifs.html, après le `</div>` qui ferme `<div class="pricing-range-steps" ...>` (ligne 86 et suivantes), ajouter : `<p class="pricing-tiers-static">Paliers mensuels : 10 leads par semaine 89 €, 20 leads 169 €, 50 leads 399 €, 100 leads 789 €, 200 leads 1 499 €, au-delà de 200 leads sur mesure.</p>` ; dans pricing.html au même endroit (ligne 86 et suivantes) : `<p class="pricing-tiers-static">Monthly tiers: 10 leads per week 89 €, 20 leads 169 €, 50 leads 399 €, 100 leads 789 €, 200 leads 1,499 €, above 200 leads on request.</p>` ; même phrase dans le bloc « SHARED PRICING » de index-fr.html et index.html ; ajouter dans le `<head>` de tarifs.html et pricing.html le JSON-LD Product de l'Annexe D |
| DÉGRADÉ | MAJEUR | /index-fr | Description de l'entreprise déductible par une IA (home FR) | En une requête, une IA sait qui est le client, quel est le produit, à quel prix et où | Déduction en 3 phrases en section 4. Ambiguïtés : (a) « fiches », « leads » et « prospects » désignent la même chose, et « 10 fiches cette semaine » (démonstration) coexiste avec « 50 leads qualifiés par semaine » (tarif) ; (b) un seul prix visible (399 €) ; (c) la seule mention géographique de la home est le bandeau « Synthetic Swarm emménage à San Francisco » daté du 17 septembre 2026 ; le mot « France » n'apparaît dans index-fr.html que dans l'attribut alt d'un logo (« France Assurance ») et l'adresse 62690 Izel-lès-Hameau n'est que sur /mentions-legales ; (d) ni raison sociale ni forme juridique sur la home | `grep -n 'France' index-fr.html` = ligne 101 `alt="France Assurance"` seulement ; `grep -c 'Izel' index-fr.html` = 0 ; mentions-legales.html:61 « 15 rue de la Gare 62690 Izel-lès-Hameau » ; texte visible scratchpad flux15/visible-index-fr-js.txt | Dans index-fr.html, après le `<p class="demo-hero__subtitle">...</p>` de la ligne 88, ajouter : `<p class="demo-hero__context">Synthetic Swarm SAS, société française, livre chaque semaine aux courtiers et mandataires en assurance en France des fiches de dirigeants d'entreprise, de 89 € par mois pour 10 fiches à 1 499 € pour 200.</p>` ; compléter l'Organization JSON-LD (Annexe D) |
| DÉGRADÉ | MAJEUR | / (home EN) | Description de l'entreprise déductible par une IA (home EN) | Idem | Déduction en 3 phrases en section 4. Ambiguïtés : prix en euros, formes juridiques françaises (SELARL, SCI), numéro commençant par 06, bandeau « Synthetic Swarm moves to San Francisco » : un assistant anglophone décrit une startup de San Francisco vendant à des courtiers en assurance sans pouvoir dire dans quel pays se trouvent les prospects ; « France » n'apparaît que dans l'alt d'un logo (index.html:101) et sur /about, /faq et /careers | `grep -n 'France' index.html` = ligne 101 `alt="France Assurance"` ; texte visible scratchpad flux15/visible-index-js.txt | Dans index.html, après le `<p class="demo-hero__subtitle">...</p>` (ligne 88), ajouter : `<p class="demo-hero__context">Synthetic Swarm SAS, a French company, delivers every week to insurance brokers and agents in France profiles of business owners whose situation just changed, from 89 € per month for 10 profiles to 1,499 € for 200.</p>` ; Organization JSON-LD de l'Annexe D |
| TROMPEUR | MAJEUR | /index-fr, / | Témoignages clients tels que lus par une IA | Témoignages de clients réels, ou mention explicite d'exemples | La section « Ce sont nos clients qui en parlent le mieux. » présente trois témoignages (Claire, mandataire en assurance ; Thomas, courtier indépendant ; Sonia, courtière en assurances) illustrés par des photos nommées illustrative-claire.jpg, illustrative-thomas.jpg, illustrative-sonia.jpg ; /clients affiche « Les premiers témoignages arrivent bientôt. » et assets/data/customers.json contient `"customers": []` ; un assistant IA restitue ces citations comme des avis de clients réels | index-fr.html:194-228 (`<section id="customer-proof" ...>`), lignes 199, 209, 219 `src="/assets/customers/illustrative-*.jpg"` ; index.html:195 « Our clients say it best. » ; clients.html (texte principal : « Les premiers témoignages arrivent bientôt. ») ; assets/data/customers.json | Décision fondateurs : soit supprimer la section `<section id="customer-proof" ...>` (index-fr.html lignes 194 à 228, index.html lignes 194 à 228) tant qu'aucun témoignage réel n'est autorisé (CGV article 12 : les témoignages nécessitent un accord distinct), soit remplacer le titre par « Témoignages illustratifs : ce que nos clients nous disent. » et `Our clients say it best.` par « Illustrative testimonials: what our clients tell us. » ; témoignages réels [donnée à fournir] |
| DÉGRADÉ | MAJEUR | /index-fr, / | Logos de confiance tels que lus par une IA | Références vérifiables ou intitulé exact | Sous « Des mandataires et courtiers nous font confiance », six logos d'assureurs avec les alt AXA, Allianz, Generali, Swiss Life, Abeille Assurances, France Assurance ; une IA lit ces textes alternatifs et conclut que ces groupes sont clients ; le site n'apporte aucune preuve (aucun client nommé sur /clients, customers.json vide) ; l'intitulé parle de mandataires et courtiers, les logos sont ceux de compagnies | index-fr.html:93-103 (`<section class="home-trust" ...>`), `grep -o '<img src="/assets/trust/[^>]*>' index-fr.html` = 6 logos ; clients.html ; assets/data/customers.json | Décision fondateurs : si ces compagnies ne sont pas clientes, remplacer le `<h2 id="trust-title">` par « Nos clients distribuent les produits de » (EN : « Our clients distribute products from ») ou retirer la section ; liste des références autorisées [donnée à fournir] |
| DÉGRADÉ | MINEUR | /, /index-fr | JSON-LD Organization (logo et propriétés) | Logo carré d'au moins 112x112 px, description, sameAs, address, contactPoint, une seule définition de l'entité | `"logo": "https://www.syntheticswarm.ai/assets/logo-black.png"` : 64x39 px, 1023 octets ; Organization sans description, sameAs, address, contactPoint ni foundingDate ; définition différente sur /about et /a-propos (founder, sans logo ni WebSite) | `identify assets/logo-black.png` = `64x39 PNG srgba 1023B` ; index.html:28-45 et index-fr.html:28-45 ; about.html:24-41 et a-propos.html:24-41 ; JSON valides (Annexe E) | Remplacer le bloc JSON-LD de index.html et index-fr.html par celui de l'Annexe D (logo = logo-black-narrow.png 1024x1024, adresse, SIREN, contact, fondateurs) et, dans about.html et a-propos.html, garder le bloc existant en y ajoutant `"@id": "https://www.syntheticswarm.ai/#organization"` |
| OK | n/a | /faq, /faq-fr | JSON-LD FAQPage | JSON valide, questions identiques au texte visible | 10 questions par langue, JSON valide, les 10 intitulés retrouvés dans le texte visible de chaque page | Script Python bs4 + json (Annexe E) : « questions non retrouvées dans le texte visible : aucune » | Aucune |
| DÉGRADÉ | MINEUR | /our-solution, /notre-solution, /pricing, /tarifs, /careers, /recrutement, /contact, /contact-fr, /customers, /clients, /media, /medias, /legal-notice, /mentions-legales, /privacy, /confidentialite, /terms, /conditions, /opt-out, /opposition | Données structurées | Au moins l'entité Organization sur chaque page, Product sur les pages de tarifs | Aucun `application/ld+json` sur ces 20 pages | `grep -c 'application/ld+json' *.html` = 0 pour ces 20 fichiers (tableau de comptage en Annexe E) | Ajouter le bloc Organization de l'Annexe D dans le `<head>` de ces 20 pages (via le gabarit de l'Annexe B) et le bloc Product de l'Annexe D dans tarifs.html et pricing.html |
| DÉGRADÉ | MINEUR | Les 26 pages | Favicon utilisé par les aperçus (Slack, iMessage, Safari, Google) | favicon.ico, PNG 48x48 (multiple de 48 pour Google), apple-touch-icon 180x180, icône SVG | Seul /assets/favicon.png, 32x32 px, PNG RGBA, 604 octets, déclaré par `<link rel="icon" href="/assets/favicon.png" type="image/png">` ; /favicon.ico 404 ; /apple-touch-icon.png 404 ; aucun manifest ; Slack et l'aperçu iMessage utilisent le 32x32 (net sur la reconstitution) ; Safari et iMessage n'ont pas d'apple-touch-icon | `identify assets/favicon.png` = `32x32 PNG srgba 604B` ; curl prod : /assets/favicon.png 200 image/png 604 o ; /favicon.ico 404 ; /apple-touch-icon.png 404 | Annexe C : commandes ImageMagick à partir de logo-black-narrow.png et balises `<link>` à ajouter sur les 26 pages |
| OK | n/a | assets/favicon.png, assets/logo-black.png | Fichiers servis en production | 200, image/png, identiques au repo | favicon.png : 200, image/png, 604 octets, etag "b3df41f81efc0e955b8f9d8f69e101cd" ; logo-black.png : 200, image/png, 1023 octets ; identiques au repo (fichiers.csv) ; favicon.png référencé par les 26 pages, logo-black.png par le JSON-LD de index.html et index-fr.html | `curl -sD - https://www.syntheticswarm.ai/assets/favicon.png` (scratchpad flux15/hdr_assets_favicon.png.txt) ; `curl -o /dev/null -w '%{http_code} %{content_type} %{size_download}' https://www.syntheticswarm.ai/assets/logo-black.png` = 200 image/png 1023 | Aucune (les dimensions font l'objet des deux lignes précédentes) |
| OK | n/a | robots.txt | Accès des robots IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot) | Politique explicite décidée par les fondateurs | robots.txt (91 octets, identique en prod) : `User-agent: *`, `Allow: /`, `Disallow: /api/`, `Sitemap: https://www.syntheticswarm.ai/sitemap.xml` ; aucune règle par robot IA, donc tout est autorisé, y compris l'entraînement ; aucun en-tête X-Robots-Tag ; GPTBot, ClaudeBot et PerplexityBot reçoivent 200 et le même HTML que les navigateurs (md5 5e5e3bda sur /index-fr) ; sitemap déclaré, 26 URL = les 26 pages | `cat robots.txt` ; `curl -A "...GPTBot/1.2..." /index-fr` = 200 ; idem ClaudeBot/1.0 et PerplexityBot/1.0 ; `grep -c '<loc>' sitemap.xml` = 26 | Décision fondateurs (Annexe H) : option 1, recommandée pour un site vitrine qui veut être cité par les assistants (autorisation explicite des robots de recherche et de réponse, blocage du seul entraînement) ; option 2, tout autoriser explicitement ; dans les deux cas garder `Disallow: /api/` |
| DÉGRADÉ | MINEUR | /pricing, /tarifs, /careers, /recrutement | Production identique au commit audité 864833f | HTML servi identique au repo | Depuis 19:23 UTC la production sert deux commits postérieurs au commit audité : 8d267bb « move pricing starter badge to 20 leads » (19:20:10Z) et 81ec818 « replace recruitment placeholders with California brand and city visuals » (19:22:41Z) ; différences : tarifs.html et pricing.html ligne 68 (badge « Idéal pour démarrer » / « Best to start », `data-plan-index="1" hidden`), recrutement.html et careers.html ligne 60 (trois images ajoutées : /assets/careers/california.png, /assets/logo-black-narrow.png, /assets/careers/san-francisco.jpeg) ; titres, descriptions, canonical et balises OG inchangés ; les 22 autres pages restent identiques (md5) | `diff tarifs.html scratchpad/flux15/ua/tarifs-linkedin.html` (Annexe E) ; en-tête prod `last-modified: Sat, 19 Sep 2026 19:23:24 GMT`, `etag: "ac0fe4e0..."` contre md5 repo ef2d4c19 ; API GitHub list_commits main (Annexe E) | Pour l'audit : geler les déploiements pendant l'audit ou re-baser les flux sur 81ec818 (`git fetch origin main`) ; aucune correction de code pour ce flux |
| OK | n/a | /medias | Disponibilité pour les crawlers | 200 | 200, text/html, 8451 octets, titre « Médias \| Synthetic Swarm » (l'inventaire pages.csv notait un code 000 : délai réseau pendant la phase 0, non reproduit à 19:39Z ni à 19:49Z) | `curl -o /dev/null -w '%{http_code} %{content_type} %{size_download}' https://www.syntheticswarm.ai/medias` = 200 text/html 8451 | Corriger la ligne de pages.csv : `https://www.syntheticswarm.ai/medias,200,8451,text/html; charset=utf-8,Médias \| Synthetic Swarm,1,fr` |
| OK | n/a | Les 26 pages | Données de repli lues par les crawlers : `<title>`, meta description, canonical, hreflang, attribut lang | Présents et cohérents | `<title>` au format « Page \| Synthetic Swarm » et meta description sur les 26 ; canonical et 3 hreflang (en, fr, x-default) sur les 26 ; lang correct (13 fr, 13 en) | Tableau prod26 en Annexe E (titre, longueur de description, md5 prod et repo) ; comptage `description=1 canonical=1 alternate=3` sur les 26 fichiers | Aucune |
| DÉGRADÉ | MINEUR | /careers, /media, /medias, /mentions-legales, /contact, /recrutement, /legal-notice, /contact-fr | Descriptions de repli trop courtes pour un aperçu | 70 à 155 caractères, informatives | careers 35 caractères (« Come build Synthetic Swarm with us. »), media 35, medias 37, mentions-legales 41, contact 42, recrutement 43, legal-notice 45, contact-fr 46 | Extraction bs4 des 26 descriptions (Annexe E) | Remplacer la meta description (et la reprendre en og:description et twitter:description) : careers.html « Sales, AI engineering and Chief of Staff roles in France and San Francisco. Work directly with the founders of Synthetic Swarm. » ; recrutement.html « Postes Sales, ingénieur IA et Chief of Staff, en France et à San Francisco. Travaillez directement avec les fondateurs de Synthetic Swarm. » ; media.html « Press coverage, interviews and podcasts about Synthetic Swarm, dated prospecting signals for insurance brokers. Media contact: contact@syntheticswarm.ai. » ; medias.html « Articles, interviews et podcasts consacrés à Synthetic Swarm, signaux datés de prospection pour courtiers en assurance. Contact médias : contact@syntheticswarm.ai. » ; contact.html « Talk with Axel or Ilan at Synthetic Swarm: contact@syntheticswarm.ai, contact form and 15-minute demo booking. » ; contact-fr.html « Échanger avec Axel ou Ilan de Synthetic Swarm : contact@syntheticswarm.ai, formulaire de contact et démo de 15 minutes. » ; legal-notice.html « Legal notice of Synthetic Swarm SAS, 15 rue de la Gare, 62690 Izel-lès-Hameau, France. SIREN 993 422 120. » ; mentions-legales.html « Mentions légales de Synthetic Swarm SAS, 15 rue de la Gare, 62690 Izel-lès-Hameau. SIREN 993 422 120. » |

## 4. Ce qu'un assistant IA déduit de la home

Méthode : texte du HTML brut (bs4, sans JavaScript, fichiers scratchpad/prod/index-fr.html et index.html identiques à la production) comparé au texte rendu par Chromium avec JavaScript ; les deux textes ne diffèrent que par le clone du menu mobile et le bouton flottant de démo (ligne « Texte lisible sans JavaScript » du tableau). Les phrases ci-dessous sont rédigées uniquement à partir du texte présent dans chaque home.

Home FR (https://www.syntheticswarm.ai/index-fr), déduction en 3 phrases : « Synthetic Swarm est un service par abonnement, 399 € par mois pour 50 leads qualifiés par semaine (curseur de 10 à 200 et plus), qui livre chaque semaine aux mandataires et courtiers en assurance des fiches de dirigeants d'entreprise (nom, portable vérifié, email, LinkedIn) accompagnées d'un signal daté (première embauche, création de société, passage en SELARL, nouvel associé) expliquant pourquoi les appeler maintenant. Les prospects sont des TPE et professions libérales (cabinet d'architecture, cabinet dentaire, pharmacie, entreprise du BTP, cabinet comptable) dont la situation vient de changer ; trois clients témoignent et six compagnies d'assurance (AXA, Allianz, Generali, Swiss Life, Abeille Assurances, France Assurance) apparaissent comme références ; une démo de 15 minutes se réserve en ligne. L'entreprise annonce qu'elle emménage à San Francisco le 17 septembre 2026 ; rien sur la page n'indique qu'il s'agit d'une SAS française ni que les fiches concernent des entreprises situées en France. »

Ambiguïtés de la home FR : qui est le client (mandataires et courtiers, mais en quoi : le mot « assurance » n'apparaît que dans « besoins en assurance » et dans les rôles des témoins) ; quel produit (« prospects qualifiés », « fiches », « leads » pour la même chose ; « 10 fiches cette semaine » dans la démonstration contre « 50 leads qualifiés par semaine » dans le tarif) ; quel prix (un seul, 399 €, les 5 paliers sont dans pricing.js) ; où (San Francisco est le seul lieu cité ; le siège Izel-lès-Hameau n'est que sur /mentions-legales ; « France » absent du texte) ; références (témoignages illustratifs et logos d'assureurs sans preuve).

Home EN (https://www.syntheticswarm.ai/), déduction en 3 phrases : « Synthetic Swarm is a subscription service, 399 € per month for 50 qualified leads per week (slider from 10 to 200 and more), delivering every week to insurance agents and brokers profiles of business owners whose situation just changed (first hire, company creation, conversion to SELARL, SCI created), with verified mobile number, email, LinkedIn profile and a dated reason to call. Three clients testify and six insurers (AXA, Allianz, Generali, Swiss Life, Abeille Assurances, France Assurance) appear as references; a 15-minute demo can be booked online. The company says it moves to San Francisco on September 17, 2026; the euro prices, the French legal forms (SELARL, SCI) and the phone number starting with 06 suggest a French market, but the page never says in which country the company is registered or where the prospects are located. »

Ambiguïtés de la home EN : un assistant anglophone décrit très probablement une startup de San Francisco vendant à des courtiers en assurance, avec des prix en euros inexpliqués ; le pays des prospects (France) n'est déductible qu'en lisant /about (« first insurance customers in France »), /faq (« in France ») ou /careers ; « France » n'apparaît sur la home que dans l'alt d'un logo (index.html:101).

## Compte

| Verdict | Lignes |
| --- | --- |
| OK | 7 |
| CASSÉ | 2 |
| TROMPEUR | 1 |
| DÉGRADÉ | 14 |
| NON TESTABLE | 0 |
| Total | 24 |

| Sévérité | Lignes |
| --- | --- |
| BLOQUANT | 0 |
| MAJEUR | 10 |
| MINEUR | 7 |
| n/a | 7 |

## Couverture

- Pages (26 sur 26) : /, /index-fr, /our-solution, /notre-solution, /pricing, /tarifs, /faq, /faq-fr, /about, /a-propos, /careers, /recrutement, /contact, /contact-fr, /customers, /clients, /media, /medias, /legal-notice, /mentions-legales, /privacy, /confidentialite, /terms, /conditions, /opt-out, /opposition : balises OG et Twitter (lignes « Balises Open Graph et Twitter Card », « Balise og:title isolée », « Image de partage »), données de repli (ligne « Données de repli »), favicon (ligne « Favicon utilisé par les aperçus »), JSON-LD (lignes « JSON-LD Organization », « JSON-LD FAQPage », « Données structurées »), relevé prod26 (Annexe E). Aperçus reconstitués : /index-fr et /tarifs. Lecture IA : /index-fr et /.
- Fichiers : robots.txt (ligne « Accès des robots IA »), sitemap.xml (même ligne), assets/favicon.png et assets/logo-black.png (lignes « Fichiers servis en production », « Favicon », « JSON-LD Organization »), assets/logo-black-narrow.png (proposé comme logo et source des icônes), pricing.js (ligne « Grille tarifaire »), vercel.json (ligne « Langue de l'aperçu de la racine »).
- Fichiers absents constatés : /llms.txt, /llms-full.txt, /favicon.ico, /apple-touch-icon.png (404 en production).
- Hors périmètre, signalé pour les autres flux : témoignages illustratifs et logos de confiance (contenu), écart production/commit audité (méthode d'audit).
- Aucune écriture externe (aucun formulaire soumis, aucun compte créé) ; aucune modification du repo hors docs/audit-total/15-partage-social-ia.md et docs/audit-total/screens/15/.

## Annexe A : balises Open Graph et Twitter à coller, page par page

Règles appliquées : og:title = `<title>` de la page ; og:description = meta description de la page (à remplacer par les descriptions proposées dans le tableau pour /tarifs, /pricing et les 8 pages à description courte) ; og:url = canonical ; og:locale fr_FR ou en_US selon `lang` ; og:image = /assets/og-image-fr.png ou /assets/og-image-en.png (Annexe C) ; twitter:card summary_large_image. Le bloc se place immédiatement après la ligne `<meta name="description" ...>` ; sur pricing.html et tarifs.html il remplace la ligne 9 existante.

#### index.html (URL https://www.syntheticswarm.ai/) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/">
  <meta property="og:title" content="Insurance prospecting | Synthetic Swarm">
  <meta property="og:description" content="Synthetic Swarm spots executives whose situation just changed and delivers their name, phone and the reason to call, every week.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Insurance prospecting | Synthetic Swarm">
  <meta name="twitter:description" content="Synthetic Swarm spots executives whose situation just changed and delivers their name, phone and the reason to call, every week.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### index-fr.html (URL https://www.syntheticswarm.ai/index-fr) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/index-fr">
  <meta property="og:title" content="Prospection en assurance | Synthetic Swarm">
  <meta property="og:description" content="Synthetic Swarm repère les dirigeants dont la situation vient de changer et vous livre chaque semaine leur nom, leur téléphone et la raison de les appeler.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Prospection en assurance | Synthetic Swarm">
  <meta name="twitter:description" content="Synthetic Swarm repère les dirigeants dont la situation vient de changer et vous livre chaque semaine leur nom, leur téléphone et la raison de les appeler.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

#### our-solution.html (URL https://www.syntheticswarm.ai/our-solution) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/our-solution">
  <meta property="og:title" content="Our solution | Synthetic Swarm">
  <meta property="og:description" content="Define your target. Synthetic Swarm connects business changes, qualifies the right people and prepares your next conversations.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Our solution | Synthetic Swarm">
  <meta name="twitter:description" content="Define your target. Synthetic Swarm connects business changes, qualifies the right people and prepares your next conversations.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### notre-solution.html (URL https://www.syntheticswarm.ai/notre-solution) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/notre-solution">
  <meta property="og:title" content="Notre solution | Synthetic Swarm">
  <meta property="og:description" content="Définissez votre cible. Synthetic Swarm rapproche les changements, qualifie les bonnes personnes et prépare vos prochains appels.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Notre solution | Synthetic Swarm">
  <meta name="twitter:description" content="Définissez votre cible. Synthetic Swarm rapproche les changements, qualifie les bonnes personnes et prépare vos prochains appels.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

#### pricing.html (URL https://www.syntheticswarm.ai/pricing) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/pricing">
  <meta property="og:title" content="Pricing | Synthetic Swarm">
  <meta property="og:description" content="Synthetic Swarm pricing, choose how many qualified leads you want every week.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Pricing | Synthetic Swarm">
  <meta name="twitter:description" content="Synthetic Swarm pricing, choose how many qualified leads you want every week.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### tarifs.html (URL https://www.syntheticswarm.ai/tarifs) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/tarifs">
  <meta property="og:title" content="Tarifs | Synthetic Swarm">
  <meta property="og:description" content="Tarifs Synthetic Swarm, choisissez le nombre de leads qualifiés reçus chaque semaine.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Tarifs | Synthetic Swarm">
  <meta name="twitter:description" content="Tarifs Synthetic Swarm, choisissez le nombre de leads qualifiés reçus chaque semaine.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

#### faq.html (URL https://www.syntheticswarm.ai/faq) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/faq">
  <meta property="og:title" content="FAQ | Synthetic Swarm">
  <meta property="og:description" content="Questions about insurance prospecting with Synthetic Swarm.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="FAQ | Synthetic Swarm">
  <meta name="twitter:description" content="Questions about insurance prospecting with Synthetic Swarm.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### faq-fr.html (URL https://www.syntheticswarm.ai/faq-fr) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/faq-fr">
  <meta property="og:title" content="FAQ | Synthetic Swarm">
  <meta property="og:description" content="Questions sur la prospection en assurance avec Synthetic Swarm.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="FAQ | Synthetic Swarm">
  <meta name="twitter:description" content="Questions sur la prospection en assurance avec Synthetic Swarm.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

#### about.html (URL https://www.syntheticswarm.ai/about) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/about">
  <meta property="og:title" content="About | Synthetic Swarm">
  <meta property="og:description" content="Meet Axel and Ilan, discover how Synthetic Swarm began, its first insurance customers in France and the move to San Francisco.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="About | Synthetic Swarm">
  <meta name="twitter:description" content="Meet Axel and Ilan, discover how Synthetic Swarm began, its first insurance customers in France and the move to San Francisco.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### a-propos.html (URL https://www.syntheticswarm.ai/a-propos) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/a-propos">
  <meta property="og:title" content="À propos | Synthetic Swarm">
  <meta property="og:description" content="Découvrez Axel et Ilan, les origines de Synthetic Swarm, ses premiers clients dans l’assurance en France et son installation à San Francisco.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="À propos | Synthetic Swarm">
  <meta name="twitter:description" content="Découvrez Axel et Ilan, les origines de Synthetic Swarm, ses premiers clients dans l’assurance en France et son installation à San Francisco.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

#### careers.html (URL https://www.syntheticswarm.ai/careers) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/careers">
  <meta property="og:title" content="Careers | Synthetic Swarm">
  <meta property="og:description" content="Come build Synthetic Swarm with us.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Careers | Synthetic Swarm">
  <meta name="twitter:description" content="Come build Synthetic Swarm with us.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### recrutement.html (URL https://www.syntheticswarm.ai/recrutement) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/recrutement">
  <meta property="og:title" content="Recrutement | Synthetic Swarm">
  <meta property="og:description" content="Venez construire Synthetic Swarm avec nous.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Recrutement | Synthetic Swarm">
  <meta name="twitter:description" content="Venez construire Synthetic Swarm avec nous.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

#### contact.html (URL https://www.syntheticswarm.ai/contact) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/contact">
  <meta property="og:title" content="Contact | Synthetic Swarm">
  <meta property="og:description" content="Talk with Axel or Ilan at Synthetic Swarm.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Contact | Synthetic Swarm">
  <meta name="twitter:description" content="Talk with Axel or Ilan at Synthetic Swarm.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### contact-fr.html (URL https://www.syntheticswarm.ai/contact-fr) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/contact-fr">
  <meta property="og:title" content="Contact | Synthetic Swarm">
  <meta property="og:description" content="Échanger avec Axel ou Ilan de Synthetic Swarm.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Contact | Synthetic Swarm">
  <meta name="twitter:description" content="Échanger avec Axel ou Ilan de Synthetic Swarm.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

#### customers.html (URL https://www.syntheticswarm.ai/customers) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/customers">
  <meta property="og:title" content="Customers | Synthetic Swarm">
  <meta property="og:description" content="See how our customers use Synthetic Swarm to identify the right companies at the right time.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Customers | Synthetic Swarm">
  <meta name="twitter:description" content="See how our customers use Synthetic Swarm to identify the right companies at the right time.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### clients.html (URL https://www.syntheticswarm.ai/clients) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/clients">
  <meta property="og:title" content="Nos clients | Synthetic Swarm">
  <meta property="og:description" content="Découvrez comment nos clients utilisent Synthetic Swarm pour identifier les bonnes entreprises au bon moment.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Nos clients | Synthetic Swarm">
  <meta name="twitter:description" content="Découvrez comment nos clients utilisent Synthetic Swarm pour identifier les bonnes entreprises au bon moment.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

#### media.html (URL https://www.syntheticswarm.ai/media) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/media">
  <meta property="og:title" content="Media | Synthetic Swarm">
  <meta property="og:description" content="Publications about Synthetic Swarm.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Media | Synthetic Swarm">
  <meta name="twitter:description" content="Publications about Synthetic Swarm.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### medias.html (URL https://www.syntheticswarm.ai/medias) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/medias">
  <meta property="og:title" content="Médias | Synthetic Swarm">
  <meta property="og:description" content="Les publications sur Synthetic Swarm.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Médias | Synthetic Swarm">
  <meta name="twitter:description" content="Les publications sur Synthetic Swarm.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

#### legal-notice.html (URL https://www.syntheticswarm.ai/legal-notice) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/legal-notice">
  <meta property="og:title" content="Legal Notice | Synthetic Swarm">
  <meta property="og:description" content="Legal notice for the Synthetic Swarm website.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Legal Notice | Synthetic Swarm">
  <meta name="twitter:description" content="Legal notice for the Synthetic Swarm website.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### mentions-legales.html (URL https://www.syntheticswarm.ai/mentions-legales) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/mentions-legales">
  <meta property="og:title" content="Mentions légales | Synthetic Swarm">
  <meta property="og:description" content="Mentions légales du site Synthetic Swarm.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Mentions légales | Synthetic Swarm">
  <meta name="twitter:description" content="Mentions légales du site Synthetic Swarm.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

#### privacy.html (URL https://www.syntheticswarm.ai/privacy) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/privacy">
  <meta property="og:title" content="Privacy policy | Synthetic Swarm">
  <meta property="og:description" content="Synthetic Swarm privacy policy: personal information and your rights.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Privacy policy | Synthetic Swarm">
  <meta name="twitter:description" content="Synthetic Swarm privacy policy: personal information and your rights.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### confidentialite.html (URL https://www.syntheticswarm.ai/confidentialite) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/confidentialite">
  <meta property="og:title" content="Politique de confidentialité | Synthetic Swarm">
  <meta property="og:description" content="Politique de confidentialité de Synthetic Swarm : données personnelles et droits.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Politique de confidentialité | Synthetic Swarm">
  <meta name="twitter:description" content="Politique de confidentialité de Synthetic Swarm : données personnelles et droits.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

#### terms.html (URL https://www.syntheticswarm.ai/terms) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/terms">
  <meta property="og:title" content="Terms and Conditions of Sale | Synthetic Swarm">
  <meta property="og:description" content="Synthetic Swarm B2B terms of sale: monthly subscriptions, payment, use of prospect profiles and cancellation.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Terms and Conditions of Sale | Synthetic Swarm">
  <meta name="twitter:description" content="Synthetic Swarm B2B terms of sale: monthly subscriptions, payment, use of prospect profiles and cancellation.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### conditions.html (URL https://www.syntheticswarm.ai/conditions) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/conditions">
  <meta property="og:title" content="Conditions générales de vente | Synthetic Swarm">
  <meta property="og:description" content="Conditions de vente B2B de Synthetic Swarm : abonnement mensuel, paiement, utilisation des fiches et résiliation.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Conditions générales de vente | Synthetic Swarm">
  <meta name="twitter:description" content="Conditions de vente B2B de Synthetic Swarm : abonnement mensuel, paiement, utilisation des fiches et résiliation.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

#### opt-out.html (URL https://www.syntheticswarm.ai/opt-out) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="fr_FR">
  <meta property="og:url" content="https://www.syntheticswarm.ai/opt-out">
  <meta property="og:title" content="Opt out | Synthetic Swarm">
  <meta property="og:description" content="Request removal of your professional contact details from Synthetic Swarm prospecting records.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Opt out | Synthetic Swarm">
  <meta name="twitter:description" content="Request removal of your professional contact details from Synthetic Swarm prospecting records.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-en.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm: know who to call, at the right time. Insurance prospecting.">
```

#### opposition.html (URL https://www.syntheticswarm.ai/opposition) : à insérer juste après la ligne `<meta name="description" ...>`

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="https://www.syntheticswarm.ai/opposition">
  <meta property="og:title" content="Droit d’opposition | Synthetic Swarm">
  <meta property="og:description" content="Demander le retrait de vos coordonnées professionnelles des fiches Synthetic Swarm.">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Droit d’opposition | Synthetic Swarm">
  <meta name="twitter:description" content="Demander le retrait de vos coordonnées professionnelles des fiches Synthetic Swarm.">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-fr.png">
  <meta name="twitter:image:alt" content="Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.">
```

## Annexe B : gabarit scripts/site_layout.py (fonction `page()`, lignes 106 à 127)

Attention : `sync()` (ligne 140) ne réécrit que l'en-tête et le pied de page des fichiers existants ; les 26 fichiers HTML en place doivent donc recevoir le bloc de l'Annexe A directement. Le gabarit ci-dessous sert aux pages générées à l'avenir. À insérer dans `page()` : les trois affectations avant `html=f'''...` (ligne 108), les balises juste après la ligne `<meta name="description" ...>` (ligne 115). Ne pas exécuter le script sur le repo (règle de l'audit) : le tester sur une copie.

```python
 og_locale = 'fr_FR' if lang == 'fr' else 'en_US'
 og_locale_alt = 'en_US' if lang == 'fr' else 'fr_FR'
 og_alt = 'Synthetic Swarm : sachez qui appeler, au bon moment. Prospection en assurance.' if lang == 'fr' else 'Synthetic Swarm: know who to call, at the right time. Insurance prospecting.'
```

```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Synthetic Swarm">
  <meta property="og:locale" content="{og_locale}">
  <meta property="og:locale:alternate" content="{og_locale_alt}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:title" content="{escape(title)} | Synthetic Swarm">
  <meta property="og:description" content="{escape(description,quote=True)}">
  <meta property="og:image" content="https://www.syntheticswarm.ai/assets/og-image-{lang}.png">
  <meta property="og:image:secure_url" content="https://www.syntheticswarm.ai/assets/og-image-{lang}.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{og_alt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{escape(title)} | Synthetic Swarm">
  <meta name="twitter:description" content="{escape(description,quote=True)}">
  <meta name="twitter:image" content="https://www.syntheticswarm.ai/assets/og-image-{lang}.png">
  <meta name="twitter:image:alt" content="{og_alt}">
```

## Annexe C : images de partage et icônes (commandes ImageMagick testées dans le scratchpad) et balises `<link>`

Visuel de partage provisoire FR (résultat vérifié : docs/audit-total/screens/15/og-image-fr-provisoire-1200x630.png, 1200x630, PNG 8 bits, 44 780 octets). Le visuel définitif du designer remplace ce fichier au même chemin [donnée à fournir]. À exécuter à la racine du repo :

```sh
convert -size 1200x630 xc:'#fcfbf8' \
  \( assets/logo-black-narrow.png -resize 96x96 \) -geometry +96+80 -composite \
  -font DejaVu-Sans-Bold -pointsize 30 -fill '#1a1a1a' -annotate +216+140 'Synthetic Swarm' \
  -font DejaVu-Sans-Bold -pointsize 72 -fill '#1a1a1a' -annotate +96+320 'Sachez qui appeler.' \
  -font DejaVu-Serif -pointsize 72 -fill '#0a66c2' -annotate +96+410 'Au bon moment.' \
  -font DejaVu-Sans -pointsize 28 -fill '#555555' -annotate +96+500 'Prospection en assurance : dirigeant, téléphone, email, signal daté.' \
  -font DejaVu-Sans -pointsize 24 -fill '#777777' -annotate +96+570 'www.syntheticswarm.ai' \
  -depth 8 assets/og-image-fr.png
```

Visuel de partage provisoire EN :

```sh
convert -size 1200x630 xc:'#fcfbf8' \
  \( assets/logo-black-narrow.png -resize 96x96 \) -geometry +96+80 -composite \
  -font DejaVu-Sans-Bold -pointsize 30 -fill '#1a1a1a' -annotate +216+140 'Synthetic Swarm' \
  -font DejaVu-Sans-Bold -pointsize 72 -fill '#1a1a1a' -annotate +96+320 'Know who to call.' \
  -font DejaVu-Serif -pointsize 72 -fill '#0a66c2' -annotate +96+410 'At the right time.' \
  -font DejaVu-Sans -pointsize 28 -fill '#555555' -annotate +96+500 'Insurance prospecting: executive, phone, email, dated signal.' \
  -font DejaVu-Sans -pointsize 24 -fill '#777777' -annotate +96+570 'www.syntheticswarm.ai' \
  -depth 8 assets/og-image-en.png
```

Icônes (à partir de assets/logo-black-narrow.png, 1024x1024) :

```sh
convert assets/logo-black-narrow.png -resize 48x48 assets/favicon-48.png
convert assets/logo-black-narrow.png -resize 192x192 assets/favicon-192.png
convert assets/logo-black-narrow.png -resize 512x512 assets/favicon-512.png
convert assets/logo-black-narrow.png -background '#fcfbf8' -flatten -resize 180x180 assets/apple-touch-icon.png
convert assets/logo-black-narrow.png -define icon:auto-resize=48,32,16 favicon.ico
```

Balises à ajouter sur les 26 pages, à la place de la ligne `<link rel="icon" href="/assets/favicon.png" type="image/png">` (ligne 120 du gabarit) :

```html
  <link rel="icon" href="/favicon.ico" sizes="48x48 32x32 16x16">
  <link rel="icon" href="/assets/favicon-48.png" type="image/png" sizes="48x48">
  <link rel="icon" href="/assets/favicon-192.png" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" sizes="180x180">
```

## Annexe D : données structurées JSON-LD

Organization et WebSite, à mettre à la place du bloc existant de index-fr.html (lignes 28 à 45) ; pour index.html, remplacer la description par « Weekly prospecting profiles for insurance brokers and agents: executive, phone, email, LinkedIn and a dated signal explaining why to call now. » et `"inLanguage": "en"`. Pour les 20 pages sans JSON-LD, coller le même bloc dans le `<head>`. La clé `sameAs` est à supprimer tant que l'URL de la page LinkedIn de l'entreprise n'est pas connue [donnée à fournir].

```html
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.syntheticswarm.ai/#organization",
      "name": "Synthetic Swarm",
      "legalName": "Synthetic Swarm SAS",
      "url": "https://www.syntheticswarm.ai/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.syntheticswarm.ai/assets/logo-black-narrow.png",
        "width": 1024,
        "height": 1024
      },
      "description": "Fiches de prospection hebdomadaires pour courtiers et mandataires en assurance : dirigeant, téléphone, email, LinkedIn et signal daté expliquant pourquoi appeler maintenant.",
      "email": "contact@syntheticswarm.ai",
      "foundingDate": "2026-02",
      "founder": [
        { "@type": "Person", "name": "Axel", "jobTitle": "CEO", "sameAs": "https://www.linkedin.com/in/axel-carron/" },
        { "@type": "Person", "name": "Ilan", "jobTitle": "CTO", "sameAs": "https://www.linkedin.com/in/isainteagathe/" }
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "15 rue de la Gare",
        "postalCode": "62690",
        "addressLocality": "Izel-lès-Hameau",
        "addressCountry": "FR"
      },
      "identifier": { "@type": "PropertyValue", "propertyID": "SIREN", "value": "993422120" },
      "areaServed": "FR",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "sales",
        "email": "contact@syntheticswarm.ai",
        "availableLanguage": ["fr", "en"]
      },
      "sameAs": ["[donnée à fournir : URL de la page LinkedIn de l'entreprise]"]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.syntheticswarm.ai/#website",
      "name": "Synthetic Swarm",
      "url": "https://www.syntheticswarm.ai/",
      "inLanguage": "fr",
      "publisher": { "@id": "https://www.syntheticswarm.ai/#organization" }
    }
  ]
}
  </script>
```

Product et offres, à coller dans le `<head>` de tarifs.html (version EN pour pricing.html : name « Synthetic Swarm, weekly prospecting profiles », description « Business owner profiles with verified phone, email, LinkedIn and a dated signal, delivered every week to insurance brokers and agents. », noms d'offres « 10 leads per week » etc., url https://www.syntheticswarm.ai/pricing) :

```html
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Synthetic Swarm, fiches de prospection hebdomadaires",
  "description": "Fiches de dirigeants d'entreprise avec téléphone vérifié, email, LinkedIn et signal daté, livrées chaque semaine aux courtiers et mandataires en assurance.",
  "brand": { "@type": "Brand", "name": "Synthetic Swarm" },
  "url": "https://www.syntheticswarm.ai/tarifs",
  "offers": [
    { "@type": "Offer", "name": "10 fiches par semaine", "description": "Abonnement mensuel, 10 fiches par semaine", "price": "89", "priceCurrency": "EUR", "url": "https://www.syntheticswarm.ai/tarifs", "availability": "https://schema.org/InStock" },
    { "@type": "Offer", "name": "20 fiches par semaine", "description": "Abonnement mensuel, 20 fiches par semaine", "price": "169", "priceCurrency": "EUR", "url": "https://www.syntheticswarm.ai/tarifs", "availability": "https://schema.org/InStock" },
    { "@type": "Offer", "name": "50 fiches par semaine", "description": "Abonnement mensuel, 50 fiches par semaine", "price": "399", "priceCurrency": "EUR", "url": "https://www.syntheticswarm.ai/tarifs", "availability": "https://schema.org/InStock" },
    { "@type": "Offer", "name": "100 fiches par semaine", "description": "Abonnement mensuel, 100 fiches par semaine", "price": "789", "priceCurrency": "EUR", "url": "https://www.syntheticswarm.ai/tarifs", "availability": "https://schema.org/InStock" },
    { "@type": "Offer", "name": "200 fiches par semaine", "description": "Abonnement mensuel, 200 fiches par semaine", "price": "1499", "priceCurrency": "EUR", "url": "https://www.syntheticswarm.ai/tarifs", "availability": "https://schema.org/InStock" }
  ]
}
  </script>
```

## Annexe E : preuves

### E.1 Relevé des 26 pages en production (19:49 UTC, user-agent générique)

| URL | HTTP | Octets | md5 prod | md5 repo | Identique au repo | og: | twitter: | Titre | Description (caractères) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 200 | 34369 | fd674d25 | fd674d25 | oui | 0 | 0 | Insurance prospecting \| Synthetic Swarm | 128 |
| /index-fr | 200 | 35604 | 5e5e3bda | 5e5e3bda | oui | 0 | 0 | Prospection en assurance \| Synthetic Swarm | 155 |
| /our-solution | 200 | 18123 | 01ee33f9 | 01ee33f9 | oui | 0 | 0 | Our solution \| Synthetic Swarm | 127 |
| /notre-solution | 200 | 18682 | 08869da1 | 08869da1 | oui | 0 | 0 | Notre solution \| Synthetic Swarm | 129 |
| /pricing | 200 | 11925 | 9a65145c | 27f8d222 | NON | 1 | 0 | Pricing \| Synthetic Swarm | 77 |
| /tarifs | 200 | 12260 | ac0fe4e0 | ef2d4c19 | NON | 1 | 0 | Tarifs \| Synthetic Swarm | 85 |
| /faq | 200 | 14597 | 75117846 | 75117846 | oui | 0 | 0 | FAQ \| Synthetic Swarm | 59 |
| /faq-fr | 200 | 15036 | fbd119d2 | fbd119d2 | oui | 0 | 0 | FAQ \| Synthetic Swarm | 63 |
| /about | 200 | 11806 | bedb1d63 | bedb1d63 | oui | 0 | 0 | About \| Synthetic Swarm | 126 |
| /a-propos | 200 | 12317 | cce029a3 | cce029a3 | oui | 0 | 0 | À propos \| Synthetic Swarm | 141 |
| /careers | 200 | 13949 | 10eceeac | 52efa19b | NON | 0 | 0 | Careers \| Synthetic Swarm | 35 |
| /recrutement | 200 | 14563 | 86780194 | 8b9df364 | NON | 0 | 0 | Recrutement \| Synthetic Swarm | 43 |
| /contact | 200 | 10898 | a2b0f6cd | a2b0f6cd | oui | 0 | 0 | Contact \| Synthetic Swarm | 42 |
| /contact-fr | 200 | 11095 | 07ea256d | 07ea256d | oui | 0 | 0 | Contact \| Synthetic Swarm | 46 |
| /customers | 200 | 8093 | 854e7f3a | 854e7f3a | oui | 0 | 0 | Customers \| Synthetic Swarm | 92 |
| /clients | 200 | 8354 | 56efd7b4 | 56efd7b4 | oui | 0 | 0 | Nos clients \| Synthetic Swarm | 109 |
| /media | 200 | 8213 | e2395976 | e2395976 | oui | 0 | 0 | Media \| Synthetic Swarm | 35 |
| /medias | 200 | 8451 | f9a8cfe7 | f9a8cfe7 | oui | 0 | 0 | Médias \| Synthetic Swarm | 37 |
| /legal-notice | 200 | 7526 | ed8cce53 | ed8cce53 | oui | 0 | 0 | Legal Notice \| Synthetic Swarm | 45 |
| /mentions-legales | 200 | 7705 | c166b5f3 | c166b5f3 | oui | 0 | 0 | Mentions légales \| Synthetic Swarm | 41 |
| /privacy | 200 | 8478 | e5bc727d | e5bc727d | oui | 0 | 0 | Privacy policy \| Synthetic Swarm | 69 |
| /confidentialite | 200 | 8907 | a75c9845 | a75c9845 | oui | 0 | 0 | Politique de confidentialité \| Synthetic Swarm | 81 |
| /terms | 200 | 12604 | 67211826 | 67211826 | oui | 0 | 0 | Terms and Conditions of Sale \| Synthetic Swarm | 109 |
| /conditions | 200 | 13567 | 83e096f0 | 83e096f0 | oui | 0 | 0 | Conditions générales de vente \| Synthetic Swarm | 113 |
| /opt-out | 200 | 7818 | 1980efe7 | 1980efe7 | oui | 0 | 0 | Opt out \| Synthetic Swarm | 94 |
| /opposition | 200 | 8044 | 14a705d8 | 14a705d8 | oui | 0 | 0 | Droit d’opposition \| Synthetic Swarm | 83 |


### E.2 Réponses aux user-agents de partage et aux robots IA (curl -A, 19:40 UTC)

```
index-fr linkedin -> 200 text/html; charset=utf-8 35604o  md5=5e5e3bda repo=5e5e3bda title=<title>Prospection en assurance | Synthetic Swarm</title> xrobots=
index-fr slack -> 200 text/html; charset=utf-8 35604o  md5=5e5e3bda repo=5e5e3bda title=<title>Prospection en assurance | Synthetic Swarm</title> xrobots=
index-fr whatsapp -> 200 text/html; charset=utf-8 35604o  md5=5e5e3bda repo=5e5e3bda title=<title>Prospection en assurance | Synthetic Swarm</title> xrobots=
index-fr facebook -> 200 text/html; charset=utf-8 35604o  md5=5e5e3bda repo=5e5e3bda title=<title>Prospection en assurance | Synthetic Swarm</title> xrobots=
tarifs linkedin -> 200 text/html; charset=utf-8 12260o  md5=ac0fe4e0 repo=ef2d4c19 title=<title>Tarifs | Synthetic Swarm</title> xrobots=
tarifs slack -> 200 text/html; charset=utf-8 12260o  md5=ac0fe4e0 repo=ef2d4c19 title=<title>Tarifs | Synthetic Swarm</title> xrobots=
tarifs whatsapp -> 200 text/html; charset=utf-8 12260o  md5=ac0fe4e0 repo=ef2d4c19 title=<title>Tarifs | Synthetic Swarm</title> xrobots=
tarifs facebook -> 200 text/html; charset=utf-8 12260o  md5=ac0fe4e0 repo=ef2d4c19 title=<title>Tarifs | Synthetic Swarm</title> xrobots=
/ linkedin -> 200 text/html; charset=utf-8 34369o  title=<title>Insurance prospecting | Synthetic Swarm</title> md5=fd674d25 repo_index=fd674d25
index-fr gptbot -> 200 text/html; charset=utf-8 35604o md5=5e5e3bda xrobots=
index-fr claudebot -> 200 text/html; charset=utf-8 35604o md5=5e5e3bda xrobots=
index-fr perplexity -> 200 text/html; charset=utf-8 35604o md5=5e5e3bda xrobots=
```

En-têtes complets de /index-fr pour LinkedInBot :

```
HTTP/2 200
accept-ranges: bytes
access-control-allow-origin: *
age: 864
cache-control: public, max-age=0, must-revalidate
content-disposition: inline; filename="index-fr"
content-type: text/html; charset=utf-8
date: Sat, 19 Sep 2026 19:40:38 GMT
etag: "5e5e3bda1aa330c62a8460eecb1c2aa4"
last-modified: Sat, 19 Sep 2026 19:26:14 GMT
server: Vercel
strict-transport-security: max-age=63072000
x-vercel-cache: HIT
x-vercel-id: iad1::nz827-1789846838581-a1a78ea1ee1e
content-length: 35604
```

/llms.txt en production :

```
HTTP/2 404
cache-control: public, max-age=0, must-revalidate
content-type: text/plain; charset=utf-8
date: Sat, 19 Sep 2026 19:39:20 GMT
server: Vercel
strict-transport-security: max-age=63072000
x-vercel-error: NOT_FOUND
content-length: 79
```

### E.3 HTML brut contre rendu JavaScript (scratchpad flux15/render-text.mjs puis comparaison bs4)

```
index-fr js status 200 finalUrl https://www.syntheticswarm.ai/index-fr html 38556 innerText 4474 scripts 8
index js status 200 finalUrl https://www.syntheticswarm.ai/ html 37580 innerText 3933 scripts 8
index-fr nojs status 200 finalUrl https://www.syntheticswarm.ai/index-fr html 35399 innerText 4434 scripts 8
index nojs status 200 finalUrl https://www.syntheticswarm.ai/ html 34456 innerText 3899 scripts 8

##### index-fr: chaînes brut=309 rendu JS=327 | injectées par JS=18 | retirées par JS=0
  INJECTÉES : +2 FR, +2 ↗, +1 Notre solution, +1 Tarifs, +1 Qui sommes-nous, +1 Recrutement, +1 Médias, +1 EN, +1 Connexion, +1 Démo, +1 Axel, +1 CEO, +1 Ilan, +1 CTO, +1 Menu, +1 ×
  RETIRÉES : aucune
  innerText : lignes visibles avec JS mais pas sans JS : Réserver une démo, 15 min avec l'équipe ; sans JS mais pas avec JS : aucune
  CHIFFRES dans le HTML brut : 399 € x1 ; 89 €, 169 €, 789 €, 1 499 € x0 ; "10 fiches" x1 ; "50 leads" x2 ; "200 leads" x1 ; "San Francisco" x1 ; "Izel", "Hameau", "Paris", "France" x0
  contexte : "Forfait préféré Synthetic Swarm 399 € /mois 50 leads qualifiés par semaine Besoin de plus de 20..."

##### index: chaînes brut=309 rendu JS=327 | injectées par JS=18 | retirées par JS=0
  INJECTÉES : +2 EN, +2 ↗, +1 Our solution, +1 Pricing, +1 Who we are, +1 Careers, +1 Media, +1 FR, +1 Log in, +1 Demo, +1 Axel, +1 CEO, +1 Ilan, +1 CTO, +1 Menu, +1 ×
  innerText : lignes visibles avec JS mais pas sans JS : Book a demo, 15 min with the team
  CHIFFRES dans le HTML brut : 399 € x1 ; "50 leads" x1 ; "200 leads" x1 ; "San Francisco" x1 ; "France" x1 (alt="France Assurance", index.html:101)
```

### E.4 Validation des JSON-LD (Python json + bs4)

```
index.html JSON valide, types: ['Organization', 'WebSite']
   Organization clés: ['@type', 'logo', 'name', 'url'] | sameAs: None | address: None | contactPoint: None | description: None
index-fr.html JSON valide, types: ['Organization', 'WebSite'] (mêmes clés)
about.html JSON valide, types: ['Organization'] ; clés: ['@context', '@type', 'founder', 'name', 'url']
a-propos.html JSON valide, types: ['Organization'] ; clés identiques
faq.html JSON valide, types: ['FAQPage'] ; questions JSON-LD: 10 ; questions non retrouvées dans le texte visible: aucune
faq-fr.html JSON valide, types: ['FAQPage'] ; questions JSON-LD: 10 ; questions non retrouvées dans le texte visible: aucune
```

Comptage par fichier (`og` = balises og:, `twitter`, `description`, `canonical`, `jsonld`, `favicon`, `alternate`) : les 26 fichiers donnent `description=1 canonical=1 favicon=1 alternate=3` ; `jsonld=1` pour index, index-fr, about, a-propos, faq, faq-fr et `jsonld=0` pour les 20 autres ; `og=1` pour pricing et tarifs, `og=0` ailleurs ; `twitter=0` partout.

### E.5 Écart production / commit audité

```
$ diff tarifs.html scratchpad/flux15/ua/tarifs-linkedin.html
68c68
<         <div class="pricing-config-badge-slot"><div class="pricing-config-badge">Forfait préféré</div></div>
---
>         <div class="pricing-config-badge-slot"><div class="pricing-config-badge" data-plan-index="1" hidden>Idéal pour démarrer</div></div>
$ diff pricing.html scratchpad/flux15/ua/pricing-linkedin.html
68c68  (« Preferred plan » contre « Best to start », data-plan-index="1" hidden)
$ diff recrutement.html scratchpad/flux15/prod26/recrutement.html
60c60  (trois <img> ajoutées dans .careers-visual : /assets/careers/california.png, /assets/logo-black-narrow.png, /assets/careers/san-francisco.jpeg)
$ diff careers.html scratchpad/flux15/prod26/careers.html
60c60  (idem)
En-têtes prod /tarifs : last-modified: Sat, 19 Sep 2026 19:23:24 GMT ; etag: "ac0fe4e0989fedb8543e38d111f6e913" ; content-length: 12260 (repo : md5 ef2d4c19, 12230 octets)
API GitHub, derniers commits de main : 81ec818 2026-09-19T19:22:41Z "replace recruitment placeholders with California brand and city visuals" ; 8d267bb 2026-09-19T19:20:10Z "move pricing starter badge to 20 leads" ; 864833f 2026-09-19T19:07:46Z "increase homepage vertical breathing room" (commit audité)
```

### E.6 Images

```
$ identify assets/favicon.png assets/logo-black.png assets/logo-black-narrow.png
favicon.png 32x32 PNG srgba 604B depth=8
logo-black.png 64x39 PNG srgba 1023B depth=8
logo-black-narrow.png 1024x1024 PNG srgba 124746B depth=8
$ curl prod : /assets/favicon.png 200 image/png 604o ; /favicon.ico 404 ; /apple-touch-icon.png 404 ; /assets/logo-black.png 200 image/png 1023o
```

Captures : docs/audit-total/screens/15/index-fr-900-apercu-partage.png (aperçus reconstitués home FR), docs/audit-total/screens/15/tarifs-900-apercu-partage.png (aperçus reconstitués tarifs), docs/audit-total/screens/15/index-fr-1200x630-base-visuel-og.png (hero de la home FR au format 1200x630, base de travail pour le designer), docs/audit-total/screens/15/og-image-fr-provisoire-1200x630.png (résultat de la commande de l'Annexe C).

## Annexe F : contenu proposé pour /llms.txt (fichier llms.txt à la racine du repo)

```
# Synthetic Swarm

> Synthetic Swarm fournit aux courtiers, mandataires et agents en assurance, en France, des fiches de prospection hebdomadaires : un dirigeant d'entreprise dont la situation vient de changer, son téléphone portable vérifié, son email, son profil LinkedIn et le signal daté qui explique pourquoi l'appeler maintenant. Abonnement mensuel résiliable à tout moment, de 89 € par mois (10 fiches par semaine) à 1 499 € par mois (200 fiches par semaine), sur mesure au-delà.

Faits essentiels :
- Clients : courtiers, mandataires et agents en assurance (B2B). Prospects livrés : dirigeants de TPE, PME, professions libérales et artisans, ciblés par métier, taille d'entreprise et zone géographique.
- Chaque fiche : nom et prénom du dirigeant, entreprise, portable vérifié (ligne fixe identifiée comme telle si elle seule existe), email, profil LinkedIn, signal daté (première embauche, création de société, changement de dirigeant, nouvel établissement, évolution juridique, croissance d'équipe, restructuration, changement de statut, ouverture d'un nouveau site, évolution de gouvernance).
- Exclusivité : une fiche livrée est réservée au client qui la reçoit. Livraison chaque semaine ; première livraison moins de 30 minutes après validation des critères.
- Prix par mois : 10 fiches par semaine 89 €, 20 fiches 169 €, 50 fiches 399 €, 100 fiches 789 €, 200 fiches 1 499 €, plus de 200 fiches sur mesure. Paiement par carte (Stripe), renouvellement mensuel, résiliation à tout moment depuis le compte.
- Société : Synthetic Swarm SAS, 15 rue de la Gare, 62690 Izel-lès-Hameau, France. SIREN 993 422 120. Créée en février 2026 par Axel (CEO) et Ilan (CTO). Premiers clients en France en juillet 2026. Équipe installée à San Francisco (Californie) depuis septembre 2026.
- Contact : contact@syntheticswarm.ai. Démo de 15 minutes : https://calendar.app.google/91k1Mpontca7NGea6. Espace client : https://app.syntheticswarm.ai/ui/
- Langues du site : français et anglais. Version détaillée : https://www.syntheticswarm.ai/llms-full.txt

## Pages en français
- [Accueil](https://www.syntheticswarm.ai/index-fr) : présentation, exemple de fiche, tarif.
- [Notre solution](https://www.syntheticswarm.ai/notre-solution) : ciblage, détection des changements, qualification, fiche prête à appeler.
- [Tarifs](https://www.syntheticswarm.ai/tarifs) : forfait unique, volume de 10 à 200 fiches par semaine et plus.
- [FAQ](https://www.syntheticswarm.ai/faq-fr) : fonctionnement, données livrées, exclusivité, délai, légalité de la prospection B2B.
- [À propos](https://www.syntheticswarm.ai/a-propos) : fondateurs et historique.
- [Nos clients](https://www.syntheticswarm.ai/clients)
- [Recrutement](https://www.syntheticswarm.ai/recrutement) : postes Sales France, Sales États-Unis, Tech / Ingénieur IA, Chief of Staff.
- [Médias](https://www.syntheticswarm.ai/medias)
- [Contact](https://www.syntheticswarm.ai/contact-fr)
- [Mentions légales](https://www.syntheticswarm.ai/mentions-legales), [Politique de confidentialité](https://www.syntheticswarm.ai/confidentialite), [Conditions générales de vente](https://www.syntheticswarm.ai/conditions), [Droit d'opposition](https://www.syntheticswarm.ai/opposition)

## Pages in English
- [Home](https://www.syntheticswarm.ai/) : overview, sample profile, pricing.
- [Our solution](https://www.syntheticswarm.ai/our-solution) : targeting, change detection, qualification, ready-to-call profile.
- [Pricing](https://www.syntheticswarm.ai/pricing) : one plan, 10 to 200+ leads per week.
- [FAQ](https://www.syntheticswarm.ai/faq)
- [About](https://www.syntheticswarm.ai/about), [Customers](https://www.syntheticswarm.ai/customers), [Careers](https://www.syntheticswarm.ai/careers), [Media](https://www.syntheticswarm.ai/media), [Contact](https://www.syntheticswarm.ai/contact)
- [Legal notice](https://www.syntheticswarm.ai/legal-notice), [Privacy policy](https://www.syntheticswarm.ai/privacy), [Terms of sale](https://www.syntheticswarm.ai/terms), [Opt out](https://www.syntheticswarm.ai/opt-out)

## Optional
- [Plan du site](https://www.syntheticswarm.ai/sitemap.xml)
```

## Annexe G : contenu proposé pour /llms-full.txt (fichier llms-full.txt à la racine du repo)

```
# Synthetic Swarm : prospection en assurance sur signaux datés

Version détaillée pour les assistants IA. Source : https://www.syntheticswarm.ai (pages françaises et anglaises). Contact : contact@syntheticswarm.ai.

## En une phrase
Synthetic Swarm repère les dirigeants d'entreprise dont la situation vient de changer et livre chaque semaine aux courtiers, mandataires et agents en assurance leur nom, leur téléphone, leur email, leur profil LinkedIn et la raison de les appeler.

## Pour qui
- Clients : courtiers en assurance, mandataires en assurance, agents (activité B2B). Le site existe en français et en anglais ; les premiers clients sont des professionnels de l'assurance en France (juillet 2026).
- Prospects livrés : dirigeants d'entreprise (TPE, PME, professions libérales, artisans) ciblés selon le métier, la taille d'entreprise et la zone géographique définis par le client. Exemples affichés sur le site : cabinet d'architecture, cabinet dentaire, pharmacie, entreprise du BTP, cabinet comptable, cabinet d'avocats, clinique vétérinaire, garage automobile, agence immobilière, commerce spécialisé.

## Comment ça marche
1. Décrivez qui vous cherchez : activité, zone, taille, décideur (exemple du site : cabinets d'architectes de 2 à 20 salariés en Île-de-France, avec les coordonnées du dirigeant).
2. Synthetic Swarm repère ce qui change dans les entreprises de la cible (surveillance continue).
3. Seuls les changements qui créent un besoin en assurance sont conservés.
4. Vous recevez une personne et une raison d'appeler : la fiche prête à appeler.

## Changements détectés (signaux)
Première embauche, création de société, changement de dirigeant, nouvel établissement, évolution juridique, croissance d'équipe, restructuration, changement de statut, ouverture d'un nouveau site, évolution de gouvernance. Exemples de besoins associés : un libéral qui passe en SEL doit revoir son statut social et sa prévoyance ; une société qui embauche son premier salarié bascule sous la collective ; un artisan qui passe d'auto-entrepreneur en société a besoin d'une décennale.

## Contenu d'une fiche
- Nom et prénom du dirigeant, entreprise.
- Téléphone portable vérifié (ligne fixe identifiée comme telle si elle seule existe ; une fiche sans moyen de contact joignable est remplacée).
- Email et profil LinkedIn.
- Le signal daté : le changement de situation détecté, sa date et pourquoi il justifie un appel maintenant.
- Exclusivité : une fiche livrée est réservée au client qui la reçoit et n'est transmise à aucun autre client.
- Livraison chaque semaine ; première livraison moins de 30 minutes après validation des critères.
- Si les fiches ne correspondent pas à la cible : le client contacte l'équipe, qui ajuste immédiatement.

## Tarifs (abonnement mensuel, prix affichés en euros sur https://www.syntheticswarm.ai/tarifs)
- 10 fiches par semaine : 89 € par mois
- 20 fiches par semaine : 169 € par mois
- 50 fiches par semaine : 399 € par mois
- 100 fiches par semaine : 789 € par mois
- 200 fiches par semaine : 1 499 € par mois
- Plus de 200 fiches par semaine : offre sur mesure, sur rendez-vous
Inclus à tous les paliers : fiches vérifiées livrées chaque semaine, signal daté expliquant pourquoi appeler maintenant, téléphone, email et profil LinkedIn, ciblage selon les critères du client (métier, taille, zone géographique).
Conditions (https://www.syntheticswarm.ai/conditions) : souscription en ligne, paiement mensuel par carte bancaire via Stripe, renouvellement automatique chaque mois, résiliation à tout moment depuis le compte client (les sommes de la période commencée restent dues). Les fiches sont réservées à la prospection professionnelle du client ; revente, location, publication ou transmission à des tiers interdites. Aucun rendez-vous, vente ou taux de conversion n'est garanti. Droit français.

## Questions fréquentes (https://www.syntheticswarm.ai/faq-fr)
Comment ça marche concrètement ? Vous nous donnez vos critères de ciblage : métier, taille d'entreprise, secteur géographique. Nous surveillons en continu pour détecter les dirigeants dont un besoin en assurance apparaît. Chaque semaine, vous recevez des fiches vérifiées, avec le signal daté qui explique pourquoi appeler maintenant.
Quelles informations j'obtiens ? Nom et prénom du dirigeant, téléphone portable (et ligne fixe si disponible), email et profil LinkedIn. Plus la raison de l'appel : le changement de situation que nous avons détecté, avec sa date.
C'est quoi un signal, concrètement ? Un changement de situation qui crée un besoin en assurance, et qui est daté. Un libéral qui vient de passer en SEL doit revoir son statut social et sa prévoyance. Une société qui vient d'embaucher son premier salarié bascule sous la collective. Un artisan qui passe d'auto-entrepreneur en société a besoin d'une décennale. Vous n'appelez pas quelqu'un au hasard, vous appelez quelqu'un qui a un sujet ouvert cette semaine.
Le numéro est-il celui du dirigeant ? Oui. Nous livrons le portable du dirigeant, pas le standard. Quand seule la ligne fixe existe, elle est identifiée comme telle, et une fiche sans moyen de contact joignable est remplacée.
Puis-je préciser les métiers et ma zone géographique ? Oui. Vos critères de ciblage comprennent le métier, la taille d'entreprise et la zone géographique.
Est-ce que d'autres reçoivent les mêmes fiches que moi ? Non. Une fiche livrée vous est réservée, elle n'est transmise à aucun autre client.
À quelle fréquence les fiches sont-elles envoyées ? Vous recevez des fiches vérifiées chaque semaine, avec le signal daté qui explique pourquoi appeler maintenant.
Combien de temps avant ma première livraison ? Moins de 30 minutes après validation de vos critères.
Et si les fiches ne correspondent pas à ce que je cherche ? Vous nous contactez et nous ajustons immédiatement. Notre travail est que vous cibliez exactement vos clients, pas de vous livrer du volume.
Est-ce que j'ai le droit d'appeler ces personnes ? Oui. La prospection téléphonique entre professionnels reste autorisée quand l'offre proposée est en rapport avec l'activité de la personne appelée. Le consentement préalable instauré le 11 août 2026 vise le démarchage des consommateurs, pas le B2B.

## L'entreprise
- Synthetic Swarm SAS, 15 rue de la Gare, 62690 Izel-lès-Hameau, France. SIREN / RCS : 993 422 120.
- Février 2026 : création de Synthetic Swarm. Juillet 2026 : premiers clients en France, dans l'assurance. Septembre 2026 : installation de l'équipe à San Francisco (Californie) pour construire plus vite. Devise affichée : « Construit en France. Accéléré à San Francisco. »
- Fondateurs : Axel, CEO (entrepreneur ; première entreprise lancée à 19 ans et développée jusqu'à plus de 1 M€ de chiffre d'affaires annuel ; LinkedIn : https://www.linkedin.com/in/axel-carron/) et Ilan, CTO (études en finance, CNP Assurances, puis Chief of Staff chez Hyperstack ; LinkedIn : https://www.linkedin.com/in/isainteagathe/).
- Clients et témoignages : la page https://www.syntheticswarm.ai/clients indique que les premiers témoignages arrivent bientôt.
- Médias : aucune publication référencée pour le moment (https://www.syntheticswarm.ai/medias). Contact médias : contact@syntheticswarm.ai.
- Recrutement (https://www.syntheticswarm.ai/recrutement) : Sales France ; Sales États-Unis ; Tech / Ingénieur IA (France et États-Unis) ; Chief of Staff (France et États-Unis) ; candidatures spontanées bienvenues. Petite équipe, travail direct avec les fondateurs.

## Contact et accès
- Email : contact@syntheticswarm.ai (questions, partenariats, médias, candidatures, droit d'opposition).
- Formulaire de contact : https://www.syntheticswarm.ai/contact-fr
- Réserver une démo de 15 minutes avec l'équipe : https://calendar.app.google/91k1Mpontca7NGea6
- Espace client (connexion) : https://app.syntheticswarm.ai/ui/
- Newsletter : inscription en pied de page de chaque page du site.

## Données personnelles et droit d'opposition
- Responsable du traitement : Synthetic Swarm SAS, contact@syntheticswarm.ai (https://www.syntheticswarm.ai/confidentialite).
- Données traitées : nom, prénom, coordonnées professionnelles, profil LinkedIn public et informations liées à l'activité ou aux changements de situation de l'entreprise ; issues de sources publiques et professionnelles ; transmises aux clients professionnels et aux prestataires nécessaires au service ; conservées pendant la durée nécessaire.
- Droits : accès, rectification, effacement, limitation, opposition, en écrivant à contact@syntheticswarm.ai. Un dirigeant qui souhaite le retrait de ses coordonnées des fiches écrit à contact@syntheticswarm.ai (https://www.syntheticswarm.ai/opposition).
- Légalité de la prospection (position exprimée dans la FAQ du site) : la prospection téléphonique entre professionnels reste autorisée en France quand l'offre est en rapport avec l'activité de la personne appelée ; le consentement préalable instauré le 11 août 2026 vise le démarchage des consommateurs, pas le B2B.

## Pages du site
FR : https://www.syntheticswarm.ai/index-fr (accueil), /notre-solution, /tarifs, /faq-fr, /a-propos, /clients, /recrutement, /medias, /contact-fr, /mentions-legales, /confidentialite, /conditions, /opposition.
EN : https://www.syntheticswarm.ai/ (home), /our-solution, /pricing, /faq, /about, /customers, /careers, /media, /contact, /legal-notice, /privacy, /terms, /opt-out.

## English summary
Synthetic Swarm (Synthetic Swarm SAS, a French company registered in Izel-lès-Hameau, France, with its team in San Francisco since September 2026) delivers every week to insurance brokers and agents profiles of business owners whose situation just changed: name, verified mobile number, email, LinkedIn profile and a dated signal (first hire, company creation, executive change, new establishment, legal structure change, team growth, restructuring, status change, new location, governance change) explaining why to call now. Monthly subscription, cancel anytime: 10 leads per week 89 €, 20 leads 169 €, 50 leads 399 €, 100 leads 789 €, 200 leads 1,499 €, more than 200 leads on request. Each delivered profile is exclusive to the client. First delivery less than 30 minutes after the targeting criteria are approved. Contact: contact@syntheticswarm.ai. Demo: https://calendar.app.google/91k1Mpontca7NGea6.
```

## Annexe H : politique robots.txt envers les robots IA (décision fondateurs)

État actuel (91 octets, identique en production) : `User-agent: *` / `Allow: /` / `Disallow: /api/` / `Sitemap: https://www.syntheticswarm.ai/sitemap.xml`. Tout robot, y compris d'entraînement, est autorisé sur tout le site sauf /api/. Les règles robots.txt sont déclaratives : elles s'appliquent aux robots qui les respectent (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Google-Extended, CCBot, Applebot-Extended, Bytespider, meta-externalagent annoncent les respecter).

Option 1, recommandée pour un site vitrine qui veut être trouvé et cité par les assistants sans alimenter l'entraînement des modèles : garder l'accès aux robots de recherche et de réponse (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Googlebot, Bingbot restent sous `User-agent: *`) et interdire les robots d'entraînement. Contenu exact de robots.txt :

```
User-agent: *
Allow: /
Disallow: /api/

# Robots dédiés à l'entraînement de modèles : interdits (décision fondateurs, 2026-09)
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: meta-externalagent
Disallow: /

Sitemap: https://www.syntheticswarm.ai/sitemap.xml
```

Option 2, tout autoriser explicitement (présence maximale dans les modèles et les moteurs de réponse, au prix de la réutilisation du contenu pour l'entraînement) :

```
User-agent: *
Allow: /
Disallow: /api/

# Robots IA explicitement autorisés (décision fondateurs, 2026-09)
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Google-Extended
User-agent: CCBot
Allow: /
Disallow: /api/

Sitemap: https://www.syntheticswarm.ai/sitemap.xml
```

Dans les deux options, /llms.txt et /llms-full.txt (Annexes F et G) restent accessibles à tous les robots. Le choix est une décision des fondateurs : aucune des deux options n'est un défaut technique.
