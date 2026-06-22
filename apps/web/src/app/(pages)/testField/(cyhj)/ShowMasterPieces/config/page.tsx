import { redirect } from 'next/navigation';
import { getShowmasterpieceAppUrl } from '@/lib/showmasterpiece-app-url';

export default function ShowMasterPiecesConfigPageWrapper() {
  redirect(getShowmasterpieceAppUrl('/config'));
}
