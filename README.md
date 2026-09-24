# Synthetic Swarm public website

Static HTML, CSS and JavaScript. Vercel serves the repository root with clean URLs; there is no framework build or package-install step. Do not point the output directory at a stale generated folder.

## Editing and validation

- Page content lives in the root HTML files.
- Shared header/footer markup lives in `scripts/site_layout.py`. Run `python3 scripts/site_layout.py` after changing it to synchronize every public page. It also copies pricing and the purchase FAQ from the dedicated pricing pages into the homepage, so the conversion sections stay consistent.
- `js/mobile-menu.js` provides About/demo disclosures and the mobile menu; it does not replace page content.
- `js/pages/pricing.js` owns the five fixed prices and the sixth custom state. Default: index 2, 50 leads/week, 399 €/month. The custom state removes checkout pricing data and exposes calendar booking.
- Run `node --test tests/*.test.cjs` for content, links, syntax, route configuration and pricing interaction checks. No dependencies are required.
- Browser regression: test 320, 390, 768, 1024 and 1440px widths, all six pricing stops, closed FAQ defaults, About/demo keyboard controls, mobile menu and footer. Native slider thumb centers and label centers share an inset of 12px.

## Permanent public-site content rule

Never expose data-source infrastructure in marketing or product-preview UI: no source names, registries, databases, generic source wording, source-disclosure links, collection methodology, scraping or monitoring infrastructure. Describe what Synthetic Swarm detects, why it matters and what the user receives. This applies to HTML, SEO, shared generators, JavaScript, captions, expandable blocks and both languages. Keep distinct legal/privacy disclosures outside marketing. `tests/source-copy.test.cjs` enforces this rule on public pages.

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

`/clients` and `/customers` read `assets/data/customers.json` through the shared `js/pages/customers.js` renderer. Add only approved real records and supplied photos under `assets/customers/`. Field documentation is in `docs/customer-data.md`. No build is required. The homepage independently displays its three existing testimonials as static cards, with the full quote, portrait, name and role. Dedicated customer pages still use the shared verified-data renderer; statistic cards require an enabled flag and a real value.

## Automatic language

On `/`, Vercel's trusted `x-vercel-ip-country` header selects French for `FR`; all other or unknown countries keep English. Temporary redirects avoid permanently caching a visitor's location. Explicit language URLs remain accessible worldwide. The EN/FR switch sets a first-party `ss-language` cookie for one year, so manual choice overrides automatic detection. No external geolocation service or browser-language heuristic is used.

## Homepage newsletter

The shared footer generator supplies an editable FR/EN form and `js/newsletter.js` submits JSON to `/api/newsletter`. The server normalizes and validates email, caps payloads at 2 KB, ignores honeypot submissions, and creates or resubscribes Resend Contacts. Configure `RESEND_API_KEY` with Contacts permissions on Vercel; sending-only keys are insufficient. The key never reaches the browser. Existing contacts are updated by email, with a create fallback for missing contacts. Success is shown only after the API confirms it; failures use translated inline feedback. Tests mock Resend and do not create real subscribers. No newsletter email is sent by this endpoint.

## Shared motion

`js/motion.js` owns one observer, once-only entrances, pause lifecycle, focus fallback and reduced-motion handling. `css/motion.css` defines shared tokens. Page choreography lives in `js/pages/home-motion.js`, `js/pages/solution-motion.js`, `js/editorial-motion.js` and `js/page-motion.js`. Shared layout generation includes these assets. Product timeline time is linear; easing applies within individual steps so story milestones retain their scheduled times. Content is visible by default without JavaScript.

Work directly on main for the current audit/fix/deploy workflow. Parked copy changes remain out of scope until explicitly released.

## Homepage product demonstration

The FR/EN homepages include an animated radar and selectable detected-change records. See `docs/radar-preview.md` for runtime assets, attribution, reduced-motion behavior and validation.
