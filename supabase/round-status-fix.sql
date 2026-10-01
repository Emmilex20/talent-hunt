-- Fix legacy competition_rounds status constraint.
-- Older databases used a different allowed-status list, so the current
-- admin manager can fail when setting a round to scheduled/live/closed.

alter table public.competition_rounds
  drop constraint if exists competition_rounds_status_check;

-- Normalize any legacy values before recreating the constraint.
update public.competition_rounds
set status = case
  when lower(coalesce(status, '')) in ('draft') then 'draft'
  when lower(coalesce(status, '')) in ('scheduled', 'upcoming') then 'scheduled'
  when lower(coalesce(status, '')) in ('live', 'active', 'open') then 'live'
  when lower(coalesce(status, '')) in ('closed', 'completed', 'ended', 'finished') then 'closed'
  else 'draft'
end;

alter table public.competition_rounds
  add constraint competition_rounds_status_check
  check (status in ('draft','scheduled','live','closed'));

notify pgrst, 'reload schema';
