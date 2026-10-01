import "./globals.css";
import "./humanize.css";
import "./application-security.css";
import "./accessibility.css";
import SiteChrome from "@/components/SiteChrome";
import{ToastProvider}from"@/components/ToastProvider";

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";

export const metadata={
 metadataBase:new URL(siteUrl),
 title:{default:"TalentQuest | Discover. Vote. Raise Stars.",template:"%s | TalentQuest"},
 description:"TalentQuest is a talent discovery, performance and public voting platform where rising stars compete, supporters vote and new talent gets discovered.",
 applicationName:"TalentQuest",
 keywords:["TalentQuest","talent competition","talent discovery","public voting","contestants","Nigeria talent competition"],
 authors:[{name:"TalentQuest"}],
 creator:"TalentQuest",
 publisher:"TalentQuest",
 category:"entertainment",
 formatDetection:{email:false,address:false,telephone:false},
 alternates:{canonical:"/"},
 openGraph:{type:"website",locale:"en_NG",url:"/",siteName:"TalentQuest",title:"TalentQuest | Discover. Vote. Raise Stars.",description:"Discover rising talent, follow the competition and support your favourite contestants on TalentQuest."},
 twitter:{card:"summary_large_image",title:"TalentQuest | Discover. Vote. Raise Stars.",description:"Discover rising talent, follow the competition and support your favourite contestants on TalentQuest."},
 robots:{index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}},
 icons:{icon:[{url:"/icon.svg",type:"image/svg+xml"}],shortcut:"/icon.svg",apple:"/apple-icon.svg"}
};

export const viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#08090d",colorScheme:"dark"};

export default function RootLayout({children}){return <html lang="en"><body><ToastProvider><SiteChrome>{children}</SiteChrome></ToastProvider></body></html>}
