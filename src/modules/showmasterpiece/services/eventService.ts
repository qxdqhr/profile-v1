/**
 * ShowMasterpiece 活动服务
 * 
 * 处理活动相关的业务逻辑，包括活动解析、数据隔离等。
 */

import { db } from '@/db';
import { showmasterEvents, comicUniverseCollections } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

/**
 * 活动解析结果
 */
export interface EventResolution {
  eventId: number;
  event: typeof showmasterEvents.$inferSelect;
}

/**
 * 活动服务类
 */
export class EventService {
  /**
   * 解析活动参数
   * 支持以下格式：
   * - 数字ID: "1", "2"
   * - 字符串ID: "1", "2"
   * - slug: "event-1", "event-2"
   * - null/undefined: 使用默认活动
   */
  static async resolveEvent(eventParam?: string | null): Promise<EventResolution> {
    console.log('🔍 [EventService] 解析活动参数:', eventParam);

    // 如果没有提供活动参数，使用默认活动
    if (!eventParam) {
      return this.getDefaultEvent();
    }

    // 尝试解析为数字ID
    const numericId = parseInt(eventParam);
    if (!isNaN(numericId)) {
      const events = await db.select()
        .from(showmasterEvents)
        .where(eq(showmasterEvents.id, numericId))
        .limit(1);

      if (events.length > 0) {
        console.log('✅ [EventService] 通过ID找到活动:', events[0].name);
        return {
          eventId: events[0].id,
          event: events[0]
        };
      }
    }

    // 尝试作为slug查找
    const events = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.slug, eventParam))
      .limit(1);

    if (events.length > 0) {
      console.log('✅ [EventService] 通过slug找到活动:', events[0].name);
      return {
        eventId: events[0].id,
        event: events[0]
      };
    }

    // 如果都找不到，抛出错误
    throw new Error(`活动 "${eventParam}" 不存在`);
  }

  /**
   * 获取默认活动
   */
  static async getDefaultEvent(): Promise<EventResolution> {
    // 首先尝试获取标记为默认的活动
    const defaultEvents = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.isDefault, true))
      .limit(1);

    if (defaultEvents.length > 0) {
      console.log('✅ [EventService] 使用默认活动:', defaultEvents[0].name);
      return {
        eventId: defaultEvents[0].id,
        event: defaultEvents[0]
      };
    }

    // 如果没有默认活动，使用第一个活动（按排序顺序）
    const events = await db.select()
      .from(showmasterEvents)
      .orderBy(showmasterEvents.sortOrder, showmasterEvents.id)
      .limit(1);

    if (events.length > 0) {
      console.log('✅ [EventService] 使用第一个活动:', events[0].name);
      return {
        eventId: events[0].id,
        event: events[0]
      };
    }

    throw new Error('系统中没有任何活动，请先创建活动');
  }

  /**
   * 获取所有活动
   */
  static async getAllEvents() {
    return db.select()
      .from(showmasterEvents)
      .orderBy(showmasterEvents.sortOrder, showmasterEvents.createdAt);
  }

  /**
   * 检查活动是否存在
   */
  static async eventExists(eventParam: string): Promise<boolean> {
    try {
      await this.resolveEvent(eventParam);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取活动详情
   */
  static async getEventById(eventId: number) {
    const events = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.id, eventId))
      .limit(1);

    return events[0] || null;
  }

  /**
   * 获取活动详情（通过slug）
   */
  static async getEventBySlug(slug: string) {
    const events = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.slug, slug))
      .limit(1);

    return events[0] || null;
  }

  /**
   * 验证用户是否有访问特定活动的权限
   * （目前所有活动都是公开的，未来可以扩展权限控制）
   */
  static async validateEventAccess(eventId: number, userId?: number): Promise<boolean> {
    const event = await this.getEventById(eventId);
    
    if (!event) {
      return false;
    }

    // 检查活动状态
    if (event.status === 'archived') {
      // 归档的活动可能需要特殊权限
      // 这里暂时允许所有用户访问
      return true;
    }

    if (event.status === 'draft') {
      // 草稿状态的活动可能需要管理员权限
      // 这里暂时允许所有用户访问
      return true;
    }

    return true;
  }
}

/**
 * 构建活动相关的数据库查询条件
 */
export function buildEventCondition(eventId: number) {
  return eq(comicUniverseCollections.eventId, eventId);
}

// 导出常用的活动相关函数
export const {
  resolveEvent,
  getDefaultEvent,
  getAllEvents,
  eventExists,
  getEventById,
  getEventBySlug,
  validateEventAccess
} = EventService;
