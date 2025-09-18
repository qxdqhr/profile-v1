/**
 * ShowMasterpiece 特定活动展示页面
 * 
 * 显示指定活动的画集和作品，支持通过URL参数指定活动。
 * 这个页面替代了原有的单一展示页面，支持多活动架构。
 */

'use client';

import React, { useEffect, useState } from 'react';
import { ShowMasterPiecesPage } from '@/modules/showmasterpiece/pages/ShowMasterPiecesPage';
import { AuthProvider } from '@/modules/auth';

interface EventPageProps {
  params: {
    eventSlug: string;
  };
}

function EventPageContent({ params }: EventPageProps) {
  const { eventSlug } = params;
  const [eventData, setEventData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载活动信息
  useEffect(() => {
    const loadEventData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 通过slug获取活动信息
        const response = await fetch(`/api/showmasterpiece/events?slug=${eventSlug}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || '活动不存在');
        }

        const event = result.data.find((e: any) => e.slug === eventSlug);
        
        if (!event) {
          throw new Error('活动不存在');
        }

        if (event.status === 'draft') {
          // 检查用户是否有查看草稿活动的权限
          // 这里可以添加权限检查逻辑
        }

        setEventData(event);
      } catch (err) {
        console.error('加载活动信息失败:', err);
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-600">加载活动信息中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-4">
          <h1 className="text-2xl font-bold text-slate-800">活动不可用</h1>
          <p className="text-slate-600 text-center">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回
            </button>
            <button
              onClick={() => window.location.href = '/testField/ShowMasterPieces'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              查看默认活动
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 渲染展示页面，传入活动参数
  return (
    <div>
      {/* 活动标题栏 */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-800">
                {eventData.displayName}
              </h1>
              {eventData.description && (
                <p className="text-sm text-slate-600 mt-1">
                  {eventData.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              {eventData.status === 'active' && (
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-medium">
                  进行中
                </span>
              )}
              {eventData.status === 'draft' && (
                <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs font-medium">
                  草稿
                </span>
              )}
              {eventData.status === 'archived' && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                  已结束
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 展示页面内容 */}
      <ShowMasterPiecesPage eventParam={eventSlug} />
    </div>
  );
}

export default function EventPage({ params }: EventPageProps) {
  return (
    <AuthProvider>
      <EventPageContent params={params} />
    </AuthProvider>
  );
}
