'use client'

import dynamic from 'next/dynamic'

// 动态导入游戏组件，避免SSR问题
const MikuTalkingGame = dynamic(
  () => import('./components/MikuTalkingGame'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-500">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎤</div>
          <div className="text-white text-xl font-medium">加载米库说话中...</div>
        </div>
      </div>
    )
  }
)

export default function MikuTalkingPage() {
  return <MikuTalkingGame />
}

