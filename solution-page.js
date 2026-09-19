(() => {
  const floating = document.querySelector('[data-floating-demo]');
  const trigger = floating?.querySelector('[data-disclosure-trigger]');
  if (!trigger) return;
  new MutationObserver(() => {
    if (floating.getAttribute('aria-hidden') === 'true' && trigger.getAttribute('aria-expanded') === 'true') {
      document.getElementById(trigger.getAttribute('aria-controls')).hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }
  }).observe(floating, {attributes: true, attributeFilter: ['aria-hidden']});
})();
// This version follows the review brief: visible between hero and final CTA.
(() => {
  const floating = document.querySelector('[data-floating-demo]');
  const hero = document.querySelector('[data-demo-hero]');
  const end = document.querySelector('[data-demo-end]');
  if (!floating || !hero || !end) return;
  let queued = false;
  function update() {
    queued = false;
    if (document.querySelector('.mobile-menu-overlay.open')) return;
    const headerBottom = document.querySelector('header').getBoundingClientRect().bottom;
    const visible = hero.getBoundingClientRect().bottom <= headerBottom && end.getBoundingClientRect().top > innerHeight + 24;
    if (!visible && floating.contains(document.activeElement)) {
      const target = document.querySelector('.mobile-menu-toggle');
      (target?.getClientRects().length ? target : document.querySelector('header [data-book-demo]'))?.focus({preventScroll: true});
    }
    floating.classList.toggle('is-visible', visible);
    floating.inert = !visible;
    floating.setAttribute('aria-hidden', String(!visible));
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', update);
  document.addEventListener('focusin', schedule);
  update();
})();
