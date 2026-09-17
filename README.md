# Synthetic Swarm public website

Static HTML, CSS and JavaScript. Vercel serves the repository root with clean URLs; there is no framework build or package-install step. Do not point the output directory at a stale generated folder.

## Editing and validation

- Page content lives in the root HTML files.
- Shared header/footer markup lives in `scripts/site_layout.py`. Run `python3 scripts/site_layout.py` after changing it to synchronize every public page.
- `mobile-menu.js` provides About/demo disclosures and the mobile menu; it does not replace page content.
- `pricing.js` owns the five fixed prices and the sixth custom state. Default: index 2, 50 leads/week, 399 €/month. The custom state removes checkout pricing data and exposes calendar booking.
- Run `node --test tests/site.test.cjs` for content, links, syntax, route configuration and pricing interaction checks. No dependencies are required.
- Browser regression: test 320, 390, 768, 1024 and 1440px widths, all six pricing stops, closed FAQ defaults, About/demo keyboard controls, mobile menu and footer. Native slider thumb centers and label centers share an inset of 12px.

## Routes

| Destination | EN | FR |
| --- | --- | --- |
| Home | `/` | `/index-fr` |
| Solution | `/our-solution` | `/notre-solution` |
| Pricing | `/pricing` | `/pricing-fr` |
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

Privacy and Terms have document placeholders, not fabricated policies. Publish approved legal text when supplied. No recruiting/support email or company social URL was verified, so the site uses the supplied team calendars and Contact page.

Signal scenarios and prospect examples are clearly illustrative. Confirm supported signal coverage before publishing a supported-signals catalog. Do not substitute real personal contact data in illustrative examples.
