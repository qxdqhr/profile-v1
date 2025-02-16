/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        // 如果需要的话，可以添加其他实验性功能
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
}

module.exports = nextConfig 