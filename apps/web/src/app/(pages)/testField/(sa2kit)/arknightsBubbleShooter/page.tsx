'use client';

import React from 'react';
import Image from 'next/image';
import { ArknightsBubbleShooter } from '../../../../../modules/arknightsBubbleShooter/ArknightsBubbleShooter';

const CHARACTERS = [
  { id: '年', imageKey: 'nian',     name: '年',  bgColor: '#c62828' },
  { id: '夕', imageKey: 'dusk',     name: '夕',  bgColor: '#263238' },
  { id: '令', imageKey: 'ling',     name: '令',  bgColor: '#0d47a1' },
  { id: '重', imageKey: 'chongyue', name: '重岳', bgColor: '#1a1a2e' },
  { id: '黍', imageKey: 'shu',      name: '黍',  bgColor: '#37474f' },
];

export default function ArknightsBubbleShooterPage() {
  return (
    <div className="flex flex-col h-screen bg-stone-950 overflow-hidden">
      {/* 紧凑标题栏 */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-red-900/30 bg-stone-950/90 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">🐉</span>
          <h2 className="text-base font-bold text-yellow-400 tracking-wide truncate">
            岁家龙泡泡 · 泡泡龙
          </h2>
        </div>

        {/* 角色图例（小图标形式） */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
          {CHARACTERS.map((char) => (
            <div key={char.id} className="flex flex-col items-center gap-0.5">
              <div
                className="relative w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/15 overflow-hidden"
                style={{ backgroundColor: char.bgColor + '66' }}
              >
                <Image
                  src={`/images/dragonBeans/${char.imageKey}.png`}
                  alt={char.name}
                  width={36}
                  height={36}
                  className="w-full h-full object-contain scale-125"
                />
              </div>
              <span className="text-[9px] md:text-[10px] text-yellow-300/70 font-bold leading-none">
                {char.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 游戏区域：填满剩余空间 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ArknightsBubbleShooter />
      </div>

      {/* 版权角标 */}
      <div className="flex-shrink-0 text-center py-1">
        <span className="text-[10px] text-stone-700">
          Artwork by{' '}
          <a
            href="https://x.com/Dimongo619467"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-500 transition-colors"
          >
            @Dimongo619467
          </a>
        </span>
      </div>
    </div>
  );
}
