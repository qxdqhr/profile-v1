import CardMakerAuthShell from '@/lib/cardMaker/CardMakerAuthShell';
import { CardMakerPage } from '@/modules/cardMaker';

export default function Page() {
  return (
    <CardMakerAuthShell>
      <CardMakerPage />
    </CardMakerAuthShell>
  );
}

export const metadata = {
  title: '名片制作器',
  description: '创建和编辑个性化名片',
};
