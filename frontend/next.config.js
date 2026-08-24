/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Required for wagmi + RainbowKit SSR compatibility
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

module.exports = nextConfig;
