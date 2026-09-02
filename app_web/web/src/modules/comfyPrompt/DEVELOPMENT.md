# ComfyUI 管理模块 — 需求分析与任务计划

> 模块代号：`comfyPrompt`  
> 路由：`/testField/comfyPrompt`  
> API 前缀：`/api/comfyPrompt/*`  
> 最后更新：2026-06-10

---

## 0. 架构硬约束：仅后端请求远端 ComfyUI（必读）

**所有对 ComfyUI Web 服务（HTTP / 可选 WebSocket）的访问，必须由 profile-v1 服务端发起；浏览器禁止直连 Comfy 地址。**

### 0.1 请求链路（固定）

```text
浏览器
  → 只调 profile-v1：/api/comfyPrompt/*
       → Next.js 模块 API（鉴权、校验 user_id）
            → comfyUiClient（Node fetch / 可选 WS 客户端）
                 → 用户配置的 ComfyUI：http(s)://host:8188/...
```

**禁止：**

```text
浏览器 fetch('http://127.0.0.1:8188/prompt')   ❌
浏览器 new WebSocket('ws://192.168.x.x:8188/ws') ❌
```

### 0.2 为什么必须后端代理

| 原因 | 说明 |
|------|------|
| **CORS** | ComfyUI 默认不给你网站域名开跨域，浏览器直连会失败 |
| **内网地址** | 用户填的常常是 `127.0.0.1`、`192.168.x.x`；只有跑在服务器/本机的 **Node 进程** 能稳定访问 |
| **安全** | Comfy 地址不暴露给前端；可做登录校验、按用户隔离、SSRF 防护 |
| **生产 Docker** | 站点在容器里，应由容器内后端去连 `host.docker.internal:8188` 或公网 Comfy |
| **统一错误** | Comfy 超时、队列满、节点错误由后端转成 JSON，前端只展示 |

### 0.3 实现落点（编码时遵守）

| 层级 | 职责 |
|------|------|
| `src/modules/comfyPrompt/services/comfyUiClient.ts` | **唯一**封装对 Comfy 的 `fetch`（及可选 WS） |
| `src/modules/comfyPrompt/api/servers|jobs|comfy/**` | 鉴权后调用 `comfyUiClient`，禁止在 route 里散落裸 URL |
| `hooks/useComfyRemote.ts` | 只请求 `/api/comfyPrompt/...`，**不得**保存或拼接对外 Comfy baseUrl 发请求 |
| 前端页面 | 仅展示 `serverId`、任务状态；Comfy `base_url` 可显示但**不用于** `fetch` |

### 0.4 后端代理 API 示例

```text
POST /api/comfyPrompt/jobs              # 注入 workflow + 调 Comfy POST /prompt
GET  /api/comfyPrompt/jobs/[id]         # 调 Comfy GET /history/{id} 刷新状态
GET  /api/comfyPrompt/jobs/[id]/output/0  # 后端 GET /view 转流或 302
POST /api/comfyPrompt/servers/[id]/health # 后端 GET /object_info 或 /system_stats
```

Phase 2/3 验收项之一：**全仓库 `rg` 无浏览器侧 Comfy 主机 URL 请求**。

---

## 1. 现状调研结论

### 1.1 是否已有模块？

**是。** profile-v1 已存在 `src/modules/comfyPrompt/`，并在实验田注册为「ComfyUI 提示词工作台」。

| 项 | 状态 |
|----|------|
| 磁盘路径 | `src/modules/comfyPrompt/` |
| 薄路由 | `src/app/(pages)/testField/(utility)/comfyPrompt/page.tsx` |
| API 转发 | `src/app/api/comfyPrompt/{groups,prompts,sets,workflows}/**` |
| 数据库 | 4 张表已定义并挂到 `src/db/schema/index.ts` |
| 实验田入口 | `experimentData.ts` → `/testField/comfyPrompt` |
| 分步开发文档 | **此前缺失**（本文档为首次补齐） |

### 1.2 两个目标功能模块完成度

| 功能模块 | 说明 | 完成度 | 备注 |
|----------|------|--------|------|
| **A. 提示词管理** | 提示词库、分组、Tag、提示词组、组装台、工作流 JSON 存档 | **约 85%** | 单页多 Tab 已实现 CRUD + 复制 Prompt；缺搜索增强、导入导出、子路由拆分 |
| **B. 远程调用 Comfy 服务** | 配置 ComfyUI 地址、注入 Prompt/工作流、提交队列、查进度、取结果图 | **0%** | 无 ComfyUI HTTP/WS 客户端、无服务器配置表、无任务历史 |

