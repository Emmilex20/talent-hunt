const test = require('node:test');
const assert = require('node:assert/strict');

function makeDb({order, orderError=null, credited=null, ledgerError=null, updateError=null}) {
  const calls={updates:[],inserts:[]};
  return {
    calls,
    from(table){
      if(table==='vote_orders') return {
        select(){return {eq(){return {single:async()=>({data:order,error:orderError})}}}},
        update(payload){calls.updates.push(payload);return {eq:async()=>({error:updateError})}}
      };
      if(table==='vote_ledger') return {
        select(){return {eq(){return {maybeSingle:async()=>({data:credited,error:null})}}}},
        insert:async payload=>{calls.inserts.push(payload);return {error:ledgerError}}
      };
      throw new Error(`Unexpected table ${table}`);
    }
  };
}

async function loadCredit(){return (await import('../../lib/credit-vote-order.js')).creditVoteOrder}
const order={id:'order-1',reference:'TQ-TEST',round_id:'round-1',contestant_id:'contestant-1',quantity:25,amount_kobo:250000};
const tx={id:9001,status:'success',amount:250000,currency:'NGN',reference:'TQ-TEST',paid_at:'2026-10-01T20:00:00Z'};

test('credits a valid Paystack transaction exactly once', async()=>{
  const db=makeDb({order}); const creditVoteOrder=await loadCredit();
  const result=await creditVoteOrder(db,'TQ-TEST',tx);
  assert.equal(result.ok,true); assert.equal(result.votes,25);
  assert.equal(db.calls.updates.length,1); assert.equal(db.calls.inserts.length,1);
  assert.equal(db.calls.inserts[0].votes,25);
  assert.equal(db.calls.updates[0].status,'paid');
  assert.equal(db.calls.updates[0].provider_transaction_id,'9001');
});

test('does not double-credit an already credited order', async()=>{
  const db=makeDb({order,credited:{id:'ledger-1'}}); const creditVoteOrder=await loadCredit();
  const result=await creditVoteOrder(db,'TQ-TEST',tx);
  assert.equal(result.ok,true); assert.equal(result.alreadyCredited,true);
  assert.equal(db.calls.updates.length,0); assert.equal(db.calls.inserts.length,0);
});

test('treats duplicate ledger insert as idempotent success', async()=>{
  const db=makeDb({order,ledgerError:{code:'23505',message:'duplicate key'}}); const creditVoteOrder=await loadCredit();
  const result=await creditVoteOrder(db,'TQ-TEST',tx);
  assert.equal(result.ok,true);
  assert.equal(db.calls.updates.length,1);
  assert.equal(db.calls.inserts.length,1);
});

test('rejects amount mismatch', async()=>{
  const db=makeDb({order}); const creditVoteOrder=await loadCredit();
  const result=await creditVoteOrder(db,'TQ-TEST',{...tx,amount:100});
  assert.equal(result.ok,false); assert.match(result.error,/mismatch/i);
  assert.equal(db.calls.updates.length,0); assert.equal(db.calls.inserts.length,0);
});

test('rejects wrong currency or reference', async()=>{
  const creditVoteOrder=await loadCredit();
  for(const bad of [{...tx,currency:'USD'},{...tx,reference:'OTHER'}]){
    const db=makeDb({order}); const result=await creditVoteOrder(db,'TQ-TEST',bad);
    assert.equal(result.ok,false); assert.equal(db.calls.updates.length,0); assert.equal(db.calls.inserts.length,0);
  }
});

test('rejects unconfirmed, abandoned, or missing transaction', async()=>{
  const creditVoteOrder=await loadCredit();
  for(const bad of [{...tx,status:'failed'},{...tx,status:'abandoned'},null]){
    const db=makeDb({order}); const result=await creditVoteOrder(db,'TQ-TEST',bad);
    assert.equal(result.ok,false); assert.match(result.error,/not been confirmed/i);
    assert.equal(db.calls.updates.length,0); assert.equal(db.calls.inserts.length,0);
  }
});

test('returns 404 for an unknown vote reference', async()=>{
  const db=makeDb({order:null,orderError:{code:'PGRST116'}}); const creditVoteOrder=await loadCredit();
  const result=await creditVoteOrder(db,'TQ-MISSING',tx);
  assert.equal(result.ok,false); assert.equal(result.status,404);
  assert.equal(db.calls.updates.length,0); assert.equal(db.calls.inserts.length,0);
});

test('does not credit if marking the order paid fails', async()=>{
  const db=makeDb({order,updateError:new Error('database unavailable')}); const creditVoteOrder=await loadCredit();
  await assert.rejects(()=>creditVoteOrder(db,'TQ-TEST',tx),/database unavailable/);
  assert.equal(db.calls.inserts.length,0);
});

test('surfaces unexpected ledger failures', async()=>{
  const db=makeDb({order,ledgerError:{code:'XX000',message:'ledger unavailable'}}); const creditVoteOrder=await loadCredit();
  await assert.rejects(()=>creditVoteOrder(db,'TQ-TEST',tx),err=>err?.message==='ledger unavailable');
  assert.equal(db.calls.inserts.length,1);
});
