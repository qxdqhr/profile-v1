import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { mikutapBackgroundMusic } from '../../../../modules/mikutap/db/schema';
import { eq, and } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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
  try {
    const formData = await request.formData();
    const configId = formData.get('configId') as string || 'default';
    const name = formData.get('name') as string;
    const volume = parseFloat(formData.get('volume') as string);
    const loop = formData.get('loop') === 'true';
    const bpm = parseInt(formData.get('bpm') as string);
    const isDefault = formData.get('isDefault') === 'true';
    const fileType = formData.get('fileType') as string; // 'uploaded' | 'generated'
    
    let filePath = '';
    let fileSize = 0;
    let duration = 0;

    if (fileType === 'uploaded') {
      // 处理上传的文件
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json(
          { success: false, error: '未提供文件' },
          { status: 400 }
        );
      }

      // 创建上传目录
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'mikutap', 'background-music');
      await mkdir(uploadDir, { recursive: true });

      // 生成唯一文件名
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const fullPath = join(uploadDir, fileName);

      // 保存文件
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(fullPath, buffer);

      filePath = `/uploads/mikutap/background-music/${fileName}`;
      fileSize = file.size;
    } else if (fileType === 'generated') {
      // 处理生成的音乐
      const generatedFile = formData.get('generatedFile') as File;
      const generationConfig = JSON.parse(formData.get('generationConfig') as string);
      
      if (!generatedFile) {
        return NextResponse.json(
          { success: false, error: '未提供生成的音乐文件' },
          { status: 400 }
        );
      }

      // 创建上传目录
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'mikutap', 'generated-music');
      await mkdir(uploadDir, { recursive: true });

      // 生成唯一文件名
      const fileName = `${uuidv4()}.wav`;
      const fullPath = join(uploadDir, fileName);

      // 保存生成的音乐文件
      const bytes = await generatedFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(fullPath, buffer);

      filePath = `/uploads/mikutap/generated-music/${fileName}`;
      fileSize = generatedFile.size;
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
    const [newMusic] = await db
      .insert(mikutapBackgroundMusic)
      .values({
        id: uuidv4(),
        configId,
        name,
        file: filePath,
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

    return NextResponse.json({ success: true, data: newMusic });
  } catch (error) {
    console.error('保存背景音乐失败:', error);
    return NextResponse.json(
      { success: false, error: '保存背景音乐失败' },
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