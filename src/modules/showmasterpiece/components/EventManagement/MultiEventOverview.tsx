/**
 * 多活动管理总览组件
 * 
 * 提供所有活动的管理界面，包括活动列表、创建、编辑、删除等功能。
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Settings, 
  Calendar,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react';
import { Event, EventSelector } from './EventSelector';
import { EventCreator, EventFormData, CreateEventOptions } from './EventCreator';

interface EventStats {
  categoriesCount: number;
  tagsCount: number;
  collectionsCount: number;
  publishedCollectionsCount: number;
}

interface EventWithStats extends Event {
  stats?: EventStats;
}

interface MultiEventOverviewProps {
  /** 当前选中的活动 */
  currentEvent?: Event | null;
  /** 活动切换回调 */
  onEventChange: (event: Event) => void;
  /** 是否有管理权限 */
  hasAdminAccess: boolean;
}

/**
 * 获取活动状态图标
 */
function getStatusIcon(status: Event['status']) {
  switch (status) {
    case 'active':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'draft':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'archived':
      return <Archive className="w-4 h-4 text-gray-500" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-gray-500" />;
  }
}

/**
 * 活动管理服务
 */
class EventManagementService {
  static async getAllEvents(): Promise<EventWithStats[]> {
    try {
      const response = await fetch('/api/showmasterpiece/events?includeStats=true');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '获取活动列表失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('获取活动列表失败:', error);
      throw error;
    }
  }

