import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 你的处理逻辑
  return NextResponse.json({ message: 'ok' });
}
