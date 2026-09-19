const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('progress accumulates, reverses, exits and disables on narrow screens independently of motion', () => {
  let scroll = 0;
  let headerBottom = 61;
  const events = {};
  const media = {matches:true, addEventListener(_, fn) { this.change = fn; }};
  const classes = () => ({toggle(name, value) { this[name] = value; }});
  const style = () => ({setProperty(name, value) { this[name] = value; }});
  const rows = Array.from({length:4}, () => ({hidden:false, classList:classes()}));
  const chapters = [600,1300,2000,2700].map((top,index) => ({classList:classes(), getBoundingClientRect:() => ({top:top-scroll}), querySelector:() => ({getBoundingClientRect:() => ({top:top+(index+1)*52+24-scroll})})}));
  const progress = {style:style(), querySelectorAll:() => rows};
  const story = {
    classList:classes(), style:style(),
    querySelector:() => progress,
    querySelectorAll:selector => selector === '.story-chapter' ? chapters : rows,
    getBoundingClientRect:() => ({bottom:3500-scroll})
  };
  const source = fs.readFileSync('solution-page.js','utf8').split('// One visual progression stack;')[1];
  vm.runInNewContext(source.slice(source.indexOf('(() =>')), {
    document:{querySelector:selector => selector === '.product-story' ? story : {getBoundingClientRect:() => ({height:61, bottom:headerBottom})}},
    innerHeight:900,
    matchMedia:query => { assert.equal(query,'(min-width:701px) and (min-height:600px)'); return media; },
    getComputedStyle:() => ({getPropertyValue:() => '52px'}),
    addEventListener:(event,fn) => { events[event] = fn; },
    requestAnimationFrame:fn => fn(),
    ResizeObserver:class { observe() {} }
  });
  for (const [y,count] of [[600,1],[1300,2],[2100,3],[2700,4],[1300,2],[400,0]]) {
    scroll=y; events.scroll(); assert.equal(rows.filter(row=>!row.hidden).length,count);
    assert.equal(rows.filter(row=>row.classList['is-active']).length,count ? 1 : 0);
    chapters.forEach((chapter,index) => assert.equal(chapter.classList['is-progress-visible'],index < count));
  }
  // Preview only within 140px of the active stack bottom, in both directions.
  for (const [index,y] of [[1,1047],[2,1695],[3,2343]]) {
    scroll=y; events.scroll();
    assert.equal(rows[index].hidden,false);
    assert.equal(chapters[index].classList['is-progress-visible'],false);
    assert.equal(rows[index].classList['is-upcoming'],true);
    assert.equal(rows[index].classList['is-active'],false);
    scroll=y+139; events.scroll();
    assert.equal(rows[index].classList['is-upcoming'],true);
    assert.equal(chapters[index].classList['is-progress-visible'],false);
    scroll=y+140; events.scroll();
    assert.equal(rows[index].classList['is-active'],true);
    assert.equal(chapters[index].classList['is-progress-visible'],true);
    assert.equal(rows[index].classList['is-upcoming'],false);
    scroll=y+139; events.scroll();
    assert.equal(rows[index].classList['is-upcoming'],true);
    assert.equal(chapters[index].classList['is-progress-visible'],false);
    scroll=y-1; events.scroll();
    assert.equal(rows[index].hidden,true);
    assert.equal(chapters[index].classList['is-progress-visible'],false);
    assert.equal(rows[index].classList['is-upcoming'],false);
  }
  scroll=3400; events.scroll(); assert.equal(progress.style['--progress-exit'],'-169px');
  headerBottom=85.4; events.resize();
  assert.equal(story.style['--progress-top'],'85px');
  headerBottom=61; events.resize();
  media.matches=false; media.change(); assert.equal(story.classList['story-progress-enabled'],false);
  assert.equal(story.style['--progress-top'],'61px');
  assert.ok(chapters.every(chapter => !chapter.classList['is-progress-visible']));
});
