-- TalentQuest admin roles + live review workflow
create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,full_name text,role text not null default 'viewer' check(role in('viewer','reviewer','judge','finance','admin','super_admin')),created_at timestamptz not null default now());
alter table public.profiles enable row level security;
create or replace function public.can_review() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in('reviewer','admin','super_admin')); $$;
create policy "users read own profile" on public.profiles for select to authenticated using(id=auth.uid());
create table if not exists public.application_reviews(id uuid primary key default gen_random_uuid(),application_id uuid not null references public.applications(id) on delete cascade,reviewer_id uuid references auth.users(id),decision text not null check(decision in('shortlisted','approved','rejected')),notes text,created_at timestamptz not null default now());
alter table public.application_reviews enable row level security;
create policy "reviewers read applications" on public.applications for select to authenticated using(public.can_review());
create policy "reviewers update applications" on public.applications for update to authenticated using(public.can_review()) with check(public.can_review());
create policy "reviewers read reviews" on public.application_reviews for select to authenticated using(public.can_review());
create policy "reviewers create reviews" on public.application_reviews for insert to authenticated with check(public.can_review());
create policy "reviewers create contestants" on public.contestants for insert to authenticated with check(public.can_review());
create policy "reviewers read contestants" on public.contestants for select to authenticated using(active=true or public.can_review());
-- First admin: create user in Supabase Authentication, copy UUID, then run:
-- insert into public.profiles(id,full_name,role) values ('USER_UUID','TalentQuest Admin','super_admin') on conflict(id) do update set role='super_admin';
