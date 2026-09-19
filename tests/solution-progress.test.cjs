const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('progress accumulates, reverses, exits and disables on narrow screens independently of motion', () => {
  let scroll = 0;
  const events = {};
  const media = {matches:true, addEventListener(_, fn) { this.change = fn; }};
  const classes = () => ({toggle(name, value) { this[name] = value; }});
  const style = () => ({setProperty(name, value) { this[name] = value; }});
  const rows = Array.from({length:4}, () => ({hidden:false, classList:classes()}));
  const chapters = [600,1300,2000,2700].map(top => ({getBoundingClientRect:() => ({top:top-scroll})}));
  const progress = {style:style(), querySelectorAll:() => rows};
  const story = {
    classList:classes(), style:style(),
    querySelector:() => progress,
    querySelectorAll:selector => selector === '.story-chapter' ? chapters : rows,
    getBoundingClientRect:() => ({bottom:3500-scroll})
  };
  const source = fs.readFileSync('solution-page.js','utf8').split('// One visual progression stack;')[1];
  vm.runInNewContext(source.slice(source.indexOf('(() =>')), {
    document:{querySelector:selector => selector === '.product-story' ? story : {getBoundingClientRect:() => ({height:61})}},
    matchMedia:query => { assert.equal(query,'(min-width:701px) and (min-height:600px)'); return media; },
    getComputedStyle:() => ({getPropertyValue:() => '52px'}),
    addEventListener:(event,fn) => { events[event] = fn; },
    requestAnimationFrame:fn => fn(),
    ResizeObserver:class { observe() {} }
  });
  for (const [y,count] of [[600,1],[1300,2],[2000,3],[2700,4],[1300,2],[600,1]]) {
    scroll=y; events.scroll(); assert.equal(rows.filter(row=>!row.hidden).length,count);
    assert.equal(rows.filter(row=>row.classList['is-active']).length,1);
  }
  scroll=3400; events.scroll(); assert.equal(progress.style['--progress-exit'],'-185px');
  media.matches=false; media.change(); assert.equal(story.classList['story-progress-enabled'],false);
  assert.equal(story.style['--progress-top'],'77px');
});
