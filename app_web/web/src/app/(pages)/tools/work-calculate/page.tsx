import { redirect } from 'next/navigation';

/** 主站薄兼容 → utilities 子应用 /tools/work-calculate */
export default function WorkCalculateToolRedirectPage() {
  redirect('/tools/work-calculate');
}
