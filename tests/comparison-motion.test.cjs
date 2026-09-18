const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../home-motion.js'),'utf8');
function setup(reduced=false) {
 const paths=[false,false,false,false,true].map(output=>({getTotalLength:()=>120,classList:{contains:()=>output}}));
 const root={querySelector:()=>({}),querySelectorAll:s=>s.includes('path')?paths:Array.from({length:s.endsWith('li')?4:1},()=>({}))};
 const calls=[];let observer;
 class Observer { constructor(callback,options){this.callback=callback;this.options=options;observer=this;} observe(target){this.target=target;} disconnect(){this.disconnected=true;} }
 const M={ready:cb=>cb(M),reduced:()=>reduced,step:(element,delay,effect,duration)=>({element,options:{delay,duration}}),sequence:(...args)=>calls.push(args)};
 vm.runInNewContext(source,{window:{SwarmMotion:M,IntersectionObserver:Observer},IntersectionObserver:Observer,document:{querySelector:s=>s==='.home-comparison'?root:null}});
 return {calls,get observer(){return observer;},root};
}
test('comparison starts at first intersection and finishes within one second',()=>{
 const h=setup();assert.equal(h.calls.length,0);assert.equal(h.observer.options.threshold,0);
 h.observer.callback([{isIntersecting:false}]);assert.equal(h.calls.length,0);
 h.observer.callback([{isIntersecting:true}]);assert.equal(h.calls.length,1);assert.equal(h.observer.disconnected,true);
 const [root,tracks,options]=h.calls[0];assert.equal(root,h.root);assert.equal(options.entrance,true);
 assert.equal(Math.max(...tracks.map(t=>(t.options.delay||0)+t.options.duration)),980);
 assert.ok(tracks.every(t=>!t.options.iterations || t.options.iterations===1));
});
test('comparison stays visible without scheduling motion when reduced motion is requested',()=>{
 const h=setup(true);assert.equal(h.observer,undefined);assert.equal(h.calls.length,0);
});

test('product preview reveals the complete deliverable promptly without a story loop',()=>{
 const system={querySelector:()=>({}),querySelectorAll:selector=>Array.from({length:selector==='.solution-target li'?6:selector==='.solution-inputs li'?4:selector.includes(',')?3:selector.endsWith('li')?3:1},()=>({}))};
 const sequences=[];
 const M={ready:cb=>cb(M),step:(element,delay,effect,duration)=>({element,options:{delay,duration}}),sequence:(...args)=>sequences.push(args),story:()=>assert.fail('Product preview must not hide and replay the deliverable in a loop')};
 vm.runInNewContext(source,{window:{SwarmMotion:M},document:{querySelector:s=>s==='.solution-system'?system:null}});
 assert.equal(sequences.length,1);
 const tracks=sequences[0][1];
 assert.ok(Math.max(...tracks.map(t=>t.options.delay+t.options.duration))<=1200);
 assert.equal(tracks[0].options.delay,0);
});
