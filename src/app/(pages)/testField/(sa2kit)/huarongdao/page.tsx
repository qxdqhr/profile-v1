// @ts-nocheck
'use client';

import React from 'react';
import { huarongdao } from 'sa2kit';

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
  const GamePage = huarongdao.webUI.HuarongdaoGamePage;
  return <GamePage config={demoConfig as any} />;
}
