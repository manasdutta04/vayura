import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    qualities: [75, 100],
  },
  // Empty turbopack config to silence webpack warning
  turbopack: {},
  // Suppress dev overlay errors completely
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Experimental - disable error overlay
  experimental: {
    errorOverlay: false,
  },
  // Reduce logging
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
