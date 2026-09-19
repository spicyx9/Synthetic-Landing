# Phase 0 : environnement et inventaire

Périmètre : préparation partagée par les 22 flux (repo, production, outils, cinq inventaires, état de la prod).
Outils : git, curl, openssl, dig, Playwright 1.56.1 (Chromium 1194, Firefox 1495, WebKit 2215), axe-core 4.13, Lighthouse 12, vnu-jar 26.9, html-validate, hunspell (fr, en_US, en_GB), Python 3.11 (textstat, pyspellchecker, bs4, lxml, Pillow), Node 22.
Début : 2026-09-19T19:01:00Z  Fin : 2026-09-19T19:34:22Z
Statut : COMPLET

## 1. Version auditée

| Élément | Valeur | Preuve |
| --- | --- | --- |
| Dépôt | https://github.com/spicyx9/Synthetic-Landing | `git remote -v` |
| Commit audité (origin/main) | `864833f` "increase homepage vertical breathing room" | `git log --oneline -1 origin/main` |
| Nombre de commits | 50 sur main | `git rev-list --count HEAD` |
| Branche de livraison de l'audit | `claude/friendly-galileo-94wicf` (miroir demandé : `claude/audit-total`) | `git status -sb` |
| Production = repo ? | Oui : les 26 pages HTML et les 125 fichiers servis en 200 sont identiques octet pour octet au commit 864833f (md5 identiques, ETag Vercel = md5 du fichier) | inventaire/fichiers.csv colonne `identique_a_la_prod` ; exemple : ETag `"fd674d25e682e899c88732db2bbc3823"` sur `/` = `md5sum index.html` |
| Hébergement site | Vercel (`server: Vercel`, `x-vercel-id: iad1::…`), www en CNAME `34480c0bd9eb3fd2.vercel-dns-017.com`, apex A `216.198.79.1` | `curl -sD - https://www.syntheticswarm.ai/`, `dig` |
| Hébergement app | `app.syntheticswarm.ai` A `178.104.121.108`, serveur Caddy, API FastAPI (OpenAPI 0.1.0, 117 routes), `/health` répond `{"status":"ok","downstream":{"postgres":"ok","redis":"ok"}}` | `curl -sD - https://app.syntheticswarm.ai/`, `/openapi.json`, `/health` |
| Attention repo local | Le clone initial pointait sur `d909b8b` ; `origin/main` avait été réécrit (forced update) vers `864833f`. L'audit porte sur `864833f`. | `git fetch origin main` : `+ 9a65b09...864833f main -> origin/main (forced update)` |

## 2. État de la prod au moment de l'audit

| Question | Réponse | Preuve |
| --- | --- | --- |
| Passe SEO : titres sans tiret | Oui, format `<Page> \| Synthetic Swarm` sur les 26 pages | `grep -h -o "<title>[^<]*</title>" *.html` |
| Passe SEO : JSON-LD | Partielle : présent sur 6 pages seulement (index, index-fr, about, a-propos, faq, faq-fr) ; absent sur les 20 autres | `grep -c "application/ld+json" *.html` |
| Passe SEO : favicon | `/assets/favicon.png` déclaré sur les 26 pages ; `/favicon.ico` 404, `/apple-touch-icon.png` 404, aucun manifest | `curl -o /dev/null -w '%{http_code}' https://www.syntheticswarm.ai/favicon.ico` = 404 |
| Passe SEO : sitemap et robots | `/sitemap.xml` 200 (26 URL, hreflang), `/robots.txt` 200 (`Disallow: /api/`, Sitemap déclaré) | pages.csv, `curl` |
| Passe SEO : Open Graph / Twitter | Absente : 0 balise `og:` ou `twitter:` sur les 26 pages | `grep -c "og:image" *.html` = 0 partout |
| LOT 1 : newsletter masquée | Non : le bloc newsletter est visible et actif sur les 26 pages (formulaire vers `/api/newsletter`, commit `df4a665` "enable functional newsletter signup with Resend") | footer généré par scripts/site_layout.py ; `curl -X GET https://www.syntheticswarm.ai/api/newsletter` = 405 (fonction déployée) |
| LOT 1 : 404 personnalisée | Non : aucun `404.html` dans le repo ; `/nope` renvoie la page texte Vercel "404: NOT_FOUND" (79 octets, text/plain) | `curl -sD - https://www.syntheticswarm.ai/nope` |
| LOT 1 : .vercelignore effectif | Non : aucun `.vercelignore` ; BRAND.md, CONTACT_SETUP.md, LEGAL_AUDIT.md, docs/*.md, scripts/site_layout.py, tests/*.cjs, assets/*/README.md, assets/data/customers.json et .claude/launch.json sont servis en 200 en production | inventaire/fichiers.csv ; `curl -o /dev/null -w '%{http_code}' https://www.syntheticswarm.ai/BRAND.md` = 200 |
| Conclusion | La production correspond au commit 864833f, avec une passe SEO partielle (titres, canonical, hreflang, sitemap, robots, JSON-LD sur 6 pages) et SANS le LOT 1. | |

