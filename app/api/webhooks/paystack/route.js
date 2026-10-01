import crypto from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { creditVoteOrder } from "@/lib/credit-vote-order";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret || !signature) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    const supplied = Buffer.from(signature, "utf8");
    const calculated = Buffer.from(expected, "utf8");
    if (supplied.length !== calculated.length || !crypto.timingSafeEqual(supplied, calculated)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event?.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const tx = event?.data;
    const reference = tx?.reference;
    if (!reference) return NextResponse.json({ received: true });

    // Ignore unrelated successful Paystack transactions that are not TalentQuest vote orders.
    const db = getSupabaseAdmin();
    const { data: order } = await db
      .from("vote_orders")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();
    if (!order) return NextResponse.json({ received: true });

    const credited = await creditVoteOrder(db, reference, tx);
    if (!credited.ok) {
      console.error("Paystack webhook vote credit rejected", credited);
      return NextResponse.json({ error: credited.error }, { status: credited.status || 400 });
    }

    return NextResponse.json({ received: true, credited: true, alreadyCredited: !!credited.alreadyCredited });
  } catch (e) {
    console.error("Paystack webhook error", e);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
