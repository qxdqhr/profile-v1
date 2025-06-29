import { NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { mikutapBackgroundMusic } from '../../../../../modules/mikutap/db/schema';

export async function GET() {
  try {
    console.log('🔍 调试：查询所有背景音乐数据...');
    
    const result = await db.select().from(mikutapBackgroundMusic);
    console.log('🔍 调试：查询结果:', result);
    
    // 详细检查每个字段
    result.forEach((music, index) => {
      console.log(`🔍 调试：音乐 ${index + 1}:`, {
        id: music.id,
        name: music.name,
        isDefault: music.isDefault,
        fileType: music.fileType,
        file: music.file,
        volume: music.volume,
        loop: music.loop,
        bpm: music.bpm
      });
    });
    
    return NextResponse.json({
      success: true,
      count: result.length,
      data: result,
      debug: {
        message: '详细数据已在控制台输出'
      }
    });
  } catch (error) {
    console.error('❌ 调试查询失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 