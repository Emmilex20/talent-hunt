const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');

loadEnvConfig(path.resolve(__dirname, '../..'));

const enabled = process.env.RUN_DB_INTEGRATION === '1';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.E2E_CONTESTANT_EMAIL;
const password = process.env.E2E_CONTESTANT_PASSWORD;

function dbClients() {
  assert.ok(url && anon && service, 'Supabase environment variables are required.');
  return {
    admin: createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } }),
    user: createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
  };
}

async function contestantToken() {
  assert.ok(email && password, 'E2E contestant credentials are required.');
  const { user } = dbClients();
  const { data, error } = await user.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  assert.ok(data.session?.access_token);
  return data.session.access_token;
}

async function post(pathname, body, token) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  return fetch(`${baseURL}${pathname}`, { method: 'POST', headers, body: JSON.stringify(body) });
}

test('rejected application decision cannot mutate the E2E application',{skip:!enabled}, async () => {
  const { admin } = dbClients();
  const { data: before, error } = await admin.from('applications').select('id,status,updated_at').eq('user_id','65185c1a-5aa6-4bd4-a1fa-c0ad7c13ecad').single();
  assert.ifError(error);

  const token = await contestantToken();
  const response = await post('/api/admin/application-decision', { applicationId: before.id, status: 'rejected' }, token);
  assert.equal(response.status, 403);

  const { data: after, error: afterError } = await admin.from('applications').select('id,status,updated_at').eq('id',before.id).single();
  assert.ifError(afterError);
  assert.deepEqual(after, before, 'Rejected contestant request must leave application unchanged.');
});

test('rejected round advancement cannot create round membership',{skip:!enabled}, async () => {
  const { admin } = dbClients();
  const userId = '65185c1a-5aa6-4bd4-a1fa-c0ad7c13ecad';
  const { data: contestant, error: contestantError } = await admin.from('contestants').select('id').eq('user_id',userId).single();
  assert.ifError(contestantError);
  const { data: rounds, error: roundError } = await admin.from('competition_rounds').select('id').limit(2);
  assert.ifError(roundError);
  if (!rounds || rounds.length < 2) return;

  const sourceRoundId = rounds[0].id;
  const destinationRoundId = rounds[1].id;
  const { data: before, error: beforeError } = await admin.from('round_contestants').select('round_id,contestant_id,active').eq('contestant_id',contestant.id).eq('round_id',destinationRoundId);
  assert.ifError(beforeError);

  const token = await contestantToken();
  const response = await post('/api/admin/rounds/advance', { sourceRoundId, destinationRoundId, contestantIds:[contestant.id] }, token);
  assert.equal(response.status, 403);

  const { data: after, error: afterError } = await admin.from('round_contestants').select('round_id,contestant_id,active').eq('contestant_id',contestant.id).eq('round_id',destinationRoundId);
  assert.ifError(afterError);
  assert.deepEqual(after, before, 'Rejected contestant request must not alter destination-round membership.');
});
