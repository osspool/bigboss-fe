import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Server Components HMR cache to prevent stale data
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  // Transpile packages to fix HMR issues with ESM modules
  transpilePackages: ["react-phone-number-input"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
