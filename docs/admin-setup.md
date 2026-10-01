# TalentQuest Admin Setup

Batch 3 introduces the admin/reviewer role model and dashboard UI.

## Setup

1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. Run `supabase/admin.sql` after the base schema succeeds.
3. Create your first administrator in Supabase Authentication.
4. Copy that user's UUID and insert a matching `profiles` row with role `super_admin` using the SQL editor.
5. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never prefix it with `NEXT_PUBLIC_`.

## Roles

- `viewer`: authenticated read-only user.
- `reviewer`: can review contestant applications.
- `judge`: reserved for scoring workflows.
- `finance`: reserved for payment/reporting workflows.
- `admin`: competition administrator.
- `super_admin`: full platform administrator.

## Application workflow

`pending -> shortlisted -> approved` or `pending/shortlisted -> rejected`.

An approval will later create/publish a contestant record through a protected server action. The current Batch 3 screens deliberately show demo rows until Supabase credentials are configured, so development never silently writes fake records to production.
