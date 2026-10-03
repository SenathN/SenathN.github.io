// Edit content/profile.json — this file only adds types and page-level wiring.
import profile from "./profile.json";

export type IconName =
  | "server" | "cloud" | "window" | "cube" | "pin" | "people" | "stack"
  | "mail" | "linkedin" | "github" | "arrow" | "phone" | "globe";

export type Profile = typeof profile;

const cvHref = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${profile.cv.file}`;

export const site = {
  ...profile,
  cvHref,
  nav: [
    { label: "Home", href: "#main" },
    { label: "Range", href: "#range" },
    { label: "Work", href: "#work" },
    { label: "Craft", href: "#craft" },
    { label: "Contact", href: "#contact" },
  ],
} as const;