  static async createEvent(eventData: EventFormData, options: CreateEventOptions): Promise<Event> {
    try {
      const response = await fetch('/api/showmasterpiece/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          ...options
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '创建活动失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('创建活动失败:', error);
      throw error;
    }
  }

  static async deleteEvent(eventId: number, force: boolean = false): Promise<void> {
    try {
      const response = await fetch(`/api/showmasterpiece/events/${eventId}?force=${force}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '删除活动失败');
      }
    } catch (error) {
      console.error('删除活动失败:', error);
      throw error;
    }
  }

  static async cloneEvent(sourceEventId: number, eventData: EventFormData, options: CreateEventOptions): Promise<Event> {
    try {
      const response = await fetch(`/api/showmasterpiece/events/${sourceEventId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          ...options
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '克隆活动失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('克隆活动失败:', error);
      throw error;
    }
  }

  static async updateEventStatus(eventId: number, status: Event['status'], isDefault?: boolean): Promise<void> {
    try {
      const response = await fetch(`/api/showmasterpiece/events/${eventId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          isDefault
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '更新活动状态失败');
      }
    } catch (error) {
      console.error('更新活动状态失败:', error);
      throw error;
    }
  }
}

export function MultiEventOverview({
  currentEvent,
  onEventChange,
  hasAdminAccess
}: MultiEventOverviewProps) {
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [creating, setCreating] = useState(false);

  // 加载活动列表
  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await EventManagementService.getAllEvents();
      setEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadEvents();
  }, []);

  // 创建活动
  const handleCreateEvent = async (eventData: EventFormData, options: CreateEventOptions) => {
    try {
      setCreating(true);
      const newEvent = await EventManagementService.createEvent(eventData, options);
      
      // 刷新列表
      await loadEvents();
      
      // 如果新活动是默认活动，切换到它
      if (eventData.isDefault) {
        onEventChange(newEvent);
      }
      
    } catch (error) {
      console.error('创建活动失败:', error);
      throw error;
    } finally {
      setCreating(false);
    }
  };

  // 删除活动
  const handleDeleteEvent = async (event: EventWithStats) => {
    if (!confirm(`确定要删除活动"${event.displayName}"吗？\n\n此操作将同时删除活动的所有相关数据（画集、分类、标签等），且无法恢复！`)) {
      return;
    }

    try {
      await EventManagementService.deleteEvent(event.id, true);
      await loadEvents();
      
      // 如果删除的是当前活动，切换到第一个可用活动
      if (currentEvent?.id === event.id && events.length > 1) {
        const remainingEvents = events.filter(e => e.id !== event.id);
        if (remainingEvents.length > 0) {
          onEventChange(remainingEvents[0]);
        }
      }
      
    } catch (error) {
      alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 编辑活动信息
  const handleEditEvent = async (event: EventWithStats) => {
    const newName = prompt('请输入新的活动名称:', event.displayName);
    if (!newName || newName.trim() === '') return;
    
    const newSlug = prompt('请输入新的活动Key (英文标识符):', event.slug);
    if (!newSlug || newSlug.trim() === '') return;
    
    // 验证slug格式（只允许字母、数字、连字符）
    if (!/^[a-zA-Z0-9-]+$/.test(newSlug)) {
      alert('活动Key只能包含字母、数字和连字符');
      return;
    }
    
    // 检查slug是否已存在
    if (events.some(e => e.id !== event.id && e.slug === newSlug)) {
      alert('该活动Key已存在，请使用其他标识符');
      return;
    }
    
    try {
      const response = await fetch(`/api/showmasterpiece/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: newName.trim(),
          slug: newSlug.trim(),
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '更新活动失败');
      }
      
      // 刷新列表
      await loadEvents();
      
      // 如果修改的是当前活动，更新当前活动信息
      if (currentEvent?.id === event.id) {
        onEventChange(result.data);
      }
      
    } catch (error) {
      alert(`更新失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 设为默认活动
  const handleSetDefault = async (event: EventWithStats) => {
    try {
      await EventManagementService.updateEventStatus(event.id, event.status, true);
      await loadEvents();
      onEventChange(event);
    } catch (error) {
      alert(`设置失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-600">加载活动列表中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="text-red-600 text-lg text-center">{error}</p>
          <button
            onClick={loadEvents}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw size={16} />
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* 头部 */}
      <div className="bg-white shadow-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                多期活动管理中心
              </h1>
              <p className="text-sm text-slate-500 mt-1">管理所有美术作品展览活动</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={loadEvents}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw size={16} />
                刷新
              </button>
              
              {hasAdminAccess && (
                <button
                  onClick={() => setShowCreator(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  创建新活动
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 活动选择器 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">当前活动</h2>
          <EventSelector
            currentEvent={currentEvent}
            events={events}
            onEventChange={onEventChange}
            loading={loading}
            mode="dropdown"
          />
        </div>

        {/* 活动列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <BarChart3 size={20} />
                活动列表
              </h2>
              <span className="text-sm text-slate-500">
                共 {events.length} 个活动
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {events.map((event) => (
              <div key={event.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(event.status)}
                      <h3 className="text-lg font-semibold text-slate-800 truncate">
                        {event.displayName}
                      </h3>
                      {event.isDefault && (
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-medium">
                          默认
                        </span>
                      )}
                      {currentEvent?.id === event.id && (
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded font-medium">
                          当前
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-600 mb-3">{event.description || event.name}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span>标识符: {event.slug}</span>
                      <span>排序: {event.sortOrder}</span>
                      {event.stats && (
                        <>
                          <span>画集: {event.stats.publishedCollectionsCount}/{event.stats.collectionsCount}</span>
                          <span>分类: {event.stats.categoriesCount}</span>
                          <span>标签: {event.stats.tagsCount}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {hasAdminAccess && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="修改活动信息和Key"
                      >
                        <Settings size={16} />
                      </button>
                      
                      {!event.isDefault && (
                        <button
                          onClick={() => handleSetDefault(event)}
                          className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="设为默认"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteEvent(event)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除活动"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {events.length === 0 && (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">暂无活动</h3>
                <p className="text-slate-500 mb-6">开始创建您的第一个美术作品展览活动吧</p>
                {hasAdminAccess && (
                  <button
                    onClick={() => setShowCreator(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Plus size={16} />
                    创建新活动
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 活动创建器 */}
      <EventCreator
        visible={showCreator}
        onClose={() => setShowCreator(false)}
        onCreateEvent={handleCreateEvent}
        availableEvents={events}
        creating={creating}
      />
    </div>
  );
}
