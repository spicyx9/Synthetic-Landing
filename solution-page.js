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

// One visual progression stack; semantic chapter headings remain in document order.
(() => {
  const story = document.querySelector('.product-story');
  const progress = story?.querySelector('[data-story-progress]');
  if (!progress) return;
  const chapters = [...story.querySelectorAll('.story-chapter')];
  const rows = [...progress.querySelectorAll('.story-progress-row')];
  const header = document.querySelector('.header');
  const desktop = matchMedia('(min-width:701px) and (min-height:600px)');
  let queued = false;
  function update() {
    queued = false;
    story.classList.toggle('story-progress-enabled', desktop.matches);
    if (!desktop.matches) {
      chapters.forEach(chapter => chapter.classList.toggle('is-progress-visible', false));
      return;
    }
    const headerRect = header?.getBoundingClientRect();
    const top = headerRect ? Math.round(headerRect.bottom) : 61;
    story.style.setProperty('--progress-top', `${top}px`);
    const rowHeight = parseFloat(getComputedStyle(story).getPropertyValue('--progress-row-height'));
    let activeStep = 0;
    chapters.forEach((chapter, index) => {
      if (chapter.getBoundingClientRect().top <= top + index * rowHeight) activeStep = index;
    });
    const started = chapters[0].getBoundingClientRect().top <= top;
    let visibleThroughStep = started ? activeStep : -1;
    const stackBottom = top + (activeStep + 1) * rowHeight;
    const previewDistance = 140;
    const nextChapter = chapters[activeStep + 1];
    if (started && nextChapter && nextChapter.getBoundingClientRect().top <= stackBottom + previewDistance) {
      visibleThroughStep = activeStep + 1;
    }
    rows.forEach((row, index) => {
      row.hidden = index > visibleThroughStep;
      row.classList.toggle('is-active', started && index === activeStep);
      row.classList.toggle('is-upcoming', index > activeStep && index <= visibleThroughStep);
    });
    chapters.forEach((chapter, index) => {
      chapter.classList.toggle('is-progress-visible', index <= visibleThroughStep);
    });
    const exit = Math.min(0, story.getBoundingClientRect().bottom - top - (visibleThroughStep + 1) * rowHeight);
    progress.style.setProperty('--progress-exit', `${exit}px`);
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  desktop.addEventListener('change', schedule);
  if (header) new ResizeObserver(schedule).observe(header);
  update();
})();
