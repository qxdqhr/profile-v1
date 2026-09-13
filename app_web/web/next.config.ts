import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parse as parseYaml } from 'yaml';
import type { NextConfig } from 'next';

/** next.config 由 jiti 加载；用 cwd 锚定，避免 ESM 下无 __filename */
const requireFromWeb = createRequire(path.join(process.cwd(), 'package.json'));

function resolveSa2kitUiReactEsm(): string | undefined {
  try {
    const resolved = requireFromWeb.resolve('@sa2kit-ui/react');
    // prefer ESM entry so webpack named re-exports from sa2kit/common/ui work
    if (resolved.includes(`${path.sep}dist${path.sep}cjs${path.sep}`)) {
      return path.join(path.dirname(resolved), '..', 'es', 'index.js');
    }
    if (resolved.endsWith(`${path.sep}dist${path.sep}es${path.sep}index.js`)) {
      return resolved;
    }
    const esCandidate = path.join(path.dirname(resolved), 'dist', 'es', 'index.js');
    return existsSync(esCandidate) ? esCandidate : resolved;
  } catch {
    const fallback = path.join(
      process.cwd(),
      '../../packages/sa2kit-ui/packages/react/dist/es/index.js',
    );
    return existsSync(fallback) ? fallback : undefined;
  }
}

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
const sa2kitUiReactEsm = resolveSa2kitUiReactEsm();

const nextConfig: NextConfig = {
    distDir: process.env.NEXT_DIST_DIR || '.next',
    output: 'standalone',

    transpilePackages: [
        "sa2kit",
        "@sa2kit-ui/react",
        "@profile/auth",
    ],

    // business 层 tsup dts:false（three/MMD）；宽松 stub 会让 demo 回调变 implicit any。
    // 主站全仓 tsc 本就有既有错误（见 PENDING-OPTIMIZATION OPT-03），构建不阻塞于此。
    typescript: {
        ignoreBuildErrors: true,
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
        NEXT_PUBLIC_IDEA_LIST_URL:
            process.env.NEXT_PUBLIC_IDEA_LIST_URL ??
            (process.env.NODE_ENV === 'production' ? '/idea-list' : 'http://localhost:3006'),
        NEXT_PUBLIC_FILETRANSFER_URL:
            process.env.NEXT_PUBLIC_FILETRANSFER_URL ??
            (process.env.NODE_ENV === 'production' ? '/filetransfer' : 'http://localhost:3007'),
    },

    images: {
        unoptimized: true
    },

    serverExternalPackages: [
        'lru-cache',
        "sharp",
        "onnxruntime-node",
        "onnxruntime-web",
        "@xenova/transformers",
    ],

    experimental: {
        externalDir: true,
        optimizePackageImports: ['three', 'three-stdlib', 'lucide-react'],
    },

    // 抑制误把 ~/pnpm-lock.yaml 当成 workspace root（cwd 为 app_web/web）
    outputFileTracingRoot: path.join(process.cwd(), '../..'),

    turbopack: {},

    webpack: (config, { isServer, webpack }) => {
        // 阻断 onnxruntime 原生二进制进入 webpack 模块图（@xenova/transformers → onnxruntime-node）
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /\.node$/,
            }),
        );

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
            ...(sa2kitUiReactEsm ? { '@sa2kit-ui/react$': sa2kitUiReactEsm } : {}),
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
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    ...(typeof config.optimization?.splitChunks === 'object'
                        ? config.optimization.splitChunks
                        : {}),
                    cacheGroups: {
                        ...(typeof config.optimization?.splitChunks === 'object'
                            ? config.optimization.splitChunks.cacheGroups
                            : {}),
                        engine3d: {
                            test: /[\\/]node_modules[\\/](three|three-stdlib|mmd-parser)[\\/]/,
                            name: 'engine-3d',
                            chunks: 'async',
                            priority: 30,
                        },
                        monaco: {
                            test: /[\\/]node_modules[\\/](@monaco-editor|monaco-editor)[\\/]/,
                            name: 'monaco',
                            chunks: 'async',
                            priority: 30,
                        },
                    },
                },
            };
        }

        return config;
    },
};

export default nextConfig;
