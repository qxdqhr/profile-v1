import { NextRequest, NextResponse } from 'next/server';
import { buildMmdPlaylistFromSources } from 'sa2kit/mmd/server';
import { MMDModelsDbService, MMDAnimationsDbService } from '@/modules/mmd/db/mmdDbService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const modelsService = new MMDModelsDbService();
const animationsService = new MMDAnimationsDbService();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const limitParam = request.nextUrl.searchParams.get('limit');
    const limit = limitParam ? Math.max(1, Math.min(10, Number(limitParam))) : 5;

    const playlist = await buildPlaylistFromDatabase(id, limit);
    if (!playlist) {
      return NextResponse.json({ error: 'playlist not found' }, { status: 404 });
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('[MMD playlist] 查询失败:', error);
    return NextResponse.json(
      {
        error: 'failed to load playlist',
        details: error instanceof Error ? error.message : 'unknown error',
      },
      { status: 500 },
    );
  }
}

async function buildPlaylistFromDatabase(playlistId: string, limit: number) {
  const models = await modelsService.getPublicModels();
  if (!models.length) {
    return null;
  }

  let animations: Awaited<ReturnType<typeof animationsService.getPublicAnimations>> = [];
  try {
    animations = await animationsService.getPublicAnimations();
  } catch (error) {
    console.warn('[MMD playlist] 获取动画列表失败，将继续构建无动作的播放列表示例', error);
  }

  return buildMmdPlaylistFromSources({
    playlistId,
    models: models.map((model) => ({
      id: model.id,
      name: model.name,
      filePath: model.filePath,
      thumbnailPath: model.thumbnailPath,
    })),
    motions: animations.map((animation) => ({
      id: animation.id,
      name: animation.name,
      filePath: animation.filePath,
    })),
    limit,
    nodeDuration: 30,
  });
}
