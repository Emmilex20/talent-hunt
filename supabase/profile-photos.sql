-- TalentQuest public contestant profile photos
alter table public.applications add column if not exists photo_url text;

-- Public bucket: approved contestant photos are intentionally public-facing.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('contestant-photos','contestant-photos',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

-- Applicants are anonymous, so allow new image objects only in this dedicated bucket.
-- No update/delete policy is exposed to anonymous users.
drop policy if exists "public can upload contestant application photos" on storage.objects;
create policy "public can upload contestant application photos"
on storage.objects for insert to anon,authenticated
with check (bucket_id='contestant-photos');

-- Public bucket objects must be readable on contestant cards and profiles.
drop policy if exists "public can read contestant photos" on storage.objects;
create policy "public can read contestant photos"
on storage.objects for select to anon,authenticated
using (bucket_id='contestant-photos');
