import FitnessPlanAuthShell from '../../lib/FitnessPlanAuthShell';
import { FitnessPlanLayout, WorkoutListPage } from 'sa2kit/business/fitnessPlan/ui/web';

export default function Page() {
  return (
    <FitnessPlanAuthShell>
      <FitnessPlanLayout>
        <WorkoutListPage />
      </FitnessPlanLayout>
    </FitnessPlanAuthShell>
  );
}
