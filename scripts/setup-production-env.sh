#!/bin/bash

# 生产环境配置脚本
echo "🚀 开始配置生产环境..."

# 检查是否已存在 .env.production
if [ -f ".env.production" ]; then
    echo "⚠️  .env.production 文件已存在，是否覆盖？(y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ 配置已取消"
        exit 1
    fi
fi

# 复制模板文件
if [ -f "env.template" ]; then
    cp env.template .env.production
    echo "✅ 已复制环境变量模板到 .env.production"
else
    echo "❌ env.template 文件不存在"
    exit 1
fi

echo ""
echo "📝 请编辑 .env.production 文件，填入您的实际配置："
echo "   - 数据库连接信息"
echo "   - 阿里云OSS AccessKey"
echo "   - 其他必要的环境变量"
echo ""
echo "🔧 配置完成后，运行以下命令："
echo "   pnpm build"
echo "   pnpm prodb:push"
echo "   pnpm start"
echo ""
echo "📖 详细说明请参考 docs/production-deployment-guide.md" 