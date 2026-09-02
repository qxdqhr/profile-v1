import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { mikutapBackgroundMusic } from '../../../../modules/mikutap/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { blobToBase64 } from '../../../../modules/mikutap/utils/audioUtils';
import { getApiSessionUser } from '@/lib/auth/session';

// App Router中增加路由配置
export const maxDuration = 300; // 5分钟超时（增加处理时间）
export const dynamic = 'force-dynamic'; // 强制动态渲染
export const runtime = 'nodejs'; // 使用Node.js运行时

// 获取背景音乐列表
export async function GET(request: NextRequest) {
  console.log('🎵 [API GET] 开始处理获取背景音乐请求...');
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('configId') || 'default';
    console.log(`🎵 [API GET] 查询配置ID: ${configId}`);

    console.log('🎵 [API GET] 开始数据库查询...');
    const dbStartTime = Date.now();
    
    const metaOnly = searchParams.get('meta') === '1';
    const musics = metaOnly
      ? await db
          .select({
            id: mikutapBackgroundMusic.id,
            configId: mikutapBackgroundMusic.configId,
            name: mikutapBackgroundMusic.name,
            fileType: mikutapBackgroundMusic.fileType,
            isDefault: mikutapBackgroundMusic.isDefault,
            volume: mikutapBackgroundMusic.volume,
            loop: mikutapBackgroundMusic.loop,
            bpm: mikutapBackgroundMusic.bpm,
            description: mikutapBackgroundMusic.description,
            size: mikutapBackgroundMusic.size,
            duration: mikutapBackgroundMusic.duration,
            createdAt: mikutapBackgroundMusic.createdAt,
            updatedAt: mikutapBackgroundMusic.updatedAt,
          })
          .from(mikutapBackgroundMusic)
          .where(eq(mikutapBackgroundMusic.configId, configId))
      : await db
          .select()
          .from(mikutapBackgroundMusic)
          .where(eq(mikutapBackgroundMusic.configId, configId));
      
    const dbTime = Date.now() - dbStartTime;
    console.log(`🎵 [API GET] 数据库查询完成，耗时: ${dbTime}ms，返回${musics.length}条记录${metaOnly ? '（meta-only）' : ''}`);

    const totalTime = Date.now() - startTime;
    console.log(`✅ [API GET] 请求处理完成，总耗时: ${totalTime}ms`);

    return NextResponse.json({ success: true, data: musics, metaOnly });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ [API GET] 获取背景音乐失败 (耗时: ${totalTime}ms):`, error);
    
    let errorMessage = '获取背景音乐失败';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error('❌ [API GET] 错误堆栈:', error.stack);
      
      // 检查是否是数据库连接问题
      if (error.message.includes('ECONNREFUSED') || error.message.includes('Connection')) {
        console.error('❌ [API GET] 数据库连接失败');
        return NextResponse.json(
          { success: false, error: '数据库连接失败，请稍后重试' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// 上传或创建背景音乐
export async function POST(request: NextRequest) {
  console.log('🎵 [API POST] 开始处理背景音乐上传请求...');
  const startTime = Date.now();

  const user = await getApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: '未授权的访问' }, { status: 401 });
  }
  
  // 检查系统资源状态
  try {
    const memoryUsage = process.memoryUsage();
    console.log('🎵 [API POST] 系统内存状态:', {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB'
    });
  } catch (e) {
    console.warn('🎵 [API POST] 无法获取内存状态:', e);
  }
  
  try {
    console.log('🎵 [API POST] 开始解析FormData...');
    const parseStartTime = Date.now();
    const formData = await request.formData();
    const parseTime = Date.now() - parseStartTime;
    console.log(`🎵 [API POST] FormData解析完成，耗时: ${parseTime}ms`);
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
      const conversionStartTime = Date.now();
      audioData = await blobToBase64(file);
      const conversionTime = Date.now() - conversionStartTime;
      console.log(`✅ [API] Base64转换完成，数据长度: ${audioData.length} 字符，转换耗时: ${conversionTime}ms`);
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

    // 使用事务确保数据一致性
    console.log('🎵 [API] 开始数据库事务...');
    const dbStartTime = Date.now();
    
    const [newMusic] = await db.transaction(async (tx) => {
      // 如果设置为默认，先取消其他默认音乐
      if (isDefault) {
        console.log('🎵 [API] 取消其他默认音乐...');
        await tx
          .update(mikutapBackgroundMusic)
          .set({ isDefault: false })
          .where(eq(mikutapBackgroundMusic.configId, configId));
      }

      // 插入新的背景音乐记录
      console.log('🎵 [API] 插入新音乐记录...');
      const result = await tx
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
      
      console.log('🎵 [API] 数据库记录插入成功');
      return result;
    });
    
    const dbTime = Date.now() - dbStartTime;
    console.log(`✅ [API] 数据库事务完成，耗时: ${dbTime}ms`);

    const processingTime = Date.now() - startTime;
    console.log(`✅ [API] 音乐保存成功! 处理时间: ${processingTime}ms, 音乐ID: ${newMusic.id}`);

    return NextResponse.json({ success: true, data: newMusic });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [API POST] 保存背景音乐失败 (处理时间: ${processingTime}ms):`, error);
    
    // 检查系统资源状态
    try {
      const memoryUsage = process.memoryUsage();
      console.error('❌ [API POST] 错误时内存状态:', {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB'
      });
    } catch (e) {
      console.warn('❌ [API POST] 无法获取错误时内存状态:', e);
    }
    
    // 更详细的错误信息和状态码判断
    let errorMessage = '保存背景音乐失败';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error('❌ [API POST] 错误堆栈:', error.stack);
      console.error('❌ [API POST] 错误类型:', error.constructor.name);
      
      // 根据错误类型判断状态码
      if (error.message.includes('ECONNREFUSED') || error.message.includes('Connection')) {
        console.error('❌ [API POST] 数据库连接失败');
        errorMessage = '数据库连接失败，请稍后重试';
        statusCode = 503;
      } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        console.error('❌ [API POST] 请求超时');
        errorMessage = '请求处理超时，请稍后重试';
        statusCode = 503;
      } else if (error.message.includes('ENOMEM') || error.message.includes('memory')) {
        console.error('❌ [API POST] 内存不足');
        errorMessage = '服务器内存不足，请稍后重试';
        statusCode = 503;
      } else if (error.message.includes('EMFILE') || error.message.includes('ENOTFOUND')) {
        console.error('❌ [API POST] 系统资源不足');
        errorMessage = '服务器资源不足，请稍后重试';
        statusCode = 503;
      }
    }
    
    console.error(`❌ [API POST] 最终错误响应: ${statusCode} - ${errorMessage}`);
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

// 更新背景音乐
export async function PUT(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: '未授权的访问' }, { status: 401 });
    }

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
    const user = await getApiSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: '未授权的访问' }, { status: 401 });
    }

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

    return NextResponse.json({ success: true, data: deletedMusic });
  } catch (error) {
    console.error('删除背景音乐失败:', error);
    return NextResponse.json(
      { success: false, error: '删除背景音乐失败' },
      { status: 500 }
    );
  }
} 