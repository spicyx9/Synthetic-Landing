# Synthetic Swarm Design System

Audited against repository revision `dcf5284` on 2026-09-17. This is the official reference for future public-site design work. It records the current implementation, not a claim that every historical CSS rule is already standardized.

**Scope:** documentation only. No CSS, markup, asset, layout or rendered output changes are part of this audit. The previously requested equal-size header buttons are a pending visual change, not implemented by this document.

## Brand personality

Premium, minimal, Apple-influenced B2B SaaS. Warm rather than sterile: cream canvas, dark typography, generous spacing, subtle borders, white surfaces and restrained blue accents. Primary actions are black. Product explanations should be concrete and readable. Glass, aurora and iridescent 3D accents belong mainly to the hero, not every component.

## Source map and cascade

All seven root CSS files were inspected:

| File | Role and current usage |
| --- | --- |
| `css/styles.css` | Global reset, Inter body, sticky header, base buttons, hero/aurora, mobile menu and booking; also substantial older landing-page/widget rules. Loaded on all public pages. |
| `css/site-pages.css` | Current corporate pages, common cards, footer, FAQ, focus treatment, language selector, header/mobile overrides. Loaded on all public pages. |
| `css/home.css` | Scoped `.home` tokens, hero/news, current before/after section and homepage spacing; some older `.hs-*` patterns remain. |
| `css/demo.css` | Scoped `.demo-wrapper` Apple font/tokens and glass news pill. Loaded on both homepages. |
| `css/pricing-interactive.css` | Single-plan pricing, range, preferred badge, custom state and purchase FAQ. Loaded on pricing and homepages. |
| `css/customers.css` | Customer mosaic, identities, stats and empty state. Loaded on customer pages and homepages. |

Homepage load order: `css/styles.css`, `css/demo.css`, `css/home.css`, `css/pricing-interactive.css`, `css/site-pages.css`, `css/customers.css`. Corporate pages use the base plus site-pages; customer pages append customers. Pricing uses base, pricing-interactive, then site-pages. Later matching rules and selector specificity both matter. Do not infer current appearance from the first declaration alone.

## Typography

Primary stack, from `css/styles.css` body:

```css
'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
'Helvetica Neue', Arial, sans-serif
```

Body is antialiased with line-height `1.5`. Corporate pages request Inter 400/500/600/700/800. Existing heading weight may inherit browser heading bold unless a component specifies it.

The live homepage hero inherits `.demo-wrapper`'s stack:

```css
-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
'Helvetica Neue', sans-serif
```

This is a system fallback stack, not a shipped SF Pro font. Wrapper default: `14px`, tracking `-0.022em`. The archived leadgen stack starts with Inter and uses tracking `-0.011em`.

| Role | Current values / source |
| --- | --- |
| Corporate h1 | `clamp(32px,4.5vw,52px)`, line-height `1.12`, tracking `-.04em` (`.page-intro h1`) |
| Homepage hero h1 | `clamp(29px,4.3vw,46px)`, line-height `1.12`, tracking `-.035em`; demo mobile rules also influence small screens |
| Corporate h2 | `clamp(24px,3vw,32px)`, `1.2`, `-.025em` |
| Homepage process headings | `clamp(28px,3.5vw,38px)`, `1.2`, `-.03em` |
| Before/after h2 | `clamp(23px,2.4vw,30px)`, `1.2`, `-.03em` |
| Card h3 | `19px`, `-.02em`; prospect title `22px` |
| Intro copy | `18px`, `1.65`; `16px` at widths ≤700px |
| Card/body copy | Typically `15px`, `1.65`; explanatory paragraphs up to `1.7` |
| Navigation | About `13.5px` / 500; active navigation 700 |
| Eyebrow | `12px` / 700, uppercase, tracking `.1em` |
| Metadata | `12–13px`, usually 500/600; avoid using it for main copy |
| Customer quote | `18px`, `1.65`; mobile `16px` |
| Price | `50px` / 800, line-height `1`, tracking `-.045em`; mobile `44px` |

Use the existing role before inventing a new type size. Do not convert every heading to the same size or every line-height to 1.5.

## Colors

These are the official role choices for new work, grounded in current code. Preserve existing component exceptions until a separately scoped migration.