### 1.3 已有能力清单（模块 A）

- **提示词分组** `comfy_prompt_groups`：正/负向、颜色、排序
- **提示词条目** `comfy_prompts`：内容、权重、Tag、归属分组
- **提示词组（Set）** `comfy_prompt_sets` + `comfy_prompt_set_items`：多词条组合、前后缀、启用开关
- **工作流 JSON 库** `comfy_workflows`：仅存 JSON，**未与 ComfyUI 运行时联动**
- **组装台**：勾选词条/Set，生成 `(word:1.2)` 格式字符串，一键复制
- **鉴权**：`getApiSessionUser`，按 `user_id` 隔离

### 1.4 明确缺失（模块 B 及模块整合）

1. ComfyUI **服务器配置**（多实例、默认实例、连通性检测）
2. **Prompt 注入策略**（工作流中 CLIP Text Encode 节点 ID / 字段映射）
3. **提交任务** `POST /prompt`、**队列查询**、**历史/输出**拉取
4. **任务记录**与失败重试、结果预览（`/view` 或 OSS 转存）
5. UI 上独立的「远程运行」工作区（与提示词管理并列，而非混在一个 Tab）
6. 生产环境 ComfyUI 多为内网地址 — 需 **服务端代理**，避免浏览器直连 CORS/暴露内网

---

## 2. 需求分析

### 2.1 模块定位

**ComfyUI 管理模块** = 个人 ComfyUI 创作辅助中枢，包含两个并列子能力：

1. **提示词管理**：沉淀、组合、复用 Stable Diffusion / ComfyUI 文本提示词资产  
2. **远程调用**：把组装好的 Prompt + 已保存的工作流 JSON，提交到用户配置的 ComfyUI 实例执行，并跟踪结果

目标用户：已在 profile-v1 登录、本地或局域网/云端运行 ComfyUI 的创作者。

### 2.2 功能模块 A — 提示词管理（增强 + 收敛）

#### 2.2.1 用户故事

| ID | 作为用户，我希望… | 以便… |
|----|-------------------|--------|
| A1 | 按分组/Tag/正负面筛选提示词 | 快速找到常用片段 |
| A2 | 创建「提示词组」并调整条目顺序 | 一键组合场景/风格包 |
| A3 | 在组装台勾选词条并设置分隔符/权重格式 | 复制到 ComfyUI 或交给远程模块 |
| A4 | 保存 ComfyUI 导出的 workflow API JSON | 与远程模块联动时复用 |
| A5 | 导入/导出提示词与 Set（JSON/CSV） | 备份与跨环境迁移 |

#### 2.2.2 功能范围（v1 收敛）

**保留并 polish（已有）：**

- 分组 / 词条 / Set / 工作流 JSON CRUD
- 组装台 + 复制到剪贴板

**v1 需补全：**

- [ ] 子路由或清晰 Tab 命名：`提示词管理` 与 `远程运行` 分离
- [ ] 词条/Set 拖拽排序（可选 v1.1）
- [ ] JSON 导入导出（提示词 + Set，v1.1）
- [ ] 与工作流联动的 **节点映射模板**（为模块 B 准备，见 2.3.3）

**明确不做（v1）：**

- 图生图参数编辑器（步数、CFG、Seed 等在 ComfyUI 内完成）
- 在线训练 / LoRA 管理

### 2.3 功能模块 B — 远程调用 Comfy 服务

#### 2.3.1 用户故事

| ID | 作为用户，我希望… | 以便… |
|----|-------------------|--------|
| B1 | 添加一个或多个 ComfyUI 服务地址（如 `http://127.0.0.1:8188`） | 连接家里/服务器上的 Comfy |
| B2 | 测试连接并看到 Comfy 版本/object_info 摘要 | 确认服务可用 |
| B3 | 选择已保存的工作流 + 组装好的正/负 Prompt | 自动写入 workflow JSON 对应节点 |
| B4 | 点击「提交运行」 | 任务进入 Comfy 队列 |
| B5 | 查看队列状态、进度、历史任务与输出图 | 不用切回 ComfyUI 页面 |
| B6 | 失败时看到 Comfy 返回的错误信息 | 快速排障 |

