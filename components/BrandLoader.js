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
      <style jsx>{`
        .tqBrandLoader{position:relative;isolation:isolate;width:min(420px,calc(100vw - 40px));min-height:330px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:46px 32px;overflow:hidden;border:1px solid rgba(222,177,69,.2);border-radius:28px;background:linear-gradient(145deg,rgba(20,21,28,.96),rgba(10,11,16,.98));box-shadow:0 30px 90px rgba(0,0,0,.42),inset 0 1px rgba(255,255,255,.035);color:#f5f1e8;text-align:center}
        .tqLoaderGlow{position:absolute;z-index:-1;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(222,171,52,.18),rgba(222,171,52,.04) 42%,transparent 70%);filter:blur(8px);animation:tqGlow 2.2s ease-in-out infinite}
        .tqLoaderMark{position:relative;width:122px;height:122px;display:grid;place-items:center;margin-bottom:27px}
        .tqLoaderOrbit{position:absolute;border-radius:50%;border:1px solid rgba(225,178,65,.25)}
        .tqLoaderOrbitOne{inset:3px;border-top-color:#edc45b;border-right-color:rgba(225,178,65,.5);animation:tqSpin 1.8s linear infinite}
        .tqLoaderOrbitTwo{inset:17px;border-bottom-color:#c58b22;border-left-color:rgba(225,178,65,.55);animation:tqSpinReverse 1.25s linear infinite}
        .tqLoaderStar{width:58px;height:58px;display:grid;place-items:center;font-size:37px;line-height:1;color:#efbd43;text-shadow:0 0 24px rgba(239,189,67,.38);animation:tqStar 1.65s ease-in-out infinite}
        .tqLoaderBrand strong{display:block;font-size:27px;line-height:1;font-weight:850;letter-spacing:-1.3px}.tqLoaderBrand strong span{color:#dfac38}.tqLoaderBrand p{margin:12px 0 0;color:#858791;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}
        .tqLoaderTrack{width:170px;height:2px;margin-top:28px;overflow:hidden;border-radius:999px;background:#292a31}.tqLoaderTrack span{display:block;width:45%;height:100%;border-radius:inherit;background:linear-gradient(90deg,transparent,#efc052,transparent);animation:tqTrack 1.35s ease-in-out infinite}
        @keyframes tqSpin{to{transform:rotate(360deg)}}@keyframes tqSpinReverse{to{transform:rotate(-360deg)}}@keyframes tqGlow{50%{transform:scale(1.12);opacity:.72}}@keyframes tqStar{50%{transform:scale(.9);opacity:.78}}@keyframes tqTrack{0%{transform:translateX(-120%)}100%{transform:translateX(340%)}}
        @media(max-width:600px){.tqBrandLoader{width:min(350px,calc(100vw - 32px));min-height:300px;padding:38px 22px;border-radius:22px}.tqLoaderMark{width:108px;height:108px}.tqLoaderBrand strong{font-size:25px}.tqLoaderBrand p{font-size:10px;line-height:1.5}}
        @media(prefers-reduced-motion:reduce){.tqLoaderGlow,.tqLoaderOrbit,.tqLoaderStar,.tqLoaderTrack span{animation:none}}
      `}</style>
    </div>
  );
}
