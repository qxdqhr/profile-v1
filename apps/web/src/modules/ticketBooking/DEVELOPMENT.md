# ticketBooking 模块 — DEVELOPMENT

## 需求摘要

票务预定 **MVP（无数据库）**：演出列表 → 选座 → 订单确认（模拟支付）。视觉参考 `docs/ticket-booking/design/ticket-booking-mvp.png`。

## 技术方案

- 纯客户端 React + Tailwind；数据为模块内 Mock。
- 路由：`/testField/TicketBooking`，薄 `page.tsx` 挂载于 `(cyhj)`，与 `ShowMasterPieces` 同组。

## 目录结构

见 `03-nextjs-MVP-技术选型与实施清单.md`（仓库 `docs/ticket-booking/`）。

## 开发步骤 checklist

- [x] Step 1：本 DEVELOPMENT.md
- [x] Step 2：类型与 mockData
- [x] Step 3：组件与页面
- [x] Step 4：App 路由 + 实验田注册
- [x] Step 5：自检（`read_lints` 无告警；全仓 `tsc` 受既有 `mmd` 文件错误影响）
