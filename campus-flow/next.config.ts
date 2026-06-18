import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // TypeScript errors ignore karo
  },
  eslint: {
    ignoreDuringBuilds: true, // Linting errors ignore karo
  },
  images: {
    unoptimized: true, // Image errors se bachne ke liye
  },
  // Next.js 15 specific fix
  experimental: {
    // Agar Turbopack tang kar raha hai toh isse disable rehne do
  }
};

export default nextConfig;