#### 2.3.2 ComfyUI 官方 API 依赖（服务端实现）

| 能力 | ComfyUI HTTP | 说明 |
|------|--------------|------|
| 提交 | `POST {base}/prompt` | body: `{ prompt, client_id }` |
| 队列 | `GET {base}/queue` | 当前/等待任务 |
| 历史 | `GET {base}/history/{prompt_id}` | 输出节点与文件名 |
| 预览 | `GET {base}/view?filename=&subfolder=&type=` | 图片二进制 |
| 节点元数据 | `GET {base}/object_info` | 校验 workflow |
| 进度（可选 v1.1） | `WS {base}/ws?clientId=` | 实时 progress，见 **§2.3.6** |

**实现原则：** 见 **§0 架构硬约束** — 仅后端经 `comfyUiClient` 访问 Comfy；前端只调 `/api/comfyPrompt/*`。

#### 2.3.3 Prompt / 工作流注入

ComfyUI API 格式为 `{ "3": { "inputs": { "text": "..." }, "class_type": "CLIPTextEncode" }, ... }`。

需支持两种模式（v1 至少模式 1）：

1. **映射模板（推荐 v1）**  
   在工作流记录上增加字段：`positiveNodeId`、`negativeNodeId`（或 JSON Path）。  
   提交前服务端 deep-merge 替换 `inputs.text`。

2. **占位符替换（v1.1）**  
   workflow JSON 内写 `{{POSITIVE}}` / `{{NEGATIVE}}` 字符串替换。

组装台输出的正/负 Prompt 字符串，作为模块 B 的默认输入。

#### 2.3.6 任务进度：HTTP 轮询 vs WebSocket（说明）

ComfyUI 跑图时，用户常希望看到「进行到哪一步、百分之几」。有两种拿进度的办法：

**方式 A — HTTP 轮询（建议 v1 默认）**

```text
前端每 2～3 秒 → GET /api/comfyPrompt/jobs/[id]
  → 后端 → Comfy GET /history/{prompt_id} 或 /queue
  → 返回：排队中 / 运行中 / 已完成 / 失败 + 输出图列表
```

- 优点：实现简单，只用到普通 HTTP；与「后端代理」一致；Next.js API Route 好部署  
- 缺点：进度条是「隔几秒跳一下」，不是每一帧都更新；排队时不知道具体算到第几个节点

**方式 B — WebSocket（可选 v1.1）**

ComfyUI 提供 `ws://host:8188/ws?clientId=xxx`。提交任务时带上同一个 `client_id`，Comfy 会通过这条长连接**主动推送**消息，例如：

```json
{ "type": "progress", "data": { "value": 12, "max": 20 } }
{ "type": "executing", "data": { "node": "7" } }
{ "type": "execution_success", ... }
```

- 优点：进度更实时，体验接近 ComfyUI 自带界面  
- 缺点：要在 **Node 后端** 维持到 Comfy 的 WS 连接，并把消息再转给浏览器（例如 SSE 或二次 WS）；Next 无状态部署、多实例时要处理连接挂在哪台机器  

**v1 决策建议：** 先用 **方式 A 轮询** 做到「能提交、能出图、能看到完成/失败」；若你觉得进度条不够丝滑，再在 v1.1 加 **方式 B**（仍遵守 §0：由后端连 Comfy 的 WebSocket，浏览器只连本站 API）。

| 对比 | HTTP 轮询 | WebSocket |
|------|-----------|-----------|
| v1 是否做 | ✅ 推荐 | ⏸ 可选延后 |
| 谁连 Comfy | 后端定时 fetch | 后端长连 WS |
| 前端感知 | 定时刷新任务状态 | 后端转发 progress 事件 |
| 复杂度 | 低 | 中高 |

#### 2.3.4 数据模型（新增表，待实现）

```text
comfy_servers          # 用户 ComfyUI 实例配置
  id, user_id, name, base_url, is_default, enabled
  last_check_at, last_check_ok, last_error, created_at, updated_at

comfy_workflow_bindings  # 工作流 ↔ 节点映射（可合并进 comfy_workflows 扩展字段）
  workflow_id, positive_node_id, negative_node_id, seed_node_id?, extra_inputs json

comfy_jobs               # 提交记录
  id, user_id, server_id, workflow_id?, client_id, prompt_id (comfy)
  status: pending|queued|running|success|failed|cancelled
  positive_prompt, negative_prompt, request_json, response_json, error_message
  created_at, updated_at, completed_at
```

