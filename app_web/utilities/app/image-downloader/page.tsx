'use client';

import { lazyClientPage } from '../../lib/lazy-client-page';

const ImageDownloader = lazyClientPage(() =>
  import('sa2kit/business/webTools/imageDownloader').then((m) => ({
    default: m.ImageDownloaderPage,
  })),
);

export default function ImageDownloaderRoutePage() {
  return <ImageDownloader backHref="/tools" />;
}
