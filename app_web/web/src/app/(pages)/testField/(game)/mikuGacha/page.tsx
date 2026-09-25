'use client';

import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

/** 正式入口：/testField/mikuGacha（实现在 sa2kit/business/mikuGacha） */
const MikuGachaRoute = lazyClientPage(() =>
  import('sa2kit/business/mikuGacha').then((m) => ({
    default: m.MikuGachaPage,
  })),
);

export default MikuGachaRoute;
