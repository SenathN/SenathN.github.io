import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import RangeAccordion from "@/components/RangeAccordion";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import { Reveal, CountUp, Spotlight, WireCube } from "@/components/Interactive";
import { site } from "../../content/site";

function SectionHead({ index, label, title }: { index: string; label: string; title: React.ReactNode }) {
  return (
    <Reveal className="mb-14 md:mb-20">
      <p className="label mb-5">
        <span className="text-[var(--accent)]">{index}/</span>
        {label}
      </p>
      <h2 className="display-lg max-w-4xl">{title}</h2>
    </Reveal>
  );
}

export default function Home() {
  const tools = site.range.flatMap((r) => r.tools.filter((t) => !/since/i.test(t)));

  return (
    <>
      <Nav />
      <main id="main">
        <Hero />

        {/* tool marquee */}
        <div className="marquee overflow-hidden border-y border-[var(--line)] py-5" aria-hidden="true">
          <div className="marquee-track">
            {[...tools, ...tools].map((t, i) => (
              <span key={i} className="display-md text-[var(--dim)] px-8 flex items-center gap-8">
                {t}
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--dim)]" />
              </span>
            ))}
          </div>
        </div>

        {/* range */}
        <section id="range" className="container-px max-content py-28 md:py-40">
          <SectionHead
            index="02"
            label="Range"
            title={
              <>
                One engineer, <span className="text-[var(--accent)]">four disciplines.</span>
              </>
            }
          />
          <Reveal>
            <RangeAccordion />
          </Reveal>
        </section>

        {/* statement + stats */}
        <section id="about" className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="dot-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
          <div className="relative container-px max-content py-28 md:py-40">
            <Reveal>
              <p className="label mb-8">
                <span className="text-[var(--accent)]">{"//"}</span> About
              </p>
              <p className="display-lg max-w-5xl">
                {site.statement[0]} <span className="text-[var(--muted)]">{site.statement[1]}</span>
              </p>
            </Reveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 mt-20 md:mt-28 border-t border-[var(--line)]">
              {site.stats.map((s, i) => (
                <Reveal
                  key={s.label}
                  delay={i * 90}
                  className="pt-8 pb-4 pr-6 border-[var(--line)] [&:not(:last-child)]:lg:border-r lg:pl-6 lg:first:pl-0"
                >
                  <p className="font-condensed font-bold text-5xl md:text-7xl tracking-tight">
                    <CountUp value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="label mt-3">{s.label}</p>
                </Reveal>
              ))}
            </div>

            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line)] border border-[var(--line)] mt-16">
              {site.facts.map((f, i) => (
                <Reveal as="li" key={f.label} delay={i * 80} className="bg-[var(--bg)] p-6 flex gap-4 items-start">
                  <Icon name={f.icon} className="w-5 h-5 mt-0.5 shrink-0 text-[var(--muted)]" />
                  <div>
                    <p className="label mb-1.5">{f.label}</p>
                    <p className="text-sm text-[var(--ink)]">{f.value}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* work */}
        <section id="work" className="container-px max-content py-28 md:py-40">
          <SectionHead
            index="03"
            label="Experience"
            title={
              <>
                Where I&rsquo;ve <span className="text-[var(--accent)]">shipped.</span>
              </>
            }
          />

          <div className="border-b border-[var(--line)]">
            {site.experience.map((job) => (
              <Reveal key={job.company} className="row-hover border-t border-[var(--line)] py-10 md:py-12 grid md:grid-cols-12 gap-6">
                <div className="md:col-span-5">
                  <h3 className="display-md">{job.company}</h3>
                  <ul className="mt-4 space-y-1.5">
                    {job.roles.map((r) => (
                      <li key={r.title} className="mono text-xs flex flex-wrap gap-x-3">
                        <span className="text-[var(--ink)]">{r.title}</span>
                        <span className="text-[var(--muted)]">{r.period}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <ul className="md:col-span-7 space-y-3">
                  {job.points.map((p) => (
                    <li key={p} className="flex gap-4 text-[var(--muted)] md:text-lg">
                      <span className="mono text-[var(--dim)] select-none">→</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <p className="label mt-24 mb-8">
            <span className="text-[var(--accent)]">{"//"}</span> Education
          </p>
          <ol className="border-b border-[var(--line)]">
            {site.education.map((e) => (
              <Reveal
                key={e.degree}
                as="li"
                className="row-hover border-t border-[var(--line)] py-6 md:py-8 grid md:grid-cols-12 gap-2 md:gap-6 items-baseline"
              >
                <p className="md:col-span-3 mono text-xs text-[var(--muted)]">{e.period}</p>
                <div className="md:col-span-6">
                  <p className="md:text-lg">{e.degree}</p>
                  <p className="text-sm text-[var(--muted)]">{e.school}</p>
                </div>
                {e.note && <p className="md:col-span-3 mono text-[11px] text-[var(--ink)] md:text-right">{e.note}</p>}
              </Reveal>
            ))}
          </ol>

          <p className="label mt-24 mb-8">
            <span className="text-[var(--accent)]">{"//"}</span> Selected projects
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {site.projects.map((p, i) => (
              <Reveal key={p.name} delay={i * 120}>
                <Spotlight className="h-full flex flex-col">
                  <div className="hatch aspect-[16/9] border-b border-[var(--line)] grid place-items-center">
                    <span className="label">Screenshots coming soon</span>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col gap-5 flex-1">
                    <div className="flex items-start justify-between gap-6">
                      <h3 className="display-md">{p.name}</h3>
                      <span className="mono text-xs text-[var(--dim)]">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <p className="text-[var(--muted)]">{p.description}</p>
                    <ul className="flex flex-wrap gap-2 mt-auto">
                      {p.tags.map((t) => (
                        <li key={t} className="mono text-[11px] text-[var(--muted)] border border-[var(--line)] px-2.5 py-1">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </section>

        {/* craft */}
        <section id="craft" className="border-y border-[var(--line)]">
          <div className="container-px max-content py-28 md:py-40 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHead
                index="04"
                label="Craft"
                title={
                  <>
                    Form, <span className="text-[var(--accent)]">since 2016.</span>
                  </>
                }
              />
              <Reveal className="flex items-end gap-6">
                <span className="font-condensed font-extrabold leading-[0.8] text-[clamp(6rem,16vw,12rem)]">
                  <CountUp value={site.art.count} />
                </span>
                <div className="pb-3">
                  <p className="text-lg">{site.art.caption}</p>
                  <p className="label mt-2">{site.art.detail}</p>
                </div>
              </Reveal>

              <Reveal className="mt-10">
                <a
                  href={site.art.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-[11px] tracking-wider uppercase inline-flex items-center gap-3 btn-outline px-4 py-2.5"
                >
                  View portfolio on CGTrader ↗
                </a>
              </Reveal>
            </div>

            <Reveal className="flex justify-center md:justify-end">
              <WireCube />
            </Reveal>
          </div>
        </section>

        {/* contact */}
        <section id="contact" className="relative overflow-hidden">
          <div className="dot-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
          <div className="relative container-px max-content py-32 md:py-48">
            <Reveal>
              <p className="label mb-8">
                <span className="text-[var(--accent)]">05/</span>Contact
              </p>
              <h2 className="display-xl">
                Let&rsquo;s build
                <br />
                <span className="text-[var(--accent)]">something.</span>
              </h2>
            </Reveal>

            <Reveal className="mt-16 grid md:grid-cols-[1fr_auto] gap-10 items-end">
              <a
                href={`mailto:${site.contact.email}`}
                className="group inline-flex items-center gap-4 font-condensed font-bold text-[clamp(1.4rem,4.4vw,3.5rem)] break-all"
              >
                <span className="link-underline">{site.contact.email}</span>
                <span className="grid place-items-center shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full border border-[var(--line-strong)] group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-[var(--on-accent)] transition-colors">
                  <Icon name="arrow" className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-45 transition-transform duration-300" />
                </span>
              </a>
              <ul className="flex flex-col gap-3">
                {site.contact.socials.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="mono text-sm inline-flex items-center gap-3 text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                      <Icon name={s.icon} className="w-4 h-4" />
                      {s.handle}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={site.cvHref} download className="mono text-sm inline-flex items-center gap-3 text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                    <Icon name="arrow" className="w-4 h-4 rotate-90" />
                    {site.cv.label}
                  </a>
                </li>
                <li className="mono text-sm inline-flex items-center gap-3 text-[var(--muted)]">
                  <Icon name="pin" className="w-4 h-4" />
                  {site.contact.location}
                </li>
                {site.contact.showPhone && (
                  <li>
                    <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="mono text-sm inline-flex items-center gap-3 text-[var(--muted)] hover:text-[var(--accent)]">
                      <Icon name="phone" className="w-4 h-4" />
                      {site.contact.phone}
                    </a>
                  </li>
                )}
              </ul>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
