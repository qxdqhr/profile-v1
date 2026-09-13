import FitnessPlanAuthShell from '../lib/FitnessPlanAuthShell';
import { FitnessPlanLayout, TodayPage } from 'sa2kit/business/fitnessPlan/ui/web';

export default function FitnessPlanHomePage() {
  return (
    <FitnessPlanAuthShell>
      <FitnessPlanLayout>
        <TodayPage />
      </FitnessPlanLayout>
    </FitnessPlanAuthShell>
  );
}