| Role | Value | Evidence / use |
| --- | --- | --- |
| Primary ink | `#1a1a1a` | Body, primary buttons, pricing |
| Warm page background | `#fcfbf8` | Body, `--hs-cream` |
| White surface | `#ffffff` | Cards, popovers |
| Primary accent | `#0a66c2` | Kicker, focus, `--hs-blue`, leadgen blue |
| Deep accent | `#0a5aa8` | Existing `--hs-blue-deep`; scoped token, not universal hover |
| Explanatory blue ink | `#254b70` | Signal reasons, comparison, customer results |
| Blue tint surface | `#f0f5fa` | Steps and signal context |
| Secondary text | `#555555` | Navigation, comparison, helper text |
| Body muted | `#666666` | Corporate descriptions |
| Metadata | `#777777` | Footer, dates, labels |
| Light metadata | `#888888` | Pricing period, historical controls; contrast review before new small text |
| Historical home muted | `#6a6a82`; soft ink `#43435e` | Scoped home tokens, not primary body defaults |
| Soft neutral surface | `#f7f5f1` | Empty and identity cards |
| Before-state surface | `#f3f1ed` | Before/after comparison |
| Standard card border | `#e8e5e0` | Corporate cards/footer |
| Secondary/control border | `#dfdbd6` | Secondary button, prospect card |
| FAQ/customer border | `#e3dfd9` | FAQ, testimonials, language popover |
| Success / confirmation | `#22c55e` | Actual pricing checkmarks; do not use as small success text without checking contrast |
| Historical success | `#1d9e75` | Home token; separate from pricing green |
| Announcement red | `#e74c3c` | News badge/pulse family; attention, not form validation |
| Historical danger | `#e0443a` | Home token |
| Scoped warning | `rgb(180,100,0)` = `#b46400` | Leadgen amber ink; no site-wide warning component |

Other existing scoped palettes: demo blue `rgb(0,113,227)` / `#0071e3`, hover `rgb(0,95,192)` / `#005fc0`, green `rgb(52,199,89)` / `#34c759`, red `rgb(255,59,48)` / `#ff3b30`; leadgen success `rgb(30,142,62)` / `#1e8e3e`. These are not additional general brand accents. No separate purple brand accent is established.

Hairlines also use `rgba(0,0,0,.04/.06/.08/.09)` and scoped `rgba(26,26,46,.10/.06)`. Do not silently replace alpha borders with an opaque hex approximation.

## Spacing

Working scale for new work, selected from repeated existing values: **4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 76, 88px**. This is a documented role palette, not an existing global spacing-variable implementation.

- Icon/text and compact controls: 6–12px (6px is an existing optical exception).
- Small content gaps: 12–20px.
- Current corporate/customer grid gap: **22px**, an intentional existing exception.
- Card padding: corporate 28px, customers/prospects 30px, mobile 24/22px.
- Corporate sections: 68px margin-top, mobile 48px.
- Page padding: 76px top / 32px sides / 88px bottom; mobile 48px / 22px / 60px.
- Homepage comparison: 32px top, 36px bottom, 24px between columns; homepage-specific spacing should not become a global reset.

## Containers

All use border-box sizing; stated max-width includes padding.

| Container | Width / behavior |
| --- | --- |
| Standard `.content-page` | 1120px, centered; 32px gutters, 22px ≤700px |
| `.header-inner` | 1280px, 32px gutters; 24px ≤1100px |
| `.site-footer` | 1200px, 32px gutters; 22px mobile |
| Intro | 800px, paragraph 740px |
| Prospect card | 780px |
| Pricing and purchase FAQ | 720px |
| Dedicated FAQ / customer empty state | 840px |
| Demo hero inner | 720px; headline override 780px does not widen its parent |
| Historical `.hs-container` | 1120px / 32px; leadgen embed 600px |

Do not force the header, reading column and pricing card to identical widths.

## Border radius

- **Small: 8px** for compact controls/header; 6px for language options, 9px booking rows are existing exceptions.
- **Medium: 12px** for inset context; primary content buttons use 10px, pricing button 11px, popovers 14px.
- **Large: 18px** for corporate/customer/empty cards; 20px for prospect, comparison and pricing; 22px exists in home tokens/composer.
- **Pill: 999px** for new true pills. Existing 100px, 980px, 9999px variants are not all normalized.
- **Circular: 50%** for portraits and slider thumb.
- Pricing mobile radius is 17px. Record it as an exception; do not silently change to 18px in this audit.

## Shadows

Use shadows only for hierarchy; ordinary corporate/customer cards currently have no shadow.

