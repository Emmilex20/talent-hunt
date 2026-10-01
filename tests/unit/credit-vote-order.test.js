const test = require('node:test');
const assert = require('node:assert/strict');

function makeDb({order, credited=null, ledgerError=null, updateError=null}) {
  const calls={updates:[],inserts:[]};
  return {
    calls,
    from(table){
      if(table==='vote_orders') return {
        select(){return {eq(){return {single:async()=>({data:order,error:null})}}}},
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
});

test('does not double-credit an already credited order', async()=>{
  const db=makeDb({order,credited:{id:'ledger-1'}}); const creditVoteOrder=await loadCredit();
  const result=await creditVoteOrder(db,'TQ-TEST',tx);
  assert.equal(result.ok,true); assert.equal(result.alreadyCredited,true);
  assert.equal(db.calls.updates.length,0); assert.equal(db.calls.inserts.length,0);
});

test('rejects amount mismatch', async()=>{
  const db=makeDb({order}); const creditVoteOrder=await loadCredit();
  const result=await creditVoteOrder(db,'TQ-TEST',{...tx,amount:100});
  assert.equal(result.ok,false); assert.match(result.error,/mismatch/i);
  assert.equal(db.calls.inserts.length,0);
});

test('rejects wrong currency or reference', async()=>{
  const creditVoteOrder=await loadCredit();
  for(const bad of [{...tx,currency:'USD'},{...tx,reference:'OTHER'}]){
    const db=makeDb({order}); const result=await creditVoteOrder(db,'TQ-TEST',bad);
    assert.equal(result.ok,false); assert.equal(db.calls.inserts.length,0);
  }
});

test('rejects unconfirmed payment', async()=>{
  const db=makeDb({order}); const creditVoteOrder=await loadCredit();
  const result=await creditVoteOrder(db,'TQ-TEST',{...tx,status:'failed'});
  assert.equal(result.ok,false); assert.match(result.error,/not been confirmed/i);
});
