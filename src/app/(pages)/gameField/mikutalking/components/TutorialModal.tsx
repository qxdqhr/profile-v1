'use client'

import React, { useState } from 'react'

interface TutorialModalProps {
  onClose: () => void
}

/**
 * 教程弹窗组件
 */
export default function TutorialModal({ onClose }: TutorialModalProps) {
  const [currentPage, setCurrentPage] = useState(0)

  const tutorialPages = [
    {
      icon: '👋',
      title: '欢迎来到米库说话！',
      description: '这是一个基于MMD模型的互动游戏，类似"会说话的汤姆猫"。你可以通过各种方式与米库互动！',
    },
    {
      icon: '👆',
      title: '点击互动',
      description: '点击米库的不同部位（头部、脸部、身体、手臂、腿等），她会做出不同的反应。试试看吧！',
    },
    {
      icon: '🎤',
      title: '录音和变声',
      description: '按住麦克风按钮录音，松开后会以变声效果播放。可以选择不同的变声效果哦！',
    },
    {
      icon: '🍎',
      title: '喂食和道具',
      description: '点击底部的道具箱，选择食物、玩具、礼物等道具，点击使用可以提升米库的情绪值。',
    },
    {
      icon: '❤️',
      title: '情绪系统',
      description: '米库有快乐度、能量和饥饿度等状态。记得定时喂食和互动，让她保持开心！',
    },
    {
      icon: '⭐',
      title: '等级和经验',
      description: '每次互动都会获得经验值，升级后会有特殊动画。与米库互动越多，亲密度就越高！',
    },
  ]

  const handleNext = () => {
    if (currentPage < tutorialPages.length - 1) {
      setCurrentPage(currentPage + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const currentTutorial = tutorialPages[currentPage]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 px-6 py-8 text-white text-center">
          <div className="text-6xl mb-4">{currentTutorial.icon}</div>
          <h2 className="text-2xl font-bold">{currentTutorial.title}</h2>
        </div>

        {/* 内容 */}
        <div className="px-8 py-6">
          <p className="text-gray-700 text-center leading-relaxed text-lg">
            {currentTutorial.description}
          </p>

          {/* 页码指示器 */}
          <div className="flex justify-center gap-2 mt-6">
            {tutorialPages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentPage
                    ? 'bg-blue-500 w-6'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            上一页
          </button>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            跳过教程
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
          >
            {currentPage === tutorialPages.length - 1 ? '开始游戏' : '下一页'}
          </button>
        </div>
      </div>
    </div>
  )
}

