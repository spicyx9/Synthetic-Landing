const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('home-radar.js', 'utf8');
function setup({reduced=false, support=true, lang='en', mapAdapter}={}) {
  class Element {
    constructor(dataset={}, classes=[]) { this.dataset=dataset; this.attrs={}; this.events={}; this.hidden=false; this.textContent=''; this.classes=new Set(classes); this.classList={contains:c=>this.classes.has(c),toggle:(c,on)=>on?this.classes.add(c):this.classes.delete(c)}; }
    setAttribute(name,value){this.attrs[name]=value;}
    addEventListener(name,fn){this.events[name]=fn;}
    click(){this.events.click();}
  }
  const root=new Element(), input=new Element(), status=new Element(), playback=new Element(), results=new Element();
  const pins=Array.from({length:3},(_,i)=>new Element({radarProfile:String(i)},['radar-pin']));
  const selectors=Array.from({length:3},(_,i)=>new Element({radarProfile:String(i)}));
  const cards=Array.from({length:3},(_,i)=>{const el=new Element({profileCard:String(i)});el.detail=new Element();el.querySelector=()=>el.detail;return el;});
  const steps=Array.from({length:4},(_,i)=>new Element({radarStep:String(i)}));
  root.querySelector=s=>({'#radar-query':input,'[data-radar-status]':status,'[data-radar-replay]':playback,'.radar-results':results,'.radar-stage':root}[s]);
  root.querySelectorAll=s=>({'button.radar-pin':pins,'[data-radar-step]':steps,'[data-radar-profile]':[...pins,...selectors],'[data-profile-card]':cards}[s]);
  let observe, now=0, id=0;const frames=new Map(), events={},mediaEvents={};
  const media={matches:reduced,addEventListener:(n,fn)=>mediaEvents[n]=fn};
  const document={querySelector:()=>root,documentElement:{lang},hidden:false,addEventListener:(n,fn)=>events[n]=fn};
  const window={addEventListener:(n,fn)=>events[n]=fn,createHomeRadarMap:mapAdapter?()=>mapAdapter:undefined};
  class Observer {constructor(fn){observe=fn;}observe(){}}
  if(support)window.IntersectionObserver=Observer;
  vm.runInNewContext(source,{document,window,matchMedia:()=>media,IntersectionObserver:Observer,requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)});
  function advance(ms){for(let n=0;n<ms;n+=50){now+=50;const queued=[...frames.values()];frames.clear();queued.forEach(fn=>fn(now));}}
  return {root,input,status,playback,results,pins,selectors,cards,steps,media,mediaEvents,events,document,frames,advance,visible:on=>observe([{isIntersecting:on}])};
}
test('radar types the request, frames the area, analyses pins and keeps completed profiles visible',()=>{
  const e=setup();assert.equal(e.frames.size,0);assert.equal(e.results.inert,true);
  e.visible(true);e.advance(1500);assert.ok(e.input.value.length>0&&e.input.value.length<100);
  e.advance(2100);assert.equal(e.root.dataset.phase,'scope');
  e.advance(4200);assert.equal(e.root.dataset.phase,'discover');assert.equal(e.steps[2].attrs['aria-pressed'],'true');
  e.advance(2200);assert.equal(e.root.dataset.phase,'analyze');
  e.advance(8500);assert.equal(e.root.dataset.phase,'complete');assert.equal(e.results.inert,false);assert.equal(e.frames.size,0);
  e.advance(30000);assert.equal(e.root.dataset.phase,'complete');
});
test('selecting step 03 continues automatically into the prospect cards',()=>{
  const e=setup();e.visible(true);e.steps[2].click();assert.equal(e.root.dataset.phase,'analyze');
  assert.equal(e.root.classes.has('is-paused'),false);e.advance(3700);
  assert.equal(e.root.dataset.phase,'analyze');e.advance(400);
  assert.equal(e.root.dataset.phase,'complete');
});
test('offscreen and hidden-tab states preserve progress without jumping',()=>{
  const e=setup();e.visible(true);e.advance(1800);const text=e.input.value;
  e.visible(false);e.advance(10000);assert.equal(e.input.value,text);
  e.visible(true);e.document.hidden=true;e.events.visibilitychange();e.advance(10000);assert.equal(e.input.value,text);
  e.document.hidden=false;e.events.visibilitychange();e.advance(20000);assert.equal(e.root.dataset.phase,'complete');
});
test('pin and card selection stay in sync, and replay restores the first profile',()=>{
  const e=setup();e.visible(true);e.steps[3].click();e.pins[2].click();
  assert.equal(e.cards[2].detail.hidden,false);assert.equal(e.cards[0].detail.hidden,true);assert.equal(e.selectors[2].attrs['aria-expanded'],'true');
  e.steps[0].click();assert.equal(e.root.dataset.phase,'query');assert.equal(e.results.inert,true);assert.equal(e.cards[0].detail.hidden,false);
});
test('reduced motion and missing observers present the final story immediately',()=>{
  for(const options of [{reduced:true},{support:false}]){const e=setup(options);assert.equal(e.root.dataset.phase,'complete');assert.equal(e.results.inert,false);assert.equal(e.frames.size,0);}
  const e=setup();e.visible(true);e.advance(2000);e.media.matches=true;e.mediaEvents.change();assert.equal(e.root.dataset.phase,'complete');assert.equal(e.frames.size,0);
});
test('French demo preserves translated request and completion text',()=>{
  const e=setup({lang:'fr',reduced:true});assert.equal(e.input.value,'Prévoyance · Bâtiment · Rhône');assert.equal(e.status.textContent,'3 fiches prêtes à explorer');
});

test('both languages leave the target half a second after typing finishes',()=>{
  for (const lang of ['en','fr']) {
    const e=setup({lang});e.visible(true);
    const ending=lang==='fr'?'prévoyance.':'income protection.';
    for(let n=0;n<80&&!e.input.value?.endsWith(ending);n++)e.advance(50);
    assert.ok(e.input.value.endsWith(ending));
    e.advance(450);assert.equal(e.root.dataset.phase,'query');
    e.advance(100);assert.equal(e.root.dataset.phase,'scope');
  }
});

test('the demo waits for its basemap and passes paused progress to the camera',async()=>{
  let ready;const views=[];
  const mapAdapter={ready:new Promise(resolve=>ready=resolve),render:(phase,progress)=>views.push({phase,progress}),stop:()=>{}};
  const e=setup({mapAdapter});e.visible(true);e.advance(5000);
  assert.equal(e.input.value,'');assert.equal(e.frames.size,0);
  ready();await Promise.resolve();e.advance(3600);
  assert.equal(e.root.dataset.phase,'scope');
  assert.ok(views.at(-1).progress>0&&views.at(-1).progress<1);
  const count=views.length;e.visible(false);e.advance(8000);
  assert.equal(views.length,count);
  e.visible(true);e.advance(20000);assert.equal(e.root.dataset.phase,'complete');
});
