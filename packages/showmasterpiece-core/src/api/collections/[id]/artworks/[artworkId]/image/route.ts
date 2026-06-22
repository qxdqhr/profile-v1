import { NextRequest, NextResponse } from 'next/server';
import { db } from '@profile/db';
import { eq, and } from 'drizzle-orm';
import { resolveShowmasterpieceFileUrl } from '@profile/showmasterpiece-core/fileUrl';
import { apiError, logRouteError } from '../../../../../lib/response';

const getComicUniverseArtworks = async () => {
  const module = await import('@profile/showmasterpiece-core/server');
  return module.comicUniverseArtworks;
};

async function resolveArtworkFileUrl(fileId: string): Promise<string | null> {
  try {
    return await resolveShowmasterpieceFileUrl(fileId);
  } catch (error) {
    logRouteError('通过 fileId 获取图片失败:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; artworkId: string }> },
) {
  try {
    const resolvedParams = await params;
    const collectionId = parseInt(resolvedParams.id, 10);
    const artworkId = parseInt(resolvedParams.artworkId, 10);

    if (Number.isNaN(collectionId) || Number.isNaN(artworkId)) {
      return apiError('无效的参数', 400);
    }

    const comicUniverseArtworks = await getComicUniverseArtworks();
    const result = await db
      .select({
        fileId: comicUniverseArtworks.fileId,
        image: comicUniverseArtworks.image,
        updatedAt: comicUniverseArtworks.updatedAt,
      })
      .from(comicUniverseArtworks)
      .where(
        and(
          eq(comicUniverseArtworks.id, artworkId),
          eq(comicUniverseArtworks.collectionId, collectionId),
          eq(comicUniverseArtworks.isActive, true),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return apiError('图片不存在', 404);
    }

    const artwork = result[0];
    const ifNoneMatch = request.headers.get('if-none-match');
    const etag = `"${artworkId}-${artwork.updatedAt?.getTime() || 0}"`;

    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    if (artwork.fileId) {
      const imageUrl = await resolveArtworkFileUrl(artwork.fileId);
      if (imageUrl) {
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          return NextResponse.redirect(imageUrl, 302);
        }
        const baseUrl = request.nextUrl.origin;
        return NextResponse.redirect(`${baseUrl}${imageUrl}`, 302);
      }
    }

    const imageData = artwork.image;
    if (!imageData) {
      return apiError('图片数据不存在', 404);
    }

    if (imageData.startsWith('data:')) {
      const [mimeType, base64Data] = imageData.split(',');
      const contentType = mimeType.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
      const buffer = Buffer.from(base64Data, 'base64');

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          ETag: etag,
          'Last-Modified':
            artwork.updatedAt?.toUTCString() || new Date().toUTCString(),
        },
      });
    }

    return NextResponse.redirect(imageData, 302);
  } catch (error) {
    logRouteError('获取图片失败:', error);
    return apiError('获取图片失败', 500);
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; artworkId: string }> },
) {
  try {
    const resolvedParams = await params;
    const collectionId = parseInt(resolvedParams.id, 10);
    const artworkId = parseInt(resolvedParams.artworkId, 10);

    if (Number.isNaN(collectionId) || Number.isNaN(artworkId)) {
      return new NextResponse(null, { status: 400 });
    }

    const comicUniverseArtworks = await getComicUniverseArtworks();
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
          eq(comicUniverseArtworks.isActive, true),
        ),
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
        ETag: etag,
        'Last-Modified':
          artwork.updatedAt?.toUTCString() || new Date().toUTCString(),
      },
    });
  } catch (error) {
    logRouteError('检查图片失败:', error);
    return new NextResponse(null, { status: 500 });
  }
}
