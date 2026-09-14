'use client';

import { lazyClientPage } from '@/lib/runtime/lazy-client-page';

const SolarSystemRoute = lazyClientPage(() =>
  import('sa2kit/business/solarSystem').then((m) => ({
    default: m.SolarSystemPage,
  })),
);

export default SolarSystemRoute;