#### 2.3.5 非功能需求

| 类别 | 要求 |
|------|------|
| 安全 | Comfy `base_url` 仅允许 `http(s)`；服务端 SSRF 防护（禁止访问 metadata IP、内网扫描滥用） |
| 鉴权 | 所有配置与任务按 `user_id` 隔离；代理 API 必须登录 |
| 超时 | 提交 30s、轮询历史 60s 可配置 |
| 移动端 | 远程运行页：服务器选择 + 提交 + 结果列表可响应式；大图预览可 pinch/新标签打开 |
| 部署 | 生产 Docker 需能访问用户 Comfy 地址（同机 `host.docker.internal` 或公网 URL） |

### 2.4 模块整合与信息架构

建议 UI 结构（v1）：

```text
/testField/comfyPrompt                 → 概览 / 重定向到 prompts
/testField/comfyPrompt/prompts         → 模块 A（现有 Tab 内容迁移）
/testField/comfyPrompt/run             → 模块 B（远程运行，新建）
```

单页多 Tab **可保留为 v0 兼容**，但任务计划以 **子路由拆分** 为目标，便于独立迭代。

实验田描述更新为：**ComfyUI 管理 — 提示词 + 远程运行**。

---

## 3. 技术方案摘要

### 3.1 目录结构（目标）

```text
src/modules/comfyPrompt/
├── DEVELOPMENT.md              # 本文档
├── api/
│   ├── groups|prompts|sets|workflows/   # 已有
│   ├── servers/                         # 新增：Comfy 实例 CRUD + health
│   ├── jobs/                            # 新增：提交、列表、详情、取消
│   └── comfy/                           # 新增：代理 queue/history/view（可选）
├── db/
│   ├── schema.ts                        # 扩展 servers / jobs
│   └── comfyPromptDbService.ts
├── services/
│   └── comfyUiClient.ts                 # 新增：封装 Comfy HTTP
├── pages/
│   ├── ComfyPromptLayout.tsx            # 子路由壳：顶栏 + 模块切换
│   ├── PromptManagePage.tsx             # 由 ComfyPromptPage 拆分
│   └── RemoteRunPage.tsx                # 模块 B 主界面
├── hooks/
│   ├── useComfyPromptData.ts            # 已有
│   └── useComfyRemote.ts                # 新增
├── utils/
│   ├── buildPrompt.ts                   # 已有
│   └── injectWorkflowPrompt.ts          # 新增
└── types/
    └── index.ts                         # 扩展 Server / Job 类型
```

### 3.2 API 设计草案（模块 B）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/comfyPrompt/servers` | 列表 / 新增 Comfy 实例 |
| PUT/DELETE | `/api/comfyPrompt/servers/[id]` | 更新 / 删除 |
| POST | `/api/comfyPrompt/servers/[id]/health` | 连通性检测 |
| GET/POST | `/api/comfyPrompt/jobs` | 历史列表 / 提交任务 |
| GET | `/api/comfyPrompt/jobs/[id]` | 任务详情 + 刷新 Comfy 状态 |
| POST | `/api/comfyPrompt/jobs/[id]/cancel` | 取消（调 Comfy queue delete，v1.1） |
| GET | `/api/comfyPrompt/jobs/[id]/output/[index]` | 代理输出图（或签名 URL） |

提交 body 示例：

```json
{
  "serverId": 1,
  "workflowId": 3,
  "positivePrompt": "1girl, ...",
  "negativePrompt": "low quality, ...",
  "seed": 123456789
}
```

---

## 4. 差距分析汇总

| 维度 | 模块 A | 模块 B |
|------|--------|--------|
| DB | ✅ 已有 4 表 | ❌ 需 servers + jobs（+ 映射字段） |
| API | ✅ CRUD 完整 | ❌ 全新 |
| 前端 | ✅ 单页 Tab | ❌ 远程运行页 + 布局拆分 |
| 与 Comfy 协议 | ❌ 无 | ❌ 需 comfyUiClient + 代理 |
| 文档 | ❌ → ✅ 本文档 | 同上 |
| 实验田 | ✅ 已注册 | 需更新文案 |

---

## 5. 任务计划（分阶段）

### Phase 0 — 文档与结构对齐 ✅ 进行中

