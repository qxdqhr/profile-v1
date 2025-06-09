import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { comicUniverseArtworks } from '../../../../../../db/schema/masterpieces';
import { eq, and } from 'drizzle-orm';

/**
 * 获取作品缩略图
 * GET /api/masterpieces/collections/[id]/artworks/[artworkId]/thumbnail?size=small|medium|large
 * 
 * 用途：按需加载不同尺寸的缩略图
 * 
 * 性能优化策略:
 * 1. 三种预设尺寸：small(150x150)、medium(300x300)、large(600x600)
 * 2. 长期缓存策略（24小时强缓存 + 7天过期重验证）
 * 3. 支持条件请求和ETag
 * 4. 轻量级查询，只获取所需的缩略图数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; artworkId: string } }
) {
  try {
    const collectionId = parseInt(params.id);
    const artworkId = parseInt(params.artworkId);
    const url = new URL(request.url);
    const size = url.searchParams.get('size') || 'medium'; // 默认中等尺寸

    // 验证参数
    if (isNaN(collectionId) || isNaN(artworkId)) {
      return NextResponse.json(
        { error: '无效的参数' },
        { status: 400 }
      );
    }

    if (!['small', 'medium', 'large'].includes(size)) {
      return NextResponse.json(
        { error: '无效的尺寸参数，支持：small, medium, large' },
        { status: 400 }
      );
    }

    // 根据尺寸选择对应的字段
    const thumbnailField = size === 'small' 
      ? comicUniverseArtworks.thumbnailSmall
      : size === 'medium'
      ? comicUniverseArtworks.thumbnailMedium
      : comicUniverseArtworks.thumbnailLarge;

    // 查询缩略图数据
    const result = await db
      .select({
        thumbnail: thumbnailField,
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
        { error: '缩略图不存在' },
        { status: 404 }
      );
    }

    const artwork = result[0];
    
    if (!artwork.thumbnail) {
      return NextResponse.json(
        { error: '缩略图数据不存在，可能需要重新生成' },
        { status: 404 }
      );
    }

    // 检查条件请求（304 Not Modified 支持）
    const ifNoneMatch = request.headers.get('if-none-match');
    const etag = `"${artworkId}-${size}-${artwork.updatedAt?.getTime() || 0}"`;
    
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    // 处理base64缩略图数据
    if (artwork.thumbnail.startsWith('data:')) {
      const [mimeType, base64Data] = artwork.thumbnail.split(',');
      const contentType = mimeType.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
      const buffer = Buffer.from(base64Data, 'base64');
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800', // 24小时强缓存，7天过期重验证
          'ETag': etag,
          'Last-Modified': artwork.updatedAt?.toUTCString() || new Date().toUTCString(),
          'X-Thumbnail-Size': size,
        },
      });
    } else {
      // URL 缩略图 - 重定向
      return NextResponse.redirect(artwork.thumbnail, 302);
    }

  } catch (error) {
    console.error('获取缩略图失败:', error);
    return NextResponse.json(
      { error: '获取缩略图失败' },
      { status: 500 }
    );
  }
}

/**
 * 检查缩略图是否存在
 * HEAD /api/masterpieces/collections/[id]/artworks/[artworkId]/thumbnail?size=small|medium|large
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: { id: string; artworkId: string } }
) {
  try {
    const collectionId = parseInt(params.id);
    const artworkId = parseInt(params.artworkId);
    const url = new URL(request.url);
    const size = url.searchParams.get('size') || 'medium';

    if (isNaN(collectionId) || isNaN(artworkId)) {
      return new NextResponse(null, { status: 400 });
    }

    if (!['small', 'medium', 'large'].includes(size)) {
      return new NextResponse(null, { status: 400 });
    }

    // 只检查是否存在，不获取数据
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
    const etag = `"${artworkId}-${size}-${artwork.updatedAt?.getTime() || 0}"`;

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'ETag': etag,
        'Last-Modified': artwork.updatedAt?.toUTCString() || new Date().toUTCString(),
        'X-Thumbnail-Size': size,
      },
    });

  } catch (error) {
    console.error('检查缩略图失败:', error);
    return new NextResponse(null, { status: 500 });
  }
} 