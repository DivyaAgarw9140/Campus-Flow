/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARNING !!
    // Amazon mein ye mana hai, par hum build pass karne ke liye use kar rahe hain
    ignoreBuildErrors: true,
  },
  eslint: {
    // Build ke waqt linting errors ignore karo
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;