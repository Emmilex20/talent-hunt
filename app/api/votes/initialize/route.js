import {NextResponse} from "next/server";
import crypto from "crypto";
import {getSupabaseAdmin} from "@/lib/supabase-admin";

export const runtime="nodejs";
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_QTY=1000;
const WINDOW=60*1000,LIMIT=12;
const attempts=globalThis.__tqVoteRateLimit||(globalThis.__tqVoteRateLimit=new Map());
function ipOf(req){return (req.headers.get("x-forwarded-for")||req.headers.get("x-real-ip")||"unknown").split(",")[0].trim()}
function limited(ip){const now=Date.now();const hits=(attempts.get(ip)||[]).filter(t=>now-t<WINDOW);hits.push(now);attempts.set(ip,hits);return hits.length>LIMIT}
function json(error,status=400){return NextResponse.json({error},{status})}

export async function POST(req){
 try{
  const secret=process.env.PAYSTACK_SECRET_KEY;
  if(!secret)return json("Payment service is not configured",503);
  const ip=ipOf(req);if(limited(ip))return json("Too many payment attempts. Please wait a moment and try again.",429);
  let body;try{body=await req.json()}catch{return json("Invalid voting request")}
  const contestantId=String(body.contestantId||"").trim(),roundId=String(body.roundId||"").trim(),email=String(body.email||"").trim().toLowerCase(),name=String(body.name||"").trim();
  const qty=Number(body.quantity);
  if(!contestantId||!roundId||!EMAIL.test(email)||email.length>254||name.length>120||!Number.isInteger(qty)||qty<1||qty>MAX_QTY)return json("Invalid voting request");
  const db=getSupabaseAdmin();
  const {data:round,error:roundError}=await db.from("competition_rounds").select("id,status,voting_enabled,vote_price_kobo").eq("id",roundId).maybeSingle();
  if(roundError)throw roundError;
  const price=Number(round?.vote_price_kobo);
  if(!round||round.status!=="live"||!round.voting_enabled)return json("Voting is not currently open");
  if(!Number.isSafeInteger(price)||price<1)return json("Voting price is not configured",503);
  const {data:member,error:memberError}=await db.from("round_contestants").select("contestant_id").eq("round_id",roundId).eq("contestant_id",contestantId).eq("active",true).maybeSingle();
  if(memberError)throw memberError;if(!member)return json("Contestant is not active in this round");
  const amount=price*qty;if(!Number.isSafeInteger(amount)||amount<1)return json("Invalid voting amount");
  const reference=`TQ-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
  const {error:orderError}=await db.from("vote_orders").insert({reference,round_id:roundId,contestant_id:contestantId,voter_email:email,voter_name:name||null,quantity:qty,amount_kobo:amount,status:"pending"});if(orderError)throw orderError;
  const configured=process.env.NEXT_PUBLIC_SITE_URL;const site=configured&&/^https?:\/\//i.test(configured)?configured.replace(/\/$/,""):new URL(req.url).origin;
  const pay=await fetch("https://api.paystack.co/transaction/initialize",{method:"POST",headers:{Authorization:`Bearer ${secret}`,"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({email,amount:String(amount),reference,callback_url:`${site}/vote/verify?reference=${encodeURIComponent(reference)}`,metadata:{type:"talentquest_vote",round_id:roundId,contestant_id:contestantId,quantity:qty}})});
  const result=await pay.json().catch(()=>({}));if(!pay.ok||!result.status||!result.data?.authorization_url){await db.from("vote_orders").update({status:"failed"}).eq("reference",reference);return json(result.message||"Unable to start payment",502)}
  return NextResponse.json({authorization_url:result.data.authorization_url,reference});
 }catch(e){console.error("vote-initialize",e);return json("Unable to initialize vote payment",500)}
}
