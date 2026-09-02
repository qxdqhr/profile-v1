import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { mikutapBackgroundMusic } from '../../../../../modules/mikutap/db/schema';
import { getApiSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  const user = await getApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: '未授权的访问' }, { status: 401 });
  }

  try {
    const count = await db.select().from(mikutapBackgroundMusic);

    return NextResponse.json({
      success: true,
      message: '🎉 API工作正常！',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        recordCount: count.length,
        tableStructure: 'audioData字段为必填，已移除file和storageType字段',
      },
      environment: process.env.NODE_ENV || 'unknown',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '❌ API测试失败',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
