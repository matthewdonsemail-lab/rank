import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";
import "./register-docs-node-modules.cjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const withMDX = createMDX();

// DOCS_EXPORT=1 builds plain static files (out/) that ship inside the web
// app's hosting; without it this is the normal Next server build.
const isExport = Boolean(process.env.DOCS_EXPORT);

const config: NextConfig = {
  ...(isExport ? { output: "export" as const } : {}),
  ...(isExport ? { assetPrefix: "/docs" } : {}),
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(dirname),
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: path.join(dirname, "node_modules/tailwindcss"),
    };
    return config;
  },
};

export default withMDX(config);
