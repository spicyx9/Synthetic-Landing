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
  assert.doesNotMatch(html,/\[\[A COMPLETER|temporarily unavailable|temporairement indisponible/);
 });
});
test('legal navigation is present across all public footers',()=>{
 for(const file of fs.readdirSync(path.join(__dirname,'..')).filter(x=>x.endsWith('.html'))){
  const html=read(file),footer=html.match(/<footer[\s\S]*?<\/footer>/)[0],fr=html.includes('<html lang="fr">');
  for(const pair of pairs) assert.ok(footer.includes(`href="/${pair[fr?0:1]}"`),file);
  assert.match(footer,/aria-disabled="true">(?:Nos clients|Customers)<\/span>/);
 }
});
test('opt-out uses a prefilled email without collecting data in a form',()=>{
 for(const file of ['opposition.html','opt-out.html']){
  const html=read(file),main=html.match(/<main[\s\S]*?<\/main>/)[0];
  assert.doesNotMatch(main,/<form|<input|<fieldset|disabled/);
  const href=main.match(/class="page-button" href="([^"]+)"/)[1].replaceAll('&amp;','&');
  const url=new URL(href);
  assert.equal(url.pathname,'contact@syntheticswarm.ai');
  assert.equal(url.searchParams.get('subject'),file==='opposition.html'?"Demande d'opposition - Synthetic Swarm":'Opt-out request - Synthetic Swarm');
  const body=url.searchParams.get('body');
  assert.match(body,file==='opposition.html'?/Nom : \nPrénom : \nEntreprise : \nEmail ou téléphone à retirer : /:/First name:\nLast name:\nCompany:\nEmail or phone number to remove:/);
 }
});
