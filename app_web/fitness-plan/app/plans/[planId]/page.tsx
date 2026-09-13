import FitnessPlanAuthShell from '../../../lib/FitnessPlanAuthShell';
import { FitnessPlanLayout, PlanDetailPage } from 'sa2kit/business/fitnessPlan/ui/web';

export default async function Page({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  return (
    <FitnessPlanAuthShell>
      <FitnessPlanLayout>
        <PlanDetailPage planId={planId} />
      </FitnessPlanLayout>
    </FitnessPlanAuthShell>
  );
}
