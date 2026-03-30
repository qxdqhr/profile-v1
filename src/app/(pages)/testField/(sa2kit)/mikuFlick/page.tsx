'use client';

import React from 'react';
import { webUI } from 'sa2kit/mikuFlick';

const { MikuFlickGamePage } = webUI;

export default function MikuFlickPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-4xl">
        <MikuFlickGamePage
          title="Miku Flick（sa2kit 初版）"
          description="基础版：节奏音符、假名+Flick方向判定、分数连击与重置。"
          phrase="みくみくにしてあげるよ"
          config={{
            bpm: 128,
            hitWindowMs: 180,
          }}
        />
      </div>
    </div>
  );
}
