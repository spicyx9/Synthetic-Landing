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
