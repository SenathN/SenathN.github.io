// Edit content/profile.json — this file only adds types and page-level wiring.
import profile from "./profile.json";

export type IconName =
  | "server" | "cloud" | "window" | "cube" | "pin" | "people" | "stack"
  | "mail" | "linkedin" | "github" | "arrow" | "phone" | "globe" | "download";

export type Profile = typeof profile;

export type Layer = {
  id: string;
  stratum: string;
  title: string;
  statement: string;
  detail: string;
  tools: string[];
  evidence: { label: string; href: string }[];
};

export type DomainMap = {
  nodes: { id: string; label: string; x: number; y: number }[];
  edges: string[][];
};

// Optional fields render only when filled in, so a project can grow from a
// one-line description into a full case study without touching components.
export type Project = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  status: string | null;
  problem: string | null;
  approach: string | null;
  architecture: string | null;
  outcome: string | null;
  stack: string[];
  image: string | null;
  url: string | null;
  map: DomainMap;
};

export type Principle = {
  id: string;
  title: string;
  body: string;
  practice: string;
  glyph: "converge" | "boundary" | "failover" | "balance" | "untangle";
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string) => `${basePath}/${path.replace(/^\//, "")}`;

// Every section is a depth zone. The gauge interpolates between these values
// while scrolling, and the section annotations print the same numbers, so the
// two always agree. The depths are storytelling, not a measurement.
export const zones = {
  home: { index: "00", label: "Surface", zone: "Epipelagic", from: 0, to: 60 },
  descent: { index: "01", label: "Descent", zone: "Epipelagic", from: 60, to: 200 },
  depth: { index: "02", label: "Engineering depth", zone: "Mesopelagic", from: 200, to: 1000 },
  work: { index: "03", label: "Selected work", zone: "Bathypelagic", from: 1000, to: 2600 },
  log: { index: "04", label: "Logbook", zone: "Bathypelagic", from: 2600, to: 4000 },
  approach: { index: "05", label: "Beneath the surface", zone: "Abyssopelagic", from: 4000, to: 6000 },
  notes: { index: "06", label: "Field notes", zone: "Hadopelagic", from: 6000, to: 8200 },
  contact: { index: "07", label: "Contact", zone: "Hadopelagic", from: 8200, to: 10935 },
} as const;

export type ZoneId = keyof typeof zones;

export const metres = (n: number) => `${n.toLocaleString("en-US")} m`;
export const zoneRange = (id: ZoneId) => `${zones[id].from.toLocaleString("en-US")}—${metres(zones[id].to)}`;

export function zoneAttrs(id: ZoneId) {
  const z = zones[id];
  return { id, "data-zone": z.zone, "data-from": z.from, "data-to": z.to };
}

export const site = {
  ...profile,
  layers: profile.layers as Layer[],
  projects: profile.projects as Project[],
  principles: profile.principles as Principle[],
  cvHref: asset(profile.cv.file),
  nav: [
    { label: "Depth", href: "#depth" },
    { label: "Work", href: "#work" },
    { label: "Logbook", href: "#log" },
    { label: "Approach", href: "#approach" },
    { label: "Notes", href: "#notes" },
    { label: "Contact", href: "#contact" },
  ],
};
