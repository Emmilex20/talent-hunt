import Link from "next/link";
export const metadata={title:"Application received"};
export default function Success(){return <section className="listingPage"><div className="container"><div className="emptyState"><div>★</div><span className="kicker">APPLICATION RECEIVED</span><h2>Your TalentQuest journey has begun.</h2><p>Our review team will assess your submission. Keep your contact details available for audition and shortlist updates.</p><Link className="button buttonGold" href="/">Return home →</Link></div></div></section>}
