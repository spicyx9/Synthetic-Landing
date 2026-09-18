# Public navigation audit, 2026-09-18

## Reproduced cause

On /index-fr, before changes, the header computed to `position: sticky`. Its only ancestors were body and html. Both specified `overflow-x: hidden`, which computed the other axis to `auto`. The body became the sticky scroll ancestor while the document actually scrolled. At scrollY 2136, the header top was -2136. Neither ancestor had transform, filter, perspective or containment. The header itself had backdrop-filter, not an ancestor transform. Page visual wrappers were siblings, not header ancestors. Navigation JS clones menu contents into a dialog, not the header.

The Solution page had a separate fixed-header workaround with its own 60px body padding and z-index 1000. This was removed in favor of shared behavior.

## Implementation

- Shared fixed header at layer 100; menu 200; skip link 300; floating CTA remains 50.
- Shared 61px offset (60px inner area plus existing border), plus safe-area top inset. Body compensates once, preserving the existing hero position.
- Horizontal clipping uses clip, avoiding an unintended vertical scroll container.
- Global scroll padding is the header offset plus 16px; target/focus scroll margin adds 8px.
- Main is keyboard-focusable for skip navigation. Existing disclosure keyboard behavior remains.
- Mobile menu locks body at the saved scroll position and restores inline styles and scroll without smooth scrolling. Focus returns without scrolling. Desktop resize returns focus to the visible header logo.
- Menu panel can scroll at short heights. Safe-area padding and viewport-fit cover apply consistently.
- Versioned shared asset URLs prevent stale CSS/JS. No content copy changed.

## Browser evidence

Using the available Codex in-app browser against localhost:9183:

- 24 main routes tested at 1440x900 and 390x844, scrolling to the footer. All header tops remained zero; mobile toggles remained reachable. Short legal pages without overflow stayed at zero.
- Additional /media, /medias, /lead-magnets and /lead-magnets-fr checked on desktop. Production redirects for lead-magnets remain unchanged.
- Desktop checks at 1440x900, 1440x800, 1280x720, 1024x768: 61px header, top zero, no horizontal overflow.
- 320x640 mobile: header, hero, menu and expanded About panel visually checked.
- About, language and booking tested while scrolled: ArrowDown opens and focuses a link; Escape closes; outside click closes. Booking appears above Solution content.
- Mobile booking and menu: saved scrollY 3357 restored to 3357 after closing. Background is inert while open.
- #pricing target top 84.93; heading 124.93. #faq target top 85.02. Header bottom 61. Keyboard FAQ focus top 236.52.
- Skip link activation focused main; main top 61.
- Home hero/comparison/pricing/newsletter/footer and Solution visuals/floating CTA inspected during navigation. Existing 59 repository tests pass.

Routes: /index-fr, /notre-solution, /pricing-fr, /faq-fr, /a-propos, /recrutement, /contact-fr, /clients, /mentions-legales, /confidentialite, /conditions, /opposition, /, /our-solution, /pricing, /faq, /about, /careers, /contact, /customers, /legal-notice, /privacy, /terms, /opt-out.

## Unverified environments

Safari could not be controlled: computer-use permissions are not granted. The browser inventory exposed only the in-app browser, with no independently selectable Chromium or WebKit instance. No cross-engine PASS is claimed.

Native 200% zoom was not exposed by the in-app browser: zoom shortcuts did not change its CSS viewport. A 720x450 reflow check (equivalent layout width to 1440x900 at 200%) passed including the open booking menu, but this is not a native browser zoom test. Physical iPhone safe-area behavior remains unverified.
