import SectionHead from "./SectionHead";
import Glyph from "./Glyph";
import { site, zoneAttrs } from "../../content/site";

export default function Approach() {
  return (
    <section {...zoneAttrs("approach")} className="section approach" aria-labelledby="approach-title">
      <div className="wrap">
        <SectionHead
          id="approach"
          title={
            <>
              Beneath
              <br /> the surface.
            </>
          }
          intro="How I work, with each principle tied to the place it shows up in the record."
        />
        <ol className="principles">
          {site.principles.map((p, i) => (
            <li key={p.id} className="principle" data-reveal>
              <p className="principle-n t-mono" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </p>
              <div className="principle-text">
                <h3 className="t-title">{p.title}</h3>
                <p className="t-body principle-body">{p.body}</p>
                <p className="principle-practice">
                  <span className="t-label">In practice</span>
                  <span>{p.practice}</span>
                </p>
              </div>
              <Glyph kind={p.glyph} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
