/**
 * Mikutap 音乐互动游戏页面
 */

import SimpleMikutapPage from '@/modules/mikutap/pages/SimpleMikutapPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mikutap 音乐互动 - 实验田',
  description: '复刻经典音乐互动游戏Mikutap，支持点击、拖拽和按键触发音效，具备多种音色包和可配置化视觉效果',
  keywords: ['音乐', '互动', '游戏', '初音未来', '音效', 'Mikutap'],
};

export default function Page() {
  return <SimpleMikutapPage />;
}