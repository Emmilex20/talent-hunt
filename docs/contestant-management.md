# Contestant management

Run `supabase/contestants.sql` after `schema.sql` and `admin.sql`.

Approved applications create contestant records. Contestants receive a readable `TQ-XXXXXX` number through a database trigger. Admins can publish/unpublish contestants from `/admin/contestants`.

Public routes:
- `/contestants` — published contestant directory
- `/contestants/[id]` — public contestant profile and performance link

The voting CTA is intentionally inactive until the Paystack voting ledger and round controls are implemented.
