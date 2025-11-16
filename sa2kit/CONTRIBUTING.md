# 贡献指南

感谢您对 SA2Kit 的关注和贡献！

## 🚀 开发环境设置

### 前置要求
- Node.js >= 18
- pnpm >= 8

### 克隆仓库
```bash
git clone https://github.com/yourusername/sa2kit.git
cd sa2kit
```

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 构建
```bash
pnpm build
```

### 测试
```bash
pnpm test
```

### 代码检查
```bash
pnpm lint
pnpm type-check
```

## 📝 贡献流程

### 1. Fork 仓库
在 GitHub 上 Fork 本仓库

### 2. 创建分支
```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 3. 提交代码
```bash
git add .
git commit -m "feat: add new feature"
# 或
git commit -m "fix: fix bug"
```

#### Commit 消息规范
使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式（不影响代码运行）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具变动

### 4. 推送到远程
```bash
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request
在 GitHub 上创建 PR，描述你的更改

## 📋 代码规范

### TypeScript
- 使用严格的 TypeScript 类型
- 避免使用 `any`
- 为所有公共 API 添加类型定义

### React
- 使用函数组件和 Hooks
- 为所有 Props 添加 TypeScript 类型
- 使用 `React.FC` 或显式返回类型

### 代码风格
- 遵循 ESLint 和 Prettier 配置
- 使用有意义的变量名
- 添加必要的注释

### 文档
- 为所有公共 API 添加 JSDoc 注释
- 更新 README.md（如果需要）
- 添加示例代码

## 🧪 测试

### 编写测试
- 为新功能编写测试
- 确保测试覆盖率 > 80%
- 运行 `pnpm test` 确保所有测试通过

### 测试示例
```typescript
import { describe, it, expect } from 'vitest'
import { resolveTexturePath } from '../utils/texturePathResolver'

describe('resolveTexturePath', () => {
  it('should resolve basic texture path', () => {
    const result = resolveTexturePath('tex/body.png', {
      basePath: '/models/miku',
      modelPath: '/models/miku/miku.pmx'
    })
    expect(result).toBe('/models/miku/tex/body.png')
  })
})
```

## 📖 文档

### API 文档
- 更新 `docs/API.md`
- 添加使用示例

### 指南
- 更新 `docs/GUIDE.md`（如果需要）
- 添加常见问题到 `docs/FAQ.md`

## 🐛 报告 Bug

### Bug 报告应包含：
1. Bug 描述
2. 复现步骤
3. 期望行为
4. 实际行为
5. 环境信息（浏览器、Node.js 版本等）
6. 相关代码或截图

## 💡 功能建议

### 建议应包含：
1. 功能描述
2. 使用场景
3. 预期效果
4. 示例代码（可选）

## 📞 联系方式

- GitHub Issues: https://github.com/yourusername/sa2kit/issues
- Email: your.email@example.com

## 🙏 致谢

感谢所有贡献者！

## 📄 许可证

贡献的代码将遵循 MIT 许可证。

