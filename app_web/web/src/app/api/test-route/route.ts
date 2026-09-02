import { NextResponse } from 'next/server';
import { notFoundJson } from '@/lib/auth/api-guard';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return notFoundJson();
  }

  return NextResponse.json({
    success: true,
    message: 'profile-v1 test route is working',
    timestamp: new Date().toISOString(),
  });
}
