import SectionHead from "./SectionHead";
import Specimen from "./Specimen";
import { icebergMesh, meshEdges, projectWire, SPECIMEN_SEED } from "@/lib/iceberg";
import { site, zoneAttrs } from "../../content/site";

// Static wireframe for the server render and no-JS visitors.
function StaticSpecimen() {
  const mesh = icebergMesh(SPECIMEN_SEED);
  const pts = projectWire(mesh, 0.6, 560, 520);
  const r = (v: number) => Math.round(v * 10) / 10;
  return (
    <svg viewBox="0 0 560 520" className="w-full h-full" aria-hidden="true" focusable="false">
      <g fill="none" strokeWidth="1">
        {meshEdges(mesh).map(([a, b], i) => {
          const p = pts[a];
          const q = pts[b];
          const under = p.under || q.under;
          return (
            <line
              key={i}
              x1={r(p.x)}
              y1={r(p.y)}
              x2={r(q.x)}
              y2={r(q.y)}
              stroke={under ? "#43c6c9" : "#eaf3ee"}
              strokeOpacity={under ? 0.3 : 0.5}
            />
          );
        })}
      </g>
    </svg>
  );
}

export default function FieldNotes() {
  const { art } = site;
  const mesh = icebergMesh(SPECIMEN_SEED);
  return (
    <section {...zoneAttrs("notes")} className="section notes" aria-labelledby="notes-title">
      <div className="wrap">
        <SectionHead id="notes" title="Form, since 2016." intro={`${art.statement} Kept up outside of work as a self-taught 3D artist.`} />

        <div className="notes-grid">
          <figure className="specimen plate" data-reveal>
            <Specimen>
              <StaticSpecimen />
            </Specimen>
            <figcaption className="plate-caption">
              <span className="t-label accent">Specimen 06-A</span>
              <span className="t-label">
                Low-poly ice · {mesh.faces.length} faces · {mesh.vertices.length} vertices
              </span>
            </figcaption>
          </figure>

          <div className="note" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            <p className="t-label">Note 01 · Self-taught 3D</p>
            <p className="note-figure">
              <span data-count={art.count} data-decimals={0}>
                {art.count}
              </span>
            </p>
            <p className="note-caption">{art.caption}</p>
            <p className="t-body">{art.detail}</p>

            <h3 className="t-label note-subhead">Tools</h3>
            <ul className="slash-list">
              {art.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <a href={art.url} target="_blank" rel="noopener noreferrer" className="btn-bracket note-link">
              <span aria-hidden="true">[</span>
              <span className="btn-bracket-label">View models on CGTrader</span>
              <span className="sr-only">(opens in a new tab)</span>
              <span aria-hidden="true" className="btn-bracket-arrow">↗</span>
              <span aria-hidden="true">]</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
