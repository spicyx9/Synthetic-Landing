(() => {
  const floating = document.querySelector('[data-floating-demo]');
  const hero = document.querySelector('[data-demo-hero]');
  const end = document.querySelector('[data-demo-end]');
  const footer = document.querySelector('footer');
  if (!floating || !hero || !end || !footer || !('IntersectionObserver' in window)) return;
  function update() {
    const visible = hero.getBoundingClientRect().bottom <= 0 && end.getBoundingClientRect().top > window.innerHeight && footer.getBoundingClientRect().top > window.innerHeight;
    if (!visible && floating.classList.contains('is-visible')) {
      const focused = floating.contains(document.activeElement);
      if (focused) (end.getBoundingClientRect().top < window.innerHeight ? end.querySelector('[data-book-demo]') : document.querySelector('header [data-book-demo]'))?.focus({preventScroll:true});
    }
    floating.classList.toggle('is-visible',visible);
    floating.inert = !visible;
    floating.setAttribute('aria-hidden',String(!visible));
  }
  const observer = new IntersectionObserver(update,{threshold:[0,1]});
  [hero,end,footer].forEach(element=>observer.observe(element));
  window.addEventListener('resize',update);
  window.addEventListener('pageshow',update);
  update();
})();
