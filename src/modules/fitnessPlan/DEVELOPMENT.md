# 健身计划模块开发文档

## 模块概述

个人健身计划管理工具：训练计划、日历排期、力量/有氧执行、饮食记录（含截图）、跨子功能打卡、数据统计。UI 采用 animal-island-ui，状态用 Zustand 跨子路由共享。

- **根路由**：`/testField/fitnessPlan`
- **API 前缀**：`/api/fitnessPlan`
- **参考模块**：`ideaList`（DB + Auth）、`calendar`（月历组件复制）

---

## 路由结构

| 路由 | 页面 | Phase |
|------|------|-------|
| `/testField/fitnessPlan` | 今日首页 | 1 ✓ / 6 |
| `/testField/fitnessPlan/plans` | 训练计划列表 | 2 |
| `/testField/fitnessPlan/plans/[planId]` | 计划详情编排 | 2 |
| `/testField/fitnessPlan/schedule` | 训练日历 | 3 |
| `/testField/fitnessPlan/workout` | 训练记录列表 | 4 |
| `/testField/fitnessPlan/workout/[sessionId]` | 训练执行 | 4 |
| `/testField/fitnessPlan/diet` | 饮食记录 | 5 |
| `/testField/fitnessPlan/checkin` | 打卡中心 | 6 |
| `/testField/fitnessPlan/stats` | 数据统计 | 7 |
| `/testField/fitnessPlan/settings` | 设置 | 1 ✓ / 2 |

---

## Phase 1 — 脚手架

- [x] 模块目录与 `DEVELOPMENT.md`
- [x] Drizzle schema（全表）+ `src/db/schema/index.ts` 注册
- [x] `fitnessPlanDbService`（档案、今日打卡）
- [x] API：`GET/PUT /profile`、`GET /checkins/today`
- [x] Zustand store（profile / ui / activeWorkout / checkinToday / scheduleView）
- [x] `FitnessPlanLayout`（Sidebar + 移动底栏 + Auth）
- [x] 全部子路由薄 page + 占位页
- [x] 实验田 `experimentData.ts` 注册
- [x] `pnpm devdb:push` 测试环境表结构
- [x] 构建通过

## Phase 2 — 动作库 + 计划（当前）

- [x] seed 内置动作 JSON（45 条）
- [x] 动作 CRUD API + 动作库 Modal
- [x] 计划 CRUD + 计划详情编排
- [x] 3 套系统模板 seed（推拉腿 / Upper-Lower / 有氧力量）
- [x] settings 页档案编辑

## Phase 3 — 训练日历

- [ ] 从 `calendar` 复制组件到 `components/calendar/`
- [ ] 周循环模板 + 单日 override API
- [ ] schedule 页月视图 + Day Sheet

## Phase 4 — 训练执行

- [ ] 会话 API（开练/组记录/完成）
- [ ] `activeWorkout` 与 API 恢复
- [ ] 力量组记录 + 有氧记录 + 组间倒计时
- [ ] 完成训练 → 自动训练打卡

## Phase 5 — 饮食

- [ ] seed 食物库（≥80）
- [ ] 饮食 CRUD API
- [ ] 截图上传 `POST /diet/upload`
- [ ] diet 页按日查看 + 缩略图
- [ ] 首条饮食 → 饮食打卡

## Phase 6 — 打卡 + 今日首页

- [ ] 手动综合日打卡 API
- [ ] checkin 页热力图 + streak
- [ ] 今日首页四象限进度 + 快捷入口
- [ ] 日历单元格角标联动

## Phase 7 — 统计 + 打磨

- [ ] stats API + 趋势图
- [ ] PR 墙、部位分布
- [ ] 移动端训练全屏、空态、错误态

---

## 目录结构

```
src/modules/fitnessPlan/
├── DEVELOPMENT.md
├── index.ts
├── fitness-plan.css
├── layout/FitnessPlanLayout.tsx
├── store/fitnessPlanStore.ts
├── types/index.ts
├── db/schema.ts
├── db/fitnessPlanDbService.ts
├── api/profile/route.ts
├── api/checkins/today/route.ts
├── pages/
├── components/
├── hooks/          (Phase 2+)
├── services/       (Phase 2+)
└── data/           (Phase 2+ seed)
```

---

## 数据表

见 `db/schema.ts`：`fitness_profiles`、`exercises`、`workout_plans`、`workout_plan_items`、`schedule_templates`、`schedule_overrides`、`workout_sessions`、`workout_session_items`、`workout_sets`、`food_items`、`diet_logs`、`diet_log_entries`、`daily_checkins`。
