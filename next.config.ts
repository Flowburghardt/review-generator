import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  turbopack: {
    // Fix: Wenn eine package-lock.json im Home-Verzeichnis liegt,
    // setzt Turbopack den falschen Workspace-Root.
    root: import.meta.dirname,
  },
  // Uncomment to allow Next.js Image Optimization for external domains:
  // images: {
  //   remotePatterns: [{ protocol: "https", hostname: "example.com" }],
  // },
  headers: async () => [
    {
      source: "/images/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=3600, must-revalidate",
        },
      ],
    },
  ],
};

export default nextConfig;
