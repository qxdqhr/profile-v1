/**
 * 检查 OSS 文件数据库记录
 * 
 * 用法：
 * pnpm tsx scripts/check-oss-files.ts
 */

import { db } from '../src/db';
import { fileMetadata, fileStorageProviders } from '../src/services/universalFile/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

async function checkOSSFiles() {
  console.log('🔍 开始检查 OSS 文件数据库记录...\n');

  try {
    // 1. 检查存储提供者
    console.log('📦 存储提供者：');
    const providers = await db
      .select()
      .from(fileStorageProviders)
      .orderBy(desc(fileStorageProviders.priority));

    if (providers.length === 0) {
      console.log('  ⚠️  没有找到存储提供者配置');
      console.log('  💡 提示：第一次上传文件时会自动创建');
    } else {
      for (const provider of providers) {
        console.log(`  ${provider.isActive ? '✅' : '❌'} ${provider.name}`);
        console.log(`     类型: ${provider.type}`);
        console.log(`     优先级: ${provider.priority}`);
        console.log(`     默认: ${provider.isDefault ? '是' : '否'}`);
        console.log('');
      }
    }

    // 2. 统计所有文件
    console.log('\n📊 文件统计：');
    const totalCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(fileMetadata)
      .where(eq(fileMetadata.isDeleted, false));

    console.log(`  总文件数: ${totalCount[0]?.count || 0}`);

    // 3. 按模块统计
    console.log('\n📁 按模块统计：');
    const moduleStats = await db
      .select({
        moduleId: fileMetadata.moduleId,
        count: sql<number>`count(*)::int`,
        totalSize: sql<string>`sum(${fileMetadata.size})`,
      })
      .from(fileMetadata)
      .where(eq(fileMetadata.isDeleted, false))
      .groupBy(fileMetadata.moduleId);

    if (moduleStats.length === 0) {
      console.log('  暂无文件');
    } else {
      for (const stat of moduleStats) {
        const size = formatFileSize(parseInt(stat.totalSize || '0'));
        console.log(`  ${stat.moduleId || '(未分类)'}: ${stat.count} 个文件, ${size}`);
      }
    }

    // 4. MMD 文件详情
    console.log('\n🎭 MMD 文件详情：');
    const mmdFiles = await db
      .select()
      .from(fileMetadata)
      .where(
        and(
          eq(fileMetadata.moduleId, 'mmd'),
          eq(fileMetadata.isDeleted, false)
        )
      )
      .orderBy(desc(fileMetadata.uploadTime))
      .limit(10);

    if (mmdFiles.length === 0) {
      console.log('  暂无 MMD 文件');
      console.log('  💡 提示：访问 /testField/mmdUpload 上传 MMD 资源');
    } else {
      console.log(`  最近 ${Math.min(10, mmdFiles.length)} 个文件：\n`);
      
      // 按类型分组
      const byType: Record<string, typeof mmdFiles> = {};
      for (const file of mmdFiles) {
        const ext = file.extension || 'unknown';
        if (!byType[ext]) byType[ext] = [];
        byType[ext].push(file);
      }

      // 显示统计
      for (const [ext, files] of Object.entries(byType)) {
        const fileType = getFileTypeLabel(ext);
        console.log(`  ${fileType} (${ext}): ${files.length} 个`);
        for (const file of files.slice(0, 3)) {
          console.log(`    • ${file.originalName}`);
          console.log(`      路径: ${file.storagePath}`);
          console.log(`      大小: ${formatFileSize(file.size)}`);
          console.log(`      上传: ${formatDate(file.uploadTime)}`);
          console.log('');
        }
        if (files.length > 3) {
          console.log(`    ... 还有 ${files.length - 3} 个文件\n`);
        }
      }
    }

    // 5. 最近上传的文件
    console.log('\n⏰ 最近上传（所有模块）：');
    const recentFiles = await db
      .select()
      .from(fileMetadata)
      .where(eq(fileMetadata.isDeleted, false))
      .orderBy(desc(fileMetadata.uploadTime))
      .limit(5);

    if (recentFiles.length === 0) {
      console.log('  暂无文件');
    } else {
      for (const file of recentFiles) {
        console.log(`  • ${file.originalName}`);
        console.log(`    模块: ${file.moduleId || '(未分类)'}`);
        console.log(`    大小: ${formatFileSize(file.size)}`);
        console.log(`    上传: ${formatDate(file.uploadTime)}`);
        if (file.cdnUrl) {
          console.log(`    URL: ${file.cdnUrl.substring(0, 80)}...`);
        }
        console.log('');
      }
    }

    // 6. 存储空间统计
    console.log('\n💾 存储空间统计：');
    const totalSize = await db
      .select({
        total: sql<string>`sum(${fileMetadata.size})`,
      })
      .from(fileMetadata)
      .where(eq(fileMetadata.isDeleted, false));

    const size = parseInt(totalSize[0]?.total || '0');
    console.log(`  总大小: ${formatFileSize(size)}`);

    // 7. 访问统计
    console.log('\n📈 访问统计：');
    const accessStats = await db
      .select({
        totalAccess: sql<string>`sum(${fileMetadata.accessCount})`,
        totalDownload: sql<string>`sum(${fileMetadata.downloadCount})`,
      })
      .from(fileMetadata)
      .where(eq(fileMetadata.isDeleted, false));

    console.log(`  总访问次数: ${parseInt(accessStats[0]?.totalAccess || '0')}`);
    console.log(`  总下载次数: ${parseInt(accessStats[0]?.totalDownload || '0')}`);

    console.log('\n✅ 检查完成！\n');

  } catch (error) {
    console.error('\n❌ 检查失败:', error);
    if (error instanceof Error) {
      if (error.message.includes('does not exist')) {
        console.log('\n💡 提示：数据库表可能还未创建，请运行：');
        console.log('   pnpm devdb:push  # 开发环境');
        console.log('   或');
        console.log('   pnpm prodb:push  # 生产环境');
      }
    }
    process.exit(1);
  }

  process.exit(0);
}

// 辅助函数
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDate(date: Date | null): string {
  if (!date) return '未知';
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFileTypeLabel(ext: string): string {
  const types: Record<string, string> = {
    pmx: '🎭 模型',
    pmd: '🎭 模型',
    vmd: '🎬 动作',
    wav: '🎵 音频',
    mp3: '🎵 音频',
    ogg: '🎵 音频',
    m4a: '🎵 音频',
    png: '🖼️  贴图',
    jpg: '🖼️  贴图',
    jpeg: '🖼️  贴图',
    bmp: '🖼️  贴图',
    tga: '🖼️  贴图',
    spa: '🖼️  贴图',
    sph: '🖼️  贴图',
  };
  return types[ext.toLowerCase()] || '📄 其他';
}

// 运行检查
checkOSSFiles();

