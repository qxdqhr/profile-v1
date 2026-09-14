import { redirect } from 'next/navigation';

/** 主站薄兼容 → utilities 子应用 /tools/qr-code */
export default function QrCodeToolRedirectPage() {
  redirect('/tools/qr-code');
}
