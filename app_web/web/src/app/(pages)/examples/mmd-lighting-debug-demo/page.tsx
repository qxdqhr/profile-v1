import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

const MMDLightingDebugDemoRoute = lazyClientPage(
  () => import('./LightingDebugDemo'),
);

export default MMDLightingDebugDemoRoute;
