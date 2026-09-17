const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
for(const file of ['index.html','index-fr.html'])test(`${file}: before-after order and fictional matching profiles`,()=>{
 const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
 assert.match(html,/<\/section><\/div><section id="comparison"/);
 assert.equal((html.match(/id="comparison"/g)||[]).length,1);
 const section=html.match(/<section id="comparison"[\s\S]*?<\/section>/)[0];
 const names=[...section.matchAll(/<h3>(.*?)<\/h3>/g)].map(m=>m[1]);
 assert.equal(names.length,2);assert.equal(names[0],names[1]);
 assert.match(section,/FICTIONAL EXAMPLE|EXEMPLE FICTIF/);
 assert.equal((section.match(/<li>/g)||[]).length,15);
 const positions=['id="comparison"','id="solution-preview"','id="signals"','id="prospect-example"','id="pricing"','data-customer-preview','id="faq"','id="newsletter"','<footer'].map(token=>html.indexOf(token));
 assert.ok(positions.every((n,i)=>n>=0&&(!i||n>positions[i-1])));
 assert.doesNotMatch(section,/href="(?:tel:|mailto:|https:\/\/.*linkedin)/);
});
