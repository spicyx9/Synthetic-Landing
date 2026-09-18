const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const pages=['notre-solution.html','our-solution.html'];
const order=['data-demo-hero','targeting-title','engine-title','changes-title','qualification-title','verification-title','delivery-title','data-demo-end'];
for (const file of pages) test(`${file}: detailed Solution contract and approved headline`,()=>{
 const html=fs.readFileSync(file,'utf8');
 let last=-1;
 for(const marker of order){const at=html.indexOf(marker);assert.ok(at>last,marker);last=at;}
 assert.equal((html.match(/class="eng-node /g)||[]).length,30);
 assert.equal((html.match(/class="sp-targeting|class="sp-surface sp-targeting/g)||[]).length,1);
 assert.equal((html.match(/data-combination="/g)||[]).length,3);
 assert.equal((html.match(/class="sp-check-mark"/g)||[]).length,4);
 for(const id of ['target-0','target-1','target-2','target-3','target-decision','target-volume']) assert.ok(html.includes(`for="${id}"`));
 for(const name of ['REDACTED','REDACTED','REDACTED','REDACTED','REDACTED','REDACTED']) assert.ok(html.includes(name));
 assert.doesNotMatch(html,/Six official sources|Six sources officielles|Cinq familles|Five kinds|Aucun fichier acheté|No purchased lists|REDACTED|confirmed need/i);
 const profile=html.split('<article class="sp-profile">')[1].split('</article>')[0];
 assert.doesNotMatch(profile,/REDACTED|REDACTED|sp-profile-source|sp-company-details/);
 assert.ok(html.includes('sp-target-ready'));assert.ok(html.includes('sp-verification-ready'));
 assert.match(html,/class="floating-demo demo-booking"[^>]+inert/);
 assert.match(html,/aria-controls="floating-demo-options"/);
 const h1=html.match(/<h1>(.*?)<\/h1>/s)[1];
 assert.equal(h1,file.startsWith('notre')?'D’un changement de situation à votre prochain appel.':'From a business change to your next conversation.');
 assert.ok(html.includes(file.startsWith('notre')?'href="/tarifs"':'href="/pricing"'));
});
test('every public HTML page loads one shared motion runtime with visible default reveals',()=>{
 for(const file of fs.readdirSync('.').filter(file=>file.endsWith('.html'))){
  const html=fs.readFileSync(file,'utf8');
  assert.equal((html.match(/src="\/motion.js\?/g)||[]).length,1,file);
  assert.equal((html.match(/src="\/page-motion.js\?/g)||[]).length,1,file);
 }
 const menu=fs.readFileSync('mobile-menu.js','utf8');assert.doesNotMatch(menu,/IntersectionObserver/);
 const css=fs.readFileSync('motion.css','utf8');assert.match(css,/\.reveal, \.reveal.visible \{ opacity: 1/);
});
