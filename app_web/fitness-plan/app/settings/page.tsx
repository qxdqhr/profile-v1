import FitnessPlanAuthShell from '../../lib/FitnessPlanAuthShell';
import { FitnessPlanLayout, SettingsPage } from 'sa2kit/business/fitnessPlan/ui/web';

export default function Page() {
  return (
    <FitnessPlanAuthShell>
      <FitnessPlanLayout>
        <SettingsPage />
      </FitnessPlanLayout>
    </FitnessPlanAuthShell>
  );
}
