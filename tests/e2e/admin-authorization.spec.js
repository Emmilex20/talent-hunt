const { test, expect } = require('@playwright/test');

const contestantEmail = process.env.E2E_CONTESTANT_EMAIL;
const contestantPassword = process.env.E2E_CONTESTANT_PASSWORD;

async function contestantToken(request) {
  if (!contestantEmail || !contestantPassword) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const response = await request.post(`${url}/auth/v1/token?grant_type=password`, {
    headers: { apikey: anon, 'Content-Type': 'application/json' },
    data: { email: contestantEmail, password: contestantPassword }
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).access_token;
}

const endpoints = [
  { name: 'application decision', path: '/api/admin/application-decision', body: { applicationId: '00000000-0000-0000-0000-000000000000', status: 'approved' } },
  { name: 'round advancement', path: '/api/admin/rounds/advance', body: { roundId: '00000000-0000-0000-0000-000000000000', contestantIds: [] } }
];

for (const endpoint of endpoints) {
  test(`${endpoint.name} rejects unauthenticated requests`, async ({ request }) => {
    const response = await request.post(endpoint.path, { data: endpoint.body });
    expect(response.status()).toBe(401);
  });

  test(`${endpoint.name} rejects forged bearer tokens`, async ({ request }) => {
    const response = await request.post(endpoint.path, {
      headers: { Authorization: 'Bearer not-a-real-jwt' },
      data: endpoint.body
    });
    expect(response.status()).toBe(401);
  });

  test(`${endpoint.name} rejects a normal contestant account`, async ({ request }) => {
    test.skip(!contestantEmail || !contestantPassword, 'E2E contestant credentials are not configured.');
    const token = await contestantToken(request);
    expect(token).toBeTruthy();
    const response = await request.post(endpoint.path, {
      headers: { Authorization: `Bearer ${token}` },
      data: endpoint.body
    });
    expect(response.status()).toBe(403);
  });
}
