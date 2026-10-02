import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { creditVoteOrder } from "@/lib/credit-vote-order";

export const runtime="nodejs";
const REF=/^TQ-\d{10,16}-[a-f0-9]{10,32}$/i;

export async function POST(req) {
  try {
    const secret=process.env.PAYSTACK_SECRET_KEY;
    if(!secret)return NextResponse.json({error:"Payment service is not configured"},{status:503});
    let body;try{body=await req.json()}catch{return NextResponse.json({error:"Invalid request"},{status:400})}
    const reference=String(body.reference||"").trim();
    if (!REF.test(reference)) return NextResponse.json({ error: "Invalid payment reference" }, { status: 400 });

    const db=getSupabaseAdmin();
    const {data:order,error:orderError}=await db.from("vote_orders").select("id,status").eq("reference",reference).maybeSingle();
    if(orderError)throw orderError;
    if(!order)return NextResponse.json({error:"Vote order not found"},{status:404});
    if(order.status==="paid"){
      const credited=await creditVoteOrder(db,reference,{status:"success",reference});
      if(credited.ok&&credited.alreadyCredited)return NextResponse.json(credited);
    }

    const verify = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,{headers:{Authorization:`Bearer ${secret}`},cache:"no-store"});
    const result = await verify.json().catch(()=>({}));
    const tx = result?.data;
    if (!verify.ok || !result.status || tx?.status !== "success") return NextResponse.json({ error: "Payment has not been confirmed" }, { status: 400 });

    const credited = await creditVoteOrder(db, reference, tx);
    if (!credited.ok) return NextResponse.json({ error: credited.error }, { status: credited.status || 400 });
    return NextResponse.json(credited);
  } catch (e) {
    console.error("vote-verify",e);
    return NextResponse.json({ error: "Unable to verify payment" }, { status: 500 });
  }
}
