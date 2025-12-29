'use client';

import React, { useState } from 'react';
import { Modal } from 'sa2kit';
import { FileText } from 'lucide-react';

interface MMDSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModelId?: string;
  selectedAnimationId?: string;
  onModelSelect: (modelId: string) => void;
  onAnimationSelect: (animationId?: string) => void;
  controlSettings: {
    enableOrbitControls: boolean;
    autoPlayAnimation: boolean;
    showGrid: boolean;
  };
  onControlSettingsChange: (settings: {
    enableOrbitControls: boolean;
    autoPlayAnimation: boolean;
    showGrid: boolean;
  }) => void;
}

const MMDSettingsModal: React.FC<MMDSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedModelId,
  selectedAnimationId,
  onModelSelect,
  onAnimationSelect,
  controlSettings,
  onControlSettingsChange,
}) => {
  // Tab状态管理
  const [activeTab, setActiveTab] = useState<'models' | 'animations' | 'controls'>('models');

  const handleControlChange = (key: keyof typeof controlSettings) => {
    onControlSettingsChange({
      ...controlSettings,
      [key]: !controlSettings[key],
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MMD查看器设置"
      width={600}
      height={700}
      maskClosable={true}
      showCloseButton={true}
      className="!bg-transparent"
      contentClassName="!p-0"
    >
      <div className="bg-white rounded-lg overflow-hidden max-h-[700px] flex flex-col">
        {/* Tab导航 */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex">
            <button
              className={`flex-1 py-4 px-6 text-sm font-medium text-center transition-all ${
                activeTab === 'models'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('models')}
            >
              <div className="flex items-center justify-center gap-2">
                <span>📦</span>
                <span>模型选择</span>
              </div>
            </button>
            
            <button
              className={`flex-1 py-4 px-6 text-sm font-medium text-center transition-all ${
                activeTab === 'animations'
                  ? 'text-green-600 border-b-2 border-green-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('animations')}
            >
              <div className="flex items-center justify-center gap-2">
                <span>🎬</span>
                <span>动画选择</span>
              </div>
            </button>
            
            <button
              className={`flex-1 py-4 px-6 text-sm font-medium text-center transition-all ${
                activeTab === 'controls'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('controls')}
            >
              <div className="flex items-center justify-center gap-2">
                <span>⚙️</span>
                <span>控制选项</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 模型选择Tab */}
          {activeTab === 'models' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">选择3D模型</h3>
                <p className="text-sm text-gray-600">选择要在查看器中显示的MMD模型</p>
              </div>
              
              <div className="space-y-3">
                <button
                  className={`flex items-center gap-4 w-full p-4 border-2 rounded-lg transition-all text-left hover:shadow-md ${
                    selectedModelId === 'demo' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onModelSelect('demo')}
                >
                  <div className="text-4xl w-16 h-16 flex items-center justify-center bg-gray-100 rounded-xl flex-shrink-0">📦</div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-800">演示模型</div>
                    <div className="text-sm text-gray-600 mt-1">基础立方体模型，用于测试基本功能</div>
                    <div className="text-xs text-gray-500 mt-1">格式: PMX | 大小: 2.1MB</div>
                  </div>
                  {selectedModelId === 'demo' && (
                    <div className="text-blue-500 text-xl">✓</div>
                  )}
                </button>

                <button
                  className={`flex items-center gap-4 w-full p-4 border-2 rounded-lg transition-all text-left hover:shadow-md ${
                    selectedModelId === 'demo2' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onModelSelect('demo2')}
                >
                  <div className="text-4xl w-16 h-16 flex items-center justify-center bg-gray-100 rounded-xl flex-shrink-0">🎭</div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-800">示例模型2</div>
                    <div className="text-sm text-gray-600 mt-1">另一个测试模型，用于对比测试</div>
                    <div className="text-xs text-gray-500 mt-1">格式: PMD | 大小: 3.5MB</div>
                  </div>
                  {selectedModelId === 'demo2' && (
                    <div className="text-blue-500 text-xl">✓</div>
                  )}
                </button>

                {/* 上传新模型区域 */}
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-500 mb-4">
                    <FileText className="w-12 h-12 mx-auto mb-2" />
                    <p>文件上传功能正在开发中</p>
                    <p className="text-sm">请使用预设的模型文件</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 动画选择Tab */}
          {activeTab === 'animations' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">选择动画文件</h3>
                <p className="text-sm text-gray-600">为模型添加动画效果</p>
              </div>
              
              <div className="space-y-3">
                <button
                  className={`w-full px-4 py-4 border-2 rounded-lg transition-all text-left hover:shadow-sm ${
                    !selectedAnimationId 
                      ? 'border-green-500 bg-green-50 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-green-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onAnimationSelect(undefined)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⏸️</span>
                      <div>
                        <div className="font-semibold text-gray-800">无动画</div>
                        <div className="text-sm text-gray-600">静态展示模型</div>
                      </div>
                    </div>
                    {!selectedAnimationId && <span className="text-green-500 text-xl">✓</span>}
                  </div>
                </button>

                <button
                  className={`w-full px-4 py-4 border-2 rounded-lg transition-all text-left hover:shadow-sm ${
                    selectedAnimationId === 'dance1' 
                      ? 'border-green-500 bg-green-50 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-green-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onAnimationSelect('dance1')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💃</span>
                      <div>
                        <div className="font-semibold text-gray-800">舞蹈动画1</div>
                        <div className="text-sm text-gray-600">经典舞蹈动作序列</div>
                        <div className="text-xs text-gray-500">时长: 3:24 | 格式: VMD</div>
                      </div>
                    </div>
                    {selectedAnimationId === 'dance1' && <span className="text-green-500 text-xl">✓</span>}
                  </div>
                </button>

                <button
                  className={`w-full px-4 py-4 border-2 rounded-lg transition-all text-left hover:shadow-sm ${
                    selectedAnimationId === 'dance2' 
                      ? 'border-green-500 bg-green-50 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-green-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onAnimationSelect('dance2')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🕺</span>
                      <div>
                        <div className="font-semibold text-gray-800">舞蹈动画2</div>
                        <div className="text-sm text-gray-600">节奏感强烈的舞蹈</div>
                        <div className="text-xs text-gray-500">时长: 2:45 | 格式: VMD</div>
                      </div>
                    </div>
                    {selectedAnimationId === 'dance2' && <span className="text-green-500 text-xl">✓</span>}
                  </div>
                </button>

                {/* 上传新动画区域 */}
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-500 mb-4">
                    <FileText className="w-12 h-12 mx-auto mb-2" />
                    <p>文件上传功能正在开发中</p>
                    <p className="text-sm">请使用预设的动画文件</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 控制选项Tab */}
          {activeTab === 'controls' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">查看器设置</h3>
                <p className="text-sm text-gray-600">配置3D查看器的交互和显示选项</p>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-purple-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg">🎯</div>
                    <div>
                      <div className="text-base font-semibold text-gray-800">启用轨道控制</div>
                      <div className="text-sm text-gray-600 mt-1">允许鼠标控制视角旋转和缩放</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={controlSettings.enableOrbitControls}
                    onChange={() => handleControlChange('enableOrbitControls')}
                    className="w-6 h-6 accent-purple-500 scale-125"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-purple-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg">▶️</div>
                    <div>
                      <div className="text-base font-semibold text-gray-800">自动播放动画</div>
                      <div className="text-sm text-gray-600 mt-1">加载模型后自动开始播放动画</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={controlSettings.autoPlayAnimation}
                    onChange={() => handleControlChange('autoPlayAnimation')}
                    className="w-6 h-6 accent-purple-500 scale-125"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-purple-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg">📐</div>
                    <div>
                      <div className="text-base font-semibold text-gray-800">显示网格</div>
                      <div className="text-sm text-gray-600 mt-1">在场景中显示辅助网格线</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={controlSettings.showGrid}
                    onChange={() => handleControlChange('showGrid')}
                    className="w-6 h-6 accent-purple-500 scale-125"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮区域 */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-all"
            >
              取消
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
            >
              应用设置
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MMDSettingsModal;
