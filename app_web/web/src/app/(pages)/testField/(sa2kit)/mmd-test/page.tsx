import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

const MMDTestRoute = lazyClientPage(() => import('./MmdTestPage'));

export default MMDTestRoute;
