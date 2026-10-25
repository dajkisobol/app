import type { NextConfig } from "next";

let repo = "";
if (process.env.GITHUB_REPOSITORY) {
  repo = process.env.GITHUB_REPOSITORY.split("/")[1] || "";
}

// Ensure basePath defaults to /app for production GitHub Pages build unless specified otherwise
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (repo ? `/${repo}` : (process.env.NODE_ENV === "production" ? "/app" : ""));

const nextConfig: NextConfig = {
  output: "export",
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    unoptimized: true,
  },
  basePath: basePath,
};

export default nextConfig;
