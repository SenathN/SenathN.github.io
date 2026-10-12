import type { IconName } from "../../content/site";

// One 24px grid, 1.5 stroke, round caps: every icon shares the same weight
// so they read as a family. currentColor keeps them inside the palette.
const paths: Record<IconName, React.ReactNode> = {
  server: (
    <>
      <rect x="3.5" y="4" width="17" height="6" rx="1.5" />
      <rect x="3.5" y="14" width="17" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01M11 7h6M11 17h6" />
    </>
  ),
  cloud: (
    <>
      <path d="M7 18a4.5 4.5 0 0 1-.4-8.98A6 6 0 0 1 18 10.5a3.75 3.75 0 0 1-.5 7.5H7Z" />
      <path d="M12 11v4M10 13h4" />
    </>
  ),
  window: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M3 9h18M9 9v10.5" />
    </>
  ),
  cube: (
    <>
      <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M4 7.5 12 12l8-4.5M12 12v9" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.25" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0M16 5.8a3 3 0 0 1 0 5.4M17.5 14.4a5.5 5.5 0 0 1 3 5.1" />
    </>
  ),
  stack: (
    <>
      <path d="m12 3.5 8.5 4.25L12 12 3.5 7.75 12 3.5Z" />
      <path d="m3.5 12 8.5 4.25L20.5 12M3.5 16.25 12 20.5l8.5-4.25" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V16M8 7.75v.01M12 16v-5.5M12 13c0-1.5 1-2.5 2.25-2.5S16.5 11.5 16.5 13v3" />
    </>
  ),
  github: (
    <path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5a3 3 0 0 0-.85-2.35c2.85-.3 5.85-1.4 5.85-6.35A4.9 4.9 0 0 0 18.6 5.4 4.6 4.6 0 0 0 18.5 2S17.4 1.7 15 3.3a12.3 12.3 0 0 0-6 0C6.6 1.7 5.5 2 5.5 2a4.6 4.6 0 0 0-.1 3.4A4.9 4.9 0 0 0 4 8.8c0 4.9 3 6 5.85 6.35A3 3 0 0 0 9 17.5V21" />
  ),
  arrow: <path d="M7 17 17 7M8.5 7H17v8.5" />,
  download: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />,
  phone: (
    <path d="M5 4h3.5l1.75 4.5-2.25 1.4a10 10 0 0 0 6.1 6.1l1.4-2.25L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.3 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.3-3.5-8.5s1.1-6.1 3.5-8.5Z" />
    </>
  ),
};

export default function Icon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name as IconName] ?? paths.arrow}
    </svg>
  );
}
