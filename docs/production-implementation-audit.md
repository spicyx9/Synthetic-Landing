# Production implementation audit

Date: 2026-09-18. Work performed directly on `main`.

## Baseline and concurrent update

Initial main: `d62c9e7e641f44686353f7d1a5418ec0986912b3`.

The detailed Solution architecture was present; the shared motion implementation was absent from that main revision. During the audit, remote main advanced to `82f95832d54fcb4de9ef57b24770075c1afebe17` (Add global staged motion system). Its tree matched `solution-page-v1-detailed` at `65a6145`. The public production domain was already serving that motion implementation before our push. Our unpushed duplicate motion commits were removed, and only the audit fixes were rebased onto the updated main. No remote history was rewritten.

No important Solution or motion implementation remains only on the experimental branch. Headlines were compared against the baseline and remain unchanged. The parked “Transformez…” rewrite was not applied.

## Solution architecture: code and behavior

FR and EN have the same eight-part journey: hero, targeting, engine, moments, combinations, verification, final profile, final CTA.

- One targeting interface, before the engine: five labeled selects and a labeled volume slider. Changing activity updates the engine summary; keyboard adjustment updates volume.
- 30 engine input fragments in each HTML document: six named ecosystems plus 24 information categories/events. Browser counts: 30 desktop, 12 tablet, 8 narrow mobile. No claim of 30 proprietary integrations.
- Four processing steps in both languages: Detect, Cross-reference, Qualify, Enrich.
- Old six-source positioning and five-family wording absent from both pages.
- Six readable expandable moment examples and a broader-catalogue note. No automatic confirmed-insurance-need promise found in the Solution text.
- Three selectable fact combinations. All three were activated and showed exactly one matching panel.
- Company, moment, decision-maker and contacts each have their own check. Phone normalization/prefix/coherence/premium-rate checks remain a secondary expandable detail. Uncertainty is acknowledged; no absolute ownership guarantee.
- Final profile contains company/person, contact methods, event and reason to contact. No Pappers or source/provenance block in the final marketing card.
- Hero and final CTAs retain localized pricing links and Axel/Ilan booking choosers.

## Confirmed issues fixed

1. Story-wide easing accelerated the whole product timeline, compressing milestones toward the beginning. Product timelines now use linear wall-clock time with easing within each step. A regression test verifies the 5400ms output milestone.
2. Target labels/values now resolve separately and end with a reserved visual ready check.
3. Full-profile verification now ends with the existing Qualified wording after the four checks. Final-profile company and person have separate entrance steps.
4. The engine cycle is 10 seconds, with a reading hold.
5. Floating CTA offsets now include mobile safe-area insets, use the requested 10px entrance, and focused Solution controls reserve bottom scroll clearance.
6. Shared HTML generation now includes motion assets for new/generated pages; README no longer incorrectly says approved legal pages still have placeholders.

## Global motion audit

Code inspected: js/motion.js/css, all four choreography modules, homepage and Solution HTML/CSS/JS, js/mobile-menu.js, css/floating-demo.css/js, shared layout generator, README, BRAND.md and tests.

One shared IntersectionObserver handles staged groups. Three distinct levels exist: page entrances, section entrances, and multi-step product timelines. Standard content plays once. Loops pause offscreen, while the document is hidden, and via user controls. Focus reveals content immediately. No new animation dependencies, scroll snapping, custom scroll speed or scroll-jacking. The mobile navigation temporarily locks background scrolling only while its dialog is open.

Homepage hero, comparison paths and engine have distinct sequences. Solution fields, source fragments, processing steps, moments, fact combinations, checks and final profile build internally. About/Careers use restrained editorial staging. Pricing, Contact and FAQ use short sequences. Legal pages animate only title/first paragraph. Existing customer/media availability and newsletter backend state were preserved.

Animation work primarily uses opacity and independent translate/scale, with headline clipping and small SVG path drawing. No continuous layout-dimension or large-filter animation was added. This is a code/perceived-behavior audit, not a Lighthouse performance certification.

## Current browser QA

98 fresh route/viewport checks: 14 primary FR/EN routes at 1440x900, 1440x800, 1280x720, 1024x768, 768x900, 390x844, 320x720. All had fixed headers, initialized motion and labeled fields; no document overflow.

Additionally, bounding rectangles of targeting, engine, event feed, combinations, verification, profile and selects were checked on both Solution routes at all seven sizes plus 720x450. No component extended outside the viewport; this check does not rely only on overflow-x clipping.

Interactive checks:

- Header About, Language and Demo open/close with Escape; outside click closes About. Skip link focuses main.
- Mobile menu focus wraps to Close. Escape first closes its booking chooser, then the menu, restoring focus to the hamburger.
- Floating CTA hidden in hero; visible after hero; its chooser exposes both existing calendar links. Hidden at final CTA. At 320px both pill and chooser fit within the viewport.
- Engine pause/resume changes state correctly; header remains fixed during scroll.
- Target activity and volume update; all three combinations work by keyboard; moment and phone details expand; final CTA chooser opens.
- Browser screenshot checks covered the desktop engine and mobile combination/booking overlays.
- No-script fixtures of the current homepage and Solution were checked: zero script tags, headline/reveal/profile opacity 1. Fixtures removed afterward.

## Tests and limits

`node --test tests/*.test.cjs`: 70 passing, 0 failing. Includes new architecture/headline/parity contracts and timeline-clock regression.

Reduced-motion initialization, preference changes, focus fallback, paused loops, partial failures and one-time cleanup pass lifecycle tests. CSS disables nonessential motion. A native OS reduced-motion visual session was not available.

Only the Codex in-app browser was exposed. Independent Chromium and WebKit/Safari sessions were unavailable. Native zoom keyboard shortcuts did not alter viewport metrics; 200% zoom is unverified. A 720x450 reflow check is recorded separately and is not claimed as native zoom.

Safe-area CSS was inspected, but no physical iPhone/notch session was available. No field CLS measurement was collected. No pending marketing copy was changed.

## Delivery

Push the audited main commits and verify the production deployment and public routes. Final deployment SHA/status and public URL are reported in the task response, rather than pre-claimed here.

## Files changed by audit fixes

- `README.md`
- `a-propos.html`
- `about.html`
- `careers.html`
- `clients.html`
- `conditions.html`
- `confidentialite.html`
- `contact-fr.html`
- `contact.html`
- `customers.html`
- `faq-fr.html`
- `faq.html`
- `css/floating-demo.css`
- `index-fr.html`
- `index.html`
- `lead-magnets-fr.html`
- `lead-magnets.html`
- `legal-notice.html`
- `media.html`
- `medias.html`
- `mentions-legales.html`
- `js/motion.js`
- `notre-solution.html`
- `opposition.html`
- `opt-out.html`
- `our-solution.html`
- `pricing-fr.html`
- `pricing.html`
- `privacy.html`
- `recrutement.html`
- `scripts/site_layout.py`
- `js/pages/solution-motion.js`
- `css/pages/solution-page.css`
- `js/pages/solution-page.js`
- `terms.html`
- `tests/motion.test.cjs`
- `tests/solution-audit.test.cjs`
- `docs/motion-qa.md`
- `docs/production-implementation-audit.md`
