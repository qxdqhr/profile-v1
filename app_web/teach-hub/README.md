# @profile/teach-hub

teachHub 子应用：用户级 **teach skill 学习工作区** 的独立 Next.js 服务。

> UI / domain / routes 在 `sa2kit/business/teachHub/*`；本子应用负责薄 page、API 挂载、`lib/` 宿主注入（db/OSS/session）、构建与部署。

## 快速启动

```bash
# 仓库根目录
pnpm dev:teach-hub          # http://localhost:3002
pnpm build:teach-hub
```

主站 `@profile/web` 通过 `/teach-hub` 302 重定向到本子应用（生产同域网关；本地 `:3002`）。

## 文档索引

| 文档 | 用途 |
|------|------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 子应用架构、工作流、部署 |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | 版本变更记录 |
| [docs/AI_ONBOARDING.md](./docs/AI_ONBOARDING.md) | 给 AI / 新协作者的一页全貌 |
| [docs/modules/teach-hub/](../../docs/modules/teach-hub/) | 域迁移与归档契约 |

## 目录职责

```
app_web/teach-hub/
  app/                    # Next.js App Router（薄壳 → sa2kit ui/web）
  app/api/teach-hub/      # create*Handler + lib/hostRouteConfig
  lib/                    # OSS / FileStore / generate / Auth 壳（宿主注入）
  instrumentation.ts      # 注册 teach.generateLesson 任务
  next.config.ts
  Dockerfile
  docs/
```

> **AI**：课时生成在服务端直接 `runAiTask`；浏览器侧 `/api/ai/*` 走主站 web。
