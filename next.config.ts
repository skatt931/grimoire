import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  turbopack: {}, // silence Turbopack/webpack conflict warning
};

// Only wrap with next-pwa in production (it uses webpack, incompatible with Turbopack dev server)
if (!isDev) {
  const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
  });
  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}
