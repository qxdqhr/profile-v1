import { comfyPromptDbService } from '../../../../../db/comfyPromptDbService';
import { ComfyUiClient } from '../../../../../services/comfyUiClient';
import { fail, requireAuthUser } from '../../../../_helpers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; index: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const id = Number((await params).id);
  const index = Number((await params).index);
  if (!Number.isFinite(id) || !Number.isFinite(index)) return fail('无效参数', 400);

  const job = await comfyPromptDbService.getJobById(user!.id, id);
  if (!job) return fail('任务不存在', 404);

  const image = job.outputImages[index];
  if (!image) return fail('输出图不存在', 404);

  const server = await comfyPromptDbService.getServerById(user!.id, job.serverId);
  if (!server) return fail('服务器不存在', 404);

  try {
    const client = new ComfyUiClient(server.baseUrl);
    const imageResponse = await client.fetchImage(image);
    const contentType = imageResponse.headers.get('content-type') ?? 'image/png';
    const buffer = await imageResponse.arrayBuffer();

    const url = new URL(request.url);
    const asDownload = url.searchParams.get('download') === '1';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('jpeg') ? 'jpg' : 'bin';
    const filename = image.filename || `job-${id}-output-${index}.${ext}`;

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
        ...(asDownload
          ? { 'Content-Disposition': `attachment; filename="${filename}"` }
          : {}),
      },
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : '获取图片失败', 502);
  }
}
