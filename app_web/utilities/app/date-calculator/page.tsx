'use client';

import { lazyClientPage } from '../../lib/lazy-client-page';

const DateCalculatorDemo = lazyClientPage(() =>
  import('sa2kit/business/webTools/dateCalculator').then((m) => ({
    default: m.DateCalculatorDemoPage,
  })),
);

export default function DateCalculatorPage() {
  return <DateCalculatorDemo />;
}
