'use client';

import { useState, useCallback } from 'react';
import { IdeaListService } from '../services/ideaListService';
import type { UseIdeaListsState, IdeaListFormData, IdeaListWithItems } from '../types';

/**
 * 想法清单管理Hook
 * 提供清单的CRUD操作和状态管理
 */
export function useIdeaLists(): UseIdeaListsState {
  const [ideaLists, setIdeaLists] = useState<IdeaListWithItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 刷新清单列表
   */
  const refreshLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await IdeaListService.getAllLists();
      setIdeaLists(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取清单失败';
      setError(errorMessage);
      console.error('获取想法清单失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 创建新的想法清单
   */
  const createList = useCallback(async (data: IdeaListFormData): Promise<{ success: boolean; newListId?: number }> => {
    console.log('🔄 [useIdeaLists] createList 开始:', data);
    setError(null);
    try {
      console.log('📡 [useIdeaLists] 调用 IdeaListService.createList...');
      const newList = await IdeaListService.createList(data);
      console.log('✅ [useIdeaLists] 创建清单成功，返回的清单:', newList);
      console.log('🔄 [useIdeaLists] 刷新列表...');
      await refreshLists(); // 刷新列表
      console.log('✅ [useIdeaLists] 刷新列表完成');
      return { success: true, newListId: newList?.id };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建清单失败';
      setError(errorMessage);
      console.error('❌ [useIdeaLists] 创建想法清单失败:', err);
      return { success: false };
    }
  }, [refreshLists]);

  /**
   * 更新想法清单
   */
  const updateList = useCallback(async (id: number, data: Partial<IdeaListFormData>): Promise<boolean> => {
    setError(null);
    try {
      await IdeaListService.updateList(id, data);
      
      // 本地更新状态
      setIdeaLists(prev => prev.map(list => 
        list.id === id ? { ...list, ...data } : list
      ));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新清单失败';
      setError(errorMessage);
      console.error('更新想法清单失败:', err);
      return false;
    }
  }, []);

  /**
   * 删除想法清单
   */
  const deleteList = useCallback(async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await IdeaListService.deleteList(id);
      
      // 本地更新状态
      setIdeaLists(prev => prev.filter(list => list.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除清单失败';
      setError(errorMessage);
      console.error('删除想法清单失败:', err);
      return false;
    }
  }, []);

  /**
   * 重新排序清单
   */
  const reorderLists = useCallback(async (orderedIds: number[]): Promise<boolean> => {
    setError(null);
    try {
      // 本地更新状态（乐观更新）
      const reorderedLists = orderedIds.map(id => 
        ideaLists.find(list => list.id === id)!
      ).filter(Boolean);
      
      setIdeaLists(reorderedLists);
      
      // TODO: 实现后端排序API
      // await IdeaListService.reorderLists(orderedIds);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '重新排序失败';
      setError(errorMessage);
      console.error('重新排序想法清单失败:', err);
      
      // 恢复原始状态
      await refreshLists();
      return false;
    }
  }, [ideaLists, refreshLists]);

  return {
    ideaLists,
    loading,
    error,
    refreshLists,
    createList,
    updateList,
    deleteList,
    reorderLists,
  };
} 