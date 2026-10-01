# TalentQuest Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `schema.sql`.
3. Optionally run `seed.sql` to create the planned season rounds.
4. Copy the project URL and anon key into `.env.local`.
5. Keep the service-role key server-only; never expose it with a `NEXT_PUBLIC_` prefix.

The initial public RLS policy allows anonymous application inserts only as `pending`. Public contestant and round reads are limited to active/published records.
