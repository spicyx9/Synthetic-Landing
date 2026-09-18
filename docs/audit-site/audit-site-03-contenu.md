# Volet 3 : cohérence de contenu FR/EN

Méthode : lecture intégrale du corps (`<main>`, header, footer) des 26 fichiers source des 13 paires, extraction automatique des sections de premier niveau, titres h1-h4, CTA (texte + href), chiffres, `<summary>` et éléments désactivés (script `sections.py`), comparaison header/footer de chaque page avec la home de sa langue (`chrome.py`), puis greps par famille avec distinction `<head>` / corps / attributs (`greps.py`), complétés par la lecture de `pricing.js`, `customers.js`, `contact.js`, `careers.js`, `solution-page.js` et `assets/data/customers.json`. Scripts et sorties dans le dossier scratchpad `tools/volet3/`. Aucun fichier du site modifié. Date de référence : 18 septembre 2026.

## Tableau des constats

| Sévérité | Page(s) | Fichier:ligne | Constat | Correction exacte |
|---|---|---|---|---|
| MAJEUR | /index-fr, /tarifs | index-fr.html:146, 157, 158, 162, 163 ; tarifs.html:64, 75, 76, 80, 81 (texte visible) ; index-fr.html:165, 166 ; tarifs.html:83, 84 (aria-valuetext, aria-label lus par lecteur d'écran) ; pricing.js:28 (aria-valuetext réinjecté au runtime : `' leads par semaine'`) ; tarifs.html:8 (meta description) | Le mot « leads » apparaît 5 fois dans le texte visible du bloc tarifaire de chaque page FR (« le nombre de leads que vous recevez chaque semaine », « 50 leads qualifiés par semaine », « Besoin de plus de 200 leads par semaine ? », « Leads par semaine », « 50 leads »), 3 fois dans les attributs ARIA et 1 fois dans la meta description de /tarifs. Le reste du site FR dit « fiches » (faq-fr.html, conditions.html, notre-solution.html). | index-fr.html:146 et tarifs.html:64 : `Un seul forfait. Vous ajustez simplement le nombre de fiches que vous recevez chaque semaine.` ; :157/:75 : `<strong data-pricing-leads>50</strong> fiches qualifiées par semaine` ; :158/:76 : `Besoin de plus de 200 fiches par semaine ?` ; :162/:80 : `Fiches par semaine` ; :163/:81 : `<span data-pricing-leads>50</span> fiches` ; :165/:83 : `aria-valuetext="50 fiches par semaine" aria-label="Fiches par semaine"` ; :166/:84 : `aria-label="Fiches par semaine"` ; pricing.js:28 : `(isFr ? ' fiches par semaine' : ' leads per week')` ; tarifs.html:8 : `Tarifs Synthetic Swarm, choisissez le nombre de fiches qualifiées reçues chaque semaine.` (les attributs techniques `data-pricing-leads` / `data-leads` ne sont pas visibles et peuvent rester) |
| MAJEUR | /a-propos | a-propos.html:83 | Bio d'Ilan en FR : « automatisé des process et travaillé sur la conversion des leads » (texte visible d'une page FR). | `J’y ai construit des outils, automatisé des process et travaillé sur la conversion des prospects.` |
| MAJEUR | /, /index-fr | index.html:137-142 ; index-fr.html:137-142 ; assets/data/customers.json:2 (`"customers": []`) ; customers.html:59 (« Customer stories are coming soon. ») ; customers.js:63-66 | La section « Our customers say it best. » / « Ce sont nos clients qui en parlent le mieux. » affiche trois cartes vides dont l'accessibilité annonce explicitement `aria-label="Customer testimonial placeholder 1"` (EN) et `aria-label="Emplacement de témoignage client 1"` (FR), alors qu'aucun témoignage vérifié n'existe (`customers.json` vide, page /customers en état « coming soon »). Une preuve sociale visiblement factice affaiblit la page pour un prospect. customers.js:66 (`if (preview) host.hidden = false;`) est déjà prévu pour révéler la section quand 3 témoignages vérifiés existent. | index.html:137 et index-fr.html:137 : ajouter l'attribut `hidden` sur la section : `<section id="customer-proof" class="content-page home-customer-proof" data-customer-stories data-customer-preview aria-labelledby="customer-preview-title" hidden>` (le JS la réaffichera automatiquement dès 3 témoignages vérifiés) |
| MAJEUR (à arbitrer avec le produit) | /, /index-fr, /pricing, /tarifs, /faq, /faq-fr, /our-solution, /notre-solution, /privacy, /confidentialite | index.html:179, 201 ; index-fr.html:179, 201 ; pricing.html:97, 121 ; tarifs.html:97, 121 ; faq.html:148 (+ JSON-LD :41) ; faq-fr.html:148 (+ JSON-LD :38) ; our-solution.html:71 (option « Email + LinkedIn »), 82, 83 (« LinkedIn ↗ » dans la fiche) ; notre-solution.html:71, 82, 83 ; privacy.html:61 ; confidentialite.html:61 | Le profil LinkedIn du dirigeant est vendu comme donnée livrée (« Phone, email and LinkedIn profile » / « Téléphone, email et profil LinkedIn », FAQ « email and LinkedIn profile », fiche exemple avec lien LinkedIn, sélecteur « Email + LinkedIn »), alors que les meta descriptions (index.html:8, index-fr.html:8) et la définition produit (nom, téléphone, raison d'appeler) ne le mentionnent pas. Si le profil LinkedIn n'est pas réellement livré, c'est une promesse fausse ; s'il l'est, aligner les meta et clore ce constat. Les liens LinkedIn des fondateurs (about, a-propos, contact, contact-fr) ne sont pas concernés. | Si non livré : index.html:179 et pricing.html:97 : `Phone and email` ; index-fr.html:179 et tarifs.html:97 : `Téléphone et email` ; index.html:201, pricing.html:121, faq.html:148 (+ JSON-LD) : `The executive's first and last name, mobile number (and landline if available) and email. You also get the reason for the call: the change in situation we detected, with its date.` ; index-fr.html:201, tarifs.html:121, faq-fr.html:148 (+ JSON-LD) : `Nom et prénom du dirigeant, téléphone portable (et ligne fixe si disponible) et email. Plus la raison de l'appel : le changement de situation que nous avons détecté, avec sa date.` ; our-solution.html:71 : supprimer `<option>Email + LinkedIn</option>` ; :82 : `Phone and email according to your criteria and availability` ; :83 : supprimer `<li>LinkedIn ↗</li>` ; notre-solution.html:71, 82 (`Téléphone et email selon vos critères et leur disponibilité`), 83 : idem |
| MAJEUR | /, /index-fr vs /our-solution, /notre-solution, /privacy, /confidentialite | index.html:8 (« French public registers only. ») ; index-fr.html:8 (« Registres publics français uniquement. ») vs our-solution.html:74 (nœuds « Company websites », « Career pages », « Team pages », « Public professional profiles », « Public web presence », « Company news », « Press releases », « Industry publications ») ; notre-solution.html:74 (« Sites d’entreprises », « Pages carrières », « Pages équipes », « Profils professionnels publics », « Présence web publique », « Communiqués », « Publications professionnelles ») ; privacy.html:63 / confidentialite.html:63 (« public and professional sources » / « sources publiques et professionnelles ») | Contradiction de fond sur les sources : la meta description de la home (extrait Google) promet « registres publics uniquement », la page solution affiche un nuage de sources web non registrales (sites d'entreprises, pages carrières, communiqués, presse). L'une des deux affirmations est fausse pour le prospect. | Si le produit n'exploite que les registres : our-solution.html:74 et notre-solution.html:74, supprimer les 8 nœuds `<span class="eng-node ...">Company websites</span>`, `Career pages`, `Team pages`, `Public professional profiles`, `Public web presence`, `Company news`, `Press releases`, `Industry publications` et leurs équivalents FR. Sinon : index.html:8 : `Synthetic Swarm spots the executives whose situation has just changed and delivers their name, their phone number and the reason to call them, every week. Built on French public sources.` ; index-fr.html:8 : `Synthetic Swarm repère les dirigeants dont la situation vient de changer et vous livre chaque semaine leur nom, leur téléphone et la raison de les appeler. Sources publiques françaises.` |
| MINEUR | /index-fr (et /) | index-fr.html:86 ; index.html:86 | Bandeau « BREAKING NEWS · 17 SEPTEMBRE 2026 · Synthetic Swarm emménage à San Francisco. » : le badge est en anglais sur la page FR, et la date est codée en dur (`datetime="2026-09-17"`) sans mécanisme d'expiration : « breaking » deviendra faux en quelques jours. Date cohérente avec a-propos.html:88 (« Septembre 2026 · San Francisco »). | index-fr.html:86 : `<span class="hero-eyebrow-badge">ACTUALITÉ</span>` ; index.html:86 : `<span class="hero-eyebrow-badge">NEWS</span>` ; prévoir de retirer le bandeau ou de le remplacer par le prochain fait daté après le 1er octobre 2026 |
| MINEUR | /our-solution, /notre-solution | our-solution.html:71 (2 occurrences) ; notre-solution.html:71 (2 occurrences) | Demi-cadratins U+2013 dans les options de taille : « 1(U+2013)50 employees », « 51(U+2013)200 employees » / « 1(U+2013)50 salariés », « 51(U+2013)200 salariés ». Seules occurrences de U+2013/U+2014 dans le corps des 26 pages. | our-solution.html:71 : `<option>1 to 50 employees</option>` et `<option>51 to 200 employees</option>` ; notre-solution.html:71 : `<option>1 à 50 salariés</option>` et `<option>51 à 200 salariés</option>` |
| MINEUR | /careers, /recrutement | careers.html:65, 66, 67, 68 ; recrutement.html:65, 66, 67, 68 (attribut href) | Les 8 sujets de mailto contiennent un cadratin encodé `%E2%80%94` (U+2014) que le candidat verra dans l'objet de son email (« Application: Sales France (cadratin) Synthetic Swarm »). | Remplacer `%20%E2%80%94%20` par `%20-%20` dans les 8 href, ex. careers.html:65 : `mailto:contact@syntheticswarm.ai?subject=Application%3A%20Sales%20France%20-%20Synthetic%20Swarm` ; recrutement.html:65 : `mailto:contact@syntheticswarm.ai?subject=Candidature%20Sales%20France%20-%20Synthetic%20Swarm` |
| MINEUR | /, /pricing, /faq, /index-fr, /tarifs, /faq-fr | index.html:197 ; pricing.html:117 ; faq.html:147 (+ JSON-LD :33) ; index-fr.html:197 ; tarifs.html:117 ; faq-fr.html:147 (+ JSON-LD :30) | « We continuously monitor for executives... » / « Nous surveillons en continu pour détecter les dirigeants... » : promesse de fonctionnement continu invérifiable par le prospect, alors que la livraison est hebdomadaire (même phrase : « Every week, you receive » / « Chaque semaine, vous recevez »). Pas contradictoire (détection vs livraison) mais à confronter au fonctionnement réel. Aucune occurrence de « real time », « real-time » ou « temps réel ». | EN : `We monitor public registers for executives whose situation creates a new insurance need.` ; FR : `Nous surveillons les registres publics pour détecter les dirigeants dont un besoin en assurance apparaît.` (à reporter dans le JSON-LD de faq.html:33 et faq-fr.html:30) |
| MINEUR | /faq vs /, /pricing | faq.html:148 (+ JSON-LD :41) vs index.html:201 et pricing.html:121 | La même réponse EN « What information do I get? » existe en deux versions : « (and landline if available) ... the change in circumstances » (FAQ) contre « (and landline if provided) ... the change in situation » (home, pricing). Les 3 versions FR sont identiques. | index.html:201 et pricing.html:121 : `The executive's first and last name, mobile number (and landline if available), email and LinkedIn profile. You also get the reason for the call: the change in circumstances we detected, with its date.` (ou l'inverse, mais une seule version) |
| MINEUR | /our-solution vs / | our-solution.html:78, 83 (« Ateliers Exemple », « Camille Exemple ») vs index.html:134 (« Example Workshop », « Camille Example ») ; our-solution.html:83 (« Company director ») vs :71, 73, 78 (« Company leader ») | La persona d'exemple porte des noms français sur la page solution EN et anglais sur la home EN ; son titre change entre « Company leader » et « Company director » sur la même page. | our-solution.html:78 : `<small>Example Workshop</small><h3>Camille Example</h3>` ; :83 : `<p>Example Workshop</p><h3>Camille Example</h3><span>Company leader</span>` |
| MINEUR | / vs /index-fr | index.html:128 (« Industry », « Company size », « Geography ») vs index-fr.html:128 (« Métier », « Taille », « Zone ») et index.html:180 (« profession, company size and location ») | Le critère de ciblage s'appelle « Industry » dans le schéma de la home EN mais « profession » partout ailleurs en EN et « Métier » en FR. | index.html:128 : `<ul><li>Profession</li><li>Company size</li><li>Geography</li></ul>` |
| MINEUR | 13 pages EN vs 13 pages FR (footer partagé) | index.html:222 (« The right person. The right signal. The right time. ») vs index-fr.html:222 (« Sachez qui appeler. Au bon moment. ») ; même écart sur les 24 autres footers | La signature du pied de page n'est pas la même promesse dans les deux langues (la FR reprend le H1, l'EN une triade). | Footer FR (index-fr.html:222 et les 12 autres pages FR) : `<p>La bonne personne. Le bon signal. Le bon moment.</p>` |
| MINEUR | /mentions-legales | mentions-legales.html:61 vs legal-notice.html:61 | L'adresse FR omet le pays présent en EN (« 62690 Izel-lès-Hameau<br>France »). | mentions-legales.html:61 : `<p>15 rue de la Gare<br>62690 Izel-lès-Hameau<br>France</p>` |
| MINEUR | /our-solution, /notre-solution vs /pricing, /tarifs | our-solution.html:71 et notre-solution.html:71 (`type="range" min="10" max="200" step="10"`, sortie « 50 / week » / « 50 / semaine », solution-page.js:18) vs pricing.html:85-90, tarifs.html:85-90 et pricing.js:6-11 (paliers 10, 20, 50, 100, 200, 200+) | Le configurateur de la page solution laisse choisir 30, 40, 60... fiches par semaine, volumes qui n'existent pas dans la grille tarifaire. L'unité (volume hebdomadaire, prix mensuel en €) est en revanche cohérente entre home, solution, tarifs, FAQ et CGV (terms.html:63-65 / conditions.html:64-66 : facturation mensuelle, prix et volumes ceux de la page Tarifs). | our-solution.html:71 et notre-solution.html:71 : `<input id="target-volume" type="range" min="0" max="4" step="1" value="2" aria-describedby="target-volume-value">` avec les graduations `<span>10</span><span>200</span>` conservées, et solution-page.js:18 mappant l'index sur `[10, 20, 50, 100, 200]` |
| MINEUR | /about, /a-propos | about.html:88-89 ; a-propos.html:88-89 | Chronologie : « February 2026 · Synthetic Swarm starts » puis « July 2026 · First customers in France » (5 mois), mais la phrase suivante dit « A few weeks after launch, Synthetic Swarm signs its first insurance customers. » / « Quelques semaines après le lancement... ». Identique dans les deux langues, mais ambigu pour le lecteur (« starts » vs « launch »). | about.html:89 : `A few weeks after its commercial launch, Synthetic Swarm signs its first insurance customers.` ; a-propos.html:89 : `Quelques semaines après son lancement commercial, Synthetic Swarm signe ses premiers clients dans l’assurance.` |

## Tableau des 13 paires (sections, chiffres, FAQ, CTA : OK/écart)

| Paire (EN | FR) | Sections | Chiffres | FAQ | CTA (texte + cible) | Éléments désactivés | Verdict |
|---|---|---|---|---|---|---|---|
| index.html | index-fr.html | 7 | 7, même ordre (hero, comparison, solution-preview, customer-proof, pricing, faq, newsletter) | OK : 399 € /month vs /mois, 50, 200, paliers 10/20/50/100/200/200+, 17 sept. 2026, 11 août 2026, © 2026 | 3 | 3 mêmes questions, même ordre | OK : Book a demo / Réserver une démo ; Discover our solution → /our-solution / Découvrir notre solution → /notre-solution ; Choose this plan / Choisir ce forfait → app.syntheticswarm.ai ; Book a call / Réserver un rendez-vous ; Subscribe / S’inscrire | OK : `<fieldset disabled>` newsletter (index.html:212, index-fr.html:212) ; nav « Media »/« Médias » désactivé (:59) ; footer « Customers »/« Nos clients » et « Media »/« Médias » désactivés (:224) | Écarts : « leads » FR (MAJEUR), signature footer (MINEUR), critères « Industry » vs « Métier » (MINEUR), badge « BREAKING NEWS » en anglais sur FR (MINEUR) ; stylistique : sous-titre FR sans « au bon moment » (index.html:87 vs index-fr.html:87) |
| our-solution.html | notre-solution.html | 8 | 8, même ordre (hero, targeting, engine, moments, qualification, verification, prospect, cta) | OK : 50 / week vs 50 / semaine, curseur 10-200, 1-50 et 51-200, « 60+ », étapes 01-04 | 6 | 6 « moments » identiques, même ordre ; 1 `<details>` « Phone checks »/« Contrôle du téléphone » | OK : Book a demo / Réserver une démo ; See pricing → /pricing / Voir les tarifs → /tarifs (x2) | aucun | Écarts : U+2013 dans les deux (MINEUR), persona « Ateliers Exemple » sur EN (MINEUR), LinkedIn livré (MAJEUR à arbitrer), nuage de sources vs meta home (MAJEUR) ; stylistique : « MOMENTS THAT MATTER » vs « MOMENTS DÉTECTÉS », « One clear opportunity » vs « Une seule lecture exploitable » |
| pricing.html | tarifs.html | 1 | 1 | OK : identiques à la home (pricing.js commun : 10→89 €, 20→169 €, 50→399 €, 100→789 €, 200→1 499 €, 200+→sur mesure ; devise €, format fr-FR / en-US) | 3 | 3 mêmes questions | OK : Choose this plan / Choisir ce forfait → app ; Book a call / Réserver un rendez-vous | aucun (badge « Preferred plan »/« Forfait préféré » masqué par JS hors palier 50 dans les deux) | Écart : « leads » FR corps + meta (MAJEUR) |
| faq.html | faq-fr.html | 3 | 3 (intro, liste, contact) | OK : « 30 minutes » / « 30 minutes », 11 août 2026 | 10 | 10 questions, même ordre, JSON-LD FAQPage aligné sur le corps dans les deux | OK : Contact the team → /contact / Contacter l’équipe → /contact-fr | aucun | OK ; stylistique : rubriques « Signals » vs « Signal », « Contact details » vs « Contact » ; variante EN de la réponse 2 vs home/pricing (MINEUR) |
| about.html | a-propos.html | 4 | 4 (intro, fondateurs, chronologie, San Francisco) | OK : 19 ans, €1M vs 1 M€, fév./juil./sept. 2026, « five years » / « cinq ans » | s.o. | s.o. | OK : LinkedIn Axel / LinkedIn Ilan, mêmes URL | 3 emplacements photo `aria-hidden` vides dans les deux (about.html:95-97, a-propos.html:95-97) | Écarts : « leads » FR (MAJEUR), chronologie « a few weeks » (MINEUR) |
| careers.html | recrutement.html | 4 | 4 (hero, 3 raisons, 4 postes, spontanée) | OK : 01-03 | s.o. | 4 postes identiques, même ordre (Sales France, Sales US, Tech / AI Engineer, Chief of Staff) | OK : 4 Apply / Postuler → mailto avec sujet traduit ; Send a spontaneous application / Envoyer une candidature spontanée → mailto | aucun | Écart : cadratin encodé dans les 8 mailto (MINEUR) ; stylistique : « No layers of management » vs « Pas cinq couches de management » |
| contact.html | contact-fr.html | 2 + formulaire | 2 (intro, email) + 6 champs identiques (Last name/Nom, First name/Prénom, Email, Company/Entreprise, Subject/Sujet, Message) | s.o. | s.o. | s.o. | OK : contact@syntheticswarm.ai ; Send an email / Envoyer un email ; Copy / Copier ; Send / Envoyer ; LinkedIn fondateurs | aucun (piège anti-spam « Website » `aria-hidden` non traduit en FR : invisible, acceptable) | OK |
| customers.html | clients.html | 3 | 3 (intro, grille + état vide, CTA) | s.o. | s.o. | s.o. | OK : Book a demo / Réserver une démo | aucun | OK (page accessible par URL mais lien footer désactivé dans les deux langues) |
| media.html | medias.html | 2 + état vide | 2 (intro, contact médias) + `<template>` | s.o. | s.o. | s.o. | OK : Contact the team → /contact / Contacter l’équipe → /contact-fr | aucun | OK |
| legal-notice.html | mentions-legales.html | 0 (4 `<p>`) | 0 (4 `<p>`) | OK : SIREN / RCS 993 422 120, 62690 | s.o. | s.o. | mailto identique | aucun | Écart : « France » absent en FR (MINEUR) |
| privacy.html | confidentialite.html | 6 | 6, même ordre | s.o. | s.o. | s.o. | mailto identique | aucun | OK (mention « public LinkedIn profile » / « profil LinkedIn public » dans les deux : cohérent avec la promesse produit, à faire évoluer si le constat LinkedIn est tranché) |
| terms.html | conditions.html | 21 | 21, même ordre, mêmes numéros | OK : €40 vs 40 €, « one month » / « un mois », facturation mensuelle, « September 2026 » / « septembre 2026 » | s.o. | s.o. | OK : lien Pricing → /pricing / Tarifs → /tarifs ; Privacy Policy → /privacy / Politique de confidentialité → /confidentialite ; mailto | aucun | OK ; vocabulaire : « prospect profiles » (EN) vs « fiches » (FR), cohérent avec chaque langue |
| opt-out.html | opposition.html | 0 (3 `<p>`) | 0 (3 `<p>`) | s.o. | s.o. | s.o. | OK : Send an email → / Envoyer un email → (mailto, corps de message équivalent) | aucun | OK |

Header et footer : identiques à la home de leur langue sur les 24 autres pages ; seules les cibles du sélecteur de langue changent (vers la page jumelle), ce qui est correct.

## Liste brute des greps

Format : fichier:ligne [zone] « extrait ». Zone : BODY (texte visible), BODY-ATTR:nom (attribut), HEAD (`<head>`, meta ou JSON-LD).

### Famille 1 : « lead(s) » dans les pages FR (24 occurrences)

- index-fr.html:146 [BODY] « ...us ajustez simplement le nombre de leads que vous recevez chaque semaine.</p> »
- index-fr.html:157 [BODY-ATTR:data-pricing-leads + BODY] « <strong data-pricing-leads>50</strong> leads qualifiés par semaine</p> »
- index-fr.html:158 [BODY] « <h2>Besoin de plus de 200 leads par semaine ?</h2><p>Parlons de votre volume »
- index-fr.html:162 [BODY] « <span class="pricing-volume-label">Leads par semaine</span> »
- index-fr.html:163 [BODY-ATTR:data-pricing-leads + BODY] « <span data-pricing-leads>50</span> leads</span> »
- index-fr.html:165 [BODY-ATTR:aria-valuetext + aria-label] « aria-valuetext="50 leads par semaine" aria-label="Leads par semaine" »
- index-fr.html:166 [BODY-ATTR:aria-label] « role="group" aria-label="Leads par semaine" »
- index-fr.html:183 [BODY-ATTR:data-leads] « data-pricing-checkout data-leads="50" data-price="399" » (technique, invisible)
- tarifs.html:8 [HEAD] « choisissez le nombre de leads qualifiés reçus chaque semaine. »
- tarifs.html:64 [BODY] « ...us ajustez simplement le nombre de leads que vous recevez chaque semaine.</p> »
- tarifs.html:75 [BODY-ATTR + BODY] « <strong data-pricing-leads>50</strong> leads qualifiés par semaine</p> »
- tarifs.html:76 [BODY] « <h2>Besoin de plus de 200 leads par semaine ?</h2> »
- tarifs.html:80 [BODY] « <span class="pricing-volume-label">Leads par semaine</span> »
- tarifs.html:81 [BODY-ATTR + BODY] « <span data-pricing-leads>50</span> leads</span> »
- tarifs.html:83 [BODY-ATTR:aria-valuetext + aria-label] « aria-valuetext="50 leads par semaine" aria-label="Leads par semaine" »
- tarifs.html:84 [BODY-ATTR:aria-label] « role="group" aria-label="Leads par semaine" »
- tarifs.html:101 [BODY-ATTR:data-leads] « data-pricing-checkout data-leads="50" data-price="399" » (technique, invisible)
- a-propos.html:83 [BODY] « ...et travaillé sur la conversion des leads. J’ai compris que <strong>la vraie difficult... »
- Hors pages : pricing.js:28 « (isFr ? ' leads par semaine' : ' leads per week') » (aria-valuetext FR au runtime) ; assets/data/customers.json:6 labelEn « of leads considered relevant » vs labelFr « de prospects jugés pertinents » (statistique désactivée, EN uniquement)

### Famille 2 : U+2014 / U+2013 dans le corps (4 occurrences directes + 8 encodées)

- our-solution.html:71 [BODY] « <option>1(U+2013)50 employees</option> »
- our-solution.html:71 [BODY] « <option>51(U+2013)200 employees</option> »
- notre-solution.html:71 [BODY] « <option>1(U+2013)50 salariés</option> »
- notre-solution.html:71 [BODY] « <option>51(U+2013)200 salariés</option> »
- careers.html:65, 66, 67, 68 [BODY-ATTR:href] « subject=Application%3A%20Sales%20France%20%E2%80%94%20Synthetic%20Swarm » (et Sales US, Tech, Chief of Staff) : U+2014 encodé
- recrutement.html:65, 66, 67, 68 [BODY-ATTR:href] « subject=Candidature%20Sales%20France%20%E2%80%94%20Synthetic%20Swarm » (et Sales US, Tech, Chief of Staff) : U+2014 encodé
- Aucune occurrence dans les 22 autres pages (les apostrophes typographiques U+2019 et les puces « · » ne sont pas concernées).

### Famille 3 : « en continu », « continuously », « real time », « temps réel » (9 occurrences)

- index.html:197 [BODY] « We continuously monitor for executives whose situation creat... »
- pricing.html:117 [BODY] idem
- faq.html:33 [HEAD JSON-LD] idem ; faq.html:147 [BODY] idem
- index-fr.html:197 [BODY] « Nous surveillons en continu pour détecter les dirigeants dont un besoin ... »
- tarifs.html:117 [BODY] idem
- faq-fr.html:30 [HEAD JSON-LD] idem ; faq-fr.html:147 [BODY] idem
- terms.html:73 [BODY] « without guaranteeing continuous or uninterrupted availability » (clause de disponibilité, hors sujet produit ; pas d'équivalent littéral en FR : conditions.html:74 « disponibilité permanente ou sans interruption »)
- « real time », « real-time », « temps réel » : 0 occurrence.

### Famille 4 : « fictif », « fictional », « invented », « inventé », « fictive », « exemple fictif » (0 occurrence) ; « placeholder » (6 occurrences signifiantes)

- index.html:140, 141, 142 [BODY-ATTR:aria-label] « aria-label="Customer testimonial placeholder 1" » (2, 3)
- index-fr.html:140, 141, 142 [BODY-ATTR:aria-label] « aria-label="Emplacement de témoignage client 1" » (2, 3)
- (les autres occurrences sont des noms de classe CSS `customer-placeholder*` et l'attribut `placeholder="Your email"` / « Votre email » du formulaire newsletter : non signifiants)
- Les personas d'exemple sont explicitement nommées « Example Workshop / Camille Example » (index.html:134), « Ateliers Exemple / Camille Exemple » (index-fr.html:134, our-solution.html:78, 83, notre-solution.html:78, 83) avec « 06 XX XX XX XX » et « camille@... » : présentées comme exemples, pas comme preuves.

### Famille 5 : « per week », « par semaine », « / week », « / semaine », « hebdo » et voisinage d'un prix (56 occurrences)

Unité affichée : prix mensuel en euros (`399 €` + `/month` ou `/mois`, pricing.js : montants 89, 169, 399, 789, 1 499 €) pour un volume hebdomadaire (« 50 qualified leads per week » / « 50 leads qualifiés par semaine »). Pas d'incohérence d'unité entre home, solution (« 50 / week », volume seul), tarifs, FAQ (« every week » / « chaque semaine ») et CGV (terms.html:64-65, conditions.html:65-66 : facturation mensuelle ; terms.html:63 / conditions.html:64 : prix et volumes ceux de la page Tarifs). « hebdo » : 0 occurrence.

- index.html:8 [HEAD] « the reason to call them, every week. » ; :146 [BODY] « qualified leads you want to receive every week. » ; :157 « 50 qualified leads per week » ; :158 « Need more than 200 leads per week? » ; :162 « Leads per week » ; :165 [aria-valuetext + aria-label] « 50 leads per week » / « Leads per week » ; :166 [aria-label] « Leads per week » ; :177 « Verified prospect profiles delivered every week » ; :197 « Every week, you receive verified prospect profiles »
- our-solution.html:63 [BODY] « a clear reason to reach out this week. » ; :71 « <output ...>50 / week</output> »
- pricing.html:8 [HEAD] « how many qualified leads you want every week. » ; :64, :75, :76, :80, :83 (aria), :84 (aria), :95, :117 : mêmes extraits que index.html:146-197
- faq.html:33, 49, 81 [HEAD JSON-LD] « Every week, you receive », « an issue to address this week », « verified profiles every week » ; :147, :149, :153 [BODY] idem
- index-fr.html:8 [HEAD] « vous livre chaque semaine leur nom » ; :146 « le nombre de leads que vous recevez chaque semaine. » ; :157 « 50 leads qualifiés par semaine » ; :158 « Besoin de plus de 200 leads par semaine ? » ; :162 « Leads par semaine » ; :165 (aria) « 50 leads par semaine » / « Leads par semaine » ; :166 (aria) ; :177 « Fiches vérifiées livrées chaque semaine » ; :197 « Chaque semaine, vous recevez des fiches vérifiées »
- notre-solution.html:63 [BODY] « une raison claire de les contacter cette semaine. » ; :71 « <output ...>50 / semaine</output> »
- tarifs.html:8 [HEAD] « leads qualifiés reçus chaque semaine. » ; :64, :75, :76, :80, :83 (aria), :84 (aria), :95, :117 : mêmes extraits que index-fr.html:146-197
- faq-fr.html:30, 46, 78 [HEAD JSON-LD] « Chaque semaine, vous recevez », « un sujet ouvert cette semaine », « fiches vérifiées chaque semaine » ; :147, :149, :153 [BODY] idem

### Famille 6 : « BREAKING NEWS » et bandeaux d'actualité (2 pages)

- index.html:86 [BODY] « <span class="hero-eyebrow-badge">BREAKING NEWS</span> · <time class="hero-eyebrow-date" datetime="2026-09-17">SEPTEMBER 17, 2026</time> · Synthetic Swarm moves to San Francisco. »
- index-fr.html:86 [BODY] « <span class="hero-eyebrow-badge">BREAKING NEWS</span> · <time ... datetime="2026-09-17">17 SEPTEMBRE 2026</time> · Synthetic Swarm emménage à San Francisco. »
- Aucun autre bandeau d'actualité sur les 24 autres pages.

### Famille 7 : dates (toutes les dates trouvées, avec contexte)

- 2026-09-17 / « SEPTEMBER 17, 2026 » / « 17 SEPTEMBRE 2026 » : index.html:86, index-fr.html:86 (bandeau, veille du jour de l'audit : présentée comme récente, conforme)
- « August 11, 2026 » / « 11 août 2026 » : index.html:205, pricing.html:125, faq.html:105 [HEAD], faq.html:156, index-fr.html:205, tarifs.html:125, faq-fr.html:102 [HEAD], faq-fr.html:156 (« prior-consent requirement introduced on » / « consentement préalable instauré le » : fait juridique au passé, antérieur au 18 septembre 2026, conforme)
- « February 2026 » / « Février 2026 » (datetime 2026-02), « July 2026 » / « Juillet 2026 » (2026-07), « September 2026 » / « Septembre 2026 » (2026-09) : about.html:88, a-propos.html:88 (chronologie : création, premiers clients, San Francisco ; pas présentées comme « récentes » sauf septembre 2026, mois courant)
- « SEPTEMBER 2026 » / « SEPTEMBRE 2026 » (kicker) et « September 2026 » / « Septembre 2026 » (datetime 2026-09) : about.html:92, a-propos.html:92 (installation à San Francisco, mois courant)
- « Last updated: September 2026 » / « Dernière mise à jour : septembre 2026 » : terms.html:60, conditions.html:61 (conforme)
- « © 2026 » : footer des 26 pages (index.html:233, index-fr.html:233, our-solution.html:104, notre-solution.html:104, pricing.html:143, tarifs.html:143, faq.html:170, faq-fr.html:170, about.html:115, a-propos.html:115, careers.html:84, recrutement.html:84, contact.html:71, contact-fr.html:71, customers.html:79, clients.html:79, media.html:72, medias.html:72, legal-notice.html:77, mentions-legales.html:77, privacy.html:79, confidentialite.html:79, terms.html:95, conditions.html:96, opt-out.html:76, opposition.html:76)
- Aucune date postérieure au 18 septembre 2026. Aucune date antérieure au 1er septembre 2026 présentée comme récente : les « vient de » / « just » (index.html:8, index-fr.html:8, faq.html:149, faq-fr.html:149) ne sont attachés à aucune date.
- Faux positifs du grep : le mot anglais « may » (our-solution.html:80-81, privacy.html:61-65, terms.html:65-79) n'est pas une date.

### Famille 8 : LinkedIn (48 occurrences, dont 22 comme donnée livrée)

Donnée livrée ou fonctionnalité :
- index.html:179 [BODY] « Phone, email and LinkedIn profile » ; index.html:201 [BODY] « email and LinkedIn profile. You also get the reason for the call »
- index-fr.html:179 [BODY] « Téléphone, email et profil LinkedIn » ; index-fr.html:201 [BODY] « email et profil LinkedIn. Plus la raison de l'appel »
- pricing.html:97, 121 [BODY] ; tarifs.html:97, 121 [BODY] : idem
- faq.html:41 [HEAD JSON-LD], 148 [BODY] « email and LinkedIn profile » ; faq-fr.html:38 [HEAD JSON-LD], 148 [BODY] « email et profil LinkedIn »
- our-solution.html:71 [BODY] « <option>Email + LinkedIn</option> » ; :82 « Phone, email and LinkedIn according to your criteria and availability » ; :83 « <li>LinkedIn ↗</li> » (fiche exemple)
- notre-solution.html:71 [BODY] « <option>Email + LinkedIn</option> » ; :82 « Téléphone, email et LinkedIn selon vos critères et leur disponibilité » ; :83 « <li>LinkedIn ↗</li> »
- privacy.html:61 [BODY] « professional contact details, public LinkedIn profile » ; confidentialite.html:61 [BODY] « coordonnées professionnelles, profil LinkedIn public »
Liens vers les profils des fondateurs (hors périmètre du constat) :
- about.html:34, 39 [HEAD JSON-LD sameAs], 82, 83 [href + aria-label + texte « LinkedIn ↗ »] ; a-propos.html:34, 39, 82, 83 ; contact.html:58 (x2) ; contact-fr.html:58 (x2)

### Famille 9 (bonus) : vocabulaire produit, texte visible du corps uniquement (hors attributs, `<head>`, scripts, adresses email)

| Page | fiche(s) | profil(s) | contact(s) | lead(s) | prospect(s) | record(s) | profile(s) |
|---|---|---|---|---|---|---|---|
| index.html | | | 4 | 5 | 5 | | 4 |
| index-fr.html | 2 | 2 | 2 | 5 | 3 | | |
| our-solution.html | | | 7 | | 1 | | 3 |
| notre-solution.html | 3 | 1 | 3 | | | | |
| pricing.html | | | 1 | 5 | 2 | | 4 |
| tarifs.html | 2 | 2 | 1 | 5 | | | |
| faq.html | | | 5 | | 1 | 5 | 3 |
| faq-fr.html | 7 | 1 | 3 | | | | |
| about.html | | | 2 | 1 | 1 | | |
| a-propos.html | | | 2 | 1 | 1 | | |
| careers.html | | | 1 | | 2 | | |
| recrutement.html | | | 1 | | 2 | | |
| contact.html | | | 2 | | | | |
| contact-fr.html | | | 2 | | | | |
| customers.html | | | 1 | | | | |
| clients.html | | | 1 | | | | |
| media.html | | | 2 | | | | |
| medias.html | | | 2 | | | | |
| legal-notice.html | | | 2 | | | | |
| mentions-legales.html | | | 2 | | | | |
| privacy.html | | | 3 | | 1 | | 2 |
| confidentialite.html | 1 | 1 | 2 | | | | |
| terms.html | | | 6 | | 5 | | 9 |
| conditions.html | 9 | | 3 | | 2 | | |
| opt-out.html | | | 2 | | | | |
| opposition.html | | | 1 | | | | |

Lecture : « contact(s) » compte surtout le lien de navigation « Contact » (footer, 1 par page) et les mots « coordonnées / contact details » : peu discriminant. En FR, l'objet livré est « fiche » (24 occurrences) sauf sur la home et /tarifs où le bloc tarifaire dit « leads » (10 occurrences visibles) et « profil » n'apparaît que dans « profil LinkedIn ». En EN, trois mots coexistent pour le même objet : « prospect profiles » / « profiles » (home, pricing, terms, privacy, solution : 25), « records » (faq.html uniquement : 5, ex. faq.html:150 « any record without a reachable contact method », :152 « the same records as me? », :153 « How often are records delivered? », :155 « if the records do not match ») et « leads » (bloc tarifaire : 15). Recommandation : « fiche(s) » partout en FR ; « profile(s) » partout en EN (remplacer les 5 « record(s) » de faq.html:150-155 et du JSON-LD faq.html:57-97, et « leads » du bloc tarifaire par « profiles » si la marque veut sortir du mot « lead »).

## Compte : 0 bloquant, 5 majeurs, 11 mineurs

- BLOQUANT : 0 (aucune page cassée, aucun prix ou CTA divergent entre FR et EN).
- MAJEUR : 5 (« leads » dans le bloc tarifaire FR ; « leads » dans la bio FR ; placeholders de témoignages sur la home ; profil LinkedIn vendu comme donnée livrée, à arbitrer ; « registres publics uniquement » contredit par le nuage de sources).
- MINEUR : 11.

## Non couvert

- Rendu navigateur : je n'ai pas fait de captures ; l'analyse porte sur les fichiers source (les états `hidden` et le contenu injecté par pricing.js / solution-page.js / contact.js ont été lus dans le code, pas observés à l'écran).
- Le contenu de `mobile-menu.js` (menu mobile généré en JS) n'a été vérifié que pour les libellés « Ouvrir le menu » / « Open menu » ; la copie du menu mobile n'a pas été comparée mot à mot.
- Les fichiers hors périmètre des 26 pages (README.md, BRAND.md, LEGAL_AUDIT.md, sitemap.xml, api/) n'ont pas été audités.
- Exactitude juridique de la date du 11 août 2026 : non vérifiée par une source externe (cohérente entre les 8 occurrences).
- Vérité produit des promesses « profil LinkedIn », « surveillance en continu », « moins de 30 minutes », sources non registrales : non vérifiable depuis le code, signalée pour arbitrage.

## git status

Sortie de `git status --short` après rédaction. Seul `docs/audit-site/audit-site-03-contenu.md` appartient au volet 3 ; `audit-site-02-liens.md` et le dossier de captures `screens/` sont produits par les autres volets en parallèle. Aucun fichier du site n'a été modifié, créé ou supprimé par le volet 3.

```
?? docs/audit-site/audit-site-02-liens.md
?? docs/audit-site/audit-site-03-contenu.md
?? docs/audit-site/screens/
```
