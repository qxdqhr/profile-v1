# aiApi — 主站 AI 路由（启明星薄宿主）

## 目标

跨模块复用的统一 AI 调用层：**实现 SSOT 在 `sa2kit/common/aiApi`**；profile 仅保留 Next.js 鉴权路由与 MiMo 兼容任务。

## 宿主文件（profile-v1）

| 路径 | 职责 |
|------|------|
| `app_web/web/src/app/api/ai/run/route.ts` | POST 任务入口 + session 鉴权 |
| `app_web/web/src/app/api/ai/models/route.ts` | POST 模型列表 |
| `app_web/web/src/app/api/ai/config/route.ts` | GET 服务端配置状态 |
| `app_web/web/src/lib/ai/registerCoreTasks.ts` | 注册 sa2kit core + MiMo 覆盖任务 |
| `app_web/web/src/lib/ai/mimoStructuredMultimodalTask.ts` | MiMo 识图模型校验 |

> 原 `app_web/web/src/modules/aiApi/` 纯 re-export 层已删除（Phase D，2026-09-03）。

## 业务模块接入

1. 在业务仓定义 task handler，`registerAiTask` from `sa2kit/common/aiApi/server`
2. 宿主 `registerCoreAiTasks()` 或子应用自有 register 侧 effect import
3. 客户端 `useAiTask` / `createAiTaskRunner` from `sa2kit/common/aiApi/client`

## 内置任务（sa2kit SSOT）

| taskId | 说明 |
|--------|------|
| `core.llmCompletion` | 通用文本补全 |
| `core.structuredMultimodal` | system/user + 可选图片 → JSON（主站 MiMo 覆盖） |
| `core.connectivityTest` | 连通性探测 |

## 验证

```bash
pnpm ai:test-mimo
```

MiMo 推荐 env 见 sa2kit `docs/auth-env.md` / 根目录 `config/app.config.*.yaml` 的 `ai:` 节。
