(() => {
  const page = document.querySelector('.solution-page');
  const motion = page?.querySelector('[data-motion]');
  motion?.addEventListener('click', () => {
    const paused = page.classList.toggle('is-paused');
    motion.setAttribute('aria-pressed', String(paused));
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
