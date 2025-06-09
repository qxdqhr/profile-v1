import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { comicUniverseArtworks } from '../../../db/schema/masterpieces';
import { eq, and, isNull } from 'drizzle-orm';
import { ImageProcessingService } from '../../../services/imageProcessingService';

/**
 * 批量生成缩略图工具API
 * POST /api/masterpieces/collections/generate-thumbnails
 * 
 * 用途：为现有作品补充生成缩略图
 * 
 * 请求参数：
 * - force?: boolean - 是否强制重新生成所有缩略图
 * - collectionId?: number - 只处理指定画集的作品
 * - limit?: number - 批量处理数量限制（默认10）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      force = false, 
      collectionId, 
      limit = 10 
    } = body;

    // 构建查询条件
    const whereConditions = [eq(comicUniverseArtworks.isActive, true)];
    
    if (collectionId) {
      whereConditions.push(eq(comicUniverseArtworks.collectionId, collectionId));
    }
    
    if (!force) {
      // 只处理没有缩略图的作品
      whereConditions.push(
        isNull(comicUniverseArtworks.thumbnailSmall)
      );
    }

    // 查询需要处理的作品
    const artworks = await db
      .select({
        id: comicUniverseArtworks.id,
        collectionId: comicUniverseArtworks.collectionId,
        title: comicUniverseArtworks.title,
        image: comicUniverseArtworks.image,
      })
      .from(comicUniverseArtworks)
      .where(and(...whereConditions))
      .limit(limit);

    if (artworks.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有需要处理的作品',
        processed: 0,
        errors: []
      });
    }

    const results = [];
    const errors = [];

    // 逐个处理作品
    for (const artwork of artworks) {
      try {
        console.log(`正在处理作品: ${artwork.title} (ID: ${artwork.id})`);
        
        // 生成缩略图
        const thumbnails = await ImageProcessingService.generateThumbnailsOnly(artwork.image);
        
        // 更新数据库
        await db
          .update(comicUniverseArtworks)
          .set({
            thumbnailSmall: thumbnails.thumbnailSmall,
            thumbnailMedium: thumbnails.thumbnailMedium,
            thumbnailLarge: thumbnails.thumbnailLarge,
            updatedAt: new Date(),
          })
          .where(eq(comicUniverseArtworks.id, artwork.id));

        results.push({
          id: artwork.id,
          title: artwork.title,
          status: 'success'
        });

        console.log(`✅ 成功处理作品: ${artwork.title}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        console.error(`❌ 处理作品失败: ${artwork.title}`, error);
        
        errors.push({
          id: artwork.id,
          title: artwork.title,
          error: errorMessage
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `批量处理完成，成功: ${results.length}，失败: ${errors.length}`,
      processed: results.length,
      total: artworks.length,
      results,
      errors
    });

  } catch (error) {
    console.error('批量生成缩略图失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '批量生成缩略图失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * 获取缩略图生成状态
 * GET /api/masterpieces/collections/generate-thumbnails
 */
export async function GET() {
  try {
    // 统计缩略图生成情况
    const [totalCount, withThumbnailsCount, withoutThumbnailsCount] = await Promise.all([
      // 总作品数
      db
        .select({ count: comicUniverseArtworks.id })
        .from(comicUniverseArtworks)
        .where(eq(comicUniverseArtworks.isActive, true)),

      // 有缩略图的作品数
      db
        .select({ count: comicUniverseArtworks.id })
        .from(comicUniverseArtworks)
        .where(
          and(
            eq(comicUniverseArtworks.isActive, true),
            isNull(comicUniverseArtworks.thumbnailSmall)
          )
        ),

      // 没有缩略图的作品数
      db
        .select({ count: comicUniverseArtworks.id })
        .from(comicUniverseArtworks)
        .where(
          and(
            eq(comicUniverseArtworks.isActive, true),
            isNull(comicUniverseArtworks.thumbnailSmall)
          )
        ),
    ]);

    return NextResponse.json({
      total: totalCount.length,
      withThumbnails: totalCount.length - withoutThumbnailsCount.length,
      withoutThumbnails: withoutThumbnailsCount.length,
      completionRate: totalCount.length > 0 
        ? ((totalCount.length - withoutThumbnailsCount.length) / totalCount.length * 100).toFixed(1) + '%'
        : '0%'
    });

  } catch (error) {
    console.error('获取缩略图状态失败:', error);
    return NextResponse.json(
      { error: '获取缩略图状态失败' },
      { status: 500 }
    );
  }
} 