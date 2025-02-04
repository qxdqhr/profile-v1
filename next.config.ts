/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [], // 如果你有外部图片域名，需要在这里添加
  },
  // 如果需要支持 CSS 模块
  cssModules: true,
  output: "standalone",
};

export default nextConfig;
