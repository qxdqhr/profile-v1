import { NextRequest, NextResponse } from 'next/server';
import { createUniversalFileServiceWithConfigManager } from '@/services/universalFile';
import OSS from 'ali-oss';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface OSSFile {
  name: string;
  url: string;
  size: number;
  lastModified: Date;
  type: string;
}

interface MMDFolder {
  name: string;
  path: string;
  files: OSSFile[];
  modelFiles: OSSFile[];
  motionFiles: OSSFile[];
  audioFiles: OSSFile[];
  textureFiles: OSSFile[];
  totalSize: number;
  fileCount: number;
}

/**
 * 获取文件类型
 */
function getFileType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  
  if (['pmx', 'pmd'].includes(ext)) return 'model';
  if (ext === 'vmd') return 'motion';
  if (['wav', 'mp3', 'ogg', 'm4a'].includes(ext)) return 'audio';
  if (['png', 'jpg', 'jpeg', 'bmp', 'tga', 'spa', 'sph'].includes(ext)) return 'texture';
  
  return 'other';
}

/**
 * 列出 OSS 中的 MMD 文件
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || 'mmd/';
    const maxKeys = parseInt(searchParams.get('maxKeys') || '1000');

    console.log('📂 开始查询 OSS 文件:', { prefix, maxKeys });

    // 初始化文件服务
    const fileService = await createUniversalFileServiceWithConfigManager();
    
    // 获取 OSS 配置
    const ossConfig = fileService['config'].storageProviders['aliyun-oss'];
    
    if (!ossConfig) {
      return NextResponse.json(
        { error: 'OSS 配置不存在' },
        { status: 500 }
      );
    }

    // 创建 OSS 客户端
    // 确保 region 格式正确（应该是 oss-cn-beijing 而不是 cn-beijing）
    let region = ossConfig.region;
    if (region && !region.startsWith('oss-')) {
      region = `oss-${region}`;
      console.log('🔧 修正 region 格式:', ossConfig.region, '→', region);
    }

    const client = new OSS({
      region: region,
      accessKeyId: ossConfig.accessKeyId,
      accessKeySecret: ossConfig.accessKeySecret,
      bucket: ossConfig.bucket,
      secure: true, // 使用 HTTPS
      timeout: 60000, // 60秒超时
    });

    // 获取 OSS 基础 URL
    const ossBaseUrl = ossConfig.customDomain
      ? `https://${ossConfig.customDomain}`
      : `https://${ossConfig.bucket}.${region}.aliyuncs.com`;

    console.log('🔗 OSS 基础 URL:', ossBaseUrl);
    console.log('🔧 OSS 配置:', {
      originalRegion: ossConfig.region,
      correctedRegion: region,
      bucket: ossConfig.bucket,
      endpoint: `${ossConfig.bucket}.${region}.aliyuncs.com`,
    });

    // 列出所有文件
    let result;
    try {
      result = await client.list({
        prefix,
        'max-keys': maxKeys,
      });
      console.log('📊 查询结果:', {
        文件数量: result.objects?.length || 0,
        前缀: prefix,
      });
    } catch (listError) {
      console.error('❌ OSS list 调用失败:', listError);
      throw new Error(`OSS 查询失败: ${listError instanceof Error ? listError.message : '未知错误'}`);
    }

    if (!result.objects || result.objects.length === 0) {
      return NextResponse.json({
        success: true,
        folders: [],
        totalFiles: 0,
        totalSize: 0,
        ossBaseUrl,
      });
    }

    // 按文件夹分组
    const folderMap = new Map<string, MMDFolder>();

    for (const obj of result.objects) {
      // 跳过目录本身
      if (obj.name.endsWith('/')) continue;

      const relativePath = obj.name.substring(prefix.length);
      const pathParts = relativePath.split('/');
      
      // 至少需要 year/month/day/modelName/file 这样的结构
      if (pathParts.length < 4) continue;

      // 提取模型文件夹路径 (mmd/year/month/day/modelName)
      const folderPath = `${prefix}${pathParts.slice(0, 4).join('/')}`;
      const modelName = pathParts[3];

      if (!folderMap.has(folderPath)) {
        folderMap.set(folderPath, {
          name: modelName,
          path: folderPath,
          files: [],
          modelFiles: [],
          motionFiles: [],
          audioFiles: [],
          textureFiles: [],
          totalSize: 0,
          fileCount: 0,
        });
      }

      const folder = folderMap.get(folderPath)!;
      const fileType = getFileType(obj.name);
      
      const file: OSSFile = {
        name: obj.name.split('/').pop() || obj.name,
        url: `${ossBaseUrl}/${obj.name}`,
        size: obj.size,
        lastModified: new Date(obj.lastModified),
        type: fileType,
      };

      folder.files.push(file);
      folder.totalSize += obj.size;
      folder.fileCount++;

      // 分类文件
      switch (fileType) {
        case 'model':
          folder.modelFiles.push(file);
          break;
        case 'motion':
          folder.motionFiles.push(file);
          break;
        case 'audio':
          folder.audioFiles.push(file);
          break;
        case 'texture':
          folder.textureFiles.push(file);
          break;
      }
    }

    // 转换为数组并排序（最新的在前）
    const folders = Array.from(folderMap.values()).sort((a, b) => {
      const aTime = Math.max(...a.files.map(f => f.lastModified.getTime()));
      const bTime = Math.max(...b.files.map(f => f.lastModified.getTime()));
      return bTime - aTime;
    });

    const totalFiles = folders.reduce((sum, f) => sum + f.fileCount, 0);
    const totalSize = folders.reduce((sum, f) => sum + f.totalSize, 0);

    console.log('✅ 查询完成:', {
      文件夹数量: folders.length,
      总文件数: totalFiles,
      总大小: formatFileSize(totalSize),
    });

    return NextResponse.json({
      success: true,
      folders,
      totalFiles,
      totalSize,
      ossBaseUrl,
      summary: {
        totalFolders: folders.length,
        totalFiles,
        totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
      },
    });

  } catch (error) {
    console.error('❌ 查询 OSS 文件失败:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '查询失败',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

