'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FestivalCardManagedPage } from 'sa2kit/festivalCard';

function FestivalCardPageContent() {
  const searchParams = useSearchParams();
  const cardId = searchParams.get('cardId') || undefined;

  return (
    <FestivalCardManagedPage apiBase="/api/festivalCard" cardId={cardId} />
  );
}

export default function FestivalCardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <FestivalCardPageContent />
    </Suspense>
  );
}
