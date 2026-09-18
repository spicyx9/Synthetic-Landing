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
for (const pair of pairs) for (const [i, route] of pair.entries()) test(`legal production contract: /${route}`,()=>{
 const html=read(route+'.html'),lang=i===0?'fr':'en',base='https://www.syntheticswarm.ai';
 assert.equal((html.match(/<title>/g)||[]).length,1);
 assert.match(html,/<meta name="description" content="[^"]{20,}"/);
 assert.ok(html.includes(`rel="canonical" href="${base}/${route}"`));
 for(const [j,other] of pair.entries()) assert.ok(html.includes(`hreflang="${j===0?'fr':'en'}" href="${base}/${other}"`));
 const main=html.match(/<main[\s\S]*?<\/main>/)[0];
 assert.equal((main.match(/<h1>/g)||[]).length,1);
 assert.doesNotMatch(main,/<form|<input|<fieldset|aria-disabled|<table/i);
 const count=pair[0]==='conditions'?21:pair[0]==='confidentialite'?6:0;
 assert.equal((main.match(/<h2>/g)||[]).length,count);
 for(const href of [...html.matchAll(/href="(\/[^"]*)"/g)].map(x=>x[1])) {
  const target=href.split(/[?#]/)[0];
  assert.ok(fs.existsSync(path.join(__dirname,'..',target==='/'?'index.html':target.slice(1)))||fs.existsSync(path.join(__dirname,'..',target.slice(1)+'.html')),`${route}: ${target}`);
 }
 const footer=html.match(/<footer[\s\S]*?<\/footer>/)[0];
 const home=read(lang==='fr'?'index-fr.html':'index.html');
 assert.equal(footer,home.match(/<footer[\s\S]*?<\/footer>/)[0]);
 const header=h=>h.match(/<header[\s\S]*?<\/header>/)[0].replace(/<div class="language-panel"[\s\S]*?<\/div>/,'');
 assert.equal(header(html),header(home));
 assert.equal((footer.match(/©/g)||[]).length,1);
 assert.ok(footer.includes(lang==='fr'?'© 2026 Synthetic Swarm. Tous droits réservés.':'© 2026 Synthetic Swarm. All rights reserved.'));
 for(const match of main.matchAll(/href="(mailto:[^"]*)"/g)) {
  const url=new URL(match[1].replaceAll('&amp;','&'));
  assert.equal(url.pathname,'contact@syntheticswarm.ai');
  assert.ok(!/%[0-9a-f]{2}/i.test(url.searchParams.get('body')||''),'no double encoding');
 }
});
