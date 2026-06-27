import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || '';

const nextConfig: NextConfig = {
  ...(basePath ? { basePath, trailingSlash: true } : {}),
  distDir: process.env.NEXT_DIST_DIR || '.next-money-research',
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  experimental: {
    externalDir: true,
  },
  turbopack: {},
};

export default nextConfig;
