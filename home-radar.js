/* A product story using public map tiles. No searches, contacts or production API calls. */
(() => {
  'use strict';
  const root = document.querySelector('.home-radar');
  if (!root) return;
  const fr = document.documentElement.lang === 'fr';
  const copy = fr ? {
    query: 'Artisans récemment installés dans le Rhône, à contacter pour une prévoyance.',
    summary: 'Prévoyance · Bâtiment · Rhône',
    status: ['Une offre de prévoyance, une cible précise.', 'Votre secteur se dessine.', '12 entreprises dans votre secteur.', 'Analyse des entreprises et des raisons de les contacter…', '3 fiches prêtes à explorer'],
  } : {
    query: 'Newly self-employed tradespeople in the Rhône who may need income protection.',
    summary: 'Income protection · Building trades · Rhône',
    status: ['An income protection offer, a specific target.', 'Your area takes shape.', '12 companies in your area.', 'Analysing companies and reasons to reach out…', '3 profiles ready to explore'],
  };
  const input = root.querySelector('#radar-query');
  const status = root.querySelector('[data-radar-status]');
  const results = root.querySelector('.radar-results');
  const pins = [...root.querySelectorAll('button.radar-pin')];
  const steps = [...root.querySelectorAll('[data-radar-step]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const TYPE_START = 500, CHAR_DELAY = 28;
  const QUERY_END = TYPE_START + copy.query.length * CHAR_DELAY + 500;
  const DISCOVER_START = QUERY_END + 4200;
  const ANALYZE_START = DISCOVER_START + 2100;
  const ANALYZE_DURATION = 4500;
  const END = ANALYZE_START + ANALYZE_DURATION;
  const stages = ['query', 'scope', 'discover', 'analyze', 'complete'];
  let elapsed = 0, phase = -1, frame = 0, previous = 0, visible = false;

  const map = window.createHomeRadarMap?.(root);
  let mapReady = !map;
  map?.ready.then(() => { mapReady=true; render(); sync(); });

  function selectProfile(index) {
    root.querySelectorAll('[data-radar-profile]').forEach(button => {
      const active = Number(button.dataset.radarProfile) === index;
      if (button.classList.contains('radar-pin')) button.setAttribute('aria-pressed', String(active));
      else button.setAttribute('aria-expanded', String(active));
    });
    root.querySelectorAll('[data-profile-card]').forEach(card => {
      card.querySelector('.radar-card-detail').hidden = Number(card.dataset.profileCard) !== index;
    });
  }
  function render() {
    const next = elapsed < QUERY_END ? 0 : elapsed < DISCOVER_START ? 1 : elapsed < ANALYZE_START ? 2 : elapsed < END ? 3 : 4;
    input.value = next === 0 ? copy.query.slice(0, Math.floor(Math.max(0, elapsed - TYPE_START) / CHAR_DELAY)) : copy.summary;
    const starts = [0,QUERY_END,DISCOVER_START,ANALYZE_START,END];
    const lengths = [QUERY_END,4200,2100,ANALYZE_DURATION,1];
    map?.render(stages[next],Math.min(1,Math.max(0,(elapsed-starts[next])/lengths[next])));
    if (next !== phase) {
      phase = next;
      root.dataset.phase = stages[phase];
      status.textContent = copy.status[phase];
      results.inert = phase !== 4;
      results.setAttribute('aria-hidden', String(phase !== 4));
      pins.forEach(pin => { pin.disabled = phase !== 4; });
      steps.forEach((button, i) => button.setAttribute('aria-pressed', String(i === [0, 1, 2, 2, 3][phase])));
    }
  }
  function tick(now) {
    frame = 0;
    if (!mapReady || !visible || document.hidden || elapsed >= END) { previous = 0; return; }
    if (previous) elapsed = Math.min(END, elapsed + Math.min(now - previous, 100));
    previous = now;
    render();
    if (elapsed < END) frame = requestAnimationFrame(tick);
  }
  function sync() {
    const stopped = !mapReady || !visible || document.hidden;
    if (stopped) map?.stop();
    root.classList.toggle('is-paused', stopped);
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    if (!stopped && elapsed < END) frame = requestAnimationFrame(tick);
  }
  function finish() {
    elapsed = END; render(); sync();
  }
  function restart() {
    elapsed = 0; phase = -1;
    selectProfile(0); render(); sync();
  }
  steps.forEach((button, index) => button.addEventListener('click', () => {
    if (index === 0 && !reduced.matches) { restart(); return; }
    elapsed = [QUERY_END - 500, QUERY_END, ANALYZE_START + 500, END][index];
    render(); sync();
  }));
  root.querySelectorAll('[data-radar-profile]').forEach(button => button.addEventListener('click', () => selectProfile(Number(button.dataset.radarProfile))));
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); previous = 0; });
  window.addEventListener('pageshow', sync);
  if (reduced.matches || !('IntersectionObserver' in window)) {
    finish();
  } else {
    render();
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, {threshold:0, rootMargin:'-15% 0px -20% 0px'});
    observer.observe(root.querySelector('.radar-stage'));
  }
})();
