'use client';

import { lazyClientPage } from '../../lib/lazy-client-page';

const QrCodeDemo = lazyClientPage(() =>
  import('sa2kit/business/webTools/qrCode').then((m) => ({
    default: m.QRCodeDemoPage,
  })),
);

export default function QrCodePage() {
  return <QrCodeDemo />;
}
