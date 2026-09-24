(() => {
  const floating = document.querySelector('[data-floating-demo]');
  if (!floating) return;
  let previousY = Math.max(0, window.scrollY);
  function setVisible(visible) {
    if (!visible && floating.contains(document.activeElement)) {
      document.querySelector('header [data-book-demo]')?.focus({preventScroll: true});
    }
    floating.classList.toggle('is-visible', visible);
    floating.inert = !visible;
    floating.setAttribute('aria-hidden', String(!visible));
  }
  window.addEventListener('scroll', () => {
    // Opening the mobile menu temporarily fixes the body and resets scrollY.
    if (document.querySelector('.mobile-menu-overlay.open')) return;
    const currentY = Math.max(0, window.scrollY);
    if (Math.abs(currentY - previousY) < 6) return;
    setVisible(currentY > previousY);
    previousY = currentY;
  }, {passive: true});
  window.addEventListener('pageshow', () => {
    previousY = Math.max(0, window.scrollY);
    setVisible(true);
  });
  setVisible(true);
})();
