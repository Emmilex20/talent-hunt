-- Batch 5 contestant management additions
alter table public.contestants add column if not exists updated_at timestamptz not null default now();

-- Generate readable contestant numbers for records created without one.
create or replace function public.assign_contestant_number()
returns trigger language plpgsql as $$
begin
  if new.contestant_number is null then
    new.contestant_number := 'TQ-' || upper(substr(replace(new.id::text,'-',''),1,6));
  end if;
  return new;
end; $$;

drop trigger if exists contestant_number_trigger on public.contestants;
create trigger contestant_number_trigger before insert on public.contestants for each row execute function public.assign_contestant_number();

-- Admins/reviewers need to manage contestant visibility.
drop policy if exists "reviewers can manage contestants" on public.contestants;
create policy "reviewers can manage contestants" on public.contestants for all to authenticated using(public.can_review()) with check(public.can_review());
