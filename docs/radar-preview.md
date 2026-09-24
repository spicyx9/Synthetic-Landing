# Homepage radar preview

The FR and EN homepages place this illustrative product story immediately after the trust logos. `js/home-radar.js` plays once on entering the viewport: type a sample target, reveal the territory, show companies, animate their analysis, then retain three explorable prospect cards. Step selection continues playback. The first step restarts it; hidden tabs and offscreen states preserve elapsed time. Reduced motion and absent JavaScript leave readable completed content.

The preview uses fictional companies, abbreviated people and masked phone numbers. It makes no search, contact or application API requests. The query field is a read-only demonstration. The live basemap uses the same OpenFreeMap Bright style and MapLibre GL JS 5.6.1 as the app. Public map tiles are loaded from tiles.openfreemap.org; vendor code is served locally. The schematic SVG map remains an offline/no-JavaScript fallback.

Surfaces use the landing page's neutral whites and grays. The geographic selection, detected signals and analysis animation retain green; the active step uses the brand blue. The live map keeps its original cartographic colors. Territory layers reproduce the app’s fill, hatch, glow and outline. DOM pins are projected from longitude/latitude and retain their size throughout the camera movement.

Validation: `node --test tests/*.test.cjs`. Radar tests cover automatic progression, step navigation, background pause/resume, offscreen and hidden-tab lifecycle, linked pin/card selection, replay, reduced motion and French copy.

The pin effect was checked directly against `https://app.syntheticswarm.ai/ui/ui/radar-map.css` on 2026-09-22. Its four SVG layers and light treatment match the application. The landing demonstration uses a faster 1.1s introductory scan, a 1s light reveal delay and a 3.2s travelling-light cycle.

The area stage starts with metropolitan France (including Corsica), holds the overview briefly, then flies into Lyon over 4.2 seconds. A single live map handles the entire zoom without switching drawings. The playback clock also drives the camera, preserving pause/resume behavior; the opening waits for map readiness.

The query keeps the live map blurred. Discovery and analysis frame all twelve company coordinates, with 4.5 seconds for the scan and travelling light. Only the final profile stage zooms into the three retained companies.

The final camera destination is captured once. The WebGL canvas retains its full stage dimensions while the results window clips it; camera padding centers the three retained companies in the remaining space. Only actual stage resizes resize the canvas, avoiding per-frame buffer and camera recalculation during card entry.

## Detected changes

The following section uses six selectable company records instead of a text grid. Each illustrative record shows a before/after change, the green scan treatment and a reason to contact the company. `js/home-signals.js` advances once through the six examples while the record is in view; clicking a selector keeps that example open. Clicking the record advances to the next example, wrapping after the last; each newly selected example replays the scan. Keyboard focus pauses progression, hidden/offscreen pages preserve progress, and reduced motion leaves a static manually selectable record. No external business data is requested.

## Homepage presentation

The home flow is hero, scrolling client logos, radar demonstration, detected changes, three static testimonial cards, pricing and FAQ. The old comparison and static solution preview have been removed from the homepage; the dedicated solution pages remain available. FR and EN share the same presentation.

Trust-logo slots have explicit widths, including on mobile, so Safari measures each repeated group correctly. The hero signature has a blue light sweep, paused when hidden/offscreen and disabled for reduced motion. Testimonials display the existing text and portraits together without a carousel script.

Deployment uses the repository root on Vercel. The home CSS and motion URLs are versioned to invalidate the previous week-long asset cache. CSP allows the public tile host and MapLibre blob workers; vendor code and business examples remain local.
