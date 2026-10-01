"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import "../vote.css";

export default function VerifyVote(){
 const q=useSearchParams(),reference=q.get("reference")||q.get("trxref");
 const[state,setState]=useState({loading:true});
 useEffect(()=>{if(!reference){setState({loading:false,error:"Missing payment reference"});return}(async()=>{try{const r=await fetch("/api/votes/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference})});const d=await r.json();setState({loading:false,...(r.ok?{data:d}:{error:d.error||"Payment could not be verified"})})}catch{setState({loading:false,error:"We could not verify the payment. Please try again."})}})()},[reference]);
 return <main className="verifyPage"><div className="verifyGlow"/><div className="verifyShell">
  {state.loading?<section className="verifyCard"><div className="verifyIcon loading">★</div><span className="verifyEyebrow">SECURE VERIFICATION</span><h1>Confirming your vote</h1><p className="verifyLead">Please keep this page open for a moment while TalentQuest securely confirms your payment.</p><div className="verifyProgress"><i/></div></section>:
  state.error?<section className="verifyCard"><div className="verifyIcon failed">!</div><span className="verifyEyebrow">PAYMENT STATUS</span><h1>Payment not confirmed</h1><p className="verifyLead">{state.error}</p><div className="verifyActions"><Link href="/vote" className="verifyPrimary">Return to voting <span>→</span></Link></div></section>:
  <section className="verifyCard successCard"><div className="verifyIcon success">✓</div><span className="verifyEyebrow">VOTE CONFIRMED</span><h1>Thank you for<br/><em>your support.</em></h1><p className="verifyLead">Your payment was verified successfully and your votes have been added to the contestant.</p><div className="voteCredited"><span>VOTES CREDITED</span><strong>{state.data.votes}</strong><small>{state.data.votes===1?"verified vote":"verified votes"}</small></div><div className="verifyReference"><span>TRANSACTION REFERENCE</span><strong>{reference}</strong><b>✓ Verified</b></div><div className="verifyActions"><Link href={`/contestants/${state.data.contestantId}`} className="verifyPrimary">View contestant <span>→</span></Link><Link href="/vote" className="verifySecondary">Keep voting</Link></div><p className="verifyFoot">TalentQuest • Secure voting • Payment verified</p></section>}
 </div></main>
}
