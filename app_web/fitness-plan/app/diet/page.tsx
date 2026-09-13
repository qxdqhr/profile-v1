import FitnessPlanAuthShell from '../../lib/FitnessPlanAuthShell';
import { FitnessPlanLayout, DietPage } from 'sa2kit/business/fitnessPlan/ui/web';

export default function Page() {
  return (
    <FitnessPlanAuthShell>
      <FitnessPlanLayout>
        <DietPage />
      </FitnessPlanLayout>
    </FitnessPlanAuthShell>
  );
}
