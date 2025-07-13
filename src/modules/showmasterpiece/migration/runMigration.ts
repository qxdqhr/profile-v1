#!/usr/bin/env node

/**
 * ShowMasterpiece模块 - 作品图片迁移运行脚本
 * 
 * 将Base64图片数据迁移到通用文件服务系统的命令行工具
 * 
 * 使用方法:
 *   npx tsx src/modules/showmasterpiece/migration/runMigration.ts [options]
 * 
 * 示例:
 *   # 试运行
 *   npx tsx src/modules/showmasterpiece/migration/runMigration.ts --dry-run
 * 
 *   # 迁移指定画集
 *   npx tsx src/modules/showmasterpiece/migration/runMigration.ts --collection-id 1,2,3
 * 
 *   # 小批量测试
 *   npx tsx src/modules/showmasterpiece/migration/runMigration.ts --batch-size 5 --dry-run
 * 
 *   # 完整迁移
 *   npx tsx src/modules/showmasterpiece/migration/runMigration.ts --validate --backup
 */

import { ArtworkMigrator, MigrationConfig } from './ArtworkMigrator';

/**
 * 解析命令行参数
 */
function parseArguments(): MigrationConfig {
  const args = process.argv.slice(2);
  const config: MigrationConfig = {
    batchSize: 50,
    dryRun: false,
    validateFiles: true,
    backupOldData: true,
    forceOverwrite: false,
    enableOSSUpload: false,
    collectionIds: undefined
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
        
      case '--dry-run':
        config.dryRun = true;
        break;
        
      case '--batch-size':
        const batchSize = parseInt(args[++i]);
        if (isNaN(batchSize) || batchSize <= 0) {
          console.error('❌ 批大小必须是大于0的数字');
          process.exit(1);
        }
        config.batchSize = batchSize;
        break;
        
      case '--collection-id':
      case '--collection-ids':
        const collectionIdsStr = args[++i];
        if (!collectionIdsStr) {
          console.error('❌ 请指定画集ID');
          process.exit(1);
        }
        config.collectionIds = collectionIdsStr.split(',').map(id => {
          const num = parseInt(id.trim());
          if (isNaN(num)) {
            console.error(`❌ 无效的画集ID: ${id}`);
            process.exit(1);
          }
          return num;
        });
        break;
        
      case '--no-validate':
        config.validateFiles = false;
        break;
        
      case '--validate':
        config.validateFiles = true;
        break;
        
      case '--no-backup':
        config.backupOldData = false;
        break;
        
      case '--backup':
        config.backupOldData = true;
        break;
        
      case '--force':
        config.forceOverwrite = true;
        break;
        
      case '--enable-oss':
        config.enableOSSUpload = true;
        break;
        
      default:
        console.error(`❌ 未知选项: ${arg}`);
        console.log('使用 --help 查看帮助信息');
        process.exit(1);
    }
  }

  return config;
}

/**
 * 打印帮助信息
 */
function printHelp(): void {
  console.log(`
ShowMasterpiece模块图片迁移工具

用法:
  npx tsx src/modules/showmasterpiece/migration/runMigration.ts [选项]

选项:
  -h, --help              显示帮助信息
  --dry-run               试运行，不实际执行迁移
  --batch-size <number>   批处理大小（默认: 50）
  --collection-id <ids>   指定画集ID，用逗号分隔（如: 1,2,3）
  --validate              验证文件完整性（默认开启）
  --no-validate           跳过文件验证
  --backup                备份原始数据（默认开启）
  --no-backup             跳过数据备份
  --force                 强制覆盖已存在的文件
  --enable-oss            启用OSS上传

示例:
  # 试运行，查看将要迁移的数据
  npx tsx src/modules/showmasterpiece/migration/runMigration.ts --dry-run

  # 迁移指定画集的作品
  npx tsx src/modules/showmasterpiece/migration/runMigration.ts --collection-id 1,2,3

  # 小批量测试迁移
  npx tsx src/modules/showmasterpiece/migration/runMigration.ts --batch-size 5 --dry-run

  # 完整迁移（包含验证和备份）
  npx tsx src/modules/showmasterpiece/migration/runMigration.ts --validate --backup

  # 强制覆盖已迁移的文件
  npx tsx src/modules/showmasterpiece/migration/runMigration.ts --force

  # 不验证文件，快速迁移
  npx tsx src/modules/showmasterpiece/migration/runMigration.ts --no-validate --no-backup

注意事项:
  - 首次运行建议使用 --dry-run 进行测试
  - 迁移前会自动备份原始数据（除非使用 --no-backup）
  - 使用 --force 选项会覆盖已迁移的文件
  - 迁移过程中请保持数据库连接稳定
`);
}

