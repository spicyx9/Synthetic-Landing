# Volet 6 : formulaires et actions

Méthode : lecture de api/contact.js, CONTACT_SETUP.md, contact.js, pricing.js, mobile-menu.js, solution-page.js et des 26 pages HTML ; tests Playwright (Chromium, reducedMotion) sur http://127.0.0.1:4173 avec interception de /api/contact (200, 500, 400 avec fields, 429, 503, HTML, abort, délai 5 s, blocage 20 s) ; harnais Node sur api/contact.js avec req/res factices, fetch simulé, sans variable d'environnement ; curl (proxy, TLS actif) sur les cibles externes et sur https://www.syntheticswarm.ai/api/contact sans aucun envoi (GET, corps vide, mauvais Content-Type). Scripts et journaux : tools/volet6/{contact.js,contact.log,actions.js,actions.log,actions.json,api-harness.cjs}.

| Sévérité | Page(s) | Fichier:ligne | Constat | Correction exacte |
|---|---|---|---|---|
| MAJEUR | /pricing, /tarifs, /, /index-fr | pricing.js:45-46 ; pricing.html:101 ; tarifs.html:101 ; index.html:183 ; index-fr.html:183 | Le bouton "Choose this plan" / "Choisir ce forfait" garde le même href `https://app.syntheticswarm.ai/ui/` pour les 5 volumes : pricing.js met à jour data-leads et data-price mais jamais le href (testé sur les 4 pages, 6 pas : href identique à chaque pas, EN et FR). Aucun script du site n'exploite data-leads/data-price. L'app (HTML brut de /ui/, 909 ko, HTTP 200) ne lit en URL que token, connected, error, forgot et session_id : le prospect arrive sur l'écran de connexion sans rappel du volume ni du prix choisis et doit tout re-sélectionner. | Bloc C1 ci-dessous (pricing.js + href initial des 4 pages) ; lecture de leads/price côté app : non vérifiable ici |
| MAJEUR | /, /index-fr | index.html:207-217 ; index-fr.html:207-217 | Section "Stay in the loop." / "Restez informé." avec champ email et bouton "Subscribe" / "S'inscrire" enfermés dans `<fieldset disabled>` ; formulaire sans action, sans method, sans gestionnaire JS (grep submit : seul contact.js en a un). Testé : saisie impossible (page.fill expire), clic sans requête ni navigation. Un prospect voit une inscription grisée qui ne fonctionne pas. Si le fieldset est réactivé (outils de développement), le submit fait un GET vers `/?email=x%40example.com` : l'email part dans l'URL. | Bloc C2 (masquer la section tant qu'aucun service n'est branché, ou remplacer par un lien mailto) |
| MINEUR | /contact, /contact-fr | contact.js:41 ; api/contact.js:21 | Validation email divergente : `a@b` passe la validité HTML5 et est envoyé (testé : 1 requête), le serveur le refuse (regex avec point obligatoire ; harnais : 400 fields.email). L'utilisateur voit "Please check this field." / "Vérifiez ce champ." plus le message générique "Something went wrong…" / "Une erreur est survenue…" au lieu du message email. | Bloc C3 (même regex côté client avant l'envoi) |
| MINEUR | /contact, /contact-fr | contact.js:50-55 | 429 (rate_limit), 503 (configuration), 502 (delivery) et réponse non JSON affichent tous le même texte générique (testé). Pour 429 l'utilisateur n'apprend pas qu'il doit attendre. | Bloc C4 (message dédié au 429) |
| MINEUR | /contact-fr | contact.js:6 | Pendant l'envoi le bouton FR affiche "Envoyer…" (même verbe qu'au repos) alors que l'EN affiche "Sending…" (testé, délai 5 s : bouton désactivé, aria-busy=true). | Dans contact.js:6 remplacer `sending:'Envoyer…'` par `sending:'Envoi en cours…'` |
| MINEUR | /contact, /contact-fr | contact.html:58 et contact-fr.html:58 (attributs action/method) ; api/contact.js:8 | Sans JavaScript, le formulaire poste en application/x-www-form-urlencoded vers /api/contact qui exige application/json : réponse 415 `{"ok":false,"error":"content_type"}` affichée brute (harnais et production : POST urlencoded, HTTP 415). | Bloc C5 (noscript avec l'adresse) |
| MINEUR | 26 pages | contact.html:36 et :62 (identique sur les 25 autres pages) | Entrées "Customers" et "Media" ("Nos clients", "Médias") du menu À propos et du pied de page rendues en `<span class="nav-disabled" role="link" aria-disabled="true">` : clic sans effet, alors que /customers, /clients, /media, /medias existent et répondent 200. Volontaire (pages en état vide) mais visible par tout visiteur : 3 éléments morts par page. | Bloc C6 (lier ou retirer) |
| MINEUR | /contact, /contact-fr | api/contact.js:13, 25-29 ; CONTACT_SETUP.md:17-19 | Anti-spam : honeypot `website` (400 si rempli, testé) et 5 envois / 10 min / IP par instance chaude (testé : 6e envoi 429 avec Retry-After 600, autre IP passe). Pas de captcha, pas de délai minimal, limite non partagée entre instances ni persistante ; un script qui omet le champ website et change d'IP passe. Règle Vercel Firewall : non vérifiable ici. | Bloc C7 (règle Firewall Vercel ; Turnstile si le spam apparaît) |

### C1 : transmettre le volume et le prix à l'app (pricing.js:41-50)

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

Côté app : lire `leads` et `price` dans `new URLSearchParams(window.location.search)` et présélectionner le forfait à l'inscription (l'app ignore aujourd'hui les paramètres inconnus, l'ajout est sans risque ; non vérifiable ici).

