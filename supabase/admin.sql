-- TalentQuest Batch 3: admin roles and application workflow
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'viewer' check (role in ('viewer','reviewer','judge','finance','admin','super_admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','super_admin'));
$$;

create or replace function public.can_review()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('reviewer','admin','super_admin'));
$$;

create table if not exists public.application_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  reviewer_id uuid references auth.users(id),
  decision text not null check(decision in ('shortlisted','approved','rejected')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.application_reviews enable row level security;
create policy "reviewers can read applications" on public.applications for select to authenticated using(public.can_review());
create policy "reviewers can update applications" on public.applications for update to authenticated using(public.can_review()) with check(public.can_review());
create policy "reviewers can read reviews" on public.application_reviews for select to authenticated using(public.can_review());
create policy "reviewers can create reviews" on public.application_reviews for insert to authenticated with check(public.can_review());

-- Use the Supabase dashboard to create the first auth user, then promote it safely:
-- insert into public.profiles(id, full_name, role) values ('AUTH_USER_UUID','TalentQuest Admin','super_admin');
-- Never expose the service-role key in browser code.
