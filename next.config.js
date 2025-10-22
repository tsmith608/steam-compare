// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      // disable Turbopack entirely
      enabled: false,
    },
  },
};

module.exports = nextConfig;
