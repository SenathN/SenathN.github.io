import SectionHead from "./SectionHead";
import { site, zoneAttrs } from "../../content/site";

// The light section: a printed log sheet. Experience entries carry the ids
// that the capability layers link to as evidence.
function span(roles: { period: string }[]) {
  const end = roles[0].period.split("—")[1]?.trim();
  const start = roles[roles.length - 1].period.split("—")[0]?.trim();
  return `${start} — ${end}`;
}

export default function Logbook() {
  return (
    <section {...zoneAttrs("log")} className="section tone-light surfacing" data-reveal data-opaque aria-labelledby="log-title">
      <div className="log-grid-bg" aria-hidden="true" />
      <div className="wrap relative">
        <SectionHead id="log" title="Where the work happened." intro="Two companies, three roles, and the study behind them." />

        <ol className="ledger">
          {site.experience.map((job, i) => (
            <li key={job.id} id={job.id} className="ledger-row" data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
              <p className="ledger-when t-mono">{span(job.roles)}</p>
              <div className="ledger-who">
                <h3 className="t-title">{job.company}</h3>
                <ul className="ledger-roles">
                  {job.roles.map((r) => (
                    <li key={r.title}>
                      <span>{r.title}</span>
                      <span className="t-mono">{r.period}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <ol className="ledger-entries">
                {job.points.map((p, k) => (
                  <li key={p}>
                    <span className="t-mono ledger-n" aria-hidden="true">
                      {String(k + 1).padStart(2, "0")}
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>

        <div className="ledger-secondary">
          <h3 className="t-label ledger-heading" data-reveal>
            Education
          </h3>
          <ol className="ledger ledger-compact">
            {site.education.map((e) => (
              <li key={e.degree} className="ledger-row" data-reveal>
                <p className="ledger-when t-mono">{e.period}</p>
                <div className="ledger-who">
                  <p className="ledger-degree">{e.degree}</p>
                  <p className="ledger-school">{e.school}</p>
                </div>
                {e.note ? <p className="ledger-note t-mono">{e.note}</p> : <span aria-hidden="true" />}
              </li>
            ))}
          </ol>

          <div className="ledger-languages" data-reveal>
            <h3 className="t-label">Languages</h3>
            <ul>
              {site.languages.map((l) => (
                <li key={l.name}>
                  {l.name} <span className="t-mono">{l.level}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
