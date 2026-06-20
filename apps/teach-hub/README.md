# @profile/teach-hub

teachHub 子应用：用户级 **teach skill 学习工作区** 的独立 Next.js 服务。

> 业务逻辑与 UI 在 `@profile/teach-hub-core`；本子应用只负责路由壳、API 挂载、构建与部署。

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
| [packages/teach-hub-core/docs/](../packages/teach-hub-core/docs/) | 数据契约、子任务、API 细节 |

## 目录职责

```
apps/teach-hub/
  app/                    # Next.js App Router（薄壳，re-export core）
  app/api/teach-hub/      # API 路由 → @profile/teach-hub-core/api/*
  app/api/auth/           # 鉴权（共享 @profile/auth）
  app/api/ai/             # AI 配置（生成课时依赖）
  instrumentation.ts      # 注册 teach.generateLesson 任务
  next.config.ts          # basePath、transpile、standalone
  Dockerfile              # 独立容器镜像
  docs/                   # 子应用级文档（本目录）
```

## 环境变量

复制 `.env.example` 为 `.env.local`。数据库、Auth、OSS、AI 等共享配置见仓库根 `config/app.config.local.yaml`。

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_BASE_PATH` | 生产网关前缀，通常 `/teach-hub` |
| `NEXT_PUBLIC_TEACH_HUB_BASE_URL` | HTML 内链改写基路径；basePath 模式下留空 |
| `NEXT_DIST_DIR` | 构建输出目录，默认 `.next-teach-hub` |

## 与 core 包的关系

- **改 UI / 业务逻辑** → `packages/teach-hub-core/src/`
- **改路由 / 部署 / 环境** → `apps/teach-hub/`
- **改 API handler** → 优先改 `teach-hub-core/src/api/`，子应用 `app/api/` 仅 re-export
