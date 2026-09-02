'use client';

import { useParams, useRouter } from 'next/navigation';
import { EventDetailPage } from '@profile/calendar-core';

export default function EventDetailRoute() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);

  if (!Number.isFinite(eventId)) {
    return null;
  }

  return <EventDetailPage eventId={eventId} onBack={() => router.push('/')} />;
}
