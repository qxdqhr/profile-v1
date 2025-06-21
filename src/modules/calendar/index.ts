/**
 * Calendar 模块 - 主入口文件
 * 
 * 这是一个完整的日历应用模块，提供了从前端组件到后端API的完整解决方案。
 * 主要功能包括：
 * - 日历视图（月视图、周视图、日视图）
 * - 事件管理（创建、编辑、删除）
 * - 重复事件支持
 * - 提醒功能
 * - 用户配置管理
 * - 事件分享功能
 * 
 * 架构特点：
 * - 前后端分离，支持服务端渲染
 * - 模块化设计，便于维护和扩展
 * - TypeScript严格类型检查
 * - TailwindCSS响应式设计
 * 
 * @version 1.0.0
 * @author Profile-v1 Team
 */

// ===== 类型导出 =====
// 导出所有相关的TypeScript类型定义

/** 基础数据类型 */
export type {
  CalendarEvent,
  RecurrenceRule,
  Reminder,
  CalendarConfig,
} from './types';

/** 枚举类型 */
export {
  RecurrenceType,
  ReminderType,
  ReminderStatus,
  CalendarViewType,
  EventColor,
  EventPriority,
  EventSortField,
  SortDirection,
  EventListDisplayMode,
} from './types';

/** 表单和API类型 */
export type {
  EventFormData,
  RecurrenceFormData,
  ReminderFormData,
  CreateEventRequest,
  UpdateEventRequest,
  DeleteEventRequest,
  GetEventsRequest,
  ApiResponse,
  EventsResponse,
  EventResponse,
} from './types';

/** 组件Props类型 */
export type {
  CalendarViewProps,
  EventCardProps,
  EventFormProps,
  EventModalProps,
  MiniCalendarProps,
  EventListProps,
} from './types';

/** 状态管理和Hook类型 */
export type {
  CalendarState,
  CalendarActions,
  UseCalendarReturn,
  UseEventsReturn,
} from './types';

/** 工具和配置类型 */
export type {
  DateRange,
  CalendarCell,
  TimeSlot,
  EventListSort,
  EventListFilter,
  EventListConfig,
  CalendarService as ICalendarService,
  CalendarDbService as ICalendarDbService,
} from './types';

// ===== 工具函数导出 =====
// 日期和日历相关的工具函数

/** 日期工具函数 */
export {
  formatDate,
  formatTime,
  formatDateTime,
  toLocalISOString,
  getMonthStart,
  getMonthEnd,
  getWeekStart,
  getWeekEnd,
  getDayStart,
  getDayEnd,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isToday,
  isWeekend,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  getMonthViewDates,
  getWeekViewDates,
  generateTimeSlots,
  parseDate,
  getDaysDifference,
  isWorkingHour,
  getMonthName,
  getWeekdayName,
  getRelativeTime,
  isValidDate,
  cloneDate,
} from './utils/dateUtils';

// ===== 组件导出 =====
/** 页面组件 */
export { default as CalendarPage } from './pages/CalendarPage';
export { default as EventDetailPage } from './pages/EventDetailPage';

/** 客户端组件 */
export { default as EventForm } from './components/EventForm';
export { default as EventModal } from './components/EventModal';
export { default as EventList } from './components/EventList';
export { default as EventSearch } from './components/EventSearch';
export { default as DraggableEvent } from './components/DraggableEvent';
export { default as DroppableCalendarCell } from './components/DroppableCalendarCell';
export { default as DraggableMonthView } from './components/DraggableMonthView';

// ===== Hook导出 =====
/** 自定义Hook */
export { useEvents } from './hooks/useEvents';
export { useEnhancedEvents } from './hooks/useEnhancedEvents';
export type { UseEnhancedEventsReturn } from './hooks/useEnhancedEvents';
export { useEventDrag } from './hooks/useEventDrag';
export type { UseEventDragReturn, DragState } from './hooks/useEventDrag';

// ===== 服务导出 =====
/** 导出服务 */
export { default as CalendarExportService } from './services/exportService';
export type { ExportOptions } from './services/exportService';

/** 导入服务 */
export { default as CalendarImportService } from './services/importService';
export type { ImportOptions, ImportResult } from './services/importService';

/** 重复事件服务 */
export { RecurrenceService } from './services/recurrenceService';
export type { RecurrenceRule as RecurrenceRuleType, RecurringEventInstance } from './services/recurrenceService';

/** 智能提醒服务 */
export { ReminderService } from './services/reminderService';
export type { ReminderConfig, ScheduledReminder } from './services/reminderService';

// 新增事件类型服务
export * from './services/eventTypeService';

// ===== 模块信息 =====
/** 模块版本号 */
export const CALENDAR_MODULE_VERSION = '1.0.0';

/** 模块名称标识 */
export const CALENDAR_MODULE_NAME = '@profile-v1/calendar';

// ===== 注释说明 =====
/**
 * 注意：以下功能正在开发中，将在后续版本中提供：
 * 
 * 1. 客户端组件导出：
 *    - CalendarView: 主日历视图组件
 *    - EventCard: 事件卡片组件
 *    - EventForm: 事件表单组件
 *    - EventModal: 事件弹窗组件
 *    - MiniCalendar: 迷你日历组件
 * 
 * 2. 页面组件导出：
 *    - CalendarPage: 主日历页面 ✓ 已完成
 *    - EventDetailPage: 事件详情页面
 * 
 * 3. Hook导出：
 *    - useCalendar: 日历数据管理Hook
 *    - useEvents: 事件数据管理Hook
 * 
 * 4. 服务导出：
 *    - CalendarService: 客户端日历服务
 *    - EventService: 事件管理服务
 * 
 * 5. 服务端专用导出：
 *    详情请参考 ./server.ts 文件
 * 
 * 使用方式：
 * ```typescript
 * import { 
 *   CalendarViewType, 
 *   EventColor, 
 *   formatDate,
 *   getMonthViewDates 
 * } from '@/modules/calendar';
 * ```
 */ 