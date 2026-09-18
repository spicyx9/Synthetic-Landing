window.SwarmMotion?.ready(M => {
  const page = document.querySelector('.solution-page');
  if (!page) return;
  const hero = page.querySelector('.sp-hero');
  M.sequence(hero, [
    ...[...hero.querySelectorAll(':scope > .page-kicker, :scope > h1, :scope > p')].map((element,i)=>M.step(element,100+i*120,i===1?'line':'rise')),
    ...[...hero.querySelectorAll('.page-actions > *')].map((element,i)=>M.step(element,460+i*60))
  ],{entrance:true});
  page.querySelectorAll('.sp-editorial').forEach(section => {
    const steps = [...section.querySelectorAll('.sp-editorial-copy > *')].map((element,i)=>M.step(element,i*100));
    const visual = section.querySelector('.sp-editorial-visual');
    steps.push(M.step(visual,320,'surface'));
    if (section.querySelector('.sp-targeting')) {
      section.querySelectorAll('.sp-setting').forEach((element,i)=>steps.push(M.step(element,450+i*110)));
      steps.push(M.step(section.querySelector('.sp-volume'),1150,'surface'));
    } else if (section.querySelector('.sp-event-feed')) {
      section.querySelectorAll('.sp-change').forEach((element,i)=>steps.push(M.step(element,440+i*100,'left')));
      steps.push(M.step(section.querySelector('.sp-catalogue-note'),1100,'fade'));
    } else if (section.querySelector('.sp-combination')) {
      section.querySelectorAll('.sp-combination-example:not([hidden]) .sp-facts > *').forEach((element,i)=>steps.push(M.step(element,440+i*130,'surface')));
      steps.push(M.step(section.querySelector('.sp-combination-example:not([hidden]) .sp-qualification-bridge'),1050,'fade'));
      steps.push(M.step(section.querySelector('.sp-combination-example:not([hidden]) .sp-combined'),1350));
    } else if (section.querySelector('.sp-full-verification')) {
      section.querySelectorAll('.sp-full-verification > ol > li').forEach((element,i)=> {
        steps.push(M.step(element,440+i*220));
        steps.push(M.step(element.querySelector('.sp-check-mark'),610+i*220,'surface'));
      });
      steps.push(M.step(section.querySelector('.sp-phone-detail'),1350,'fade'));
      steps.push(M.step(section.querySelector('.sp-uncertainty'),1460,'fade'));
    } else if (section.querySelector('.sp-profile')) {
      steps.push(M.step(section.querySelector('.sp-profile-brand'),400,'fade'));
      steps.push(M.step(section.querySelector('.sp-identity'),550));
      section.querySelectorAll('.sp-contact-actions li').forEach((element,i)=>steps.push(M.step(element,760+i*100,'surface')));
      steps.push(M.step(section.querySelector('.sp-profile-event'),1100));
      steps.push(M.step(section.querySelector('.sp-why'),1380));
      steps.push(M.step(section.querySelector('.sp-profile-top .sp-ready'),1710,'surface'));
      steps.push(M.step(section.querySelector('.sp-profile-bottom'),1800,'fade'));
    }
    M.sequence(section,steps);
  });
  const engine = page.querySelector('.eng-stage');
  if (engine) {
    const items = [];
    const nodes = [...engine.querySelectorAll('.eng-node')].filter(element => getComputedStyle(element).display !== 'none');
    nodes.forEach((element,i)=>items.push({element,at:400+i*(1000/Math.max(1,nodes.length-1)),filter:element.classList.contains('eng-muted'),move:innerWidth<701?'0 8px':'18px 0'}));
    items.push({element:engine.querySelector('.eng-convergence'),at:1800});
    engine.querySelectorAll('.eng-flow').forEach((element,i)=>items.push({element,frames:[{strokeDashoffset:440,opacity:0,offset:0},{strokeDashoffset:440,opacity:1,offset:.17+i*.025},{strokeDashoffset:0,opacity:1,offset:.44+i*.025},{strokeDashoffset:0,opacity:0,offset:.5},{strokeDashoffset:0,opacity:0,offset:1}]}));
    engine.querySelectorAll('.eng-core li').forEach((element,i)=>items.push({element,at:3000+i*600,pulse:true}));
    items.push({element:engine.querySelector('.eng-exit'),at:5000});
    items.push({element:engine.querySelector('.eng-result'),at:5400});
    items.push({element:engine.querySelector('.eng-result-identity'),at:5900});
    items.push({element:engine.querySelector('.eng-result-contact'),at:6400});
    items.push({element:engine.querySelector('.eng-result-moment'),at:6750});
    items.push({element:engine.querySelector('.eng-result-why'),at:7000});
    items.push({element:engine.querySelector('.sp-ready'),at:7600});
    M.story(engine,items,{duration:11000,loop:true});
    const heading = page.querySelector('.sp-section-top');
    M.sequence(heading,[...heading.querySelectorAll('.page-kicker,h2,button')].map((element,i)=>M.step(element,i*100)));
    const instruction = page.querySelector('.eng-instruction');
    M.sequence(instruction,[...instruction.children].map((element,i)=>M.step(element,i*120)));
  }
  const final = page.querySelector('.sp-final');
  M.sequence(final,[...final.querySelectorAll(':scope > .page-kicker,:scope > h2,.page-actions > *')].map((element,i)=>M.step(element,i*120)));
  page.querySelectorAll('[data-combination]').forEach(button => button.addEventListener('click',()=> {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    M.replay(panel,[...panel.querySelectorAll('.sp-facts > *, .sp-qualification-bridge, .sp-combined')].map((element,i)=>M.step(element,i*120)));
  }));
});
