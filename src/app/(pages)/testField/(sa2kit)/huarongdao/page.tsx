// @ts-nocheck
'use client';

import React from 'react';
import * as sa2kit from 'sa2kit';

const demoConfig = {
  id: 'demo',
  slug: 'demo-huarongdao',
  name: '华容道 Demo',
  status: 'active',
  rows: 3,
  cols: 3,
  sourceImageUrl: 'https://i.imgur.com/6z7Qw6M.png',
  showReference: true,
  shuffleSteps: 80,
  startMode: 'random-solvable',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function HuarongdaoPage() {
  const GamePage = (sa2kit as any)?.huarongdao?.webUI?.HuarongdaoGamePage;
  if (!GamePage) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        当前安装的 sa2kit 版本未导出华容道 Web 组件（huarongdao.webUI.HuarongdaoGamePage）。
      </div>
    );
  }
  return <GamePage config={demoConfig as any} />;
}
