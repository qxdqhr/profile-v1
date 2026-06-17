#!/usr/bin/env tsx

/**
 * FileTransfer模块数据迁移执行脚本
 * 
 * 使用方法：
 * npx tsx src/modules/filetransfer/migration/runMigration.ts [options]
 * 
 * 选项：
 * --dry-run: 试运行（不实际执行）
 * --batch-size: 批处理大小（默认50）
 * --validate: 验证文件完整性（默认true）
 * --backup: 备份原数据（默认true）
 * --force: 强制覆盖已存在的记录
 * --enable-oss: 启用OSS上传
 */

import { createFileTransferMigrator } from './FileTransferMigrator';
import { parseArgs } from 'util';

interface CliOptions {
  dryRun?: boolean;
  batchSize?: number;
  validateFiles?: boolean;
  backupOldData?: boolean;
  forceOverwrite?: boolean;
  enableOSSUpload?: boolean;
  help?: boolean;
}

function parseCliArgs(): CliOptions {
  try {
    const { values } = parseArgs({
      args: process.argv.slice(2),
      options: {
        'dry-run': {
          type: 'boolean',
          default: false,
        },
        'batch-size': {
          type: 'string',
          default: '50',
        },
        'validate': {
          type: 'boolean',
          default: true,
        },
        'backup': {
          type: 'boolean',
          default: true,
        },
        'force': {
          type: 'boolean',
          default: false,
        },
        'enable-oss': {
          type: 'boolean',
          default: false,
        },
        'help': {
          type: 'boolean',
          default: false,
        },
      },
      allowPositionals: false,
    });

    return {
      dryRun: values['dry-run'],
      batchSize: parseInt(values['batch-size'] || '50'),
      validateFiles: values['validate'],
      backupOldData: values['backup'],
      forceOverwrite: values['force'],
      enableOSSUpload: values['enable-oss'],
      help: values['help'],
    };
  } catch (error) {
    console.error('❌ 参数解析失败:', error);
    showHelp();
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
📋 FileTransfer模块数据迁移工具

用法:
  npx tsx src/modules/filetransfer/migration/runMigration.ts [选项]

选项:
  --dry-run         试运行模式，不实际执行数据变更
  --batch-size <n>  批处理大小，默认50
  --validate        验证文件完整性，默认true
  --backup          备份原数据，默认true
  --force           强制覆盖已存在的记录
  --enable-oss      启用OSS上传（需要配置）
  --help            显示此帮助信息

示例:
  # 试运行迁移，查看会发生什么变化
  npx tsx src/modules/filetransfer/migration/runMigration.ts --dry-run

  # 执行完整迁移
  npx tsx src/modules/filetransfer/migration/runMigration.ts

  # 小批量迁移（测试用）
  npx tsx src/modules/filetransfer/migration/runMigration.ts --batch-size 10

  # 强制覆盖已存在的记录
  npx tsx src/modules/filetransfer/migration/runMigration.ts --force
`);
}

async function main() {
  const options = parseCliArgs();

  if (options.help) {
    showHelp();
    return;
  }

  console.log('🚀 开始FileTransfer模块数据迁移...');
  console.log('⚙️ 迁移配置:', {
    试运行: options.dryRun,
    批大小: options.batchSize,
    验证文件: options.validateFiles,
    备份数据: options.backupOldData,
    强制覆盖: options.forceOverwrite,
    启用OSS: options.enableOSSUpload
  });

  if (options.dryRun) {
    console.log('🔍 当前为试运行模式，不会实际修改数据');
  }

  // 确认提示
  if (!options.dryRun) {
    console.log('\n⚠️  警告：此操作将修改数据库数据！');
    console.log('📋 建议先运行 --dry-run 查看迁移预览');
    
    // 在生产环境中可以添加确认提示
    // const readline = require('readline');
    // const rl = readline.createInterface({
    //   input: process.stdin,
    //   output: process.stdout
    // });
    // 
    // const answer = await new Promise<string>((resolve) => {
    //   rl.question('确认继续吗？(y/N): ', resolve);
    // });
    // rl.close();
    // 
    // if (answer.toLowerCase() !== 'y') {
    //   console.log('❌ 迁移已取消');
    //   return;
    // }
  }

  try {
    // 创建迁移器
    const migrator = createFileTransferMigrator({
      batchSize: options.batchSize,
      enableOSSUpload: options.enableOSSUpload,
      validateFiles: options.validateFiles,
      backupOldData: options.backupOldData,
      dryRun: options.dryRun,
      forceOverwrite: options.forceOverwrite
    });

    // 执行迁移
    let lastProgressTime = Date.now();
    const result = await migrator.migrate((progress) => {
      const now = Date.now();
      // 每秒更新一次进度
      if (now - lastProgressTime > 1000) {
        console.log(
          `📈 迁移进度: ${progress.current}/${progress.total} ` +
          `(${progress.percentage.toFixed(1)}%) - ${progress.currentItem}`
        );
        lastProgressTime = now;
      }
    });

    // 输出结果
    console.log('\n✅ 迁移完成！');
    console.log('📊 迁移统计:');
    console.log(`  总记录数: ${result.totalRecords}`);
    console.log(`  成功迁移: ${result.successCount}`);
    console.log(`  失败记录: ${result.failureCount}`);
    console.log(`  跳过记录: ${result.skippedCount}`);
    console.log(`  总文件大小: ${formatFileSize(result.totalFileSize)}`);
    console.log(`  执行时间: ${result.executionTime}ms`);

    if (result.failures.length > 0) {
      console.log('\n❌ 失败记录详情:');
      result.failures.forEach(failure => {
        console.log(`  - ${failure.fileName} (${failure.id}): ${failure.error}`);
      });
    }

    // 如果不是试运行，执行验证
    if (!options.dryRun && result.successCount > 0) {
      console.log('\n🔍 验证迁移结果...');
      const validation = await migrator.validateMigration();
      
      if (validation.isValid) {
        console.log('✅ 迁移验证通过！');
      } else {
        console.log('❌ 迁移验证失败:');
        validation.issues.forEach(issue => {
          console.log(`  - ${issue}`);
        });
      }

      console.log('📊 验证统计:');
      console.log(`  原始记录数: ${validation.summary.originalCount}`);
      console.log(`  迁移记录数: ${validation.summary.migratedCount}`);
      console.log(`  匹配记录数: ${validation.summary.matchingCount}`);
    }

  } catch (error) {
    console.error('\n💥 迁移失败:', error);
    
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
    }

    process.exit(1);
  }
}

/**
 * 格式化文件大小显示
 */
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// 运行主函数
main().catch(error => {
  console.error('💥 程序执行失败:', error);
  process.exit(1);
}); 