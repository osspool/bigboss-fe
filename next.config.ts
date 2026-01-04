import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces `.next/standalone` output that can be shipped without the full source repo.
  // Note: this is NOT true source protection (JS can be reverse-engineered), but it's a clean deploy artifact.
  // output: "standalone",
  // Disable Server Components HMR cache to prevent stale data
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  // Transpile packages to fix HMR issues with ESM modules
  transpilePackages: ["react-phone-number-input", "@classytic/clarity"],
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
