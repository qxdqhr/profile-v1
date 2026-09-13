import { redirect } from 'next/navigation';

/** Legacy testField 入口 → 独立子应用 */
export default function IdeaListLegacyRedirect() {
  redirect('/idea-list');
}
