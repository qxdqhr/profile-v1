'use client';

import React from 'react';
import { PhaserBubbleShooter } from '../../../../../modules/bubbleShooter/PhaserBubbleShooter';

export default function BubbleShooterPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-4xl">
        <h2 className="mb-2 text-xl font-bold text-slate-800">泡泡龙（Phaser 重构版）</h2>
        <p className="mb-4 text-sm text-slate-600">已切换到网页游戏引擎循环，缓解发射过程卡顿。</p>
        <PhaserBubbleShooter />
      </div>
    </div>
  );
}
