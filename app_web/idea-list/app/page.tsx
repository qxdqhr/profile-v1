import IdeaListAuthShell from '../lib/IdeaListAuthShell';
import { IdeaListPage } from 'sa2kit/business/ideaList/ui/web';

export default function IdeaListHomePage() {
  return (
    <IdeaListAuthShell>
      <IdeaListPage />
    </IdeaListAuthShell>
  );
}
