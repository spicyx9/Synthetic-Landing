/* Shared motion lifecycle. Page modules describe stories, never scroll handlers. */
(() => {
  'use strict';
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const records = new Map();
  const pending = [];
  const tokens = getComputedStyle(document.documentElement);
  const milliseconds = (name, fallback) => parseFloat(tokens.getPropertyValue(name)) || fallback;
  const duration = milliseconds('--motion-medium', 560);
  const easing = tokens.getPropertyValue('--ease-out-premium').trim() || 'ease-out';
  const supported = typeof Element.prototype.animate === 'function' && 'IntersectionObserver' in window;
  let observer;
  function finish(record) {
    record.animations.forEach(animation => animation.cancel());
    record.animations.length = 0;
    record.done = true;
    record.root.dataset.motionState = 'complete';
    observer?.unobserve(record.root);
  }
  function sync(record) {
    if (record.done) return;
    if (media.matches) { finish(record); return; }
    const paused = document.hidden || record.root.closest('.is-paused');
    if (record.visible && !paused) {
      record.root.dataset.motionState = 'playing';
      record.animations.forEach(animation => animation.play());
    } else if (paused || record.loop || !record.started) {
      record.root.dataset.motionState = 'paused';
      record.animations.forEach(animation => animation.pause());
    }
    if (record.visible) record.started = true;
  }
  if (supported) observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const record = records.get(entry.target);
      if (!record || record.done) return;
      record.visible = entry.isIntersecting && entry.intersectionRatio >= .12;
      sync(record);
    });
  }, {threshold: [0,.12], rootMargin: '0px 0px -4% 0px'});
  function register(root, tracks, options = {}) {
    if (!root || !supported || media.matches || !tracks.length || records.has(root)) return;
    const record = {root, animations: [], loop: !!options.loop, visible: false, started: false, done: false};
    records.set(root, record);
    try {
      tracks.forEach(track => {
        if (!track.element) return;
        const animation = track.element.animate(track.frames, {...track.options, easing: track.options?.easing || easing, fill: 'both'});
        animation.finished.catch(() => {});
        animation.pause(); animation.currentTime = 0;
        record.animations.push(animation);
      });
      if (!record.animations.length) { records.delete(root); return; }
      if (!record.loop) Promise.all(record.animations.map(animation => animation.finished)).then(() => finish(record)).catch(() => {});
      root.dataset.motionState = 'waiting';
      observer.observe(root);
      if (options.entrance) { record.visible = true; sync(record); }
    } catch (_) { finish(record); }
  }
  function step(element, delay = 0, effect = 'rise', speed = duration) {
    const distance = innerWidth < 701 ? 8 : milliseconds('--reveal-distance-medium', 18);
    const start = {opacity: 0}, end = {opacity: 1};
    if (effect === 'line') { start.clipPath = 'inset(0 0 100% 0)'; end.clipPath = 'inset(0 0 0% 0)'; start.translate = '0 8px'; end.translate = '0 0'; }
    else if (effect === 'surface') { start.scale = '.98'; end.scale = '1'; }
    else if (effect === 'left') { start.translate = `${-distance}px 0`; end.translate = '0 0'; }
    else if (effect !== 'fade') { start.translate = `0 ${distance}px`; end.translate = '0 0'; }
    return {element, frames: [start,end], options: {duration: speed, delay}};
  }
  function sequence(root, steps, options = {}) { register(root, steps.filter(item => item.element), options); }
  function story(root, items, options = {}) {
    const cycle = options.duration || 10000;
    root?.classList.add('motion-story-managed');
    const tracks = items.filter(item => item.element).map(item => {
      const start = Math.min(.9, (item.at || 0) / cycle);
      const end = Math.min(.98, start + (item.duration || 600) / cycle);
      let frames;
      if (item.frames) frames = item.frames;
      else if (item.pulse) frames = [{opacity: .55, offset: 0},{opacity: .55, offset: start},{opacity: 1, offset: end},{opacity: 1, offset: 1}];
      else if (item.filter || item.move) frames = [{opacity: 0, translate: '0 8px', offset: 0},{opacity: 0, translate: '0 8px', offset: start},{opacity: 1, translate: '0 0', offset: end},{opacity: 1, translate: '0 0', offset: .2},{opacity: item.filter ? .15 : 1, translate: item.move || '0 0', offset: .32},{opacity: item.filter ? .15 : 1, translate: item.move || '0 0', offset: 1}];
      else frames = [{opacity: 0, translate: '0 8px', offset: 0},{opacity: 0, translate: '0 8px', offset: start},{opacity: 1, translate: '0 0', offset: end},{opacity: 1, translate: '0 0', offset: 1}];
      if (options.loop && !item.pulse) {
        frames[frames.length - 1].offset = .96;
        frames.push({...frames[frames.length - 1], opacity: 0, offset: 1});
      }
      return {element: item.element, frames: frames.map(frame => ({...frame, easing})), options: {easing: 'linear', duration: cycle, iterations: options.loop ? Infinity : 1}};
    });
    register(root, tracks, {loop: options.loop});
  }
  const api = {step, sequence, story, replay(root, steps) { const old = records.get(root); if (old) { finish(old); records.delete(root); } sequence(root, steps, {entrance:true}); }, refresh: () => records.forEach(sync), reduced: () => media.matches,
    ready(callback) { if (document.readyState === 'loading') pending.push(callback); else run(callback); }};
  function run(callback) { try { callback(api); } catch (_) { records.forEach(finish); } }
  window.SwarmMotion = api;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-reveal-group]').forEach(root => {
      sequence(root, [...root.querySelectorAll('[data-reveal]')].map((element,index) => step(element, Number(element.dataset.revealDelay || index * 100), element.dataset.reveal || 'rise')), {entrance: root.dataset.revealGroup === 'entrance'});
    });
    pending.forEach(run);
  }, {once: true});
  document.addEventListener('focusin', event => {
    records.forEach(record => { if (!record.done && record.root.contains(event.target)) finish(record); });
  });
  document.addEventListener('visibilitychange', api.refresh);
  media.addEventListener('change', () => { if (media.matches) records.forEach(finish); });
  window.addEventListener('pagehide', () => records.forEach(finish));
})();
