import { NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { mikutapBackgroundMusic } from '../../../../../modules/mikutap/db/schema';

export async function GET() {
  try {
    console.log('🔍 测试数据库连接...');
    
    // 测试数据库连接
    const result = await db.select().from(mikutapBackgroundMusic).limit(1);
    console.log('✅ 数据库连接成功，查询结果:', result);
    
    return NextResponse.json({
      success: true,
      message: '数据库连接正常',
      tableExists: true,
      sampleData: result
    });
  } catch (error) {
    console.error('❌ 数据库测试失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      tableExists: false
    }, { status: 500 });
  }
} 