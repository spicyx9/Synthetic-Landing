/* Six illustrative changes, played once. Selecting a signal keeps it open. */
(() => {
  'use strict';
  const root=document.querySelector('.home-signals');
  if(!root)return;
  const choices=[...root.querySelectorAll('[data-signal-choice]')];
  const panels=[...root.querySelectorAll('[data-signal-panel]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const DURATION=6200;
  let index=0,elapsed=0,previous=0,frame=0,visible=false,focused=false,manual=false;
  function select(next) {
    index=next;
    choices.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    panels.forEach((panel,i)=>{panel.hidden=i!==index;});
  }
  function tick(now) {
    frame=0;
    if(previous)elapsed+=Math.min(now-previous,100);
    previous=now;
    if(elapsed>=DURATION){elapsed=0;select(index+1);}
    if(index<panels.length-1)frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);frame=0;previous=0;
    root.classList.toggle('is-offscreen',!visible||document.hidden);
    if(visible&&!document.hidden&&!focused&&!manual&&!reduced.matches&&index<panels.length-1)frame=requestAnimationFrame(tick);
  }
  function choose(next) {
    manual=true;root.dataset.signalManual='true';select(next);sync();
  }
  choices.forEach((button,i)=>button.addEventListener('click',()=>choose(i)));
  root.querySelector('.signal-next').addEventListener('click',()=>choose((index+1)%panels.length));
  root.addEventListener('focusin',()=>{focused=true;sync();});
  root.addEventListener('focusout',event=>{focused=root.contains(event.relatedTarget);sync();});
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;previous=0;});
  window.addEventListener('pageshow',sync);
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      if(visible)root.classList.add('signals-enhanced');
      sync();
    },{threshold:.25});
    observer.observe(root.querySelector('.signals-scene'));
  }
})();
