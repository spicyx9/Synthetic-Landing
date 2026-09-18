const {test}=require('node:test');
const assert=require('node:assert/strict');
const handler=require('../api/contact.js');
const valid={firstName:'Test',lastName:'Person',email:'test@example.com',subject:'Test',message:'A test message',company:'',website:''};
async function call(body,ip='test',method='POST') {
 const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(data){this.data=data;return this;}};
 await handler({method,headers:{'content-type':'application/json','x-vercel-forwarded-for':ip},body},res); return res;
}
test('contact validation, configuration, provider failures and throttling',async()=>{
 const env=[process.env.RESEND_API_KEY,process.env.CONTACT_FROM_EMAIL],oldFetch=global.fetch;
 try {
  delete process.env.RESEND_API_KEY;delete process.env.CONTACT_FROM_EMAIL;
  assert.equal((await call(valid,'method','GET')).code,405);
  assert.equal((await call({...valid,email:'bad'})).code,400);
  assert.equal((await call({...valid,website:'spam'})).code,400);
  assert.equal((await call({...valid,subject:'header\ninjection'})).code,400);
  assert.equal((await call({...valid,message:'x'.repeat(5001)})).code,400);
  assert.equal((await call(valid,'missing')).code,503);
  process.env.RESEND_API_KEY='test-only';process.env.CONTACT_FROM_EMAIL='sender@example.com';
  let payload;
  global.fetch=async(url,options)=>{payload=JSON.parse(options.body);return {ok:true,json:async()=>({id:'mock-id'})};};
  assert.equal((await call(valid,'success')).data.ok,true);
  assert.deepEqual(payload.to,['contact@syntheticswarm.ai']);assert.equal(payload.reply_to,valid.email);
  global.fetch=async()=>({ok:false,json:async()=>({message:'private provider error'})});
  assert.equal((await call(valid,'failure')).code,502);
  global.fetch=async()=>{throw new Error('timeout');};
  assert.equal((await call(valid,'timeout')).code,502);
  for(let i=0;i<5;i++) await call(valid,'limited');
  assert.equal((await call(valid,'limited')).code,429);
 } finally {
  global.fetch=oldFetch;
  for(const [key,value] of [['RESEND_API_KEY',env[0]],['CONTACT_FROM_EMAIL',env[1]]]) value===undefined?delete process.env[key]:process.env[key]=value;
 }
});
