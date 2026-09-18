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
