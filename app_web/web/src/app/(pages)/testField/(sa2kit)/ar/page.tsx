'use client';

import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

const ArRoute = lazyClientPage(() => import('./ArPage'));

export default ArRoute;
