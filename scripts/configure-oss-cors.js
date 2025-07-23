/**
 * 配置阿里云OSS CORS策略
 * 
 * 解决本地开发环境访问OSS图片的跨域问题
 */

const OSS = require('ali-oss');

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

async function configureOSSCORS() {
  console.log('🌐 开始配置阿里云OSS CORS策略...\n');

  // 检查环境变量
  const requiredVars = [
    'ALIYUN_OSS_REGION',
    'ALIYUN_OSS_ACCESS_KEY_ID',
    'ALIYUN_OSS_ACCESS_KEY_SECRET',
    'ALIYUN_OSS_BUCKET'
  ];

  console.log('📋 检查环境变量:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value && value !== 'your_access_key_id' && value !== 'your_bucket_name') {
      console.log(`  ✅ ${varName}: ${varName.includes('SECRET') ? '***' : value}`);
    } else {
      console.log(`  ❌ ${varName}: 未配置或使用默认值`);
      console.log('请先在 .env.local 文件中配置阿里云OSS环境变量');
      return;
    }
  }

  try {
    // 创建OSS客户端
    const client = new OSS({
      region: process.env.ALIYUN_OSS_REGION,
      bucket: process.env.ALIYUN_OSS_BUCKET,
      accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET,
      secure: process.env.ALIYUN_OSS_SECURE === 'true',
      internal: process.env.ALIYUN_OSS_INTERNAL === 'true'
    });

    console.log('\n🔗 测试OSS连接...');
    
    // 测试连接
    const bucketInfo = await client.getBucketInfo();
    console.log(`  ✅ 存储桶连接成功: ${bucketInfo.bucket.name}`);

    // 定义CORS规则
    const corsRules = [
      {
        allowedOrigins: ['*'], // 允许所有来源（开发环境）
        allowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        allowedHeaders: ['*'],
        exposedHeaders: ['ETag', 'x-oss-request-id'],
        maxAgeSeconds: 3600
      }
    ];

    console.log('\n⚙️ 配置CORS规则...');
    console.log('CORS规则详情:');
    console.log(`  - 允许来源: ${corsRules[0].allowedOrigins.join(', ')}`);
    console.log(`  - 允许方法: ${corsRules[0].allowedMethods.join(', ')}`);
    console.log(`  - 允许头部: ${corsRules[0].allowedHeaders.join(', ')}`);
    console.log(`  - 暴露头部: ${corsRules[0].exposedHeaders.join(', ')}`);
    console.log(`  - 缓存时间: ${corsRules[0].maxAgeSeconds}秒`);

    // 设置CORS规则
    await client.putBucketCORS(corsRules);
    console.log('  ✅ CORS规则配置成功');

    // 验证CORS配置
    console.log('\n🔍 验证CORS配置...');
    const corsConfig = await client.getBucketCORS();
    console.log('  ✅ CORS配置验证成功');
    console.log('  当前CORS规则:');
    corsConfig.rules.forEach((rule, index) => {
      console.log(`    规则 ${index + 1}:`);
      console.log(`      - 允许来源: ${rule.allowedOrigins.join(', ')}`);
      console.log(`      - 允许方法: ${rule.allowedMethods.join(', ')}`);
      console.log(`      - 允许头部: ${rule.allowedHeaders.join(', ')}`);
      console.log(`      - 暴露头部: ${rule.exposedHeaders.join(', ')}`);
      console.log(`      - 缓存时间: ${rule.maxAgeSeconds}秒`);
    });

    console.log('\n🎉 CORS配置完成！');
    console.log('\n📝 注意事项:');
    console.log('1. 当前配置允许所有来源访问（*），适用于开发环境');
    console.log('2. 生产环境建议限制允许的来源域名');
    console.log('3. 如果使用CDN，CDN也会继承OSS的CORS设置');
    console.log('4. 配置生效可能需要几分钟时间');

    // 生产环境建议
    console.log('\n🚀 生产环境建议:');
    console.log('将 allowedOrigins 修改为具体的域名列表:');
    console.log('  allowedOrigins: [');
    console.log('    "https://yourdomain.com",');
    console.log('    "https://www.yourdomain.com",');
    console.log('    "https://api.yourdomain.com"');
    console.log('  ]');

  } catch (error) {
    console.error('❌ CORS配置失败:', error.message);
    
    if (error.code === 'AccessDenied') {
      console.log('\n💡 解决方案:');
      console.log('1. 检查AccessKey是否有OSS管理权限');
      console.log('2. 确保AccessKey有PutBucketCORS权限');
      console.log('3. 检查存储桶权限设置');
    } else if (error.code === 'NoSuchBucket') {
      console.log('\n💡 解决方案:');
      console.log('1. 检查存储桶名称是否正确');
      console.log('2. 确认存储桶是否存在');
      console.log('3. 检查存储桶地域设置');
    }
  }
}

// 运行配置
configureOSSCORS().catch(console.error); 