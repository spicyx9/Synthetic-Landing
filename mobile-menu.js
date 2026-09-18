/** Shared navigation for static public pages. Content is authored in HTML. */
(function () {
  const header = document.querySelector('.header-inner');
  if (!header) return;
  const main = document.querySelector('main[id]');
  if (main && !main.hasAttribute('tabindex')) main.tabIndex = -1;
  const isFr = document.documentElement.lang === 'fr';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mobile-menu-toggle';
  toggle.setAttribute('aria-label', isFr ? 'Ouvrir le menu' : 'Open menu');
  toggle.setAttribute('aria-controls', 'mobile-menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
  header.appendChild(toggle);

  const overlay = document.createElement('div');
  overlay.id = 'mobile-menu';
  overlay.className = 'mobile-menu-overlay';
  overlay.inert = true;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Navigation');
  overlay.innerHTML = '<div class="mobile-menu-panel"><div class="mobile-menu-header"><span class="mobile-menu-brand">Menu</span><button type="button" class="mobile-menu-close" aria-label="' + (isFr ? 'Fermer le menu' : 'Close menu') + '">×</button></div><nav class="mobile-menu-body" aria-label="' + (isFr ? 'Navigation mobile' : 'Mobile navigation') + '"></nav><div class="mobile-menu-footer"></div></div>';

  const nav = header.querySelector('.nav-links');
  const actions = header.querySelector('.nav-actions');
  if (nav) [...nav.children].forEach(node => overlay.querySelector('.mobile-menu-body').appendChild(node.cloneNode(true)));
  if (actions) [...actions.children].forEach(node => overlay.querySelector('.mobile-menu-footer').appendChild(node.cloneNode(true)));
  overlay.querySelectorAll('[id]').forEach(node => { node.id = 'mobile-' + node.id; });
  overlay.querySelectorAll('[aria-controls]').forEach(node => node.setAttribute('aria-controls', 'mobile-' + node.getAttribute('aria-controls')));
  document.body.appendChild(overlay);

  let scrollPosition = 0;
  let previousBodyStyles = {};
  const lockedProperties = ['position', 'top', 'left', 'right', 'overflow'];
  const background = [...document.body.children].filter(node => node !== overlay && !['SCRIPT', 'STYLE'].includes(node.tagName));
  const previousInert = new Map();
  function closeMenu(restoreFocus = true) {
    if (!overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
    toggle.setAttribute('aria-expanded', 'false');
    lockedProperties.forEach(property => { document.body.style[property] = previousBodyStyles[property]; });
    window.scrollTo({top: scrollPosition, behavior: 'instant'});
    overlay.querySelectorAll('[data-disclosure-trigger]').forEach(button => button.setAttribute('aria-expanded', 'false'));
    overlay.querySelectorAll('[data-disclosure-panel]').forEach(panel => { panel.hidden = true; });
    background.forEach(node => { node.inert = previousInert.get(node) || false; });
    if (restoreFocus) toggle.focus({preventScroll: true});
    else header.querySelector('a[href]')?.focus({preventScroll: true});
  }
  toggle.addEventListener('click', function () {
    scrollPosition = window.scrollY;
    previousBodyStyles = Object.fromEntries(lockedProperties.map(property => [property, document.body.style[property]]));
    background.forEach(node => { previousInert.set(node, node.inert); node.inert = true; });
    overlay.inert = false;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    // Fix the document in place for iOS as well as desktop engines.
    Object.assign(document.body.style, {position: 'fixed', top: `-${scrollPosition}px`, left: '0', right: '0', overflow: 'hidden'});
    overlay.querySelector('.mobile-menu-close').focus({preventScroll: true});
  });
  overlay.querySelector('.mobile-menu-close').addEventListener('click', () => closeMenu());
  overlay.addEventListener('click', event => {
    if (event.target === overlay || event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (!overlay.classList.contains('open')) return;
    if (event.key === 'Escape') closeMenu();
    if (event.key === 'Tab') {
      const items = [...overlay.querySelectorAll('a[href], button')].filter(el => el.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && overlay.classList.contains('open')) closeMenu(false);
  });

  // Disclosure behavior is identical for About and booking, including mobile clones.
  document.querySelectorAll('[data-disclosure-trigger]').forEach(trigger => {
    const wrapper = trigger.parentElement;
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;
    function close(restoreFocus = false) {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) trigger.focus();
    }
    function open() {
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }
    trigger.addEventListener('click', () => panel.hidden ? open() : close());
    wrapper.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) {
        event.preventDefault(); event.stopPropagation(); close(true);
      } else if (event.key === 'ArrowDown' && event.target === trigger) {
        event.preventDefault(); open(); panel.querySelector('a').focus();
      }
    });
    document.addEventListener('click', event => { if (!wrapper.contains(event.target)) close(); });
    wrapper.addEventListener('focusout', event => { if (!wrapper.contains(event.relatedTarget)) close(); });
    panel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => close()));
  });

  document.querySelectorAll('[data-lang]').forEach(link => link.addEventListener('click', () => {
    const language = link.dataset.lang;
    if (language !== 'en' && language !== 'fr') return;
    // Let an explicit language choice override IP detection on later visits.
    document.cookie = `ss-language=${language}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
    try { localStorage.setItem('lang', language); } catch (_) {}
  }));
})();

