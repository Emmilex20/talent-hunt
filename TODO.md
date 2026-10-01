# TalentQuest — Remaining Work

This file is the canonical checklist for the remaining production work identified after auditing the current `main` branch.

## Payment reliability
- [x] Paystack webhook endpoint
- [x] Verify `x-paystack-signature` with HMAC SHA-512 before processing webhook events
- [x] Automatic vote/payment recovery when a voter pays but closes Paystack before returning to `/vote/verify`

## Voting UX
- [x] Custom vote quantity in addition to preset vote packs

## Competition progression
- [ ] Elimination / advance contestants between rounds
- [ ] Bulk-select qualifiers in Admin
- [ ] Automatically assign advanced contestants to the destination round
- [ ] Preserve previous-round vote history/results
- [ ] Start each new round with its own independent vote totals
- [ ] Prevent duplicate contestant assignment to a round

## Implementation order
1. [x] Paystack webhook + signature verification + idempotent vote crediting
2. [x] Custom vote quantity
3. [ ] Admin elimination / advancement workflow
4. [ ] End-to-end production testing