## 3. Environnement de test

- Serveur local équivalent Vercel : `node tools/vercel-local.mjs /home/user/Synthetic-Landing 8787` (cleanUrls, trailingSlash:false, redirections de vercel.json avec cookie et en-tête pays, 404). Vérifié : `/pricing-fr` → 308 `/tarifs`, `/faq.html` → 308 `/faq`, `/tarifs/` → 308 `/tarifs`, cookie `ss-language=fr` sur `/` → 307 `/index-fr`, en-tête `x-vercel-ip-country: FR` → 307 `/index-fr`, `/nope` → 404. La production reste la référence fonctionnelle.
- Réseau : tout HTTPS sortant passe par un proxy d'inspection TLS local. Les navigateurs ont été configurés pour faire confiance à sa CA (magasin NSS pour Chromium, profil Firefox dédié, magasin système pour WebKit) sans désactiver la vérification TLS. Conséquence : les détails de certificat vus par Chromium et Firefox sont ceux du proxy ; la chaîne réelle du site est lue avec `openssl s_client -proxy 127.0.0.1:41841` et est traitée par le flux 08.
- Trois navigateurs vérifiés sur https://www.syntheticswarm.ai/ : Chromium 200 (1,6 s), Firefox 200 (3,2 s), WebKit 200 (5,3 s), titre "Insurance prospecting | Synthetic Swarm".

## 4. Inventaires produits

| Fichier | Contenu | Lignes |
| --- | --- | --- |
| inventaire/pages.csv | 26 URL du sitemap : code HTTP, taille, content-type, title, nombre de h1, lang, temps | 26 |
| inventaire/actions.csv | tout élément actionnable par page (liens internes, externes, mailto, boutons, formulaires et champs, sélecteurs, accordéons, menus, langue, handlers), région, visibilité à 1440 et 390 | 1518 |
| inventaire/fichiers.csv | 130 fichiers suivis par git : taille, URL prod, code HTTP prod, identique à la prod, pages référençantes | 130 |
| inventaire/emails.csv | 17 emails que le site ou l'app peuvent émettre, d'après le code et l'OpenAPI | 17 |
| inventaire/tiers.csv | domaines tiers contactés par page (Playwright, réseau), avant et après interaction | 78 |

Remarques d'inventaire (à instruire par les flux) :
- 43 fichiers du repo ne sont référencés par aucune page ni fichier (images historiques, tests, docs, .claude/launch.json), tous servis en 200 sauf `.gitignore` (404).
- `.claude/launch.json` servi en 200 contient un chemin local `/Users/ilansainte-agathe/Desktop/Synthetic-Landing`.
- `robots.txt` est référencé par aucune page (normal) ; `vercel.json`, `README.md`, `.gitignore` sont en 404 (Vercel les exclut par défaut).
- Sujets `mailto` de recrutement : 8 sujets contiennent un tiret cadratin encodé `%E2%80%94`.
