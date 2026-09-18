# Volet 2 : liens et navigation

Méthode : crawl des 26 URL de `docs/audit-site/urls.txt` sur le serveur local à sémantique Vercel (http://127.0.0.1:4173), extraction de tous les `href`, `src`, `action`, `srcset`, `content` (meta) et `url()` des 14 feuilles CSS chargées (1333 références, dont 1005 internes et 8 URL externes distinctes), requêtes sans suivi de redirection, contrôle des ancres, du sélecteur EN/FR, diff header/footer normalisés, rendu Playwright (Chromium, 390 px) pour le menu mobile généré par `mobile-menu.js`, vérification des externes par curl (HEAD puis GET puis GET -L) et sondes sur https://www.syntheticswarm.ai. Scripts : `tools/volet2/crawl.js`, `tools/volet2/mobile.js` (dossier scratchpad, hors repo).

| Sévérité | Page(s) | Fichier:ligne | Constat | Correction exacte |
| --- | --- | --- | --- | --- |
| MAJEUR | Toutes (26) | Aucun fichier `404.html` (`ls 404.html` : No such file ; `git ls-files \| grep 404` : vide) ; `scripts/dev-server.js:83-86` sert `404.html` s'il existe | Sans `404.html`, la production sert la page 404 générique de Vercel : `curl -H 'Accept: text/html' https://www.syntheticswarm.ai/nexistepas` => `404`, `text/html`, 7550 octets, `<html lang=en>`, `<title>404: NOT_FOUND</title>`, texte « This page doesn't exist. It may have been moved, removed, or never existed. Go back ... View Documentation », un seul `href` : `https://vercel.com/docs/errors/not_found`. Ni header du site, ni lien de retour, anglais uniquement. En local : `curl -i http://127.0.0.1:4173/nexistepas` => `404 Not Found`, `text/plain`, corps `404: NOT_FOUND`. | Créer `404.html` à la racine avec le contenu du bloc de code A ci-dessous (header FR de `index-fr.html:49-80` réutilisé, classes existantes `content-page`, `page-intro`, `page-kicker`, `page-actions`, `page-button`, `page-button--secondary` de `site-pages.css:22-39`). |
| MAJEUR | /customers, /clients, /media, /medias (et les 26 pages porteuses des liens désactivés) | `sitemap.xml:89`, `:95`, `:101`, `:107` ; liens désactivés : `index.html:59`, `index.html:224` (x2), même motif sur les 26 pages (liste complète section « Liens désactivés ») ; seuls liens entrants : `customers.html:43-44`, `clients.html:43-44`, `media.html:42-43`, `medias.html:42-43` (sélecteur de langue) | 78 `<span class="nav-disabled" role="link" aria-disabled="true">` (26 « Media/Médias » dans le header, 26 « Customers/Nos clients » et 26 « Media/Médias » dans le footer), alors que les 4 pages cibles existent (`customers.html`, `clients.html`, `media.html`, `medias.html`), répondent 200 en local et en production (`curl https://www.syntheticswarm.ai/customers` => 200, idem /clients, /media, /medias) et sont déclarées dans `sitemap.xml`. Aucun lien `<a>` du site ne mène à ces pages hors le sélecteur de langue de la page elle-même et de sa jumelle (2 liens entrants chacune, contre 15 à 31 pour les autres pages). Pages orphelines indexables : un prospect venant de Google atterrit sur une page à état vide (`assets/data/customers.json` : `"customers": []`, README : « Careers and Media intentionally have empty states »). | Tant que les pages sont vides : supprimer les 4 blocs `<url>...</url>` de `sitemap.xml` (lignes 88-93, 94-99, 100-105, 106-111) et ajouter dans le `<head>` de `customers.html`, `clients.html`, `media.html`, `medias.html` la ligne `<meta name="robots" content="noindex, follow">`. Quand elles auront du contenu : dans `scripts/site_layout.py`, fonction `company_link`, supprimer la ligne `if key in ['media','customers']: return f'<span class="nav-disabled" role="link" aria-disabled="true">{label}</span>'`, lancer `python3 scripts/site_layout.py`, puis supprimer `tests/site.test.cjs:39` (`assert.match(footer, /aria-disabled="true">(?:Media\|Médias)<\/span>/);`) et retirer `clients\|customers` du motif de `tests/site.test.cjs:36`. |
| MINEUR | Toutes (26) | `index.html:52-61` (nav EN), `index-fr.html:52-61` (nav FR) ; générateur `scripts/site_layout.py` fonction `header` : `for k in ['solution','pricing']` ; verrou de test `tests/site.test.cjs:36-37` | La navigation principale ne liste que Solution, Tarifs et le menu « À propos » (Qui sommes-nous, Recrutement, Médias désactivé). FAQ et Contact sont absents du header sur les 26 pages (jeu de liens nav EN : `/our-solution`, `/pricing`, `/about`, `/careers` ; FR : `/notre-solution`, `/tarifs`, `/a-propos`, `/recrutement`). Ils ne sont atteignables que par le footer (présent sur les 26 pages). Choix produit délibéré : `tests/site.test.cjs:36` interdit `href="/faq"` et `:37` interdit `href="/contact"` dans la nav du header. | Si le critère « FAQ et Contact dans le header » est retenu : dans `scripts/site_layout.py`, fonction `header`, remplacer `for k in ['solution','pricing'])` par `for k in ['solution','pricing','faq','contact'])`, lancer `python3 scripts/site_layout.py`, puis supprimer les lignes `tests/site.test.cjs:36` et `tests/site.test.cjs:37`. Sinon : aucune action, consigner la décision. |
| MINEUR | 13 pages EN | `index.html:51` (logo header `href="/"`), `index.html:222` (logo footer `href="/"`), même motif sur les 13 pages EN ; `vercel.json:17-35` (règle 2 : `x-vercel-ip-country` = FR et cookie `ss-language=en` absent) | Pour un visiteur géolocalisé en France sans cookie `ss-language`, l'URL `/` redirige en 307 vers `/index-fr` : `curl -H 'x-vercel-ip-country: FR' http://127.0.0.1:4173/` => `307 /index-fr`. Un prospect arrivé directement sur une page EN (par exemple `/our-solution` depuis Google) qui clique sur le logo bascule en français sans l'avoir demandé. Le lien EN du sélecteur n'est pas concerné (`mobile-menu.js:111-117` pose le cookie avant la navigation : avec `Cookie: ss-language=en` => 200). Les balises `hreflang="en"` et `x-default` qui pointent vers `https://www.syntheticswarm.ai/` subissent la même redirection pour un robot géolocalisé FR. | Dans `mobile-menu.js`, après la ligne 7 (`const isFr = ...`), ajouter : `if (!/(?:^\|; )ss-language=/.test(document.cookie)) document.cookie = \`ss-language=${isFr ? 'fr' : 'en'}; Path=/; Max-Age=31536000; SameSite=Lax; Secure\`;` (la langue de la page consultée devient la préférence implicite tant que le visiteur n'a rien choisi ; à valider avec le volet juridique cookies). |

