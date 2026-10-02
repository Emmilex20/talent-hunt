export default function BrandLoader({ label = "Loading TalentQuest", compact = false }) {
  return (
    <div className={`tqBrandLoader${compact ? " tqBrandLoaderCompact" : ""}`} role="status" aria-live="polite" aria-label={label}>
      <div className="tqLoaderAura" aria-hidden="true" />
      <div className="tqLoaderContent">
        <div className="tqLoaderMark" aria-hidden="true">
          <span className="tqLoaderOrbit tqLoaderOrbitOne" />
          <span className="tqLoaderOrbit tqLoaderOrbitTwo" />
          <span className="tqLoaderStar">★</span>
        </div>
        <div className="tqLoaderBrand">Talent<span>Quest</span></div>
        <p className="tqLoaderLabel">{label}</p>
        <div className="tqLoaderTrack" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}
