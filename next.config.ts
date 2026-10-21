import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "blades-campaign-suite-revamped";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : undefined,
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
