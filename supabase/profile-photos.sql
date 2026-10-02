-- TalentQuest public contestant profile photos
alter table public.applications add column if not exists photo_url text;

-- Public bucket: approved contestant photos are intentionally public-facing.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('contestant-photos','contestant-photos',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

-- Application uploads are now performed only by the secured server endpoint with
-- the service role. Remove the legacy anonymous upload policy so public clients
-- cannot use this bucket as arbitrary image hosting.
drop policy if exists "public can upload contestant application photos" on storage.objects;

-- Logged-in contestants may upload only into their own folder. The portal uses
-- contestants/<auth.uid()>/... so ownership can be enforced by Storage RLS.
drop policy if exists "contestants upload own profile photos" on storage.objects;
create policy "contestants upload own profile photos"
on storage.objects for insert to authenticated
with check (
  bucket_id='contestant-photos'
  and (storage.foldername(name))[1]='contestants'
  and (storage.foldername(name))[2]=auth.uid()::text
);

drop policy if exists "contestants update own profile photos" on storage.objects;
create policy "contestants update own profile photos"
on storage.objects for update to authenticated
using (
  bucket_id='contestant-photos'
  and (storage.foldername(name))[1]='contestants'
  and (storage.foldername(name))[2]=auth.uid()::text
)
with check (
  bucket_id='contestant-photos'
  and (storage.foldername(name))[1]='contestants'
  and (storage.foldername(name))[2]=auth.uid()::text
);

drop policy if exists "contestants delete own profile photos" on storage.objects;
create policy "contestants delete own profile photos"
on storage.objects for delete to authenticated
using (
  bucket_id='contestant-photos'
  and (storage.foldername(name))[1]='contestants'
  and (storage.foldername(name))[2]=auth.uid()::text
);

-- Public bucket objects are readable on contestant cards and public profiles.
drop policy if exists "public can read contestant photos" on storage.objects;
create policy "public can read contestant photos"
on storage.objects for select to anon,authenticated
using (bucket_id='contestant-photos');
