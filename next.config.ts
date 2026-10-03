import type { NextConfig } from "next";

// Set by the Pages workflow: "" for a <user>.github.io repo, "/<repo>" otherwise.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
