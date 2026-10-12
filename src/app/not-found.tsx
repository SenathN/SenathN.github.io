import Link from "next/link";
import { site } from "../../content/site";

export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <div className="wrap">
        <p className="t-label mb-8">
          <span className="accent">404</span> / {site.name}
        </p>
        <h1 className="t-hero">
          <span className="block">Off the</span>
          <span className="block text-[var(--cyan)]">chart.</span>
        </h1>
        <p className="t-lead mt-8 max-w-md">There is nothing charted at this depth.</p>
        <Link href="/" className="btn-bracket mt-12">
          <span aria-hidden="true">[</span>
          <span className="btn-bracket-label">Return to the surface</span>
          <span aria-hidden="true" className="btn-bracket-arrow">↑</span>
          <span aria-hidden="true">]</span>
        </Link>
      </div>
    </main>
  );
}
