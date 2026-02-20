import { NextRequest, NextResponse } from 'next/server';
import { tagsDbService } from 'sa2kit/showmasterpiece/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log('📋 [标签API] 获取标签列表');

    const tags = await tagsDbService.getTags();
    
    console.log(`✅ [标签API] 获取到 ${tags.length} 个标签`);
    
    return NextResponse.json({
      success: true,
      data: tags,
      total: tags.length
    });
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json(
      { error: '获取标签失败' },
      { status: 500 }
    );
  }
} 
