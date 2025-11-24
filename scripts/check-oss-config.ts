import { db } from '@/db';
import { configItems } from '@/modules/configManager/db/schema';
import { like, or } from 'drizzle-orm';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.development') });

async function checkOssConfig() {
  console.log('🔍 检查 OSS 配置...');

  try {
    // 查询所有与 OSS 相关的配置
    const ossConfigs = await db
      .select()
      .from(configItems)
      .where(
        or(
          like(configItems.key, '%OSS%'),
          like(configItems.key, '%ALIYUN%')
        )
      );

    console.log('\n📋 数据库中的 OSS 相关配置:');
    
    if (ossConfigs.length === 0) {
      console.log('❌ 数据库中没有找到 OSS 配置！');
      console.log('\n💡 提示：可以使用以下两种方式配置 OSS：');
      console.log('\n方式一：在 .env.development 中添加环境变量');
      console.log('  - ALIYUN_OSS_REGION (例如: oss-cn-beijing)');
      console.log('  - ALIYUN_OSS_BUCKET (例如: your-bucket-name)');
      console.log('  - ALIYUN_OSS_ACCESS_KEY_ID');
      console.log('  - ALIYUN_OSS_ACCESS_KEY_SECRET');
      console.log('  - ALIYUN_OSS_CUSTOM_DOMAIN (可选)');
      console.log('  - ALIYUN_OSS_SECURE (可选, 默认: true)');
      console.log('\n方式二：在数据库中添加配置（通过配置管理模块）');
    } else {
      ossConfigs.forEach(cfg => {
        const displayValue = cfg.isSensitive || cfg.key.includes('SECRET') || cfg.key.includes('KEY')
          ? '***'
          : cfg.value || '(未设置)';
        console.log(`  ${cfg.key}: ${displayValue}`);
      });
    }
    
    // 检查环境变量
    console.log('\n📋 .env.development 中的 OSS 相关环境变量:');
    const envKeys = [
      'ALIYUN_OSS_REGION',
      'ALIYUN_OSS_BUCKET',
      'ALIYUN_OSS_ACCESS_KEY_ID',
      'ALIYUN_OSS_ACCESS_KEY_SECRET',
      'ALIYUN_OSS_CUSTOM_DOMAIN',
      'ALIYUN_OSS_SECURE'
    ];
    
    let hasEnvConfig = false;
    envKeys.forEach(key => {
      const value = process.env[key];
      if (value) {
        hasEnvConfig = true;
        const displayValue = key.includes('SECRET') || key.includes('KEY') ? '***' : value;
        console.log(`  ${key}: ${displayValue}`);
      }
    });
    
    if (!hasEnvConfig) {
      console.log('  ❌ 没有找到 OSS 环境变量');
    }

    console.log('\n✅ 检查完成！');
    
    if (!hasEnvConfig && ossConfigs.length === 0) {
      console.log('\n⚠️ 警告：没有找到任何 OSS 配置，文件上传功能将无法使用！');
    }
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    process.exit(0);
  }
}

checkOssConfig().catch(console.error);

