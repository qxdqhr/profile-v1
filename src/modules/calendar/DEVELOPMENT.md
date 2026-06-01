# 日历模块重构开发记录

## 已完成（2026-06）

### 架构
- [x] `CalendarPage` 瘦身为编排层，视图拆至独立组件
- [x] `CalendarToolbar` / `CalendarWeekView` / `CalendarDayView` / `DayEventsSheet`
- [x] `utils/eventDisplay.ts` 统一颜色与优先级样式

### 活动管理
- [x] 编辑保存走 `updateEvent`（修复原先仅 `createEnhancedEvent` 的问题）
- [x] 删除统一经 `ConfirmModal` 确认
- [x] Toast 替代 `alert`
- [x] 移动端：点击日期 → `DayEventsSheet` 列出当日活动，可编辑/删除/新建
- [x] 月格「+N 项」与数量角标打开同日面板

### UI（make-interfaces-feel-better）
- [x] 阴影替代硬边框卡片
- [x] `active:scale-[0.96]` 按压反馈
- [x] `tabular-nums` 用于日期/数量
- [x] `text-balance` / `text-pretty` 标题与说明
- [x] 指定 `transition-[property]`，避免 `transition: all`
- [x] 交互控件最小约 40×40px 点击区域

### 待办
- [ ] 编辑模式完整支持多天/重复事件元数据
- [ ] 设置项真正作用于视图（`CalendarSettings` 持久化）
