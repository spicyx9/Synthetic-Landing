const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('js/motion.js', 'utf8');
function setup({reduced=false, support=true}={}) {
  const events={}, mediaEvents={}, observers=[];
  const media={matches:reduced,addEventListener:(name,cb)=>mediaEvents[name]=cb};
  class Element {
    constructor(){this.dataset={};this.animations=[];this.classList={add(){}};this.paused=false;}
    closest(){return this.paused?this:null;}
    contains(target){return target===this;}
    animate(frames,options){
      if(this.fail) throw Error('Animation unavailable');
      let resolve,reject;
      const animation={frames,options,finished:new Promise((a,b)=>{resolve=a;reject=b}),play(){this.state='running';},pause(){this.state='paused';},cancel(){this.state='idle';reject(Error('Cancelled'));},complete(){resolve();}};
      this.animations.push(animation);return animation;
    }
  }
  class Observer {
    constructor(callback){this.callback=callback;this.targets=new Set();observers.push(this);}
    observe(root){this.targets.add(root);}
    unobserve(root){this.targets.delete(root);}
    emit(root,visible){this.callback([{target:root,isIntersecting:visible,intersectionRatio:visible?.5:0}]);}
  }
  const document={documentElement:{},readyState:'complete',hidden:false,addEventListener:(name,cb)=>events[name]=cb,querySelectorAll:()=>[]};
  const window={addEventListener:(name,cb)=>events[name]=cb};
  if(support) window.IntersectionObserver=Observer;
  vm.runInNewContext(source,{window,document,Element,IntersectionObserver:Observer,matchMedia:()=>media,getComputedStyle:()=>({getPropertyValue:()=>''}),innerWidth:1440});
  return {M:window.SwarmMotion,Element,observer:observers[0],observers,events,document,media,mediaEvents};
}
test('one observer stages content once and releases completed animations',async()=>{
  const {M,Element,observer,observers}=setup();const root=new Element();
  M.sequence(root,[M.step(root)]);assert.equal(root.animations[0].state,'paused');
  observer.emit(root,true);assert.equal(root.animations[0].state,'running');
  root.animations[0].complete();await new Promise(setImmediate);
  assert.equal(root.dataset.motionState,'complete');assert.equal(observer.targets.size,0);
  M.sequence(root,[M.step(root)]);assert.equal(root.animations.length,1);assert.equal(observers.length,1);
});
test('product loops pause offscreen, in hidden tabs and on explicit pause',()=>{
  const {M,Element,observer,document,events}=setup();const root=new Element();
  M.story(root,[{element:root}],{loop:true});observer.emit(root,true);
  assert.equal(root.animations[0].state,'running');observer.emit(root,false);assert.equal(root.animations[0].state,'paused');
  observer.emit(root,true);document.hidden=true;events.visibilitychange();assert.equal(root.animations[0].state,'paused');
  document.hidden=false;events.visibilitychange();assert.equal(root.animations[0].state,'running');
  root.paused=true;M.refresh();assert.equal(root.animations[0].state,'paused');
});
test('hidden tabs pause an entrance that already started',()=>{
  const {M,Element,document,events}=setup();const root=new Element();
  M.sequence(root,[M.step(root)],{entrance:true});document.hidden=true;events.visibilitychange();
  assert.equal(root.animations[0].state,'paused');
});
test('reduced motion and unsupported browsers never conceal content',()=>{
  for(const options of [{reduced:true},{support:false}]){
    const {M,Element}=setup(options);const root=new Element();
    M.sequence(root,[M.step(root)]);M.story(root,[{element:root}],{loop:true});assert.equal(root.animations.length,0);
  }
});
test('enabling reduced motion or focusing content immediately exposes final state',()=>{
  for(const reason of ['reduced','focus']){
    const {M,Element,media,mediaEvents,events}=setup();const root=new Element();
    M.sequence(root,[M.step(root)]);
    if(reason==='reduced'){media.matches=true;mediaEvents.change();}else events.focusin({target:root});
    assert.equal(root.animations[0].state,'idle');assert.equal(root.dataset.motionState,'complete');
  }
});
test('partial animation failures release temporary hidden states',()=>{
  const {M,Element}=setup();const root=new Element(),broken=new Element();broken.fail=true;
  M.sequence(root,[M.step(root),M.step(broken)]);assert.equal(root.animations[0].state,'idle');assert.equal(root.dataset.motionState,'complete');
});
test('story timelines keep monotonic offsets and finish before the hold',()=>{
  const {M,Element}=setup();const root=new Element(),node=new Element();
  M.story(root,[{element:node,at:1400,move:'18px 0',filter:true}],{duration:11000,loop:true});
  const frames=node.animations[0].frames;
  assert.ok(frames.every((frame,i)=>!i||frame.offset>=frames[i-1].offset));assert.equal(frames.at(-1).offset,1);
  assert.equal(frames.at(-1).opacity,0);assert.equal(frames.at(-2).offset,.96);
});
test('story milestones keep wall-clock timing instead of easing the whole cycle',()=>{
  const {M,Element}=setup();const root=new Element(),profile=new Element();
  M.story(root,[{element:profile,at:5400}],{duration:10000,loop:true});
  const {frames,options}=profile.animations[0];
  assert.equal(options.easing,'linear');
  assert.equal(frames[1].offset*options.duration,5400);
  assert.equal(frames[1].opacity,0);
  assert.ok(frames.every(frame=>frame.easing));
});
