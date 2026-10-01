"use client";
import Link from "next/link";
import {useEffect} from "react";
import "./system-states.css";

export default function Error({error,reset}){useEffect(()=>{console.error("TalentQuest route error",error)},[error]);return <main className="systemPage"><section className="systemCard"><span className="systemCode">ERROR</span><h1>Something missed<br/><em>its cue.</em></h1><p>TalentQuest could not finish loading this screen. Your payment or account data has not been changed simply because this page failed to render.</p><div className="systemActions"><button className="systemPrimary" type="button" onClick={()=>reset()}>Try again →</button><Link className="systemSecondary" href="/">Return home</Link></div></section></main>}
