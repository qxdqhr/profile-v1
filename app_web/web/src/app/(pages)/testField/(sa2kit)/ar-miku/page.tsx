import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

const ArMikuRoute = lazyClientPage(() => import('./ArMikuPage'));

export default ArMikuRoute;
