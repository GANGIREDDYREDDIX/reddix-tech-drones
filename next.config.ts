import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from supabase storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zldibrhzuxhwecetctxb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Compress responses
  compress: true,
  // Strict mode for catching bugs early
  reactStrictMode: true,
  // Disable x-powered-by header
  poweredByHeader: false,
  // Enable experimental features for faster builds
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
};

export default nextConfig;
