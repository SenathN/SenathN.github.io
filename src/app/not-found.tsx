import Link from "next/link";
import { site } from "../../content/site";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col justify-center container-px max-content">
      <p className="label mb-6">
        <span className="text-[var(--accent)]">404/</span>
        {site.name}
      </p>
      <h1 className="display-xl">
        Not
        <br />
        <span className="text-[var(--accent)]">found.</span>
      </h1>
      <Link href="/" className="mono text-sm mt-10 link-underline w-fit">
        ← Back home
      </Link>
    </main>
  );
}
