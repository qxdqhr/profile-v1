/**
 * 配置阿里云 OSS CORS 规则
 * 
 * 使用方法：
 * pnpm tsx scripts/setup-oss-cors.ts
 */

import OSS from 'ali-oss';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function setupCORS() {
  console.log('🚀 开始配置 OSS CORS 规则...\n');

  // 检查必要的环境变量
  const region = process.env.ALIYUN_OSS_REGION;
  const bucket = process.env.ALIYUN_OSS_BUCKET;
  const accessKeyId = process.env.ALIYUN_OSS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_OSS_ACCESS_KEY_SECRET;

  if (!region || !bucket || !accessKeyId || !accessKeySecret) {
    console.error('❌ 缺少必要的 OSS 配置，请检查 .env.local 文件');
    console.error('需要配置：');
    console.error('  - ALIYUN_OSS_REGION');
    console.error('  - ALIYUN_OSS_BUCKET');
    console.error('  - ALIYUN_OSS_ACCESS_KEY_ID');
    console.error('  - ALIYUN_OSS_ACCESS_KEY_SECRET');
    process.exit(1);
  }

  console.log('📋 OSS 配置信息：');
  console.log(`  Region: ${region}`);
  console.log(`  Bucket: ${bucket}\n`);

  try {
    // 创建 OSS 客户端
    const client = new OSS({
      region,
      bucket,
      accessKeyId,
      accessKeySecret,
    });

    // 定义 CORS 规则
    const corsRules = [
      {
        allowedOrigin: ['*'], // 允许所有来源，生产环境建议指定具体域名
        allowedMethod: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
        allowedHeader: ['*'],
        exposeHeader: ['ETag', 'x-oss-request-id'],
        maxAgeSeconds: 600,
      },
      // 如果需要更严格的规则，可以添加：
      // {
      //   allowedOrigin: [
      //     'http://localhost:3001',
      //     'http://localhost:3000',
      //     'https://yourdomain.com',
      //   ],
      //   allowedMethod: ['GET', 'HEAD'],
      //   allowedHeader: ['*'],
      //   exposeHeader: ['ETag'],
      //   maxAgeSeconds: 600,
      // },
    ];

    // 设置 CORS 规则
    console.log('⚙️  正在设置 CORS 规则...');
    await client.putBucketCORS(bucket, corsRules);
    console.log('✅ CORS 规则设置成功！\n');

    // 验证 CORS 规则
    console.log('🔍 验证 CORS 规则...');
    const result = await client.getBucketCORS(bucket);
    console.log('📋 当前 CORS 规则：');
    console.log(JSON.stringify(result.rules, null, 2));
    console.log('\n✅ CORS 配置完成！');
    console.log('\n💡 提示：');
    console.log('  - 现在你可以从任何域名访问 OSS 上的资源');
    console.log('  - 如果需要更严格的安全控制，请修改 allowedOrigin');
    console.log('  - 可以在阿里云 OSS 控制台查看和修改 CORS 规则');

  } catch (error) {
    console.error('❌ 配置 CORS 失败：', error);
    if (error instanceof Error) {
      console.error('错误信息：', error.message);
    }
    process.exit(1);
  }
}

// 运行配置
setupCORS();

