import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { mikutapBackgroundMusic } from '../../../../../modules/mikutap/db/schema';
import { getApiSessionUser } from '@/lib/auth/session';
import { notFoundJson } from '@/lib/auth/api-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return notFoundJson();
  }

  const user = await getApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: '未授权的访问' }, { status: 401 });
  }

  try {
    console.log('🔍 调试：查询所有背景音乐数据...');

    const result = await db.select().from(mikutapBackgroundMusic);
    console.log('🔍 调试：查询结果:', result);

    result.forEach((music, index) => {
      console.log(`🔍 调试：音乐 ${index + 1}:`, {
        id: music.id,
        name: music.name,
        isDefault: music.isDefault,
        fileType: music.fileType,
        audioDataLength: music.audioData?.length || 0,
        hasAudioData: !!music.audioData,
        volume: music.volume,
        loop: music.loop,
        bpm: music.bpm,
      });
    });

    return NextResponse.json({
      success: true,
      count: result.length,
      data: result,
      debug: {
        message: '详细数据已在控制台输出',
      },
    });
  } catch (error) {
    console.error('❌ 调试查询失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}
