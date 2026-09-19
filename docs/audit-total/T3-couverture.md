# Flux T3 : couverture des cinq inventaires
Périmètre : vérifier que chaque ligne de inventaire/pages.csv (26), actions.csv (1 518), fichiers.csv (130), emails.csv (17) et tiers.csv (78) a au moins un verdict dans un rapport de phase 1 ; relancer le flux concerné sur les lignes orphelines.
Outils : scripts Python tools/phase2/coverage.py (correspondance par mention : URL ou fichier ou identifiant ou domaine dans un rapport) et tools/phase2/coverage_strict.py (pour actions.csv : la page ET l'élément, par href, id, name, texte ou classe, doivent apparaître dans le MÊME rapport), puis vérification manuelle des lignes résiduelles dans les rapports cités.
Début : 2026-09-19T23:07:10Z  Fin : 2026-09-19T23:07:38Z
Statut : COMPLET

Synthèse : les cinq inventaires sont couverts à 100 % ; le contrôle automatique par mention couvre 1 769 lignes sur 1 769, le contrôle strict d'actions.csv laisse 82 lignes résiduelles qui sont toutes couvertes par des verdicts groupés explicitement libellés dans les rapports (tableau ci-dessous) ; aucune relance de flux n'a été nécessaire.

## Résultat par inventaire

| Inventaire | Lignes | Couvertes (mention) | Résiduel strict | Après vérification manuelle | Rapports principaux |
| --- | --- | --- | --- | --- | --- |
| pages.csv | 26 | 26 | 0 | 26/26 | tous (chaque flux traite les 26 pages ; 09 : 468 cellules, 11 : 52 vues, 14 : 26 fiches SEO, 16 : 156 analyses axe, 17 : 156 passes Lighthouse) |
| actions.csv | 1 518 | 1 518 | 82 | 1 518/1 518 | 01 (28 formulaires newsletter), 02 (contact), 03 (198 lignes démo), 04 (sélecteur), 05 (410 actions légales, 104 liens légaux de pied de page), 06 (liens internes et externes, langue, menu mobile), 07 (324 actions), 09 (menu 286/286, sélecteur 72/72, accordéons 720/720), 16 (clavier), 22 (222 CTA) |
| fichiers.csv | 130 | 130 | n/a | 130/130 | 08 (130 fichiers avec code HTTP prod et verdict servi/interne), 20 (annexe A : 130 fichiers avec verdict utilisé/orphelin/obsolète), 17 (images) |
| emails.csv | 17 | 17 | n/a | 17/17 | E01 : 02, 18 ; E02 : 01, 18, 19 ; E03, E04, E13 : 05 ; E05 à E12 : 07 ; E14 à E17 : 04, 08 |
| tiers.csv | 78 | 78 | n/a | 78/78 | 08 (fonts.googleapis.com, fonts.gstatic.com par page), 17 (poids et chaîne critique), 19 (transfert d'IP, Referer réduit) |

## Lignes résiduelles du contrôle strict d'actions.csv et rapport qui les couvre

| Lignes | Élément d'actions.csv | Pages | Verdict(s) couvrant | Où |
| --- | --- | --- | --- | --- |
| 26 | pseudo_lien_desactive (span.nav-disabled role=link aria-disabled) dans le menu mobile | 13 pages EN et FR | DÉGRADÉ MAJEUR "entrées Customers/Nos clients et Media/Médias désactivées sur les 26 pages" ; "pseudo-liens exposés comme liens indisponibles" | 06 (constat 2, menu mobile : chaque entrée testée), 07 (constat 2), 14 (CASSÉ MAJEUR maillage), 16 (MINEUR) |
| 8 | mailto préremplis de candidature (a.page-button) | /careers, /recrutement | DÉGRADÉ MAJEUR "8 mailto avec tiret cadratin U+2014 dans le sujet et aucun corps", chaque sujet décodé | 07 (tableau des 8 mailto), emails.csv E05 à E12 |
| 16 | boutons de palier 10, 20, 100, 200 (data-pricing-step) | /, /index-fr, /pricing, /tarifs | OK "6 positions, 4 pages, 3 navigateurs, aria-pressed" ; OK sélecteur 72/72 ; TypeError pricing.js MINEUR | 04 (lignes 1 et 7 du tableau), 09, 10, 16 |
| 4 | liens de langue "EN" (href /) en-tête et menu mobile | /, /index-fr | OK "52 bascules de langue sur les 26 pages en 200 direct avec cookie ss-language conforme" | 06 (section langue), 10 (P6) |
| 20 | summary des 10 questions FAQ (EN et FR) | /faq, /faq-fr | OK accordéons 720/720 ; parité des 10 questions FR/EN ; JSON-LD FAQPage aligné ; details natifs | 09, 12 (tableau FAQ), 14 (FAQPage), 16 |
| 8 | summary des 4 postes (EN et FR) | /careers, /recrutement | DÉGRADÉ MAJEUR "8 fiches de poste sans contrat, salaire, process" ; OK "un seul poste ouvert à la fois avec et sans JS sur 3 moteurs" ; CASSÉ MAJEUR "summary role=button invalide (16 erreurs vnu par page)" | 07, 09, 20 |

## Compte
Lignes d'inventaire : 1 769 ; couvertes : 1 769 (100 %) ; orphelines : 0 ; relances de flux : 0.

## Couverture
Rapports lus pour ce contrôle : 01 à 22 (phase 1), T1 et T2 (phase 2, pour les constats fusionnés) ; inventaires : pages.csv, actions.csv, fichiers.csv, emails.csv, tiers.csv.
