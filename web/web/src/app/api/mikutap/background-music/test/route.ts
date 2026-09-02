import { NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { mikutapBackgroundMusic } from '../../../../../modules/mikutap/db/schema';

// 标记为动态路由，防止静态生成
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 测试数据库连接和表结构
    const count = await db.select().from(mikutapBackgroundMusic);
    
    return NextResponse.json({
      success: true,
      message: '🎉 API工作正常！',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        recordCount: count.length,
        tableStructure: 'audioData字段为必填，已移除file和storageType字段'
      },
      environment: process.env.NODE_ENV || 'unknown'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '❌ API测试失败',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 