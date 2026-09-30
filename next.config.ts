import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true" || process.env.GITHUB_ACTIONS === "true";
const basePath = isGithubPages ? "/thaiplus-calculator" : (process.env.BASE_PATH || "");

const nextConfig: NextConfig = {
  output: isGithubPages || process.env.STATIC_EXPORT === "true" ? "export" : undefined,
  basePath: basePath || undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;

