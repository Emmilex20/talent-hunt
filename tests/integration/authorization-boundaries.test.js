import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const enabled=process.env.RUN_DB_INTEGRATION==='1';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
const email=process.env.E2E_CONTESTANT_EMAIL;
const password=process.env.E2E_CONTESTANT_PASSWORD;

function clients(){
  assert.ok(url&&anon&&service,'Supabase environment variables are required.');
  return {
    admin:createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}}),
    user:createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}})
  };
}

async function session(){
  assert.ok(email&&password,'Set E2E_CONTESTANT_EMAIL and E2E_CONTESTANT_PASSWORD for authorization integration tests.');
  const {user}=clients();
  const {data,error}=await user.auth.signInWithPassword({email,password});
  assert.ifError(error);
  assert.ok(data.user);
  return {client:user,user:data.user};
}

test('contestant cannot change protected contestant ownership/admin fields',{skip:!enabled},async()=>{
  const {client,user}=await session();
  const {admin}=clients();
  const {data:owned,error:findError}=await admin.from('contestants').select('id,user_id,active,contestant_number').eq('user_id',user.id).maybeSingle();
  assert.ifError(findError);
  assert.ok(owned,'The E2E contestant account must own a contestant row.');
  const {error}=await client.from('contestants').update({active:false,user_id:null}).eq('id',owned.id);
  assert.ok(error,'Protected-column update must be rejected.');
  const {data:after,error:afterError}=await admin.from('contestants').select('user_id,active').eq('id',owned.id).single();
  assert.ifError(afterError);
  assert.equal(after.user_id,user.id);
  assert.equal(after.active,owned.active);
});

test('contestant cannot edit another contestant',{skip:!enabled},async()=>{
  const {client,user}=await session();
  const {admin}=clients();
  const {data:other,error:findError}=await admin.from('contestants').select('id,stage_name').neq('user_id',user.id).limit(1).maybeSingle();
  assert.ifError(findError);
  if(!other)return; // Empty development databases may only contain the test contestant.
  const marker=`unauthorized-${Date.now()}`;
  const {data,error}=await client.from('contestants').update({stage_name:marker}).eq('id',other.id).select('id,stage_name');
  if(error) assert.match(error.message,/row-level security|permission|privilege|denied/i);
  else assert.equal(data.length,0,'RLS must hide/non-update rows owned by another contestant.');
  const {data:after,error:afterError}=await admin.from('contestants').select('stage_name').eq('id',other.id).single();
  assert.ifError(afterError);
  assert.equal(after.stage_name,other.stage_name);
});

test('contestant cannot write payment or vote ledger tables',{skip:!enabled},async()=>{
  const {client}=await session();
  const fake=crypto.randomUUID();
  const order=await client.from('vote_orders').insert({reference:`forbidden-${fake}`,contestant_id:fake,round_id:fake,quantity:1,amount_kobo:100,email:'blocked@example.test'});
  assert.ok(order.error,'Direct vote order insert must be rejected.');
  const ledger=await client.from('vote_ledger').insert({provider_reference:`forbidden-${fake}`,contestant_id:fake,round_id:fake,quantity:1,amount_kobo:100});
  assert.ok(ledger.error,'Direct vote ledger insert must be rejected.');
});
