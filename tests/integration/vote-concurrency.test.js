const test=require('node:test');
const assert=require('node:assert/strict');
const {createClient}=require('@supabase/supabase-js');

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled=process.env.RUN_DB_INTEGRATION==='1';

async function loadCredit(){return (await import('../../lib/credit-vote-order.js')).creditVoteOrder}

function admin(){return createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}})}

test('concurrent callback and webhook attempts create exactly one vote ledger entry',{skip:!enabled||!url||!serviceKey},async()=>{
 const db=admin();
 const run=`E2E-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
 let applicationId,contestantId,orderId;
 try{
  const{data:round,error:roundError}=await db.from('competition_rounds').select('id,name').limit(1).maybeSingle();
  assert.ifError(roundError);assert.ok(round?.id,'At least one existing competition round is required');

  const{data:application,error:applicationError}=await db.from('applications').insert({full_name:`${run} Voter Test`,stage_name:run,email:`${run.toLowerCase()}@example.test`,phone:'00000000000',location:'E2E',category:'E2E Test',bio:'Disposable payment concurrency test record',video_url:'e2e/test.mp4',status:'approved'}).select('id').single();
  assert.ifError(applicationError);applicationId=application.id;

  const{data:contestant,error:contestantError}=await db.from('contestants').insert({application_id:applicationId,full_name:`${run} Voter Test`,stage_name:run,category:'E2E Test',bio:'Disposable payment concurrency test record',video_url:'e2e/test.mp4',active:true}).select('id').single();
  assert.ifError(contestantError);contestantId=contestant.id;

  const reference=`TQ-${run}`;const quantity=7;const amount=70000;
  const{data:order,error:orderError}=await db.from('vote_orders').insert({reference,round_id:round.id,contestant_id:contestantId,voter_email:'e2e-voter@example.test',voter_name:'E2E Voter',quantity,amount_kobo:amount,status:'pending',provider:'paystack'}).select('id').single();
  assert.ifError(orderError);orderId=order.id;

  const tx={id:`PS-${run}`,status:'success',amount,currency:'NGN',reference,paid_at:new Date().toISOString()};
  const creditVoteOrder=await loadCredit();
  const results=await Promise.allSettled([creditVoteOrder(db,reference,tx),creditVoteOrder(db,reference,tx)]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,2,'both delivery paths should finish safely');
  assert.ok(results.every(x=>x.value?.ok===true),'both attempts should be idempotent successes');

  const{data:ledger,error:ledgerError}=await db.from('vote_ledger').select('id,votes,order_id').eq('order_id',orderId);
  assert.ifError(ledgerError);assert.equal(ledger.length,1,'payment must create exactly one ledger entry');assert.equal(ledger[0].votes,quantity);

  const{data:paid,error:paidError}=await db.from('vote_orders').select('status,provider_transaction_id').eq('id',orderId).single();
  assert.ifError(paidError);assert.equal(paid.status,'paid');assert.equal(paid.provider_transaction_id,String(tx.id));
 }finally{
  if(orderId)await db.from('vote_orders').delete().eq('id',orderId);
  if(contestantId)await db.from('contestants').delete().eq('id',contestantId);
  if(applicationId)await db.from('applications').delete().eq('id',applicationId);
 }
});
