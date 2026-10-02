"use client";
import Link from "next/link";
import {useEffect,useState,use} from "react";
import {getSupabase} from "@/lib/supabase";
import BrandLoader from "@/components/BrandLoader";
import "./profile.css";

export default function ContestantProfile({params}){
  const {id}=use(params);
  const [c,setC]=useState(null),[liveRound,setLiveRound]=useState(null),[loading,setLoading]=useState(true);
  useEffect(()=>{(async()=>{
    const s=getSupabase();if(!s){setLoading(false);return}
    const {data:contestant}=await s.from("contestants").select("*").eq("id",id).eq("active",true).maybeSingle();
    setC(contestant||null);
    if(contestant){
      const {data:memberships}=await s.from("round_contestants").select("round_id").eq("contestant_id",id).eq("active",true);
      const roundIds=(memberships||[]).map(x=>x.round_id);
      if(roundIds.length){
        const {data:rounds}=await s.from("competition_rounds").select("*").in("id",roundIds).eq("status","live").eq("voting_enabled",true).order("created_at",{ascending:false}).limit(1);
        setLiveRound(rounds?.[0]||null);
      }
    }
    setLoading(false);
  })()},[id]);
  if(loading)return <main className="tqLoadingPage"><BrandLoader label="Preparing contestant profile" /></main>;
  if(!c)return <section className="profilePage"><div className="container emptyState"><h2>Contestant not found</h2><Link href="/contestants">← All contestants</Link></div></section>;
  const name=c.stage_name||c.full_name;
  return <main className="profilePage">
    <div className="profileGlow profileGlowOne"/><div className="profileGlow profileGlowTwo"/>
    <div className="container">
      <Link href="/contestants" className="backLink">← Back to contestants</Link>
      <section className="profileHero">
        <div className="profileVisual">
          {c.photo_url?<img src={c.photo_url} alt={name}/>:<div className="profileFallback"><span>★</span><small>TALENTQUEST</small></div>}
          <div className="profileVisualShade"/>
          <div className="profileNumber"><small>CONTESTANT</small><b>{c.contestant_number||"TQ"}</b></div>
        </div>
        <div className="profileCopy">
          <div className="profileTopline"><span className="kicker">{c.category}</span><i>● LIVE PROFILE</i></div>
          <h1>{name}</h1>
          {c.stage_name&&c.full_name!==c.stage_name&&<p className="realName">{c.full_name}</p>}
          <div className="profileRule"/>
          <span className="profileAboutLabel">ABOUT THE TALENT</span>
          <p className="profileBio">{c.bio||"This contestant is ready to take the TalentQuest stage."}</p>
          <div className="profileActions">
            {c.video_url&&<a className="button buttonGold" href={c.video_url} target="_blank" rel="noreferrer">▶ Watch performance</a>}
            <Link className="button buttonGhost" href="/contestants">Explore contestants</Link>
          </div>
          <div className="profileFacts"><div><small>Talent</small><b>{c.category}</b></div><div><small>Contestant ID</small><b>{c.contestant_number||"TQ"}</b></div><div><small>Status</small><b className="activeText">● Active</b></div></div>
        </div>
      </section>
      <section className="profileVote">
        <div><span className="kicker">PUBLIC VOTING</span><h2>Support your favourite <em>talent.</em></h2><p>{liveRound?`${liveRound.name} voting is live. Every verified vote counts toward this contestant's journey.`:"Voting will open when this contestant enters an official live competition round."}</p></div>
        {liveRound?<Link className="voteComing" href={`/vote/${c.id}?round=${liveRound.id}`}><span>★</span><div><small>VOTING STATUS</small><strong>Vote now →</strong></div></Link>:<div className="voteComing"><span>★</span><div><small>VOTING STATUS</small><strong>Opening soon</strong></div></div>}
      </section>
    </div>
  </main>
}
