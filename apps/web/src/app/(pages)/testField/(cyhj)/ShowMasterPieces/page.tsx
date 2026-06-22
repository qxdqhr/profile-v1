import { redirect } from 'next/navigation';
import { getShowmasterpieceAppUrl } from '@/lib/showmasterpiece-app-url';

/** ShowMasterPieces 主页面已迁至 @profile/showmasterpiece 子应用 */
export default function ShowMasterPiecesPageWrapper() {
  redirect(getShowmasterpieceAppUrl('/'));
}
