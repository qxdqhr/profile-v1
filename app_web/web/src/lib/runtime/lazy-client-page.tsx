import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

function HeavyPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-neutral-400">
      加载中…
    </div>
  );
}

/** 3D / 游戏页不进 SSR，避免把 Three/Phaser 打进首屏共享图。 */
export function lazyClientPage<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
) {
  return dynamic(loader, {
    ssr: false,
    loading: HeavyPageFallback,
  });
}
