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
    const tracks = [...section.querySelectorAll('.story-heading > *')].map((el,i)=>M.step(el,i*50,'fade',280));
    const add = (selector,at,stagger=45,effect='fade') => section.querySelectorAll(selector).forEach((el,i)=>tracks.push(M.step(el,at+i*stagger,effect,320)));
    if (section.id === 'targeting') {
      add('.story-composer',60); add('.story-target-text',130); add('.story-filter-row > span',220,25); add('.story-base',420);
    } else if (section.id === 'moments') {
      add('.story-monitor',40); add('.story-signal',140,65,'left');
      tracks.push({element:section.querySelector('.is-selected'),frames:[{backgroundColor:'transparent'},{backgroundColor:'#f0f5fa'}],options:{delay:560,duration:300}});
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
