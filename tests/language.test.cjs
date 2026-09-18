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
 for(const path of ['/index-fr','/pricing','/tarifs','/customers','/clients'])assert.equal(destination('FR',undefined,path),path);
 for(const rule of rules)assert.equal(rule.permanent,false);
});

test('language dropdown preserves all equivalent page routes and current-language labels',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const pairs=[['index','index-fr'],['pricing','tarifs'],['our-solution','notre-solution'],['about','a-propos'],['careers','recrutement'],['media','medias'],['contact','contact-fr'],['faq','faq-fr'],['customers','clients']];
 for(const pair of pairs)for(const [index,name] of pair.entries()){
  const html=fs.readFileSync(path.join(__dirname,'..',name+'.html'),'utf8');
  const header=html.match(/<header[\s\S]*?<\/header>/)[0];
  assert.doesNotMatch(header,/lang-toggle-sep/);
  assert.match(header,new RegExp('>'+ (index?'FR':'EN')+' <svg class="dropdown-chevron"'));
  for(const [i,target] of pair.entries())assert.ok(header.includes(`href="${target==='index'?'/':'/'+target}" data-lang="${i?'fr':'en'}"`));
 }
});
