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
    // Security-Header fuer alle Routen (Vorlage: atemweg-art-v2/next.config.ts)
    {
      source: "/(.*)",
      headers: [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
  ],
};

export default nextConfig;