| Role | Existing exact value | Scope |
| --- | --- | --- |
| Subtle | `0 10px 26px rgba(26,26,46,.055)` | `--hs-shadow-sm` token |
| Card | `0 14px 44px rgba(0,0,0,.06)` | Prospect card |
| Elevated | `0 18px 48px rgba(26,26,46,.08)` | `--hs-shadow` token |
| Pricing exception | `0 14px 44px rgba(0,0,0,.08)` | Pricing card |
| Booking popover | `0 12px 36px rgba(0,0,0,.14)` | Interactive floating layer |
| About popover | `0 12px 36px rgba(0,0,0,.12)` | Interactive floating layer |
| Language popover | `0 8px 24px rgba(0,0,0,.1)` | Small floating layer |
| After comparison | `0 8px 28px rgba(25,66,104,.06)` | Subtle blue elevation |

Glass highlights/inset shadows are hero exceptions, not a default shadow recipe.

## Buttons

| Pattern | Current appearance |
| --- | --- |
| Primary `.page-button` | Black/white, 12px 22px padding, 10px radius, 14px / 600, inline-flex centered |
| Secondary `.page-button--secondary` | White/ink, 1px `#dfdbd6` border, same base typography/padding |
| Header login `.btn-login` | Transparent/ink, 1px `#dfdbd6`, 7px 18px, 8px radius, 14px / 500 |
| Header demo `.btn-get-started` | Black/white, 7px 18px, 8px radius, 14px / 500; booking wrapper explicitly removes border |
| Pricing `.pricing-config-btn` | Full width, 14px 24px, 11px radius, 15px / 700 |
| Historical hero `.hs-btn-primary` | 14px 26px, 14px radius, 15.5px / 600, stronger shadow |
| Historical ghost `.hs-btn-ghost` | White at .6 alpha, 1.5px alpha border, 14px 22px, 14px radius |

Primary hover is usually `#303030`; header login hover `#f5f3ef`, border `#d0ccc7`. Pricing active uses `scale(.99)`. Historical hero buttons lift 1px on hover. Generic page buttons do not currently define a universal hover/active treatment: this is a gap, not permission to invent one in each section.

**Pending equal-footprint header request:** login and demo currently have no equal width or shared fixed height, and their border treatment differs. Mobile rules use `display:block !important`, width 100%, padding 12px 16px, while demo sits inside a wrapper. Do not document equal dimensions as already delivered. A future dedicated change should introduce one shared class and validate both languages and cloned mobile controls.

## Cards

Default new informational card: reuse `.content-card`, white, 1px `#e8e5e0`, 18px radius, 28px padding, no shadow. Customer cards use 30px padding and `#e3dfd9`; prospect cards use 20px radius and the card shadow. Pricing deliberately has a stronger 2px ink border. Before/after cards share geometry and differ through labels, information and restrained color, not color alone.

Customer mosaics: three columns, optional wide cards; two columns ≤1000px; one column ≤600px with spanning removed. Initials are an acceptable missing-photo fallback. No customer, metric, rating or endorsement is implied by a decorative component; production data is currently empty.

## Header

Sticky 60px bar, max-width 1280px. Background `rgba(252,251,248,.82)`, `saturate(180%) blur(16px)`, bottom border `1px solid rgba(0,0,0,.04)`. Flex alignment centers logo, navigation and actions. Main navigation is Solution, Pricing, About; FAQ and Customers remain accessible elsewhere. Media is visible but disabled. Contact remains in the footer.

Current labels: FR `Connexion`, `Démo`; EN `Log in`, `Demo`. Login opens a new tab. Booking is a disclosure with two real team calendars. Current-language-only control is 13px / 600, minimum 40px height, 8px radius; its 64px-minimum dropdown opens beneath. Do not reintroduce side-by-side EN | FR.

## Hero

The live focused hero is content-height (`min-height:auto` override), not a mandatory full viewport. Preserve its headline hierarchy, centered actions and space before the comparison.

Aurora: four blurred radial blue/rose blobs, 80px blur, .6 element opacity, gradients using `rgba(0,113,227,.7)`, `rgba(60,150,255,.5)`, `rgba(255,70,120,.55)` and `rgba(255,50,100,.4)` fading to transparent. Slow 22–30s movement; bottom mask fades into cream. This is background atmosphere, not a functional UI palette.

