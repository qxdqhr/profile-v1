'use client';

import { ShowMasterPiecesPage } from '@/modules/showmasterpiece';

interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function ShowMasterPiecesPageWrapper({ searchParams }: PageProps) {
  // 从URL搜索参数中获取活动key (event参数)
  const eventParam = searchParams?.event as string | undefined;
  
  console.log('🎯 [用户端页面] 接收到的活动参数:', { eventParam, allSearchParams: searchParams });
  
  return <ShowMasterPiecesPage eventParam={eventParam} />;
}
