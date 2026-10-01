-- TalentQuest round manager schema migration
-- Run this ONCE in Supabase SQL Editor for databases created with an older rounds schema.

alter table public.competition_rounds
  add column if not exists description text,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists voting_enabled boolean not null default false,
  add column if not exists vote_price_kobo integer not null default 10000,
  add column if not exists leaderboard_visible boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

-- Normalize old rows that may have been created before vote_price_kobo existed.
update public.competition_rounds
set vote_price_kobo = 10000
where vote_price_kobo is null or vote_price_kobo < 0;

update public.competition_rounds
set voting_enabled = false
where voting_enabled is null;

update public.competition_rounds
set leaderboard_visible = false
where leaderboard_visible is null;

-- Ensure round membership exists for contestant assignment in the admin manager.
create table if not exists public.round_contestants (
  round_id uuid not null references public.competition_rounds(id) on delete cascade,
  contestant_id uuid not null references public.contestants(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key(round_id, contestant_id)
);

alter table public.round_contestants enable row level security;

-- Recreate policies safely if this migration is rerun.
drop policy if exists "public reads round contestants" on public.round_contestants;
create policy "public reads round contestants"
on public.round_contestants for select
using (true);

drop policy if exists "admins manage round contestants" on public.round_contestants;
create policy "admins manage round contestants"
on public.round_contestants for all to authenticated
using (public.can_review())
with check (public.can_review());

-- Ask PostgREST to reload its schema immediately after this migration.
notify pgrst, 'reload schema';
