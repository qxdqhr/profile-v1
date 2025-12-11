import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { processMmdModelArchive, MMD_MODEL_ARCHIVE_MIME_TYPES } from 'sa2kit/mmd/server';
import { MMDModelsDbService, MMDAnimationsDbService, MMDAudiosDbService } from '@/modules/mmd/db/mmdDbService';

// 支持的MMD文件类型
const SUPPORTED_MODEL_TYPES = [...MMD_MODEL_ARCHIVE_MIME_TYPES];

const SUPPORTED_ANIMATION_TYPES = [
  'application/octet-stream', // VMD文件
  'animation/vmd',
];

const SUPPORTED_AUDIO_TYPES = [
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'model' | 'animation' | 'audio'
    const name = formData.get('name') as string || file.name;
    const description = formData.get('description') as string || '';
    
    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    // 确定文件子路径
    let subPath = '';
    
    switch (fileType) {
      case 'model':
        subPath = 'models';
        break;
      case 'animation':
        subPath = 'animations';
        break;
      case 'audio':
        subPath = 'audios';
        break;
      default:
        return NextResponse.json(
          { error: '不支持的文件类型' },
          { status: 400 }
        );
    }

    // 记录调试信息
    console.log('文件上传调试信息:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      requestedType: fileType
    });

    // 检查文件大小（50MB限制）
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超过50MB限制' },
        { status: 400 }
      );
    }

    // 验证文件扩展名
    const ext = path.extname(file.name).toLowerCase();
    const allowedExtensions = {
      model: ['.zip'],
      animation: ['.vmd'],
      audio: ['.wav', '.mp3', '.ogg']
    };

    console.log('文件扩展名验证:', {
      detectedExt: ext,
      allowedExtensions: allowedExtensions[fileType as keyof typeof allowedExtensions],
      isValid: allowedExtensions[fileType as keyof typeof allowedExtensions]?.includes(ext)
    });

    if (!allowedExtensions[fileType as keyof typeof allowedExtensions]?.includes(ext)) {
      return NextResponse.json(
        { error: `不支持的文件扩展名: ${ext}。支持的格式: ${allowedExtensions[fileType as keyof typeof allowedExtensions]?.join(', ')}` },
        { status: 400 }
      );
    }

    const uniqueId = nanoid();
    const uploadDir = path.join(process.cwd(), 'uploads', 'mmd', subPath);
    await mkdir(uploadDir, { recursive: true });
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    let fileUrl = '';
    let responseFormat = ext.slice(1).toUpperCase();
    
    // 保存到数据库
    let savedRecord;

    switch (fileType) {
      case 'model':
        try {
          const archiveResult = await processMmdModelArchive(fileBuffer, {
            storageRoot: uploadDir,
            publicRoot: '/uploads/mmd/models',
            folderName: uniqueId,
          });
          fileUrl = archiveResult.modelUrl;
          responseFormat = archiveResult.format.toUpperCase();
          const modelService = new MMDModelsDbService();
          savedRecord = await modelService.createModel({
            name,
            description,
            filePath: fileUrl,
            fileSize: file.size,
            format: archiveResult.format,
            isPublic: true,
          });
        } catch (extractError) {
          console.error('模型压缩包处理失败:', extractError);
          return NextResponse.json(
            { error: extractError instanceof Error ? extractError.message : '模型压缩包处理失败' },
            { status: 400 }
          );
        }
        break;
        
      case 'animation':
        {
          const fileName = `${uniqueId}${ext}`;
          const filePath = path.join(uploadDir, fileName);
          await writeFile(filePath, fileBuffer);
          fileUrl = `/uploads/mmd/${subPath}/${fileName}`;
        }
        const animationService = new MMDAnimationsDbService();
        savedRecord = await animationService.createAnimation({
          name,
          description,
          filePath: fileUrl,
          fileSize: file.size,
          duration: 0, // 需要实际解析VMD文件获取
          frameCount: 0, // 需要实际解析VMD文件获取
          isPublic: true, // 默认公开
        });
        break;
        
      case 'audio':
        {
          const fileName = `${uniqueId}${ext}`;
          const filePath = path.join(uploadDir, fileName);
          await writeFile(filePath, fileBuffer);
          fileUrl = `/uploads/mmd/${subPath}/${fileName}`;
        }
        const audioService = new MMDAudiosDbService();
        savedRecord = await audioService.createAudio({
          name,
          filePath: fileUrl,
          fileSize: file.size,
          format: ext.slice(1).toLowerCase() as 'wav' | 'mp3' | 'ogg',
          duration: 0, // 需要实际解析音频文件获取
        });
        break;
    }

    return NextResponse.json({
      success: true,
      id: savedRecord.id,
      name: savedRecord.name,
      url: fileUrl,
      filePath: fileUrl,
      fileSize: file.size,
      type: fileType,
      format: responseFormat,
      uploadTime: new Date().toISOString(),
    });

  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json(
      { error: '文件上传失败，请重试' },
      { status: 500 }
    );
  }
}
