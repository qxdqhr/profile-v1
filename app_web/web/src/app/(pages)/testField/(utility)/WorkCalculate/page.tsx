import { redirect } from 'next/navigation';

/** Legacy testField → 正式路径 /tools/work-calculate */
export default function WorkCalculateLegacyRedirect() {
  redirect('/tools/work-calculate');
}
