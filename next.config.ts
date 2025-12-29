import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone', // Docker 部署需要
    
    // sa2kit 需要转译以正确加载样式和组件
    transpilePackages: ["sa2kit"],
    
    // 临时禁用TypeScript检查，因为sa2kit类型定义问题
    typescript: {
        ignoreBuildErrors: true,
    },
    
    // 环境变量配置
    env: {
        // 设置最大请求体大小
        MAX_REQUEST_SIZE: '52428800', // 50MB in bytes
    },
    
    // 确保静态资源能够正确处理
    images: {
        unoptimized: true
    },
    
    // 这些 AI 库包含大型二进制/WASM 文件，应在服务端视为外部包
    serverExternalPackages: [
        "sharp",
        "onnxruntime-node", 
        "onnxruntime-web", 
        "@imgly/background-removal", 
        "@xenova/transformers"
    ],
    
    // Turbopack 配置（Next.js 16+ 默认使用 Turbopack）
    // 添加空配置表示我们接受使用 Turbopack
    turbopack: {},
    
    // 添加你的音频文件到允许的资源类型中
    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.(mp3)$/,
            type: 'asset/resource',
            generator: {
                filename: 'static/media/[name][ext]'
            }
        });
        
        // 添加 SA2Kit 路径别名
        config.resolve.alias = {
            ...config.resolve.alias,
            '@sa2kit': require('path').join(__dirname, 'sa2kit/dist/index.js'),
        };
        
        // 在客户端构建时，排除 Node.js 原生模块
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                'onnxruntime-node': false,
                'sharp': false,
                'fs': false,
                'path': false,
                'os': false,
            };
        }
        
        return config;
    },
    
    // 允许跨域加载子应用资源
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*'
                    },
                ],
            },
            // 为预订管理API添加缓存控制
            {
                source: '/api/showmasterpiece/bookings/admin',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate, max-age=0'
                    },
                    {
                        key: 'Pragma',
                        value: 'no-cache'
                    },
                    {
                        key: 'Expires',
                        value: '0'
                    },
                    {
                        key: 'Surrogate-Control',
                        value: 'no-store'
                    },
                ],
            },
        ];
    },
    
    // 配置子应用的代理（如需要）
    async rewrites() {
        return [
            {
                source: '/vue-app/:path*',
                destination: 'http://localhost:8081/:path*'
            },
        ];
    },
};

export default nextConfig;

