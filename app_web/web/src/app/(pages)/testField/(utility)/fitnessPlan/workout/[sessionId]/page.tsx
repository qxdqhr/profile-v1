import { redirect } from 'next/navigation';

export default async function FitnessPlanSessionLegacyRedirect({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  redirect(`/fitness-plan/workout/${sessionId}`);
}
