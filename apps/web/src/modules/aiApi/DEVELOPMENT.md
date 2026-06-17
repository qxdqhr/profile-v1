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

profile-v1 额外支持在 `config/app.config.*.yaml` 的 `ai:` 节配置（启动时同步为 `AI_*` 环境变量），
本地 / 生产明文 YAML 已 gitignore。也可使用根目录 `.env.local` 覆盖。

MiMo 推荐值：

| 变量 | 值 |
|------|-----|
| `AI_BASE_URL` | `https://api.xiaomimimo.com/v1` |
| `AI_VISION_MODEL` | `mimo-v2.5`（识图，勿用 mimo-v2.5-pro） |

验证：`pnpm ai:test-mimo`

## profile-v1 保留内容

- `api/run|models|config/route.ts` — Next.js 鉴权薄封装 + 服务端 MiMo 任务覆盖
- `utils/aiSettingsCore.ts` — MiMo 默认配置
- `server/mimoStructuredMultimodalTask.ts` — MiMo 识图兼容

设置 UI（`AiApiSettingsPanel`、`AiApiConnectivityTest`、`AiApiSettingsProvider`、`useAiModels`）已迁入 **sa2kit 3.8+**（AI-203 ✅），本模块仅 re-export。

## 后续

见 `sa2kit/docs/ai-module-roadmap.md`（流式、限流、UI 迁移等）。
