# aiApi 模块开发记录

## 目标

提供 **跨模块复用** 的统一 AI 调用层：固定输入/输出契约、服务端任务注册、单一 HTTP 入口。

**实现 SSOT**：`sa2kit/common/aiApi`（profile-v1 本目录为薄封装 + UI）。

## 架构

```
各业务模块                         profile-v1 aiApi              sa2kit
─────────────                     ─────────────────             ─────────────
calendar/ai/eventFromImageTask  → re-export / UI          → common/ai/api
                                  POST /api/ai/run       → runAiTask
```

## 统一契约

见 `sa2kit/docs/ai-api.md`。

## 内置任务（sa2kit SSOT）

| taskId | 说明 |
|--------|------|
| `core.llmCompletion` | 通用文本补全 |
| `core.structuredMultimodal` | 通用：system/user prompt + 可选图片 → JSON |
| `core.connectivityTest` | 轻量连通性探测 |

## 业务模块接入步骤

1. 在 `src/modules/<module>/ai/` 定义 types + task handler
2. `registerAiTask(...)`（从 `sa2kit/common/aiApi` import）
3. 在 `src/app/api/ai/run/route.ts` side-effect import 该 registerTasks
4. 客户端用 `createAiTaskRunner` 或 `useAiTask`

## 环境变量

见 `sa2kit/docs/ai-api.md`（`AI_API_KEY`、`AI_BASE_URL` 等）。

## profile-v1 保留内容

- `components/` — 设置面板、连通性测试 UI
- `context/` — React Provider
- `hooks/useAiModels.ts` — 模型列表 debounce（待迁 sa2kit AI-203）
- `api/run|models/route.ts` — Next.js 鉴权薄封装

## 后续

见 `sa2kit/docs/ai-module-roadmap.md`（流式、限流、UI 迁移等）。
