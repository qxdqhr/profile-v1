import FitnessPlanAuthShell from '../../../lib/FitnessPlanAuthShell';
import { FitnessPlanLayout, WorkoutSessionPage } from 'sa2kit/business/fitnessPlan/ui/web';

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return (
    <FitnessPlanAuthShell>
      <FitnessPlanLayout>
        <WorkoutSessionPage sessionId={sessionId} />
      </FitnessPlanLayout>
    </FitnessPlanAuthShell>
  );
}
