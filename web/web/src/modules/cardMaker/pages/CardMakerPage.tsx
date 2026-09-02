 'use client';

import React, { useState } from 'react';
import { CharacterDisplay } from '../components/CharacterDisplay';
import { ActionButtons } from '../components/ActionButtons';
import { TabNavigation } from '../components/TabNavigation';
import { AssetGrid } from '../components/AssetGrid';
import { useCardMaker } from '../hooks/useCardMaker';
import { TabData } from '../types';

const TABS: TabData[] = [
  { id: 'base', text: 'ベース', active: false },
  { id: 'parts', text: 'パーツ', active: false },
  { id: 'idol', text: 'Pアイドル', active: false },
  { id: 'support', text: 'サポート', active: false },
  { id: 'photo', text: 'フォト', active: false },
  { id: 'other', text: 'その他', active: false },
];

export const CardMakerPage: React.FC = () => {
  const { state, actions } = useCardMaker();
  const [showNameModal, setShowNameModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [tempName, setTempName] = useState(state.currentCard.characterName);
  const [tempComment, setTempComment] = useState(state.currentCard.characterDescription || '');

  // 处理标签切换
  const handleTabChange = (tabId: string) => {
    actions.setActiveTab(tabId);
    // 根据标签类型加载对应资源
    if (tabId === 'base') {
      actions.loadAssets('base', 'avatar');
    } else if (tabId === 'parts') {
      actions.loadAssets('parts', 'avatar');
    } else {
      actions.loadAssets(tabId, 'background');
    }
  };

  // 处理资源上传
  const handleAssetUpload = async (file: File) => {
    try {
      const type = state.activeTab === 'base' ? 'avatar' : 'background';
      await actions.uploadAsset(file, type, state.activeTab);
    } catch (error) {
      alert('上传失败，请重试');
    }
  };

  // 处理保存
  const handleSave = async () => {
    try {
      await actions.saveCard();
      alert('保存成功！');
    } catch (error) {
      alert('保存失败，请重试');
    }
  };

  // 处理名称更新
  const handleNameUpdate = () => {
    actions.updateCard({ characterName: tempName });
    setShowNameModal(false);
  };

  // 处理描述更新
  const handleCommentUpdate = () => {
    actions.updateCard({ characterDescription: tempComment });
    setShowCommentModal(false);
  };

  const currentTabs = TABS.map(tab => ({
    ...tab,
    active: tab.id === state.activeTab
  }));

  return (
    <div 
      className="min-h-screen bg-gray-100  relative max-w-72"
    >
      {/* 主要内容区域 */}
      <div className="bg-white shadow-lg min-h-screen">
        {/* 角色展示区 */}
        <CharacterDisplay card={state.currentCard} />
        
        {/* 操作按钮 */}
        <ActionButtons
          onConfigChange={() => {/* TODO: 实现配置功能 */}}
          onNameChange={() => setShowNameModal(true)}
          onCommentEdit={() => setShowCommentModal(true)}
          onSave={handleSave}
          isSaving={state.isSaving}
        />
        
        {/* 标签导航 */}
        <TabNavigation
          tabs={currentTabs}
          activeTab={state.activeTab}
          onTabChange={handleTabChange}
          className="sticky top-0 z-10"
        />
        
        {/* 资源网格 */}
        <AssetGrid
          assets={state.assets}
          onSelect={actions.selectAsset}
          onUpload={handleAssetUpload}
          type={(state.activeTab === 'base' || state.activeTab === 'parts') ? 'avatar' : 'background'}
          category={state.activeTab}
          className="pb-20" // 为底部导航留出空间
        />
      </div>

      {/* 名称编辑模态框 */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">名前変更</h3>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4"
              placeholder="角色名称"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                キャンセル
              </button>
              <button
                onClick={handleNameUpdate}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 描述编辑模态框 */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">コメント編集</h3>
            <textarea
              value={tempComment}
              onChange={(e) => setTempComment(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 h-24 resize-none"
              placeholder="角色描述"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCommentModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                キャンセル
              </button>
              <button
                onClick={handleCommentUpdate}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部导航 */}
              <div 
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-between px-5 shadow-lg"
          style={{
            maxWidth: '448px',
            height: '80px'
          }}
        >
                  <button 
            onClick={() => window.history.back()}
            className="bg-black/70 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg hover:bg-black/80 transition-colors"
            style={{
              width: '48px',
              height: '48px'
            }}
          >
          ‹‹
        </button>
        
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-500 mr-2">ベース</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
                              <div 
                  key={i} 
                  className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-md filter blur-[2px] opacity-60"
                  style={{
                    width: '48px',
                    height: '32px'
                  }}
                />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">パーツ</span>
        </div>
      </div>
    </div>
  );
};