window.SwarmMotion?.ready(M => {
  const page = document.querySelector('.solution-page');
  if (!page) return;
  const hero = page.querySelector('.sp-hero');
  M.sequence(hero, [
    ...[...hero.querySelectorAll(':scope > .page-kicker, :scope > h1, :scope > p')].map((element,i)=>M.step(element,i*60,'fade',220)),
    ...[...hero.querySelectorAll('.page-actions > *')].map((element,i)=>M.step(element,180+i*40,'fade',220)),
    M.step(hero.querySelector('.solution-capabilities'),300,'fade',240)
  ],{entrance:true});
  page.querySelectorAll('.story-chapter').forEach(section => {
    if (section.id === 'targeting') return;
    const tracks = [M.step(section.querySelector('.story-subtitle'),0,'fade',280)];
    const add = (selector,at,stagger=45,effect='fade') => section.querySelectorAll(selector).forEach((el,i)=>tracks.push(M.step(el,at+i*stagger,effect,320)));
    if (section.id === 'moments') {
      add('.story-monitor',0); add('.story-signal',80,40);
    } else if (section.id === 'qualification') {
      add('.story-facts li',100,80,'left'); add('.story-convergence',300); add('.story-meaning',460);
    } else {
      add('.story-profile',60); add('.story-person',160); add('.story-contacts li',230,50); add('.story-call-reason',380); add('.story-checks li',460,35);
    }
    M.sequence(section,tracks);
  });
  const final = page.querySelector('.sp-final');
  M.sequence(final,[...final.querySelectorAll(':scope > .page-kicker,:scope > h2,.page-actions > *')].map((element,i)=>M.step(element,i*120)));
});
