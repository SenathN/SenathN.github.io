import Contours from "./Contours";
import Icon from "./Icon";
import { site, zones, zoneAttrs, zoneRange } from "../../content/site";

// The deepest point of the page: near-black water, one restrained light
// field, a trench drawn as concentric contours, and the way to get in touch.
const trench = (x: number, y: number) => -Math.hypot((x - 1180) / 620, (y - 620) / 380) * 1.4;

export default function Contact() {
  const { contact, closing } = site;
  const z = zones.contact;
  return (
    <section {...zoneAttrs("contact")} className="section abyss" aria-labelledby="contact-title">
      <div className="abyss-light" aria-hidden="true" />
      <div className="abyss-chart" aria-hidden="true">
        <Contours seed={77} width={1600} height={1000} cell={24} levels={14} scale={0.9} bias={trench} minLength={120} className="h-full w-full" />
      </div>

      <div className="wrap relative">
        <div className="section-meta" data-reveal>
          <p className="t-label">
            <span className="accent">{z.index}</span> / {z.label}
          </p>
          <span className="section-rule" aria-hidden="true" />
          <p className="t-label section-zone" aria-hidden="true">
            {z.zone} · {zoneRange("contact")}
          </p>
        </div>

        <h2 id="contact-title" className="t-hero abyss-title" data-reveal>
          <span className="block">{closing.lineOne}</span>
          <span className="block abyss-title-2">{closing.lineTwo}</span>
        </h2>
        <p className="t-lead abyss-copy" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
          {closing.copy}
        </p>

        <a href={`mailto:${contact.email}`} className="abyss-email" data-reveal style={{ "--d": "200ms" } as React.CSSProperties}>
          <span className="abyss-email-text">{contact.email}</span>
          <span className="abyss-email-icon" aria-hidden="true">
            <Icon name="arrow" className="w-5 h-5 md:w-6 md:h-6" />
          </span>
        </a>

        <div className="abyss-grid" data-reveal style={{ "--d": "260ms" } as React.CSSProperties}>
          <ul className="abyss-links">
            {contact.socials.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="abyss-link">
                  <Icon name={s.icon} className="w-4 h-4" />
                  <span>{s.label}</span>
                  <span className="abyss-link-meta">{s.handle}</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
            <li>
              <a href={site.art.url} target="_blank" rel="noopener noreferrer" className="abyss-link">
                <Icon name="cube" className="w-4 h-4" />
                <span>CGTrader</span>
                <span className="abyss-link-meta">3D portfolio</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={site.cvHref} download className="abyss-link">
                <Icon name="download" className="w-4 h-4" />
                <span>{site.cv.label}</span>
                <span className="abyss-link-meta">PDF</span>
              </a>
            </li>
            {contact.showPhone && (
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="abyss-link">
                  <Icon name="phone" className="w-4 h-4" />
                  <span>{contact.phone}</span>
                </a>
              </li>
            )}
          </ul>

          <dl className="abyss-meta">
            <div>
              <dt className="t-label">Based in</dt>
              <dd>{contact.location}</dd>
            </div>
            <div>
              <dt className="t-label">Languages</dt>
              <dd>{site.languages.map((l) => l.name).join(" · ")}</dd>
            </div>
            <div>
              <dt className="t-label">Status</dt>
              <dd className="inline-flex items-center gap-2.5">
                <span className="pulse-dot" aria-hidden="true" />
                {site.availability}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="wrap site-foot-inner">
        <p className="site-foot-name">{site.name}</p>
        <p>{site.hero.kicker}</p>
        <p>&copy; {new Date().getFullYear()}</p>
        <a href="#home" className="site-foot-top">
          Return to the surface <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
