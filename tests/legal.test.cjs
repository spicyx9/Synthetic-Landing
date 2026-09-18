const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const pairs=[['mentions-legales','legal-notice'],['confidentialite','privacy'],['conditions','terms'],['opposition','opt-out']];
for(const pair of pairs) test(`legal translations and missing information: ${pair[0]}`,()=>{
 const pages=pair.map(x=>read(x+'.html'));
 pages.forEach((html,i)=>{
  assert.doesNotMatch(html,/[–—]|HISTIA|Stolos|histia\.net/);
  assert.match(html,new RegExp(`lang="${i===0?'fr':'en'}"`));
  assert.ok(html.includes(`href="/${pair[1-i]}" data-lang`));
  if(pair[0]!=='confidentialite') assert.match(html,/septembre 2026|September 2026/);
 });
 const markers=html=>[...new Set(html.match(/\[\[A COMPLETER[^\]]*\]\]/g))].sort();
 assert.deepEqual(markers(pages[0]),markers(pages[1]));
 if(pair[0]==='confidentialite') {
  pages.forEach(html=>{
   assert.equal(markers(html).length,0);
   const main=html.match(/<main[\s\S]*?<\/main>/)[0];
   assert.equal((main.match(/href="mailto:contact@syntheticswarm.ai"/g)||[]).length,2);
   assert.doesNotMatch(main,/page-button|Article 14|CNIL/);
  });
 } else assert.ok(markers(pages[0]).length);
});
test('legal navigation is present across all public footers',()=>{
 for(const file of fs.readdirSync(path.join(__dirname,'..')).filter(x=>x.endsWith('.html'))){
  const html=read(file),footer=html.match(/<footer[\s\S]*?<\/footer>/)[0],fr=html.includes('<html lang="fr">');
  for(const pair of pairs) assert.ok(footer.includes(`href="/${pair[fr?0:1]}"`),file);
  assert.match(footer,/aria-disabled="true">(?:Nos clients|Customers)<\/span>/);
 }
});
test('unconfigured opt-out cannot transmit personal information',()=>{
 for(const file of ['opposition.html','opt-out.html']){
  const html=read(file);
  assert.match(html,/<fieldset[^>]*disabled/);
  assert.match(html,/<button[^>]*disabled/);
  assert.doesNotMatch(html,/<form[^>]*action="https?:/);
 }
});
