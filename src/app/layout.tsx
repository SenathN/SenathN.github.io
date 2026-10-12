import type { Metadata } from "next";
import { Roboto_Condensed, JetBrains_Mono, Inter } from "next/font/google";
import ThemeScript from "@/components/ThemeScript";
import { site } from "../../content/site";
import "./globals.css";

const condensed = Roboto_Condensed({
  weight: ["500", "700", "800"],
  subsets: ["latin"],
  variable: "--font-condensed",
  display: "swap",
});

const mono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = site.siteUrl;
const ogImage = `${siteUrl}${site.seo.ogImage}`;

export const metadata: Metadata = {
  metadataBase: new URL(new URL(siteUrl).origin),
  title: site.seo.title,
  description: site.seo.description,
  keywords: [...site.seo.keywords],
  authors: [{ name: site.name, url: siteUrl }],
  creator: site.name,
  applicationName: site.name,
  alternates: { canonical: siteUrl },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "profile",
    firstName: site.firstName,
    lastName: site.lastName,
    title: site.seo.title,
    description: site.seo.description,
    url: siteUrl,
    siteName: site.name,
    locale: "en_US",
    images: [{ url: ogImage, width: 1200, height: 630, alt: `${site.name} — ${site.seo.jobTitle}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
    images: [ogImage],
  },
  ...(site.seo.googleSiteVerification
    ? { verification: { google: site.seo.googleSiteVerification } }
    : {}),
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#081a2b" },
  ],
  colorScheme: "dark light",
};

const personId = `${siteUrl}#person`;
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: site.name,
      givenName: site.firstName,
      familyName: site.lastName,
      alternateName: [...site.seo.alternateNames],
      jobTitle: site.seo.jobTitle,
      description: site.seo.description,
      url: siteUrl,
      image: ogImage,
      email: `mailto:${site.contact.email}`,
      sameAs: [...site.contact.socials.map((s) => s.url), site.art.url],
      address: { "@type": "PostalAddress", addressLocality: "Malabe", addressCountry: "LK" },
      worksFor: { "@type": "Organization", name: site.experience[0].company },
      alumniOf: site.education.map((e) => ({ "@type": "EducationalOrganization", name: e.school })),
      knowsAbout: [...new Set(site.range.flatMap((r) => r.tools.filter((t) => !/since/i.test(t))))],
      knowsLanguage: site.languages.map((l) => l.name),
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}#profile`,
      url: siteUrl,
      name: site.seo.title,
      description: site.seo.description,
      inLanguage: "en",
      mainEntity: { "@id": personId },
      about: { "@id": personId },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      url: siteUrl,
      name: site.name,
      alternateName: [...site.seo.alternateNames],
      publisher: { "@id": personId },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${condensed.variable} ${mono.variable} ${body.variable}`}>
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
