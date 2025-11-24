import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fileMetadata } from '@/services/universalFile/db/schema';
import { eq, and, desc, sql, like } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface MMDFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadTime: Date;
  type: string;
  extension: string;
  storagePath: string;
}

interface MMDFolder {
  name: string;
  path: string;
  files: MMDFile[];
  modelFiles: MMDFile[];
  motionFiles: MMDFile[];
  audioFiles: MMDFile[];
  textureFiles: MMDFile[];
  totalSize: number;
  fileCount: number;
  uploadTime: Date;
}

interface MMDListResult {
  success: boolean;
  folders: MMDFolder[];
  totalFiles: number;
  totalSize: number;
  summary: {
    totalFolders: number;
    totalFiles: number;
    totalSize: number;
    totalSizeFormatted: string;
  };
}

/**
 * 获取文件类型
 */
function getFileType(extension: string): string {
  const ext = extension?.toLowerCase() || '';
  
  if (['pmx', 'pmd'].includes(ext)) return 'model';
  if (ext === 'vmd') return 'motion';
  if (['wav', 'mp3', 'ogg', 'm4a'].includes(ext)) return 'audio';
  if (['png', 'jpg', 'jpeg', 'bmp', 'tga', 'spa', 'sph'].includes(ext)) return 'texture';
  
  return 'other';
}

/**
 * 从存储路径提取文件夹信息
 * 例如: mmd/2025/11/23/modelName/file.pmx -> modelName
 */
function extractFolderInfo(storagePath: string): { folderPath: string; modelName: string } | null {
  const parts = storagePath.split('/');
  
  // mmd/year/month/day/modelName/file.ext 至少需要 6 部分
  if (parts.length < 5 || parts[0] !== 'mmd') {
    return null;
  }

  const modelName = parts[4];
  const folderPath = parts.slice(0, 5).join('/');

  return { folderPath, modelName };
}

/**
 * 从数据库查询 MMD 文件
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📂 开始从数据库查询 MMD 文件...');

    // 查询所有 mmd 模块的文件
    const mmdFiles = await db
      .select({
        id: fileMetadata.id,
        originalName: fileMetadata.originalName,
        storagePath: fileMetadata.storagePath,
        cdnUrl: fileMetadata.cdnUrl,
        size: fileMetadata.size,
        extension: fileMetadata.extension,
        uploadTime: fileMetadata.uploadTime,
        mimeType: fileMetadata.mimeType,
      })
      .from(fileMetadata)
      .where(
        and(
          eq(fileMetadata.moduleId, 'mmd'),
          eq(fileMetadata.isDeleted, false)
        )
      )
      .orderBy(desc(fileMetadata.uploadTime));

    console.log('📊 查询到', mmdFiles.length, '个 MMD 文件');

    if (mmdFiles.length === 0) {
      return NextResponse.json({
        success: true,
        folders: [],
        totalFiles: 0,
        totalSize: 0,
        summary: {
          totalFolders: 0,
          totalFiles: 0,
          totalSize: 0,
          totalSizeFormatted: '0 B',
        },
      });
    }

    // 按文件夹分组
    const folderMap = new Map<string, MMDFolder>();

    for (const file of mmdFiles) {
      const folderInfo = extractFolderInfo(file.storagePath);
      
      if (!folderInfo) {
        console.warn('⚠️ 无法解析路径:', file.storagePath);
        continue;
      }

      const { folderPath, modelName } = folderInfo;

      // 初始化文件夹
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
          uploadTime: file.uploadTime,
        });
      }

      const folder = folderMap.get(folderPath)!;
      const fileType = getFileType(file.extension || '');
      
      // 构建文件 URL（优先使用 CDN URL）
      const fileUrl = file.cdnUrl || file.storagePath;
      
      const mmdFile: MMDFile = {
        id: file.id,
        name: file.originalName,
        url: fileUrl,
        size: file.size,
        uploadTime: file.uploadTime,
        type: fileType,
        extension: file.extension || '',
        storagePath: file.storagePath,
      };

      // 添加到文件夹
      folder.files.push(mmdFile);
      folder.totalSize += file.size;
      folder.fileCount++;

      // 更新文件夹的最新上传时间
      if (file.uploadTime > folder.uploadTime) {
        folder.uploadTime = file.uploadTime;
      }

      // 分类文件
      switch (fileType) {
        case 'model':
          folder.modelFiles.push(mmdFile);
          break;
        case 'motion':
          folder.motionFiles.push(mmdFile);
          break;
        case 'audio':
          folder.audioFiles.push(mmdFile);
          break;
        case 'texture':
          folder.textureFiles.push(mmdFile);
          break;
      }
    }

    // 转换为数组并按最新上传时间排序
    const folders = Array.from(folderMap.values()).sort((a, b) => {
      return b.uploadTime.getTime() - a.uploadTime.getTime();
    });

    const totalFiles = folders.reduce((sum, f) => sum + f.fileCount, 0);
    const totalSize = folders.reduce((sum, f) => sum + f.totalSize, 0);

    console.log('✅ 查询完成:', {
      文件夹数量: folders.length,
      总文件数: totalFiles,
      总大小: formatFileSize(totalSize),
    });

    const result: MMDListResult = {
      success: true,
      folders,
      totalFiles,
      totalSize,
      summary: {
        totalFolders: folders.length,
        totalFiles,
        totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
      },
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ 查询 MMD 文件失败:', error);
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
