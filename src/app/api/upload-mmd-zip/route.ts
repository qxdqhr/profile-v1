import { NextRequest, NextResponse } from 'next/server';
import { createUniversalFileServiceWithConfigManager } from '@/services/universalFile';
import AdmZip from 'adm-zip';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5分钟超时

/**
 * 规范化文件名：移除特殊字符，转换为小写
 */
function normalizeFileName(fileName: string): string {
  return fileName
    .replace(/[\s\u4e00-\u9fa5]+/g, '-') // 中文和空格转为连字符
    .replace(/[^\w\-\.]/g, '') // 移除特殊字符
    .toLowerCase();
}

/**
 * 检测 MMD 模型文件
 */
function isMMDModelFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ext === '.pmx' || ext === '.pmd';
}

/**
 * 检测贴图文件
 */
function isTextureFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.bmp', '.tga', '.spa', '.sph'].includes(ext);
}

/**
 * 检测动作文件
 */
function isMotionFile(fileName: string): boolean {
  return path.extname(fileName).toLowerCase() === '.vmd';
}

/**
 * 检测音频文件
 */
function isAudioFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ['.wav', '.mp3', '.ogg', '.m4a'].includes(ext);
}

/**
 * 分析压缩包结构，找到模型文件和相关资源
 */
function analyzeZipStructure(zip: AdmZip) {
  const entries = zip.getEntries();
  const structure = {
    modelFiles: [] as { entry: AdmZip.IZipEntry; relativePath: string }[],
    textureFiles: [] as { entry: AdmZip.IZipEntry; relativePath: string }[],
    motionFiles: [] as { entry: AdmZip.IZipEntry; relativePath: string }[],
    audioFiles: [] as { entry: AdmZip.IZipEntry; relativePath: string }[],
    otherFiles: [] as { entry: AdmZip.IZipEntry; relativePath: string }[],
    baseDir: '',
  };

  // 找到根目录（跳过 __MACOSX 等系统文件夹）
  const validEntries = entries.filter(
    entry => !entry.isDirectory && 
    !entry.entryName.includes('__MACOSX') &&
    !entry.entryName.startsWith('.')
  );

  if (validEntries.length === 0) {
    throw new Error('压缩包中没有有效文件');
  }

  // 找到最短的公共路径作为基础目录
  const firstPath = validEntries[0].entryName;
  const pathParts = firstPath.split('/');
  structure.baseDir = pathParts.length > 1 ? pathParts[0] : '';

  // 分类文件
  for (const entry of validEntries) {
    if (entry.isDirectory) continue;

    const fileName = entry.entryName;
    const relativePath = structure.baseDir 
      ? fileName.substring(structure.baseDir.length + 1)
      : fileName;

    if (isMMDModelFile(fileName)) {
      structure.modelFiles.push({ entry, relativePath });
    } else if (isTextureFile(fileName)) {
      structure.textureFiles.push({ entry, relativePath });
    } else if (isMotionFile(fileName)) {
      structure.motionFiles.push({ entry, relativePath });
    } else if (isAudioFile(fileName)) {
      structure.audioFiles.push({ entry, relativePath });
    } else {
      structure.otherFiles.push({ entry, relativePath });
    }
  }

  return structure;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const modelName = formData.get('modelName') as string || '';

    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }

    // 检查文件类型
    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: '只支持 .zip 格式的压缩包' },
        { status: 400 }
      );
    }

    console.log('📦 开始处理 MMD 压缩包:', file.name, file.size, 'bytes');

    // 读取压缩包
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const zip = new AdmZip(buffer);

    // 分析压缩包结构
    console.log('🔍 分析压缩包结构...');
    const structure = analyzeZipStructure(zip);

    console.log('📊 压缩包分析结果:', {
      模型文件: structure.modelFiles.length,
      贴图文件: structure.textureFiles.length,
      动作文件: structure.motionFiles.length,
      音频文件: structure.audioFiles.length,
      其他文件: structure.otherFiles.length,
    });

    if (structure.modelFiles.length === 0) {
      return NextResponse.json(
        { error: '压缩包中没有找到 MMD 模型文件 (.pmx 或 .pmd)' },
        { status: 400 }
      );
    }

    // 初始化文件服务
    console.log('🔧 [upload-mmd-zip] 开始创建文件服务...');
    const fileService = await createUniversalFileServiceWithConfigManager();
    console.log('✅ [upload-mmd-zip] 文件服务创建完成');
    
    // 检查 OSS Provider 状态
    const ossProvider = fileService['storageProviders'].get('aliyun-oss');
    console.log('🔍 [upload-mmd-zip] OSS Provider 状态:', {
      exists: !!ossProvider,
      initialized: ossProvider ? ossProvider['isInitialized'] : 'N/A'
    });

    // 生成规范化的模型名称
    const mainModelFile = structure.modelFiles[0];
    const originalModelName = path.basename(mainModelFile.relativePath, path.extname(mainModelFile.relativePath));
    const normalizedModelName = modelName 
      ? normalizeFileName(modelName)
      : normalizeFileName(originalModelName);

    console.log('📝 模型名称:', {
      原始: originalModelName,
      规范化: normalizedModelName,
    });

    // 生成基础路径
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const basePath = `mmd/${year}/${month}/${day}/${normalizedModelName}`;

    console.log('📂 目标路径:', basePath);

    // 上传所有文件
    const uploadedFiles: any[] = [];
    const allFiles = [
      ...structure.modelFiles,
      ...structure.textureFiles,
      ...structure.motionFiles,
      ...structure.audioFiles,
      ...structure.otherFiles,
    ];

    let uploadedCount = 0;
    const totalFiles = allFiles.length;

    for (const { entry, relativePath } of allFiles) {
      try {
        const fileBuffer = entry.getData();
        const fileName = path.basename(relativePath);
        const fileDir = path.dirname(relativePath);
        
        // 构建完整的存储路径，保持原始目录结构
        const storagePath = fileDir && fileDir !== '.'
          ? `${basePath}/${fileDir}/${fileName}`
          : `${basePath}/${fileName}`;

        console.log(`📤 上传 [${uploadedCount + 1}/${totalFiles}]:`, {
          原始路径: relativePath,
          存储路径: storagePath,
          文件夹: fileDir || '(根目录)',
          文件名: fileName
        });

        // 创建 File 对象
        const uploadFile = {
          name: fileName,
          type: getMimeType(fileName),
          size: fileBuffer.length,
          arrayBuffer: async () => fileBuffer.buffer,
          text: async () => fileBuffer.toString(),
          slice: () => new Blob([fileBuffer]),
          stream: () => new ReadableStream(),
          lastModified: Date.now(),
          webkitRelativePath: '',
        } as File;

        // 上传文件（使用自定义路径以保持目录结构）
        const result = await fileService.uploadFile(
          {
            file: uploadFile,
            moduleId: 'mmd',
            businessId: 'resources',
            permission: 'public',
            needsProcessing: false,
            customPath: storagePath,  // 使用我们构建的完整路径
          },
          undefined,
          (progress) => {
            if (progress.progress % 20 === 0) {
              console.log(`  进度: ${progress.progress}%`);
            }
          }
        );

        uploadedFiles.push({
          originalPath: relativePath,
          storagePath: result.storagePath,
          cdnUrl: result.cdnUrl,
          type: getFileType(fileName),
          size: fileBuffer.length,
        });

        uploadedCount++;
      } catch (error) {
        console.error(`❌ 上传失败 [${relativePath}]:`, error);
        // 继续上传其他文件
      }
    }

    console.log(`✅ 上传完成: ${uploadedCount}/${totalFiles} 个文件`);

    // 构建返回的资源路径
    const modelFile = uploadedFiles.find(f => f.type === 'model');
    const motionFiles = uploadedFiles.filter(f => f.type === 'motion');
    const audioFiles = uploadedFiles.filter(f => f.type === 'audio');

    // 获取 OSS 基础 URL
    const ossConfig = fileService['config'].storageProviders['aliyun-oss'];
    const ossBaseUrl = ossConfig?.customDomain
      ? `https://${ossConfig.customDomain}`
      : `https://${ossConfig?.bucket}.${ossConfig?.region}.aliyuncs.com`;

    const result = {
      success: true,
      modelName: normalizedModelName,
      basePath,
      ossBaseUrl,
      files: uploadedFiles,
      summary: {
        total: totalFiles,
        uploaded: uploadedCount,
        failed: totalFiles - uploadedCount,
      },
      resources: {
        modelPath: modelFile ? `${ossBaseUrl}/${modelFile.storagePath}` : null,
        motionPaths: motionFiles.map(f => `${ossBaseUrl}/${f.storagePath}`),
        audioPaths: audioFiles.map(f => `${ossBaseUrl}/${f.storagePath}`),
      },
      usage: {
        modelPath: modelFile ? `modelPath: '${ossBaseUrl}/${modelFile.storagePath}'` : '',
        example: `
// 在代码中使用：
const resources = {
  modelPath: '${modelFile ? `${ossBaseUrl}/${modelFile.storagePath}` : ''}',
  ${motionFiles.length > 0 ? `motionPath: '${ossBaseUrl}/${motionFiles[0].storagePath}',` : ''}
  ${audioFiles.length > 0 ? `audioPath: '${ossBaseUrl}/${audioFiles[0].storagePath}',` : ''}
};
        `.trim(),
      },
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ 处理 MMD 压缩包失败:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '处理失败',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * 根据文件扩展名获取 MIME 类型
 */
function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.pmx': 'application/octet-stream',
    '.pmd': 'application/octet-stream',
    '.vmd': 'application/octet-stream',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.bmp': 'image/bmp',
    '.tga': 'image/tga',
    '.spa': 'application/octet-stream',
    '.sph': 'application/octet-stream',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * 获取文件类型分类
 */
function getFileType(fileName: string): string {
  if (isMMDModelFile(fileName)) return 'model';
  if (isTextureFile(fileName)) return 'texture';
  if (isMotionFile(fileName)) return 'motion';
  if (isAudioFile(fileName)) return 'audio';
  return 'other';
}

