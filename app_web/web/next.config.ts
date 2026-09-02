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
      // ignore invalid yaml during bootstrap
    }
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

const publicAppUrl = readPublicAppUrl();

const nextConfig: NextConfig = {
    distDir: process.env.NEXT_DIST_DIR || '.next',
    output: 'standalone',

    transpilePackages: [
        "sa2kit",
        "@sa2kit-ui/react",
        "@profile/auth",
        "@profile/showmasterpiece-core",
    ],

    typescript: {
        ignoreBuildErrors: false,
    },

    env: {
        MAX_REQUEST_SIZE: '52428800',
        NEXT_PUBLIC_APP_URL: publicAppUrl,
        NEXT_PUBLIC_CALENDAR_URL:
            process.env.NEXT_PUBLIC_CALENDAR_URL ??
            (process.env.NODE_ENV === 'production' ? '/calendar' : 'http://localhost:3001'),
        NEXT_PUBLIC_TEACH_HUB_URL:
            process.env.NEXT_PUBLIC_TEACH_HUB_URL ??
            (process.env.NODE_ENV === 'production' ? '/teach-hub' : 'http://localhost:3002'),
        NEXT_PUBLIC_SHOWMASTERPIECE_URL:
            process.env.NEXT_PUBLIC_SHOWMASTERPIECE_URL ??
            (process.env.NODE_ENV === 'production' ? '/showmasterpiece' : 'http://localhost:3003'),
        NEXT_PUBLIC_MONEY_RESEARCH_URL:
            process.env.NEXT_PUBLIC_MONEY_RESEARCH_URL ??
            (process.env.NODE_ENV === 'production' ? '/money-research' : 'http://localhost:3004'),
        NEXT_PUBLIC_NODE_NOTES_URL:
            process.env.NEXT_PUBLIC_NODE_NOTES_URL ??
            (process.env.NODE_ENV === 'production' ? '/node-notes' : 'http://localhost:3005'),
    },

    images: {
        unoptimized: true
    },

    serverExternalPackages: [
        'lru-cache',
        "sharp",
        "onnxruntime-node",
        "onnxruntime-web",
        "@imgly/background-removal",
        "@xenova/transformers"
    ],

    experimental: {
        externalDir: true,
    },

    turbopack: {},

    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.(mp3)$/,
            type: 'asset/resource',
            generator: {
                filename: 'static/media/[name][ext]'
            }
        });

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
            config.resolve.alias = {
                ...config.resolve.alias,
                'stream/promises': false,
            };
            config.resolve.fallback = {
                ...config.resolve.fallback,
                'onnxruntime-node': false,
                'sharp': false,
                'fs': false,
                'path': false,
                'os': false,
                'stream': false,
                'stream/promises': false,
            };
        }

        return config;
    },
};

export default nextConfig;
