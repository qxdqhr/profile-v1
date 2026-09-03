'use client';

import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

const Page = lazyClientPage(() => import('./ClientPage'));

export default Page;
