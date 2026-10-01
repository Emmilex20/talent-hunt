"use client";
import Link from "next/link";
import {useEffect,useState,use} from "react";
import {getSupabase} from "@/lib/supabase";
import "./profile.css";

export default function ContestantProfile({params}){
  const {id}=use(params);
  const [c,setC]=useState(null),[loading,setLoading]=useState(true);
  useEffect(()=>{(async()=>{const s=getSupabase();if(!s){setLoading(false);return}const {data}=await s.from("contestants").select("*").eq("id",id).eq("active",true).maybeSingle();setC(data);setLoading(false)})()},[id]);
  if(loading)return <section className="profilePage"><div className="container profileLoading">Loading contestant…</div></section>;
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
        <div><span className="kicker">PUBLIC VOTING</span><h2>Support your favourite <em>talent.</em></h2><p>Voting will open when the official competition round begins. Every verified vote will count toward the contestant's journey.</p></div>
        <div className="voteComing"><span>★</span><div><small>VOTING STATUS</small><strong>Opening soon</strong></div></div>
      </section>
    </div>
  </main>
}
