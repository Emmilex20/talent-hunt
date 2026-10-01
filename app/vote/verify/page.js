"use client";
import Link from "next/link";
import {Suspense,useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import "../vote.css";

const PENDING_KEY="talentquest_pending_vote";

function VerificationLoading(){return <main className="verifyPage"><div className="verifyGlow"/><div className="verifyShell"><section className="verifyCard"><div className="verifyIcon loading">★</div><span className="verifyEyebrow">SECURE VERIFICATION</span><h1>Preparing verification</h1><p className="verifyLead">Please keep this page open while TalentQuest prepares to confirm your payment.</p><div className="verifyProgress"><i/></div></section></div></main>}

function VerifyVoteContent(){
 const q=useSearchParams();
 const queryReference=q.get("reference")||q.get("trxref");
 const[reference,setReference]=useState(queryReference||"");
 const[state,setState]=useState({loading:true});
 useEffect(()=>{let ref=queryReference;if(!ref){try{const pending=JSON.parse(localStorage.getItem(PENDING_KEY)||"null");if(pending?.reference&&Date.now()-(pending.createdAt||0)<24*60*60*1000)ref=pending.reference}catch{}}if(!ref){setState({loading:false,error:"Missing payment reference"});return}setReference(ref);let cancelled=false;(async()=>{try{const r=await fetch("/api/votes/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference:ref})});const d=await r.json();if(cancelled)return;if(r.ok){try{localStorage.removeItem(PENDING_KEY)}catch{}setState({loading:false,data:d})}else setState({loading:false,error:d.error||"Payment could not be verified"})}catch{if(!cancelled)setState({loading:false,error:"We could not verify the payment. Please try again."})}})();return()=>{cancelled=true}},[queryReference]);
 function retry(){if(!reference)return;setState({loading:true});fetch("/api/votes/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference})}).then(async r=>({r,d:await r.json()})).then(({r,d})=>{if(r.ok){try{localStorage.removeItem(PENDING_KEY)}catch{}setState({loading:false,data:d})}else setState({loading:false,error:d.error||"Payment could not be verified"})}).catch(()=>setState({loading:false,error:"We could not verify the payment. Please try again."}))}
 return <main className="verifyPage"><div className="verifyGlow"/><div className="verifyShell">
  {state.loading?<section className="verifyCard"><div className="verifyIcon loading">★</div><span className="verifyEyebrow">SECURE VERIFICATION</span><h1>Confirming your vote</h1><p className="verifyLead">Please keep this page open for a moment while TalentQuest securely confirms your payment.</p><div className="verifyProgress"><i/></div></section>:
  state.error?<section className="verifyCard"><div className="verifyIcon failed">!</div><span className="verifyEyebrow">PAYMENT STATUS</span><h1>Payment not confirmed</h1><p className="verifyLead">{state.error}</p>{reference&&<p className="verifyLead">If you completed payment, you can safely retry verification. A successful payment will never be credited twice.</p>}<div className="verifyActions">{reference&&<button type="button" className="verifyPrimary" onClick={retry}>Retry verification <span>→</span></button>}<Link href="/vote" className="verifySecondary">Return to voting</Link></div></section>:
  <section className="verifyCard successCard"><div className="verifyIcon success">✓</div><span className="verifyEyebrow">VOTE CONFIRMED</span><h1>Thank you for<br/><em>your support.</em></h1><p className="verifyLead">Your payment was verified successfully and your votes have been added to the contestant.</p><div className="voteCredited"><span>VOTES CREDITED</span><strong>{state.data.votes}</strong><small>{state.data.votes===1?"verified vote":"verified votes"}</small></div><div className="verifyReference"><span>TRANSACTION REFERENCE</span><strong>{reference}</strong><b>✓ Verified</b></div><div className="verifyActions"><Link href={`/contestants/${state.data.contestantId}`} className="verifyPrimary">View contestant <span>→</span></Link><Link href="/vote" className="verifySecondary">Keep voting</Link></div><p className="verifyFoot">TalentQuest • Secure voting • Payment verified</p></section>}
 </div></main>
}

export default function VerifyVote(){return <Suspense fallback={<VerificationLoading/>}><VerifyVoteContent/></Suspense>}
