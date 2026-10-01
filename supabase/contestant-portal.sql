alter table public.applications add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.contestants add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists contestants_user_id_idx on public.contestants(user_id);

alter table public.applications enable row level security;
alter table public.contestants enable row level security;

create policy "Applicants can read own application" on public.applications for select to authenticated using (auth.uid() = user_id);
create policy "Applicants can update own profile fields" on public.applications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Contestants can update own profile" on public.contestants for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.contestant_announcements (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 body text not null,
 round_id uuid references public.competition_rounds(id) on delete cascade,
 published boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.contestant_announcements enable row level security;
create policy "Authenticated contestants can read announcements" on public.contestant_announcements for select to authenticated using (published = true);
