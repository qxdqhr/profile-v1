import { existsSync, readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import type { NextConfig } from 'next';

function readPublicAppUrl(): string {
  const explicit = process.env.APP_CONFIG_PATH;
  const candidates = [
    explicit,
    '../../config/app.config.local.yaml',
    '../../config/app.config.production.yaml',
  ].filter(Boolean) as string[];

  for (const file of candidates) {
    if (!existsSync(file)) continue;
    try {
      const doc = parseYaml(readFileSync(file, 'utf8')) as {
        auth?: { publicUrl?: string };
      };
      if (doc.auth?.publicUrl) return doc.auth.publicUrl;
    } catch {
      // ignore
    }
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || '';

const nextConfig: NextConfig = {
  ...(basePath ? { basePath, trailingSlash: true } : {}),
  distDir: process.env.NEXT_DIST_DIR || '.next-showmasterpiece',
  output: 'standalone',
  transpilePackages: [
    'sa2kit',
    'animal-island-ui',
    '@profile/auth',
    '@profile/showmasterpiece-core',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_APP_URL: readPublicAppUrl(),
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    externalDir: true,
  },
  turbopack: {},
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(woff2?|webp|png|svg)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': false,
      '@tarojs/components': false,
      '@tarojs/taro': false,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        stream: false,
      };
    }

    return config;
  },
  async headers() {
    return [
      {
        source: '/api/showmasterpiece/bookings/admin',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Surrogate-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
