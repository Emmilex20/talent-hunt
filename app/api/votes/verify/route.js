import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { creditVoteOrder } from "@/lib/credit-vote-order";

export async function POST(req) {
  try {
    const { reference } = await req.json();
    if (!reference) return NextResponse.json({ error: "Reference required" }, { status: 400 });

    const verify = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        cache: "no-store",
      }
    );
    const result = await verify.json();
    const tx = result?.data;

    if (!verify.ok || !result.status || tx?.status !== "success") {
      return NextResponse.json({ error: "Payment has not been confirmed" }, { status: 400 });
    }

    const credited = await creditVoteOrder(getSupabaseAdmin(), reference, tx);
    if (!credited.ok) {
      return NextResponse.json({ error: credited.error }, { status: credited.status || 400 });
    }
    return NextResponse.json(credited);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to verify payment" }, { status: 500 });
  }
}
