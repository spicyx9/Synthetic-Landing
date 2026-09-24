# Synthetic Swarm public website

Marketing site of Synthetic Swarm, served at https://www.syntheticswarm.ai. Static HTML, CSS and JavaScript deployed by Vercel from the repository root with clean URLs (`/pricing` serves `pricing.html`). There is no framework, no build step and no package install. Two Vercel functions in `api/` handle the contact form and the newsletter.

Repository conventions and working rules for contributors and agents are in `CLAUDE.md`.

## Tree

```
/                     one HTML file per public URL, plus robots.txt, sitemap.xml,
                      vercel.json, favicon.ico and apple-touch-icon.png
css/                  shared stylesheets: styles, site-pages, motion, floating-demo
css/pages/            page-specific stylesheets (home-*, solution-*, pricing-*, ...)
js/                   shared scripts: motion, page-motion, mobile-menu, newsletter,
                      editorial-motion (about and careers)
js/pages/             page-specific scripts (home-*, solution-*, pricing, contact, ...)
assets/img/           logos, favicon, decorative images
assets/team/          founder portraits
assets/careers/       careers page photos
assets/radar/         homepage radar maps (SVG, GeoJSON)
assets/trust/         insurer logos of the homepage trust band
assets/customers/     customer photos (approved only)
assets/data/          customers.json, read by the customer pages
assets/vendor/        vendored MapLibre GL JS and its license
assets/og-image.png   social preview, kept here because og:image uses its absolute URL
assets/logo-black.png structured-data logo, kept here because JSON-LD uses its absolute URL
api/                  Vercel functions: contact.js, newsletter.js
scripts/              site_layout.py, the shared header/footer generator
tests/                node:test suites, no dependencies
docs/                 internal documentation (brand, audits, setup notes), never deployed
```

`.vercelignore` keeps `.claude/`, `docs/`, `scripts/`, `tests/` and every `*.md` out of the deployment.

## Commands

| Task | Command |
| --- | --- |
| Sync shared header, footer, pricing and purchase FAQ into every page | `python3 scripts/site_layout.py` |
| Run all tests (content, links, routes, pricing, motion, API handlers) | `node --test tests/*.test.cjs` |
| Local preview with clean URLs | `npx serve .` |

Run the layout script after editing `scripts/site_layout.py`, then the tests before every push. The layout script also copies pricing and the purchase FAQ from `pricing.html` and `tarifs.html` into the homepages.

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
| Customers | `/customers` | `/clients` |
| Contact | `/contact` | `/contact-fr` |
| Legal notice | `/legal-notice` | `/mentions-legales` |
| Privacy | `/privacy` | `/confidentialite` |
| Terms | `/terms` | `/conditions` |
| Opt out | `/opt-out` | `/opposition` |

Redirects in `vercel.json`: `/pricing-fr` to `/tarifs`, `/lead-magnets` to `/our-solution` and `/lead-magnets-fr` to `/notre-solution` (permanent). On `/`, the `ss-language` cookie or Vercel's `x-vercel-ip-country` header (`FR`) sends visitors to `/index-fr` with a temporary redirect; explicit language URLs never redirect. `404.html` is the branded not-found page. Only the four French pages listed in `sitemap.xml` are indexable; every other page carries `noindex,follow`.

## Notes

- Media and customer pages are intentionally empty and disabled in the navigation until verified content exists. Customer pages render `assets/data/customers.json` through `js/pages/customers.js`; field documentation is in `docs/customer-data.md`. The homepage testimonials are static cards.
- The newsletter form posts to `/api/newsletter`, which creates or resubscribes Resend Contacts. The contact form posts to `/api/contact` (see `docs/CONTACT_SETUP.md`). Configure `RESEND_API_KEY` on Vercel with Contacts permissions; keys never reach the browser and tests mock Resend.
- `js/motion.js` owns reveal and reduced-motion handling, with page choreography in `js/pages/home-motion.js`, `js/pages/solution-motion.js`, `js/editorial-motion.js` and `js/page-motion.js`. Content stays visible without JavaScript.
- The homepage radar demonstration is documented in `docs/radar-preview.md`; brand tokens and components in `docs/BRAND.md`.
- Examples and signal scenarios are illustrative. Never substitute real personal contact data.