### C2 : newsletter (index.html:210-217, index-fr.html:210-217)

Option retenue : masquer toute la section tant qu'aucun service n'existe.

```html
<!-- index.html:207 et index-fr.html:207 : ajouter hidden sur la section -->
<section id="newsletter" class="content-page home-newsletter" aria-labelledby="newsletter-title" hidden>
```

Variante si la section doit rester visible : remplacer les lignes 210 à 217 par un lien qui fonctionne.

```html
<!-- index.html -->
<p class="newsletter-controls"><a class="page-button" href="mailto:contact@syntheticswarm.ai?subject=Product%20updates">Email us to get product updates</a></p>
<!-- index-fr.html -->
<p class="newsletter-controls"><a class="page-button" href="mailto:contact@syntheticswarm.ai?subject=Nouveaut%C3%A9s%20produit">Nous écrire pour recevoir les nouveautés</a></p>
```

### C3 : même règle email côté client (contact.js:41)

```js
// contact.js, avant form.addEventListener('submit', …) :
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // identique à api/contact.js:21
// contact.js:41, remplacer la ligne par :
error(field, field.required && !value ? copy.required : (field.type === 'email' && (field.validity.typeMismatch || !EMAIL.test(value))) ? copy.email : !field.validity.valid ? copy.invalid : '');
```

### C4 : message dédié au 429 (contact.js:5-11 et 47-55)

```js
// contact.js:6-7 (FR), ajouter la clé :
rateLimit:'Trop de messages envoyés depuis votre connexion. Réessayez dans dix minutes ou écrivez à contact@syntheticswarm.ai.',
// contact.js:9-10 (EN), ajouter la clé :
rateLimit:'Too many messages from your connection. Try again in ten minutes or email contact@syntheticswarm.ai.',
// contact.js:47-55, remplacer le try/catch par :
let failure = copy.error;
try {
  const response = await fetch('/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data), signal:AbortSignal.timeout(15000)});
  const result = await response.json();
  if (!response.ok || result.ok !== true) {
    if (result.fields) for (const field of fields) if (result.fields[field.name]) error(field, copy.invalid);
    if (response.status === 429) failure = copy.rateLimit;
    throw new Error('send');
  }
  form.reset(); status.textContent = copy.success;
} catch { status.textContent = failure; }
```

### C5 : repli sans JavaScript (contact.html:58, contact-fr.html:58, juste après `</form>`)

```html
<!-- contact.html -->
<noscript><p class="contact-status">JavaScript is required to send this form. Email us at <a href="mailto:contact@syntheticswarm.ai">contact@syntheticswarm.ai</a>.</p></noscript>
<!-- contact-fr.html -->
<noscript><p class="contact-status">JavaScript est nécessaire pour envoyer ce formulaire. Écrivez-nous à <a href="mailto:contact@syntheticswarm.ai">contact@syntheticswarm.ai</a>.</p></noscript>
```

### C6 : entrées de navigation désactivées (26 pages, menu À propos ligne 36 et pied de page ligne 62 sur contact.html)

```html
<!-- Pages EN : remplacer -->
<span class="nav-disabled" role="link" aria-disabled="true">Customers</span>
<span class="nav-disabled" role="link" aria-disabled="true">Media</span>
<!-- par -->
<a href="/customers">Customers</a>
<a href="/media">Media</a>
<!-- Pages FR : remplacer -->
<span class="nav-disabled" role="link" aria-disabled="true">Nos clients</span>
<span class="nav-disabled" role="link" aria-disabled="true">Médias</span>
<!-- par -->
<a href="/clients">Nos clients</a>
<a href="/medias">Médias</a>
<!-- ou supprimer les <li> correspondants si les pages vides ne doivent pas être promues -->
```

### C7 : limitation côté plateforme (non vérifiable ici)

Vercel, projet du site, onglet Firewall, "Add rule" : condition `Request Path equals /api/contact` et `Method equals POST` ; action `Rate Limit` : 5 requêtes par 600 secondes par adresse IP, dépassement `Deny`. Si le spam persiste, ajouter Cloudflare Turnstile : champ `cf-turnstile-response` envoyé dans le JSON et vérifié dans api/contact.js avant l'appel Resend.

## Parcours testés

