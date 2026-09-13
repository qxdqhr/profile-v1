import FitnessPlanAuthShell from '../../lib/FitnessPlanAuthShell';
import { FitnessPlanLayout, CheckinPage } from 'sa2kit/business/fitnessPlan/ui/web';

export default function Page() {
  return (
    <FitnessPlanAuthShell>
      <FitnessPlanLayout>
        <CheckinPage />
      </FitnessPlanLayout>
    </FitnessPlanAuthShell>
  );
}
