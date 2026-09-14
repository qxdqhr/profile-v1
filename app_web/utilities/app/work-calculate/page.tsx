'use client';

import { lazyClientPage } from '../../lib/lazy-client-page';

const WorkCalculate = lazyClientPage(() =>
  import('sa2kit/business/webTools/workCalculate').then((m) => ({
    default: m.WorkCalculatePage,
  })),
);

export default function WorkCalculateRoutePage() {
  return <WorkCalculate backHref="/tools" />;
}
