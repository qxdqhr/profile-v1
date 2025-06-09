import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { comicUniverseArtworks } from '../../../../../../db/schema/masterpieces';
import { eq, and } from 'drizzle-orm';

/**
 * 获取单个作品的图片数据
 * GET /api/masterpieces/collections/[id]/artworks/[artworkId]/image
 * 
 * 用途：图片懒加载，按需加载作品图片数据
 * 
 * 性能优化策略:
 * 1. 只查询单个图片，减少数据传输量
 * 2. 设置长期缓存（1小时强缓存 + 24小时过期重验证）
 * 3. 支持条件请求（ETag/Last-Modified）
 * 4. 返回原始图片数据而非JSON包装
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; artworkId: string } }
) {
  try {
    const collectionId = parseInt(params.id);
    const artworkId = parseInt(params.artworkId);

    // 验证参数
    if (isNaN(collectionId) || isNaN(artworkId)) {
      return NextResponse.json(
        { error: '无效的参数' },
        { status: 400 }
      );
    }

    // 查询图片数据
    const result = await db
      .select({
        image: comicUniverseArtworks.image,
        updatedAt: comicUniverseArtworks.updatedAt,
      })
      .from(comicUniverseArtworks)
      .where(
        and(
          eq(comicUniverseArtworks.id, artworkId),
          eq(comicUniverseArtworks.collectionId, collectionId),
          eq(comicUniverseArtworks.isActive, true)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: '图片不存在' },
        { status: 404 }
      );
    }

    const artwork = result[0];
    
    // 检查条件请求（304 Not Modified 支持）
    const ifNoneMatch = request.headers.get('if-none-match');
    const etag = `"${artworkId}-${artwork.updatedAt?.getTime() || 0}"`;
    
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    // 判断图片类型并设置相应的响应
    const imageData = artwork.image;
    
    if (imageData.startsWith('data:')) {
      // Base64 图片数据
      const [mimeType, base64Data] = imageData.split(',');
      const contentType = mimeType.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
      const buffer = Buffer.from(base64Data, 'base64');
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', // 1小时强缓存，24小时过期重验证
          'ETag': etag,
          'Last-Modified': artwork.updatedAt?.toUTCString() || new Date().toUTCString(),
        },
      });
    } else {
      // URL 图片 - 重定向到实际图片地址
      return NextResponse.redirect(imageData, 302);
    }

  } catch (error) {
    console.error('获取图片失败:', error);
    return NextResponse.json(
      { error: '获取图片失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取图片元数据
 * HEAD /api/masterpieces/collections/[id]/artworks/[artworkId]/image
 * 
 * 用途：检查图片是否存在，获取图片大小等元数据
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: { id: string; artworkId: string } }
) {
  try {
    const collectionId = parseInt(params.id);
    const artworkId = parseInt(params.artworkId);

    if (isNaN(collectionId) || isNaN(artworkId)) {
      return new NextResponse(null, { status: 400 });
    }

    // 只查询是否存在，不获取图片数据
    const result = await db
      .select({
        id: comicUniverseArtworks.id,
        updatedAt: comicUniverseArtworks.updatedAt,
      })
      .from(comicUniverseArtworks)
      .where(
        and(
          eq(comicUniverseArtworks.id, artworkId),
          eq(comicUniverseArtworks.collectionId, collectionId),
          eq(comicUniverseArtworks.isActive, true)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return new NextResponse(null, { status: 404 });
    }

    const artwork = result[0];
    const etag = `"${artworkId}-${artwork.updatedAt?.getTime() || 0}"`;

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'ETag': etag,
        'Last-Modified': artwork.updatedAt?.toUTCString() || new Date().toUTCString(),
      },
    });

  } catch (error) {
    console.error('检查图片失败:', error);
    return new NextResponse(null, { status: 500 });
  }
} 