import { redirect } from 'next/navigation';

export default async function FitnessPlanPlanLegacyRedirect({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  redirect(`/fitness-plan/plans/${planId}`);
}
