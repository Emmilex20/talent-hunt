"use client";
import {usePathname} from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteChrome({children}){
  const p=usePathname();
  const appShell=p.startsWith("/admin")||p==="/admin-login"||p.startsWith("/portal");

  return <>
    <a className="skipLink" href="#main-content">Skip to main content</a>
    {!appShell&&<Header/>}
    <main id="main-content" tabIndex="-1">{children}</main>
    {!appShell&&<Footer/>}
  </>;
}
