"use client";
import {usePathname} from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export default function SiteChrome({children}){const p=usePathname();const admin=p.startsWith("/admin")||p==="/admin-login";return <>{!admin&&<Header/>}<main>{children}</main>{!admin&&<Footer/>}</>}
