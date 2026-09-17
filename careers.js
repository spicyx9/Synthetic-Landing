(() => {
  const root = document.querySelector('[data-jobs]');
  if (!root) return;
  const nav = root.querySelector('.jobs-nav');
  const buttons = [...nav.querySelectorAll('[data-job]')];
  const panels = [...root.querySelectorAll('.job-item')];
  const mobile = window.matchMedia('(max-width: 700px)');
  let selected = 0;
  function render() {
    nav.hidden = mobile.matches;
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-orientation', 'vertical');
    buttons.forEach((button, i) => {
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(i === selected));
      button.tabIndex = i === selected ? 0 : -1;
      const panel = panels[i];
      panel.classList.toggle('is-active', i === selected);
      panel.inert = !mobile.matches && i !== selected;
      if (mobile.matches) {
        panel.removeAttribute('role');
        panel.removeAttribute('aria-labelledby');
        panel.removeAttribute('aria-hidden');
        panel.removeAttribute('tabindex');
      } else {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', button.id);
        panel.setAttribute('aria-hidden', String(i !== selected));
        panel.tabIndex = i === selected ? 0 : -1;
      }
      panel.open = !mobile.matches || i === selected;
    });
  }
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => { selected = i; render(); });
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown') next = (i + 1) % buttons.length;
      if (event.key === 'ArrowUp') next = (i + buttons.length - 1) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next === undefined) return;
      event.preventDefault(); selected = next; render(); buttons[next].focus();
    });
  });
  panels.forEach((panel, i) => {
    panel.querySelector('summary').addEventListener('click', event => {
      if (!mobile.matches) return;
      event.preventDefault(); selected = panel.open ? -1 : i; render();
    });
  });
  mobile.addEventListener('change', () => {
    if (selected < 0 && !mobile.matches) selected = 0;
    render();
  });
  root.classList.add('is-enhanced');
  render();
})();
