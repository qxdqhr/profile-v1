import { redirect } from 'next/navigation';

/** Legacy testField → 正式路径 /tools/qr-code */
export default function QrCodeLegacyRedirect() {
  redirect('/tools/qr-code');
}
