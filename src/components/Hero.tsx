import Iceberg from "./Iceberg";
import WaterSheen from "./WaterSheen";
import Contours from "./Contours";
import { site, zoneAttrs } from "../../content/site";

// Light shafts: fixed, hand-placed values so the composition never changes.
const SHAFTS = [
  { x: "8%", w: "7vw", r: "16deg", delay: "0s" },
  { x: "27%", w: "3.5vw", r: "13deg", delay: "-5s" },
  { x: "46%", w: "10vw", r: "18deg", delay: "-9s" },
  { x: "66%", w: "4vw", r: "14deg", delay: "-3s" },
  { x: "80%", w: "8vw", r: "20deg", delay: "-12s" },
];

export default function Hero() {
  const { hero, contact } = site;
  return (
    <section {...zoneAttrs("home")} className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-inner">
        <div className="hero-meta" aria-hidden="true">
          <span>{hero.annotation}</span>
          <span className="hidden sm:inline">{contact.coordinates}</span>
          <span>Surface · 0 m</span>
        </div>

        <div className="hero-spacer" />

        <div className="surface">
          <div className="sky" aria-hidden="true">
            <Contours
              seed={12}
              width={1600}
              height={700}
              cell={34}
              levels={6}
              scale={1.1}
              minLength={260}
              className="sky-chart"
            />
          </div>

          <div className="water-light" aria-hidden="true" data-pointer-layer="-10">
            {SHAFTS.map((s) => (
              <span
                key={s.x}
                className="shaft"
                style={{ "--x": s.x, "--w": s.w, "--r": s.r, "--delay": s.delay } as React.CSSProperties}
              />
            ))}
            <span className="caustic caustic-a" />
            <span className="caustic caustic-b" />
          </div>

          <div className="iceberg-anchor" data-pointer-layer="8">
            <Iceberg className="iceberg" />
          </div>

          <h1 id="hero-title" className="hero-title">
            <span className="hero-eyebrow">
              <span className="text-[var(--ink)]">{site.name}</span>
              <span aria-hidden="true" className="hero-eyebrow-rule" />
              <span>{hero.eyebrow}</span>
            </span>
            <span className="hero-line hero-line-1">{hero.lineOne}</span>
            {/* The second line is cut by the waterline: the copy above it is the
                real text, the copy below is a refracted, aria-hidden echo. The
                inner spans rise while the clips stay put, so the words surface. */}
            <span className="hero-line-2 split">
              <span className="split-above">
                <span className="rise">{hero.lineTwo}</span>
              </span>
              <span className="split-below" aria-hidden="true">
                <span className="rise">{hero.lineTwo}</span>
              </span>
            </span>
          </h1>

          <span className="waterline" aria-hidden="true" />
          <WaterSheen className="sheen" />
        </div>

        <div className="hero-water">
          <p className="hero-disciplines">
            {hero.disciplines.map((d, i) => (
              <span key={d}>
                {i > 0 && <span aria-hidden="true" className="slash">/</span>}
                {d}
              </span>
            ))}
          </p>
          <p className="hero-lead">{hero.lead}</p>
          <p className="hero-intro">{hero.intro}</p>
          <div className="hero-actions">
            <a href="#work" className="btn-bracket">
              <span aria-hidden="true">[</span>
              <span className="btn-bracket-label">{hero.cta}</span>
              <span aria-hidden="true" className="btn-bracket-arrow">↘</span>
              <span aria-hidden="true">]</span>
            </a>
            <p className="availability">
              <span className="pulse-dot" aria-hidden="true" />
              {site.availability}
            </p>
          </div>
        </div>

        <div className="hero-foot" aria-hidden="true">
          <a href="#descent" className="scroll-cue" tabIndex={-1}>
            <span className="scroll-cue-line" />
            Descend
          </a>
          <span className="hidden md:inline">
            {contact.location} · {contact.coordinates}
          </span>
        </div>
      </div>
    </section>
  );
}
