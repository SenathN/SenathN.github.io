import WavePoster from "./WavePoster";
import HeroScene from "./HeroScene";
import { site } from "../../content/site";

export default function Hero() {
  const { hero } = site;
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden flex flex-col">
      <div className="hero-poster">
        <WavePoster />
      </div>
      <HeroScene />

      <div className="relative z-10 flex-1 container-px max-content w-full flex flex-col justify-center pt-28">
        <h1 className="display-xl">
          <span className="block hero-line">{hero.lineOne}</span>
          <span className="relative block hero-line hero-line-2 text-[var(--dim)]">
            <span className="caret" aria-hidden="true" />
            {hero.lineTwo}
          </span>
        </h1>
        <p className="mono text-xs md:text-sm mt-6 md:text-right md:pr-[8%] hero-fade">{hero.caption}</p>
      </div>

      <div className="relative z-10 container-px max-content w-full pb-10 hero-fade">
        <div className="rule" />
        <div className="grid md:grid-cols-2 gap-10 pt-8">
          <p className="mono text-sm md:text-base">
            <span className="text-[var(--dim)]">{"//"}</span>&nbsp;&nbsp;{hero.kicker}
          </p>
          <p className="mono text-xs md:text-sm leading-relaxed text-[var(--muted)] max-w-md md:justify-self-end">
            {site.tagline}
          </p>
        </div>
        <div className="flex items-center gap-8 mt-10">
          <a href="#range" className="mono text-xs inline-flex items-center gap-3 group link-underline">
            {hero.cta}
            <span className="inline-block group-hover:translate-y-1 transition-transform">↓</span>
          </a>
          <a href={site.cvHref} download className="mono text-xs inline-flex items-center gap-3 group link-underline text-[var(--muted)] hover:text-[var(--ink)]">
            {site.cv.label}
            <span className="inline-block group-hover:translate-y-1 transition-transform">⤓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
