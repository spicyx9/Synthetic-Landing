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
  // Every pixel around each handoff, in both directions: exactly one copy.
  for (const [index,top] of [[0,600],[1,1300],[2,2000],[3,2700]]) {
    const handoff = top - headerBottom - index * 52;
    const positions = Array.from({length:301}, (_,i) => handoff - 150 + i);
    for (const y of [...positions, ...positions.reverse()]) {
      scroll=y; events.scroll();
      assert.equal(rows[index].hidden, y < handoff);
      assert.equal(chapters[index].classList['is-progress-visible'], y >= handoff);
      chapters.forEach((chapter,i) => {
        const localVisible = !chapter.classList['is-progress-visible'];
        const stickyVisible = !rows[i].hidden;
        assert.notEqual(localVisible, stickyVisible, `chapter ${i}, scroll ${y}`);
      });
    }
  }
  scroll=3400; events.scroll(); assert.equal(progress.style['--progress-exit'],'-169px');
  headerBottom=85.4; events.resize();
  assert.equal(story.style['--progress-top'],'85px');
  headerBottom=61; events.resize();
  media.matches=false; media.change(); assert.equal(story.classList['story-progress-enabled'],false);
  assert.equal(story.style['--progress-top'],'61px');
  assert.ok(chapters.every(chapter => !chapter.classList['is-progress-visible']));
});
