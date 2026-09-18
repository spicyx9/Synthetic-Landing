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
  const tabs = [...document.querySelectorAll('.sp-moment-tabs [role="tab"]')];
  function select(tab) {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault(); select(tabs[next]); tabs[next].focus();
    });
  });
})();
