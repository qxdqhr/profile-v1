 /**
 * 测试阿里云OSS配置
 */

const OSS = require('ali-oss');
const path = require('path');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '..', '.env.development') });

async function testOSSConfig() {
  console.log('🧪 开始测试阿里云OSS配置...\n');

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
    
    // 测试获取存储桶信息
    const bucketInfo = await client.getBucketInfo();
    console.log(`  ✅ 存储桶连接成功: ${bucketInfo.bucket.name}`);
    console.log(`  📊 存储桶信息:`);
    console.log(`    - 名称: ${bucketInfo.bucket.name}`);
    console.log(`    - 地域: ${bucketInfo.bucket.region}`);
    console.log(`    - 创建时间: ${bucketInfo.bucket.creationDate}`);
    console.log(`    - 权限: ${bucketInfo.bucket.acl}`);

    // 测试上传小文件
    console.log('\n📤 测试文件上传...');
    const testContent = 'Hello OSS!';
    const testFileName = `test-${Date.now()}.txt`;
    
    const uploadResult = await client.put(testFileName, Buffer.from(testContent));
    console.log(`  ✅ 文件上传成功: ${uploadResult.name}`);
    console.log(`  🔗 访问URL: ${uploadResult.url}`);

    // 测试下载文件
    console.log('\n📥 测试文件下载...');
    const downloadResult = await client.get(testFileName);
    const downloadedContent = downloadResult.content.toString();
    console.log(`  ✅ 文件下载成功: ${downloadedContent}`);

    // 测试删除文件
    console.log('\n🗑️ 测试文件删除...');
    await client.delete(testFileName);
    console.log(`  ✅ 文件删除成功: ${testFileName}`);

    console.log('\n🎉 OSS配置测试完成！所有功能正常。');

  } catch (error) {
    console.error('\n❌ OSS配置测试失败:', error.message);
    
    if (error.code === 'AccessDenied') {
      console.log('\n💡 可能的解决方案:');
      console.log('  1. 检查AccessKey ID和Secret是否正确');
      console.log('  2. 确认RAM用户有OSS访问权限');
      console.log('  3. 检查存储桶名称是否正确');
    } else if (error.code === 'NoSuchBucket') {
      console.log('\n💡 可能的解决方案:');
      console.log('  1. 检查存储桶名称是否正确');
      console.log('  2. 确认存储桶已创建');
      console.log('  3. 检查地域配置是否正确');
    } else if (error.code === 'NetworkingError') {
      console.log('\n💡 可能的解决方案:');
      console.log('  1. 检查网络连接');
      console.log('  2. 确认防火墙设置');
      console.log('  3. 检查代理配置');
    }
  }
}

// 运行测试
testOSSConfig().catch(console.error);