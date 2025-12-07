import { createUniversalFileServiceWithConfigManager } from '@/services/universalFile';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.development') });

async function testFileService() {
  console.log('🧪 测试文件服务初始化...\n');

  try {
    // 创建文件服务
    console.log('📦 创建文件服务实例...');
    const fileService = await createUniversalFileServiceWithConfigManager();
    console.log('✅ 文件服务实例创建成功\n');

    // 检查存储提供者
    console.log('📊 存储提供者状态:');
    const storageProviders = fileService['storageProviders'];
    
    for (const [type, provider] of storageProviders.entries()) {
      const isInitialized =
        typeof provider === 'object' && provider !== null && 'isInitialized' in provider
          ? Boolean((provider as { isInitialized?: boolean }).isInitialized)
          : false;
      const config =
        typeof provider === 'object' && provider !== null && 'config' in provider
          ? (provider as { config?: { enabled?: boolean; type?: string } })['config']
          : undefined;
      console.log(`  ${type}:`);
      console.log(`    - 已注册: ✅`);
      console.log(`    - 已初始化: ${isInitialized ? '✅' : '❌'}`);
      if (config) {
        console.log(
          `    - 配置: ${JSON.stringify(
            {
              enabled: config.enabled ?? '未知',
              type: config.type ?? '未知',
            },
            null,
            2,
          )
            .split('\n')
            .join('\n      ')}`,
        );
      }
    }

    // 检查配置
    console.log('\n⚙️ 文件服务配置:');
    const serviceConfig = fileService['config'];
    console.log(`  默认存储: ${serviceConfig.defaultStorage}`);
    console.log(`  本地存储启用: ${serviceConfig.storageProviders['local']?.enabled ? '✅' : '❌'}`);
    console.log(`  OSS存储启用: ${serviceConfig.storageProviders['aliyun-oss']?.enabled ? '✅' : '❌'}`);

    // 测试存储提供者可用性检查
    console.log('\n🔍 测试存储提供者选择逻辑:');
    
    const defaultStorageType = serviceConfig.defaultStorage;
    const storageProvider = storageProviders.get(defaultStorageType);
    
    console.log(`  默认存储类型: ${defaultStorageType}`);
    
    if (!storageProvider) {
      console.log(`  ❌ 存储提供者不存在`);
    } else {
      const isInitialized =
        typeof storageProvider !== 'object' ||
        storageProvider === null ||
        !('isInitialized' in storageProvider)
          ? true
          : Boolean((storageProvider as { isInitialized?: boolean }).isInitialized);
      console.log(`  ${isInitialized ? '✅' : '❌'} 存储提供者已初始化: ${isInitialized}`);
      
      if (!isInitialized) {
        console.log(`\n⚠️ 如果尝试上传文件，将会抛出错误：`);
        console.log(`   StorageProviderError: 存储提供者未初始化: ${defaultStorageType}`);
        console.log(`   提示：请检查配置或网络连接，确保 ${defaultStorageType} 正常工作。`);
      } else {
        console.log(`\n✅ 存储提供者可用，可以正常上传文件`);
      }
    }

    console.log('\n✅ 测试完成！');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
  } finally {
    process.exit(0);
  }
}

testFileService().catch(console.error);

