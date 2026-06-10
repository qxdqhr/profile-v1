'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FestivalCardConfigPage } from 'sa2kit/festivalCard';

function FestivalCardConfigRoutePageContent() {
  const searchParams = useSearchParams();
  const cardId = searchParams.get('cardId') || undefined;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <header className="space-y-1 text-slate-100">
          <h1 className="text-2xl font-semibold md:text-3xl">节日贺卡配置中心</h1>
          <p className="text-sm text-slate-300 md:text-base">路由：/festivalCard/config + 主页面参数 cardId</p>
        </header>

        <FestivalCardConfigPage
          apiBase="/api/festivalCard"
          cardId={cardId}
          mainPagePath="/testField/festivalCard"
        />
      </div>
    </main>
  );
}

export default function FestivalCardConfigRoutePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <FestivalCardConfigRoutePageContent />
    </Suspense>
  );
}
