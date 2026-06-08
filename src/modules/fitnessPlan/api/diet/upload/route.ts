import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { DietUploadError, uploadDietImageToOss } from '@/modules/fitnessPlan/services/dietUploadService';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_SIZE = 10 * 1024 * 1024;

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

    const result = await uploadDietImageToOss({
      file,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[fitnessPlan/diet/upload POST]', error);

    if (error instanceof DietUploadError) {
      const status = error.code === 'OSS_NOT_CONFIGURED' ? 503 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: '图片上传失败' }, { status: 500 });
  }
}
