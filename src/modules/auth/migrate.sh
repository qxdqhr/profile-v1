#!/bin/bash

# Auth模块迁移脚本
# 自动更新现有项目中的导入路径到新的模块化结构

echo "🔄 开始Auth模块迁移..."

# 定义项目根目录
PROJECT_ROOT=$(pwd)

# 检查是否在正确的目录
if [ ! -d "src/modules/auth" ]; then
    echo "❌ 错误: 请在项目根目录执行此脚本"
    exit 1
fi

echo "📁 项目根目录: $PROJECT_ROOT"

# 1. 备份原始文件（可选）
echo "💾 创建备份..."
backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

# 备份将要修改的文件类型
find src -name "*.ts" -o -name "*.tsx" | grep -E "(auth|Auth|login|Login)" | while read file; do
    if [ -f "$file" ]; then
        backup_path="$backup_dir/$file"
        mkdir -p "$(dirname "$backup_path")"
        cp "$file" "$backup_path"
    fi
done

echo "✅ 备份完成到: $backup_dir"

# 2. 更新导入路径
echo "🔧 更新导入路径..."

# 更新 useAuth hook 导入
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "src/modules/auth/*" -exec grep -l "useAuth" {} \; | while read file; do
    sed -i.tmp "s|from '@/hooks/useAuth'|from '@/modules/auth'|g" "$file"
    sed -i.tmp "s|from '@/hooks/useAuth';|from '@/modules/auth';|g" "$file"
    rm -f "$file.tmp"
    echo "  ✅ 更新 $file"
done

# 更新 LoginModal 组件导入
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "src/modules/auth/*" -exec grep -l "LoginModal" {} \; | while read file; do
    sed -i.tmp "s|from '@sa2kit/components/auth/LoginModal'|from '@/modules/auth'|g" "$file"
    sed -i.tmp "s|import LoginModal from '@sa2kit/components/auth/LoginModal'|import { LoginModal } from '@/modules/auth'|g" "$file"
    rm -f "$file.tmp"
    echo "  ✅ 更新 $file"
done

# 更新 AuthGuard 组件导入
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "src/modules/auth/*" -exec grep -l "AuthGuard" {} \; | while read file; do
    sed -i.tmp "s|from '@sa2kit/components/auth/AuthGuard'|from '@/modules/auth'|g" "$file"
    sed -i.tmp "s|import AuthGuard from '@sa2kit/components/auth/AuthGuard'|import { AuthGuard } from '@/modules/auth'|g" "$file"
    rm -f "$file.tmp"
    echo "  ✅ 更新 $file"
done

# 更新 authDbService 导入
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "src/modules/auth/*" -exec grep -l "authDbService" {} \; | while read file; do
    sed -i.tmp "s|from '@/db/services/authDbService'|from '@/modules/auth'|g" "$file"
    rm -f "$file.tmp"
    echo "  ✅ 更新 $file"
done

# 更新类型导入
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "src/modules/auth/*" -exec grep -l "from '@/types/auth'" {} \; | while read file; do
    sed -i.tmp "s|from '@/types/auth'|from '@/modules/auth'|g" "$file"
    rm -f "$file.tmp"
    echo "  ✅ 更新 $file"
done

# 更新工具函数导入
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "src/modules/auth/*" -exec grep -l "authUtils" {} \; | while read file; do
    sed -i.tmp "s|from '@/utils/authUtils'|from '@/modules/auth'|g" "$file"
    rm -f "$file.tmp"
    echo "  ✅ 更新 $file"
done

# 3. 更新API路由文件（如果有自定义的）
echo "🔧 检查API路由..."

api_routes=("src/app/api/auth/login/route.ts" "src/app/api/auth/logout/route.ts" "src/app/api/auth/validate/route.ts")

for route in "${api_routes[@]}"; do
    if [ -f "$route" ]; then
        echo "⚠️  发现现有API路由: $route"
        echo "   建议将其替换为："
        echo "   export { POST } from '@/modules/auth/api/login/route';"
        echo "   或者直接删除，使用模块化API路由"
    fi
done

# 4. 检查样式文件
echo "🎨 检查样式文件..."
if [ -f "src@sa2kit/components/auth/LoginModal.module.css" ]; then
    echo "ℹ️  发现原始样式文件: src@sa2kit/components/auth/LoginModal.module.css"
    echo "   已复制到模块中，可以删除原文件"
fi

# 5. 生成迁移报告
echo "📋 生成迁移报告..."
report_file="migration_report_$(date +%Y%m%d_%H%M%S).md"

cat > "$report_file" << EOF
# Auth模块迁移报告

## 迁移时间
$(date)

## 备份位置
\`$backup_dir/\`

## 已更新的文件
EOF

# 查找所有可能受影响的文件
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "src/modules/auth/*" -exec grep -l -E "(useAuth|LoginModal|AuthGuard|authDbService|from '@/types/auth'|authUtils)" {} \; | while read file; do
    echo "- $file" >> "$report_file"
done

cat >> "$report_file" << EOF

## 建议的后续步骤

1. **测试应用程序**
   - 启动开发服务器
   - 测试登录功能
   - 验证所有认证相关功能

2. **检查API路由**
   - 确认API端点正常工作
   - 考虑使用模块化API路由

3. **清理旧文件**
   ```bash
   # 在确认一切正常后，可以删除以下目录/文件：
   rm -rf src@sa2kit/components/auth/
   rm -rf src/hooks/useAuth.ts
   rm -rf src/utils/authUtils.ts
   rm -rf src/types/auth.ts
   rm -rf src/db/services/authDbService.ts
   ```

4. **更新tsconfig.json路径映射（如果需要）**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/auth/*": ["src/modules/auth/*"]
       }
     }
   }
   ```

## 新的导入方式

\`\`\`typescript
// 旧的方式
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@sa2kit/components/auth/LoginModal';
import { User } from '@/types/auth';

// 新的方式
import { useAuth, LoginModal, User } from '@/modules/auth';
\`\`\`

## 验证清单

- [ ] 应用程序正常启动
- [ ] 登录功能正常
- [ ] 登出功能正常
- [ ] 会话验证正常
- [ ] 权限守卫正常
- [ ] TypeScript编译无错误
- [ ] 所有测试通过

EOF

echo "✅ 迁移完成！"
echo "📋 迁移报告: $report_file"
echo ""
echo "⚠️  重要提醒:"
echo "1. 请运行 'npm run build' 或 'yarn build' 检查是否有编译错误"
echo "2. 测试所有认证相关功能"
echo "3. 查看迁移报告了解详细信息"
echo ""
echo "如果遇到问题，可以从备份目录恢复文件：$backup_dir" 