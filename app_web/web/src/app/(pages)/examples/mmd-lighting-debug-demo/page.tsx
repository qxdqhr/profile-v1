'use client';

import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

const MMDLightingDebugDemoRoute = lazyClientPage(() =>
  import('sa2kit/business/mmd/demos').then((m) => ({
    default: m.MMDLightingDebugDemoPage,
  })),
);

export default MMDLightingDebugDemoRoute;
