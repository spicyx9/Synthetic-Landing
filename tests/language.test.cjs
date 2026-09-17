const {test}=require('node:test');
const assert=require('node:assert/strict');
const config=require('../vercel.json');
const rules=config.redirects.filter(r=>r.source==='/');
function destination(country,language,path='/') {
 const value=c=>c.type==='header'?country:language;
 const matches=c=>value(c)!==undefined&&value(c)===c.value;
 return rules.find(r=>r.source===path&&(r.has||[]).every(matches)&&(r.missing||[]).every(c=>!matches(c)))?.destination||path;
}
test('French IP defaults to French; all other and unknown countries default to English',()=>{
 assert.equal(destination('FR'),'/index-fr');
 for(const country of ['US','GB','CA','BE','CH','DE',undefined])assert.equal(destination(country),'/');
});
test('explicit language preference wins without redirect loops or disturbing deep links',()=>{
 assert.equal(destination('FR','en'),'/');assert.equal(destination('US','fr'),'/index-fr');
 for(const path of ['/index-fr','/pricing','/pricing-fr','/customers','/clients'])assert.equal(destination('FR',undefined,path),path);
 for(const rule of rules)assert.equal(rule.permanent,false);
});
