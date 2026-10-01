# TalentQuest automated testing

## Coverage

The automated suite is split into two layers.

### Unit / payment integrity
`tests/unit/credit-vote-order.test.js` validates the trusted vote-crediting boundary:
- successful Paystack transaction credits the purchased quantity
- duplicate processing is idempotent
- wrong amount is rejected
- wrong currency is rejected
- wrong reference is rejected
- unsuccessful transactions are rejected

### Playwright end-to-end
`tests/e2e/public-flows.spec.js` checks application, Turnstile presence, contestant directory, leaderboard, voting and mobile portal surfaces.

`tests/e2e/admin-flows.spec.js` checks authenticated application review, contestant management, rounds/qualification and voting-control surfaces.

## First local setup

```bash
npm install
npx playwright install chromium
```

Run unit tests:

```bash
npm run test:unit
```

Run browser tests against the local Next.js app:

```bash
npm run test:e2e
```

Run everything:

```bash
npm run test:all
```

## Authenticated admin tests

Add these only to your local `.env.local` / shell or CI secrets. Never commit credentials:

```text
E2E_ADMIN_EMAIL=your-test-admin@example.com
E2E_ADMIN_PASSWORD=your-test-admin-password
```

Use a dedicated Supabase test admin, not the production super-admin account.

## External payment testing

Real Paystack checkout must remain a sandbox/integration test rather than a normal deterministic browser test. Use Paystack test keys and a non-production Supabase project/database. The automated unit suite tests the critical crediting rules without making a real charge.

The integration checklist is:
1. create/approve an application
2. confirm contestant creation or create contestant from the approved application
3. assign contestant to a live round with voting enabled
4. initialize a vote order
5. complete a Paystack test payment
6. confirm webhook signature is accepted
7. confirm exactly one `vote_ledger` row is created
8. resend the same webhook and confirm no second ledger row is created
9. confirm leaderboard reflects the credited quantity
10. advance the contestant to the next round
11. confirm previous-round votes remain unchanged and next-round voting starts at that round's own tally

## Important database isolation

Do not run destructive E2E setup/cleanup against production. The next automation layer should use a dedicated Supabase test project and seeded fixtures so application approval, contestant creation, round assignment and qualification can be tested with database assertions safely.