Breaking news has three separate pieces: badge, date, announcement. It uses a dark translucent glass base `rgba(22,22,24,.4)`, a white highlight gradient, blur 22px / saturation 180%, 1px white .16 border and inset specular highlights. At ≤1000px, news text moves to a second grid row and radius becomes 20px. Avoid recreating this glass effect on every card.

The active decorative asset is the iridescent sparkle `assets/img/decor-2.png`. Use decorative images with empty alt/hidden semantics and pointer-events disabled; never use them as product evidence. Lavender/pink reflections are permitted inside these accents, not as a new purple interface theme.

## Forms

There is no active newsletter subscription form: the current newsletter is an explicit not-open state. Do not invent validation or submission behavior in the brand reference.

Existing reference patterns:

- Demo input wrapper: white surface, soft shadow, focus using blue `rgba(0,113,227,.12)` shadow plus `0 0 0 3px rgba(0,113,227,.08)`.
- Archived leadgen composer: white, 1px `#d0ccc7`, 22px radius, padding `12px 12px 12px 18px`, hairline shadow `0 1px 3px rgba(0,0,0,.04)`.
- Composer focus: blue border with `0 0 0 3px rgba(10,102,194,.10)` and hairline shadow. Textarea 15.5px / 1.55, inherited font.
- No unified error/success validation component exists. Future validation needs visible text, associated labels and accessible error semantics, not color alone.
- Align input/button controls through a shared layout and explicit dimensions when introducing a real form; no existing universal form-button height is established.

## FAQ and footer

Dedicated FAQ uses native details/summary: closed initially, plus/minus, 1px `#e3dfd9`, summary 16px / 600 with 22px vertical padding, answers 15px / 1.7. Purchase FAQ differs: 15px / 700 summary, 20px padding, answers 14px / 1.65 and alpha borders. Preserve native keyboard behavior.

Footer: cream canvas, 1px `#e8e5e0` top border, four columns with 28px gaps; two columns ≤700px. Headings 12px uppercase / .07em tracking; links 14px `#555`; metadata 13px `#777`. Booking opens upward to avoid clipping.

## Interaction and accessibility

Shared focus: 2px solid `#0a66c2`, offset 4px; booking offset 3px; range/stop buttons offset 5px. Keep outlines visible. Hover does not replace keyboard focus. About, language and booking disclosures close on outside click/Escape and support keyboard use. Mobile overlay traps focus, makes the background inert and restores focus on close. Disabled Media has no href and announces `aria-disabled`.

Range: 8px track, 24px thumb with 7px ink border; labels use a 12px-inset rail and six stops at 0/20/40/60/80/100%. Do not replace with approximate grid labels. Preferred badge disappears completely off the 50 tier.

Reduced motion disables aurora/decor animation and selected transitions in `css/site-pages.css`. Older isolated keyframes remain in base/demo CSS; a comprehensive reduced-motion audit has not been performed. Light gray text and bright semantic colors are not automatically contrast-compliant: check their actual size/background before reuse.

## Responsive

Preserve component-specific breakpoints rather than introducing a competing framework:

- ≤1100px: header gutters and navigation spacing compact.
- ≤980px: actual shared desktop header hides; hamburger appears. Older 900px rules remain in base CSS.
- ≤1000px: news wraps to two rows; customer grid becomes two columns.
- ≤800px: comparison columns stack, current reality first.
- ≤700px: corporate grid stacks; smaller gutters; footer becomes two columns.
- ≤640px: scoped demo hero adjustments.
- ≤600px: customer grid stacks; pricing card becomes 17px radius with 22px horizontal padding, price 44px; badge enters normal flow.
- ≤480px: comparison definition lists stack.
- ≤360px: news spacing and archived leadgen chip adjustments.

QA widths: 1440, 1024, 768, 390, 320px. Check overflow, French text length, menus, focus, cards and range alignment. Do not use body overflow-x hiding as evidence that child content fits.

## Existing visual assets

Inventory checked against root HTML/CSS/JS references; unreferenced means not found there, not proven safe to delete.

