import { db } from '../src/db/index';
import { fileStorageProviders } from '../src/services/universalFile/db/schema';

async function checkProductionStorageProviders() {
  try {
    console.log('🔍 检查生产环境存储提供者配置...');
    
    const providers = await db.select().from(fileStorageProviders);
    
    console.log('📋 当前存储提供者列表:');
    providers.forEach(provider => {
      console.log(`  - ID: ${provider.id}, 名称: ${provider.name}, 类型: ${provider.type}, 默认: ${provider.isDefault}`);
    });
    
    // 检查是否有aliyun-oss提供者
    const ossProvider = providers.find(p => p.type === 'aliyun-oss');
    if (ossProvider) {
      console.log('✅ 阿里云OSS存储提供者已存在');
    } else {
      console.log('❌ 阿里云OSS存储提供者不存在，需要添加');
    }
    
    // 检查是否有local-default提供者
    const localProvider = providers.find(p => p.name === 'local-default');
    if (localProvider) {
      console.log('✅ 本地存储提供者已存在');
    } else {
      console.log('❌ 本地存储提供者不存在');
    }
    
  } catch (error) {
    console.error('❌ 检查存储提供者失败:', error);
  } finally {
    process.exit(0);
  }
}

checkProductionStorageProviders(); 