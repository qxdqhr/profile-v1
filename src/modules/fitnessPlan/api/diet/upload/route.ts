import { NextRequest, NextResponse } from 'next/server';
import { createUniversalFileServiceWithConfigManager } from 'sa2kit/universalFile/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { EnvConfigService } from '@/modules/configManager/services/envConfigService';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_SIZE = 10 * 1024 * 1024;

async function getFileService() {
  const envConfigService = EnvConfigService.getInstance();
  const envConfig = await envConfigService.loadConfigFromDatabase();
  envConfigService.setEnvironmentVariables(envConfig);
  return createUniversalFileServiceWithConfigManager();
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: '未提供图片文件' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: '仅支持 JPG / PNG / WebP / GIF 图片' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '图片大小不能超过 10MB' }, { status: 400 });
    }

    const fileService = await getFileService();
    const uploadResult = await fileService.uploadFile({
      file,
      moduleId: 'fitnessPlan',
      businessId: String(user.id),
      customPath: `fitnessPlan/diet/${user.id}`,
      metadata: {
        uploadedBy: String(user.id),
        uploadedAt: new Date().toISOString(),
      },
    });

    const imageUrl =
      uploadResult.cdnUrl ||
      (await fileService.getFileUrl(uploadResult.id, String(user.id)));

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        fileId: uploadResult.id,
      },
    });
  } catch (error) {
    console.error('[fitnessPlan/diet/upload POST]', error);
    return NextResponse.json({ error: '图片上传失败' }, { status: 500 });
  }
}
