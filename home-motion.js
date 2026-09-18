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
    add('.comparison-side--before li',200,160);
    add('.comparison-side--before .comparison-conclusion',800);
    comparison.querySelectorAll('.comparison-flow-lines path').forEach((element,i) => {
      const length = element.getTotalLength();
      const output = element.classList.contains('comparison-output-line');
      const start = output ? .53 : .27+i*.025;
      items.push({element,frames:[{strokeDasharray:`${length}`,strokeDashoffset:length,offset:0},{strokeDasharray:`${length}`,strokeDashoffset:length,offset:start},{strokeDasharray:`${length}`,strokeDashoffset:0,offset:start+.16},{strokeDasharray:`${length}`,strokeDashoffset:0,offset:1}]});
    });
    add('.comparison-core',1500);
    items.push({element:comparison.querySelector('.comparison-sparkle'),frames:[{opacity:0,scale:'.98',offset:0},{opacity:0,scale:'.98',offset:.48},{opacity:.58,scale:'1.02',offset:.58},{opacity:.45,scale:'1',offset:.7},{opacity:.45,scale:'1',offset:1}]});
    add('.comparison-side--after h2',2350);
    add('.comparison-side--after li',2550,170);
    add('.comparison-side--after .comparison-conclusion',3300);
    M.story(comparison,items,{duration:4000});
  }
  const system = document.querySelector('.solution-system');
  if (system) {
    const items = [];
    const add = (selector,at,stagger=150) => system.querySelectorAll(selector).forEach((element,i) => items.push({element,at:at+i*stagger}));
    add('.solution-target h3',0);
    add('.solution-target li',160,160);
    system.querySelectorAll('.solution-inputs li').forEach((element,i)=>items.push({element,at:850+i*180,move:innerWidth<701?'0 8px':`${i%2 ? -12:12}px ${i<2?8:-8}px`}));
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
    const toggle = document.querySelector('[data-home-motion]');
    if (toggle && !M.reduced()) {
      toggle.hidden = false;
      toggle.addEventListener('click',()=> {
        const paused = system.classList.toggle('is-paused');
        toggle.setAttribute('aria-pressed',String(paused));
        toggle.textContent = document.documentElement.lang === 'fr' ? (paused?'Reprendre l’animation':'Mettre en pause') : (paused?'Resume animation':'Pause animation');
        M.refresh();
      });
    }
  }
  const preview = document.querySelector('.home-solution-preview');
  if (preview) M.sequence(preview,[...preview.querySelectorAll(':scope > .page-kicker, :scope > h2, :scope > p')].map((element,i)=>M.step(element,i*100)));
});
