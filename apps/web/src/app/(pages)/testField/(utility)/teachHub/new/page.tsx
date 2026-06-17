import { redirect } from 'next/navigation';
import { TEACH_HUB_BASE } from '@/modules/teachHub/utils/routes';

export default function NewWorkspaceRoute() {
  redirect(TEACH_HUB_BASE);
}
