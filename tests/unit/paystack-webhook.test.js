const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');

async function helpers(){return import('../../lib/paystack-webhook.js')}
const secret='sk_test_talentquest_e2e_secret';
const body=JSON.stringify({event:'charge.success',data:{reference:'TQ-TEST',status:'success',amount:250000,currency:'NGN'}});
function sign(value,key=secret){return crypto.createHmac('sha512',key).update(value).digest('hex')}

test('accepts an authentic Paystack signature',async()=>{const{verifyPaystackSignature}=await helpers();assert.equal(verifyPaystackSignature(body,sign(body),secret),true)});
test('rejects a signature made with another secret',async()=>{const{verifyPaystackSignature}=await helpers();assert.equal(verifyPaystackSignature(body,sign(body,'wrong-secret'),secret),false)});
test('rejects a signature when payload was modified in transit',async()=>{const{verifyPaystackSignature}=await helpers();assert.equal(verifyPaystackSignature(body+' ',sign(body),secret),false)});
test('rejects missing signature or secret',async()=>{const{verifyPaystackSignature}=await helpers();assert.equal(verifyPaystackSignature(body,'',secret),false);assert.equal(verifyPaystackSignature(body,sign(body),''),false)});
test('parses a valid webhook event without changing transaction data',async()=>{const{parsePaystackEvent}=await helpers();const event=parsePaystackEvent(body);assert.equal(event.event,'charge.success');assert.equal(event.data.reference,'TQ-TEST');assert.equal(event.data.amount,250000)});
test('returns null for malformed webhook JSON',async()=>{const{parsePaystackEvent}=await helpers();assert.equal(parsePaystackEvent('{broken'),null)});
