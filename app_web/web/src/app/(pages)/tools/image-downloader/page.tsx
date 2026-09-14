import { redirect } from 'next/navigation';

/** 主站薄兼容 → utilities 子应用 /tools/image-downloader */
export default function ImageDownloaderToolRedirectPage() {
  redirect('/tools/image-downloader');
}
