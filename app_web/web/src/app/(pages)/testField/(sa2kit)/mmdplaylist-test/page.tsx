'use client';

import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

const MMDPlaylistTestRoute = lazyClientPage(() => import('./PlaylistTestPage'));

export default MMDPlaylistTestRoute;
