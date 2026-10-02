# TalentQuest Production Readiness

This checklist captures the final release gate after the application reached a clean production build and passing unit, E2E, integration, and environment checks.

## Verified baseline

- `npm run test:unit` — 15 passing
- `npm run test:e2e` — 28 passing
- `npm run test:integration` — 6 passing when `RUN_DB_INTEGRATION=1` and E2E credentials are configured
- `npm run check:env` — passing in test-payment mode
- `npm run build` — production build completes successfully
- Admin authorization rejects unauthenticated, forged-token, and contestant requests
- Contestant authorization boundaries protect ownership/admin fields and payment/vote ledgers
- Vote crediting is idempotent under concurrent callback/webhook attempts
- Paystack webhook signature verification is covered by unit tests

## Release gate

Before enabling real payments or announcing the production URL:

- [ ] Configure production Supabase URL and keys in the deployment environment
- [ ] Configure production Paystack public/secret keys in the deployment environment
- [ ] Keep test and live Paystack credentials clearly separated
- [ ] Register the deployed `/api/webhooks/paystack` endpoint in the Paystack dashboard
- [ ] Confirm the production webhook receives and verifies a real Paystack test event before switching live
- [ ] Configure the canonical production site URL used by redirects/metadata
- [ ] Confirm Supabase Auth redirect URLs include the production domain
- [ ] Confirm storage buckets and policies allow intended applicant/contestant media while blocking unauthorized writes
- [ ] Run `npm run check:env` against deployment configuration
- [ ] Run `npm run test:all`
- [ ] Run `npm run test:integration` against the intended non-production test database/environment
- [ ] Run `npm run build`
- [ ] Smoke-test application submission, admin approval, contestant profile, round advancement, vote initialization, payment verification, leaderboard, and mobile navigation on the deployed preview
- [ ] Verify no service-role key, Paystack secret, E2E password, or other secret is exposed through `NEXT_PUBLIC_*`, committed files, logs, or client bundles
- [ ] Verify production database backups/recovery are configured before accepting real applications or payments

## Live-payment switch

Do not switch to live payments merely because the build passes. Treat live payment activation as a separate release action. At minimum, verify the live Paystack secret is server-only, the webhook URL is registered, signature verification is active, duplicate events remain idempotent, and the amount/currency/reference checks are still enforced.

## Database cleanup

The project intentionally continues using the existing Supabase database. Do not create a replacement database solely for launch. When cleaning test data, preserve competition-round configuration unless an explicit migration or reset plan says otherwise. Remove E2E/test applications, contestants, vote orders, and ledger records carefully so foreign-key relationships and retained round data are not damaged.

## Final acceptance

Production is ready to open only when all applicable release-gate items above are checked on the deployed environment, not only on localhost.
