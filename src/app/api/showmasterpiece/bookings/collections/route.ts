/**
 * ShowMasterpiece 模块 - 可预订画集列表API路由
 * 
 * 获取可预订的画集列表，返回简略信息（包括价格）
 * 
 * @fileoverview 可预订画集列表API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comicUniverseCollections } from '@/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';

/**
 * 获取可预订的画集列表
 * 
 * @param request Next.js请求对象
 * @returns 画集简略信息列表
 */
async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const orderBy = searchParams.get('orderBy') || 'displayOrder'; // displayOrder, createdAt, title

    // 构建查询条件
    const conditions = [
      eq(comicUniverseCollections.isPublished, true), // 只查询已发布的画集
    ];
    
    if (categoryId) {
      conditions.push(eq(comicUniverseCollections.categoryId, categoryId));
    }

    // 构建排序条件
    let orderByClause;
    switch (orderBy) {
      case 'createdAt':
        orderByClause = desc(comicUniverseCollections.createdAt);
        break;
      case 'title':
        orderByClause = asc(comicUniverseCollections.title);
        break;
      case 'displayOrder':
      default:
        orderByClause = asc(comicUniverseCollections.displayOrder);
        break;
    }

    // 查询画集列表
    const collections = await db
      .select({
        id: comicUniverseCollections.id,
        title: comicUniverseCollections.title,
        artist: comicUniverseCollections.artist,
        coverImage: comicUniverseCollections.coverImage,
        price: comicUniverseCollections.price,
        description: comicUniverseCollections.description,
        displayOrder: comicUniverseCollections.displayOrder,
        createdAt: comicUniverseCollections.createdAt,
      })
      .from(comicUniverseCollections)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(Math.min(100, Math.max(1, limit)));

    // 格式化响应数据
    const formattedCollections = collections.map(collection => ({
      id: collection.id,
      title: collection.title,
      artist: collection.artist,
      coverImage: collection.coverImage,
      price: collection.price,
      description: collection.description,
      displayOrder: collection.displayOrder,
      createdAt: collection.createdAt?.toISOString(),
    }));

    return NextResponse.json(formattedCollections);

  } catch (error) {
    console.error('获取可预订画集列表失败:', error);
    return NextResponse.json(
      { message: '获取画集列表失败' },
      { status: 500 }
    );
  }
}

export { GET }; 