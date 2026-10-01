-- TalentQuest private audition video storage
-- Run this in Supabase SQL Editor after deploying the secured application endpoint.
-- All application media mutations now happen server-side with the service role.

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values('audition-videos','audition-videos',false,209715200,array['video/mp4','video/quicktime','video/webm'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- Remove legacy browser permissions. The service role bypasses these policies,
-- while public/anon clients can no longer create, delete or read audition media.
drop policy if exists "Anyone can upload audition applications" on storage.objects;
drop policy if exists "Public can view audition videos" on storage.objects;
drop policy if exists "Applicants can remove failed audition uploads" on storage.objects;
