import Link from "next/link";
import "./system-states.css";

export default function NotFound(){return <main className="systemPage"><section className="systemCard"><span className="systemCode">404</span><h1>This stage is<br/><em>off the map.</em></h1><p>The page you tried to open may have moved, expired, or never existed. You can return to TalentQuest or continue discovering contestants.</p><div className="systemActions"><Link className="systemPrimary" href="/">Return home →</Link><Link className="systemSecondary" href="/contestants">Explore contestants</Link></div></section></main>}
