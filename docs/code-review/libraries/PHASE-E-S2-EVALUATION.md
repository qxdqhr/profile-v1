# Phase E：S2 下沉评估（calendar / teach-hub / showmasterpiece）

> 日期：2026-09-03  
> 结论：**维持 S1 冻结**；接单客户仓优先用 `sa2kit/common/*` + 已试点 `business/festivalCard`；大域 S2 待「第二非 profile 宿主必须复用同一业务 UI+API」时再开。

## 1. 背景（蓝图 §12.1）

| 策略 | 含义 |
|------|------|
| **S1 冻结** | `*-core` 继续服务 Web/RN；新多端优先进 sa2kit `business/*` |
| **S2 下沉** | 从 `*-core` 抽 `domain` + `ui/*` 到 `sa2kit/business/<name>`，core 改 re-export |
| **S3 新域** | 新业务禁止新建巨大 `*-core`，直接 `sa2kit/business/*` |

## 2. 三域体量与现状

| 域 | core 包 | 子应用 | RN | 网关 API | 估算规模 |
|----|---------|--------|-----|----------|----------|
| **calendar** | `@profile/calendar-core` | `/calendar` | calendar-mobile | `/api/calendar/*` | 中（AI 识图已走 sa2kit aiApi） |
| **teach-hub** | `@profile/teach-hub-core` | `/teach-hub` | teach-hub-mobile | `/api/teach-hub/*` | 中（AI lesson 已注册 sa2kit 任务） |
| **showmasterpiece** | `@profile/showmasterpiece-core` | `/showmasterpiece` | — | `/api/showmasterpiece/*` | **大**（~25k 行级，动森 UI 已 cutover） |

**已完成的「弹药库化」**（不必等 S2）：

- UI：经 `sa2kit/common/ui*`（Phase U ✅）
- AI：`sa2kit/common/aiApi`（主站 `lib/ai/*` 薄层）
- 鉴权：`sa2kit/common/auth` + `@profile/auth`
- 文件：`sa2kit/common/file` + core 内 integrations

## 3. S2 触发条件（何时值得做）

满足 **≥1** 时再排 S2：

1. 独立 **Taro 小程序** 或 **第二 RN 宿主** 需要完整 calendar/teach-hub **业务 UI + API**，且不能 WebView 壳整页加载 profile 子应用。
2. **付费客户仓** 合同明确要求「日历/教辅/画集」作为 npm 域包交付，而非 fork `*-core`。
3. sa2kit `dist/business` 已拆包或 Metro 证明 **无法** 通过子路径 tree-shake 隔离 Three/MMD 对大域的牵连（当前 MMD ~3.2MB 已独立 entry）。

**当前未触发**：calendar-mobile / teach-hub-mobile 已通过 `*-core/shared` + API 接线；无第二小程序宿主；showmasterpiece 无 RN 计划。

## 4. 分域建议

### calendar — S2 优先级：**低**（2026 Q4 再评）

| 项 | 评估 |
|----|------|
| 下沉收益 | 小程序原生日历 UI 可复用 |
| 成本 | schema/API/RN 三端契约重做；与 ST-09 cutover 冲突 |
| 建议 | 保持 core；新能力（如共享 `domain` 类型）可先抽到 `sa2kit/business/calendar/domain` **仅类型**，不搬 UI |

### teach-hub — S2 优先级：**低**

| 项 | 评估 |
|----|------|
| 下沉收益 | 独立教辅小程序 |
| 成本 | 工作区/OSS/AI 编排与 teach-hub-core 强绑定 |
| 建议 | 维持 S1；`generateLessonTask` 已在 sa2kit 任务面 |

### showmasterpiece — S2 优先级：**暂缓**

| 项 | 评估 |
|----|------|
| 下沉收益 | 画集作为产品 SDK 外售 |
| 成本 | 体量最大；独立 Docker 发布链已成熟 |
| 建议 | **长期 S1**；仅当画集 SaaS 化再评估 `@sa2kit/business-showmasterpiece` 独立包 |

## 5. 与启明星（接单）的关系

客户仓 **默认组合**（无需 S2）：

```
sa2kit/common/{auth,file,config,aiApi,ui}
+ 可选 sa2kit/business/festivalCard（Phase C 模板）
+ 自研业务页
```

`*-core` 大域 **不是** 接单默认依赖；profile 子应用是验证场与自用站，不是 npm 交付物。

## 6. 决策

| # | 决定 | 有效期 |
|---|------|--------|
| 1 | calendar / teach-hub / showmasterpiece **继续 S1** | 至出现 §3 触发条件 |
| 2 | 新多端业务 **S3**：直接 `sa2kit/business/*`（festivalCard 已示范） |
| 3 | 类型/shared API 可渐进抽取 `domain/`，**不**搬 Docker 子应用 |

## 7. 后续跟踪

- [ ] 小程序宿主立项时，重评 calendar S2（优先 `domain` + `ui/taro` stub）
- [ ] `pnpm --filter sa2kit measure:dist` 纳入 CI 月度报告（见 sa2kit `docs/PACKAGE-SPLIT-ROADMAP.md`）
- [ ] showmasterpiece 若拆 SaaS，单独立项 ADR
