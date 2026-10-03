import type { MetadataRoute } from "next";
import { site } from "../../content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.siteUrl, lastModified: now, changeFrequency: "monthly", priority: 1 },
  ];
}
