-- TalentQuest audition video storage
-- Run this once in the Supabase SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'audition-videos',
  'audition-videos',
  true,
  209715200,
  array['video/mp4','video/quicktime','video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Applications currently support guest submissions, so uploads are allowed
-- to the applications folder. Restricting contestant edits can be added
-- separately when the application flow requires authentication.
drop policy if exists "Anyone can upload audition applications" on storage.objects;
create policy "Anyone can upload audition applications"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'audition-videos'
  and (storage.foldername(name))[1] = 'applications'
);

drop policy if exists "Public can view audition videos" on storage.objects;
create policy "Public can view audition videos"
on storage.objects for select
to public
using (bucket_id = 'audition-videos');

drop policy if exists "Applicants can remove failed audition uploads" on storage.objects;
create policy "Applicants can remove failed audition uploads"
on storage.objects for delete
to anon, authenticated
using (
  bucket_id = 'audition-videos'
  and (storage.foldername(name))[1] = 'applications'
);
