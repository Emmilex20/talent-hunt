# Paystack voting

Required server environment variables:

- `PAYSTACK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Flow:
1. Browser submits contestant, round, email and vote quantity to `/api/votes/initialize`.
2. Server re-reads the live round and price from Supabase. It never trusts a browser-supplied amount.
3. Server creates a pending vote order and initializes Paystack.
4. Paystack redirects to `/vote/verify`.
5. Server calls Paystack Verify Transaction, confirms `success`, NGN currency, reference and exact amount.
6. Only then is the order marked paid and the vote ledger credited.
7. `vote_ledger.order_id` is unique, making repeated verification idempotent.

Before testing, run `supabase/voting.sql` and `supabase/voting-hardening.sql` and use Paystack test keys first.
