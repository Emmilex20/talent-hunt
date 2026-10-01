import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export const metadata={title:{default:"TalentQuest | Discover. Vote. Raise Stars.",template:"%s | TalentQuest"},description:"TalentQuest is a premium talent discovery, performance and public voting platform."};
export default function RootLayout({children}){return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html>}
