-- Run after voting.sql
-- Prevent duplicate fulfilment of a payment.
create unique index if not exists vote_ledger_order_unique on public.vote_ledger(order_id);
create index if not exists vote_ledger_round_contestant_idx on public.vote_ledger(round_id, contestant_id);
create index if not exists vote_orders_reference_idx on public.vote_orders(reference);
create index if not exists vote_orders_paid_idx on public.vote_orders(status, paid_at);

-- Browser users should never create or update payment orders/ledger entries.
-- Service-role server routes bypass RLS and are the only payment fulfilment path.
