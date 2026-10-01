export async function creditVoteOrder(db, reference, transaction) {
  const { data: order, error: orderError } = await db
    .from("vote_orders")
    .select("*")
    .eq("reference", reference)
    .single();

  if (orderError || !order) {
    return { ok: false, status: 404, error: "Vote order not found" };
  }

  const { data: credited } = await db
    .from("vote_ledger")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  if (credited) {
    return { ok: true, alreadyCredited: true, order };
  }

  if (!transaction || transaction.status !== "success") {
    return { ok: false, status: 400, error: "Payment has not been confirmed" };
  }

  if (
    Number(transaction.amount) !== Number(order.amount_kobo) ||
    transaction.currency !== "NGN" ||
    transaction.reference !== reference
  ) {
    return { ok: false, status: 400, error: "Payment verification mismatch" };
  }

  const { error: updateError } = await db
    .from("vote_orders")
    .update({
      status: "paid",
      provider_transaction_id: String(transaction.id),
      paid_at: transaction.paid_at || new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateError) throw updateError;

  const { error: ledgerError } = await db.from("vote_ledger").insert({
    order_id: order.id,
    round_id: order.round_id,
    contestant_id: order.contestant_id,
    votes: order.quantity,
  });

  // The database unique constraint on order_id is the final idempotency guard.
  if (ledgerError && ledgerError.code !== "23505") throw ledgerError;

  return {
    ok: true,
    reference,
    votes: order.quantity,
    contestantId: order.contestant_id,
    amount: order.amount_kobo,
    paidAt: transaction.paid_at,
  };
}
