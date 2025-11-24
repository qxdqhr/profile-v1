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
      const isInitialized = provider['isInitialized'];
      const config = provider['config'];
      console.log(`  ${type}:`);
      console.log(`    - 已注册: ✅`);
      console.log(`    - 已初始化: ${isInitialized ? '✅' : '❌'}`);
      if (config) {
        console.log(`    - 配置: ${JSON.stringify({
          enabled: config.enabled,
          type: config.type
        }, null, 2).split('\n').join('\n      ')}`);
      }
    }

    // 检查配置
    console.log('\n⚙️ 文件服务配置:');
    const serviceConfig = fileService['config'];
    console.log(`  默认存储: ${serviceConfig.defaultStorage}`);
    console.log(`  本地存储启用: ${serviceConfig.storageProviders['local']?.enabled ? '✅' : '❌'}`);
    console.log(`  OSS存储启用: ${serviceConfig.storageProviders['aliyun-oss']?.enabled ? '✅' : '❌'}`);

    // 测试降级逻辑
    console.log('\n🔍 测试存储提供者选择逻辑:');
    
    const defaultStorageType = serviceConfig.defaultStorage;
    let storageProvider = storageProviders.get(defaultStorageType);
    
    const isProviderAvailable = (provider: any) => {
      return provider && (!('isInitialized' in provider) || provider['isInitialized'] === true);
    };
    
    console.log(`  1. 尝试使用默认存储 (${defaultStorageType}): ${isProviderAvailable(storageProvider) ? '✅ 可用' : '❌ 不可用'}`);
    
    if (!isProviderAvailable(storageProvider)) {
      storageProvider = storageProviders.get('aliyun-oss');
      console.log(`  2. 尝试使用 OSS: ${isProviderAvailable(storageProvider) ? '✅ 可用' : '❌ 不可用'}`);
      
      if (!isProviderAvailable(storageProvider)) {
        storageProvider = storageProviders.get('local');
        console.log(`  3. 尝试使用本地存储: ${isProviderAvailable(storageProvider) ? '✅ 可用' : '❌ 不可用'}`);
      }
    }
    
    if (isProviderAvailable(storageProvider)) {
      console.log(`\n✅ 最终选择的存储提供者: ${storageProvider['type']}`);
    } else {
      console.log(`\n❌ 没有可用的存储提供者!`);
    }

    console.log('\n✅ 测试完成！');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
  } finally {
    process.exit(0);
  }
}

testFileService().catch(console.error);

