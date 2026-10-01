# TalentQuest data model

Applications enter as `pending` and can later be reviewed by authenticated administrators. Approved submissions can be promoted into public contestant profiles with a unique contestant number, category and media.

Competition rounds define season progression and store public-vote versus judge-score weighting. Future batches will attach performances, judge scores and verified payment-backed votes to a round.

Public clients use the Supabase anon key with RLS. Privileged admin mutations and Paystack verification will run server-side with authorization checks.
