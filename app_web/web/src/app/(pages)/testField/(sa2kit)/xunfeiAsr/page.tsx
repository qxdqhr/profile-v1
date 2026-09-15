'use client';

import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

const XunfeiAsrRoute = lazyClientPage(() =>
  import('sa2kit/business/iflytek/ui/web').then((m) => ({
    default: m.XunfeiAsrLabPage,
  })),
);

export default XunfeiAsrRoute;
