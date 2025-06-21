import { db } from '@/db';
import { and, eq, gte, lte, desc, asc } from 'drizzle-orm';
import {
  calendarEvents,
  recurrenceRules,
  reminders,
  calendarConfigs,
  eventShares
} from './schema';

/**
 * 简化版日历数据库服务
 * 
 * 提供基础的数据库操作，避免复杂的类型转换
 * 后续可以根据需要逐步完善
 */
class CalendarDbService {
  
  // ===== 事件基础操作 =====

  /**
   * 获取用户的所有事件（基础版本）
   */
  async getAllEvents(userId: number, startDate?: Date, endDate?: Date) {
    const conditions = [eq(calendarEvents.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(calendarEvents.startTime, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(calendarEvents.endTime, endDate));
    }

    const events = await db
      .select()
      .from(calendarEvents)
      .where(and(...conditions))
      .orderBy(asc(calendarEvents.startTime));

    return events;
  }

  /**
   * 根据ID获取事件
   */
  async getEventById(eventId: number) {
    const [event] = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.id, eventId))
      .limit(1);

    return event || null;
  }

  /**
   * 创建事件（基础版本）
   */
  async createEvent(eventData: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    allDay: boolean;
    location?: string;
    color: string;
    userId: number;
  }) {
    const [newEvent] = await db
      .insert(calendarEvents)
      .values(eventData)
      .returning();

    return newEvent;
  }

  /**
   * 更新事件
   */
  async updateEvent(eventId: number, eventData: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    allDay?: boolean;
    location?: string;
    color?: string;
  }) {
    const updateData = {
      ...eventData,
      updatedAt: new Date()
    };

    const [updatedEvent] = await db
      .update(calendarEvents)
      .set(updateData)
      .where(eq(calendarEvents.id, eventId))
      .returning();

    return updatedEvent;
  }

  /**
   * 删除事件
   */
  async deleteEvent(eventId: number): Promise<void> {
    await db
      .delete(calendarEvents)
      .where(eq(calendarEvents.id, eventId));
  }

  // ===== 用户配置操作 =====

  /**
   * 获取用户的日历配置
   */
  async getUserConfig(userId: number) {
    const [config] = await db
      .select()
      .from(calendarConfigs)
      .where(eq(calendarConfigs.userId, userId))
      .limit(1);

    return config || null;
  }

  /**
   * 创建或更新用户配置
   */
  async upsertUserConfig(userId: number, configData: {
    firstDayOfWeek?: number;
    workingHoursStart?: string;
    workingHoursEnd?: string;
    timeZone?: string;
    dateFormat?: string;
    timeFormat?: string;
    defaultView?: string;
    defaultEventColor?: string;
    weekends?: boolean;
    eventColors?: Record<string, string>;
  }) {
    const existingConfig = await this.getUserConfig(userId);

    if (existingConfig) {
      // 更新现有配置
      const [updatedConfig] = await db
        .update(calendarConfigs)
        .set({
          ...configData,
          updatedAt: new Date()
        })
        .where(eq(calendarConfigs.userId, userId))
        .returning();

      return updatedConfig;
    } else {
      // 创建新配置
      const [newConfig] = await db
        .insert(calendarConfigs)
        .values({
          userId,
          ...configData
        })
        .returning();

      return newConfig;
    }
  }

  // ===== 重复规则基础操作 =====

  /**
   * 为事件创建重复规则
   */
  async createRecurrenceRule(ruleData: {
    eventId: number;
    ruleType: string;
    interval: number;
    endDate?: Date;
    count?: number;
    byWeekday?: number[];
    byMonthday?: number[];
    byMonth?: number[];
  }) {
    const [newRule] = await db
      .insert(recurrenceRules)
      .values(ruleData)
      .returning();

    return newRule;
  }

  /**
   * 获取事件的重复规则
   */
  async getRecurrenceRule(eventId: number) {
    const [rule] = await db
      .select()
      .from(recurrenceRules)
      .where(eq(recurrenceRules.eventId, eventId))
      .limit(1);

    return rule || null;
  }

  /**
   * 删除重复规则
   */
  async deleteRecurrenceRule(eventId: number): Promise<void> {
    await db
      .delete(recurrenceRules)
      .where(eq(recurrenceRules.eventId, eventId));
  }

  // ===== 提醒基础操作 =====

  /**
   * 为事件创建提醒
   */
  async createReminder(reminderData: {
    eventId: number;
    reminderTime: Date;
    reminderType: string;
    status?: string;
  }) {
    const [newReminder] = await db
      .insert(reminders)
      .values({
        ...reminderData,
        status: reminderData.status || 'pending'
      })
      .returning();

    return newReminder;
  }

  /**
   * 获取事件的提醒列表
   */
  async getEventReminders(eventId: number) {
    const remindersList = await db
      .select()
      .from(reminders)
      .where(eq(reminders.eventId, eventId))
      .orderBy(asc(reminders.reminderTime));

    return remindersList;
  }

  /**
   * 删除事件的所有提醒
   */
  async deleteEventReminders(eventId: number): Promise<void> {
    await db
      .delete(reminders)
      .where(eq(reminders.eventId, eventId));
  }

  // ===== 统计和查询 =====

  /**
   * 获取用户在指定时间范围内的事件数量
   */
  async getEventCount(userId: number, startDate?: Date, endDate?: Date): Promise<number> {
    const conditions = [eq(calendarEvents.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(calendarEvents.startTime, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(calendarEvents.endTime, endDate));
    }

    const result = await db
      .select({ count: calendarEvents.id })
      .from(calendarEvents)
      .where(and(...conditions));

    return result.length;
  }

  /**
   * 搜索事件
   */
  async searchEvents(userId: number, searchTerm: string) {
    // 这里使用简单的标题匹配，后续可以扩展为全文搜索
    const events = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.userId, userId),
          // 使用 ILIKE 进行不区分大小写的搜索
        )
      )
      .orderBy(desc(calendarEvents.startTime));

    // 在应用层进行搜索，暂时避免复杂的SQL查询
    return events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  /**
   * 批量删除用户的所有事件
   */
  async deleteAllUserEvents(userId: number): Promise<void> {
    await db
      .delete(calendarEvents)
      .where(eq(calendarEvents.userId, userId));
  }
}

// 导出单例实例
export const calendarDbService = new CalendarDbService();
export default calendarDbService; 