- [x] 现状调研
- [x] 需求分析与任务计划（本文档）
- [x] 架构硬约束：仅后端请求远端 ComfyUI（§0）
- [x] 评审确认：子路由方案、SSRF 策略；**v1 进度用 HTTP 轮询（WebSocket 放 v1.1）** ✅ 已确认

### Phase 1 — 模块 A 收敛（预计 1–2 天）

- [x] 新增 `ComfyPromptLayout` + 子路由 `prompts` / `run`
- [x] 将现有 `ComfyPromptPage` 迁为 `PromptManagePage`（导出别名，layout 承载鉴权）
- [x] 扩展 `comfy_workflows`：`positiveNodeId` / `negativeNodeId` / `seedNodeId` 字段 + 表单
- [x] 组装台增加「前往远程运行」按钮（sessionStorage 草稿跳转 run 页）
- [x] 更新实验田标题/描述
- [x] `pnpm devdb:push` 验证 schema

### Phase 2 — 模块 B 后端（预计 2–3 天）

- [x] schema：`comfy_servers`、`comfy_jobs`（+ workflow 映射字段）
- [x] `comfyUiClient.ts`：`healthCheck`、`queuePrompt`、`getHistory`、`getQueue`
- [x] SSRF 校验工具：`validateComfyBaseUrl`
- [x] API：`servers` CRUD + `health`
- [x] API：`jobs` POST（inject workflow + 提交）+ GET 列表/详情 + output 代理
- [x] 注册 `src/db/schema/index.ts`（表已在模块 schema 导出）；dev/prod push 待执行

### Phase 3 — 模块 B 前端（预计 2–3 天）

- [x] `RemoteRunPage`：服务器管理、选择工作流、正/负 Prompt、Seed
- [x] 提交与轮询 UI（3s interval HTTP 轮询）
- [x] 结果图网格 + 代理图片链接
- [x] 错误态与 Comfy 不可用提示
- [x] 桌面 + 移动端布局（Tailwind）

### Phase 4 — 联调与增强（预计 1–2 天）

- [ ] 端到端：组装台 → 远程页 → 提交 → 出图
- [ ] 生产 Docker 访问 Comfy 地址说明（env / network）
- [ ] 可选 v1.1：后端连 Comfy WebSocket，经 SSE/WS 转发实时进度（见 §2.3.6）
- [ ] 可选：导入导出提示词 JSON（v1.1）

### Phase 5 — 验收标准

- [ ] 登录用户可 CRUD 提示词资产（模块 A 回归）
- [ ] 可配置 Comfy 地址并通过 health check
- [ ] 可选择工作流 + Prompt 成功提交并在 UI 看到输出图
- [ ] 未登录 / 跨用户数据不可访问
- [ ] `pnpm build` 通过

---

## 6. 风险与依赖

| 风险 | 缓解 |
|------|------|
| ComfyUI 与 Docker 网络不通 | 文档说明 `host.docker.internal`；支持公网 HTTPS Comfy |
| workflow 节点 ID 因重新导出而变化 | 映射模板可编辑；保存时校验节点仍存在 |
| 大图代理占带宽 | v1 直接 redirect/view；v1.1 可转 OSS |
| SSRF | 白名单协议 + 禁止私网段（可按部署放宽） |

**外部依赖：** 用户自备 ComfyUI 实例（带 API 启用，默认 8188）。

---

## 7. 相关文件索引（当前仓库）

| 文件 | 说明 |
|------|------|
| `src/modules/comfyPrompt/pages/ComfyPromptPage.tsx` | 当前合一页面（~900 行） |
| `src/modules/comfyPrompt/db/schema.ts` | 现有 4 表 |
| `src/modules/comfyPrompt/hooks/useComfyPromptData.ts` | 前端数据层 |
| `src/modules/testField/utils/experimentData.ts` | 实验田入口 |
| `.cursor/KNOWLEDGE_BASE.md` | 模块 / API 挂载约定 |

---

## 8. 变更记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-06-10 | 0.1 | 初版：现状调研 + 双模块需求 + 分阶段任务计划 |
| 2026-06-10 | 0.2 | 补充 §0 后端代理硬约束；§2.3.6 WebSocket 与轮询说明 |
| 2026-06-10 | 0.3 | 确认 v1 HTTP 轮询；完成 Phase 1–3 编码（Layout、servers/jobs API、RemoteRunPage） |

**下一步：** Phase 4 端到端联调（需本机 ComfyUI）；v1.1 再加 WebSocket 实时进度。
