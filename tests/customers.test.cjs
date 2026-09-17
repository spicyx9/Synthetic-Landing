const { test } = require('node:test');
const assert = require('node:assert/strict');
const { render, safeUrl } = require('../customers.js');
const data = require('../assets/data/customers.json');
// Synthetic fixtures exercise components only; no fixtures are included in public data.
const record = changes => ({name:'Test Person',role:'Test role',company:'Test company',verified:true,testimonialFr:'Citation de test.',testimonialEn:'Test quote.',...changes});
test('production remains empty with disabled statistics and hidden preview', () => {
  assert.deepEqual(data.customers, []);
  for (const lang of ['fr','en']) { assert.equal(render(data,lang), ''); assert.equal(render(data,lang,true), ''); }
});
test('one customer uses initials without a photo or LinkedIn link', () => {
  const html=render({customers:[record()]},'fr');
  assert.match(html,/Citation de test\./);assert.match(html,/>TP<\/span>/);assert.doesNotMatch(html,/<a |<img/);
  assert.equal(render({customers:[record()]},'fr',true),'');
});
test('only verified localized testimonials can enable the three-card preview', () => {
  const customers=[record(),record({name:'Second Test'}),record({name:'Third Test',testimonialFr:''})];
  assert.equal(render({customers},'fr',true),'');
  assert.equal((render({customers},'en',true).match(/<blockquote>/g)||[]).length,3);
  assert.equal(render({customers:[record({verified:false})]},'en'),'');
  assert.equal(render({customers:[record({kind:'identity'})]},'en',true),'');
});
test('content is escaped and URLs reject script and counterfeit LinkedIn destinations', () => {
  const html=render({customers:[record({testimonialFr:'<script>alert("x")</script>',linkedinUrl:'javascript:alert(1)',photo:'javascript:alert(1)'})]},'fr');
  assert.doesNotMatch(html,/<script>|<a |<img/);assert.match(html,/&lt;script&gt;/);
  for(const url of ['https://linkedin.com.evil.invalid/in/person','https://example.invalid/in/person','http://linkedin.com/in/person']) assert.equal(safeUrl(url,true),'');
  assert.equal(safeUrl('https://www.linkedin.com/in/test-only',true),'https://www.linkedin.com/in/test-only');
});
test('provided profile link and image render safely with lazy loading', () => {
  const html=render({customers:[record({photo:'/assets/customers/test-only.jpg',linkedinUrl:'https://www.linkedin.com/in/test-only'})]},'en');
  assert.match(html,/target="_blank" rel="noopener noreferrer"/);assert.match(html,/loading="lazy"/);assert.match(html,/alt="Test Person"/);
});
test('statistics need enabled boolean and a nonempty value; optional fields stay optional', () => {
  assert.equal(render({statistics:[{value:'',labelEn:'Test label',enabled:true},{value:'123',labelEn:'Test label',enabled:false}]},'en'),'');
  assert.match(render({statistics:[{value:'123',labelEn:'Test label',enabled:true}]},'en'),/customer-stat/);
  assert.match(render({statistics:[{value:0,labelEn:'Test label',enabled:true}]},'en'),/>0<\/p>/);
  const html=render({customers:[record({kind:'identity',date:'2026-02-31',metric:null})]},'en');
  assert.match(html,/customer-card--identity/);assert.doesNotMatch(html,/<time|customer-result|<blockquote/);
});
test('long text is retained without truncation and preserves order', () => {
  const quote='Long test text. '.repeat(400);
  const html=render({customers:[record({testimonialEn:quote}),record({name:'Second Test'})]},'en');
  assert.ok(html.includes(quote.trim()));assert.ok(html.indexOf('Test Person')<html.indexOf('Second Test'));
});
