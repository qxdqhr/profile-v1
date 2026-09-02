import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

const SolarSystemRoute = lazyClientPage(
  () => import('@/modules/solarSystem/pages/SolarSystemPage'),
);

export default SolarSystemRoute;
