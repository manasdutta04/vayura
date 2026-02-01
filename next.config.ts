import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    qualities: [75, 100],
  },
  // Suppress webpack warnings and logs
  webpack: (config, { isServer }) => {
    config.infrastructureLogging = {
      level: 'error',
    };
    return config;
  },
  // Suppress dev overlay errors
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Reduce logging
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
