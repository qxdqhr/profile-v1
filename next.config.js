/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        // 如果需要的话，可以添加其他实验性功能
        serverComponentsExternalPackages: [],
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
        ]
    },
    // 配置子应用的代理（如需要）
    async rewrites() {
        return [
            {
                source: '/vue-app/:path*',
                destination: 'http://localhost:8081/:path*'
            },
        ]
    },
    serverRuntimeConfig: {
        api: {
            bodyParser: {
                sizeLimit: '10mb' // 增加允许的请求体大小
            }
        }
    }
}

module.exports = nextConfig 