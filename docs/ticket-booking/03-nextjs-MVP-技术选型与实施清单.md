# 03 — Next.js 平台 MVP 技术选型与实施清单

## 1. 技术边界（已定）

| 层级 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js App Router | 薄 `page.tsx` 仅 re-export 模块页 |
| UI | Tailwind CSS + React 客户端组件 | 与全仓一致 |
| 数据 | 前端静态 Mock | MVP 无 Drizzle / PostgreSQL |
| 部署路径 | `/testField/TicketBooking` | 挂载于 `src/app/(pages)/testField/(cyhj)/TicketBooking/` |
| 模块目录 | `src/modules/ticketBooking/` | 与 `KNOWLEDGE_BASE` 3.1 纯工具模块一致 |

## 2. 与 ShowMasterpiece 的对照

| 维度 | ShowMasterPieces | 本模块 MVP |
|------|------------------|------------|
| 路由组 | `(cyhj)` | 相同 |
| 页面封装 | 薄 `page.tsx` + 客户端包装 | 薄 `page.tsx` → 模块内 `TicketBookingMvpPage` |
| 后端 | sa2kit + API 众多 | 无 API |
| 业务形态 | 画集 + 预订等 | 票务三步骤演示 |

## 3. 模块结构（实现清单）

```
src/modules/ticketBooking/
├── DEVELOPMENT.md
├── index.ts
├── types/index.ts
├── utils/mockData.ts
├── components/
│   ├── index.ts
│   ├── PerformanceList.tsx
│   └── SeatMapGrid.tsx
└── pages/TicketBookingMvpPage.tsx
```

## 4. 关键实现要点

- **状态机**：`step: 'list' | 'seats' | 'confirm'` + `selectedPerformance` + `selectedSeatIds: Set<string>`。
- **座位编码**：建议 `{row}-{col}`，展示层格式化为「A 排 4 号」。
- **已售模拟**：按 `performance.id` 派生固定集合，避免每次随机不一致。
- **服务费**：与 PRD 一致（如固定 ¥15 或 2%），在确认页单列。

## 5. 实验田注册

在 `src/modules/testField/utils/experimentData.ts` 数组**末尾**追加条目；`path` 与磁盘路由大小写一致。

## 6. 后续迭代（超出 MVP）

- Drizzle schema：`performances`、`showtimes`、`seats`、`orders`、`order_items`。
- 锁座 API + 短 TTL；支付回调对接。
- 管理端排期与座位图编辑器。
