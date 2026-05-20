import { NextRequest, NextResponse } from 'next/server';
import { tagsDbService } from '@/modules/showmasterpiece/masterpiecesDbService';
import '@/modules/showmasterpiece/sa2kit-init';
import { apiError, logRouteError } from '../lib/response';

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
    logRouteError('获取标签失败:', error);
    return apiError('获取标签失败', 500);
  }
} 
