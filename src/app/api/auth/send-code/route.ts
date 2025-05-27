import { NextRequest, NextResponse } from 'next/server';
import { authDbService } from '@/db/services/authDbService';
import type { SendCodeRequest, SendCodeResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const { phone, type = 'login' }: SendCodeRequest = await request.json();
    
    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json<SendCodeResponse>(
        { success: false, message: '请输入正确的手机号' },
        { status: 400 }
      );
    }
    
    // 检查用户是否存在
    const existingUser = await authDbService.findUserByPhone(phone);
    
    if (!existingUser) {
      return NextResponse.json<SendCodeResponse>(
        { success: false, message: '该手机号未注册，请联系管理员' },
        { status: 404 }
      );
    }
    
    // 生成验证码
    const code = authDbService.generateVerificationCode();
    
    // 保存验证码到数据库
    await authDbService.saveVerificationCode(phone, code, type);
    
    // 这里应该调用短信服务发送验证码
    // 为了演示，我们在控制台输出验证码
    console.log(`发送验证码到 ${phone}: ${code}`);
    
    // 在开发环境下，可以返回验证码用于测试
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json<SendCodeResponse>({
      success: true,
      message: '验证码已发送',
      expiresIn: 300, // 5分钟
      ...(isDevelopment && { code }), // 开发环境下返回验证码
    });
    
  } catch (error) {
    console.error('发送验证码失败:', error);
    return NextResponse.json<SendCodeResponse>(
      { success: false, message: '发送验证码失败，请稍后重试' },
      { status: 500 }
    );
  }
} 