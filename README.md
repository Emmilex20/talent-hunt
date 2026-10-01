# TalentQuest

TalentQuest is a premium talent discovery, competition, judging and public voting platform.

## Current build
- Premium responsive Next.js public experience
- Supabase data foundation
- Contestant application form with audition video links
- Public contestant directory foundation
- Applications, contestants and competition rounds schema
- RLS policies for public submissions and published records

## Setup
```bash
pnpm install
cp .env.example .env.local
pnpm dev
```
Add your Supabase URL and anon key to `.env.local`, then run `supabase/schema.sql` and optionally `supabase/seed.sql` in the Supabase SQL editor.

## Next
Admin authentication/review, contestant approval and publishing, media storage, judging, Paystack voting, leaderboards, finance and reporting.

**TalentQuest** — Discover • Vote • Support • Raise Stars
