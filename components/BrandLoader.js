export default function BrandLoader({ label = "Loading TalentQuest" }) {
  return (
    <div className="tqBrandLoader" role="status" aria-live="polite" aria-label={label}>
      <div className="tqLoaderGlow" aria-hidden="true" />
      <div className="tqLoaderMark" aria-hidden="true">
        <span className="tqLoaderOrbit tqLoaderOrbitOne" />
        <span className="tqLoaderOrbit tqLoaderOrbitTwo" />
        <span className="tqLoaderStar">★</span>
      </div>
      <div className="tqLoaderBrand">
        <strong>Talent<span>Quest</span></strong>
        <p>{label}</p>
      </div>
      <div className="tqLoaderTrack" aria-hidden="true"><span /></div>
    </div>
  );
}
