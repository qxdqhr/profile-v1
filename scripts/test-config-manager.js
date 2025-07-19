 /**
 * 测试ConfigManager配置状态
 */

const path = require('path');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

function testConfigManager() {
  console.log('🧪 测试ConfigManager配置状态...\n');

  // 检查OSS配置
  console.log('📋 阿里云OSS配置检查:');
  const ossConfig = {
    region: process.env.ALIYUN_OSS_REGION,
    bucket: process.env.ALIYUN_OSS_BUCKET,
    accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET,
    customDomain: process.env.ALIYUN_OSS_CUSTOM_DOMAIN,
    secure: process.env.ALIYUN_OSS_SECURE,
    internal: process.env.ALIYUN_OSS_INTERNAL
  };

  const ossRequired = ['region', 'bucket', 'accessKeyId', 'accessKeySecret'];
  let ossComplete = true;

  for (const key of ossRequired) {
    const value = ossConfig[key];
    if (value && value !== 'your_access_key_id' && value !== 'your_bucket_name') {
      console.log(`  ✅ ${key}: ${key.includes('Secret') ? '***' : value}`);
    } else {
      console.log(`  ❌ ${key}: 未配置或使用默认值`);
      ossComplete = false;
    }
  }

  if (ossComplete) {
    console.log('  🎉 OSS配置完整，可以使用阿里云OSS存储');
  } else {
    console.log('  ⚠️ OSS配置不完整，将使用本地存储');
  }

  console.log('\n📋 阿里云CDN配置检查:');
  const cdnConfig = {
    domain: process.env.ALIYUN_CDN_DOMAIN,
    accessKeyId: process.env.ALIYUN_CDN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_CDN_ACCESS_KEY_SECRET,
    region: process.env.ALIYUN_CDN_REGION
  };

  const cdnRequired = ['domain', 'accessKeyId', 'accessKeySecret'];
  let cdnComplete = true;

  for (const key of cdnRequired) {
    const value = cdnConfig[key];
    if (value && value !== 'your_access_key_id') {
      console.log(`  ✅ ${key}: ${key.includes('Secret') ? '***' : value}`);
    } else {
      console.log(`  ❌ ${key}: 未配置`);
      cdnComplete = false;
    }
  }

  if (cdnComplete) {
    console.log('  🎉 CDN配置完整，可以使用阿里云CDN加速');
  } else {
    console.log('  ℹ️ CDN配置不完整，将使用默认存储方式（这是正常的）');
  }

  console.log('\n📊 配置总结:');
  if (ossComplete) {
    console.log('  ✅ 阿里云OSS: 已配置');
  } else {
    console.log('  ❌ 阿里云OSS: 未配置');
  }

  if (cdnComplete) {
    console.log('  ✅ 阿里云CDN: 已配置');
  } else {
    console.log('  ℹ️ 阿里云CDN: 未配置（可选）');
  }

  console.log('\n💡 建议:');
  if (!ossComplete) {
    console.log('  - 配置阿里云OSS以获得更好的文件存储性能');
  }
  if (!cdnComplete) {
    console.log('  - 配置阿里云CDN以获得更快的文件访问速度（可选）');
  }
  if (ossComplete && !cdnComplete) {
    console.log('  - 当前配置已足够使用，CDN是可选的优化项');
  }
  if (ossComplete && cdnComplete) {
    console.log('  - 配置完整，享受最佳性能！');
  }
}

// 运行测试
testConfigManager();