## Bloc de code A : 404.html bilingue minimal proposé

Header copié de `index-fr.html:49-80` (seuls les `href` du sélecteur de langue pointent vers les deux accueils, faute d'équivalent de page) ; feuilles et scripts identiques à `mentions-legales.html:13-24`. Vercel sert automatiquement un `404.html` placé à la racine d'un projet statique ; le serveur local le fait déjà (`scripts/dev-server.js:83-86`). À vérifier sur un déploiement de prévisualisation avant mise en production.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#fcfbf8">
  <meta name="robots" content="noindex">
  <title>Page introuvable | Page not found | Synthetic Swarm</title>
  <link rel="icon" href="/assets/favicon.png" type="image/png">
  <link rel="stylesheet" href="/styles.css?v=motion-1">
  <link rel="stylesheet" href="/site-pages.css?v=persistent-header-20260918">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
</head>
<body>
  <a href="#main" class="skip-link">Aller au contenu</a>
  <header class="header">
  <div class="header-inner">
    <a href="/index-fr" class="logo"><img src="/assets/logo-black-narrow.png" alt="" class="logo-icon" width="20" height="20">Synthetic Swarm</a>
    <nav class="nav-links" aria-label="Navigation principale">
      <a href="/notre-solution">Notre solution</a>
<a href="/tarifs">Tarifs</a>
      <div class="about-menu">
        <button type="button" class="nav-link-dropdown shared-chevron-trigger" data-disclosure-trigger aria-expanded="false" aria-controls="header-about-options">À propos <svg class="dropdown-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M2 3.5 5 6.5 8 3.5Z"/></svg></button>
        <div class="about-menu-panel" id="header-about-options" data-disclosure-panel hidden><a href="/a-propos">Qui sommes-nous</a>
<a href="/recrutement">Recrutement</a>
<span class="nav-disabled" role="link" aria-disabled="true">Médias</span></div>
      </div>
    </nav>
    <div class="nav-actions">
      <div class="language-menu">
        <button type="button" class="language-trigger shared-chevron-trigger" data-disclosure-trigger aria-expanded="false" aria-controls="header-language-options" aria-label="Choisir la langue">FR <svg class="dropdown-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M2 3.5 5 6.5 8 3.5Z"/></svg></button>
        <div class="language-panel" id="header-language-options" data-disclosure-panel hidden>
          <a href="/index-fr" data-lang="fr" lang="fr" aria-current="true">FR</a>
          <a href="/" data-lang="en" lang="en">EN</a>
        </div>
      </div>
      <a href="https://app.syntheticswarm.ai/ui/" class="btn-login header-action" target="_blank" rel="noopener noreferrer">Connexion</a>
      <div class="demo-booking">
  <button type="button" class="btn-get-started header-action" data-book-demo data-disclosure-trigger aria-expanded="false" aria-controls="header-demo-options">Démo</button>
  <div class="demo-booking-popover" id="header-demo-options" data-disclosure-panel hidden>
    <a class="demo-booking-person" href="https://calendar.app.google/91k1Mpontca7NGea6" target="_blank" rel="noopener noreferrer"><img class="demo-booking-avatar" src="/assets/team/axel-ceo.png" alt="" width="38" height="38"><span class="demo-booking-person-copy"><strong>Axel</strong><span>CEO</span></span><span aria-hidden="true">↗</span></a>
    <a class="demo-booking-person" href="https://calendar.app.google/AWQX2bxp8cnqtsaJ9" target="_blank" rel="noopener noreferrer"><img class="demo-booking-avatar" src="/assets/team/ilan-cto.jpg" alt="" width="38" height="38"><span class="demo-booking-person-copy"><strong>Ilan</strong><span>CTO</span></span><span aria-hidden="true">↗</span></a>
  </div>
</div>
    </div>
  </div>
</header>
  <main id="main" class="content-page">
    <section class="page-intro">
      <span class="page-kicker">Erreur 404</span>
      <h1>Cette page n'existe pas.</h1>
      <p>L'adresse est peut-être erronée, ou la page a été déplacée. Retrouvez l'essentiel depuis l'accueil.</p>
      <div class="page-actions">
        <a class="page-button" href="/index-fr">Retour à l'accueil</a>
        <a class="page-button page-button--secondary" href="/contact-fr">Nous contacter</a>
      </div>
    </section>
    <section class="page-intro" lang="en">
      <span class="page-kicker">Error 404</span>
      <h2>This page does not exist.</h2>
      <p>The address may be wrong, or the page has moved. Start again from the home page.</p>
      <div class="page-actions">
        <a class="page-button" href="/">Back to home</a>
        <a class="page-button page-button--secondary" href="/contact">Contact us</a>
      </div>
    </section>
  </main>
  <script src="/mobile-menu.js?v=motion-1"></script>
</body>
</html>
```

## Vérifications sans écart (preuves)

- Les 26 pages répondent `200` sans redirection sur le serveur local ; le corps servi est identique au fichier sur disque (`crawl.js` : `PAGES /=200 ... /opposition=200`).
- 1005 références internes : 1003 réponses `200`, 0 réponse `3xx`, 2 réponses `404` toutes deux sur `form action="/api/contact"` (`contact.html:58`, `contact-fr.html:58`). Faux positif du serveur local, qui ne simule pas les fonctions `api/` : en production `curl -i https://www.syntheticswarm.ai/api/contact` => `405`, `allow: POST`, corps `{"ok":false,"error":"method"}` (`api/contact.js:7`), la fonction existe et refuse le GET comme prévu.
- Aucune URL interne en `.html`, avec slash final ou héritée (`/pricing-fr`, `/lead-magnets`) n'est référencée par les pages ; ces formes redirigent bien en 308 (`/index.html` => `/`, `/tarifs/` => `/tarifs`, `/pricing-fr` => `/tarifs`).
- `href="#"`, `href=""`, `href="javascript:"` : 0 occurrence dans les 26 fichiers (`grep -n -i 'href="#"\|href=""\|href="javascript' *.html` : vide) et 0 après rendu JavaScript sur 26 pages (Playwright, `badHref=0`).
- Ancres : 26 occurrences de `href="#main"` (skip link), chaque page possède `<main id="main">` (`grep -L 'id="main"' *.html` : vide). Aucun autre lien avec fragment (`#`) dans les pages.
- Ressources CSS : 14 feuilles chargées, toutes `200` ; un seul `url()` (`styles.css:2171`, URI `data:`). `fetch('/assets/data/customers.json')` de `customers.js:55` => `200 application/json`.
- Menu mobile (clone JS de `mobile-menu.js:27-32`) : sur les 26 pages, les `href` du menu mobile sont strictement identiques à ceux du header (`sameLinks=true`), les ids sont préfixés `mobile-` sans doublon (`dupIds=[]`), tous les `aria-controls` résolvent (`badIds=[]`), et les deux liens `data-lang` du clone portent les mêmes cibles et le même `aria-current="true"` que le header.
- Footer : les 4 liens légaux (`/legal-notice`, `/privacy`, `/terms`, `/opt-out` ; `/mentions-legales`, `/confidentialite`, `/conditions`, `/opposition`) sont présents dans le footer des 26 pages (`footer legal complete on all pages: true`). Contact et FAQ sont présents dans le footer des 26 pages.
- CTA : les 56 liens « Connexion / Log in / Se connecter » et les 4 « Choisir ce forfait / Choose this plan » (`index-fr.html:183`, `index.html:183`, `pricing.html:101`, `tarifs.html:101`) pointent vers `https://app.syntheticswarm.ai/ui/` qui répond `200` en HEAD et GET ; `pricing.js:40-46` ne modifie pas le `href`, seulement `data-leads` et `data-price`. Les 132 liens de réservation de démo (2 calendriers Google) répondent `302` puis `200`.

## Liens désactivés `<span role="link" aria-disabled="true">`

78 occurrences sur 26 pages (3 par page) : 1 « Media/Médias » dans le header (panneau « À propos ») et 2 dans le footer (« Customers/Nos clients », « Media/Médias »). Pages cibles pourtant existantes et dans le sitemap : `customers.html`, `clients.html`, `media.html`, `medias.html`.

| Page | Header | Footer (2 spans sur la même ligne) |
| --- | --- | --- |
| / | index.html:59 | index.html:224 |
| /index-fr | index-fr.html:59 | index-fr.html:224 |
| /our-solution | our-solution.html:38 | our-solution.html:95 |
| /notre-solution | notre-solution.html:38 | notre-solution.html:95 |
| /pricing | pricing.html:38 | pricing.html:134 |
| /tarifs | tarifs.html:38 | tarifs.html:134 |
| /faq | faq.html:124 | faq.html:161 |
| /faq-fr | faq-fr.html:124 | faq-fr.html:161 |
| /about | about.html:57 | about.html:106 |
| /a-propos | a-propos.html:57 | a-propos.html:106 |
| /careers | careers.html:37 | careers.html:75 |
| /recrutement | recrutement.html:37 | recrutement.html:75 |
| /contact | contact.html:36 | contact.html:62 |
| /contact-fr | contact-fr.html:36 | contact-fr.html:62 |
| /customers | customers.html:36 | customers.html:70 |
| /clients | clients.html:36 | clients.html:70 |
| /media | media.html:35 | media.html:63 |
| /medias | medias.html:35 | medias.html:63 |
| /legal-notice | legal-notice.html:36 | legal-notice.html:68 |
| /mentions-legales | mentions-legales.html:36 | mentions-legales.html:68 |
| /privacy | privacy.html:36 | privacy.html:70 |
| /confidentialite | confidentialite.html:36 | confidentialite.html:70 |
| /terms | terms.html:36 | terms.html:86 |
| /conditions | conditions.html:37 | conditions.html:87 |
| /opt-out | opt-out.html:36 | opt-out.html:67 |
| /opposition | opposition.html:36 | opposition.html:67 |

## Tableau des 26 vérifications EN/FR

Source : liens `data-lang` du panneau `language-panel` du header (et clone identique dans le menu mobile). `aria-current="true"` est porté par le lien de la langue courante sur les 26 pages, jamais par l'autre. `<html lang>` correspond à la langue de la page sur les 26 pages.

| Page | html lang | Lien EN trouvé | Lien FR trouvé | Attendu EN / FR | Résultat |
| --- | --- | --- | --- | --- | --- |
| / | en | / (aria-current) | /index-fr | / et /index-fr | OK |
| /index-fr | fr | / | /index-fr (aria-current) | / et /index-fr | OK |
| /our-solution | en | /our-solution (aria-current) | /notre-solution | /our-solution et /notre-solution | OK |
| /notre-solution | fr | /our-solution | /notre-solution (aria-current) | /our-solution et /notre-solution | OK |
| /pricing | en | /pricing (aria-current) | /tarifs | /pricing et /tarifs | OK |
| /tarifs | fr | /pricing | /tarifs (aria-current) | /pricing et /tarifs | OK |
| /faq | en | /faq (aria-current) | /faq-fr | /faq et /faq-fr | OK |
| /faq-fr | fr | /faq | /faq-fr (aria-current) | /faq et /faq-fr | OK |
| /about | en | /about (aria-current) | /a-propos | /about et /a-propos | OK |
| /a-propos | fr | /about | /a-propos (aria-current) | /about et /a-propos | OK |
| /careers | en | /careers (aria-current) | /recrutement | /careers et /recrutement | OK |
| /recrutement | fr | /careers | /recrutement (aria-current) | /careers et /recrutement | OK |
| /contact | en | /contact (aria-current) | /contact-fr | /contact et /contact-fr | OK |
| /contact-fr | fr | /contact | /contact-fr (aria-current) | /contact et /contact-fr | OK |
| /customers | en | /customers (aria-current) | /clients | /customers et /clients | OK |
| /clients | fr | /customers | /clients (aria-current) | /customers et /clients | OK |
| /media | en | /media (aria-current) | /medias | /media et /medias | OK |
| /medias | fr | /media | /medias (aria-current) | /media et /medias | OK |
| /legal-notice | en | /legal-notice (aria-current) | /mentions-legales | /legal-notice et /mentions-legales | OK |
| /mentions-legales | fr | /legal-notice | /mentions-legales (aria-current) | /legal-notice et /mentions-legales | OK |
| /privacy | en | /privacy (aria-current) | /confidentialite | /privacy et /confidentialite | OK |
| /confidentialite | fr | /privacy | /confidentialite (aria-current) | /privacy et /confidentialite | OK |
| /terms | en | /terms (aria-current) | /conditions | /terms et /conditions | OK |
| /conditions | fr | /terms | /conditions (aria-current) | /terms et /conditions | OK |
| /opt-out | en | /opt-out (aria-current) | /opposition | /opt-out et /opposition | OK |
| /opposition | fr | /opt-out | /opposition (aria-current) | /opt-out et /opposition | OK |

26 / 26 OK, 0 écart.

## Diffs header/footer

Normalisation : espaces réduits, `aria-current="page"` et `aria-current="true"` retirés, classe `active` retirée, une balise par ligne. Référence : `index.html` pour les 13 pages EN, `index-fr.html` pour les 13 pages FR. Le menu mobile n'est pas dupliqué dans le HTML (il est cloné par `mobile-menu.js:29-30` à partir du header) ; sa conformité est vérifiée dans la section « Vérifications sans écart ».

Footers : 0 diff. Les 13 footers EN ont la même empreinte MD5, les 13 footers FR aussi (`md5sum hf-*.footer.txt | uniq -c` => `13` et `13`).

Headers : les 24 diffs non vides ci-dessous portent uniquement sur les deux `href` du sélecteur de langue (lignes 27-28 du header normalisé), qui pointent par construction vers la paire de la page courante et non vers l'accueil. C'est le comportement attendu. Après neutralisation de ces deux `href` (`sed 's#<a href="[^"]*" data-lang=#<a href="LANG" data-lang=#'`), les 26 headers se réduisent à 2 empreintes MD5 (13 EN identiques, 13 FR identiques) : 0 diff résiduel.

```
=== HEADER a-propos.html vs index-fr.html ===
27,28c27,28
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
< <a href="/" data-lang="en" lang="en">EN</a>
---
> <a href="/a-propos" data-lang="fr" lang="fr">FR</a>
> <a href="/about" data-lang="en" lang="en">EN</a>
=== HEADER about.html vs index.html ===
27,28c27,28
< <a href="/" data-lang="en" lang="en">EN</a>
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
---
> <a href="/about" data-lang="en" lang="en">EN</a>
> <a href="/a-propos" data-lang="fr" lang="fr">FR</a>
=== HEADER careers.html vs index.html ===
27,28c27,28
< <a href="/" data-lang="en" lang="en">EN</a>
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
---
> <a href="/careers" data-lang="en" lang="en">EN</a>
> <a href="/recrutement" data-lang="fr" lang="fr">FR</a>
=== HEADER clients.html vs index-fr.html ===
27,28c27,28
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
< <a href="/" data-lang="en" lang="en">EN</a>
---
> <a href="/clients" data-lang="fr" lang="fr">FR</a>
> <a href="/customers" data-lang="en" lang="en">EN</a>
=== HEADER conditions.html vs index-fr.html ===
27,28c27,28
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
< <a href="/" data-lang="en" lang="en">EN</a>
---
> <a href="/conditions" data-lang="fr" lang="fr">FR</a>
> <a href="/terms" data-lang="en" lang="en">EN</a>
=== HEADER confidentialite.html vs index-fr.html ===
27,28c27,28
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
< <a href="/" data-lang="en" lang="en">EN</a>
---
> <a href="/confidentialite" data-lang="fr" lang="fr">FR</a>
> <a href="/privacy" data-lang="en" lang="en">EN</a>
=== HEADER contact-fr.html vs index-fr.html ===
27,28c27,28
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
< <a href="/" data-lang="en" lang="en">EN</a>
---
> <a href="/contact-fr" data-lang="fr" lang="fr">FR</a>
> <a href="/contact" data-lang="en" lang="en">EN</a>
=== HEADER contact.html vs index.html ===
27,28c27,28
< <a href="/" data-lang="en" lang="en">EN</a>
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
---
> <a href="/contact" data-lang="en" lang="en">EN</a>
> <a href="/contact-fr" data-lang="fr" lang="fr">FR</a>
=== HEADER customers.html vs index.html ===
27,28c27,28
< <a href="/" data-lang="en" lang="en">EN</a>
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
---
> <a href="/customers" data-lang="en" lang="en">EN</a>
> <a href="/clients" data-lang="fr" lang="fr">FR</a>
=== HEADER faq-fr.html vs index-fr.html ===
27,28c27,28
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
< <a href="/" data-lang="en" lang="en">EN</a>
---
> <a href="/faq-fr" data-lang="fr" lang="fr">FR</a>
> <a href="/faq" data-lang="en" lang="en">EN</a>
=== HEADER faq.html vs index.html ===
27,28c27,28
< <a href="/" data-lang="en" lang="en">EN</a>
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
---
> <a href="/faq" data-lang="en" lang="en">EN</a>
> <a href="/faq-fr" data-lang="fr" lang="fr">FR</a>
=== HEADER legal-notice.html vs index.html ===
27,28c27,28
< <a href="/" data-lang="en" lang="en">EN</a>
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
---
> <a href="/legal-notice" data-lang="en" lang="en">EN</a>
> <a href="/mentions-legales" data-lang="fr" lang="fr">FR</a>
=== HEADER media.html vs index.html ===
27,28c27,28
< <a href="/" data-lang="en" lang="en">EN</a>
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
---
> <a href="/media" data-lang="en" lang="en">EN</a>
> <a href="/medias" data-lang="fr" lang="fr">FR</a>
=== HEADER medias.html vs index-fr.html ===
27,28c27,28
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
< <a href="/" data-lang="en" lang="en">EN</a>
---
> <a href="/medias" data-lang="fr" lang="fr">FR</a>
> <a href="/media" data-lang="en" lang="en">EN</a>
=== HEADER mentions-legales.html vs index-fr.html ===
27,28c27,28
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
< <a href="/" data-lang="en" lang="en">EN</a>
---
> <a href="/mentions-legales" data-lang="fr" lang="fr">FR</a>
> <a href="/legal-notice" data-lang="en" lang="en">EN</a>
=== HEADER notre-solution.html vs index-fr.html ===
27,28c27,28
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
< <a href="/" data-lang="en" lang="en">EN</a>
---
> <a href="/notre-solution" data-lang="fr" lang="fr">FR</a>
> <a href="/our-solution" data-lang="en" lang="en">EN</a>
=== HEADER opposition.html vs index-fr.html ===
27,28c27,28
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
< <a href="/" data-lang="en" lang="en">EN</a>
---
> <a href="/opposition" data-lang="fr" lang="fr">FR</a>
> <a href="/opt-out" data-lang="en" lang="en">EN</a>
=== HEADER opt-out.html vs index.html ===
27,28c27,28
< <a href="/" data-lang="en" lang="en">EN</a>
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
---
> <a href="/opt-out" data-lang="en" lang="en">EN</a>
> <a href="/opposition" data-lang="fr" lang="fr">FR</a>
=== HEADER our-solution.html vs index.html ===
27,28c27,28
< <a href="/" data-lang="en" lang="en">EN</a>
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
---
> <a href="/our-solution" data-lang="en" lang="en">EN</a>
> <a href="/notre-solution" data-lang="fr" lang="fr">FR</a>
=== HEADER pricing.html vs index.html ===
27,28c27,28
< <a href="/" data-lang="en" lang="en">EN</a>
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
---
> <a href="/pricing" data-lang="en" lang="en">EN</a>
> <a href="/tarifs" data-lang="fr" lang="fr">FR</a>
=== HEADER privacy.html vs index.html ===
27,28c27,28
< <a href="/" data-lang="en" lang="en">EN</a>
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
---
> <a href="/privacy" data-lang="en" lang="en">EN</a>
> <a href="/confidentialite" data-lang="fr" lang="fr">FR</a>
=== HEADER recrutement.html vs index-fr.html ===
27,28c27,28
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
< <a href="/" data-lang="en" lang="en">EN</a>
---
> <a href="/recrutement" data-lang="fr" lang="fr">FR</a>
> <a href="/careers" data-lang="en" lang="en">EN</a>
=== HEADER tarifs.html vs index-fr.html ===
27,28c27,28
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
< <a href="/" data-lang="en" lang="en">EN</a>
---
> <a href="/tarifs" data-lang="fr" lang="fr">FR</a>
> <a href="/pricing" data-lang="en" lang="en">EN</a>
=== HEADER terms.html vs index.html ===
27,28c27,28
< <a href="/" data-lang="en" lang="en">EN</a>
< <a href="/index-fr" data-lang="fr" lang="fr">FR</a>
---
> <a href="/terms" data-lang="en" lang="en">EN</a>
> <a href="/conditions" data-lang="fr" lang="fr">FR</a>
```

## Liens externes (URL, code)

5 hôtes externes : fonts.googleapis.com, fonts.gstatic.com, app.syntheticswarm.ai, calendar.app.google, www.linkedin.com. Codes obtenus par curl via le proxy de la session (User-Agent navigateur), sans suivi puis avec suivi (`-L`). Aucun hôte ne renvoie 5xx ni ne refuse la connexion ; aucun CTA ne pointe vers une cible en erreur : 0 bloquant.

| URL | Occurrences (pages) | Exemple fichier:ligne | HEAD | GET | GET -L (final) | Lecture |
| --- | --- | --- | --- | --- | --- | --- |
| https://app.syntheticswarm.ai/ui/ | 56 (26) | index.html:70 « Log in », index-fr.html:183 « Choisir ce forfait » | 200 | 200 | 200 | OK, page de connexion de l'application (`<title>Synthetic Swarm</title>`) |
| https://app.syntheticswarm.ai/ (racine, non référencée, sonde) | 0 | n/a | 405 | 307 vers /ui/ | 200 | OK |
| https://calendar.app.google/91k1Mpontca7NGea6 | 66 (26) | index.html:74 « Axel CEO » | 302 | 302 | 200 (calendar.google.com/calendar/appointments/schedules/...) | OK, redirection normale du raccourci Google |
| https://calendar.app.google/AWQX2bxp8cnqtsaJ9 | 66 (26) | index.html:75 « Ilan CTO » | 302 | 302 | 200 (2 redirections) | OK |
| https://www.linkedin.com/in/axel-carron/ | 4 (4) | about.html:82, a-propos.html:82, contact.html:58, contact-fr.html:58 | 999 | 999 | 999 | Non vérifiable automatiquement (anti-robot LinkedIn) |
| https://www.linkedin.com/in/isainteagathe/ | 4 (4) | about.html:83, a-propos.html:83, contact.html:58, contact-fr.html:58 | 405 | 429 | 999 | Non vérifiable automatiquement (anti-robot LinkedIn) |
| https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap | 26 (26) | index.html:21 (stylesheet) | 200 | 200 | 200 | OK |
| https://fonts.googleapis.com/ | 26 (26) | index.html:19 (`rel="preconnect"`) | 404 | 404 | 404 | Normal : un preconnect n'ouvre qu'une connexion, la racine n'est jamais demandée |
| https://fonts.gstatic.com/ | 26 (26) | index.html:20 (`rel="preconnect" crossorigin`) | 404 | 404 | 404 | Normal, même raison |

Autres schémas : 23 liens `mailto:contact@syntheticswarm.ai` (avec ou sans sujet pré-rempli) sur contact, contact-fr, recrutement, terms, conditions, privacy, confidentialite, legal-notice, mentions-legales, opt-out, opposition ; 0 lien `tel:`. `api/contact.js:32` appelle `https://api.resend.com/emails` côté serveur (non testé, dépend de `RESEND_API_KEY`).

## Compte : 0 bloquant(s), 2 majeur(s), 2 mineur(s)

## Non couvert

- Rendu effectif d'un `404.html` par Vercel : à valider sur un déploiement de prévisualisation (le fichier n'existe pas encore ; la proposition est le bloc A).
- Profils LinkedIn : codes 999 / 405 / 429 renvoyés aux robots, existence des profils non vérifiable automatiquement ; à ouvrir dans un navigateur.
- Enregistrements MX de syntheticswarm.ai pour les 23 `mailto:` : `dig` et `nslookup` absents de l'environnement.
- Envoi réel du formulaire de contact (POST `/api/contact`) et appel Resend : non exécutés volontairement (envoi d'email réel).
- Liens générés dynamiquement par `customers.js` (profils LinkedIn clients) : `customers.json` ne contient aucun client, donc aucun lien rendu à contrôler.
- Crawl complet de la production : seul le serveur local a été crawlé ; en production, sondes ponctuelles uniquement (`/`, `/customers`, `/clients`, `/media`, `/medias`, `/faq`, `/contact`, `/api/contact`, `/nexistepas`).
- Rendu Playwright : Chromium a journalisé sur chaque page `Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID` pour la feuille Google Fonts (CA du proxy de session non reconnue par Chromium) ; artefact d'environnement, non imputable au site (curl obtient 200 sur la même URL).

## git status

```
$ git status --short
?? docs/audit-site/audit-site-02-liens.md
?? docs/audit-site/audit-site-03-contenu.md
?? docs/audit-site/screens/
```

`docs/audit-site/audit-site-03-contenu.md` et `docs/audit-site/screens/` ne sont pas produits par ce volet (rapport et captures d'autres volets de l'audit, menés en parallèle) ; aucun fichier du site n'a été modifié, créé ou supprimé par le volet 2, dont le seul fichier est `docs/audit-site/audit-site-02-liens.md`.
