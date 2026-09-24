'use client';

import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

const MikuGachaRoute = lazyClientPage(() =>
  import('sa2kit/business/mikuGacha').then((m) => ({
    default: m.MikuGachaPage,
  })),
);

export default MikuGachaRoute;
