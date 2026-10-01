import "./globals.css";
import "./humanize.css";
import SiteChrome from "@/components/SiteChrome";
import{ToastProvider}from "@/components/ToastProvider";
export const metadata={title:{default:"TalentQuest | Discover. Vote. Raise Stars.",template:"%s | TalentQuest"},description:"TalentQuest is a premium talent discovery, performance and public voting platform."};
export default function RootLayout({children}){return <html lang="en"><body><ToastProvider><SiteChrome>{children}</SiteChrome></ToastProvider></body></html>}