| Asset family | Files / current status | Appropriate use |
| --- | --- | --- |
| Active logo | `assets/img/logo-black-narrow.png` | Header mark next to live text wordmark; preserve aspect ratio |
| Structured-data logo | `logo-black.png` | Organization logo in the homepage JSON-LD |
| Favicon | `favicon.png` | Browser identity |
| Team | `team/axel-ceo.png`, `team/ilan-cto.jpg` | Original user-supplied portraits; no retouch; circular CSS crop, object-fit cover, centered; 38px booking and 56px team |
| Active 3D hero decoration | `decor-2.png`, `decor-3.png` | Iridescent sparkle and rocket motifs in the homepage hero; small atmospheric accents |
| Future customers | `assets/customers/` currently contains instructions, no customer photos | Add only explicitly supplied and approved photos; 48px circular lazy-loaded portraits, meaningful alt text |
| Customer data | `assets/data/customers.json` and README | Empty customer list and disabled statistics; not an asset license or endorsement source |

Icons use minimal inline stroked SVG (for example hamburger), simple chevrons/arrows, checkmarks and native plus/minus. No single universal icon library is established. Reuse the existing line weight and small scale; avoid mixing filled multicolor icon packs.

## Inconsistencies and deferred work

1. Three token namespaces coexist: `.home --hs-*`, `.demo-wrapper --apple-*`, `.lg-scope --ss-*`, plus hardcoded public styles. `--ss-surface` already means cream in leadgen, so globally redefining it as white would be misleading.
2. Blue `#0a66c2` coexists with demo `#0071e3`, contextual `#254b70` and aurora colors. Only the first is the general accent; migration would need visual review.
3. Success greens and red/attention colors differ across pricing, home and demo. No uniform semantic status component exists.
4. Buttons vary in typography, border thickness, padding and radius. Header equal dimensions are not implemented. This is the next separately requested visual task.
5. Hero uses the system font stack while most pages use Inter. This is visible, not safe to silently normalize.
6. Card radii span 17/18/20/22px; controls 6/8/9/10/11/12/14px. Existing differences should be documented before consolidation.
7. Similar shadows have .06/.08/.10/.12/.14 opacity variants. Most customer/corporate cards have none, so adding a common shadow changes appearance.
8. Containers are 1280/1200/1120/840/780/720px and section spacing has multiple scales. Some differences are intentional role distinctions.
9. Borders mix warm hex neutrals and alpha black/blue. These are not interchangeable over tinted surfaces.
10. Base CSS still contains old mega-menu, letter, product/mockup and iridescent-list patterns; `.hs-*` and leadgen reference styles are not all represented in current markup. Do not delete them based only on naming or a text search.
11. Mobile base button rules contain `!important` and full-width styling; scoped overrides require checking the cloned booking wrapper.
12. FAQ purchase/dedicated typography differs; footer/header action labels differ intentionally. Generic page-button hover/active styles and form validation are not centralized.
13. Fine print grays and glass-pill text need contextual contrast review; this audit does not certify WCAG compliance.

## Token centralization decision

No CSS-variable migration in this task. A documentation-only change guarantees the rendered assets remain byte-identical and avoids scope/cascade changes. The tables above are the normalized role vocabulary for future work, not newly injected `:root` variables.

A later safe migration should use non-colliding `--ss-public-*` names, replace only exact equal values, preserve scoped demo/app exceptions and load order, and compare computed styles/screenshots at the QA widths. Do not centralize first and discover visual drift afterward.

## Do / Don't

**Do:** warm cream canvas; readable dark text; restrained blue for meaning/focus; white softly bordered cards; rounded controls; generous but purposeful whitespace; real portraits; semantic lists and headings; native accordions; subtle hero-only atmosphere; reuse existing component classes.

**Don't:** neon SaaS, purple as the main UI identity, heavy gradients on every panel, brutalist borders, dense dashboard styling on marketing pages, stock people posed as customers, arbitrary new shadows/radii, low-contrast text for essential information, or decorative motion that ignores reduced-motion preferences.

## Future design rule

All future sections, pages and components must follow this design system, including homepage, Our Solution, Pricing, FAQ, About, Careers, Media, Contact, Customers, Newsletter and demo booking dropdown. Do not introduce arbitrary colors, radii, shadows or button styles without a clear reason. Record a deliberate exception here with its scope. Reuse current components first; resolve documented inconsistencies in separately reviewed changes, never through an incidental redesign.

## Homepage radar preview (September 2026)

The `.home-radar` product demonstration uses neutral white/gray surfaces, the app’s OpenFreeMap Bright basemap, charcoal pins and white contact cards. Green is reserved for the geographic selection, detected signals and analysis motion, with brand blue for the active step. These colors and the 14–19px component radii are scoped to this product preview. See `docs/radar-preview.md` for source references, fictional data handling and motion behavior.
