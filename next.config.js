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
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(mp3)$/,
            type: 'asset/resource',
            generator: {
                filename: 'static/media/[name][ext]'
            }
        });
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
    api: {
        bodyParser: {
            sizeLimit: '10mb' // 增加允许的请求体大小
        }
    }
}

module.exports = nextConfig 