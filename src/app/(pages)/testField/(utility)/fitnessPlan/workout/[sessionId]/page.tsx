import { WorkoutSessionPage } from '@/modules/fitnessPlan';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function FitnessWorkoutSessionRoute({ params }: PageProps) {
  const { sessionId } = await params;
  return <WorkoutSessionPage sessionId={sessionId} />;
}
