const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const handler=require('../api/newsletter.js');
async function call(body,method='POST',headers={}) {
 const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(data){this.data=data;return this;}};
 await handler({method,headers:{'content-type':'application/json',...headers},body},res);return res;
}
test('newsletter rejects malformed input, caps size and short-circuits bots',async()=>{
 assert.equal((await call({},'GET')).code,405);
 for(const body of [null,[],{},'{', {email:'bad'}, {email:'a@b'}, {email:15}, {email:'a'.repeat(321)}, {email:'a@example.com',lang:'xx'}]) assert.equal((await call(body)).code,400);
 assert.equal((await call(' '.repeat(2049))).code,413);
 assert.equal((await call({email:'a@example.com'},'POST',{'content-length':'9999'})).code,413);
 assert.equal((await call({},'POST',{'content-type':'text/plain'})).code,415);
 assert.deepEqual((await call({company_website:'bot'})).data,{ok:true});
});
test('newsletter creates normalized Resend contacts, handles existing contacts and never hides provider failure',async()=>{
 const oldKey=process.env.RESEND_API_KEY,oldFetch=global.fetch;
 const good={email:'  TEST@Example.com ',lang:'fr'};
 try {
  delete process.env.RESEND_API_KEY;
  assert.equal((await call(good)).code,503);
  process.env.RESEND_API_KEY='test-key';
  let calls=[];
  global.fetch=async(url,options)=>{calls.push({url,...options});return calls.length===1?{status:404,ok:false}:{ok:true,json:async()=>({id:'contact-id'})};};
  assert.deepEqual((await call(good)).data,{ok:true});
  assert.equal(calls[0].method,'PATCH');
  assert.equal(calls[0].url,'https://api.resend.com/contacts/test%40example.com');
  assert.equal(calls[1].method,'POST');
  assert.deepEqual(JSON.parse(calls[1].body),{email:'test@example.com',unsubscribed:false});
  global.fetch=async()=>({ok:true,json:async()=>({id:'existing'})});
  assert.equal((await call(good)).code,200);
  let step=0;
  global.fetch=async()=>++step===1?{status:404}:step===2?{status:409}:{ok:true,json:async()=>({id:'race'})};
  assert.equal((await call(good)).code,200);
  assert.equal(step,3);
  for(const response of [{ok:false,json:async()=>({message:'private provider details'})},{ok:true,json:async()=>({})}]) {
   global.fetch=async()=>response;
   const result=await call(good);assert.equal(result.code,502);assert.deepEqual(result.data,{ok:false});
  }
  global.fetch=async()=>{throw Error('timeout')};assert.equal((await call(good)).code,502);
 } finally {global.fetch=oldFetch;oldKey===undefined?delete process.env.RESEND_API_KEY:process.env.RESEND_API_KEY=oldKey;}
});
test('all generated newsletters are editable and load the shared script once',()=>{
 let count=0;
 for(const file of fs.readdirSync('.').filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync(file,'utf8'),form=html.match(/<form[^>]*data-newsletter-form[\s\S]*?<\/form>/)?.[0];
  if(!form)continue;count++;
  assert.doesNotMatch(form,/\bdisabled\b/);
  assert.match(form,/name="email" required maxlength="254"/);
  assert.match(form,/name="company_website" tabindex="-1"/);
  assert.match(form,/aria-live="polite"/);
  assert.equal((html.match(/src="\/newsletter.js"/g)||[]).length,1);
 }
 assert.equal(count,26);
});
for(const lang of ['fr','en']) test(`newsletter ${lang}: loading, confirmed success, validation and retryable errors`,async()=>{
 const listeners={},email={value:'test@example.com',addEventListener(){}},button={disabled:false,textContent:lang==='fr'?'S’inscrire':'Subscribe'},status={textContent:''};
 let valid=true,resolve;
 const form={elements:{email,company_website:{value:''}},querySelector:s=>s.startsWith('button')?button:status,reportValidity:()=>valid,setAttribute(){},removeAttribute(){},addEventListener:(event,fn)=>listeners[event]=fn};
 const context={document:{documentElement:{lang},querySelectorAll:()=>[form]},AbortController,setTimeout,clearTimeout,fetch:()=>new Promise(r=>resolve=r)};
 vm.runInNewContext(fs.readFileSync('newsletter.js','utf8'),context);
 valid=false;await listeners.submit({preventDefault(){}});assert.equal(button.disabled,false);
 valid=true;let pending=listeners.submit({preventDefault(){}});assert.equal(button.disabled,true);
 assert.equal(button.textContent,lang==='fr'?'Inscription…':'Subscribing…');
 resolve({ok:true,json:async()=>({ok:true})});await pending;
 assert.equal(status.textContent,lang==='fr'?'Inscription confirmée.':'You’re subscribed.');assert.equal(button.disabled,false);
 pending=listeners.submit({preventDefault(){}});resolve({ok:false,json:async()=>({ok:false})});await pending;
 assert.equal(status.textContent,lang==='fr'?'Impossible de vous inscrire pour le moment. Réessayez.':'Unable to subscribe right now. Please try again.');
 assert.equal(button.disabled,false);
});
