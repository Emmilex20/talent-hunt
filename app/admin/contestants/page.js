"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {getSupabase} from "@/lib/supabase";

export default function ContestantsAdmin(){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true);
 async function load(){const s=getSupabase();if(!s){setLoading(false);return}const {data}=await s.from("contestants").select("*").order("created_at",{ascending:false});setRows(data||[]);setLoading(false)}
 useEffect(()=>{load()},[]);
 async function toggle(c){const s=getSupabase();await s.from("contestants").update({active:!c.active}).eq("id",c.id);load()}
 const published=rows.filter(x=>x.active).length;
 return <div className="adminPage">
  <div className="adminHero"><div><span className="goldLabel">TALENT MANAGEMENT</span><h1>Contestants</h1><p>Manage approved performers, profile visibility and contestant numbers.</p></div><Link href="/admin/applications" className="adminPrimary">Review applications <span>→</span></Link></div>
  <div className="miniStats"><article><span>Total talent</span><strong>{rows.length}</strong></article><article><span>Published</span><strong>{published}</strong></article><article><span>Hidden</span><strong>{rows.length-published}</strong></article></div>
  <section className="panel contestantsPanel"><div className="panelTitle"><div><span className="goldLabel">ROSTER</span><h2>Competition talent</h2></div><span className="panelHint">Approved applications appear here automatically</span></div>
  <div className="dataTable contestantsTable"><div className="dataRow head"><span>Contestant</span><span>Number</span><span>Category</span><span>Visibility</span><span>Joined</span><span>Action</span></div>
  {loading?<div className="emptyAdmin">Loading contestants…</div>:rows.length===0?<div className="emptyAdmin"><div className="emptyStar">★</div><b>No contestants yet</b><p>Approve an application and the contestant will appear here automatically.</p><Link href="/admin/applications">Review applications →</Link></div>:rows.map(c=><div className="dataRow" key={c.id}><span className="personCell"><i>{(c.stage_name||c.full_name).slice(0,2).toUpperCase()}</i><span><b>{c.stage_name||c.full_name}</b><small>{c.full_name}</small></span></span><span className="numberTag">{c.contestant_number||"—"}</span><span>{c.category}</span><span><em className={`pill ${c.active?"approved":"rejected"}`}>{c.active?"Published":"Hidden"}</em></span><span>{new Date(c.created_at).toLocaleDateString()}</span><span><button className="tableAction" onClick={()=>toggle(c)}>{c.active?"Unpublish":"Publish"}</button></span></div>)}</div></section>
 </div>
}
