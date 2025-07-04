import { NextRequest, NextResponse } from 'next/server';
import { CardMakerDbService } from '@/modules/cardMaker/db/cardMakerDbService';

// 标记为动态路由，防止静态生成
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    let assets;
    if (type && category) {
      assets = await CardMakerDbService.getAssetsByTypeAndCategory(type, category);
    } else if (type) {
      assets = await CardMakerDbService.getAssetsByType(type);
    } else if (category) {
      assets = await CardMakerDbService.getAssetsByCategory(category);
    } else {
      assets = await CardMakerDbService.getAllAssets();
    }

    // 转换数据格式，解析tags字段
    const formattedAssets = assets.map(asset => ({
      ...asset,
      tags: asset.tags ? JSON.parse(asset.tags) : []
    }));

    return NextResponse.json(formattedAssets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}