/**
 * 验证迁移前置条件
 */
function validatePrerequisites(config: MigrationConfig): void {
  console.log('🔍 验证迁移前置条件...');
  
  // 检查环境变量
  if (!process.env.DATABASE_URL) {
    console.error('❌ 数据库连接URL未设置');
    console.log('请设置 DATABASE_URL 环境变量');
    process.exit(1);
  }
  
  // 检查Node.js版本
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 16) {
    console.error(`❌ Node.js版本过低: ${nodeVersion}`);
    console.log('请使用 Node.js 16 或更高版本');
    process.exit(1);
  }
  
  console.log('✅ 前置条件验证通过');
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('🚀 开始ShowMasterpiece模块图片迁移...');
  
  try {
    // 1. 解析命令行参数
    const config = parseArguments();
    
    // 2. 显示迁移配置
    console.log('⚙️ 迁移配置:', {
      '试运行': config.dryRun,
      '批大小': config.batchSize,
      '验证文件': config.validateFiles,
      '备份数据': config.backupOldData,
      '强制覆盖': config.forceOverwrite,
      '启用OSS': config.enableOSSUpload,
      '画集过滤': config.collectionIds ? config.collectionIds.join(', ') : '全部'
    });
    
    if (config.dryRun) {
      console.log('🔍 当前为试运行模式，不会实际修改数据');
    }
    
    // 3. 验证前置条件
    validatePrerequisites(config);
    
    // 4. 创建迁移器并执行迁移
    const migrator = new ArtworkMigrator(config);
    const stats = await migrator.migrate();
    
    // 5. 显示最终结果
    console.log('\n🎉 迁移完成！');
    console.log('📊 最终统计:');
    console.log(`  - 总作品数: ${stats.totalArtworks}`);
    console.log(`  - 成功数量: ${stats.successCount}`);
    console.log(`  - 失败数量: ${stats.failedCount}`);
    console.log(`  - 跳过数量: ${stats.skippedCount}`);
    console.log(`  - 处理文件大小: ${(stats.processedFileSize / 1024 / 1024).toFixed(2)} MB`);
    
    const successRate = stats.totalArtworks > 0 
      ? ((stats.successCount / stats.totalArtworks) * 100).toFixed(2)
      : '0';
    console.log(`  - 成功率: ${successRate}%`);
    
    // 6. 根据结果设置退出码
    if (stats.failedCount > 0) {
      console.log('\n⚠️ 部分迁移失败，请检查错误日志');
      process.exit(1);
    } else if (stats.successCount === 0) {
      console.log('\n⚠️ 没有作品被迁移');
      process.exit(0);
    } else {
      console.log('\n✅ 所有作品迁移成功！');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n💥 迁移失败:', error);
    
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
    }
    
    console.log('\n🔧 故障排除建议:');
    console.log('1. 检查数据库连接是否正常');
    console.log('2. 确认有足够的磁盘空间');
    console.log('3. 验证文件权限设置');
    console.log('4. 查看详细错误信息并联系技术支持');
    
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 未捕获的异常:', error);
  process.exit(1);
});

// 处理终止信号
process.on('SIGINT', () => {
  console.log('\n⚠️ 迁移被用户中断');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️ 迁移被系统终止');
  process.exit(1);
});

// 运行主函数
main(); 