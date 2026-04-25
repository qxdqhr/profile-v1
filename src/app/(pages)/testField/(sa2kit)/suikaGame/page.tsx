'use client';

import React from 'react';
import { SuikaGame } from '../../../../../modules/suikaGame/SuikaGame';

const LEVEL_COLORS = [
  { color: '#FF6B6B', label: '①' },
  { color: '#FF9B3E', label: '②' },
  { color: '#FFD23F', label: '③' },
  { color: '#7ED957', label: '④' },
  { color: '#00BFA5', label: '⑤' },
  { color: '#29B6F6', label: '⑥' },
  { color: '#7C4DFF', label: '⑦' },
  { color: '#FF80AB', label: '⑧' },
  { color: '#FF5722', label: '⑨' },
  { color: '#E91E63', label: '⑩' },
  { color: '#43A047', label: '★' },
];

export default function SuikaGamePage() {
  return (
    <div className="flex flex-col h-screen bg-[#1a1a2e] overflow-hidden">
      {/* 紧凑标题栏 */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-purple-900/40 bg-[#1a1a2e]/90 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">🍉</span>
          <h2 className="text-base font-bold text-purple-200 tracking-wide truncate">
            合成大西瓜
          </h2>
        </div>

        {/* 等级色卡（越往右越大） */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-3">
          {LEVEL_COLORS.map((lv) => (
            <div
              key={lv.label}
              className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[7px] md:text-[8px] font-bold text-white/80 flex-shrink-0"
              style={{
                background: lv.color,
                boxShadow: `0 0 4px ${lv.color}88`,
              }}
              title={`等级 ${lv.label}`}
            >
              {lv.label}
            </div>
          ))}
          <span className="ml-1 text-[10px] text-purple-400/60 hidden md:block">→ 越大越高级</span>
        </div>
      </div>

      {/* 游戏区域 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SuikaGame />
      </div>
    </div>
  );
}
