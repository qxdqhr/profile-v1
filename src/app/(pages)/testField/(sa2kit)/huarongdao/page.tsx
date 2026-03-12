// @ts-nocheck
'use client';

import React from 'react';
import { HuarongdaoGamePage } from 'sa2kit/huarongdao/ui/web';

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
  return <HuarongdaoGamePage config={demoConfig as any} />;
}
