const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const pages=['notre-solution.html','our-solution.html'];
const order=['data-demo-hero','id="targeting"','id="moments"','id="qualification"','id="prospect"','data-demo-end'];
for (const file of pages) test(`${file}: continuous product story and approved headline`,()=>{
 const html=fs.readFileSync(file,'utf8');
 let last=-1;
 for(const marker of order){const at=html.indexOf(marker);assert.ok(at>last,marker);last=at;}
 assert.equal((html.match(/class="story-chapter /g)||[]).length,4);
 assert.equal((html.match(/class="story-stack"/g)||[]).length,1);
 assert.match(html,/<div class="story-stack">\s*<section class="story-chapter story-target"/);
 assert.ok(html.indexOf('class="story-stack"') < html.indexOf('id="targeting"'));
 assert.doesNotMatch(html,/class="eng-node |class="sp-change|id="verification"|target-configurator/);
 const targeting=html.match(/<section[^>]+id="targeting"[\s\S]*?<\/section>/)[0];
 assert.doesNotMatch(targeting,/<select|<input|<textarea|<button/);
 assert.equal((targeting.match(/<dt>/g)||[]).length,5);
 assert.match(targeting,/class="story-target-ready"/);
 assert.doesNotMatch(targeting,/story-base|story-active|>95<|VOS BASES|YOUR BASES/);
 assert.match(targeting,/class="story-target-text"/);
 const changes=html.match(/<section[^>]+id="moments"[\s\S]*?<\/section>/)[0];
 assert.equal((changes.match(/class="story-signal(?: is-selected)?"/g)||[]).length,6);
 assert.equal((changes.match(/is-selected/g)||[]).length,1);
 assert.equal((changes.match(/<time datetime=/g)||[]).length,6);
 assert.equal((changes.match(/class="story-row-category"/g)||[]).length,6);
 assert.doesNotMatch(changes,/95|Mandataires|Insurance agents|story-sources/);
 assert.match(changes,/Atelier R\./);
 assert.match(changes,/Île-de-France · 2–20/);
 assert.doesNotMatch(html,/Six official sources|Six sources officielles|Cinq familles|Five kinds|Aucun fichier acheté|No purchased lists|REDACTED|confirmed need/i);
 const profile=html.match(/<article class="story-surface story-profile">([\s\S]*?)<\/article>/)[1];
 assert.doesNotMatch(profile,/REDACTED|REDACTED|sp-profile-source|sp-company-details/);
 assert.equal((profile.match(/<li>/g)||[]).length,7);
 assert.match(profile,/Camille Exemple/);
 assert.match(html,/class="floating-demo demo-booking"[^>]+inert/);
 assert.match(html,/<a class="floating-demo-button"[^>]*href="https:\/\/calendar.app.google\/91k1Mpontca7NGea6"/);
 const h1=html.match(/<h1>(.*?)<\/h1>/s)[1].replace(/<[^>]*>/g,'');
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
