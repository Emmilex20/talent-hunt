-- TalentQuest production security hardening
-- Run once in Supabase SQL Editor after the existing schema/migrations.
-- This migration is intentionally additive and keeps the current competition rounds/data.

-- Portal profile fields. Applications already contain these social fields, but
-- the original contestants table did not. Add them before applying column grants.
alter table public.contestants add column if not exists instagram text;
alter table public.contestants add column if not exists tiktok text;

-- One application can create at most one contestant and one authenticated user
-- can own at most one contestant/application record in the current portal model.
create unique index if not exists contestants_application_id_unique
on public.contestants(application_id) where application_id is not null;
create unique index if not exists contestants_user_id_unique
on public.contestants(user_id) where user_id is not null;
create unique index if not exists applications_user_id_unique
on public.applications(user_id) where user_id is not null;

-- Paid voting must always have a positive price and bounded quantities/amounts.
alter table public.competition_rounds drop constraint if exists competition_rounds_vote_price_kobo_check;
alter table public.competition_rounds add constraint competition_rounds_vote_price_kobo_check check (vote_price_kobo > 0);

alter table public.vote_orders drop constraint if exists vote_orders_quantity_check;
alter table public.vote_orders add constraint vote_orders_quantity_check check (quantity between 1 and 1000);

alter table public.vote_orders drop constraint if exists vote_orders_amount_kobo_check;
alter table public.vote_orders add constraint vote_orders_amount_kobo_check check (amount_kobo > 0);

create unique index if not exists vote_orders_provider_transaction_id_unique
on public.vote_orders(provider_transaction_id)
where provider_transaction_id is not null;

create index if not exists vote_orders_reference_idx on public.vote_orders(reference);
create index if not exists vote_ledger_round_contestant_idx on public.vote_ledger(round_id, contestant_id);
create index if not exists round_contestants_active_idx on public.round_contestants(round_id, contestant_id) where active=true;

-- Contestants are allowed to edit public presentation fields only through the
-- authenticated browser client. Column grants prevent changing ownership,
-- application linkage, active state, contestant number or other admin fields.
revoke update on table public.contestants from authenticated;
grant update (stage_name,bio,instagram,tiktok,photo_url) on table public.contestants to authenticated;

-- Applications are review records after submission. Contestants should not be
-- able to alter approval status, ownership, audition path or administrative data.
revoke update on table public.applications from authenticated;
-- No application columns are currently editable from the portal.

drop policy if exists "Applicants can update own profile fields" on public.applications;

-- Make ownership policy explicit and idempotent.
drop policy if exists "Contestants can update own profile" on public.contestants;
create policy "Contestants can update own profile"
on public.contestants for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Payment tables remain read-only to browser clients. All mutations use the
-- service role from trusted API routes/webhooks.
revoke insert,update,delete on table public.vote_orders from anon,authenticated;
revoke insert,update,delete on table public.vote_ledger from anon,authenticated;
