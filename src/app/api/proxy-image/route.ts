import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: '缺少图片URL参数' },
        { status: 400 }
      );
    }

    // 验证URL格式
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: '无效的图片URL' },
        { status: 400 }
      );
    }

    // 设置请求头，模拟浏览器行为
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };

    // 从原始URL获取图片
    const response = await fetch(imageUrl, {
      headers,
      // 设置超时时间
      signal: AbortSignal.timeout(30000), // 30秒超时
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `获取图片失败: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // 检查内容类型是否为图片
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'URL指向的不是有效的图片文件' },
        { status: 400 }
      );
    }

    // 获取图片数据
    const imageBuffer = await response.arrayBuffer();

    // 创建响应，设置正确的头部
    const proxyResponse = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

    return proxyResponse;

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

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// 允许的HTTP方法
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 