import {NextResponse} from "next/server";
import {getSupabaseAdmin} from "@/lib/supabase-admin";

export async function POST(req){
 try{
  const auth=req.headers.get("authorization")||"";const token=auth.startsWith("Bearer ")?auth.slice(7):"";
  if(!token)return NextResponse.json({error:"Unauthorized"},{status:401});
  const db=getSupabaseAdmin();
  const{data:{user},error:userError}=await db.auth.getUser(token);
  if(userError||!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const{data:profile}=await db.from("profiles").select("role").eq("id",user.id).maybeSingle();
  if(!profile||!["admin","super_admin"].includes(profile.role))return NextResponse.json({error:"Admin access required"},{status:403});
  const{sourceRoundId,destinationRoundId,contestantIds}=await req.json();
  if(!sourceRoundId||!destinationRoundId||sourceRoundId===destinationRoundId||!Array.isArray(contestantIds)||!contestantIds.length)return NextResponse.json({error:"Select a source round, destination round and at least one contestant"},{status:400});
  const ids=[...new Set(contestantIds.filter(Boolean))];
  const[{data:source},{data:destination},{data:sourceMembers}]=await Promise.all([db.from("competition_rounds").select("id,name").eq("id",sourceRoundId).maybeSingle(),db.from("competition_rounds").select("id,name").eq("id",destinationRoundId).maybeSingle(),db.from("round_contestants").select("contestant_id").eq("round_id",sourceRoundId).eq("active",true).in("contestant_id",ids)]);
  if(!source||!destination)return NextResponse.json({error:"Competition round not found"},{status:404});
  const eligible=new Set((sourceMembers||[]).map(x=>x.contestant_id));const valid=ids.filter(id=>eligible.has(id));
  if(!valid.length)return NextResponse.json({error:"Selected contestants are not active in the source round"},{status:400});
  const rows=valid.map(contestant_id=>({round_id:destinationRoundId,contestant_id,active:true}));
  const{error}=await db.from("round_contestants").upsert(rows,{onConflict:"round_id,contestant_id",ignoreDuplicates:false});if(error)throw error;
  return NextResponse.json({ok:true,advanced:valid.length,source:source.name,destination:destination.name});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to advance contestants"},{status:500})}
}
