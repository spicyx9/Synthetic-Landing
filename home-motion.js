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
window.SwarmMotion?.ready(M => {
  const comparison = document.querySelector('.home-comparison');
  if (comparison) {
    const items = [];
    const add = (selector,at,stagger=100) => comparison.querySelectorAll(selector).forEach((element,i) => items.push({element,at:at+i*stagger}));
    add('.comparison-side--before h2',0);
    add('.comparison-side--before li',120,110);
    add('.comparison-side--before .comparison-conclusion',500);
    add('.comparison-convergence',620);
    add('.comparison-side--after h2',820);
    add('.comparison-side--after li',980,120);
    add('.comparison-side--after .comparison-conclusion',1600);
    M.story(comparison,items,{duration:2600});
  }
  const system = document.querySelector('.solution-system');
  if (system) {
    const items = [];
    const add = (selector,at,stagger=150) => system.querySelectorAll(selector).forEach((element,i) => items.push({element,at:at+i*stagger}));
    add('.solution-target h3',0);
    add('.solution-target li',160,160);
    add('.solution-inputs li',850,180);
    add('.solution-connections',1600);
    add('.solution-engine-mark, .solution-engine h3',1900);
    add('.solution-engine li',2500,500);
    add('.solution-output',4000);
    add('.solution-output h4',4450);
    add('.solution-person',4850);
    add('.solution-contact li',5300,300);
    add('.solution-reason',6150);
    add('.solution-output > h3',7100);
    M.story(system,items,{duration:10000,loop:true});
  }
  const preview = document.querySelector('.home-solution-preview');
  if (preview) M.sequence(preview,[...preview.querySelectorAll(':scope > .page-kicker, :scope > h2, :scope > p')].map((element,i)=>M.step(element,i*100)));
});
