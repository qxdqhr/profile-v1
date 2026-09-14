import SkillManagerAuthShell from '@/lib/skillManager/SkillManagerAuthShell';
import { SkillManagerPage } from '@/modules/skillManager';

export default function Page() {
  return (
    <SkillManagerAuthShell>
      <SkillManagerPage />
    </SkillManagerAuthShell>
  );
}
