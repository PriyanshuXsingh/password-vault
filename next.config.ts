/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignores lint errors on Vercel builds
  },
};

module.exports = nextConfig;
