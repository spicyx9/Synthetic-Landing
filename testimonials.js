document.querySelectorAll('[data-testimonial-carousel]').forEach(root => {
  const track = root.querySelector('.testimonial-track');
  const cards = [...track.children];
  const prev = root.querySelector('[data-testimonial-prev]');
  const next = root.querySelector('[data-testimonial-next]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const position = card => card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
  const current = () => cards.reduce((best, card, i) => Math.abs(position(card) - track.scrollLeft) < Math.abs(position(cards[best]) - track.scrollLeft) ? i : best, 0);
  const update = () => { prev.disabled = track.scrollLeft < 2; next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2; };
  const move = direction => { const index = Math.max(0, Math.min(cards.length - 1, current() + direction)); track.scrollTo({left:position(cards[index]), behavior:reduced.matches ? 'instant' : 'smooth'}); };
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } });
  track.addEventListener('scroll', update, {passive:true});
  new ResizeObserver(update).observe(track);
  update();
});
