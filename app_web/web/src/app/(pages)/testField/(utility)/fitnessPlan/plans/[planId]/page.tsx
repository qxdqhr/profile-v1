import { PlanDetailPage } from '@/modules/fitnessPlan';

interface PageProps {
  params: Promise<{ planId: string }>;
}

export default async function FitnessPlanDetailRoute({ params }: PageProps) {
  const { planId } = await params;
  return <PlanDetailPage planId={planId} />;
}
