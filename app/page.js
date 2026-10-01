import Link from "next/link";

const talents = [
  ["Singing", "Powerful voices. Unforgettable moments.", "♪"],
  ["Dance", "Movement, energy and stories on stage.", "✦"],
  ["Comedy", "Fresh voices making Africa laugh.", "☺"],
  ["Acting", "Screen and stage performers worth watching.", "◈"],
  ["Spoken Word", "Poetry, storytelling and expression.", "❞"],
  ["Instrumental", "Musicians turning skill into magic.", "♫"],
];

const steps = [
  ["01", "Discover", "Meet emerging performers across multiple talent categories."],
  ["02", "Watch", "Experience contestant profiles, auditions and round-by-round performances."],
  ["03", "Vote", "Support your favourites through transparent public voting."],
  ["04", "Raise stars", "Help outstanding talent move from discovery to the grand stage."],
];

export default function Home() {
  return (
    <>
      <section className="hero" id="home">
        <div className="heroGlow heroGlowOne" />
        <div className="heroGlow heroGlowTwo" />
        <div className="container heroGrid">
          <div className="heroCopy">
            <div className="eyebrow"><span>★</span> Nigeria&apos;s stage for extraordinary talent</div>
            <h1>Where raw talent becomes a <em>star.</em></h1>
            <p className="heroText">Discover incredible performers, follow their journey and give your favourites the votes that can take them all the way to the grand finale.</p>
            <div className="heroActions">
              <Link href="#talents" className="button buttonGold">Explore talent <span>→</span></Link>
              <Link href="#how" className="button buttonGhost">How it works</Link>
            </div>
            <div className="trustRow">
              <span><b>6+</b> talent categories</span><i />
              <span><b>Live</b> competition rounds</span><i />
              <span><b>Secure</b> voting</span>
            </div>
          </div>
          <div className="stageCard" aria-label="TalentQuest spotlight">
            <div className="stageRings"><span /><span /><span /></div>
            <div className="starMark">★</div>
            <div className="performer performerOne">♪</div>
            <div className="performer performerTwo">✦</div>
            <div className="performer performerThree">♫</div>
            <div className="stageWord">TALENT<span>QUEST</span></div>
            <p>DISCOVER · VOTE · SUPPORT · RAISE STARS</p>
          </div>
        </div>
        <div className="scrollCue">SCROLL TO DISCOVER <span>↓</span></div>
      </section>

      <section className="section intro" id="talents">
        <div className="container">
          <div className="sectionHeading centered">
            <span className="kicker">THE STAGE IS YOURS</span>
            <h2>Every talent deserves <span>a spotlight.</span></h2>
            <p>TalentQuest celebrates creativity in all its forms. Pick a category, discover contestants and follow the performances that move you.</p>
          </div>
          <div className="talentGrid">
            {talents.map(([title, copy, icon]) => (
              <article className="talentCard" key={title}>
                <div className="talentIcon">{icon}</div><h3>{title}</h3><p>{copy}</p><span className="cardLink">Discover <b>→</b></span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section darkSection" id="how">
        <div className="container">
          <div className="sectionHeading splitHeading">
            <div><span className="kicker">THE JOURNEY</span><h2>From first audition to <span>final spotlight.</span></h2></div>
            <p>TalentQuest turns a competition into a story audiences can follow from discovery through every performance, vote and elimination.</p>
          </div>
          <div className="stepsGrid">
            {steps.map(([number, title, copy]) => <article className="step" key={number}><span>{number}</span><div className="stepDot">★</div><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section ctaSection" id="apply">
        <div className="container ctaCard">
          <div><span className="kicker">YOUR MOMENT IS COMING</span><h2>Think you have what it takes?</h2><p>TalentQuest applications are opening soon. Get ready to show Nigeria what you can do.</p></div>
          <Link href="mailto:hello@talentquest.ng" className="button buttonGold">Get launch updates <span>→</span></Link>
        </div>
      </section>
    </>
  );
}
