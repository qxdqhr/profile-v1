import { NextRequest, NextResponse } from 'next/server';
import { assertPublicHttpUrl } from '@/lib/security/publicHttpUrl';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_REDIRECTS = 3;

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

async function fetchPublicImage(rawUrl: string): Promise<Response | NextResponse> {
  let current = rawUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const checked = await assertPublicHttpUrl(current);
    if (!checked.ok) {
      return NextResponse.json({ error: checked.error }, { status: 400 });
    }

    const response = await fetch(checked.url.toString(), {
      headers: FETCH_HEADERS,
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        return NextResponse.json({ error: '图片重定向无效' }, { status: 400 });
      }
      current = new URL(location, checked.url).toString();
      continue;
    }

    return response;
  }

  return NextResponse.json({ error: '图片重定向次数过多' }, { status: 400 });
}

export async function GET(request: NextRequest) {
  try {
    const imageUrl = new URL(request.url).searchParams.get('url');
    if (!imageUrl) {
      return NextResponse.json({ error: '缺少图片URL参数' }, { status: 400 });
    }

    const fetched = await fetchPublicImage(imageUrl);
    if (fetched instanceof NextResponse) return fetched;

    if (!fetched.ok) {
      return NextResponse.json(
        { error: `获取图片失败: ${fetched.status} ${fetched.statusText}` },
        { status: fetched.status },
      );
    }

    const contentType = fetched.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL指向的不是有效的图片文件' }, { status: 400 });
    }

    const contentLength = Number(fetched.headers.get('content-length') || '0');
    if (contentLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: '图片过大' }, { status: 413 });
    }

    const imageBuffer = await fetched.arrayBuffer();
    if (imageBuffer.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: '图片过大' }, { status: 413 });
    }

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('代理图片下载错误:', error);

    let errorMessage = '代理下载失败';
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        errorMessage = '下载超时，请检查网络连接或尝试其他图片';
      } else if (error.message.includes('fetch')) {
        errorMessage = '无法连接到图片服务器';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
