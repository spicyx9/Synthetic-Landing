(() => {
  const page = document.querySelector('.solution-page');
  const motion = page?.querySelector('[data-motion]');
  motion?.addEventListener('click', () => {
    const paused = page.classList.toggle('is-paused');
    motion.setAttribute('aria-pressed', String(paused));
    window.SwarmMotion?.refresh();
    motion.textContent = document.documentElement.lang === 'fr'
      ? (paused ? 'Reprendre l’animation' : 'Mettre en pause')
      : (paused ? 'Resume animation' : 'Pause animation');
  });
})();

(() => {
  const volume = document.querySelector('#target-volume');
  const output = document.querySelector('#target-volume-value');
  volume?.addEventListener('input', () => {
    output.textContent = `${volume.value} / ${document.documentElement.lang === 'fr' ? 'semaine' : 'week'}`;
  });
})();
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
(() => {
  const choices = [...document.querySelectorAll('[data-combination]')];
  choices.forEach(choice => choice.addEventListener('click', () => {
    choices.forEach(button => {
      const selected = button === choice;
      button.setAttribute('aria-pressed', String(selected));
      document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
    });
  }));
  const summary = document.querySelector('[data-target-summary]');
  const fields = ['target-0', 'target-1', 'target-decision'].map(id => document.getElementById(id));
  fields.forEach(field => field?.addEventListener('change', () => {
    summary.textContent = fields.map(item => item.value).join(' · ');
  }));
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

// Keep one focused moment open, including browsers without details[name] support.
document.querySelectorAll('.sp-change').forEach(item => item.addEventListener('toggle', () => {
  if (item.open) document.querySelectorAll('.sp-change').forEach(other => { if (other !== item) other.open = false; });
}));
