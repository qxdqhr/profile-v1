import FitnessPlanAuthShell from '../../lib/FitnessPlanAuthShell';
import { FitnessPlanLayout, PlansPage } from 'sa2kit/business/fitnessPlan/ui/web';

export default function Page() {
  return (
    <FitnessPlanAuthShell>
      <FitnessPlanLayout>
        <PlansPage />
      </FitnessPlanLayout>
    </FitnessPlanAuthShell>
  );
}
