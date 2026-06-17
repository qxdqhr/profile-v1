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

  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002';
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || '';

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  distDir: process.env.NEXT_DIST_DIR || '.next-teach-hub',
  output: 'standalone',
  transpilePackages: [
    'sa2kit',
    'animal-island-ui',
    '@profile/auth',
    '@profile/teach-hub-core',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_APP_URL: readPublicAppUrl(),
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_TEACH_HUB_BASE_URL:
      process.env.NEXT_PUBLIC_TEACH_HUB_BASE_URL ?? basePath ?? '',
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
};

export default nextConfig;
