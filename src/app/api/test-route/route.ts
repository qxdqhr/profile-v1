import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'profile-v1 test route is working',
    timestamp: new Date().toISOString(),
  });
}
