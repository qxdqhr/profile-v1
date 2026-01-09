'use client';

import { use } from 'react';
import { ShowMasterPiecesPage } from '@/modules/showmasterpiece';

interface PageProps {
  params?: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default function ShowMasterPiecesPageWrapper({ searchParams }: PageProps) {
  // Next.js 16+ 中 searchParams 是一个 Promise，需要使用 React.use() 解包
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  
  // 从URL搜索参数中获取活动key (event参数)
  const eventParam = resolvedSearchParams?.event as string | undefined;
  
  console.log('🎯 [用户端页面] 接收到的活动参数:', { eventParam, allSearchParams: resolvedSearchParams });
  
  return <ShowMasterPiecesPage eventParam={eventParam} />;
}
