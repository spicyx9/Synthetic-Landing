# Synthetic Swarm public website

Static HTML, CSS and JavaScript. Vercel serves the repository root with clean URLs; there is no framework build or package-install step. Do not point the output directory at a stale generated folder.

## Editing and validation

- Page content lives in the root HTML files.
- Shared header/footer markup lives in `scripts/site_layout.py`. Run `python3 scripts/site_layout.py` after changing it to synchronize every public page. It also copies pricing and the purchase FAQ from the dedicated pricing pages into the homepage, so the conversion sections stay consistent.
- `mobile-menu.js` provides About/demo disclosures and the mobile menu; it does not replace page content.
- `pricing.js` owns the five fixed prices and the sixth custom state. Default: index 2, 50 leads/week, 399 €/month. The custom state removes checkout pricing data and exposes calendar booking.
- Run `node --test tests/*.test.cjs` for content, links, syntax, route configuration and pricing interaction checks. No dependencies are required.
- Browser regression: test 320, 390, 768, 1024 and 1440px widths, all six pricing stops, closed FAQ defaults, About/demo keyboard controls, mobile menu and footer. Native slider thumb centers and label centers share an inset of 12px.

## Permanent source-copy rule

Marketing UI and SEO copy must use specific source names only, such as REDACTED, REDACTED, REDACTED, REDACTED, REDACTED and REDACTED. Omit the source sentence when names are not useful. Do not add generic descriptions of public data origins, including inside expandable blocks, captions, mobile variants or translations. This applies to static HTML, JavaScript data and `scripts/site_layout.py`; preserve distinct legal/privacy disclosures. `tests/source-copy.test.cjs` guards the public pages against regressions.

## Routes

| Destination | EN | FR |
| --- | --- | --- |
| Home | `/` | `/index-fr` |
| Solution | `/our-solution` | `/notre-solution` |
| Pricing | `/pricing` | `/tarifs` |
| FAQ | `/faq` | `/faq-fr` |
| About | `/about` | `/a-propos` |
| Careers | `/careers` | `/recrutement` |
| Media | `/media` | `/medias` |
| Contact | `/contact` | `/contact-fr` |
| Privacy | `/privacy` | `/confidentialite` |
| Terms | `/terms` | `/conditions` |

Legacy `/lead-magnets` and `/lead-magnets-fr` redirect to the matching solution pages in `vercel.json`. Explicit language URLs stay in the selected language; language preferences never silently redirect a requested page.

## Content awaiting verified details

Careers and Media intentionally have empty states. The media pages include an inert `media-item-template` with publication, logo, title, date, excerpt, type and external URL fields. Populate it only with verified coverage.

Legal pages contain the supplied short policies and contact links. Preserve the approved wording; do not restore old placeholders. Demo CTAs use the supplied team calendars.

Signal scenarios and prospect examples are clearly illustrative. Confirm supported signal coverage before publishing a supported-signals catalog. Do not substitute real personal contact data in illustrative examples.

The supplied Ilan portrait is stored unchanged at `assets/team/ilan-cto.jpg`; CSS controls its circular crop. The supplied Axel portrait is stored unchanged at `assets/team/axel-ceo.png` and uses the same CSS dimensions.

## Customer stories

`/clients` and `/customers` read `assets/data/customers.json` through the shared `customers.js` renderer. Add only approved real records and supplied photos under `assets/customers/`. Field documentation is in `assets/data/README.md`. No build is required. The homepage shows three static gray placeholders until three verified testimonials exist for its language; the shared renderer then replaces the placeholders. Fetch failures retain the placeholders. Statistic cards require an enabled flag and a real value.

## Automatic language

On `/`, Vercel's trusted `x-vercel-ip-country` header selects French for `FR`; all other or unknown countries keep English. Temporary redirects avoid permanently caching a visitor's location. Explicit language URLs remain accessible worldwide. The EN/FR switch sets a first-party `ss-language` cookie for one year, so manual choice overrides automatic detection. No external geolocation service or browser-language heuristic is used.

## Homepage newsletter

The FR/EN newsletter is a compact CTA band with a static, disabled fieldset. The input has an accessible name without a duplicate visible label; no availability status is displayed. No addresses are collected, stored or sent, and no success state is simulated. To activate, connect a subscription endpoint, add server validation and consent/unsubscribe handling, implement accessible success/error feedback, then remove the disabled state. Do not enable the controls before that integration is ready.

## Shared motion

`motion.js` owns one observer, once-only entrances, pause lifecycle, focus fallback and reduced-motion handling. `motion.css` defines shared tokens. Page choreography lives in `home-motion.js`, `solution-motion.js`, `editorial-motion.js` and `page-motion.js`. Shared layout generation includes these assets. Product timeline time is linear; easing applies within individual steps so story milestones retain their scheduled times. Content is visible by default without JavaScript.

Work directly on main for the current audit/fix/deploy workflow. Parked copy changes remain out of scope until explicitly released.
