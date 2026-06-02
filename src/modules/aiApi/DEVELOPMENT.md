# aiApi 模块开发记录

## 目标

提供 **跨模块复用** 的统一 AI 调用层：固定输入/输出契约、服务端任务注册、单一 HTTP 入口。

## 架构

```
各业务模块                         aiApi（通用）
─────────────                     ─────────────
calendar/ai/eventFromImageTask  → registerAiTask()
ideaList/ai/... (未来)          → registerAiTask()
                                  ↓
                            POST /api/ai/run
                            { taskId, input }
                                  ↓
                            runAiTask → OpenAI 兼容 Vision API
```

## 统一契约

### 请求

```json
{ "taskId": "calendar.eventFromImage", "input": { ... } }
```

### 响应

```json
{
  "success": true,
  "taskId": "calendar.eventFromImage",
  "data": { ... },
  "meta": { "model": "gpt-4o-mini", "latencyMs": 1200, "confidence": 0.82 }
}
```

## 内置任务

| taskId | 说明 |
|--------|------|
| `core.structuredMultimodal` | 通用：system/user prompt + 可选图片 → JSON |
| `core.connectivityTest` | 轻量连通性探测（设置页「测试连接」） |

## 业务模块接入步骤

1. 在 `src/modules/<module>/ai/` 定义 `*.types.ts`（仅类型，可被客户端引用）
2. 实现 `*Task.ts`（服务端 handler，调用 aiApi server 工具）
3. 在 `registerTasks.ts` 中 `registerAiTask(...)`
4. 在 `src/app/api/ai/run/route.ts` side-effect import 该 registerTasks
5. 客户端用 `createAiTaskRunner` 或 `useAiTask(taskId)`

## 环境变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `AI_API_KEY` | 服务端 API Key（可选） | 回退 `OPENAI_API_KEY` |
| `AI_BASE_URL` | OpenAI 兼容 base | `https://api.openai.com/v1` |
| `AI_VISION_MODEL` | 多模态模型 | `gpt-4o-mini` |
| `AI_TEXT_MODEL` | 纯文本模型 | `gpt-4o-mini` |
| `AI_MAX_IMAGE_BYTES` | 单图上限 | `5242880` (5MB) |

客户端可在设置页填写 API Key（`localStorage` → 请求体 `clientSettings`）。**优先使用客户端 Key**，未填写时使用服务端环境变量。

## 客户端设置

- `utils/aiSettingsCore.ts` — 持久化与 `pickClientSettingsFromStorage()`
- `context/AiApiSettingsContext.tsx` — Provider
- `components/AiApiSettingsPanel.tsx` — 设置 UI（日历设置 Tab「AI」引用）

## 模型列表自动选择

- `POST /api/ai/models` — 代理 OpenAI 兼容 `/models` 接口
- `utils/modelHeuristics.ts` — 过滤对话/视觉模型与默认选型
- `hooks/useAiModels.ts` — Key / Base URL 变更后 debounce 拉取并自动写入 `visionModel`
- 设置页 `AiApiSettingsPanel` 展示下拉选择与手动刷新

## Checklist

- [x] 类型 `AiApiRunRequest` / `AiApiResponse`
- [x] 任务注册表 `taskRegistry`
- [x] 通用任务 `core.structuredMultimodal`
- [x] `POST /api/ai/run`
- [x] 客户端 `aiApiClient` + `useAiTask`
- [x] 客户端 API Key / Base URL / 模型设置（`AiApiSettingsPanel`）
- [x] 自动拉取模型列表并选择视觉模型（`POST /api/ai/models`）
- [x] 日历任务 `calendar.eventFromImage` 接入
- [ ] 限流与审计日志
- [ ] 更多业务模块示例
