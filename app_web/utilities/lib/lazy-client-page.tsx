'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
      加载中…
    </div>
  );
}

/** webTools 页禁用 SSR，避免 sa2kit dist barrel 在预渲染阶段报错。 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyClientPage(loader: () => Promise<{ default: ComponentType<any> }>) {
  return dynamic(loader, {
    ssr: false,
    loading: PageFallback,
  });
}
