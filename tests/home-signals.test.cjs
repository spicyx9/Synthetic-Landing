const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('js/pages/home-signals.js','utf8');
function setup(reduced=false){
  const choices=Array.from({length:6},()=>({attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this[k]=fn;}}));
  const next={addEventListener(k,fn){this[k]=fn;}};
  const panels=choices.map((_,i)=>({hidden:i!==0}));
  const events={},frames=new Map();let visible,now=0,id=0;
  const root={dataset:{},classList:{add(){},toggle(){}},contains:()=>false,querySelector:s=>s==='.signal-next'?next:{},querySelectorAll:s=>s==='[data-signal-choice]'?choices:panels,addEventListener:(k,fn)=>events[k]=fn};
  const document={hidden:false,querySelector:()=>root,addEventListener:(k,fn)=>events[k]=fn};
  class Observer{constructor(fn){visible=fn;}observe(){}}
  vm.runInNewContext(source,{document,window:{IntersectionObserver:Observer,addEventListener(){}},IntersectionObserver:Observer,matchMedia:()=>({matches:reduced,addEventListener(){}}),requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)});
  function advance(ms){for(let n=0;n<ms;n+=50){now+=50;const f=[...frames.values()];frames.clear();f.forEach(fn=>fn(now));}}
  return {root,choices,panels,next,frames,document,events,advance,visible:v=>visible([{isIntersecting:v}])};
}
test('signals play through all six examples once and retain the final reason',()=>{
  const e=setup();e.advance(10000);assert.equal(e.frames.size,0);
  e.visible(true);e.advance(6500);assert.equal(e.panels[1].hidden,false);
  e.advance(26000);assert.equal(e.panels[5].hidden,false);assert.equal(e.frames.size,0);
  assert.equal(e.choices.filter(b=>b.attrs['aria-pressed']==='true').length,1);
});
test('choosing a signal stops automatic switching and opens its matching example',()=>{
  const e=setup();e.visible(true);e.advance(1000);e.choices[3].click();
  e.advance(30000);assert.equal(e.panels[3].hidden,false);
  assert.equal(e.root.dataset.signalManual,'true');assert.equal(e.frames.size,0);
});
test('offscreen, hidden page and keyboard focus preserve the current example',()=>{
  const e=setup();e.visible(true);e.advance(2000);e.visible(false);e.advance(15000);
  e.visible(true);e.document.hidden=true;e.events.visibilitychange();e.advance(15000);
  e.document.hidden=false;e.events.visibilitychange();e.events.focusin();e.advance(15000);
  assert.equal(e.panels[0].hidden,false);
  e.events.focusout({relatedTarget:null});e.advance(4500);assert.equal(e.panels[1].hidden,false);
});
test('reduced motion keeps a static example while allowing manual exploration',()=>{
  const e=setup(true);e.visible(true);e.advance(15000);assert.equal(e.frames.size,0);
  assert.equal(e.panels[0].hidden,false);e.choices[4].click();assert.equal(e.panels[4].hidden,false);
});

test('clicking the card advances, wraps around and keeps the chosen signal open',()=>{
  const e=setup();e.visible(true);e.advance(1000);e.next.click();
  assert.equal(e.panels[1].hidden,false);
  assert.equal(e.choices[1].attrs['aria-pressed'],'true');
  e.advance(10000);assert.equal(e.panels[1].hidden,false);
  e.choices[5].click();e.next.click();
  assert.equal(e.panels[0].hidden,false);
  assert.equal(e.choices[0].attrs['aria-pressed'],'true');
  assert.equal(e.frames.size,0);
});
