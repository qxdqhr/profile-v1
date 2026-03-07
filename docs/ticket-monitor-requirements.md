# 日本动画演出开票信息聚合平台（测试路由版）需求分析

## 1. 项目背景

当前需要在 `profile-v1` 仓库内快速落地一个可运行的 Web 测试能力，用于：

- 聚合并查阅日本动画相关演出开票信息
- 覆盖首批目标渠道：`eplus`、`asobistore`、`piapro`
- 支持从聚合列表一键跳转至演出官方主页

目标是先搭建一个可演示、可扩展的测试路由，再逐步演进为稳定生产能力。

---

## 2. 目标与范围

### 2.1 核心目标（MVP）

1. 提供统一列表页展示多来源演出开票信息
2. 支持基础筛选（关键词、来源平台、开票状态）
3. 支持跳转到演出官方页面
4. 提供抓取时间与来源标识，便于核验

### 2.2 当前阶段范围（测试路由）

- 在 `profile-v1` 中新增测试页面路由（建议：`/testField/ticketMonitor`）
- 新增聚合 API（建议：`/api/ticket-monitor/events`）
- 先使用“适配器 + mock/半真实数据”结构，保证页面可用
- 预留后续接入真实源站抓取与调度任务能力

### 2.3 暂不纳入（后续迭代）

- 完整登录订阅体系（用户个人提醒偏好）
- 多渠道主动通知（邮件/IM/Webhook）
- 多语言国际化与复杂权限管理

---

## 3. 用户与使用场景

### 3.1 目标用户

- 关注日本动画、声优、二次元演出开票动态的用户

### 3.2 关键场景

1. 用户打开页面，查看近期即将开票/售卖中的演出
2. 用户按关键词（如“初音未来”“LoveLive”）过滤条目
3. 用户点击条目后跳转官方售票/演出详情页
4. 用户查看条目“最后抓取时间”，判断信息新鲜度

---

## 4. 功能需求

## 4.1 页面层（前端）

1. 演出列表展示
   - 字段：演出标题、平台来源、开票时间、状态、地区（可选）、链接
2. 筛选与排序
   - 关键词搜索
   - 平台筛选（eplus/asobistore/piapro）
   - 状态筛选（未开票/售卖中/已结束）
   - 时间排序（默认按开票时间升序）
3. 跳转能力
   - 点击“前往官网”在新标签页打开

## 4.2 API 层（后端）

1. 聚合接口
   - `GET /api/ticket-monitor/events`
2. 查询参数（建议）
   - `q`：关键词
   - `source`：平台（可多选）
   - `status`：状态
   - `limit`：返回条数
3. 返回结构统一
   - `id`, `title`, `source`, `ticketOpenAt`, `status`, `eventUrl`, `fetchedAt`

## 4.3 适配器层（数据源）

为每个平台定义独立适配器：

- `eplusAdapter`
- `asobistoreAdapter`
- `piaproAdapter`

每个适配器输出统一结构，聚合层只处理标准化结果。

---

## 5. 非功能需求

1. 性能
   - 首屏接口响应尽量 < 1.5s（缓存命中）
2. 稳定性
   - 某单一来源失败不影响整体返回（部分可用）
3. 可观测性
   - 记录抓取失败日志、来源超时日志
4. 合规
   - 遵循目标站点 ToS/robots 约束
   - 优先使用公开接口与可合法抓取页面数据

---

## 6. 数据模型（建议）

```ts
interface TicketEvent {
  id: string;
  title: string;
  source: 'eplus' | 'asobistore' | 'piapro';
  ticketOpenAt: string; // ISO
  status: 'upcoming' | 'on_sale' | 'ended' | 'unknown';
  eventUrl: string;
  coverImage?: string;
  location?: string;
  tags?: string[];
  fetchedAt: string; // ISO
}
```

---

## 7. 技术方案（当前仓库适配）

- 前端：Next.js App Router（沿用 `profile-v1`）
- UI：Tailwind（沿用仓库规范）
- API：`src/app/api/ticket-monitor/events/route.ts`
- 页面：`src/app/(pages)/testField/(utility)/ticketMonitor/page.tsx`
- 实验入口：在 `src/modules/testField/utils/experimentData.ts` 新增测试入口项

---

## 8. 迭代计划

### 里程碑 M1（当前）
- 测试路由可访问
- 聚合 API 可返回统一结构数据
- 页面可筛选并跳转

### 里程碑 M2
- 接入真实源站解析 + 缓存
- 增加状态计算与更新提示

### 里程碑 M3
- 通知系统（开票前提醒）
- 用户订阅与个性化关键词

---

## 9. 风险与应对

1. 源站结构变更导致解析失效
   - 应对：适配器隔离 + 单源失败降级
2. 抓取频率与合规风险
   - 应对：限频、缓存、优先合法公开数据接口
3. 数据时效性不足
   - 应对：增量轮询 + 抓取时间展示 + 异常告警

---

## 10. 验收标准（M1）

1. 访问测试路由能看到聚合演出列表
2. 至少包含 3 个来源标识（eplus/asobistore/piapro）
3. 点击条目可正确跳转官方页面
4. 支持关键词筛选并能实时更新结果
5. API 返回结构字段完整、格式统一

---

## 11. 下一步执行建议

1. 先完成 M1 的页面 + API + 适配器骨架
2. 用 mock 数据验证交互与结构正确性
3. 再逐步替换为真实数据抓取逻辑

