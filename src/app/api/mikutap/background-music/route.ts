import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { mikutapBackgroundMusic } from '../../../../modules/mikutap/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { blobToBase64 } from '../../../../modules/mikutap/utils/audioUtils';

// App Router中增加路由配置
export const maxDuration = 300; // 5分钟超时（增加处理时间）
export const dynamic = 'force-dynamic'; // 强制动态渲染
export const runtime = 'nodejs'; // 使用Node.js运行时

// 获取背景音乐列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('configId') || 'default';

    const musics = await db
      .select()
      .from(mikutapBackgroundMusic)
      .where(eq(mikutapBackgroundMusic.configId, configId));

    return NextResponse.json({ success: true, data: musics });
  } catch (error) {
    console.error('获取背景音乐失败:', error);
    return NextResponse.json(
      { success: false, error: '获取背景音乐失败' },
      { status: 500 }
    );
  }
}

// 上传或创建背景音乐
export async function POST(request: NextRequest) {
  console.log('🎵 [API] 开始处理背景音乐上传请求...');
  const startTime = Date.now();
  
  try {
    console.log('🎵 [API] 开始解析FormData...');
    const formData = await request.formData();
    console.log('🎵 [API] FormData解析完成');
    const configId = formData.get('configId') as string || 'default';
    const name = formData.get('name') as string;
    const volume = parseFloat(formData.get('volume') as string);
    const loop = formData.get('loop') === 'true';
    const bpm = parseInt(formData.get('bpm') as string);
    const isDefault = formData.get('isDefault') === 'true';
    const fileType = formData.get('fileType') as string; // 'uploaded' | 'generated'
    
    let audioData = '';
    let fileSize = 0;
    let duration = 0;

    // 设置文件大小限制 (25MB，考虑base64编码会增加约33%的大小)
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

    if (fileType === 'uploaded') {
      // 处理上传的文件
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json(
          { success: false, error: '未提供文件' },
          { status: 400 }
        );
      }

      fileSize = file.size;
      console.log(`🎵 [API] 处理上传文件: ${file.name}, 大小: ${Math.round(fileSize / 1024)}KB`);
      
      // 检查文件大小
      if (fileSize > MAX_FILE_SIZE) {
        console.log(`❌ [API] 文件大小超出限制: ${Math.round(fileSize / 1024 / 1024)}MB > ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`);
        return NextResponse.json(
          { success: false, error: `文件大小超出限制，最大支持 ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB` },
          { status: 413 }
        );
      }

      console.log('🎵 [API] 开始转换音频为Base64...');
      audioData = await blobToBase64(file);
      console.log(`✅ [API] Base64转换完成，数据长度: ${audioData.length} 字符`);
      console.log(`✅ 将上传的音乐文件存储到数据库，文件大小: ${Math.round(fileSize / 1024)}KB`);
    } else if (fileType === 'generated') {
      // 处理生成的音乐
      const generatedFile = formData.get('generatedFile') as File;
      
      if (!generatedFile) {
        return NextResponse.json(
          { success: false, error: '未提供生成的音乐文件' },
          { status: 400 }
        );
      }

      fileSize = generatedFile.size;
      
      // 检查文件大小
      if (fileSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `生成的音乐文件过大，请减少音乐时长或降低质量` },
          { status: 413 }
        );
      }

      audioData = await blobToBase64(generatedFile);
      console.log(`✅ 将生成的音乐文件存储到数据库，文件大小: ${Math.round(fileSize / 1024)}KB`);
    }

    if (!audioData) {
      return NextResponse.json(
        { success: false, error: '音频数据处理失败' },
        { status: 500 }
      );
    }

    // 解析节奏配置
    const rhythmPattern = formData.get('rhythmPattern') 
      ? JSON.parse(formData.get('rhythmPattern') as string)
      : null;

    // 解析生成配置
    const generationConfig = formData.get('generationConfig')
      ? JSON.parse(formData.get('generationConfig') as string)
      : null;

    // 如果设置为默认，先取消其他默认音乐
    if (isDefault) {
      await db
        .update(mikutapBackgroundMusic)
        .set({ isDefault: false })
        .where(eq(mikutapBackgroundMusic.configId, configId));
    }

    // 插入新的背景音乐记录
    console.log('🎵 [API] 开始插入数据库记录...');
    const [newMusic] = await db
      .insert(mikutapBackgroundMusic)
      .values({
        id: uuidv4(),
        configId,
        name,
        audioData, // Base64音频数据 - 必填
        fileType,
        volume,
        loop,
        bpm,
        isDefault,
        size: fileSize,
        duration,
        generationConfig,
        rhythmPattern,
      })
      .returning();

    const processingTime = Date.now() - startTime;
    console.log(`✅ [API] 音乐保存成功! 处理时间: ${processingTime}ms, 音乐ID: ${newMusic.id}`);

    return NextResponse.json({ success: true, data: newMusic });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [API] 保存背景音乐失败 (处理时间: ${processingTime}ms):`, error);
    
    // 更详细的错误信息
    let errorMessage = '保存背景音乐失败';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error('❌ [API] 错误堆栈:', error.stack);
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// 更新背景音乐
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const configId = searchParams.get('configId') || 'default';

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少音乐ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isDefault, ...updateData } = body;

    // 如果设置为默认，先取消其他默认音乐
    if (isDefault) {
      await db
        .update(mikutapBackgroundMusic)
        .set({ isDefault: false })
        .where(eq(mikutapBackgroundMusic.configId, configId));
    }

    // 更新音乐记录
    const [updatedMusic] = await db
      .update(mikutapBackgroundMusic)
      .set({ ...updateData, isDefault, updatedAt: new Date() })
      .where(and(
        eq(mikutapBackgroundMusic.id, id),
        eq(mikutapBackgroundMusic.configId, configId)
      ))
      .returning();

    if (!updatedMusic) {
      return NextResponse.json(
        { success: false, error: '音乐不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedMusic });
  } catch (error) {
    console.error('更新背景音乐失败:', error);
    return NextResponse.json(
      { success: false, error: '更新背景音乐失败' },
      { status: 500 }
    );
  }
}

// 删除背景音乐
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const configId = searchParams.get('configId') || 'default';

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少音乐ID' },
        { status: 400 }
      );
    }

    // 删除数据库记录
    const [deletedMusic] = await db
      .delete(mikutapBackgroundMusic)
      .where(and(
        eq(mikutapBackgroundMusic.id, id),
        eq(mikutapBackgroundMusic.configId, configId)
      ))
      .returning();

    if (!deletedMusic) {
      return NextResponse.json(
        { success: false, error: '音乐不存在' },
        { status: 404 }
      );
    }

    // TODO: 删除文件系统中的文件
    // 可以在这里添加文件删除逻辑

    return NextResponse.json({ success: true, data: deletedMusic });
  } catch (error) {
    console.error('删除背景音乐失败:', error);
    return NextResponse.json(
      { success: false, error: '删除背景音乐失败' },
      { status: 500 }
    );
  }
} 