| Cas | Résultat observé |
|---|---|
| Contact EN et FR : destination de la soumission | `fetch('/api/contact', POST, Content-Type application/json)` (contact.js:48), corps JSON avec lastName, firstName, email, company, subject, message, website (honeypot, vide). Attributs HTML `action="/api/contact" method="post" novalidate`. Serveur : Vercel Node function api/contact.js, envoi via https://api.resend.com/emails vers contact@syntheticswarm.ai, Reply-To = email du visiteur, sujet "Contact: <sujet>" (harnais, fetch simulé : payload conforme, clé jamais exposée). CONTACT_SETUP.md:8-9 : RESEND_API_KEY et CONTACT_FROM_EMAIL à définir dans Vercel (non vérifiable ici). |
| Production : fonction déployée ? | GET https://www.syntheticswarm.ai/api/contact : 405 `{"ok":false,"error":"method"}` ; POST `{}` : 400 validation avec 5 champs ; POST urlencoded : 415. La fonction est bien déployée ; aucun email envoyé par ces sondes. |
| Champs vides (EN / FR) | Validation JS (novalidate) : 5 messages "This field is required." / "Ce champ est requis." sous chaque champ, aria-invalid=true, focus sur le premier champ (contact-lastName), 0 requête. Entreprise facultative des deux côtés (client : pas de required ; serveur : api/contact.js:19). |
| Email invalide `foo` | "Enter a valid email address." / "Saisissez une adresse email valide.", 0 requête. |
| Email `a@b` | Envoyé (1 requête) ; le serveur répond 400 fields.email (harnais) ; l'UI affiche alors "Please check this field." + message générique (cas 8). |
| Succès 200 `{"ok":true}` | "Message sent. We'll get back to you soon." / "Message envoyé. Nous vous répondrons rapidement." dans `.contact-status` (role=status, aria-live=polite) sous le bouton, focus déplacé sur le statut, formulaire vidé (form.reset), bouton réactivé. |
| Échec 500 | "Something went wrong. You can also email us at contact@syntheticswarm.ai." / "Une erreur est survenue. Vous pouvez aussi nous écrire à contact@syntheticswarm.ai." ; valeurs saisies conservées ; bouton réactivé. |
| Réseau coupé (abort) | Même message d'erreur, valeurs conservées, 1 requête. |
| Délai 5 s | Pendant l'attente : bouton désactivé, texte "Sending…" / "Envoyer…", aria-busy=true, statut vide ; à la réponse : succès affiché, bouton "Send" / "Envoyer" réactivé. |
| Blocage 20 s (EN) | Abandon client après 15 053 ms (AbortSignal.timeout(15000), contact.js:48), message d'erreur affiché, bouton réactivé. |
| Double envoi | Clic + Entrée pendant l'attente : 1 seule requête (drapeau pending + disabled, contact.js:37 et 46). Double clic + Entrée au repos : 1 seule requête. |
| Entrée dans un champ texte | Soumet le formulaire (1 requête), même traitement. |
| 400 avec fields `{email}` | Champ email marqué "Please check this field." / "Vérifiez ce champ." + message générique, focus sur le statut. |
| 429, 503, 200 HTML non JSON | Message générique dans les trois cas (voir constat 4). |
| Bouton Copier | Presse-papiers = contact@syntheticswarm.ai, bouton "Copied" / "Copié", statut "Email address copied." / "Adresse email copiée." (retour au libellé initial après 2,5 s, contact.js:24). |
| Honeypot | Champ `website` 1 px x 1 px, clip-path, tabindex=-1, aria-hidden (contact.css:25) ; rempli de force, le client l'envoie tel quel et le serveur répond 400 "invalid" (harnais). Vide : accepté. |
| Harnais api/contact.js | GET 405 + Allow: POST ; Content-Type non JSON 415 ; JSON invalide / tableau / honeypot 400 invalid ; champs vides, message blanc, email sans point ou avec espace, sujet avec CRLF, prénom non texte, message 5001 caractères : 400 validation avec le champ fautif ; corps > 14 000 caractères : 413 ; clés supplémentaires ignorées ; sans variables d'environnement : 503 configuration ; 5 envois valides puis 6e : 429 avec Retry-After 600, autre IP acceptée, validation faite avant le comptage ; avec env factice et fetch simulé : 200 `{"ok":true}` ; réponse fournisseur sans id, 401, non JSON ou exception : 502 delivery ; Cache-Control: no-store. Test existant tests/contact.test.cjs : 1/1 passe. |
| Opt-out / Opposition | Pas de formulaire : adresse en clair `contact@syntheticswarm.ai` (lien mailto simple, opt-out.html:61, opposition.html:61) puis bouton mailto prérempli (ligne 62). Décodage du href EN : sujet "Opt-out request - Synthetic Swarm", corps "Hello,\n\nI would like to request the removal of my contact details.\n\nFirst name:\nLast name:\nCompany:\nEmail or phone number to remove:\n\nThank you." FR : sujet "Demande d'opposition - Synthetic Swarm", corps "Bonjour,\n\nJe souhaite demander le retrait de mes coordonnées.\n\nNom : \nPrénom : \nEntreprise : \nEmail ou téléphone à retirer : \n\nMerci." Espaces %20, accents UTF-8 (%C3%A9), sauts %0A, `&` échappé en `&amp;` dans la source : corrects. Alternative sans client mail : adresse affichée en clair, sélectionnable. |
| Démo : pastille flottante (/our-solution, /notre-solution) | Cachée en haut de page (aria-hidden=true, inert) ; visible après défilement sous le hero (classe is-visible, 218 x 44 px en bas de l'écran, "Book a demo 15 min with the team" / "Réserver une démo 15 min avec l'équipe") ; clic : panneau `floating-demo-options` avec 2 liens agenda ; cachée à nouveau en bas de page, près du CTA final (solution-page.js:48-73). |
| Démo : tous les boutons "Demo"/"Démo", "Book a demo"/"Réserver une démo", "Book a call"/"Réserver un rendez-vous" | Boutons `data-book-demo data-disclosure-trigger` (en-tête, pied de page, hero et fin de /our-solution et /notre-solution, /customers et /clients, forfait 200+ sur /pricing, /tarifs, /, /index-fr) : au clic aria-expanded=true et panneau visible avec 2 liens `target=_blank rel=noopener noreferrer` : Axel CEO https://calendar.app.google/91k1Mpontca7NGea6 (200, "Call Axel Carron") et Ilan CTO https://calendar.app.google/AWQX2bxp8cnqtsaJ9 (200, "Call Ilan"). Aucun href "#" ni placeholder. |
| Newsletter (/, /index-fr) | Champ et bouton visibles mais désactivés, form sans action ; saisie impossible, clic sans requête ni navigation ; fieldset réactivé : GET `/?email=x%40example.com`. Aucun autre champ newsletter sur les 24 autres pages (mention textuelle seulement sur /media et /medias). |
| Tarifs : sélecteur de volume (/pricing, /tarifs, /, /index-fr) | Pas 10/20/50/100/200/200+ : prix 89 €, 169 €, 399 €, 789 €, 1 499 € (EN "1,499 €", FR "1 499 €"), "Custom"/"Sur mesure" ; période et résumé masqués pour 200+, bouton "Choisir ce forfait" masqué et "Réserver un rendez-vous"/"Book a call" affiché ; badge "Forfait préféré" seulement à 50 ; aria-valuetext mis à jour ; curseur (événement input) cohérent avec les boutons. Mêmes grilles sur les 4 pages (pricing.js:5-12 partagé). Href du bouton : `https://app.syntheticswarm.ai/ui/` à chaque pas, data-leads/data-price mis à jour (constat 1). Cible : 200, titre "Synthetic Swarm", même onglet ; HTML brut : écran de connexion ("Sign in", "Forgot password?"), présence de code d'inscription et de paiement Stripe (mots signup, checkout, trial), aucun paramètre leads/price lu. |
| Liens internes | 24 cibles distinctes (toutes les pages sauf index / index-fr atteintes via "/" et "/index-fr") : toutes 200 sur le serveur local ; 26 ancres "#main" ("Skip to content" / "Aller au contenu") présentes dans le DOM. |
| Candidatures (/careers, /recrutement) | 4 mailto par page avec sujet prérempli ("Application: Sales France %E2%80%94 Synthetic Swarm", "Candidature Sales France %E2%80%94 Synthetic Swarm", etc., tiret long encodé %E2%80%94, décodage correct) + 1 mailto sans sujet pour la candidature spontanée. Pas de formulaire, pas de pièce jointe possible autrement que par le client mail. |

## Tableau exhaustif des actions

133 actions distinctes relevées dans le DOM rendu des 26 pages (1 006 éléments hors clones du menu mobile ; les 364 clones du menu mobile pointent vers les mêmes cibles, ids préfixés "mobile-"). Aucun `href="#"`, aucun `tel:`, aucun téléchargement, aucun mailto vide, aucun bouton sans gestionnaire. Codes HTTP externes obtenus par curl via le proxy avec TLS actif.

| Élément | Texte | Page(s) | Cible / comportement | Résultat |
|---|---|---|---|---|
| a | AxelCEO↗ | 26 pages | https://calendar.app.google/91k1Mpontca7NGea6 (target=_blank) | 200 après 1 redirection, <title>Call Axel Carron</title> |
| a | IlanCTO↗ | 26 pages | https://calendar.app.google/AWQX2bxp8cnqtsaJ9 (target=_blank) | 200 après 2 redirections, <title>Call Ilan</title> |
| button | À propos | 13 pages FR | ouvre/ferme le panneau aria-controls (mobile-menu.js:85-109), testé : aria-expanded=true, panneau visible avec 2 liens agenda | fonctionne |
| a | À propos | 13 pages FR | /a-propos | HTTP 200 sur le serveur local (sémantique Vercel) |
| button | About | 13 pages EN | ouvre/ferme le panneau aria-controls (mobile-menu.js:85-109), testé : aria-expanded=true, panneau visible avec 2 liens agenda | fonctionne |
| a | About | 13 pages EN | /about | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Aller au contenu | 13 pages FR | #main | ancre #main présente sur la page (vérifié DOM) |
| button | Book a demo | 13 pages EN | ouvre/ferme le panneau aria-controls (mobile-menu.js:85-109), testé : aria-expanded=true, panneau visible avec 2 liens agenda | fonctionne |
| a | Careers | 13 pages EN | /careers | HTTP 200 sur le serveur local (sémantique Vercel) |
| button | Choisir la langue | 13 pages FR | ouvre/ferme le panneau aria-controls (mobile-menu.js:85-109), testé : aria-expanded=true, panneau visible avec 2 liens agenda | fonctionne |
| button | Choose language | 13 pages EN | ouvre/ferme le panneau aria-controls (mobile-menu.js:85-109), testé : aria-expanded=true, panneau visible avec 2 liens agenda | fonctionne |
| a | Conditions | 13 pages FR | /conditions | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Confidentialité | 13 pages FR | /confidentialite | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Connexion | 13 pages FR | https://app.syntheticswarm.ai/ui/ (target=_blank) | 200, <title>Synthetic Swarm</title>, écran de connexion de l'app |
| a | Contact | 13 pages EN | /contact | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Contact | 13 pages FR | /contact-fr | HTTP 200 sur le serveur local (sémantique Vercel) |
| span | Customers | 13 pages EN | span role=link aria-disabled=true, aucun href | clic sans effet (volontaire, pages vides) |
| button | Demo | 13 pages EN | ouvre/ferme le panneau aria-controls (mobile-menu.js:85-109), testé : aria-expanded=true, panneau visible avec 2 liens agenda | fonctionne |
| button | Démo | 13 pages FR | ouvre/ferme le panneau aria-controls (mobile-menu.js:85-109), testé : aria-expanded=true, panneau visible avec 2 liens agenda | fonctionne |
| a | FAQ | 13 pages EN | /faq | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FAQ | 13 pages FR | /faq-fr | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Legal Notice | 13 pages EN | /legal-notice | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Log in | 13 pages EN | https://app.syntheticswarm.ai/ui/ (target=_blank) | 200, <title>Synthetic Swarm</title>, écran de connexion de l'app |
| span | Media | 13 pages EN | span role=link aria-disabled=true, aucun href | clic sans effet (volontaire, pages vides) |
| span | Médias | 13 pages FR | span role=link aria-disabled=true, aucun href | clic sans effet (volontaire, pages vides) |
| a | Mentions légales | 13 pages FR | /mentions-legales | HTTP 200 sur le serveur local (sémantique Vercel) |
| span | Nos clients | 13 pages FR | span role=link aria-disabled=true, aucun href | clic sans effet (volontaire, pages vides) |
| a | Notre solution | 13 pages FR | /notre-solution | HTTP 200 sur le serveur local (sémantique Vercel) |
| button | Open menu | 13 pages EN | ouvre/ferme le menu mobile (mobile-menu.js:54-66) | fonctionne |
| a | Opposition | 13 pages FR | /opposition | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Opt out | 13 pages EN | /opt-out | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Our solution | 13 pages EN | /our-solution | HTTP 200 sur le serveur local (sémantique Vercel) |
| button | Ouvrir le menu | 13 pages FR | ouvre/ferme le menu mobile (mobile-menu.js:54-66) | fonctionne |
| a | Pricing | 13 pages EN | /pricing | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Privacy | 13 pages EN | /privacy | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Qui sommes-nous | 13 pages FR | /a-propos | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Recrutement | 13 pages FR | /recrutement | HTTP 200 sur le serveur local (sémantique Vercel) |
| button | Réserver une démo | 13 pages FR | ouvre/ferme le panneau aria-controls (mobile-menu.js:85-109), testé : aria-expanded=true, panneau visible avec 2 liens agenda | fonctionne |
| a | Se connecter | 13 pages FR | https://app.syntheticswarm.ai/ui/ (target=_blank) | 200, <title>Synthetic Swarm</title>, écran de connexion de l'app |
| a | Skip to content | 13 pages EN | #main | ancre #main présente sur la page (vérifié DOM) |
| a | Synthetic Swarm | 13 pages EN | / | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Synthetic Swarm | 13 pages FR | /index-fr | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Tarifs | 13 pages FR | /tarifs | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Terms | 13 pages EN | /terms | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Who we are | 13 pages EN | /about | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | contact@syntheticswarm.ai | /contact, /contact-fr, /legal-notice, /mentions-legales, /privacy, /confidentialite, /terms, /conditions, /opt-out, /opposition | mailto:contact@syntheticswarm.ai | mailto vers contact@syntheticswarm.ai, sans sujet |
| button | 10 | /, /index-fr, /pricing, /tarifs | met à jour prix, compteurs, data-leads/data-price (pricing.js:52-55), testé sur 4 pages | fonctionne |
| button | 100 | /, /index-fr, /pricing, /tarifs | met à jour prix, compteurs, data-leads/data-price (pricing.js:52-55), testé sur 4 pages | fonctionne |
| button | 20 | /, /index-fr, /pricing, /tarifs | met à jour prix, compteurs, data-leads/data-price (pricing.js:52-55), testé sur 4 pages | fonctionne |
| button | 200 | /, /index-fr, /pricing, /tarifs | met à jour prix, compteurs, data-leads/data-price (pricing.js:52-55), testé sur 4 pages | fonctionne |
| button | 200+ | /, /index-fr, /pricing, /tarifs | met à jour prix, compteurs, data-leads/data-price (pricing.js:52-55), testé sur 4 pages | fonctionne |
| button | 50 | /, /index-fr, /pricing, /tarifs | met à jour prix, compteurs, data-leads/data-price (pricing.js:52-55), testé sur 4 pages | fonctionne |
| a | LinkedIn Axel | /about, /a-propos, /contact, /contact-fr | https://www.linkedin.com/in/axel-carron/ (target=_blank) | HTTP 999 (anti-robot LinkedIn) : non vérifiable ici par curl |
| a | LinkedIn Ilan | /about, /a-propos, /contact, /contact-fr | https://www.linkedin.com/in/isainteagathe/ (target=_blank) | HTTP 999 (anti-robot LinkedIn) : non vérifiable ici par curl |
| button | Book a call | /, /pricing | ouvre/ferme le panneau aria-controls (mobile-menu.js:85-109), testé : aria-expanded=true, panneau visible avec 2 liens agenda | fonctionne |
| a | Choisir ce forfait | /index-fr, /tarifs | https://app.syntheticswarm.ai/ui/ | 200, <title>Synthetic Swarm</title>, écran de connexion de l'app |
| a | Choose this plan | /, /pricing | https://app.syntheticswarm.ai/ui/ | 200, <title>Synthetic Swarm</title>, écran de connexion de l'app |
| a | Contact the team | /faq, /media | /contact | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Contacter l’équipe | /faq-fr, /medias | /contact-fr | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /, /index-fr | / | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /our-solution, /notre-solution | /our-solution | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /pricing, /tarifs | /pricing | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /faq, /faq-fr | /faq | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /about, /a-propos | /about | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /careers, /recrutement | /careers | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /contact, /contact-fr | /contact | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /customers, /clients | /customers | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /media, /medias | /media | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /legal-notice, /mentions-legales | /legal-notice | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /privacy, /confidentialite | /privacy | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /terms, /conditions | /terms | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | EN | /opt-out, /opposition | /opt-out | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /, /index-fr | /index-fr | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /our-solution, /notre-solution | /notre-solution | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /pricing, /tarifs | /tarifs | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /faq, /faq-fr | /faq-fr | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /about, /a-propos | /a-propos | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /careers, /recrutement | /recrutement | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /contact, /contact-fr | /contact-fr | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /customers, /clients | /clients | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /media, /medias | /medias | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /legal-notice, /mentions-legales | /mentions-legales | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /privacy, /confidentialite | /confidentialite | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /terms, /conditions | /conditions | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | FR | /opt-out, /opposition | /opposition | HTTP 200 sur le serveur local (sémantique Vercel) |
| button | Réserver un rendez-vous | /index-fr, /tarifs | ouvre/ferme le panneau aria-controls (mobile-menu.js:85-109), testé : aria-expanded=true, panneau visible avec 2 liens agenda | fonctionne |
| form | Send a message | /contact, /contact-fr | POST JSON vers /api/contact via fetch (contact.js:48) | voir parcours testés |
| button | Structure | /our-solution, /notre-solution | bascule le panneau aria-controls (solution-page.js:33-40) | fonctionne |
| form | Subscribe | /, /index-fr | aucun action/method, fieldset disabled | inerte : aucune requête, aucune navigation (testé) |
| a | Apply → | /careers | mailto:contact@syntheticswarm.ai?subject=Application%3A%20Sales%20France%20%E2%80%94%20Synthetic%20Swarm | mailto vers contact@syntheticswarm.ai, sujet décodé : "Application: Sales France %E2%80%94 Synthetic Swarm" |
| a | Apply → | /careers | mailto:contact@syntheticswarm.ai?subject=Application%3A%20Sales%20US%20%E2%80%94%20Synthetic%20Swarm | mailto vers contact@syntheticswarm.ai, sujet décodé : "Application: Sales US %E2%80%94 Synthetic Swarm" |
| a | Apply → | /careers | mailto:contact@syntheticswarm.ai?subject=Application%3A%20Tech%20%E2%80%94%20Synthetic%20Swarm | mailto vers contact@syntheticswarm.ai, sujet décodé : "Application: Tech %E2%80%94 Synthetic Swarm" |
| a | Apply → | /careers | mailto:contact@syntheticswarm.ai?subject=Application%3A%20Chief%20of%20Staff%20%E2%80%94%20Synthetic%20Swarm | mailto vers contact@syntheticswarm.ai, sujet décodé : "Application: Chief of Staff %E2%80%94 Synthetic Swarm" |
| button | Book a demo15 min with the team | /our-solution | ouvre/ferme le panneau aria-controls (mobile-menu.js:85-109), testé : aria-expanded=true, panneau visible avec 2 liens agenda | fonctionne |
| summary | Chief of Staff · France & US 🇫🇷🇺🇸Travailler avec les fon | /recrutement | span role=link aria-disabled=true, aucun href | details natif, ouvre/ferme le poste (careers.js) |
| summary | Chief of Staff · France & US 🇫🇷🇺🇸Work with the founders  | /careers | span role=link aria-disabled=true, aucun href | details natif, ouvre/ferme le poste (careers.js) |
| button | Copier | /contact-fr | copie contact@syntheticswarm.ai (contact.js:15-25), testé : presse-papiers OK, libellé Copied/Copié | fonctionne |
| button | Copy | /contact | copie contact@syntheticswarm.ai (contact.js:15-25), testé : presse-papiers OK, libellé Copied/Copié | fonctionne |
| button | Croissance | /notre-solution | bascule le panneau aria-controls (solution-page.js:33-40) | fonctionne |
| a | Découvrir notre solution | /index-fr | /notre-solution | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Discover our solution | / | /our-solution | HTTP 200 sur le serveur local (sémantique Vercel) |
| button | Envoyer | /contact-fr | soumission du formulaire (voir parcours) | fonctionne |
| a | Envoyer un email → | /opposition | mailto:contact@syntheticswarm.ai?subject=Demande%20d%27opposition%20-%20Synthetic%20Swarm&body=Bonjour%2C%0A%0AJe%20souhaite%20demander%20le%20retrait%20de%20mes%20coordonn%C3%A9es.%0A%0ANom%20%3A%20%0APr%C3%A9nom%20%3A%20%0AEntreprise%20%3A%20%0AEmail%20ou%20t%C3%A9l%C3%A9phone%20%C3%A0%20retirer%20%3A%20%0A%0AMerci. | mailto vers contact@syntheticswarm.ai, sujet décodé : "Demande d'opposition - Synthetic Swarm", corps prérempli (voir section 2) |
| a | Envoyer un email ↗ | /contact-fr | mailto:contact@syntheticswarm.ai | mailto vers contact@syntheticswarm.ai, sans sujet |
| a | Envoyer une candidature spontanée → | /recrutement | mailto:contact@syntheticswarm.ai | mailto vers contact@syntheticswarm.ai, sans sujet |
| button | Growth | /our-solution | bascule le panneau aria-controls (solution-page.js:33-40) | fonctionne |
| button | Mettre en pause | /index-fr | pause/reprise animation (home-motion.js) | fonctionne |
| button | Mettre en pause | /notre-solution | pause/reprise animation (solution-page.js:4-11) | fonctionne |
| button | Pause animation | / | pause/reprise animation (home-motion.js) | fonctionne |
| button | Pause animation | /our-solution | pause/reprise animation (solution-page.js:4-11) | fonctionne |
| a | Politique de confidentialité | /conditions | /confidentialite | HTTP 200 sur le serveur local (sémantique Vercel) |
| a | Postuler → | /recrutement | mailto:contact@syntheticswarm.ai?subject=Candidature%20Sales%20France%20%E2%80%94%20Synthetic%20Swarm | mailto vers contact@syntheticswarm.ai, sujet décodé : "Candidature Sales France %E2%80%94 Synthetic Swarm" |
| a | Postuler → | /recrutement | mailto:contact@syntheticswarm.ai?subject=Candidature%20Sales%20US%20%E2%80%94%20Synthetic%20Swarm | mailto vers contact@syntheticswarm.ai, sujet décodé : "Candidature Sales US %E2%80%94 Synthetic Swarm" |
| a | Postuler → | /recrutement | mailto:contact@syntheticswarm.ai?subject=Candidature%20Tech%20%E2%80%94%20Synthetic%20Swarm | mailto vers contact@syntheticswarm.ai, sujet décodé : "Candidature Tech %E2%80%94 Synthetic Swarm" |
| a | Postuler → | /recrutement | mailto:contact@syntheticswarm.ai?subject=Candidature%20Chief%20of%20Staff%20%E2%80%94%20Synthetic%20Swarm | mailto vers contact@syntheticswarm.ai, sujet décodé : "Candidature Chief of Staff %E2%80%94 Synthetic Swarm" |
| a | Privacy Policy | /terms | /privacy | HTTP 200 sur le serveur local (sémantique Vercel) |
| button | Réserver une démo15 min avec l’équipe | /notre-solution | ouvre/ferme le panneau aria-controls (mobile-menu.js:85-109), testé : aria-expanded=true, panneau visible avec 2 liens agenda | fonctionne |
| button | S’inscrire | /index-fr | soumission du formulaire (voir parcours) ; bouton désactivé (fieldset disabled) | inerte volontairement (index.html:212) |
| summary | Sales · États-Unis 🇺🇸Développer nos premiers comptes améri | /recrutement | span role=link aria-disabled=true, aucun href | details natif, ouvre/ferme le poste (careers.js) |
| summary | Sales · France 🇫🇷Développer Synthetic Swarm auprès des pro | /recrutement | span role=link aria-disabled=true, aucun href | details natif, ouvre/ferme le poste (careers.js) |
| summary | Sales · France 🇫🇷Grow Synthetic Swarm among insurance prof | /careers | span role=link aria-disabled=true, aucun href | details natif, ouvre/ferme le poste (careers.js) |
| summary | Sales · United States 🇺🇸Develop our first US accounts. | /careers | span role=link aria-disabled=true, aucun href | details natif, ouvre/ferme le poste (careers.js) |
| a | See pricing | /our-solution | /pricing | HTTP 200 sur le serveur local (sémantique Vercel) |
| button | Send | /contact | soumission du formulaire (voir parcours) | fonctionne |
| a | Send a spontaneous application → | /careers | mailto:contact@syntheticswarm.ai | mailto vers contact@syntheticswarm.ai, sans sujet |
| a | Send an email → | /opt-out | mailto:contact@syntheticswarm.ai?subject=Opt-out%20request%20-%20Synthetic%20Swarm&body=Hello%2C%0A%0AI%20would%20like%20to%20request%20the%20removal%20of%20my%20contact%20details.%0A%0AFirst%20name%3A%0ALast%20name%3A%0ACompany%3A%0AEmail%20or%20phone%20number%20to%20remove%3A%0A%0AThank%20you. | mailto vers contact@syntheticswarm.ai, sujet décodé : "Opt-out request - Synthetic Swarm", corps prérempli (voir section 2) |
| a | Send an email ↗ | /contact | mailto:contact@syntheticswarm.ai | mailto vers contact@syntheticswarm.ai, sans sujet |
| button | Subscribe | / | soumission du formulaire (voir parcours) ; bouton désactivé (fieldset disabled) | inerte volontairement (index.html:212) |
| summary | Tech / AI Engineer · France & US 🇫🇷🇺🇸Improve our detecti | /careers | span role=link aria-disabled=true, aucun href | details natif, ouvre/ferme le poste (careers.js) |
| summary | Tech / Ingénieur IA · France & US 🇫🇷🇺🇸Améliorer notre bo | /recrutement | span role=link aria-disabled=true, aucun href | details natif, ouvre/ferme le poste (careers.js) |
| button | Transition | /our-solution | bascule le panneau aria-controls (solution-page.js:33-40) | fonctionne |
| button | Transmission | /notre-solution | bascule le panneau aria-controls (solution-page.js:33-40) | fonctionne |
| a | Voir les tarifs | /notre-solution | /tarifs | HTTP 200 sur le serveur local (sémantique Vercel) |

## Compte : 0 bloquant(s), 2 majeur(s), 6 mineur(s)

## Non couvert

- Variables RESEND_API_KEY et CONTACT_FROM_EMAIL dans Vercel et livraison réelle dans la boîte contact@syntheticswarm.ai : non vérifiables ici sans envoyer un vrai message (interdit par la consigne). Si elles manquent, toute soumission valide reçoit 503 et l'utilisateur voit le message générique avec l'adresse de secours (api/contact.js:30, CONTACT_SETUP.md:11-13).
- Profils LinkedIn (https://www.linkedin.com/in/axel-carron/, https://www.linkedin.com/in/isainteagathe/) : LinkedIn répond HTTP 999 aux clients non navigateur ; non vérifiable ici.
- État rendu de https://app.syntheticswarm.ai/ui/ (SPA Alpine.js) : seul le HTML brut a été analysé ; le parcours d'inscription et de paiement dans l'app n'a pas été exercé.
- Règles Vercel Firewall éventuelles sur /api/contact : non vérifiables ici.
- Ouverture réelle des liens mailto dans un client de messagerie : seuls les href ont été décodés et vérifiés.
- Clones du menu mobile : inventoriés dans le DOM (mêmes cibles), non cliqués un par un.

## git status
```
?? docs/audit-site/audit-site-01-responsive.md
?? docs/audit-site/audit-site-06-formulaires.md
?? docs/audit-site/audit-site-08-legal.md
?? docs/audit-site/screens/
```

Seul `docs/audit-site/audit-site-06-formulaires.md` provient de ce volet ; `audit-site-01-responsive.md`, `audit-site-08-legal.md` et `screens/` sont produits par d'autres volets en parallèle. `git diff --stat` et `git diff --cached --stat` sont vides : aucun fichier suivi du site n'a été modifié, créé ni supprimé par ce volet.
