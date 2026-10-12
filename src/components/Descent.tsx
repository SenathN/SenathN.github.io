import Contours from "./Contours";
import Icon from "./Icon";
import { site, zones, zoneAttrs, zoneRange } from "../../content/site";

const TICKS = Array.from({ length: 21 }, (_, i) => i * 10);

// The short transition from the surface into the page: a depth ruler that
// fills as you pass, contour lines that surface out of the dark, and the
// statement plus its supporting numbers.
export default function Descent() {
  const z = zones.descent;
  return (
    <section {...zoneAttrs("descent")} className="section descent" data-progress aria-labelledby="descent-title">
      <div className="descent-chart" aria-hidden="true">
        <div className="descent-chart-inner" data-parallax="0.18">
          <Contours seed={5} width={1600} height={1100} cell={30} levels={9} scale={1.35} minLength={180} className="h-full w-full" />
        </div>
      </div>

      <div className="wrap descent-grid">
        <div className="ruler" aria-hidden="true">
          <span className="ruler-fill" />
          {TICKS.map((t) => (
            <span key={t} className={`ruler-tick ${t % 50 === 0 ? "is-major" : ""}`} style={{ top: `${(t / 200) * 100}%` }}>
              {t % 50 === 0 && <span className="ruler-label">{t} m</span>}
            </span>
          ))}
        </div>

        <div className="descent-body">
          <div className="section-meta" data-reveal>
            <p className="t-label">
              <span className="accent">{z.index}</span> / {z.label}
            </p>
            <span className="section-rule" aria-hidden="true" />
            <p className="t-label section-zone" aria-hidden="true">
              {z.zone} · {zoneRange("descent")}
            </p>
          </div>

          <h2 id="descent-title" className="t-display descent-statement" data-reveal>
            {site.statement[0]}
          </h2>
          <p className="t-lead descent-sub" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            {site.statement[1]}
          </p>

          <dl className="facts">
            {site.facts.map((f, i) => (
              <div key={f.label} className="fact" data-reveal style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
                <dt className="t-label">
                  <Icon name={f.icon} className="w-3.5 h-3.5" />
                  {f.label}
                </dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="wrap">
        <div className="soundings">
          <h3 id="soundings-title" className="t-label soundings-title" data-reveal>
            Soundings <span className="text-[var(--dim)]">— numbers from the record</span>
          </h3>
          <ul className="soundings-list">
            {site.stats.map((s, i) => {
              const decimals = Number.isInteger(s.value) ? 0 : 1;
              return (
                <li key={s.label} className="sounding" data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
                  <p className="sounding-value">
                    <span data-count={s.value} data-decimals={decimals}>
                      {s.value.toFixed(decimals)}
                    </span>
                    <span className="sounding-suffix">{s.suffix}</span>
                  </p>
                  <p className="sounding-label">{s.label}</p>
                  <p className="t-label sounding-source">{s.source}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
