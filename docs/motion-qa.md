# Global motion QA

Historical branch-only review. See [current production audit](production-implementation-audit.md) for the later main audit and fixes.

Date: 2026-09-18
Branch: `solution-page-v1-detailed`. No merge to `main`.

## Implementation

One shared IntersectionObserver starts section groups at 12% visibility. Content entrances play once and release their animation effects on completion. Page modules own choreography. No animation dependencies were added.

- Homepage: banner, headline phrases, copy, CTAs and decor; comparison paths draw toward the result; a 10-second target/input/engine/profile story with a pause control.
- Solution: staged targeting fields, a 30-node desktop engine (8 nodes on narrow mobile), filtering and converging paths, four processing steps, progressive contact profile, selectable fact combinations and sequential verification. Engine cycle: 11 seconds, including reading time.
- About and Careers: editorial groups and short card/list cascades.
- Pricing: controls, price, benefits and CTA; brief price feedback without counting numbers.
- Contact: intro and founders, then the whole form; small feedback transitions.
- FAQ: short question cascade and answer opacity transition, native details semantics preserved.
- Legal: heading and first paragraph only. Customer placeholders remain placeholders.

## Automated checks

`node --test tests/*.test.cjs`: 66 passed, 0 failed.

Seven motion tests cover once-only playback and observer cleanup, offscreen/hidden-tab/manual pauses, a hidden entrance, reduced motion and missing browser support, focus revealing the final state, partial initialization failures, and valid story keyframe offsets.

`git diff --check`: passed.

## Browser checks

Codex in-app browser, local server at `http://localhost:9183`.

14 primary FR/EN routes checked at each size:

| Viewport | Route checks | Horizontal overflow | Fixed headers |
| --- | --- | --- | --- |
| 1440 x 900 | 14 | None | 14/14 |
| 1440 x 800 | 14 | None | 14/14 |
| 1280 x 720 | 14 | None | 14/14 |
| 1024 x 768 | 14 | None | 14/14 |
| 768 x 900 | 14 | None | 14/14 |
| 390 x 844 | 14 | None | 14/14 |
| 320 x 720 | 14 | None | 14/14 |

Routes: index-fr, index.html, notre-solution, our-solution, pricing-fr, pricing, a-propos, about, recrutement, careers, contact-fr, contact, faq-fr, faq.

Initial and completed entrance screenshots inspected for all seven primary page types in both languages. Additional screenshots inspected for homepage comparison and product story, desktop/mobile engine, final prospect and 320px homepage.

- Homepage and Solution pause/resume buttons: state and labels verified.
- Mobile menu: opening and closing verified at 320px.
- FAQ: native accordion opens and exposes its answer.
- Pricing: changing to 100 leads updates the selected tier and price to 789 EUR.
- Solution: Growth combination exposes the matching facts and conclusion.
- Engine: 30 visible nodes at 1440px, 8 at 390px; loop pauses when offscreen.
- Eight legal routes checked at 390px: one minimal motion group each, no horizontal overflow.
- Browser console inspection: no errors or warnings captured.
- Homepage section offsets and heights match before and after the entrance. The pause control reserves its space even before JS initializes.
- JavaScript failure: temporary homepage fixture with every script removed checked in-browser. Heading and all legacy reveal groups retain opacity 1; no overflow. Fixture removed after testing.

## Limits

Only the in-app browser was exposed by the browser tooling. Separate Chromium and WebKit runs were unavailable; this is not a claim of independent cross-engine validation.

Reduced-motion initialization and preference changes were tested with a mocked media query in the lifecycle tests and reviewed in CSS. The OS/browser preference was not changed for a native visual run.

Layout geometry was checked; no field CLS metric or Lighthouse performance score was collected. Existing customer/photo placeholders and newsletter backend state are outside this motion change.

## Changed files

- `a-propos.html`
- `about.html`
- `careers.html`
- `clients.html`
- `conditions.html`
- `confidentialite.html`
- `contact-fr.html`
- `contact.html`
- `customers.html`
- `js/editorial-motion.js`
- `faq-fr.html`
- `faq.html`
- `js/pages/home-motion.js`
- `index-fr.html`
- `index.html`
- `lead-magnets-fr.html`
- `lead-magnets.html`
- `legal-notice.html`
- `media.html`
- `medias.html`
- `mentions-legales.html`
- `js/mobile-menu.js`
- `css/motion.css`
- `js/motion.js`
- `notre-solution.html`
- `opposition.html`
- `opt-out.html`
- `our-solution.html`
- `js/page-motion.js`
- `pricing-fr.html`
- `pricing.html`
- `privacy.html`
- `recrutement.html`
- `js/pages/solution-motion.js`
- `js/pages/solution-page.js`
- `css/styles.css`
- `terms.html`
- `tests/motion.test.cjs`
- `docs/motion-qa.md`
