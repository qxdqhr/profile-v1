'use client';

import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

const MikuFireworks3DRoute = lazyClientPage(() => import('./FireworksPage'));

export default MikuFireworks3DRoute;
