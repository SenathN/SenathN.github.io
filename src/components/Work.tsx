import SectionHead from "./SectionHead";
import DomainMap from "./DomainMap";
import { asset, site, zoneAttrs, type Project } from "../../content/site";

// Projects as editorial plates rather than identical cards. Compositions
// alternate, and every optional field in profile.json (problem, approach,
// architecture, outcome, stack, image, url) appears only when filled in.
function Notes({ p }: { p: Project }) {
  const rows = [
    ["Problem", p.problem],
    ["Approach", p.approach],
    ["Architecture", p.architecture],
    ["Outcome", p.outcome],
  ].filter((r): r is [string, string] => Boolean(r[1]));
  if (!rows.length && !p.stack.length) return null;
  return (
    <dl className="project-notes">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="t-label">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
      {p.stack.length > 0 && (
        <div>
          <dt className="t-label">Stack</dt>
          <dd>
            <ul className="slash-list">
              {p.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </dd>
        </div>
      )}
    </dl>
  );
}

export default function Work() {
  return (
    <section {...zoneAttrs("work")} className="section work" aria-labelledby="work-title">
      <div className="wrap">
        <SectionHead
          id="work"
          title="Selected expeditions."
          intro="Both builds are private, so these plates map the problem each one set out to solve rather than link to it."
        />

        <ol className="projects">
          {site.projects.map((p, i) => {
            const n = String(i + 1).padStart(2, "0");
            const nodes = p.map.nodes.map((x) => x.label);
            const label = `Figure ${n}: a map of the ${p.category.toLowerCase()}'s domain, connecting ${nodes.slice(0, -1).join(", ")} and ${nodes.at(-1)}.`;
            return (
              <li key={p.id} id={p.id} className={`project ${i % 2 ? "is-flipped" : ""}`}>
                <article aria-labelledby={`${p.id}-title`} className="project-grid">
                  <div className="project-text" data-reveal>
                    <p className="project-meta t-label">
                      <span className="accent">Exp. {n}</span>
                      <span>{p.category}</span>
                    </p>
                    <h3 id={`${p.id}-title`} className="project-title">
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="link-line">
                          {p.name}
                          <span aria-hidden="true"> ↗</span>
                        </a>
                      ) : (
                        p.name
                      )}
                    </h3>
                    <p className="project-lead">{p.description}</p>
                    <Notes p={p} />
                    <div className="project-scope">
                      <h4 className="t-label">Scope</h4>
                      <ul className="slash-list">
                        {p.tags.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    {p.status && <p className="project-status t-label">{p.status}</p>}
                  </div>

                  <figure className="project-figure plate" data-reveal style={{ "--d": "140ms" } as React.CSSProperties}>
                    {p.image ? (
                      // Static export: next/image optimisation is off, a plain img is the honest choice.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset(p.image)} alt={`${p.name} screenshot`} loading="lazy" className="w-full h-auto" />
                    ) : (
                      <DomainMap map={p.map} seed={300 + i * 37} label={label} />
                    )}
                    <figcaption className="plate-caption">
                      <span className="t-label accent">Fig. {n}</span>
                      <span className="t-label">{p.image ? p.name : "Domain map, drawn from the project brief"}</span>
                    </figcaption>
                  </figure>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
