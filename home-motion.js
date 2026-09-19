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
    const tracks = [];
    const add = (selector, at, stagger = 35) => comparison.querySelectorAll(selector).forEach((element,i) => {
      tracks.push(M.step(element,at+i*stagger,'fade',120));
    });
    add('.comparison-side h2',0,0);
    add('.comparison-side--before li',0,30);
    add('.comparison-side--before .comparison-conclusion',180);
    comparison.querySelectorAll('.comparison-flow-lines path').forEach((element,i) => {
      const length = element.getTotalLength();
      const output = element.classList.contains('comparison-output-line');
      tracks.push({element,frames:[{strokeDasharray:`${length}`,strokeDashoffset:length},{strokeDasharray:`${length}`,strokeDashoffset:0}],options:{duration:200,delay:output?480:250+i*15}});
    });
    tracks.push(M.step(comparison.querySelector('.comparison-core'),400,'surface',200));
    tracks.push({element:comparison.querySelector('.comparison-rail'),frames:[{scale:'1 0'},{scale:'1 1'}],options:{duration:220,delay:550}});
    add('.comparison-side--after li',550,35);
    tracks.push(M.step(comparison.querySelector('.comparison-side--after .comparison-conclusion'),780,'fade',180));
    // Start at first intersection, rather than the shared 12% visibility gate.
    // Keep the shared lifecycle for reduced motion, focus and one-shot playback.
    if (!M.reduced() && 'IntersectionObserver' in window) {
      const entrance = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        entrance.disconnect();
        M.sequence(comparison,tracks,{entrance:true});
      },{threshold:0});
      entrance.observe(comparison);
    }

  }
  const product = document.querySelector('.home-product-window');
  if (product) {
    // The target is always visible; the selected result resolves into one profile.
    const q = selector => product.querySelector(selector);
    M.sequence(product,[
      M.step(q('.home-product-company'),0,'fade',250),
      {element:q('.home-product-change'),frames:[{color:'#777970'},{color:'#0a66c2'}],options:{duration:200,delay:250}},
      {element:q('.home-product-drawer'),frames:[{opacity:0,translate:'20px 0'},{opacity:1,translate:'0 0'}],options:{duration:300,delay:450}},
      M.step(q('.home-product-reason'),750,'fade',250)
    ]);
  }
  const preview = document.querySelector('.home-solution-preview');
  if (preview) M.sequence(preview,[...preview.querySelectorAll(':scope > .page-kicker, :scope > h2, :scope > p')].map((element,i)=>M.step(element,i*100)));
});
