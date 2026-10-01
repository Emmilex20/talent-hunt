import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { creditVoteOrder } from "@/lib/credit-vote-order";
import { parsePaystackEvent, verifyPaystackSignature } from "@/lib/paystack-webhook";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret || !signature) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!verifyPaystackSignature(rawBody, signature, secret)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    const event = parsePaystackEvent(rawBody);
    if (!event) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    if (event.event !== "charge.success") return NextResponse.json({ received: true });

    const tx = event.data;
    const reference = tx?.reference;
    if (!reference) return NextResponse.json({ received: true });

    const db = getSupabaseAdmin();
    const { data: order } = await db.from("vote_orders").select("id").eq("reference", reference).maybeSingle();
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
