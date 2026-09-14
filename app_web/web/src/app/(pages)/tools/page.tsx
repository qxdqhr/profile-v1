import { redirect } from 'next/navigation';

/** 主站薄兼容 → utilities 子应用 /tools */
export default function ToolsIndexRedirectPage() {
  redirect('/tools');
}
