# TalentQuest — Remaining Work

This file is the canonical checklist for the remaining production work identified after auditing the current `main` branch.

## Payment reliability
- [x] Paystack webhook endpoint
- [x] Verify `x-paystack-signature` with HMAC SHA-512 before processing webhook events
- [x] Automatic vote/payment recovery when a voter pays but closes Paystack before returning to `/vote/verify`

## Voting UX
- [x] Custom vote quantity in addition to preset vote packs

## Competition progression
- [x] Elimination / advance contestants between rounds
- [x] Bulk-select qualifiers in Admin
- [x] Automatically assign advanced contestants to the destination round
- [x] Preserve previous-round vote history/results
- [x] Start each new round with its own independent vote totals
- [x] Prevent duplicate contestant assignment to a round

## Implementation notes
- Advancement creates/upserts `round_contestants` membership in the destination round; it does not move or rewrite historical `vote_ledger` records.
- Vote totals remain independent because every ledger entry is scoped by `round_id`.
- Destination membership uses the existing `(round_id, contestant_id)` conflict key, preventing duplicate round assignments.
- The advancement API requires an authenticated `admin` or `super_admin` account.

## Implementation order
1. [x] Paystack webhook + signature verification + idempotent vote crediting
2. [x] Custom vote quantity
3. [x] Admin elimination / advancement workflow
4. [ ] End-to-end production testing
