'use client';

import React, { useState, useEffect } from 'react';
import { useIdeaLists } from '../hooks/useIdeaLists';
import { useIdeaItems } from '../hooks/useIdeaItems';
import { AuthGuard } from '@/modules/auth';
import CreateIdeaListModal from '../components/CreateIdeaListModal';
import EditIdeaListModal from '../components/EditIdeaListModal';
import CreateIdeaItemModal from '../components/CreateIdeaItemModal';
import EditIdeaItemModal from '../components/EditIdeaItemModal';
import type { IdeaList, IdeaListWithItems, IdeaListFormData, IdeaItemFormData, IdeaItem } from '../types';

/**
 * 想法清单主页面
 * 展示所有想法清单，支持创建、编辑和删除
 */
export default function IdeaListPage() {
  const { 
    ideaLists, 
    loading: listsLoading, 
    error: listsError,
    refreshLists,
    createList,
    updateList,
    deleteList,
  } = useIdeaLists();

  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState<IdeaList | null>(null);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IdeaItem | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [createItemLoading, setCreateItemLoading] = useState(false);
  const [editItemLoading, setEditItemLoading] = useState(false);

  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    refreshItems,
    createItem,
    updateItem,
    deleteItem,
    toggleComplete,
  } = useIdeaItems(selectedListId || undefined);

  // 初始化加载
  useEffect(() => {
    refreshLists();
  }, [refreshLists]);

  // 当选择列表时刷新项目（静默加载，避免闪烁）
  useEffect(() => {
    if (selectedListId) {
      refreshItems(false); // 不显示loading状态
    }
  }, [selectedListId, refreshItems]);

  // 选择第一个列表作为默认选择
  useEffect(() => {
    if (ideaLists.length > 0 && !selectedListId) {
      setSelectedListId(ideaLists[0].id);
    }
  }, [ideaLists, selectedListId]);

  const selectedList = ideaLists.find(list => list.id === selectedListId);

  // 处理创建清单
  const handleCreateList = async (data: IdeaListFormData) => {
    console.log('🚀 [IdeaListPage] 开始创建清单:', data);
    setCreateLoading(true);
    try {
      console.log('📡 [IdeaListPage] 调用 createList...');
      const result = await createList(data);
      console.log('✅ [IdeaListPage] 创建清单结果:', result);
      if (result.success) {
        setShowCreateModal(false);
        // 创建成功后，自动选中新创建的清单
        if (result.newListId) {
          console.log('🎯 [IdeaListPage] 自动选中新创建的清单:', result.newListId);
          setSelectedListId(result.newListId);
          // 确保 useIdeaItems hook 刷新数据
          console.log('🔄 [IdeaListPage] 等待 useIdeaItems 自动刷新...');
        }
      }
    } catch (error) {
      console.error('❌ [IdeaListPage] 创建清单失败:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  // 处理编辑清单
  const handleEditList = async (data: Partial<IdeaListFormData>) => {
    if (!editingList) return;
    console.log('🚀 [IdeaListPage] 开始编辑清单:', { listId: editingList.id, data });
    
    setEditLoading(true);
    try {
      console.log('📡 [IdeaListPage] 调用 updateList...');
      const success = await updateList(editingList.id, data);
      console.log('✅ [IdeaListPage] 编辑清单结果:', success);
      if (success) {
        setEditingList(null);
      }
    } catch (error) {
      console.error('❌ [IdeaListPage] 编辑清单失败:', error);
    } finally {
      setEditLoading(false);
    }
  };

  // 处理删除清单
  const handleDeleteList = async () => {
    if (!editingList) return;
    console.log('🚀 [IdeaListPage] 开始删除清单:', editingList.id);
    
    setEditLoading(true);
    try {
      console.log('📡 [IdeaListPage] 调用 deleteList...');
      const success = await deleteList(editingList.id);
      console.log('✅ [IdeaListPage] 删除清单结果:', success);
      if (success) {
        setEditingList(null);
        // 如果删除的是当前选中的清单，则清除选择
        if (selectedListId === editingList.id) {
          setSelectedListId(null);
        }
      }
    } catch (error) {
      console.error('❌ [IdeaListPage] 删除清单失败:', error);
    } finally {
      setEditLoading(false);
    }
  };

  // 处理创建想法项目
  const handleCreateItem = async (data: IdeaItemFormData) => {
    if (!selectedListId) {
      console.warn('⚠️ [IdeaListPage] 没有选中的清单ID');
      return;
    }
    console.log('🚀 [IdeaListPage] 开始创建想法项目:', { listId: selectedListId, data });
    
    setCreateItemLoading(true);
    try {
      console.log('📡 [IdeaListPage] 调用 createItem...');
      const success = await createItem(selectedListId, data);
      console.log('✅ [IdeaListPage] 创建想法项目结果:', success);
      if (success) {
        setShowCreateItemModal(false);
      }
    } catch (error) {
      console.error('❌ [IdeaListPage] 创建想法项目失败:', error);
    } finally {
      setCreateItemLoading(false);
    }
  };

  // 处理编辑想法项目
  const handleEditItem = async (data: Partial<IdeaItemFormData>) => {
    if (!editingItem) {
      console.warn('⚠️ [IdeaListPage] 没有正在编辑的项目');
      return;
    }
    console.log('🚀 [IdeaListPage] 开始编辑想法项目:', { itemId: editingItem.id, data });
    
    setEditItemLoading(true);
    try {
      console.log('📡 [IdeaListPage] 调用 updateItem...');
      const success = await updateItem(editingItem.id, data);
      console.log('✅ [IdeaListPage] 编辑想法项目结果:', success);
      if (success) {
        setEditingItem(null);
      }
    } catch (error) {
      console.error('❌ [IdeaListPage] 编辑想法项目失败:', error);
    } finally {
      setEditItemLoading(false);
    }
  };

  // 处理删除想法项目
  const handleDeleteItem = async () => {
    if (!editingItem) {
      console.warn('⚠️ [IdeaListPage] 没有正在编辑的项目');
      return;
    }
    console.log('🚀 [IdeaListPage] 开始删除想法项目:', editingItem.id);
    
    setEditItemLoading(true);
    try {
      console.log('📡 [IdeaListPage] 调用 deleteItem...');
      const success = await deleteItem(editingItem.id);
      console.log('✅ [IdeaListPage] 删除想法项目结果:', success);
      if (success) {
        setEditingItem(null);
      }
    } catch (error) {
      console.error('❌ [IdeaListPage] 删除想法项目失败:', error);
    } finally {
      setEditItemLoading(false);
    }
  };

  // 处理切换完成状态
  const handleToggleComplete = async (id: number) => {
    console.log('🚀 [IdeaListPage] 开始切换完成状态:', id);
    try {
      console.log('📡 [IdeaListPage] 调用 toggleComplete...');
      const success = await toggleComplete(id);
      console.log('✅ [IdeaListPage] 切换完成状态结果:', success);
    } catch (error) {
      console.error('❌ [IdeaListPage] 切换完成状态失败:', error);
    }
  };

  return (
    <AuthGuard 
      requireAuth={true}
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                登录后使用想法清单
              </h3>
              <p className="text-gray-500 mb-6">
                想法清单功能需要登录后才能使用，请先登录您的账户。
              </p>
              <p className="text-sm text-gray-400">
                登录后您可以：创建多个想法清单、管理想法项目、设置优先级和标签等
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="bg-gray-50">
        {/* 页面标题 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">想法清单</h1>
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setEditingList(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-black px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                创建新清单
              </button>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">


        <div className="flex flex-row gap-6 min-h-[600px]">
          {/* 左侧清单列表 */}
          <div className="w-1/4 min-w-[300px]">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">我的清单</h2>
              </div>
              
              {listsLoading ? (
                <div className="p-4">
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : listsError ? (
                <div className="p-4 text-red-600 text-sm">
                  {listsError}
                </div>
              ) : (
                <div className="divide-y">
                  {ideaLists.map((list) => (
                    <div
                      key={list.id}
                      onClick={() => setSelectedListId(list.id)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedListId === list.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {list.name}
                          </h3>
                          {list.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {list.description}
                            </p>
                          )}
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <span>{list.itemCount} 项</span>
                            <span className="mx-1">•</span>
                            <span>{list.completedCount} 已完成</span>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ml-2 bg-${list.color}-500`}></div>
                      </div>
                    </div>
                  ))}
                  
                  {ideaLists.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <p>还没有想法清单</p>
                      <p className="text-sm mt-1">点击上方按钮创建第一个清单</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 右侧项目列表 */}
          <div className="flex-1">
            {selectedList ? (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {selectedList.name}
                      </h2>
                      {selectedList.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedList.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingList(selectedList)}
                        className="text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        编辑清单
                      </button>
                      <button
                        onClick={() => setShowCreateItemModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-black px-6 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 !text-black"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>添加想法</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {itemsError ? (
                    <div className="text-red-600 text-sm">
                      {itemsError}
                    </div>
                  ) : itemsLoading && items.length === 0 ? (
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={() => handleToggleComplete(item.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => setEditingItem(item)}
                          >
                            <h4 className={`text-sm font-medium ${
                              item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className={`text-sm mt-1 ${
                                item.isCompleted ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.priority === 'high' ? 'bg-red-100 text-red-800' :
                                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {item.priority === 'high' ? '高优先级' :
                                 item.priority === 'medium' ? '中优先级' : '低优先级'}
                              </span>
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex space-x-1">
                                  {item.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {items.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有想法</h3>
                          <p className="text-gray-500 mb-4">这个清单还是空的，添加你的第一个想法吧！</p>
                          <button
                            onClick={() => setShowCreateItemModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-black px-6 py-3 rounded-md font-medium shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2 !text-black"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>添加第一个想法</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center text-gray-500">
                <div className="mx-auto w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">选择想法清单</h3>
                <p className="text-gray-500 mb-6">从左侧选择一个清单，或创建新的清单开始管理你的想法</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-black px-6 py-3 rounded-md font-medium shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2 !text-black"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>创建第一个清单</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 创建清单模态框 */}
      <CreateIdeaListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateList}
        loading={createLoading}
      />

      {/* 编辑清单模态框 */}
      <EditIdeaListModal
        isOpen={!!editingList}
        onClose={() => setEditingList(null)}
        onSubmit={handleEditList}
        onDelete={handleDeleteList}
        ideaList={editingList}
        loading={editLoading}
      />

      {/* 创建想法项目模态框 */}
      <CreateIdeaItemModal
        isOpen={showCreateItemModal}
        onClose={() => setShowCreateItemModal(false)}
        onSubmit={handleCreateItem}
        loading={createItemLoading}
      />

      {/* 编辑想法项目模态框 */}
      <EditIdeaItemModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEditItem}
        onDelete={handleDeleteItem}
        item={editingItem}
        loading={editItemLoading}
      />
      </div>
    </AuthGuard>
  );
} 