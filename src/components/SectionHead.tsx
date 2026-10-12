import { zones, zoneRange, type ZoneId } from "../../content/site";

export default function SectionHead({
  id,
  title,
  intro,
  className = "",
}: {
  id: ZoneId;
  title: React.ReactNode;
  intro?: React.ReactNode;
  className?: string;
}) {
  const z = zones[id];
  return (
    <header className={`section-head ${className}`}>
      <div className="section-meta" data-reveal>
        <p className="t-label">
          <span className="accent">{z.index}</span> / {z.label}
        </p>
        <span className="section-rule" aria-hidden="true" />
        <p className="t-label section-zone" aria-hidden="true">
          {z.zone} · {zoneRange(id)}
        </p>
      </div>
      <h2 id={`${id}-title`} className="t-display section-title" data-reveal>
        {title}
      </h2>
      {intro && (
        <p className="t-lead section-intro" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
          {intro}
        </p>
      )}
    </header>
  );
}
