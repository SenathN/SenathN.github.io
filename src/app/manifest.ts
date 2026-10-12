import type { MetadataRoute } from "next";
import { site } from "../../content/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.firstName,
    description: site.seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#03151a",
    theme_color: "#03151a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
