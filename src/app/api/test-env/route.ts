import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 [测试API] 检查环境变量...');
  
  const envVars = {
    ALIYUN_OSS_REGION: process.env.ALIYUN_OSS_REGION,
    ALIYUN_OSS_BUCKET: process.env.ALIYUN_OSS_BUCKET,
    ALIYUN_OSS_ACCESS_KEY_ID: process.env.ALIYUN_OSS_ACCESS_KEY_ID,
    ALIYUN_OSS_ACCESS_KEY_SECRET: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET,
    ALIYUN_OSS_CUSTOM_DOMAIN: process.env.ALIYUN_OSS_CUSTOM_DOMAIN,
    ALIYUN_OSS_SECURE: process.env.ALIYUN_OSS_SECURE,
    ALIYUN_OSS_INTERNAL: process.env.ALIYUN_OSS_INTERNAL,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? '已设置' : '未设置'
  };
  
  console.log('📋 [测试API] 环境变量状态:', envVars);
  
  return NextResponse.json({
    success: true,
    data: {
      envVars,
      message: '环境变量检查完成'
    }
  });
}