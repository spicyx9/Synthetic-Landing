window.SwarmMotion?.ready(M => {
  const hero = document.querySelector('.home-focused-hero');
  if (!hero) return;
  const q = selector => hero.querySelector(selector);
  M.sequence(hero, [
    M.step(q('.demo-hero__eyebrow'),100,'fade'),
    M.step(q('.motion-headline-part'),220,'line'),
    M.step(q('.demo-hero__headline .hl'),300,'line'),
    M.step(q('.demo-hero__subtitle'),360),
    M.step(q('.home-actions .demo-booking'),500),
    M.step(q('.home-actions > a'),560),
    M.step(q('.aurora'),650,'fade'),
    ...[...hero.querySelectorAll('.hero-decor')].map((element,i) => M.step(element,650+i*80,'surface'))
  ], {entrance:true});
});
