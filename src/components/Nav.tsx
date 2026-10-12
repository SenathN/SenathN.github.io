import { ActiveNav, ThemeToggle } from "./Interactive";
import { site } from "../../content/site";

export default function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 nav-glass">
      <nav aria-label="Primary" className="container-px max-content flex items-center justify-between h-16">
        <a href="#main" className="font-condensed font-bold text-lg tracking-wide uppercase">
          {site.firstName}
          <span className="text-[var(--dim)]">.GG</span>
        </a>
        <div className="flex items-center gap-8">
          <ActiveNav items={site.nav} />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href={site.cvHref}
              download
              className="mono text-[11px] tracking-wider uppercase btn-outline px-3 py-1.5"
            >
              CV ↓
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
