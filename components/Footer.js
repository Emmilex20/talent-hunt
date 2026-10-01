import Link from "next/link";

export default function Footer() {
  return <footer className="footer"><div className="container footerGrid"><div><Link href="/" className="brand"><span className="brandStar">★</span><span>Talent<b>Quest</b></span></Link><p>Discover · Vote · Support · Raise Stars</p></div><div className="footerLinks"><Link href="/#talents">Talents</Link><Link href="/#how">How it works</Link><Link href="/#apply">Apply</Link></div><div className="footerRight">© {new Date().getFullYear()} TalentQuest. All rights reserved.</div></div></footer>;
}
