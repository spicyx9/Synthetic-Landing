window.SwarmMotion?.ready(M => {
  function group(selector, children, delay=0, stagger=100) {
    document.querySelectorAll(selector).forEach(root => M.sequence(root,[...root.querySelectorAll(children)].map((element,i)=>M.step(element,delay+i*stagger))));
  }
  const about = document.querySelector('.about-page');
  if (about) {
    const hero = about.querySelector('.page-intro');
    M.sequence(hero,[...hero.children].map((element,i)=>M.step(element,100+i*130,element.tagName==='H1'?'line':'rise')),{entrance:true});
    group('.about-founders','.founder-card',0,120);
    group('.about-launch','h2,.about-milestones li,.about-launch-proof',0,120);
    group('.about-sf','.about-sf-editorial > *, .about-sf-gallery',0,110);
  }
  const careers = document.querySelector('.careers-page');
  if (careers) {
    const hero = careers.querySelector('.careers-hero');
    M.sequence(hero,[...hero.querySelectorAll('.page-kicker,h1,p')].map((element,i)=>M.step(element,100+i*120,element.tagName==='H1'?'line':'rise')).concat([M.step(hero.lastElementChild,520,'surface')]),{entrance:true});
    group('.careers-reasons','article',0,120);
    group('.jobs-panels','.job-item',0,90);
    group('.careers-spontaneous','h2,p,.page-button',0,120);
  }
});
