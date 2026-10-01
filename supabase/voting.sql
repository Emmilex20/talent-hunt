-- TalentQuest competition rounds and paid voting foundation
create table if not exists public.competition_rounds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft' check(status in ('draft','scheduled','live','closed')),
  voting_enabled boolean not null default false,
  vote_price_kobo integer not null default 10000 check(vote_price_kobo >= 0),
  leaderboard_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.round_contestants (
  round_id uuid not null references public.competition_rounds(id) on delete cascade,
  contestant_id uuid not null references public.contestants(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key(round_id, contestant_id)
);

create table if not exists public.vote_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  round_id uuid not null references public.competition_rounds(id),
  contestant_id uuid not null references public.contestants(id),
  voter_email text not null,
  voter_name text,
  quantity integer not null check(quantity > 0),
  amount_kobo integer not null check(amount_kobo >= 0),
  status text not null default 'pending' check(status in ('pending','paid','failed','cancelled')),
  provider text not null default 'paystack',
  provider_transaction_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.vote_ledger (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.vote_orders(id) on delete cascade,
  round_id uuid not null references public.competition_rounds(id),
  contestant_id uuid not null references public.contestants(id),
  votes integer not null check(votes > 0),
  created_at timestamptz not null default now()
);

alter table public.competition_rounds enable row level security;
alter table public.round_contestants enable row level security;
alter table public.vote_orders enable row level security;
alter table public.vote_ledger enable row level security;

-- Public can see active competition configuration and aggregate ledger rows.
create policy "public reads rounds" on public.competition_rounds for select using(true);
create policy "public reads round contestants" on public.round_contestants for select using(true);
create policy "public reads vote ledger" on public.vote_ledger for select using(true);

-- Competition administrators manage rounds and membership.
create policy "admins manage rounds" on public.competition_rounds for all to authenticated using(public.can_review()) with check(public.can_review());
create policy "admins manage round contestants" on public.round_contestants for all to authenticated using(public.can_review()) with check(public.can_review());
create policy "admins read vote orders" on public.vote_orders for select to authenticated using(public.can_review());
create policy "admins read vote ledger" on public.vote_ledger for select to authenticated using(public.can_review());

-- IMPORTANT: vote_orders and vote_ledger are written by trusted server code only using the service role.
-- Never allow browser clients to mark orders paid or insert verified votes.
