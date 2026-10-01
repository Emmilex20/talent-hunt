import "./globals.css";
import "./humanize.css";
import SiteChrome from "@/components/SiteChrome";
export const metadata={title:{default:"TalentQuest | Discover. Vote. Raise Stars.",template:"%s | TalentQuest"},description:"TalentQuest is a premium talent discovery, performance and public voting platform."};
export default function RootLayout({children}){return <html lang="en"><body><SiteChrome>{children}</SiteChrome></body></html>}
