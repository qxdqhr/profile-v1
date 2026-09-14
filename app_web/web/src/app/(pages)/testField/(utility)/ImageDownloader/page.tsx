import { redirect } from 'next/navigation';

/** Legacy testField → 正式路径 /tools/image-downloader */
export default function ImageDownloaderLegacyRedirect() {
  redirect('/tools/image-downloader');
}
