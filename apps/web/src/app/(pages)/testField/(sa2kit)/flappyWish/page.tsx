'use client';

import React from 'react';
import { FlappyWish } from '../../../../../modules/flappyWish/FlappyWish';

export default function FlappyWishPage() {
  return (
    <div className="flex flex-col h-screen bg-[#1a1a2e] overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-purple-900/40 bg-[#1a1a2e]/90 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">🕊️</span>
          <h2 className="text-base font-bold text-purple-200 tracking-wide truncate">
            予愿飞翔
          </h2>
        </div>
        <span className="text-xs text-purple-400/60 hidden md:block">
          简单 / 中等 / 困难 · 点按起飞
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <FlappyWish />
      </div>
    </div>
  );
}
