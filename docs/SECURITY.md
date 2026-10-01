# Security

Never commit `.env.local` or service-role/payment secret keys. Public inserts are constrained with Supabase RLS. Administrative and payment actions will require server-side authorization.
